<template>
	<div
		class="flex items-center gap-2 md:gap-3 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
		:style="{ paddingLeft: (12 + depth * mobileIndent) + 'px', paddingRight: '12px' }"
		@click="taskStore.selectTask(task)"
	>
		<button
			@click.stop="toggleDone"
			class="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors"
			:class="isDone ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'"
		>
			<svg v-if="isDone" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
			</svg>
		</button>
		<button
			v-if="childCount > 0"
			@click.stop="taskStore.toggleCollapse(task.name)"
			class="w-4 h-4 flex items-center justify-center flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-transform"
			:class="taskStore.isCollapsed(task.name) ? '' : 'rotate-90'"
			:title="taskStore.isCollapsed(task.name) ? 'Expand' : 'Collapse'"
		>
			<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" /></svg>
		</button>
		<svg v-if="task.is_group" class="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" title="Group task">
			<path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
		</svg>
		<div class="w-2 h-2 rounded-full flex-shrink-0" :class="priorityColor"></div>
		<span class="flex-1 text-sm truncate flex items-center gap-1" :class="isDone ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-gray-100'">
			{{ task.subject }}
			<svg v-if="task.taskist_is_recurring" class="w-3.5 h-3.5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" title="Recurring task">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
			</svg>
		</span>
		<span v-if="childCount > 0" class="text-xs text-blue-500 flex items-center gap-0.5 flex-shrink-0">
			<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" /></svg>
			{{ childCount }}
			<button
				@click.stop="taskStore.toggleGroupFilter(task.name)"
				class="ml-0.5 p-0.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
				:class="taskStore.groupFilter === task.name ? 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40' : 'text-blue-400 hover:text-blue-600'"
				:title="taskStore.groupFilter === task.name ? 'Clear filter' : 'Show only children'"
			>
				<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
			</button>
		</span>
		<span class="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs hidden sm:inline">{{ task.status || 'Open' }}</span>
		<span v-if="task.project" class="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px] hidden md:inline">{{ task.project }}</span>
		<span v-if="task.exp_end_date" class="text-xs whitespace-nowrap" :class="isOverdue ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'">
			{{ formatDate(task.exp_end_date) }}
		</span>
		<span v-if="task._last_comment" class="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[180px] hidden lg:inline-flex items-center gap-1" :title="task._last_comment">
			<svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
			{{ task._last_comment }}
			<span v-if="task._last_comment_at" class="text-gray-300 dark:text-gray-600">&middot; {{ timeAgo(task._last_comment_at) }}</span>
		</span>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTaskStore, type Task } from '@/stores/taskStore'
import { call } from '@/data/api'
import dayjs from 'dayjs'

const props = withDefaults(defineProps<{
	task: Task & { _depth?: number; _childCount?: number }
	depth?: number
}>(), {
	depth: 0,
})
const taskStore = useTaskStore()

const windowWidth = ref(window.innerWidth)
function onResize() { windowWidth.value = window.innerWidth }
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))
const mobileIndent = computed(() => windowWidth.value < 640 ? 12 : 24)

const isDone = computed(() => props.task.status === 'Completed')
const priorityColor = computed(() => {
	const colors: Record<string, string> = { High: 'bg-orange-500', Medium: 'bg-yellow-500', Low: 'bg-green-500' }
	return colors[props.task.priority] || 'bg-gray-400'
})
const isOverdue = computed(() => props.task.exp_end_date && dayjs(props.task.exp_end_date).isBefore(dayjs(), 'day'))
const childCount = computed(() => {
	if (typeof props.task._childCount === 'number') return props.task._childCount
	return (taskStore.childrenMap[props.task.name] || []).length
})

async function toggleDone() {
	await call('taskist.api.update_task_status', {
		task_name: props.task.name,
		status: isDone.value ? 'Open' : 'Completed',
	})
	await taskStore.fetchTasks()
}

function formatDate(date: string) {
	const d = dayjs(date)
	if (d.isSame(dayjs(), 'day')) return 'Today'
	if (d.isSame(dayjs().add(1, 'day'), 'day')) return 'Tomorrow'
	return d.format('MMM D')
}

function timeAgo(dt: string) {
	const diff = dayjs().diff(dayjs(dt), 'minute')
	if (diff < 1) return 'now'
	if (diff < 60) return `${diff}m`
	const hours = Math.floor(diff / 60)
	if (hours < 24) return `${hours}h`
	const days = Math.floor(hours / 24)
	if (days < 30) return `${days}d`
	return dayjs(dt).format('MMM D')
}
</script>
