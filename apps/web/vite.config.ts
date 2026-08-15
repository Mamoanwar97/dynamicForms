import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Railway injects PORT/HOST on process.env at runtime
  const port = Number(process.env.PORT || env.PORT || env.VITE_PORT || 5173)
  const host = process.env.HOST || env.HOST || env.VITE_HOST || true

  return {
    plugins: [react()],
    server: {
      host,
      port,
      strictPort: true,
    },
    preview: {
      host,
      port,
      strictPort: true,
    },
  }
})
