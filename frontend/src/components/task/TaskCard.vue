<template>
	<div
		class="bg-white dark:bg-gray-800 rounded-lg border p-3 cursor-pointer hover:shadow-md transition-shadow"
		:class="cardBorderClass"
		@click="taskStore.selectTask(task)"
	>
		<div class="flex items-start gap-2">
			<div class="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" :style="dotStyle" :class="!task.color ? priorityColor : ''"></div>
			<div class="flex-1 min-w-0">
				<div class="flex items-center gap-1">
					<button
						v-if="childCount > 0"
						@click.stop="taskStore.toggleCollapse(task.name)"
						class="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-transform"
						:class="taskStore.isCollapsed(task.name) ? '' : 'rotate-90'"
						:title="taskStore.isCollapsed(task.name) ? 'Expand' : 'Collapse'"
					>
						<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" /></svg>
					</button>
					<svg v-if="task.is_group" class="w-3.5 h-3.5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" title="Group task">
						<path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
					</svg>
					<svg v-if="task.is_milestone" class="w-3.5 h-3.5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" title="Milestone">
						<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
					</svg>
					<p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ task.subject }}</p>
					<svg v-if="task.taskist_is_recurring" class="w-3.5 h-3.5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" title="Recurring task">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
					</svg>
				</div>
				<!-- Progress bar if progress > 0 -->
				<div v-if="task.progress > 0" class="mt-1.5 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
					<div class="h-full bg-blue-500 rounded-full transition-all" :style="{ width: task.progress + '%' }"></div>
				</div>
				<div v-if="tags.length" class="flex flex-wrap gap-1 mt-1.5">
					<span v-for="tag in tags" :key="tag" class="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{{ tag }}</span>
				</div>
				<div class="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
					<span v-if="childCount > 0" class="flex items-center gap-0.5 text-blue-500">
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
					<span v-if="task.exp_end_date" class="flex items-center gap-1" :class="isOverdue ? 'text-red-500' : ''">
						{{ formatDate(task.exp_end_date) }}
					</span>
					<span v-if="task.type" class="badge bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[10px]">{{ task.type }}</span>
					<span v-if="task.project" class="truncate max-w-[100px]">{{ task.project }}</span>
					<div v-if="assignees.length" class="flex -space-x-1 ml-auto">
						<div
							v-for="(user, i) in assignees.slice(0, 3)"
							:key="i"
							class="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center ring-2 ring-white dark:ring-gray-800"
							:title="user"
						>
							{{ user.charAt(0).toUpperCase() }}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTaskStore, type Task } from '@/stores/taskStore'
import dayjs from 'dayjs'

const props = defineProps<{ task: Task & { _childCount?: number } }>()
const taskStore = useTaskStore()

const childCount = computed(() => {
	if (typeof props.task._childCount === 'number') return props.task._childCount
	return (taskStore.childrenMap[props.task.name] || []).length
})

const cardBorderClass = computed(() => {
	if (props.task.color) return 'border-l-4'
	return 'border-gray-200 dark:border-gray-700'
})

const dotStyle = computed(() => {
	if (props.task.color) return { backgroundColor: props.task.color }
	return {}
})

const priorityColor = computed(() => {
	const colors: Record<string, string> = { High: 'bg-orange-500', Medium: 'bg-yellow-500', Low: 'bg-green-500' }
	return colors[props.task.priority] || 'bg-gray-400'
})

const assignees = computed(() => {
	if (!props.task._assign) return []
	try { return JSON.parse(props.task._assign) } catch { return [] }
})

const tags = computed(() => {
	if (!props.task._user_tags) return []
	return props.task._user_tags.split(',').filter(Boolean)
})

const isOverdue = computed(() => {
	if (!props.task.exp_end_date) return false
	return dayjs(props.task.exp_end_date).isBefore(dayjs(), 'day')
})

function formatDate(date: string) {
	const d = dayjs(date)
	if (d.isSame(dayjs(), 'day')) return 'Today'
	if (d.isSame(dayjs().add(1, 'day'), 'day')) return 'Tomorrow'
	return d.format('MMM D')
}
</script>

<style scoped>
.border-l-4 {
	border-left-width: 4px;
	border-left-color: v-bind('task.color || "transparent"');
	border-top-color: rgb(229 231 235);
	border-right-color: rgb(229 231 235);
	border-bottom-color: rgb(229 231 235);
}
:is(.dark) .border-l-4 {
	border-top-color: rgb(55 65 81);
	border-right-color: rgb(55 65 81);
	border-bottom-color: rgb(55 65 81);
}
</style>
