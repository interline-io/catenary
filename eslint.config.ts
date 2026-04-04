// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

const stylisticConfig = {
  flat: true,
  indent: 2,
  quotes: 'single',
  semi: false,
}

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
  .prepend({
    ignores: [
      '.nuxt/**',
      '.output/**',
      '**/.nuxt',
      'dist/**',
      'node_modules/**',
    ],
  })
  .append({
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/unified-signatures': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/max-attributes-per-line': ['error', {
        singleline: { max: 10 },
        multiline: { max: 1 },
      }],
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      '@stylistic/space-before-function-paren': ['error', {
        anonymous: 'always',
        named: 'always',
        asyncArrow: 'always',
      }],
      '@stylistic/comma-dangle': 'off',
      '@stylistic/max-statements-per-line': ['error', { max: 3 }],
    },
  })
