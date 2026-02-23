<template>
	<div class="fixed inset-0 bg-black/30 dark:bg-black/50 z-50 flex items-start justify-center pt-[20vh]" @click.self="$emit('close')">
		<div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4">
			<div class="p-4">
				<div v-if="createError" class="mb-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded px-3 py-2 text-xs text-red-700 dark:text-red-300">{{ createError }}</div>
				<div v-if="parentTask" class="flex items-center gap-1.5 mb-2 text-xs text-blue-600 dark:text-blue-400">
					<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" /></svg>
					Subtask of: {{ parentTask }}
				</div>
				<input
					ref="input"
					v-model="subject"
					@keydown.enter="create"
					@keydown.escape="$emit('close')"
					type="text"
					:placeholder="parentTask ? 'Subtask name...' : 'What needs to be done?'"
					class="w-full text-lg px-0 py-2 border-0 bg-transparent dark:text-gray-100 dark:placeholder-gray-400 focus:outline-none focus:ring-0"
					autofocus
				/>
				<div class="mt-3">
					<PrioritySlider v-model="priority" />
				</div>
				<div class="flex items-center gap-3 mt-3 flex-wrap">
					<select v-model="status" class="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 dark:text-gray-200">
						<option value="Open">Open</option>
						<option value="Working">Working</option>
						<option value="Pending Review">Pending Review</option>
					</select>
					<DatetimePicker
						:model-value="dueDatetime"
						@update:model-value="(v: string) => dueDatetime = v"
						placeholder="Date & time"
						input-class="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 dark:text-gray-200"
					/>
					<div class="flex-1"></div>
					<button @click="create" :disabled="!subject.trim() || creating" class="btn-primary disabled:opacity-50">
						{{ creating ? 'Adding...' : 'Add Task' }}
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import PrioritySlider from '@/components/common/PrioritySlider.vue'
import DatetimePicker from '@/components/common/DatetimePicker.vue'

const props = defineProps<{ prefillDate?: string; parentTask?: string }>()
const emit = defineEmits(['close'])
const taskStore = useTaskStore()

const input = ref<HTMLInputElement | null>(null)
const subject = ref('')
const priority = ref('Medium')
const status = ref('Open')

// prefillDate comes as "YYYY-MM-DD" or "YYYY-MM-DD HH:mm:ss"
const dueDatetime = ref(props.prefillDate || '')
const creating = ref(false)
const createError = ref('')

async function create() {
	if (!subject.value.trim() || creating.value) return
	creating.value = true
	try {
		let exp_start_date: string | undefined
		let exp_end_date: string | undefined

		if (dueDatetime.value) {
			const dt = dueDatetime.value
			const hasTime = dt.length > 10
			if (hasTime) {
				exp_start_date = dt
				// Compute end = start + 1 hour
				const timePart = dt.substring(11, 16)
				const startHour = parseInt(timePart.split(':')[0], 10)
				const startMin = timePart.split(':')[1] || '00'
				const endHour = String(Math.min(startHour + 1, 23)).padStart(2, '0')
				exp_end_date = `${dt.substring(0, 10)} ${endHour}:${startMin}:00`
			} else {
				exp_end_date = dt.substring(0, 10)
			}
		}

		await taskStore.quickCreate({
			subject: subject.value.trim(),
			priority: priority.value,
			status: status.value,
			exp_start_date,
			exp_end_date,
			parent_task: props.parentTask || undefined,
		})
		emit('close')
	} catch (e: any) {
		createError.value = e?.message || 'Failed to create task'
		console.error('Task creation failed:', e)
	} finally {
		creating.value = false
	}
}

onMounted(() => input.value?.focus())
</script>
