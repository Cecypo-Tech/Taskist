<template>
	<div class="space-y-3">
		<div class="flex items-center gap-2">
			<label class="relative inline-flex items-center cursor-pointer">
				<input type="checkbox" :checked="enabled" @change="toggleEnabled" class="sr-only peer" />
				<div class="w-9 h-5 bg-gray-200 dark:bg-gray-600 peer-checked:bg-blue-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
			</label>
			<span class="text-sm text-gray-700 dark:text-gray-300">Repeating task</span>
		</div>

		<div v-if="enabled" class="space-y-3 pl-1">
			<!-- Frequency -->
			<div class="flex items-center gap-2">
				<span class="text-sm text-gray-600 dark:text-gray-400">Repeat</span>
				<select v-model="rule.frequency" @change="emitRule" class="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 dark:text-gray-200">
					<option value="daily">Daily</option>
					<option value="weekly">Weekly</option>
					<option value="monthly">Monthly</option>
				</select>
			</div>

			<!-- Weekly: day picker -->
			<div v-if="rule.frequency === 'weekly'" class="flex gap-1">
				<button
					v-for="(dayLabel, dayIndex) in dayLabels"
					:key="dayIndex"
					@click="toggleDay(dayIndex)"
					class="w-8 h-8 rounded-full text-xs font-medium transition-colors"
					:class="rule.weekdays.includes(dayIndex)
						? 'bg-blue-600 text-white'
						: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'"
				>
					{{ dayLabel }}
				</button>
			</div>

			<!-- Monthly: day of month -->
			<div v-if="rule.frequency === 'monthly'" class="flex items-center gap-2">
				<span class="text-sm text-gray-600 dark:text-gray-400">On day</span>
				<select v-model.number="rule.monthDay" @change="emitRule" class="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 dark:text-gray-200">
					<option v-for="d in 31" :key="d" :value="d">{{ d }}</option>
				</select>
			</div>

			<!-- Time -->
			<div class="flex items-center gap-2">
				<span class="text-sm text-gray-600 dark:text-gray-400">At</span>
				<input v-model="rule.time" @change="emitRule" type="time" class="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 dark:text-gray-200" />
			</div>

			<!-- Summary -->
			<p class="text-xs text-gray-500 dark:text-gray-400 italic">{{ summary }}</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'

const props = defineProps<{
	modelValue: string  // JSON string or empty
	isRecurring: boolean
}>()

const emit = defineEmits<{
	(e: 'update:modelValue', value: string): void
	(e: 'update:isRecurring', value: boolean): void
}>()

const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const enabled = computed(() => props.isRecurring)

const rule = reactive({
	frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
	weekdays: [1] as number[],  // Monday default
	monthDay: 1,
	time: '09:00',
})

// Parse existing rule from modelValue
watch(() => props.modelValue, (val) => {
	if (!val) return
	try {
		const parsed = JSON.parse(val)
		if (parsed.frequency) rule.frequency = parsed.frequency
		if (parsed.weekdays) rule.weekdays = parsed.weekdays
		if (parsed.monthDay) rule.monthDay = parsed.monthDay
		if (parsed.time) rule.time = parsed.time
	} catch { /* ignore parse errors */ }
}, { immediate: true })

function toggleEnabled() {
	emit('update:isRecurring', !enabled.value)
	if (!enabled.value) {
		emitRule()
	}
}

function toggleDay(day: number) {
	const idx = rule.weekdays.indexOf(day)
	if (idx >= 0) {
		if (rule.weekdays.length > 1) rule.weekdays.splice(idx, 1)
	} else {
		rule.weekdays.push(day)
		rule.weekdays.sort()
	}
	emitRule()
}

function emitRule() {
	emit('update:modelValue', JSON.stringify({
		frequency: rule.frequency,
		weekdays: rule.weekdays,
		monthDay: rule.monthDay,
		time: rule.time,
	}))
}

const summary = computed(() => {
	const time = rule.time || '09:00'
	if (rule.frequency === 'daily') return `Every day at ${time}`
	if (rule.frequency === 'weekly') {
		const days = rule.weekdays.map(d => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d]).join(', ')
		return `Every ${days} at ${time}`
	}
	if (rule.frequency === 'monthly') {
		const suffix = rule.monthDay === 1 ? 'st' : rule.monthDay === 2 ? 'nd' : rule.monthDay === 3 ? 'rd' : 'th'
		return `Monthly on the ${rule.monthDay}${suffix} at ${time}`
	}
	return ''
})
</script>
