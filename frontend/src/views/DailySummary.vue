<template>
	<div class="h-full overflow-auto p-3 md:p-6">
		<div class="max-w-3xl mx-auto space-y-4 md:space-y-6">
			<div class="flex items-center gap-4">
				<button @click="prevDay" class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
					<svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
				</button>
				<h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ formattedDate }}</h2>
				<button @click="nextDay" class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
					<svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
				</button>
				<button @click="goToToday" class="btn-secondary text-xs ml-2">Today</button>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
				<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
					<p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Work Time</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{{ formatDuration(summary.total_work_seconds) }}</p>
				</div>
				<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
					<p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tasks Done</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{{ summary.total_completed }}</p>
				</div>
			</div>

			<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
				<div class="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 dark:border-gray-700"><h3 class="font-semibold text-gray-900 dark:text-gray-100">Time Entries</h3></div>
				<div v-if="summary.time_entries?.length" class="divide-y divide-gray-100 dark:divide-gray-700">
					<div v-for="entry in summary.time_entries" :key="entry.name" class="px-4 md:px-6 py-3 flex items-center gap-3 md:gap-4">
						<div class="flex-1 min-w-0">
							<p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ entry.task_subject || entry.task }}</p>
							<p class="text-xs text-gray-500 dark:text-gray-400">{{ formatTime(entry.start_time) }} - {{ entry.end_time ? formatTime(entry.end_time) : 'Running' }}</p>
						</div>
						<span class="badge" :class="entry.is_break ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'">{{ entry.entry_type }}</span>
						<span class="text-sm font-mono text-gray-700 dark:text-gray-300">{{ formatDuration(entry.duration_seconds || 0) }}</span>
					</div>
				</div>
				<div v-else class="px-4 md:px-6 py-8 text-center text-sm text-gray-400 dark:text-gray-500">No time entries for this day</div>
			</div>

			<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
				<div class="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 dark:border-gray-700"><h3 class="font-semibold text-gray-900 dark:text-gray-100">Completed Tasks</h3></div>
				<div v-if="summary.completed_tasks?.length" class="divide-y divide-gray-100 dark:divide-gray-700">
					<div v-for="task in summary.completed_tasks" :key="task.name" class="px-4 md:px-6 py-3 flex items-center gap-3">
						<svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
						<span class="text-sm text-gray-900 dark:text-gray-100 truncate">{{ task.subject }}</span>
						<span v-if="task.project" class="text-xs text-gray-500 dark:text-gray-400 ml-auto">{{ task.project }}</span>
					</div>
				</div>
				<div v-else class="px-4 md:px-6 py-8 text-center text-sm text-gray-400 dark:text-gray-500">No tasks completed this day</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { call } from '@/data/api'
import dayjs from 'dayjs'

const currentDate = ref(dayjs())
const summary = ref<any>({ total_work_seconds: 0, total_break_seconds: 0, total_completed: 0, time_entries: [], completed_tasks: [] })
const formattedDate = ref('')

async function loadSummary() {
	const dateStr = currentDate.value.format('YYYY-MM-DD')
	formattedDate.value = currentDate.value.isSame(dayjs(), 'day') ? 'Today' : currentDate.value.format('dddd, MMMM D, YYYY')
	try { summary.value = await call('taskist.api.get_daily_summary', { date: dateStr }) } catch (e) { console.error(e) }
}

function prevDay() { currentDate.value = currentDate.value.subtract(1, 'day') }
function nextDay() { currentDate.value = currentDate.value.add(1, 'day') }
function goToToday() { currentDate.value = dayjs() }
function formatDuration(seconds: number) { const h = Math.floor(seconds / 3600); const m = Math.floor((seconds % 3600) / 60); return h > 0 ? `${h}h ${m}m` : `${m}m` }
function formatTime(dt: string) { return dayjs(dt).format('h:mm A') }

watch(currentDate, loadSummary)
onMounted(loadSummary)
</script>
