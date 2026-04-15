<template>
	<div class="h-full">
		<div v-if="taskStore.loading && !taskStore.tasks.length" class="flex items-center justify-center h-full">
			<LoadingIndicator class="w-8 h-8" />
		</div>
		<KanbanBoard v-else />
	</div>
</template>

<script setup lang="ts">
import { useTaskStore } from '@/stores/taskStore'
import KanbanBoard from '@/components/kanban/KanbanBoard.vue'
const taskStore = useTaskStore()
</script>
