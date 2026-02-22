<template>
	<div class="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-3 md:px-6 gap-2 md:gap-4 transition-colors">
		<!-- Mobile hamburger menu -->
		<button @click="$emit('toggle-menu')" class="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden">
			<svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
			</svg>
		</button>
		<!-- Search -->
		<div class="flex-1 max-w-md relative">
			<svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
			<input
				ref="searchInput"
				v-model="taskStore.searchQuery"
				type="text"
				placeholder="Search tasks... ( / )"
				class="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-600"
			/>
		</div>

		<!-- New Task -->
		<button @click="showQuickAdd = true" class="btn-primary flex items-center gap-1">
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			<span class="hidden sm:inline">New Task</span>
		</button>

		<!-- Right-side icon group -->
		<div class="flex items-center gap-1 ml-auto">
				<!-- Dark / Light mode toggle -->
			<button
				@click="toggle()"
				class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
				:title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
			>
				<!-- Sun icon (shown in dark mode) -->
				<svg v-if="isDark" class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
				</svg>
				<!-- Moon icon (shown in light mode) -->
				<svg v-else class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
				</svg>
			</button>

			<!-- Keyboard shortcuts info -->
			<button
				@click="$emit('show-shortcuts')"
				class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors hidden sm:block"
				title="Keyboard Shortcuts (?)"
			>
				<svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			</button>

			<!-- Open in Frappe Desk -->
			<a
				href="/app/task"
				target="_blank"
				class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
				title="Open Tasks in Desk"
			>
				<svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
				</svg>
			</a>

			<!-- Settings -->
			<a
				href="/app/taskist-settings"
				target="_blank"
				class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
				title="Taskist Settings"
			>
				<svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
			</a>
		</div>
	</div>

	<TaskQuickAdd v-if="showQuickAdd" @close="showQuickAdd = false" :prefill-date="prefillDate" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { useDarkMode } from '@/composables/useDarkMode'
import TaskQuickAdd from '@/components/task/TaskQuickAdd.vue'

defineEmits(['show-shortcuts', 'toggle-menu'])

const taskStore = useTaskStore()
const showQuickAdd = ref(false)
const prefillDate = ref('')
const searchInput = ref<HTMLInputElement | null>(null)
const { isDark, toggle } = useDarkMode()

function openQuickAdd(date?: string) {
	prefillDate.value = date || ''
	showQuickAdd.value = true
}

function focusSearch() {
	searchInput.value?.focus()
}

defineExpose({ openQuickAdd, focusSearch })
</script>
