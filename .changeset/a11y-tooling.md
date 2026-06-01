---
'@interline-io/catenary': patch
---

Add accessibility linting and testing infrastructure.

- Adds `eslint-plugin-vuejs-accessibility` to the exported ESLint config in `src/eslint/`. Rules with zero existing violations land as `error`; the rest as `warn`. `pnpm lint`/`pnpm check` enforce `--max-warnings 34` so new warnings fail CI.
- Adds a small in-house axe-core wrapper at `src/testutil/axe.ts` and an `expectNoAxeViolations()` helper in `src/testutil/component-helpers.ts` for asserting zero axe violations in component tests. The wrapper disables `cat.color` rules globally (jsdom can't compute styles) and stubs `HTMLCanvasElement.prototype.getContext` to silence jsdom's "Not implemented" warning on axe-core's icon-ligature precheck.
- Adds a `.github/workflows/ci.yml` workflow that runs lint, type-check, test, and build on every PR.
- Fixes one real WCAG bug surfaced by the linter: `cat-taginput`'s `role="combobox"` was using `aria-owns` instead of the required `aria-controls`.
