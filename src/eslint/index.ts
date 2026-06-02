import type { StylisticCustomizeOptions } from '@stylistic/eslint-plugin'
import type { Linter } from 'eslint'

export const ignoreFiles = {
  ignores: [
    '.nuxt/**',
    '.output/**',
    '**/.nuxt',
    'dist/**',
    'node_modules/**',
  ],
}

export const eslintTypescriptRules: Linter.RulesRecord = {
  'no-console': 'off',
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/unified-signatures': 'off',
}

export const eslintStylisticRules: Linter.RulesRecord = {
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
}

// Vue accessibility rules from eslint-plugin-vuejs-accessibility's `flat/recommended`.
// Most rules are at 'error' once the codebase reaches zero violations on them.
// Rules at 'warn' are ones where automated detection has known false-positives
// (label-has-for trips on nested labels patterns we use) or where we haven't yet
// audited every case (alt-text, no-autofocus). Promote remaining 'warn' rules
// to 'error' as they reach zero violations.
export const eslintA11yRules: Linter.RulesRecord = {
  'vuejs-accessibility/alt-text': 'warn',
  'vuejs-accessibility/anchor-has-content': 'error',
  'vuejs-accessibility/aria-props': 'error',
  'vuejs-accessibility/aria-role': 'error',
  'vuejs-accessibility/aria-unsupported-elements': 'error',
  'vuejs-accessibility/click-events-have-key-events': 'error',
  'vuejs-accessibility/form-control-has-label': 'error',
  'vuejs-accessibility/heading-has-content': 'warn',
  'vuejs-accessibility/iframe-has-title': 'error',
  'vuejs-accessibility/interactive-supports-focus': 'error',
  'vuejs-accessibility/label-has-for': ['warn', {
    required: { some: ['nesting', 'id'] },
  }],
  'vuejs-accessibility/media-has-caption': 'warn',
  'vuejs-accessibility/mouse-events-have-key-events': 'error',
  'vuejs-accessibility/no-access-key': 'error',
  'vuejs-accessibility/no-autofocus': 'warn',
  'vuejs-accessibility/no-distracting-elements': 'error',
  'vuejs-accessibility/no-redundant-roles': 'error',
  'vuejs-accessibility/no-static-element-interactions': 'error',
  'vuejs-accessibility/role-has-required-aria-props': 'error',
  'vuejs-accessibility/tabindex-no-positive': 'error',
}

export const stylisticConfig = {
  flat: true,
  indent: 2,
  quotes: 'single',
  semi: false,
} as any as StylisticCustomizeOptions

export const eslintConfig: { rules: Linter.RulesRecord } = {
  rules: {
    ...eslintTypescriptRules,
    ...eslintStylisticRules,
    ...eslintA11yRules,
  },
}
