<template>
	<div class="fixed inset-0 bg-black/30 dark:bg-black/50 z-50 flex items-center justify-center" @click.self="$emit('close')">
		<div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4">
			<div class="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
				<h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">Keyboard Shortcuts</h3>
				<button @click="$emit('close')" class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
					<svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			<div class="p-5 space-y-3">
				<div
					v-for="shortcut in shortcuts"
					:key="shortcut.label"
					class="flex items-center justify-between"
				>
					<span class="text-sm text-gray-700 dark:text-gray-300">{{ shortcut.description }}</span>
					<kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono text-gray-700 dark:text-gray-300 min-w-[28px] text-center">{{ shortcut.label }}</kbd>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
defineProps<{
	shortcuts: Array<{ label: string; description: string }>
}>()
defineEmits(['close'])
</script>
