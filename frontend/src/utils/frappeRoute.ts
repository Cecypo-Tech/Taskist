export function doctypeRoute(doctype: string) {
	return doctype.trim().toLowerCase().replace(/\s+/g, '-')
}

export function documentUrl(doctype?: string | null, name?: string | null) {
	if (!doctype || !name) return ''
	return `/app/${doctypeRoute(doctype)}/${encodeURIComponent(name)}`
}
