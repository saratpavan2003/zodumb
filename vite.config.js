import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Serves the generator routes (/sick, /money, /late, /raise, /resign) as their .html pages in dev, matching the
// rewrites configured in vercel.json for production.
function sickRoute() {
  return {
    name: 'sick-route',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url || '').split('?')[0].replace(/\/$/, '')
        if (['/sick', '/money', '/late', '/raise', '/resign'].includes(path)) {
          req.url = `${path}.html`
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
        money: resolve(__dirname, 'money.html'),
        late: resolve(__dirname, 'late.html'),
        raise: resolve(__dirname, 'raise.html'),
        resign: resolve(__dirname, 'resign.html'),
      },
    },
  },
})
