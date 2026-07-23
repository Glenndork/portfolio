import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The site is served from https://glenndork.github.io/portfolio/, so every
// built asset URL has to be prefixed with the repo name. Without this the
// deployed page requests /assets/*.js at the domain root and renders blank.
export default defineConfig({
  base: '/portfolio/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
