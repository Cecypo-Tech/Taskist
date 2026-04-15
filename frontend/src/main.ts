import 'frappe-ui/style.css'
import './index.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import {
	Button,
	FeatherIcon,
	Avatar,
	Badge,
	Dialog,
	TextInput,
	Select,
	Textarea,
	Checkbox,
	Progress,
	Tooltip,
	LoadingIndicator,
} from 'frappe-ui'

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)

// Register FrappeUI components globally
app.component('Button', Button)
app.component('FeatherIcon', FeatherIcon)
app.component('Avatar', Avatar)
app.component('Badge', Badge)
app.component('Dialog', Dialog)
app.component('TextInput', TextInput)
app.component('FrappeSelect', Select)
app.component('FrappeTextarea', Textarea)
app.component('FrappeCheckbox', Checkbox)
app.component('FrappeProgress', Progress)
app.component('Tooltip', Tooltip)
app.component('LoadingIndicator', LoadingIndicator)

app.mount('#app')

// Register service worker via API endpoint (provides Service-Worker-Allowed header)
if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker
			.register('/api/method/taskist.pwa.service_worker', { scope: '/taskist' })
			.catch((err) => {
				console.warn('[PWA] Service worker registration failed:', err)
			})
	})
}
