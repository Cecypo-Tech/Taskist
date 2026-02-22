import { onMounted, onUnmounted } from 'vue'

export interface ShortcutDef {
	key: string
	label: string
	description: string
	handler: () => void
	ctrl?: boolean
	shift?: boolean
}

const registeredShortcuts: ShortcutDef[] = []

export function getShortcuts() {
	return registeredShortcuts
}

export function useKeyboardShortcuts(shortcuts: ShortcutDef[]) {
	function handleKeydown(e: KeyboardEvent) {
		// Don't trigger when typing in inputs/textareas
		const target = e.target as HTMLElement
		if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable) {
			// Only allow Escape in inputs
			if (e.key !== 'Escape') return
		}

		for (const shortcut of shortcuts) {
			if (e.key.toLowerCase() === shortcut.key.toLowerCase()) {
				if (shortcut.ctrl && !e.ctrlKey && !e.metaKey) continue
				if (shortcut.shift && !e.shiftKey) continue
				if (!shortcut.ctrl && (e.ctrlKey || e.metaKey)) continue
				if (!shortcut.shift && e.shiftKey) continue

				e.preventDefault()
				shortcut.handler()
				return
			}
		}
	}

	onMounted(() => {
		// Register shortcuts
		for (const s of shortcuts) {
			if (!registeredShortcuts.find(r => r.key === s.key && r.ctrl === s.ctrl && r.shift === s.shift)) {
				registeredShortcuts.push(s)
			}
		}
		document.addEventListener('keydown', handleKeydown)
	})

	onUnmounted(() => {
		document.removeEventListener('keydown', handleKeydown)
	})
}
