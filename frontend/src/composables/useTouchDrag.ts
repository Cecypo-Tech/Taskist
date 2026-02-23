import { onMounted, onUnmounted, type Ref } from 'vue'

export interface TouchDragOptions {
	draggableSelector: string
	dropTargetSelector: string
	onDrop: (dragData: string, targetEl: HTMLElement) => void
	longPressMs?: number
}

export function useTouchDrag(containerRef: Ref<HTMLElement | null>, options: TouchDragOptions) {
	const longPressMs = options.longPressMs ?? 150
	let timer: ReturnType<typeof setTimeout> | null = null
	let ghost: HTMLElement | null = null
	let originX = 0
	let originY = 0
	let dragData = ''
	let dragging = false
	let currentTarget: HTMLElement | null = null

	function onTouchStart(e: TouchEvent) {
		const el = (e.target as HTMLElement).closest(options.draggableSelector) as HTMLElement | null
		if (!el) return

		const touch = e.touches[0]
		originX = touch.clientX
		originY = touch.clientY
		dragData = el.dataset.dragValue || ''
		dragging = false

		timer = setTimeout(() => {
			dragging = true
			e.preventDefault()

			ghost = el.cloneNode(true) as HTMLElement
			ghost.style.position = 'fixed'
			ghost.style.left = `${originX - 30}px`
			ghost.style.top = `${originY - 15}px`
			ghost.style.width = `${el.offsetWidth}px`
			ghost.style.opacity = '0.8'
			ghost.style.pointerEvents = 'none'
			ghost.style.zIndex = '9999'
			ghost.style.transform = 'rotate(2deg) scale(1.02)'
			ghost.style.transition = 'none'
			document.body.appendChild(ghost)
		}, longPressMs)
	}

	function onTouchMove(e: TouchEvent) {
		const touch = e.touches[0]

		if (!dragging && timer) {
			const dx = Math.abs(touch.clientX - originX)
			const dy = Math.abs(touch.clientY - originY)
			if (dx > 10 || dy > 10) {
				clearTimeout(timer)
				timer = null
			}
			return
		}

		if (!dragging || !ghost) return
		e.preventDefault()

		ghost.style.left = `${touch.clientX - 30}px`
		ghost.style.top = `${touch.clientY - 15}px`

		// Hide ghost briefly to see element underneath
		ghost.style.display = 'none'
		const underEl = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement | null
		ghost.style.display = ''

		const newTarget = underEl?.closest(options.dropTargetSelector) as HTMLElement | null

		if (newTarget !== currentTarget) {
			if (currentTarget) currentTarget.classList.remove('touch-drag-over')
			if (newTarget) newTarget.classList.add('touch-drag-over')
			currentTarget = newTarget
		}
	}

	function onTouchEnd(_e: TouchEvent) {
		if (timer) {
			clearTimeout(timer)
			timer = null
		}

		if (dragging && currentTarget) {
			options.onDrop(dragData, currentTarget)
		}

		cleanup()
	}

	function cleanup() {
		dragging = false
		dragData = ''
		if (ghost) {
			ghost.remove()
			ghost = null
		}
		if (currentTarget) {
			currentTarget.classList.remove('touch-drag-over')
			currentTarget = null
		}
	}

	onMounted(() => {
		const el = containerRef.value
		if (!el) return
		el.addEventListener('touchstart', onTouchStart, { passive: false })
		el.addEventListener('touchmove', onTouchMove, { passive: false })
		el.addEventListener('touchend', onTouchEnd)
	})

	onUnmounted(() => {
		const el = containerRef.value
		if (!el) return
		el.removeEventListener('touchstart', onTouchStart)
		el.removeEventListener('touchmove', onTouchMove)
		el.removeEventListener('touchend', onTouchEnd)
		cleanup()
	})
}
