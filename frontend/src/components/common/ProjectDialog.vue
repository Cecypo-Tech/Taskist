<template>
	<Dialog
		:model-value="true"
		@update:model-value="(v) => { if (!v) $emit('close') }"
		:options="{ title: 'New Project', size: 'lg' }"
	>
		<template #body-content>
			<div class="space-y-4 max-h-[60vh] overflow-auto pr-1">
				<div v-if="createError" class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
					<FeatherIcon name="alert-circle" class="w-4 h-4 mt-0.5 flex-shrink-0" />
					<div class="flex-1 whitespace-pre-line">{{ createError }}</div>
					<button @click="createError = ''" class="text-red-400 hover:text-red-600 flex-shrink-0">
						<FeatherIcon name="x" class="w-4 h-4" />
					</button>
				</div>
				<div>
					<label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Project Name <span class="text-red-500">*</span></label>
					<TextInput
						ref="nameInput"
						v-model="form.project_name"
						@keydown.escape="$emit('close')"
						placeholder="Enter project name..."
						class="w-full"
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
					<FrappeTextarea v-model="form.notes" :rows="3" placeholder="Project notes..." />
				</div>

				<!-- Users -->
				<div>
					<label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Team Members</label>
					<div class="flex flex-wrap gap-2 mb-2">
						<div
							v-for="(user, i) in form.users"
							:key="i"
							class="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full pl-1 pr-1 py-1 text-xs"
						>
							<Avatar :label="user.full_name || user.user" size="xs" />
							<span class="px-1">{{ user.full_name || user.user }}</span>
							<button @click="removeUser(i)" class="p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800">
								<FeatherIcon name="x" class="w-3 h-3" />
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
								<Avatar :label="user.full_name || user.name" size="xs" />
								<div class="truncate">
									<span class="font-medium">{{ user.full_name || user.name }}</span>
									<span v-if="user.full_name" class="text-gray-400 dark:text-gray-500 ml-1">{{ user.name }}</span>
								</div>
							</button>
						</div>
					</div>
				</div>
			</div>
		</template>
		<template #actions>
			<Button @click="$emit('close')" variant="subtle" label="Cancel" />
			<Button
				@click="createProject"
				:disabled="!form.project_name.trim() || creating"
				:loading="creating"
				variant="solid"
				theme="blue"
				:label="creating ? 'Creating...' : 'Create Project'"
			/>
		</template>
	</Dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { call } from '@/data/api'
import PrioritySlider from '@/components/common/PrioritySlider.vue'
import LinkField from '@/components/common/LinkField.vue'

const emit = defineEmits(['close', 'created'])

const nameInput = ref<any>(null)
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

onMounted(() => nextTick(() => nameInput.value?.focus?.()))
</script>
