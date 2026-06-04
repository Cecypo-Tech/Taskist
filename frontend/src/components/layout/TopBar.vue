<template>
	<div class="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-3 md:px-6 gap-2 md:gap-4 transition-colors">
		<!-- Mobile hamburger menu -->
		<button @click="$emit('toggle-menu')" class="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden">
			<FeatherIcon name="menu" class="w-5 h-5 text-gray-600 dark:text-gray-400" />
		</button>
		<!-- Search -->
		<div class="flex-1 max-w-md relative">
			<FeatherIcon name="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
			<input
				ref="searchInput"
				v-model="taskStore.searchQuery"
				type="text"
				placeholder="Search tasks... ( / )"
				class="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-600"
			/>
		</div>

		<!-- New Task -->
		<Button variant="solid" theme="blue" icon-left="plus" @click="showQuickAdd = true" label="New Task" class="hidden sm:flex" />
		<Button variant="solid" theme="blue" icon="plus" @click="showQuickAdd = true" class="sm:hidden" />

		<!-- Right-side icon group -->
		<div class="flex items-center gap-1 ml-auto">
			<!-- Dark / Light mode toggle -->
			<button
				@click="togglePush"
				class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
				:class="push.enabled.value ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'"
				:title="push.statusLabel.value"
				:disabled="push.loading.value"
			>
				<FeatherIcon name="bell" class="w-5 h-5" />
			</button>

			<button
				@click="toggle()"
				class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
				:title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
			>
				<FeatherIcon v-if="isDark" name="sun" class="w-5 h-5 text-yellow-400" />
				<FeatherIcon v-else name="moon" class="w-5 h-5 text-gray-500" />
			</button>

			<!-- Keyboard shortcuts info -->
			<button
				@click="$emit('show-shortcuts')"
				class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors hidden sm:block"
				title="Keyboard Shortcuts (?)"
			>
				<FeatherIcon name="info" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
			</button>

			<!-- Open in Frappe Desk -->
			<a
				href="/app/task"
				target="_blank"
				class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
				title="Open Tasks in Desk"
			>
				<FeatherIcon name="external-link" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
			</a>
		</div>
	</div>

	<TaskQuickAdd v-if="showQuickAdd" @close="showQuickAdd = false" :prefill-date="prefillDate" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onMounted } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { useDarkMode } from '@/composables/useDarkMode'
import { usePushNotifications } from '@/composables/usePushNotifications'
import TaskQuickAdd from '@/components/task/TaskQuickAdd.vue'

defineEmits(['show-shortcuts', 'toggle-menu'])

const taskStore = useTaskStore()
const showQuickAdd = ref(false)
const prefillDate = ref('')
const searchInput = ref<HTMLInputElement | null>(null)
const { isDark, toggle } = useDarkMode()
const push = usePushNotifications()

onMounted(() => {
	push.refreshStatus()
})

async function togglePush() {
	if (push.enabled.value) {
		await push.disable()
		return
	}
	await push.enable()
	if (push.enabled.value) {
		await push.sendTest()
	}
}

function openQuickAdd(date?: string) {
	prefillDate.value = date || ''
	showQuickAdd.value = true
}

function focusSearch() {
	searchInput.value?.focus()
}

defineExpose({ openQuickAdd, focusSearch })
</script>
