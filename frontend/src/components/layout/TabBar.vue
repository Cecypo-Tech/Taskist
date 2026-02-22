<template>
	<div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 md:px-6 flex items-center">
		<nav class="flex gap-1 overflow-x-auto">
			<router-link
				v-for="tab in tabs"
				:key="tab.route"
				:to="tab.route"
				class="px-3 md:px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
				:class="isActive(tab.route)
					? 'border-blue-600 text-blue-600'
					: 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'"
			>
				{{ tab.label }}
			</router-link>
		</nav>
		<button
			v-if="taskStore.groupFilter"
			@click="taskStore.toggleGroupFilter(taskStore.groupFilter!)"
			class="ml-2 flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors flex-shrink-0"
			title="Clear group filter"
		>
			<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
			{{ groupFilterLabel }}
			<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
		</button>
		<div class="flex items-center gap-1 ml-auto flex-shrink-0">
			<button
				v-if="isKanbanOrList"
				@click="taskStore.toggleNameSort()"
				class="p-1.5 rounded-lg transition-colors"
				:class="taskStore.nameSort !== 'none' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'"
				:title="taskStore.nameSort === 'none' ? 'Sort by name A→Z' : taskStore.nameSort === 'asc' ? 'Sort by name Z→A' : 'Clear name sort'"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path v-if="taskStore.nameSort === 'asc'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
					<path v-else-if="taskStore.nameSort === 'desc'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
					<path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
				</svg>
			</button>
			<button
				@click="taskStore.allCollapsed ? taskStore.expandAllGroups() : taskStore.collapseAllGroups()"
				class="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
				:title="taskStore.allCollapsed ? 'Expand all groups' : 'Collapse all groups'"
			>
				<svg v-if="taskStore.allCollapsed" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" /></svg>
				<svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 16l-4-4 4-4M4 8l4 4-4 4m8-12v16" /></svg>
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'

const route = useRoute()
const taskStore = useTaskStore()

const tabs = [
	{ label: 'Kanban', route: '/kanban' },
	{ label: 'List', route: '/list' },
	{ label: 'Calendar', route: '/calendar' },
	{ label: 'Summary', route: '/summary' },
]

function isActive(path: string) {
	return route.path === path
}

const groupFilterLabel = computed(() => {
	if (!taskStore.groupFilter) return ''
	const task = taskStore.tasks.find(t => t.name === taskStore.groupFilter)
	return task ? task.subject : taskStore.groupFilter
})

const isKanbanOrList = computed(() => route.path === '/kanban' || route.path === '/list')
</script>
