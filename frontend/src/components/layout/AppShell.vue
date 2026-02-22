<template>
	<div class="flex h-full w-full">
		<!-- Mobile sidebar backdrop -->
		<div
			v-if="mobileMenuOpen"
			class="fixed inset-0 bg-black/40 z-40 md:hidden"
			@click="mobileMenuOpen = false"
		></div>
		<!-- Sidebar: overlay on mobile, inline on desktop -->
		<div
			class="fixed inset-y-0 left-0 z-50 transition-transform duration-200 md:relative md:translate-x-0 md:z-auto"
			:class="mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
		>
			<Sidebar :collapsed="sidebarCollapsed" @toggle="handleSidebarToggle" />
		</div>
		<div class="flex-1 flex flex-col min-w-0">
			<TopBar ref="topBar" @show-shortcuts="showShortcuts = true" @toggle-menu="mobileMenuOpen = !mobileMenuOpen" />
			<TabBar />
			<main class="flex-1 overflow-auto">
				<router-view />
			</main>
		</div>
		<TaskDetailPanel />
		<ShortcutsModal
			v-if="showShortcuts"
			:shortcuts="shortcutsList"
			@close="showShortcuts = false"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from './Sidebar.vue'
import TopBar from './TopBar.vue'
import TabBar from './TabBar.vue'
import TaskDetailPanel from '@/components/task/TaskDetailPanel.vue'
import ShortcutsModal from '@/components/common/ShortcutsModal.vue'
import { useTaskStore } from '@/stores/taskStore'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'

const sidebarCollapsed = ref(false)
const mobileMenuOpen = ref(false)

function handleSidebarToggle() {
	// On mobile, close the drawer; on desktop, toggle collapse
	if (window.innerWidth < 768) {
		mobileMenuOpen.value = false
	} else {
		sidebarCollapsed.value = !sidebarCollapsed.value
	}
}
const taskStore = useTaskStore()
const router = useRouter()
const showShortcuts = ref(false)
const topBar = ref<any>(null)

const shortcutsList = [
	{ label: 'N', description: 'New task' },
	{ label: '/', description: 'Focus search' },
	{ label: 'Esc', description: 'Close panel / modal' },
	{ label: '1', description: 'Switch to Kanban view' },
	{ label: '2', description: 'Switch to List view' },
	{ label: '3', description: 'Switch to Calendar view' },
	{ label: '4', description: 'Switch to Summary view' },
	{ label: '?', description: 'Show keyboard shortcuts' },
]

useKeyboardShortcuts([
	{
		key: 'n',
		label: 'N',
		description: 'New task',
		handler: () => { if (topBar.value) topBar.value.openQuickAdd() },
	},
	{
		key: '/',
		label: '/',
		description: 'Focus search',
		handler: () => { if (topBar.value) topBar.value.focusSearch() },
	},
	{
		key: 'Escape',
		label: 'Esc',
		description: 'Close panel / modal',
		handler: () => {
			if (showShortcuts.value) { showShortcuts.value = false; return }
			if (taskStore.showDetail) { taskStore.closeDetail(); return }
		},
	},
	{
		key: '1',
		label: '1',
		description: 'Switch to Kanban view',
		handler: () => router.push('/kanban'),
	},
	{
		key: '2',
		label: '2',
		description: 'Switch to List view',
		handler: () => router.push('/list'),
	},
	{
		key: '3',
		label: '3',
		description: 'Switch to Calendar view',
		handler: () => router.push('/calendar'),
	},
	{
		key: '4',
		label: '4',
		description: 'Switch to Summary view',
		handler: () => router.push('/summary'),
	},
	{
		key: '?',
		label: '?',
		description: 'Show keyboard shortcuts',
		shift: true,
		handler: () => { showShortcuts.value = !showShortcuts.value },
	},
])

function handleQuickAdd(e: Event) {
	const detail = (e as CustomEvent).detail
	if (topBar.value) topBar.value.openQuickAdd(detail?.date || '')
}

onMounted(() => {
	taskStore.fetchTasks()
	window.addEventListener('taskist:quick-add', handleQuickAdd)
})

onUnmounted(() => {
	window.removeEventListener('taskist:quick-add', handleQuickAdd)
})
</script>
