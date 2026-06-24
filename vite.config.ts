import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// dev runs at "/" (easy local preview); production build is served from
// GitHub Pages under "/learning/".
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/learning/' : '/',
  plugins: [react()],
}))
