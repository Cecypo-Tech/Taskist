<template>
	<div class="h-full flex flex-col">
		<div class="flex flex-wrap items-center gap-2 md:gap-3 px-3 md:px-6 py-2 md:py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
			<select v-model="priorityFilter" class="text-xs md:text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 md:px-3 py-1.5 bg-white dark:bg-gray-700 dark:text-gray-200">
				<option value="">All Priorities</option>
				<option>High</option><option>Medium</option><option>Low</option>
			</select>
			<select v-model="statusFilter" class="text-xs md:text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 md:px-3 py-1.5 bg-white dark:bg-gray-700 dark:text-gray-200">
				<option value="">All Statuses</option>
				<option>Open</option><option>Working</option><option>Pending Review</option><option>Overdue</option><option>Completed</option><option>Cancelled</option>
			</select>
			<select v-model="sortBy" class="text-xs md:text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 md:px-3 py-1.5 bg-white dark:bg-gray-700 dark:text-gray-200">
				<option value="hierarchy">Hierarchy</option>
				<option value="modified">Last Modified</option>
				<option value="creation">Created</option>
				<option value="priority">Priority</option>
				<option value="subject">Name</option>
				<option value="exp_end_date">Due Date</option>
				<option value="last_comment">Last Comment</option>
			</select>
			<button @click="sortAsc = !sortAsc" class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400" :title="sortAsc ? 'Ascending' : 'Descending'">
				<svg v-if="sortAsc" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
				<svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" /></svg>
			</button>
			<label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 ml-auto">
				<input type="checkbox" v-model="showCompleted" class="rounded" />
				Show completed
			</label>
		</div>
		<div class="flex-1 overflow-auto">
			<div v-if="taskStore.loading && !displayTasks.length" class="flex items-center justify-center h-48">
				<div class="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
			</div>
			<div v-else-if="!displayTasks.length" class="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-500">
				<p class="text-sm">No tasks found</p>
			</div>
			<TaskRow v-for="task in displayTasks" :key="task.name" :task="task" :depth="task._depth || 0" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTaskStore, type Task } from '@/stores/taskStore'
import TaskRow from '@/components/task/TaskRow.vue'

const taskStore = useTaskStore()
const priorityFilter = ref('')
const statusFilter = ref('')
const showCompleted = ref(false)
const sortBy = ref('hierarchy')
const sortAsc = ref(false)

const priorityOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 }

const filteredBase = computed(() => {
	let result = taskStore.filteredTasks
	if (priorityFilter.value) result = result.filter(t => t.priority === priorityFilter.value)
	if (statusFilter.value) result = result.filter(t => t.status === statusFilter.value)
	if (!showCompleted.value) result = result.filter(t => t.status !== 'Completed' && t.status !== 'Cancelled')
	return result
})

const displayTasks = computed(() => {
	if (sortBy.value === 'hierarchy') {
		// Build hierarchical display from filtered tasks
		const filtered = filteredBase.value
		const filteredSet = new Set(filtered.map(t => t.name))
		const childrenMap: Record<string, (Task & { _depth: number; _childCount: number })[]> = {}

		for (const task of filtered) {
			if (task.parent_task && filteredSet.has(task.parent_task)) {
				if (!childrenMap[task.parent_task]) childrenMap[task.parent_task] = []
				childrenMap[task.parent_task].push(task as any)
			}
		}

		const roots = filtered.filter(t => !t.parent_task || !filteredSet.has(t.parent_task))
		const result: Array<Task & { _depth: number; _childCount: number }> = []

		const nameSortDir = taskStore.nameSort
		const nameSortFn = nameSortDir !== 'none'
			? (a: Task, b: Task) => {
				const cmp = (a.subject || '').localeCompare(b.subject || '')
				return nameSortDir === 'desc' ? -cmp : cmp
			}
			: null

		if (nameSortFn) roots.sort(nameSortFn)

		function addWithChildren(task: Task, depth: number) {
			const children = [...(childrenMap[task.name] || [])]
			if (nameSortFn) children.sort(nameSortFn)
			result.push({ ...task, _depth: depth, _childCount: children.length } as any)
			if (!taskStore.isCollapsed(task.name)) {
				for (const child of children) {
					addWithChildren(child, depth + 1)
				}
			}
		}

		for (const task of roots) {
			addWithChildren(task, 0)
		}
		return result
	}

	// Flat sorted mode
	const tasks = [...filteredBase.value].map(t => ({ ...t, _depth: 0, _childCount: 0 }))
	const dir = sortAsc.value ? 1 : -1

	tasks.sort((a, b) => {
		let cmp = 0
		switch (sortBy.value) {
			case 'priority':
				cmp = (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9)
				break
			case 'subject':
				cmp = (a.subject || '').localeCompare(b.subject || '')
				break
			case 'exp_end_date':
				cmp = (a.exp_end_date || '9999').localeCompare(b.exp_end_date || '9999')
				break
			case 'creation':
				cmp = (a.creation || '').localeCompare(b.creation || '')
				break
			case 'last_comment':
				cmp = (a._last_comment_at || '').localeCompare(b._last_comment_at || '')
				break
			case 'modified':
			default:
				cmp = (a.modified || '').localeCompare(b.modified || '')
				break
		}
		return cmp * dir
	})

	return tasks
})
</script>
