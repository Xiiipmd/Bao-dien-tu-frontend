import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'

const cacheDir = path.resolve(process.env.TEMP ?? __dirname, 'tmdt-frontend-vite-cache')

export default defineConfig({
  cacheDir,
  plugins: [
    vue(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:8082',
        changeOrigin: true,
      },
    },
  },
})
