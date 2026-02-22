<template>
	<div class="flex gap-3 md:gap-4 h-full p-3 md:p-6 overflow-x-auto">
		<KanbanColumn
			v-for="status in statuses"
			:key="status"
			:column="status"
			:tasks="taskStore.tasksByStatus[status] || []"
			@move="handleMove"
		/>
	</div>
</template>

<script setup lang="ts">
import { useTaskStore, KANBAN_STATUSES } from '@/stores/taskStore'
import KanbanColumn from './KanbanColumn.vue'

const taskStore = useTaskStore()
const statuses = [...KANBAN_STATUSES]

async function handleMove(payload: { taskName: string; column: string; index: number }) {
	const task = taskStore.tasks.find(t => t.name === payload.taskName)
	if (!task) return
	const oldStatus = task.status
	const children = taskStore.childrenMap[task.name] || []
	// Collect children whose status matches BEFORE any optimistic updates
	const matchingChildNames = children
		.filter(c => c.status === oldStatus)
		.map(c => c.name)

	// Optimistic UI update for parent
	task.status = payload.column
	task.taskist_sort_order = payload.index

	if (matchingChildNames.length > 0) {
		// Optimistic UI update for matching children
		for (const child of children) {
			if (matchingChildNames.includes(child.name)) child.status = payload.column
		}
		await taskStore.moveGroupWithChildren(payload.taskName, matchingChildNames, payload.column, payload.index)
	} else {
		await taskStore.updateTaskStatus(payload.taskName, payload.column, payload.index)
	}
	await taskStore.fetchTasks()
}
</script>
