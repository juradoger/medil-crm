import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Configuración de Vite con TailwindCSS v4 — Vite config with TailwindCSS v4
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
})
