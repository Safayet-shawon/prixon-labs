import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// In development, serve the same serverless API that runs on Vercel unless a
// separate backend (for example the Spring Boot service) is configured.
function localApi(env) {
  return {
    name: 'praxivon-local-api',
    apply: 'serve',
    configureServer(server) {
      if (env.VITE_PROXY_TARGET) return
      for (const [key, value] of Object.entries(env)) process.env[key] ??= value
      server.middlewares.use('/api', async (req, res, next) => {
        try {
          const chunks = []
          for await (const chunk of req) chunks.push(chunk)
          const raw = Buffer.concat(chunks).toString('utf8')
          try {
            req.body = raw ? JSON.parse(raw) : undefined
          } catch {
            req.body = undefined
          }
          req.url = `/api${req.url}`
          const { default: handler } = await server.ssrLoadModule('/api/index.js')
          await handler(req, res)
        } catch (error) {
          next(error)
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  return {
    plugins: [react(), tailwindcss(), localApi(env)],
    build: {
      target: 'es2022',
      cssCodeSplit: true,
      sourcemap: false,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          // Long-lived vendor chunks cache independently of app code.
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined
            if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react'
            if (id.includes('react-router')) return 'router'
            if (/node_modules\/(framer-motion|motion-dom|motion-utils)\//.test(id)) return 'motion'
            if (/node_modules\/three\//.test(id)) return 'three'
            return undefined
          },
        },
      },
    },
    server: {
      host: '127.0.0.1',
      proxy: env.VITE_PROXY_TARGET
        ? { '/api': { target: env.VITE_PROXY_TARGET, changeOrigin: true } }
        : undefined,
    },
  }
})
