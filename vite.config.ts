
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: [
      'all',
      '.replit.dev',
      'c85b2b3d-3793-483d-b481-507633d82fff-00-3ms1cbkvir0ir.sisko.replit.dev'
    ]
  },
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  }
})
