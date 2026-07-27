import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Catenary',
      fileName: 'catenary',
      formats: ['es']
    },
    rolldownOptions: {
      // vue-router is an optional peer dependency, dynamically imported by
      // cat-link to resolve RouterLink. It must stay external so consumers use
      // their own router instance — bundling it ships a second copy of
      // vue-router and defeats the peer range widened for Nuxt 4.4+ (vue-router 5).
      external: ['vue', 'date-fns', 'vue-router']
    }
  }
})
