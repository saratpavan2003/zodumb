import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Serves /sick as /sick.html in dev, matching the /sick -> /sick.html
// rewrite configured in vercel.json for production.
function sickRoute() {
  return {
    name: 'sick-route',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/sick' || req.url === '/sick/') {
          req.url = '/sick.html'
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), sickRoute()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        sick: resolve(__dirname, 'sick.html'),
      },
    },
  },
})
