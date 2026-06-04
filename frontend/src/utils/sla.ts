export function slaTheme(status?: string | null) {
	if (status === 'Breached') return 'red'
	if (status === 'Warning') return 'yellow'
	if (status === 'Completed') return 'green'
	if (status === 'Cancelled') return 'gray'
	return 'blue'
}

export function slaLabel(status?: string | null) {
	if (!status) return ''
	return `SLA ${status}`
}
