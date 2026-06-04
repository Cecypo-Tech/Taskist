const CACHE_NAME = 'taskist-v2'
const APP_SHELL = ['/taskist']

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
	)
	self.skipWaiting()
})

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((keys) =>
			Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
		)
	)
	self.clients.claim()
})

self.addEventListener('fetch', (event) => {
	const { request } = event
	const url = new URL(request.url)

	// Network-first for API calls
	if (url.pathname.startsWith('/api/')) {
		event.respondWith(
			fetch(request).catch(() => caches.match(request))
		)
		return
	}

	// Cache-first for static assets
	if (url.pathname.match(/\.(js|css|png|jpg|svg|woff2?)$/)) {
		event.respondWith(
			caches.match(request).then((cached) => {
				if (cached) return cached
				return fetch(request).then((response) => {
					const clone = response.clone()
					caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
					return response
				})
			})
		)
		return
	}

	// Network-first for navigation
	event.respondWith(
		fetch(request).catch(() => caches.match('/taskist'))
	)
})

self.addEventListener('push', (event) => {
	let payload = {}
	try {
		payload = event.data ? event.data.json() : {}
	} catch {
		payload = { body: event.data ? event.data.text() : '' }
	}

	const title = payload.title || 'Taskist'
	const options = {
		body: payload.body || '',
		icon: '/assets/taskist/frontend/icons/icon-192.png',
		badge: '/assets/taskist/frontend/icons/icon-192.png',
		tag: payload.tag || 'taskist',
		data: {
			url: payload.url || '/taskist',
			...(payload.data || {}),
		},
	}

	event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
	event.notification.close()
	const targetUrl = event.notification.data?.url || '/taskist'

	event.waitUntil(
		self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
			for (const client of clients) {
				if ('focus' in client && client.url.includes('/taskist')) {
					client.navigate(targetUrl)
					return client.focus()
				}
			}
			return self.clients.openWindow(targetUrl)
		})
	)
})
