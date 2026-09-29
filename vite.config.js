import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // The real project folder name contains "%" ("80% done"), which makes Vite's
    // dev server fail with "URI malformed". Run the app through the junction
    // C:\Users\Acer\Documents\camcare instead; preserveSymlinks stops Vite from
    // resolving that junction back to the "%" path.
    preserveSymlinks: true,
  },
})
