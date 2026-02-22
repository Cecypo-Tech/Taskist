import frappe
from frappe.model.document import Document
from frappe.utils import time_diff_in_seconds


class TaskistTimeEntry(Document):
	def before_save(self):
		if self.start_time and self.end_time:
			self.duration_seconds = int(time_diff_in_seconds(self.end_time, self.start_time))
