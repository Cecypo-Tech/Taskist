<template>
	<div class="relative">
		<input
			ref="inputRef"
			v-model="query"
			@input="onInput"
			@focus="onFocus"
			@blur="onBlur"
			@keydown.escape="showDropdown = false"
			type="text"
			:placeholder="placeholder"
			class="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-7"
		/>
		<!-- Clear button -->
		<button
			v-if="modelValue"
			@mousedown.prevent="clear"
			class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
		>
			<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
		</button>
		<!-- Dropdown -->
		<div
			v-if="showDropdown && (results.length || (allowCreate && query.trim()))"
			class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-40 overflow-auto"
		>
			<button
				v-for="item in results"
				:key="item.name"
				@mousedown.prevent="select(item.name, displayLabel(item))"
				class="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-200"
			>
				<span>{{ displayLabel(item) }}</span>
				<span v-if="displayField && item[displayField] !== item.name" class="text-gray-400 dark:text-gray-500 ml-1 text-xs">{{ item.name }}</span>
			</button>
			<!-- Create new option -->
			<button
				v-if="allowCreate && query.trim() && !results.some(r => displayLabel(r).toLowerCase() === query.trim().toLowerCase())"
				@mousedown.prevent="createNew"
				class="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-t border-gray-100 dark:border-gray-600 flex items-center gap-1"
			>
				<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
				Create "{{ query.trim() }}"
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { call } from '@/data/api'

const props = withDefaults(defineProps<{
	modelValue: string
	placeholder?: string
	searchMethod: string
	createMethod?: string
	allowCreate?: boolean
	displayField?: string
}>(), {
	placeholder: '',
	allowCreate: false,
})

const emit = defineEmits<{
	(e: 'update:modelValue', value: string): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const results = ref<Array<Record<string, any>>>([])
const showDropdown = ref(false)
const query = ref('')
const focused = ref(false)
// Map from name (value) to display label for showing friendly text
const labelCache = ref<Record<string, string>>({})

let searchTimeout: ReturnType<typeof setTimeout> | null = null

function displayLabel(item: Record<string, any>): string {
	if (props.displayField && item[props.displayField]) {
		return item[props.displayField]
	}
	return item.name
}

function getDisplayForValue(value: string): string {
	if (!value) return ''
	if (labelCache.value[value]) return labelCache.value[value]
	return value
}

// Sync from parent when input is NOT focused
watch(() => props.modelValue, (val) => {
	if (!focused.value) {
		query.value = getDisplayForValue(val || '')
	}
}, { immediate: true })

function onInput() {
	showDropdown.value = true
	if (searchTimeout) clearTimeout(searchTimeout)
	searchTimeout = setTimeout(async () => {
		try {
			results.value = await call(props.searchMethod, { query: query.value })
			// Cache display labels from results
			for (const item of results.value) {
				labelCache.value[item.name] = displayLabel(item)
			}
		} catch { results.value = [] }
	}, 150)
}

function onFocus() {
	focused.value = true
	showDropdown.value = true
	// Load initial results
	call(props.searchMethod, { query: '' }).then(r => {
		results.value = r || []
		for (const item of results.value) {
			labelCache.value[item.name] = displayLabel(item)
		}
		// If we have a value but query is showing the raw name, update to display label
		if (props.modelValue && query.value === props.modelValue && labelCache.value[props.modelValue]) {
			query.value = labelCache.value[props.modelValue]
		}
	}).catch(() => {})
}

function onBlur() {
	focused.value = false
	// Delay to allow mousedown on dropdown items
	setTimeout(() => {
		showDropdown.value = false
		const currentDisplay = getDisplayForValue(props.modelValue || '')
		if (query.value !== currentDisplay && query.value !== props.modelValue) {
			// Check if typed value matches an existing result exactly (by display label or name)
			const exact = results.value.find(r =>
				displayLabel(r).toLowerCase() === query.value.trim().toLowerCase() ||
				r.name.toLowerCase() === query.value.trim().toLowerCase()
			)
			if (exact) {
				select(exact.name, displayLabel(exact))
			} else if (!query.value.trim()) {
				emit('update:modelValue', '')
			} else {
				// Revert to the current saved value's display
				query.value = currentDisplay
			}
		}
	}, 200)
}

function select(name: string, label?: string) {
	if (label) labelCache.value[name] = label
	query.value = label || labelCache.value[name] || name
	showDropdown.value = false
	emit('update:modelValue', name)
}

function clear() {
	query.value = ''
	showDropdown.value = false
	emit('update:modelValue', '')
}

async function createNew() {
	if (!props.createMethod || !query.value.trim()) return
	try {
		const result = await call(props.createMethod, { type_name: query.value.trim() })
		if (result?.name) {
			select(result.name, query.value.trim())
		}
	} catch (e) {
		console.error('Failed to create:', e)
	}
}
</script>
