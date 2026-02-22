<template>
	<div class="fixed inset-0 bg-black/30 dark:bg-black/50 z-50 flex items-start justify-center pt-[20vh]" @click.self="$emit('close')">
		<div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4">
			<div class="p-4">
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
				<div class="flex items-center gap-3 mt-3">
					<select v-model="status" class="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 dark:text-gray-200">
						<option value="Open">Open</option>
						<option value="Working">Working</option>
						<option value="Pending Review">Pending Review</option>
					</select>
					<input v-model="dueDate" type="date" class="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 dark:text-gray-200" />
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

const props = defineProps<{ prefillDate?: string; parentTask?: string }>()
const emit = defineEmits(['close'])
const taskStore = useTaskStore()

const input = ref<HTMLInputElement | null>(null)
const subject = ref('')
const priority = ref('Medium')
const status = ref('Open')
const dueDate = ref(props.prefillDate || '')
const creating = ref(false)

async function create() {
	if (!subject.value.trim() || creating.value) return
	creating.value = true
	try {
		await taskStore.quickCreate({
			subject: subject.value.trim(),
			priority: priority.value,
			status: status.value,
			exp_end_date: dueDate.value || undefined,
			parent_task: props.parentTask || undefined,
		})
		emit('close')
	} finally {
		creating.value = false
	}
}

onMounted(() => input.value?.focus())
</script>
