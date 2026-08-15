import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  define: {
    'BUILD_ID': JSON.stringify('f24548a'),
  },
  build: {
    // Disable code splitting for Android WebView file:// support.
    // ES module chunks fail to load under file:// due to CORS restrictions.
    // inlineDynamicImports bundles everything into a single JS file.
    inlineDynamicImports: true,
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})