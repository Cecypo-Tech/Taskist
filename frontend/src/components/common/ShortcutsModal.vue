<template>
	<Dialog
		:model-value="true"
		@update:model-value="(v) => { if (!v) $emit('close') }"
		:options="{ title: 'Keyboard Shortcuts' }"
	>
		<template #body-content>
			<div class="space-y-3">
				<div
					v-for="shortcut in shortcuts"
					:key="shortcut.label"
					class="flex items-center justify-between"
				>
					<span class="text-sm text-gray-700 dark:text-gray-300">{{ shortcut.description }}</span>
					<kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono text-gray-700 dark:text-gray-300 min-w-[28px] text-center">{{ shortcut.label }}</kbd>
				</div>
			</div>
		</template>
	</Dialog>
</template>

<script setup lang="ts">
defineProps<{
	shortcuts: Array<{ label: string; description: string }>
}>()
defineEmits(['close'])
</script>
