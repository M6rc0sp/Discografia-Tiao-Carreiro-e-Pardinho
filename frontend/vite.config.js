import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    // Proxy /sanctum and /api to backend so dev server appears same-origin
    proxy: {
      '/sanctum': {
        target: 'http://backend:8000',
        changeOrigin: true,
        secure: false
      },
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
