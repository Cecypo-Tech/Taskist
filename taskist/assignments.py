import re
from html import escape
from urllib.parse import quote

import frappe
from frappe.utils import nowdate


def _strip_html(value):
	return re.sub(r"<[^>]+>", "", value or "").strip()


def _task_subject(todo):
	description = _strip_html(todo.description)
	if description:
		return description[:140]
	return f"{todo.reference_type}: {todo.reference_name}"


def _find_task_for_todo(todo):
	if getattr(todo, "taskist_task", None):
		if frappe.db.exists("Task", todo.taskist_task):
			return todo.taskist_task

	tasks = frappe.get_all(
		"Task",
		filters={
			"taskist_reference_doctype": todo.reference_type,
			"taskist_reference_name": todo.reference_name,
			"taskist_reference_todo": todo.name,
			"is_template": 0,
		},
		pluck="name",
		limit_page_length=1,
	)
	return tasks[0] if tasks else None


def sync_todo_assignment(doc, method=None):
	"""Create/update a Taskist task when a user is assigned to any non-Task document."""
	if getattr(frappe.flags, "in_taskist_assignment_sync", False):
		return
	if not doc.reference_type or not doc.reference_name or not doc.allocated_to:
		return
	if doc.reference_type == "Task":
		return

	frappe.flags.in_taskist_assignment_sync = True
	try:
		task_name = _find_task_for_todo(doc)
		status_map = {
			"Closed": "Completed",
			"Cancelled": "Cancelled",
		}
		status = status_map.get(doc.status, "Open")

		if task_name:
			task = frappe.get_doc("Task", task_name)
		else:
			task = frappe.new_doc("Task")
			task.status = status
			task.exp_start_date = nowdate()

		task.subject = _task_subject(doc)
		task.status = status
		task.description = (
			f"Taskist assignment from {escape(doc.reference_type)} "
			f"<a href=\"/app/{frappe.scrub(doc.reference_type).replace('_', '-')}/{quote(doc.reference_name, safe='')}\">"
			f"{escape(doc.reference_name)}</a>"
		)
		task.taskist_reference_doctype = doc.reference_type
		task.taskist_reference_name = doc.reference_name
		task.taskist_reference_todo = doc.name
		task.save(ignore_permissions=True)
		try:
			from taskist.sla import evaluate_task_against_sla_rules

			evaluate_task_against_sla_rules(task)
		except Exception:
			frappe.log_error(frappe.get_traceback(), "Taskist SLA Assignment Sync")

		if not task_name:
			from frappe.desk.form.assign_to import add as assign_add

			assign_add({
				"doctype": "Task",
				"name": task.name,
				"assign_to": [doc.allocated_to],
				"description": task.subject,
			})
			try:
				from taskist.push import send_push_to_user

				send_push_to_user(
					doc.allocated_to,
					"New Taskist assignment",
					task.subject,
					f"/taskist?task={task.name}",
					data={"task": task.name, "source_doctype": doc.reference_type, "source_name": doc.reference_name},
					tag=f"taskist-assignment-{task.name}",
				)
			except Exception:
				frappe.log_error(frappe.get_traceback(), "Taskist Assignment Push")
	except Exception:
		frappe.log_error(frappe.get_traceback(), "Taskist Assignment Sync")
	finally:
		frappe.flags.in_taskist_assignment_sync = False


def close_source_todo_for_task(task):
	if not getattr(task, "taskist_reference_todo", None):
		return
	if not frappe.db.exists("ToDo", task.taskist_reference_todo):
		return

	todo = frappe.get_doc("ToDo", task.taskist_reference_todo)
	if todo.status != "Closed":
		todo.status = "Closed"
		todo.save(ignore_permissions=True)
