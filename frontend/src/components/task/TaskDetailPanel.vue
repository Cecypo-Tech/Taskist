<template>
	<transition name="slide">
		<div
			v-if="taskStore.showDetail && taskStore.selectedTask"
			class="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl z-40 flex flex-col"
		>
			<div class="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-gray-700">
				<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">Task Details</h2>
				<div class="flex items-center gap-2">
					<button
						@click="markCompleted"
						class="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
						:class="isCompleted ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-400'"
					>
						{{ isCompleted ? 'Completed' : 'Mark Completed' }}
					</button>
					<button
						@click="taskStore.closeDetail()"
						class="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
					>
						Close
					</button>
				</div>
			</div>

			<div v-if="doc" class="flex-1 overflow-auto px-3 sm:px-4 py-3 space-y-3">
			<!-- Save error banner -->
			<div v-if="saveError" class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded px-3 py-2 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
				<svg class="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
				<div class="flex-1 whitespace-pre-line">{{ saveError }}</div>
				<button @click="saveError = ''" class="text-red-400 hover:text-red-600 flex-shrink-0">
					<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
				</button>
			</div>

				<!-- Subject -->
				<input v-model="doc.subject" @blur="save" class="w-full text-sm font-medium border border-gray-200 dark:border-gray-600 rounded px-2.5 py-1.5 bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />

				<!-- Status + Priority row -->
				<div class="grid grid-cols-2 gap-2">
					<div>
						<label class="block text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-0.5">Status</label>
						<select v-model="doc.status" @change="save" class="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-xs bg-white dark:bg-gray-700 dark:text-gray-200">
							<option>Open</option><option>Working</option><option>Pending Review</option><option>Overdue</option><option>Completed</option><option>Cancelled</option>
						</select>
					</div>
					<div>
						<label class="block text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-0.5">Priority</label>
						<PrioritySlider v-model="doc.priority" @update:modelValue="save" />
					</div>
				</div>

				<!-- Type + Project row -->
				<div class="grid grid-cols-2 gap-2">
					<div>
						<label class="block text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-0.5">Type</label>
						<LinkField
							:model-value="doc.type || ''"
							@update:model-value="(v: string) => { doc.type = v; save() }"
							placeholder="Bug, Feature..."
							search-method="taskist.api.search_task_types"
							create-method="taskist.api.create_task_type"
							:allow-create="true"
						/>
					</div>
					<div>
						<label class="block text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-0.5">Project</label>
						<LinkField
							:model-value="doc.project || ''"
							@update:model-value="(v: string) => { doc.project = v; save() }"
							placeholder="Select project..."
							search-method="taskist.api.search_projects"
						/>
					</div>
				</div>

				<!-- Dates row -->
				<div class="grid grid-cols-2 gap-2">
					<div>
						<label class="block text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-0.5">Start</label>
						<input v-model="doc.exp_start_date" @change="debouncedSave" type="date" class="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-xs bg-white dark:bg-gray-700 dark:text-gray-200" />
					</div>
					<div>
						<label class="block text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-0.5">End</label>
						<input v-model="doc.exp_end_date" @change="debouncedSave" type="date" class="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-xs bg-white dark:bg-gray-700 dark:text-gray-200" />
					</div>
				</div>

				<!-- Hours + Progress row -->
				<div class="grid grid-cols-3 gap-2">
					<div>
						<label class="block text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-0.5">Est. Hrs</label>
						<input v-model.number="doc.expected_time" @change="save" type="number" min="0" step="0.5" class="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-xs bg-white dark:bg-gray-700 dark:text-gray-200" />
					</div>
					<div>
						<label class="block text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-0.5">Actual</label>
						<input :value="doc.actual_time || 0" disabled class="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-xs bg-gray-50 dark:bg-gray-700/50 dark:text-gray-400 cursor-not-allowed" />
					</div>
					<div>
						<label class="block text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-0.5">{{ doc.progress || 0 }}%</label>
						<input v-model.number="doc.progress" @change="save" type="range" min="0" max="100" step="10" class="w-full mt-1" />
					</div>
				</div>

				<!-- Color, Flags & Recurrence inline -->
				<div class="flex items-center gap-3 flex-wrap">
					<div class="flex items-center gap-1.5">
						<input v-model="doc.color" @change="save" type="color" class="w-5 h-5 rounded border border-gray-200 dark:border-gray-600 cursor-pointer bg-transparent" />
						<button v-if="doc.color" @click="doc.color = ''; save()" class="text-[10px] text-gray-400 hover:text-red-500">clear</button>
					</div>
					<label class="flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-300 cursor-pointer">
						<input type="checkbox" :checked="doc.is_milestone" @change="doc.is_milestone = ($event.target as HTMLInputElement).checked ? 1 : 0; save()" class="rounded border-gray-300 dark:border-gray-600 w-3 h-3" />
						Milestone
					</label>
					<label class="flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-300 cursor-pointer">
						<input type="checkbox" :checked="doc.is_group" @change="doc.is_group = ($event.target as HTMLInputElement).checked ? 1 : 0; save()" class="rounded border-gray-300 dark:border-gray-600 w-3 h-3" />
						Group
					</label>
				</div>

				<!-- Recurrence -->
				<RecurrenceEditor
					:model-value="doc.taskist_recurrence_rule || ''"
					:is-recurring="!!doc.taskist_is_recurring"
					@update:model-value="(v: string) => { doc.taskist_recurrence_rule = v; save() }"
					@update:is-recurring="(v: boolean) => { doc.taskist_is_recurring = v ? 1 : 0; save() }"
				/>

				<!-- Description -->
				<div>
					<label class="block text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-0.5">Description</label>
					<textarea v-model="doc.description" @blur="save" rows="2" class="w-full border border-gray-200 dark:border-gray-600 rounded px-2.5 py-1.5 text-xs bg-white dark:bg-gray-700 dark:text-gray-200 resize-y" placeholder="Add a description..."></textarea>
				</div>

				<!-- Assignees -->
				<div>
					<label class="block text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1">
						Assigned To
						<button @click="assignToMe" class="ml-1 text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 hover:underline">(assign to me)</button>
					</label>
					<div v-if="assignees.length" class="flex flex-wrap gap-1 mb-1.5">
						<div
							v-for="assignee in assignees"
							:key="assignee.email"
							class="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full pl-2 pr-0.5 py-0.5 text-[11px]"
						>
							<span>{{ assignee.full_name }}</span>
							<button @click="removeAssignee(assignee.email)" class="p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800">
								<svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
							</button>
						</div>
					</div>
					<div class="relative">
						<input
							v-model="userSearch"
							@input="searchUsers"
							@focus="showUserDropdown = true"
							type="text"
							placeholder="Search users..."
							class="w-full border border-gray-200 dark:border-gray-600 rounded px-2.5 py-1 text-xs bg-white dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
						/>
						<div
							v-if="showUserDropdown && userResults.length"
							class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-32 overflow-auto"
						>
							<button
								v-for="user in userResults"
								:key="user.name"
								@mousedown.prevent="addAssignee(user.name)"
								class="w-full text-left px-2.5 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-200 flex items-center gap-2"
							>
								<div class="w-5 h-5 rounded-full bg-blue-500 text-white text-[9px] flex items-center justify-center flex-shrink-0">
									{{ (user.full_name || user.name).charAt(0).toUpperCase() }}
								</div>
								<div class="truncate">
									<span class="font-medium">{{ user.full_name || user.name }}</span>
									<span v-if="user.full_name" class="text-gray-400 dark:text-gray-500 ml-1">{{ user.name }}</span>
								</div>
							</button>
						</div>
					</div>
				</div>

				<!-- Attachments -->
				<TaskAttachments v-if="doc.name" :task-name="doc.name" />

				<!-- Subtasks -->
				<div>
					<div class="flex items-center justify-between mb-1">
						<h3 class="text-[11px] font-medium text-gray-400 dark:text-gray-500">Subtasks</h3>
						<button @click="showSubtaskAdd = true" class="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400" title="Add subtask">
							<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
							</svg>
						</button>
					</div>
					<div v-if="showSubtaskAdd" class="mb-1.5 flex gap-1.5">
						<input
							ref="subtaskInput"
							v-model="subtaskSubject"
							@keydown.enter="createSubtask"
							@keydown.escape="showSubtaskAdd = false"
							type="text"
							placeholder="Subtask name..."
							class="flex-1 border border-gray-200 dark:border-gray-600 rounded px-2.5 py-1 text-xs bg-white dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
						<button @click="createSubtask" :disabled="!subtaskSubject.trim()" class="btn-primary text-[11px] px-2 py-1 disabled:opacity-50">Add</button>
					</div>
					<div v-if="childTasks.length" class="space-y-0.5">
						<div
							v-for="child in childTasks"
							:key="child.name"
							@click="taskStore.selectTask(child)"
							class="flex items-center gap-1.5 px-1.5 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer text-xs"
						>
							<div class="w-1.5 h-1.5 rounded-full flex-shrink-0" :class="childPriorityColor(child.priority)"></div>
							<svg v-if="child.is_group" class="w-3 h-3 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
								<path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
							</svg>
							<span class="truncate" :class="child.status === 'Completed' ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'">{{ child.subject }}</span>
							<svg v-if="child.status === 'Completed'" class="w-3 h-3 text-green-500 ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
						</div>
					</div>
					<div v-else-if="!showSubtaskAdd" class="text-[11px] text-gray-400 dark:text-gray-500">No subtasks</div>
				</div>

				<!-- Comments -->
				<div>
					<h3 class="text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1">Comments</h3>
					<div class="space-y-2">
						<div v-for="comment in comments" :key="comment.name" class="bg-gray-50 dark:bg-gray-700/50 rounded p-2">
							<div class="flex items-center gap-1.5 mb-0.5">
								<span class="text-[11px] font-medium text-gray-700 dark:text-gray-300">{{ comment.comment_by }}</span>
								<span class="text-[10px] text-gray-400">{{ formatTime(comment.creation) }}</span>
							</div>
							<div class="text-xs text-gray-600 dark:text-gray-300" v-html="comment.content"></div>
						</div>
					</div>
					<div class="mt-2 flex gap-1.5">
						<input v-model="newComment" @keydown.enter="addComment" type="text" placeholder="Add a comment..." class="flex-1 border border-gray-200 dark:border-gray-600 rounded px-2.5 py-1 text-xs bg-white dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400" />
						<button @click="addComment" class="btn-primary text-[11px] px-2 py-1" :disabled="!newComment.trim()">Send</button>
					</div>
				</div>
			</div>

			<div v-else class="flex-1 flex items-center justify-center">
				<div class="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
			</div>
		</div>
	</transition>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { getDoc, saveDoc, getList, call } from '@/data/api'
import PrioritySlider from '@/components/common/PrioritySlider.vue'
import RecurrenceEditor from '@/components/common/RecurrenceEditor.vue'
import LinkField from '@/components/common/LinkField.vue'
import TaskAttachments from '@/components/task/TaskAttachments.vue'
import dayjs from 'dayjs'

const taskStore = useTaskStore()
const doc = ref<any>(null)
const saveError = ref('')
const comments = ref<any[]>([])
const newComment = ref('')
const assignees = ref<Array<{ email: string; full_name: string }>>([])
const userSearch = ref('')
const userResults = ref<Array<{ name: string; full_name: string }>>([])
const showUserDropdown = ref(false)
const childTasks = ref<any[]>([])
const showSubtaskAdd = ref(false)
const subtaskSubject = ref('')
const subtaskInput = ref<HTMLInputElement | null>(null)

const isCompleted = computed(() => doc.value && doc.value.status === 'Completed')

function normalizeDate(dt: any): string {
	// Convert Datetime "2026-02-21 00:00:00" to "2026-02-21" for date inputs
	if (!dt) return ''
	const s = String(dt)
	return s.length >= 10 ? s.substring(0, 10) : s
}

watch(() => taskStore.selectedTask, async (task) => {
	if (!task) { doc.value = null; return }
	try {
		doc.value = await getDoc('Task', task.name)
		// Normalize Datetime fields to date-only strings for HTML date inputs
		if (doc.value) {
			doc.value.exp_start_date = normalizeDate(doc.value.exp_start_date)
			doc.value.exp_end_date = normalizeDate(doc.value.exp_end_date)
		}
		await Promise.all([loadComments(), loadAssignees(), loadChildTasks()])
	} catch (e) {
		console.error('Failed to load task:', e)
	}
}, { immediate: true })

let saveTimeout: ReturnType<typeof setTimeout> | null = null

function debouncedSave() {
	if (saveTimeout) clearTimeout(saveTimeout)
	saveTimeout = setTimeout(save, 300)
}

async function save() {
	if (!doc.value) return
	saveError.value = ''
	try {
		const saved = await saveDoc(doc.value)
		// Merge server response without replacing the reactive object
		// This prevents date inputs from blanking out mid-edit
		if (saved && doc.value) {
			Object.assign(doc.value, {
				modified: saved.modified,
				docstatus: saved.docstatus,
				_assign: saved._assign,
			})
		}
		taskStore.fetchTasks()
	} catch (e: any) {
		const msg = e?.message || 'Failed to save'
		saveError.value = msg
		console.error('Failed to save:', msg)
		// Reload document from server to revert invalid local changes
		if (doc.value?.name) {
			try {
				const fresh = await getDoc('Task', doc.value.name)
				if (fresh) {
					fresh.exp_start_date = normalizeDate(fresh.exp_start_date)
					fresh.exp_end_date = normalizeDate(fresh.exp_end_date)
					doc.value = fresh
				}
			} catch { /* keep current state if reload also fails */ }
		}
	}
}

async function loadComments() {
	if (!doc.value) return
	try {
		comments.value = await getList('Comment', {
			filters: { reference_doctype: 'Task', reference_name: doc.value.name, comment_type: 'Comment' },
			fields: ['name', 'content', 'comment_by', 'creation'],
			order_by: 'creation asc',
			limit_page_length: 50,
		})
	} catch { comments.value = [] }
}

async function addComment() {
	if (!newComment.value.trim() || !doc.value) return
	try {
		await call('frappe.client.insert', {
			doc: { doctype: 'Comment', comment_type: 'Comment', reference_doctype: 'Task', reference_name: doc.value.name, content: newComment.value.trim() }
		})
		newComment.value = ''
		await loadComments()
	} catch (e) {
		console.error('Failed to add comment:', e)
	}
}

async function loadAssignees() {
	if (!doc.value) return
	try {
		const assignStr = doc.value._assign
		if (!assignStr) { assignees.value = []; return }
		const emails = JSON.parse(assignStr)
		assignees.value = emails.map((email: string) => ({ email, full_name: email.split('@')[0] }))
		// Enrich with full names
		for (const a of assignees.value) {
			try {
				const user = await getDoc('User', a.email)
				if (user?.full_name) a.full_name = user.full_name
			} catch { /* keep email as fallback */ }
		}
	} catch { assignees.value = [] }
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null

function searchUsers() {
	showUserDropdown.value = true
	if (searchTimeout) clearTimeout(searchTimeout)
	searchTimeout = setTimeout(async () => {
		if (!userSearch.value.trim()) { userResults.value = []; return }
		try {
			userResults.value = await call('taskist.api.search_users', { query: userSearch.value })
		} catch { userResults.value = [] }
	}, 200)
}

async function assignToMe() {
	if (!doc.value) return
	try {
		const user = await call('frappe.auth.get_logged_user')
		if (user && !assignees.value.some(a => a.email === user)) {
			await addAssignee(user)
		}
	} catch (e) {
		console.error('Failed to get current user:', e)
	}
}

async function addAssignee(email: string) {
	if (!doc.value) return
	showUserDropdown.value = false
	userSearch.value = ''
	userResults.value = []
	try {
		const result = await call('taskist.api.assign_task', { task_name: doc.value.name, user: email })
		assignees.value = result || []
		taskStore.fetchTasks()
	} catch (e) {
		console.error('Failed to assign:', e)
	}
}

async function removeAssignee(email: string) {
	if (!doc.value) return
	try {
		const result = await call('taskist.api.unassign_task', { task_name: doc.value.name, user: email })
		assignees.value = result || []
		taskStore.fetchTasks()
	} catch (e) {
		console.error('Failed to unassign:', e)
	}
}

async function markCompleted() {
	if (!doc.value) return
	doc.value.status = isCompleted.value ? 'Open' : 'Completed'
	await save()
}

async function loadChildTasks() {
	if (!doc.value) { childTasks.value = []; return }
	try {
		childTasks.value = await call('taskist.api.get_child_tasks', { parent_task: doc.value.name })
	} catch { childTasks.value = [] }
}

async function createSubtask() {
	if (!subtaskSubject.value.trim() || !doc.value) return
	try {
		await taskStore.quickCreate({
			subject: subtaskSubject.value.trim(),
			parent_task: doc.value.name,
			project: doc.value.project || undefined,
			priority: 'Medium',
		})
		subtaskSubject.value = ''
		showSubtaskAdd.value = false
		await loadChildTasks()
	} catch (e) {
		console.error('Failed to create subtask:', e)
	}
}

function childPriorityColor(priority: string) {
	const colors: Record<string, string> = { High: 'bg-orange-500', Medium: 'bg-yellow-500', Low: 'bg-green-500' }
	return colors[priority] || 'bg-gray-400'
}

function formatTime(dt: string) {
	return dayjs(dt).format('MMM D, h:mm A')
}
</script>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: transform 0.2s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }
</style>
