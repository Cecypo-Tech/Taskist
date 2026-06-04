# Smart Taskist Roadmap

Taskist can become an activity layer over ERPNext documents, not only a Project Task UI.

## Source-Linked Tasks

Taskist should use ERPNext `Task` as the single work item, whether or not it belongs to a Project.

- Source document: any DocType, such as Purchase Order, Sales Order, Issue, Lead, Payment Entry, or Issue.
- Assigned user: the user responsible for the next action, copied from the source document assignment.
- Task state: Open, Working, Pending Review, Completed, Cancelled.
- Deep link: every source-linked Task opens the originating document.
- Project remains optional.

## Document Assignment Automation

When a supported document is assigned through Frappe assignment, Taskist should create or update a normal ERPNext Task.

Suggested first slice:

- Listen to `ToDo` creation/update events where `reference_type` and `reference_name` point to a business document.
- Create a source-linked Task for the assigned user.
- Mark the Task complete when the related `ToDo` is closed.
- Let users complete the Task from Taskist, then close/update the linked `ToDo`.

## SLA Engine

Create a `Taskist SLA Rule` DocType that defines how long a document or activity should take.

Recommended fields:

- Rule name and enabled flag.
- Reference DocType.
- Conditions JSON, using Frappe filter syntax.
- Start event: document creation, assignment, status change, submitted, or custom field transition.
- Stop event: completed activity, document status, workflow state, submitted/cancelled, or custom field transition.
- Duration target in minutes/hours/days.
- Business calendar, holiday list, and working hours.
- Escalation recipients and notification channels.

Runtime records should be stored separately in `Taskist SLA Tracker`, one per matched document or source-linked Task.

Initial implementation:

- SLA rules target a source DocType.
- Conditions are stored as optional JSON filters.
- Source-linked Tasks get a tracker when they match an enabled rule.
- Trackers compute start time, warning time, and due time.
- The hourly scheduler evaluates open trackers.
- Warning and breach events can send push notifications.

## Notifications

Push notifications should be one delivery channel beside email and in-app realtime updates.

Useful notification events:

- New assignment.
- SLA warning threshold reached.
- SLA breached.
- Activity completed.
- Activity sent back for review.
- Comment or attachment added on an assigned activity.

The initial push implementation stores browser subscriptions and exposes a reusable backend sender. SLA and activity events can call `taskist.push.send_push_to_user`.
