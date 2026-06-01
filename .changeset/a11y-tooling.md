---
'@interline-io/catenary': patch
---

Add accessibility linting and testing infrastructure.

- Adds `eslint-plugin-vuejs-accessibility` to the exported ESLint config in `src/eslint/`. Rules with zero existing violations land as `error`; the rest as `warn`. `pnpm lint`/`pnpm check` enforce `--max-warnings 34` so new warnings fail CI.
- Adds `vitest-axe` and an `expectNoAxeViolations()` helper in `testutil/component-helpers.ts` for asserting zero axe violations in component tests.
- Adds a `.github/workflows/ci.yml` workflow that runs lint, type-check, test, and build on every PR.
- Fixes one real WCAG bug surfaced by the linter: `cat-taginput`'s `role="combobox"` was using `aria-owns` instead of the required `aria-controls`.
