import os

import frappe
from werkzeug.wrappers import Response


@frappe.whitelist(allow_guest=True)
def service_worker():
	"""Serve the PWA service worker with Service-Worker-Allowed header.

	Browsers restrict a service worker's scope to the directory of its script URL.
	Since static assets are served from /assets/taskist/frontend/, the SW there
	cannot control /taskist. This endpoint serves the same SW file with the
	Service-Worker-Allowed header so it can be registered with scope=/taskist.
	"""
	sw_path = os.path.join(os.path.dirname(__file__), "public", "frontend", "sw.js")
	with open(sw_path) as f:
		content = f.read()

	response = Response(content, mimetype="application/javascript")
	response.headers["Service-Worker-Allowed"] = "/taskist"
	response.headers["Cache-Control"] = "no-cache"
	return response
