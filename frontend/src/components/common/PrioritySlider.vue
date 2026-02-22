<template>
	<div class="flex flex-col gap-1.5">
		<div class="flex items-center gap-1">
			<button
				v-for="(level, i) in levels"
				:key="level.value"
				@click="$emit('update:modelValue', level.value)"
				class="flex-1 py-1.5 text-xs font-medium rounded-md transition-all text-center"
				:class="activeIndex >= i ? level.activeClass : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'"
			>
				{{ level.label }}
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ modelValue: string }>()
defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const levels = [
	{ value: 'Low', label: 'Low', activeClass: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 ring-1 ring-green-300 dark:ring-green-700' },
	{ value: 'Medium', label: 'Medium', activeClass: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 ring-1 ring-yellow-300 dark:ring-yellow-700' },
	{ value: 'High', label: 'High', activeClass: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 ring-1 ring-orange-300 dark:ring-orange-700' },
]

const activeIndex = computed(() => levels.findIndex(l => l.value === props.modelValue))
</script>
