import { createRouter, createWebHistory } from 'vue-router'

const routes = [
	{
		path: '/',
		redirect: '/kanban',
	},
	{
		path: '/kanban',
		name: 'Kanban',
		component: () => import('@/views/KanbanView.vue'),
	},
	{
		path: '/list',
		name: 'List',
		component: () => import('@/views/ListView.vue'),
	},
	{
		path: '/calendar',
		name: 'Calendar',
		component: () => import('@/views/CalendarView.vue'),
	},
	{
		path: '/summary',
		name: 'Summary',
		component: () => import('@/views/DailySummary.vue'),
	},
]

const router = createRouter({
	history: createWebHistory('/taskist'),
	routes,
})

export default router
