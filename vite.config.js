import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/': {
        target: 'https://41f1-62-122-1-185.ngrok-free.app',
        changeOrigin: true,
        secure: false,
        headers: {
          'ngrok-skip-browser-warning': 6024,
          'User-Agent': 'MyCustomBrowser/1.0'
        },
      },
    },
  },
})
