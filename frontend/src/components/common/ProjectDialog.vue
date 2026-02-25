<template>
	<div class="fixed inset-0 bg-black/30 dark:bg-black/50 z-50 flex items-start justify-center pt-[15vh]" @click.self="$emit('close')">
		<div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4">
			<div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
				<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">New Project</h2>
				<button @click="$emit('close')" class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
					<svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<div class="p-6 space-y-4 max-h-[60vh] overflow-auto">
				<div v-if="createError" class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
					<svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
					<div class="flex-1 whitespace-pre-line">{{ createError }}</div>
					<button @click="createError = ''" class="text-red-400 hover:text-red-600 flex-shrink-0">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
					</button>
				</div>
				<div>
					<label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Project Name <span class="text-red-500">*</span></label>
					<input
						ref="nameInput"
						v-model="form.project_name"
						@keydown.escape="$emit('close')"
						type="text"
						placeholder="Enter project name..."
						class="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Project Template</label>
						<LinkField
							:model-value="form.project_template"
							@update:model-value="(v: string) => form.project_template = v"
							placeholder="Select template..."
							search-method="taskist.api.search_project_templates"
						/>
					</div>
					<div>
						<label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Project Type</label>
						<LinkField
							:model-value="form.project_type"
							@update:model-value="(v: string) => form.project_type = v"
							placeholder="e.g. Internal, External..."
							search-method="taskist.api.search_project_types"
							create-method="taskist.api.create_project_type"
							:allow-create="true"
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Expected Start Date</label>
						<input
							v-model="form.expected_start_date"
							type="date"
							class="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<div>
						<label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Expected End Date</label>
						<input
							v-model="form.expected_end_date"
							type="date"
							class="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Priority</label>
						<PrioritySlider v-model="form.priority" />
					</div>
					<div>
						<label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Customer</label>
						<LinkField
							:model-value="form.customer"
							@update:model-value="(v: string) => form.customer = v"
							placeholder="Search customers..."
							search-method="taskist.api.search_customers"
							display-field="customer_name"
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Company <span class="text-red-500">*</span></label>
						<LinkField
							:model-value="form.company"
							@update:model-value="(v: string) => form.company = v"
							placeholder="Select company..."
							search-method="taskist.api.search_companies"
						/>
					</div>
				</div>

				<div>
					<label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Notes</label>
					<textarea
						v-model="form.notes"
						rows="3"
						placeholder="Project notes..."
						class="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
					></textarea>
				</div>

				<!-- Users -->
				<div>
					<label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Team Members</label>
					<div class="flex flex-wrap gap-2 mb-2">
						<div
							v-for="(user, i) in form.users"
							:key="i"
							class="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full pl-2 pr-1 py-1 text-xs"
						>
							<span>{{ user.full_name || user.user }}</span>
							<button @click="removeUser(i)" class="p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800">
								<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
							</button>
						</div>
					</div>
					<div class="relative">
						<input
							v-model="userSearch"
							@input="searchUsers"
							@focus="showUserDropdown = true"
							type="text"
							placeholder="Search users to add..."
							class="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
						<div
							v-if="showUserDropdown && userResults.length"
							class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-40 overflow-auto"
						>
							<button
								v-for="user in userResults"
								:key="user.name"
								@mousedown.prevent="addUser(user)"
								class="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-200 flex items-center gap-2"
							>
								<div class="w-6 h-6 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center flex-shrink-0">
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
			</div>

			<div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
				<button @click="$emit('close')" class="px-4 py-2 text-sm rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
					Cancel
				</button>
				<button @click="createProject" :disabled="!form.project_name.trim() || creating" class="btn-primary disabled:opacity-50">
					{{ creating ? 'Creating...' : 'Create Project' }}
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { call } from '@/data/api'
import PrioritySlider from '@/components/common/PrioritySlider.vue'
import LinkField from '@/components/common/LinkField.vue'

const emit = defineEmits(['close', 'created'])

const nameInput = ref<HTMLInputElement | null>(null)
const creating = ref(false)
const userSearch = ref('')
const userResults = ref<Array<{ name: string; full_name: string }>>([])
const showUserDropdown = ref(false)

const createError = ref('')

const form = ref({
	project_name: '',
	priority: 'Medium',
	project_type: '',
	project_template: '',
	expected_start_date: '',
	expected_end_date: '',
	company: '',
	customer: '',
	notes: '',
	users: [] as Array<{ user: string; full_name: string }>,
})

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

function addUser(user: { name: string; full_name: string }) {
	if (!form.value.users.some(u => u.user === user.name)) {
		form.value.users.push({ user: user.name, full_name: user.full_name || user.name })
	}
	userSearch.value = ''
	userResults.value = []
	showUserDropdown.value = false
}

function removeUser(index: number) {
	form.value.users.splice(index, 1)
}

async function createProject() {
	if (!form.value.project_name.trim() || creating.value) return
	createError.value = ''
	creating.value = true
	try {
		const doc: Record<string, any> = {
			doctype: 'Project',
			project_name: form.value.project_name.trim(),
			priority: form.value.priority,
			status: 'Open',
		}
		if (form.value.company) doc.company = form.value.company
		if (form.value.customer) doc.customer = form.value.customer
		if (form.value.project_type) doc.project_type = form.value.project_type
		if (form.value.project_template) doc.project_template = form.value.project_template
		if (form.value.expected_start_date) doc.expected_start_date = form.value.expected_start_date
		if (form.value.expected_end_date) doc.expected_end_date = form.value.expected_end_date
		if (form.value.notes) doc.notes = form.value.notes
		if (form.value.users.length) {
			doc.users = form.value.users.map(u => ({ user: u.user }))
		}
		await call('frappe.client.insert', { doc })
		emit('created')
		emit('close')
	} catch (e: any) {
		createError.value = e?.message || 'Failed to create project'
	} finally {
		creating.value = false
	}
}

onMounted(() => nextTick(() => nameInput.value?.focus()))
</script>
