<template>
	<input
		ref="inputRef"
		type="text"
		readonly
		:placeholder="placeholder"
		:class="inputClass"
	/>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.min.css'

const props = withDefaults(defineProps<{
	modelValue: string
	placeholder?: string
	inputClass?: string
	enableTime?: boolean
}>(), {
	placeholder: '',
	inputClass: '',
	enableTime: true,
})

const emit = defineEmits<{
	(e: 'update:modelValue', value: string): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)
let fp: flatpickr.Instance | null = null

function toFrappeFormat(date: Date): string {
	const y = date.getFullYear()
	const m = String(date.getMonth() + 1).padStart(2, '0')
	const d = String(date.getDate()).padStart(2, '0')
	if (!props.enableTime) return `${y}-${m}-${d}`
	const h = String(date.getHours()).padStart(2, '0')
	const min = String(date.getMinutes()).padStart(2, '0')
	return `${y}-${m}-${d} ${h}:${min}:00`
}

function parseFrappeDate(val: string): string | undefined {
	if (!val) return undefined
	// "YYYY-MM-DD HH:mm:ss" or "YYYY-MM-DDTHH:mm" → "YYYY-MM-DD HH:mm"
	const clean = val.replace('T', ' ').substring(0, 16)
	return clean
}

onMounted(() => {
	if (!inputRef.value) return
	fp = flatpickr(inputRef.value, {
		enableTime: props.enableTime,
		noCalendar: false,
		dateFormat: props.enableTime ? 'Y-m-d H:i' : 'Y-m-d',
		time_24hr: true,
		defaultDate: parseFrappeDate(props.modelValue),
		allowInput: false,
		onChange(selectedDates) {
			if (selectedDates.length > 0) {
				emit('update:modelValue', toFrappeFormat(selectedDates[0]))
			} else {
				emit('update:modelValue', '')
			}
		},
	})
})

watch(() => props.modelValue, (newVal) => {
	if (!fp) return
	const parsed = parseFrappeDate(newVal)
	if (parsed) {
		fp.setDate(parsed, false)
	} else {
		fp.clear(false)
	}
})

onBeforeUnmount(() => {
	if (fp) {
		fp.destroy()
		fp = null
	}
})
</script>
