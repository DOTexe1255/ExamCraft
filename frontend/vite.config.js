import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // Allow proxy from Nginx (any host)
    hmr: {
      host: 'localhost'
      // host: 'explicitly-full-crawdad.ngrok-free.app'  // Fix HMR with proxy
    }
  }
})
