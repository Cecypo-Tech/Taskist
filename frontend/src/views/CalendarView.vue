<template>
	<div class="h-full p-2 md:p-6">
		<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col">
			<div class="flex items-center justify-between px-3 md:px-6 py-3 md:py-4 border-b border-gray-200 dark:border-gray-700">
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
			<div class="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
				<div v-for="(day, i) in ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']" :key="day" class="px-1 md:px-3 py-2 text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 text-center">
					<span class="hidden sm:inline">{{ day }}</span>
					<span class="sm:hidden">{{ day.charAt(0) }}</span>
				</div>
			</div>
			<div class="flex-1 grid grid-cols-7 auto-rows-fr">
				<div
					v-for="(day, index) in calendarDays"
					:key="index"
					class="group border-b border-r border-gray-100 dark:border-gray-700 p-0.5 md:p-1 min-h-[60px] md:min-h-[100px] overflow-hidden relative"
					:class="{ 'bg-gray-50 dark:bg-gray-900/30': !day.isCurrentMonth, 'bg-blue-50 dark:bg-blue-900/20': day.isToday }"
				>
					<div class="flex items-center justify-between px-1 mb-1">
						<span class="text-xs font-medium" :class="day.isToday ? 'text-blue-600' : day.isCurrentMonth ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'">
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
					<!-- Multi-day spanning tasks -->
					<div class="space-y-0.5">
						<div
							v-for="slot in day.slots"
							:key="slot.task ? slot.task.name : 'empty-' + slot.index"
						>
							<!-- Empty placeholder to keep rows aligned -->
							<div v-if="!slot.task" class="h-5"></div>
							<!-- Spanning task bar -->
							<div
								v-else
								class="text-xs px-1.5 py-0.5 truncate cursor-pointer hover:opacity-80 h-5 leading-4"
								:class="[
									taskBarClass(slot.task, slot.isStart, slot.isEnd),
									priorityBg(slot.task.priority),
								]"
								@click="taskStore.selectTask(slot.task)"
								:title="slot.task.subject"
							>
								<span v-if="slot.isStart">{{ slot.task.subject }}</span>
							</div>
						</div>
						<!-- Single-day tasks (no spanning) -->
						<div
							v-for="task in day.singleTasks"
							:key="task.name"
							class="text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80 h-5 leading-4"
							:class="priorityBg(task.priority)"
							@click="taskStore.selectTask(task)"
						>{{ task.subject }}</div>
						<div v-if="day.overflow > 0" class="text-xs text-gray-400 dark:text-gray-500 px-1">+{{ day.overflow }} more</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTaskStore, type Task } from '@/stores/taskStore'
import dayjs, { type Dayjs } from 'dayjs'

const taskStore = useTaskStore()
const currentMonth = ref(dayjs().startOf('month'))

const MAX_VISIBLE = 4

interface SpanningTask {
	task: Task
	startDate: string
	endDate: string
	slotIndex: number
}

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
	slots: DaySlot[]
	singleTasks: Task[]
	overflow: number
}

const calendarDays = computed(() => {
	const start = currentMonth.value.startOf('week')
	const end = currentMonth.value.endOf('month').endOf('week')
	const tasks = taskStore.filteredTasks

	// Separate tasks into spanning (have both start and end, spanning multiple days) and single-day
	const spanningTasks: Array<{ task: Task; start: string; end: string }> = []
	const singleDayMap: Record<string, Task[]> = {}

	for (const task of tasks) {
		const startDate = task.exp_start_date || null
		const endDate = task.exp_end_date || null

		if (startDate && endDate && startDate !== endDate) {
			// Multi-day spanning task
			spanningTasks.push({ task, start: startDate, end: endDate })
		} else {
			// Single-day task: place on end date, start date, or creation date
			const dateStr = endDate || startDate || (task.creation ? task.creation.substring(0, 10) : '')
			if (dateStr) {
				if (!singleDayMap[dateStr]) singleDayMap[dateStr] = []
				singleDayMap[dateStr].push(task)
			}
		}
	}

	// Sort spanning tasks by start date, then by duration (longer first for better layout)
	spanningTasks.sort((a, b) => {
		if (a.start !== b.start) return a.start < b.start ? -1 : 1
		const durA = dayjs(a.end).diff(dayjs(a.start), 'day')
		const durB = dayjs(b.end).diff(dayjs(b.start), 'day')
		return durB - durA
	})

	// Assign slot indices for spanning tasks (row allocation to avoid overlaps)
	const slotAssignments: Array<{ task: Task; start: string; end: string; slot: number }> = []
	const slotEndDates: string[] = [] // Track when each slot row is freed

	for (const st of spanningTasks) {
		// Find first available slot
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

	// Build calendar days
	const days: CalendarDay[] = []
	let current = start
	while (current.isBefore(end) || current.isSame(end, 'day')) {
		const dateStr = current.format('YYYY-MM-DD')

		// Build slot rows for this day
		const slots: DaySlot[] = []
		for (let i = 0; i < totalSlotRows; i++) {
			// Find if any spanning task occupies this slot on this day
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
			slots,
			singleTasks: visibleSingle,
			overflow,
		})
		current = current.add(1, 'day')
	}
	return days
})

function createTaskForDate(dateStr: string) {
	window.dispatchEvent(new CustomEvent('taskist:quick-add', { detail: { date: dateStr } }))
}

function prevMonth() { currentMonth.value = currentMonth.value.subtract(1, 'month') }
function nextMonth() { currentMonth.value = currentMonth.value.add(1, 'month') }
function goToToday() { currentMonth.value = dayjs().startOf('month') }

function taskBarClass(task: Task, isStart: boolean, isEnd: boolean) {
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
