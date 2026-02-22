import './index.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)
app.mount('#app')

// Register service worker via API endpoint (provides Service-Worker-Allowed header)
if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker
			.register('/api/method/taskist.pwa.service_worker', { scope: '/taskist' })
			.catch(() => {
				// SW registration failed, app works fine without it
			})
	})
}
