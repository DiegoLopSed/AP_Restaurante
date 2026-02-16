import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const isProd = mode === 'production'
  // En XAMPP este proyecto se sirve como:
  // - App (build):  /AP_Restaurante/public/app/
  // - API PHP:      /AP_Restaurante/public/api/*.php
  // Puedes sobreescribir con variables VITE_*.
  const publicBase = isProd ? (env.VITE_PUBLIC_BASE || '/AP_Restaurante/public/app/') : '/'

  // En desarrollo, el frontend llama a /api/* y Vite lo proxea al backend PHP (Apache/XAMPP)
  // Ej: GET /api/empleados.php  ->  http://localhost/AP_Restaurante/public/api/empleados.php
  const backendOrigin = env.VITE_BACKEND_ORIGIN || 'http://localhost'
  const backendPath = env.VITE_BACKEND_PATH || '/AP_Restaurante/public/api'

  return {
    base: publicBase,
    plugins: [react()],
    server: {
      strictPort: true,
      proxy: {
        '/api': {
          target: backendOrigin,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, backendPath),
        },
      },
    },
    build: {
      // Deja el build dentro de /public/app para que Apache lo sirva
      outDir: '../public/app',
      emptyOutDir: true,
    },
  }
})
