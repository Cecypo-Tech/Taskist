import { ref, watch, onMounted } from 'vue'

const isDark = ref(false)

export function useDarkMode() {
	function toggle() {
		isDark.value = !isDark.value
		apply()
		localStorage.setItem('taskist-dark-mode', isDark.value ? '1' : '0')
	}

	function apply() {
		if (isDark.value) {
			document.documentElement.classList.add('dark')
		} else {
			document.documentElement.classList.remove('dark')
		}
	}

	function init() {
		const stored = localStorage.getItem('taskist-dark-mode')
		if (stored !== null) {
			isDark.value = stored === '1'
		} else {
			isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
		}
		apply()
	}

	onMounted(init)

	return { isDark, toggle }
}
