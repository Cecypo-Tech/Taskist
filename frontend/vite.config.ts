import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import frappeuiPlugin from 'frappe-ui/vite'

export default defineConfig({
	plugins: [
		...frappeuiPlugin({
			lucideIcons: true,
			frappeProxy: false,
			frappeTypes: false,
			jinjaBootData: false,
			buildConfig: false,
		}),
		vue(),
	],
	server: {
		port: 8080,
		host: '0.0.0.0',
		proxy: {
			'^/(app|api|assets|files|private)': {
				target: 'http://site16.local:8002',
				ws: true,
			},
		},
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
		},
	},
	base: '/assets/taskist/frontend/',
	build: {
		outDir: path.resolve(__dirname, '..', 'taskist', 'public', 'frontend'),
		emptyOutDir: true,
		target: 'es2015',
	},
})
