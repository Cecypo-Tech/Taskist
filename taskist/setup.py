import frappe


def after_install():
	"""Create Taskist User role if it doesn't exist."""
	if not frappe.db.exists("Role", "Taskist User"):
		role = frappe.new_doc("Role")
		role.role_name = "Taskist User"
		role.desk_access = 1
		role.is_custom = 1
		role.insert(ignore_permissions=True)
		frappe.db.commit()
