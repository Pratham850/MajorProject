import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        port: 5173,
        proxy: {
            '/auth': 'http://localhost:8000',
            '/users': 'http://localhost:8000',
            '/records': 'http://localhost:8000',
            '/consents': 'http://localhost:8000',
            '/access-requests': 'http://localhost:8000',
            '/research': 'http://localhost:8000',
            '/dashboard': 'http://localhost:8000',
            '/ml': 'http://localhost:8000',
            '/notifications': 'http://localhost:8000',
            '/audit-logs': 'http://localhost:8000',
            '/healthz': 'http://localhost:8000',
        },
    },
})
