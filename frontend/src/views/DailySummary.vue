<template>
	<div class="h-full overflow-auto p-3 md:p-6">
		<div class="max-w-4xl mx-auto space-y-4 md:space-y-6">
			<h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">Summary</h2>

			<div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
				<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
					<p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Pending</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{{ summary.totals?.pending ?? 0 }}</p>
				</div>
				<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
					<p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Done Today</p>
					<p class="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{{ summary.totals?.completed_today ?? 0 }}</p>
				</div>
				<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
					<p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Done This Week</p>
					<p class="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{{ summary.totals?.completed_week ?? 0 }}</p>
				</div>
				<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
					<p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Overdue</p>
					<p class="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{{ summary.totals?.overdue ?? 0 }}</p>
				</div>
				<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
					<p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Unassigned</p>
					<p class="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{{ summary.totals?.unassigned ?? 0 }}</p>
				</div>
			</div>

			<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
				<div class="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 dark:border-gray-700">
					<h3 class="font-semibold text-gray-900 dark:text-gray-100">Per User</h3>
				</div>
				<div v-if="summary.users?.length" class="divide-y divide-gray-100 dark:divide-gray-700">
					<div v-for="user in summary.users" :key="user.email" class="px-4 md:px-6 py-3 flex items-center gap-4">
						<div class="flex-1 min-w-0">
							<p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ user.full_name }}</p>
							<p class="text-xs text-gray-500 dark:text-gray-400">{{ user.email }}</p>
						</div>
						<div class="flex items-center gap-3 text-xs font-medium">
							<span class="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">{{ user.pending }} pending</span>
							<span class="px-2 py-1 rounded bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">{{ user.completed_today }} today</span>
							<span class="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">{{ user.completed_week }} week</span>
							<span v-if="user.overdue > 0" class="px-2 py-1 rounded bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">{{ user.overdue }} overdue</span>
						</div>
					</div>
				</div>
				<div v-else class="px-4 md:px-6 py-8 text-center text-sm text-gray-400 dark:text-gray-500">No assigned tasks found</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { call } from '@/data/api'

const summary = ref<any>({ totals: {}, users: [] })

async function loadSummary() {
	try {
		summary.value = await call('taskist.api.get_summary')
	} catch (e) {
		console.error(e)
	}
}

onMounted(loadSummary)
</script>
