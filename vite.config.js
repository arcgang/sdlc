import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/cart': 'http://localhost:3001',
      '/products': 'http://localhost:3001',
      '/stores': 'http://localhost:3001',
    },
  },
})
