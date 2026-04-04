// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'
import { stylisticConfig, ignoreFiles, eslintConfig } from './src/eslint'

// Run `npx @eslint/config-inspector` to inspect the resolved config interactively
export default createConfigForNuxt({
  features: {
    tooling: true,
    stylistic: stylisticConfig,
    typescript: {
      strict: true,
    },
  },
  dirs: {
    src: [
      './playground',
    ],
  },
})
  .prepend(ignoreFiles)
  .append(eslintConfig)
