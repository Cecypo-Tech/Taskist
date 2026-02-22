<template>
	<div class="h-full">
		<div v-if="taskStore.loading && !taskStore.tasks.length" class="flex items-center justify-center h-full">
			<div class="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
		</div>
		<KanbanBoard v-else />
	</div>
</template>

<script setup lang="ts">
import { useTaskStore } from '@/stores/taskStore'
import KanbanBoard from '@/components/kanban/KanbanBoard.vue'
const taskStore = useTaskStore()
</script>
