import json

import frappe
from frappe.utils import add_to_date, get_datetime, now_datetime


OPEN_TASK_STATUSES = ["Open", "Working", "Pending Review", "Overdue"]
DONE_TASK_STATUSES = ["Completed", "Cancelled"]


def _loads_filters(value):
	if not value:
		return {}
	if isinstance(value, (dict, list)):
		return value
	return json.loads(value)


def _task_user(task):
	if not task.get("_assign"):
		return None
	try:
		assignees = json.loads(task._assign)
	except (json.JSONDecodeError, TypeError):
		return None
	return assignees[0] if assignees else None


def _tracker_name(rule_name, task_name):
	return f"{rule_name}-{task_name}"[:140]


def _send_push(user, title, body, task_name, tag):
	if not user:
		return
	try:
		from taskist.push import send_push_to_user

		send_push_to_user(
			user,
			title,
			body,
			f"/taskist?task={task_name}",
			data={"task": task_name},
			tag=tag,
		)
	except Exception:
		frappe.log_error(frappe.get_traceback(), "Taskist SLA Push")


def ensure_tracker(rule, task):
	tracker_name = _tracker_name(rule.name, task.name)
	if frappe.db.exists("Taskist SLA Tracker", tracker_name):
		tracker = frappe.get_doc("Taskist SLA Tracker", tracker_name)
	else:
		tracker = frappe.new_doc("Taskist SLA Tracker")
		tracker.name = tracker_name
		tracker.rule = rule.name
		tracker.task = task.name
		tracker.reference_doctype = task.taskist_reference_doctype
		tracker.reference_name = task.taskist_reference_name

	start_time = get_datetime(task.creation)
	target_minutes = int(rule.target_minutes or 0)
	warning_minutes = int(rule.warning_minutes_before_due or 0)
	due_at = add_to_date(start_time, minutes=target_minutes, as_datetime=True)
	warning_at = add_to_date(due_at, minutes=-warning_minutes, as_datetime=True) if warning_minutes else None

	tracker.user = _task_user(task)
	tracker.start_time = start_time
	tracker.due_at = due_at
	tracker.warning_at = warning_at
	tracker.status = "Completed" if task.status in DONE_TASK_STATUSES else getattr(tracker, "status", None) or "Open"
	tracker.save(ignore_permissions=True)
	return tracker


def complete_trackers_for_task(task):
	trackers = frappe.get_all(
		"Taskist SLA Tracker",
		filters={"task": task.name, "status": ["not in", ["Completed", "Cancelled"]]},
		pluck="name",
		limit_page_length=100,
	)
	for name in trackers:
		tracker = frappe.get_doc("Taskist SLA Tracker", name)
		tracker.status = "Completed" if task.status == "Completed" else "Cancelled"
		tracker.completed_on = now_datetime()
		tracker.save(ignore_permissions=True)


def evaluate_task_against_sla_rules(task):
	if not task.get("taskist_reference_doctype") or not task.get("taskist_reference_name"):
		return

	rules = frappe.get_all(
		"Taskist SLA Rule",
		filters={"enabled": 1, "reference_doctype": task.taskist_reference_doctype},
		fields=["name", "reference_doctype", "conditions_json", "target_minutes", "warning_minutes_before_due"],
		limit_page_length=100,
	)
	for rule_data in rules:
		rule = frappe.get_doc("Taskist SLA Rule", rule_data.name)
		try:
			filters = _loads_filters(rule.conditions_json)
		except Exception:
			frappe.log_error(f"Invalid SLA filters on {rule.name}", "Taskist SLA")
			continue

		if filters:
			filters = list(filters) if isinstance(filters, list) else dict(filters)
			if isinstance(filters, dict):
				filters["name"] = task.taskist_reference_name
			else:
				filters.append(["name", "=", task.taskist_reference_name])
			matches = frappe.get_all(rule.reference_doctype, filters=filters, pluck="name", limit_page_length=1)
			if not matches:
				continue

		ensure_tracker(rule, task)


def evaluate_sla_rules():
	"""Scheduler job: create/update SLA trackers and send warning/breach notifications."""
	enabled_rules = frappe.get_all(
		"Taskist SLA Rule",
		filters={"enabled": 1},
		fields=["name", "reference_doctype", "conditions_json"],
		limit_page_length=100,
	)

	for rule_data in enabled_rules:
		try:
			filters = _loads_filters(rule_data.conditions_json)
		except Exception:
			frappe.log_error(f"Invalid SLA filters on {rule_data.name}", "Taskist SLA")
			continue

		source_names = frappe.get_all(
			rule_data.reference_doctype,
			filters=filters,
			pluck="name",
			limit_page_length=500,
		)
		if not source_names:
			continue

		tasks = frappe.get_all(
			"Task",
			filters={
				"taskist_reference_doctype": rule_data.reference_doctype,
				"taskist_reference_name": ["in", source_names],
				"is_template": 0,
			},
			fields=["name", "status", "creation", "_assign", "taskist_reference_doctype", "taskist_reference_name"],
			limit_page_length=500,
		)
		rule = frappe.get_doc("Taskist SLA Rule", rule_data.name)
		for task in tasks:
			if task.status in DONE_TASK_STATUSES:
				complete_trackers_for_task(task)
			else:
				ensure_tracker(rule, task)

	evaluate_open_trackers()


def evaluate_open_trackers():
	now = now_datetime()
	trackers = frappe.get_all(
		"Taskist SLA Tracker",
		filters={"status": ["in", ["Open", "Warning", "Breached"]]},
		fields=[
			"name", "rule", "task", "user", "due_at", "warning_at", "status",
			"warning_sent_on", "breach_sent_on",
		],
		limit_page_length=500,
	)

	for row in trackers:
		rule = frappe.get_doc("Taskist SLA Rule", row.rule)
		tracker = frappe.get_doc("Taskist SLA Tracker", row.name)

		if row.due_at and get_datetime(row.due_at) <= now:
			if tracker.status != "Breached":
				tracker.status = "Breached"
				tracker.breached_on = now
			if rule.notify_on_breach and not tracker.breach_sent_on:
				_send_push(
					row.user,
					"SLA breached",
					f"{row.task} has passed its SLA target.",
					row.task,
					f"taskist-sla-breach-{row.name}",
				)
				tracker.breach_sent_on = now
			tracker.save(ignore_permissions=True)
			continue

		if row.warning_at and get_datetime(row.warning_at) <= now:
			if tracker.status == "Open":
				tracker.status = "Warning"
			if rule.notify_on_warning and not tracker.warning_sent_on:
				_send_push(
					row.user,
					"SLA warning",
					f"{row.task} is approaching its SLA target.",
					row.task,
					f"taskist-sla-warning-{row.name}",
				)
				tracker.warning_sent_on = now
			tracker.save(ignore_permissions=True)
