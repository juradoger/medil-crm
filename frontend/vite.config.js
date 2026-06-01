/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Configuración de Vite con TailwindCSS v4 y Vitest — Vite config with TailwindCSS v4 and Vitest
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  build: {
    rollupOptions: {
      output: {
        // rolldown (Vite 8) espera manualChunks como función, no objeto
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('jspdf')) return 'pdf';   // incluye jspdf-autotable
          if (id.includes('xlsx'))  return 'xlsx';
          if (id.includes('react')) return 'vendor'; // react, react-dom, react-router-dom
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
