/**
 * Minimal in-house wrapper around axe-core for component a11y tests under
 * Vitest + jsdom. Inspired by chaance/vitest-axe (MIT) and nickcolley/jest-axe
 * (MIT), but trimmed to just what this repo uses: one `axe(element)` call that
 * returns axe-core's standard results object. No custom matchers — assertions
 * live in `expectNoAxeViolations` in `component-helpers.ts`.
 *
 * The `cat.color` rules (color-contrast, link-in-text-block, etc.) are
 * disabled globally because jsdom does not compute real styles, so those rules
 * either no-op or produce noise. Run axe-devtools in the browser for contrast.
 */

import axeCore, { type RunOptions, type AxeResults, type Spec } from 'axe-core'

const colorRules = axeCore.getRules(['cat.color']).map(({ ruleId }) => ({
  id: ruleId,
  enabled: false
}))

const config: Spec = {
  rules: colorRules
}

axeCore.configure(config)

export function axe (
  element: Element,
  options: RunOptions = {}
): Promise<AxeResults> {
  return axeCore.run(element, options)
}
