<template>
	<div ref="calendarRef" class="h-full p-2 md:p-6">
		<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col overflow-hidden">
			<!-- Header -->
			<div class="flex items-center justify-between px-3 md:px-6 py-3 md:py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
				<div class="flex items-center gap-3">
					<button @click="prevMonth" class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
						<svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
					</button>
					<h2 class="text-sm md:text-lg font-semibold text-gray-900 dark:text-gray-100">{{ currentMonth.format('MMMM YYYY') }}</h2>
					<button @click="nextMonth" class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
						<svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
					</button>
				</div>
				<button @click="goToToday" class="btn-secondary text-xs">Today</button>
			</div>

			<!-- Body: Month + Day panel side by side -->
			<div class="flex-1 flex overflow-hidden min-h-0">
				<!-- MONTH GRID (left, takes remaining space) -->
				<div class="flex-1 flex flex-col overflow-hidden min-w-0">
					<div class="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
						<div v-for="day in ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']" :key="day" class="px-1 md:px-3 py-2 text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 text-center">
							<span class="hidden sm:inline">{{ day }}</span>
							<span class="sm:hidden">{{ day.charAt(0) }}</span>
						</div>
					</div>
					<div class="flex-1 grid grid-cols-7 auto-rows-fr overflow-hidden">
						<div
							v-for="(day, index) in calendarDays"
							:key="index"
							class="group border-b border-r border-gray-100 dark:border-gray-700 p-0.5 md:p-1 min-h-0 overflow-hidden relative cursor-pointer"
							:class="{
								'bg-gray-50 dark:bg-gray-900/30': !day.isCurrentMonth,
								'bg-blue-50 dark:bg-blue-900/20': day.isToday,
								'ring-2 ring-inset ring-blue-400 dark:ring-blue-500': day.isSelected,
							}"
							@click="selectDay(day.date.format('YYYY-MM-DD'))"
						>
							<div class="flex items-center justify-between px-1 mb-0.5">
								<span
									class="text-xs font-medium cursor-pointer hover:underline select-none"
									:class="day.isToday ? 'text-blue-600' : day.isCurrentMonth ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'"
									@click="selectDay(day.date.format('YYYY-MM-DD'))"
								>
									{{ day.date.date() }}
								</span>
								<button
									@click.stop="createTaskForDate(day.date.format('YYYY-MM-DD'))"
									class="w-4 h-4 flex items-center justify-center rounded text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 opacity-0 group-hover:opacity-100 transition-opacity"
									title="Add task for this date"
								>
									<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
								</button>
							</div>
							<div class="space-y-0.5">
								<div
									v-for="slot in day.slots"
									:key="slot.task ? slot.task.name : 'empty-' + slot.index"
								>
									<div v-if="!slot.task" class="h-5"></div>
									<div
										v-else
										class="text-xs px-1.5 py-0.5 truncate cursor-pointer hover:opacity-80 h-5 leading-4"
										:class="[
											taskBarClass(slot.task, slot.isStart, slot.isEnd),
											slot.task.status === 'Completed' ? 'bg-gray-100 text-gray-400 dark:bg-gray-700/50 dark:text-gray-500 line-through' : priorityBg(slot.task.priority),
										]"
										draggable="true"
										@dragstart="onDragStartMonth($event, slot.task)"
										@click.stop="taskStore.selectTask(slot.task)"
										:title="slot.task.subject"
										data-draggable
										:data-drag-value="slot.task.name"
									>
										<span v-if="slot.isStart">{{ slot.task.subject }}</span>
									</div>
								</div>
								<div
									v-for="task in day.singleTasks"
									:key="task.name"
									class="text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80 h-5 leading-4"
									:class="task.status === 'Completed' ? 'bg-gray-100 text-gray-400 dark:bg-gray-700/50 dark:text-gray-500 line-through' : priorityBg(task.priority)"
									draggable="true"
									@dragstart="onDragStartMonth($event, task)"
									@click.stop="taskStore.selectTask(task)"
									data-draggable
									:data-drag-value="task.name"
								>{{ task.subject }}</div>
								<div v-if="day.overflow > 0" class="text-xs text-gray-400 dark:text-gray-500 px-1">+{{ day.overflow }} more</div>
							</div>
						</div>
					</div>
				</div>

				<!-- DAY PANEL (right sidebar, collapsible on mobile) -->
				<div
					class="flex-shrink-0 border-l border-gray-200 dark:border-gray-700 flex overflow-hidden bg-gray-50/50 dark:bg-gray-900/20 transition-all duration-200"
					:class="dayPanelOpen ? 'w-64 md:w-72 lg:w-80' : 'w-8'"
				>
					<!-- Collapsed strip (mobile toggle) -->
					<div v-if="!dayPanelOpen" class="w-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50" @click="dayPanelOpen = true">
						<svg class="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
						<span class="text-[9px] text-gray-400 dark:text-gray-500 writing-mode-vertical mt-1" style="writing-mode: vertical-rl;">{{ selectedDate.format('MMM D') }}</span>
					</div>

					<!-- Full panel content -->
					<div v-if="dayPanelOpen" class="flex-1 flex flex-col overflow-hidden min-w-0">
						<!-- Day panel header -->
						<div class="px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
							<div class="flex items-center gap-1.5">
								<button @click="dayPanelOpen = false" class="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 md:hidden">
									<svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
								</button>
								<button @click="prevDay" class="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
									<svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
								</button>
								<span class="text-xs font-semibold text-gray-800 dark:text-gray-200">{{ selectedDate.format('ddd, MMM D') }}</span>
								<button @click="nextDay" class="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
									<svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
								</button>
							</div>
							<button @click="goToDayToday" class="text-[10px] px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">Today</button>
						</div>

						<!-- All-day tasks -->
						<div v-if="allDayTasks.length" class="px-2 py-1.5 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
							<div class="text-[9px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">All day</div>
							<div class="space-y-0.5">
								<div
									v-for="task in allDayTasks"
									:key="task.name"
									class="text-[11px] px-1.5 py-0.5 rounded cursor-pointer hover:opacity-80 truncate"
									:class="task.status === 'Completed' ? 'bg-gray-100 text-gray-400 dark:bg-gray-700/50 dark:text-gray-500 line-through' : priorityBg(task.priority)"
									draggable="true"
									@dragstart="onDragStart($event, task)"
									@click="taskStore.selectTask(task)"
									:title="task.subject"
									data-draggable
									:data-drag-value="task.name"
								>{{ task.subject }}</div>
							</div>
						</div>

						<!-- Hourly grid -->
						<div class="flex-1 overflow-y-auto" ref="dayScrollContainer">
							<div class="relative" style="height: 1440px;">
								<!-- Hour rows -->
								<div
									v-for="hour in 24"
									:key="hour - 1"
									class="flex border-b border-gray-100 dark:border-gray-700/50 h-[60px] group/hour"
									@click="createTaskForHour(hour - 1)"
									@dragover.prevent="onDragOver($event, hour - 1)"
									@drop.prevent="onDropHour($event, hour - 1)"
									data-drop-target
									:data-drop-hour="hour - 1"
								>
									<div class="w-10 flex-shrink-0 text-[9px] text-gray-400 dark:text-gray-500 text-right pr-1 pt-0.5 select-none">
										{{ formatHourShort(hour - 1) }}
									</div>
									<div class="flex-1 relative border-l border-gray-100 dark:border-gray-700/50">
										<div class="absolute inset-0 opacity-0 group-hover/hour:opacity-100 bg-blue-50 dark:bg-blue-900/10 transition-opacity pointer-events-none"></div>
										<button
											class="absolute right-1 top-0.5 w-4 h-4 flex items-center justify-center rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/30 opacity-0 group-hover/hour:opacity-100 transition-opacity z-10"
											@click.stop="createTaskForHour(hour - 1)"
											title="Add task at this time"
										>
											<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
										</button>
									</div>
								</div>

								<!-- Positioned task blocks -->
								<div
									v-for="block in hourlyTaskBlocks"
									:key="block.task.name"
									class="absolute left-10 right-1 rounded px-1.5 py-0.5 cursor-pointer overflow-hidden text-[11px] z-10 border border-white/50 dark:border-gray-600/50 hover:ring-2 hover:ring-blue-400"
									:class="block.task.status === 'Completed' ? 'bg-gray-200 text-gray-400 dark:bg-gray-700/50 dark:text-gray-500 line-through' : priorityBg(block.task.priority)"
									:style="{ top: block.top + 'px', height: block.height + 'px' }"
									:title="block.task.subject"
									draggable="true"
									@dragstart="onDragStart($event, block.task)"
									@click.stop="taskStore.selectTask(block.task)"
									data-draggable
									:data-drag-value="block.task.name"
								>
									<div class="font-medium truncate leading-tight">{{ block.task.subject }}</div>
									<div v-if="block.height >= 36" class="text-[9px] opacity-70">
										{{ block.startTime }} – {{ block.endTime }}
									</div>
								</div>

								<!-- Current time indicator -->
								<div
									v-if="selectedDate.isSame(dayjs(), 'day')"
									class="absolute left-0 right-0 z-20 pointer-events-none"
									:style="{ top: currentTimeTop + 'px' }"
								>
									<div class="flex items-center">
										<div class="w-10 flex justify-end pr-0.5">
											<div class="w-1.5 h-1.5 rounded-full bg-red-500"></div>
										</div>
										<div class="flex-1 h-px bg-red-500"></div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { useTaskStore, type Task } from '@/stores/taskStore'
import { call } from '@/data/api'
import dayjs, { type Dayjs } from 'dayjs'
import { useTouchDrag } from '@/composables/useTouchDrag'

const taskStore = useTaskStore()
const currentMonth = ref(dayjs().startOf('month'))
const selectedDate = ref(dayjs())
const dayScrollContainer = ref<HTMLElement | null>(null)
const calendarRef = ref<HTMLElement | null>(null)
const draggedTask = ref<Task | null>(null)
const dayPanelOpen = ref(typeof window !== 'undefined' ? window.innerWidth >= 768 : true)

useTouchDrag(calendarRef, {
	draggableSelector: '[data-draggable]',
	dropTargetSelector: '[data-drop-target]',
	onDrop(taskName, targetEl) {
		const targetHour = parseInt(targetEl.dataset.dropHour || '0', 10)
		const task = taskStore.tasks.find(t => t.name === taskName)
		if (!task) return
		// Expand day panel if collapsed so user sees the result
		if (!dayPanelOpen.value) dayPanelOpen.value = true
		handleDropToHour(task, targetHour)
	},
})

const MAX_VISIBLE = 4

interface DaySlot {
	task: Task | null
	isStart: boolean
	isEnd: boolean
	index: number
}

interface CalendarDay {
	date: Dayjs
	isCurrentMonth: boolean
	isToday: boolean
	isSelected: boolean
	slots: DaySlot[]
	singleTasks: Task[]
	overflow: number
}

// ─── Month view computed ───

const calendarDays = computed(() => {
	const start = currentMonth.value.startOf('week')
	const end = currentMonth.value.endOf('month').endOf('week')
	const tasks = taskStore.filteredTasks
	const selDateStr = selectedDate.value.format('YYYY-MM-DD')

	const spanningTasks: Array<{ task: Task; start: string; end: string }> = []
	const singleDayMap: Record<string, Task[]> = {}

	for (const task of tasks) {
		const startDate = task.exp_start_date ? task.exp_start_date.substring(0, 10) : null
		const endDate = task.exp_end_date ? task.exp_end_date.substring(0, 10) : null

		if (startDate && endDate && startDate !== endDate) {
			spanningTasks.push({ task, start: startDate, end: endDate })
		} else {
			const dateStr = endDate || startDate || (task.creation ? task.creation.substring(0, 10) : '')
			if (dateStr) {
				if (!singleDayMap[dateStr]) singleDayMap[dateStr] = []
				singleDayMap[dateStr].push(task)
			}
		}
	}

	spanningTasks.sort((a, b) => {
		if (a.start !== b.start) return a.start < b.start ? -1 : 1
		const durA = dayjs(a.end).diff(dayjs(a.start), 'day')
		const durB = dayjs(b.end).diff(dayjs(b.start), 'day')
		return durB - durA
	})

	const slotAssignments: Array<{ task: Task; start: string; end: string; slot: number }> = []
	const slotEndDates: string[] = []

	for (const st of spanningTasks) {
		let assignedSlot = -1
		for (let i = 0; i < slotEndDates.length; i++) {
			if (slotEndDates[i] < st.start) {
				assignedSlot = i
				slotEndDates[i] = st.end
				break
			}
		}
		if (assignedSlot === -1) {
			assignedSlot = slotEndDates.length
			slotEndDates.push(st.end)
		}
		slotAssignments.push({ task: st.task, start: st.start, end: st.end, slot: assignedSlot })
	}

	const totalSlotRows = slotEndDates.length

	const days: CalendarDay[] = []
	let current = start
	while (current.isBefore(end) || current.isSame(end, 'day')) {
		const dateStr = current.format('YYYY-MM-DD')

		const slots: DaySlot[] = []
		for (let i = 0; i < totalSlotRows; i++) {
			const assignment = slotAssignments.find(
				a => a.slot === i && dateStr >= a.start && dateStr <= a.end
			)
			if (assignment) {
				slots.push({
					task: assignment.task,
					isStart: dateStr === assignment.start,
					isEnd: dateStr === assignment.end,
					index: i,
				})
			} else {
				slots.push({ task: null, isStart: false, isEnd: false, index: i })
			}
		}

		const daysSingleTasks = singleDayMap[dateStr] || []
		const totalItems = slots.filter(s => s.task).length + daysSingleTasks.length
		const visibleSingle = daysSingleTasks.slice(0, Math.max(0, MAX_VISIBLE - totalSlotRows))
		const overflow = Math.max(0, totalItems - MAX_VISIBLE)

		days.push({
			date: current,
			isCurrentMonth: current.month() === currentMonth.value.month(),
			isToday: current.isSame(dayjs(), 'day'),
			isSelected: dateStr === selDateStr,
			slots,
			singleTasks: visibleSingle,
			overflow,
		})
		current = current.add(1, 'day')
	}
	return days
})

// ─── Day view computed ───

function getHour(dateStr: string | null): number {
	if (!dateStr || dateStr.length <= 10) return -1
	return parseInt(dateStr.substring(11, 13), 10)
}

const dayTasks = computed(() => {
	const dateStr = selectedDate.value.format('YYYY-MM-DD')
	return taskStore.filteredTasks.filter(t => {
		const start = t.exp_start_date ? t.exp_start_date.substring(0, 10) : null
		const end = t.exp_end_date ? t.exp_end_date.substring(0, 10) : null
		return start === dateStr || end === dateStr || (!start && !end && t.creation?.substring(0, 10) === dateStr)
	})
})

const allDayTasks = computed(() => {
	return dayTasks.value.filter(t => {
		return getHour(t.exp_start_date) < 0 && getHour(t.exp_end_date) < 0
	})
})

interface HourlyBlock {
	task: Task
	top: number
	height: number
	startTime: string
	endTime: string
}

const hourlyTaskBlocks = computed((): HourlyBlock[] => {
	const dateStr = selectedDate.value.format('YYYY-MM-DD')
	const blocks: HourlyBlock[] = []

	for (const task of dayTasks.value) {
		const startHour = getHour(task.exp_start_date)
		if (startHour < 0) continue

		const startMin = task.exp_start_date!.length > 13
			? parseInt(task.exp_start_date!.substring(14, 16), 10)
			: 0

		let endHour: number
		let endMin: number

		if (task.exp_end_date && task.exp_end_date.length > 10 && task.exp_end_date.substring(0, 10) === dateStr) {
			endHour = parseInt(task.exp_end_date.substring(11, 13), 10)
			endMin = parseInt(task.exp_end_date.substring(14, 16), 10)
		} else {
			endHour = Math.min(startHour + 1, 23)
			endMin = startMin
		}

		const top = startHour * 60 + startMin
		const bottom = endHour * 60 + endMin
		const height = Math.max(bottom - top, 20)

		blocks.push({
			task,
			top,
			height,
			startTime: `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`,
			endTime: `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`,
		})
	}

	return blocks
})

const currentTimeTop = computed(() => {
	const now = dayjs()
	return now.hour() * 60 + now.minute()
})

// ─── Navigation ───

function selectDay(dateStr: string) {
	selectedDate.value = dayjs(dateStr)
}

function prevMonth() { currentMonth.value = currentMonth.value.subtract(1, 'month') }
function nextMonth() { currentMonth.value = currentMonth.value.add(1, 'month') }
function goToToday() {
	currentMonth.value = dayjs().startOf('month')
	selectedDate.value = dayjs()
	nextTick(() => scrollToCurrentTime())
}

function prevDay() { selectedDate.value = selectedDate.value.subtract(1, 'day') }
function nextDay() { selectedDate.value = selectedDate.value.add(1, 'day') }
function goToDayToday() {
	selectedDate.value = dayjs()
	nextTick(() => scrollToCurrentTime())
}

function scrollToCurrentTime() {
	if (!dayScrollContainer.value) return
	const now = dayjs()
	const scrollTo = Math.max(0, (now.hour() - 1) * 60)
	dayScrollContainer.value.scrollTop = scrollTo
}

onMounted(() => scrollToCurrentTime())

// ─── Task creation ───

function createTaskForDate(dateStr: string) {
	window.dispatchEvent(new CustomEvent('taskist:quick-add', { detail: { date: dateStr } }))
}

function createTaskForHour(hour: number) {
	const dateStr = selectedDate.value.format('YYYY-MM-DD')
	const timeStr = `${String(hour).padStart(2, '0')}:00:00`
	window.dispatchEvent(new CustomEvent('taskist:quick-add', { detail: { date: `${dateStr} ${timeStr}` } }))
}

// ─── Drag and drop ───

/** Drag start from within the day panel (hourly blocks or all-day) */
function onDragStart(event: DragEvent, task: Task) {
	draggedTask.value = task
	if (event.dataTransfer) {
		event.dataTransfer.effectAllowed = 'move'
		event.dataTransfer.setData('text/plain', task.name)
	}
}

/** Drag start from the month grid — also sets the dragged task */
function onDragStartMonth(event: DragEvent, task: Task) {
	draggedTask.value = task
	if (event.dataTransfer) {
		event.dataTransfer.effectAllowed = 'move'
		event.dataTransfer.setData('text/plain', task.name)
	}
}

function onDragOver(event: DragEvent, _hour: number) {
	if (event.dataTransfer) {
		event.dataTransfer.dropEffect = 'move'
	}
}

async function onDropHour(event: DragEvent, targetHour: number) {
	const task = draggedTask.value
	if (!task) return
	draggedTask.value = null
	await handleDropToHour(task, targetHour)
}

async function handleDropToHour(task: Task, targetHour: number) {
	const dateStr = selectedDate.value.format('YYYY-MM-DD')
	const newStartTime = `${String(targetHour).padStart(2, '0')}:00:00`
	const newStart = `${dateStr} ${newStartTime}`

	// Preserve duration if task already had start+end with time
	let durationHours = 1
	if (task.exp_start_date && task.exp_start_date.length > 10 && task.exp_end_date && task.exp_end_date.length > 10) {
		const oldStart = dayjs(task.exp_start_date)
		const oldEnd = dayjs(task.exp_end_date)
		durationHours = oldEnd.diff(oldStart, 'hour') || 1
	}

	const endHour = Math.min(targetHour + durationHours, 23)
	const newEndTime = `${String(endHour).padStart(2, '0')}:00:00`
	const newEnd = `${dateStr} ${newEndTime}`

	// Optimistic UI update
	task.exp_start_date = newStart
	task.exp_end_date = newEnd

	try {
		await call('taskist.api.update_task_dates', {
			task_name: task.name,
			exp_start_date: newStart,
			exp_end_date: newEnd,
		})
		await taskStore.fetchTasks()
	} catch (e) {
		console.error('Failed to update task dates:', e)
		await taskStore.fetchTasks()
	}
}

// ─── Helpers ───

function formatHourShort(hour: number) {
	if (hour === 0) return '12a'
	if (hour < 12) return `${hour}a`
	if (hour === 12) return '12p'
	return `${hour - 12}p`
}

function taskBarClass(_task: Task, isStart: boolean, isEnd: boolean) {
	const classes: string[] = []
	if (isStart && isEnd) {
		classes.push('rounded')
	} else if (isStart) {
		classes.push('rounded-l -mr-1')
	} else if (isEnd) {
		classes.push('rounded-r -ml-1')
	} else {
		classes.push('-mx-1')
	}
	return classes.join(' ')
}

function priorityBg(priority: string) {
	const colors: Record<string, string> = {
		High: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
		Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
		Low: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
	}
	return colors[priority] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
}
</script>
