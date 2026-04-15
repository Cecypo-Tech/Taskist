<template>
	<Dialog
		:model-value="true"
		@update:model-value="(v) => { if (!v) $emit('close') }"
		:options="{ title: parentTask ? 'New Subtask' : 'New Task', size: 'md' }"
	>
		<template #body-content>
			<div class="space-y-3">
				<div v-if="createError" class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded px-3 py-2 text-xs text-red-700 dark:text-red-300">{{ createError }}</div>
				<div v-if="parentTask" class="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
					<FeatherIcon name="folder" class="w-3.5 h-3.5" />
					Subtask of: {{ parentTask }}
				</div>
				<input
					ref="input"
					v-model="subject"
					@keydown.enter="create"
					@keydown.escape="$emit('close')"
					type="text"
					:placeholder="parentTask ? 'Subtask name...' : 'What needs to be done?'"
					class="w-full text-base px-0 py-2 border-0 bg-transparent dark:text-gray-100 dark:placeholder-gray-400 focus:outline-none focus:ring-0"
					autofocus
				/>
				<PrioritySlider v-model="priority" />
				<div class="flex items-center gap-3 flex-wrap">
					<FrappeSelect
						v-model="status"
						:options="['Open', 'Working', 'Pending Review']"
					/>
					<DatetimePicker
						:model-value="dueDatetime"
						@update:model-value="(v: string) => dueDatetime = v"
						placeholder="Date & time"
						input-class="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 dark:text-gray-200"
					/>
				</div>
			</div>
		</template>
		<template #actions>
			<Button
				@click="create"
				:disabled="!subject.trim() || creating"
				:loading="creating"
				variant="solid"
				theme="blue"
				:label="creating ? 'Adding...' : 'Add Task'"
			/>
		</template>
	</Dialog>
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
