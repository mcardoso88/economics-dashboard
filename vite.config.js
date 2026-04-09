import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// For GitHub Pages, VITE_BASE_PATH is set by the deploy workflow to "/<repo-name>/".
// Locally it defaults to "/" so `npm run dev` works out of the box.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
})
