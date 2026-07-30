import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages 프로젝트 사이트는 /<repo>/ 아래에 놓인다.
  base: '/test123/',
  plugins: [react()],
})
