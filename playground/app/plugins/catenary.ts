import CatenaryPlugin from '../../../src/index'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(CatenaryPlugin)
})
