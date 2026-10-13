import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendTarget =
    env.BACKEND_URL ||
    env.VITE_BACKEND_URL ||
    (env.VITE_REMOTE_API_BASE_URL
      ? env.VITE_REMOTE_API_BASE_URL.replace(/\/api\/v1\/?$/, '')
      : '') ||
    ''

  return {
    envPrefix: ['VITE_', 'BACKEND_'],
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] })
    ],
    resolve: {
      dedupe: ['react', 'react-dom', 'react-router-dom'],
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react-router-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
      ],
    },
    server: {
      proxy: {
        '/api/v1/chat': {
          target: backendTarget,
          changeOrigin: true,
          secure: true,
        },
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: true,
        },
        '/socket.io': {
          target: backendTarget,
          ws: true,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  }
})
