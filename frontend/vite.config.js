import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    strictPort: true,
    port: 1116
  },
  plugins: [react()],
})
