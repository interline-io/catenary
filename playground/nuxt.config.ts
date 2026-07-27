const isDev = process.env.NODE_ENV === 'development'

export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: isDev },
  compatibilityDate: '2024-11-01',
  typescript: {
    strict: true,
    typeCheck: true,
  },
})
