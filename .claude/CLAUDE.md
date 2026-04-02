# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Catenary is a **standalone Vue 3 component library** (not a Nuxt module) that provides generic, domain-agnostic UI controls built on Bulma CSS. It is extracted from the `t-controls` portion of `tlv2-ui` and published to GitHub Packages as `@interline-io/catenary`.

Consumers install it as a Vue plugin (`app.use(CatenaryPlugin)`) or import individual components (`import { TButton } from '@interline-io/catenary'`).

## Commands

```bash
pnpm dev              # Start Nuxt playground dev server
pnpm dev:prepare      # Prepare Nuxt playground types
pnpm build            # Build library (vite + vue-tsc declarations)
pnpm test             # Run all tests (vitest)
pnpm test -- -t "test name"  # Run a single test by name
pnpm test -- src/controls/button.test.ts  # Run a single test file
pnpm check            # TypeScript type checking (vue-tsc --noEmit)
```

Requires **Node v22.21.1** (see `.nvmrc`). Use `fnm use` before running commands.

## Test Setup

Tests use **Vitest** with jsdom environment. Test files live alongside components in `src/controls/`. Test helpers are in `src/testutil/component-helpers.ts`.

## Architecture

### Library Entry Point

`src/index.ts` — Exports all 30 components individually and as a Vue plugin (`CatenaryPlugin`). Also re-exports all types from `src/controls/types.ts`.

### Source Structure (`src/`)

- **controls/** — 30 Vue components (prefix `t-`): button, input, modal, table, select, datepicker, taginput, etc. Styled with Bulma CSS. Components that use other controls import them explicitly (e.g., button imports icon, datepicker imports dropdown/input/select).
- **controls/types.ts** — Shared TypeScript types for variants, sizes, and injection keys (`FieldIdKey`).
- **testutil/** — Test helper utilities (mount helpers, variant/size generators, v-model testing, a11y checks).

### Dependencies

- **vue** (peer) — Vue 3.5+
- **bulma** — CSS framework (classes applied via computed properties, some SCSS imports)
- **@mdi/font** — Material Design Icons (referenced via CSS class names like `mdi mdi-check`)
- **date-fns** — Used only by the datepicker component

### CSS Conventions

Components follow the pattern documented in the original `README-CLASSES.md`:
- Root element gets both Bulma class and `t-` prefixed class (e.g., `class="card t-card"`)
- Bulma helpers used directly (spacing, typography, flexbox)
- Custom/invented classes always use `t-` prefix
- SCSS `@each` loops for variant styling

### Playground

`playground/` is a Nuxt 4 app (devDependency only) for interactive component demos. It registers all components via a plugin (`playground/app/plugins/catenary.ts`). Each control has a dedicated demo page under `playground/app/pages/controls/`.

### Publishing

Published to GitHub Packages on every push via `.github/workflows/publish.yml`. Version is computed from `package.json` version + git SHA. Main branch pushes get the `latest` dist-tag.

## Code Style

- 2-space indent, single quotes, no semicolons
- 1TBS brace style, space before function parens
- Vue `<script setup lang="ts">` with explicit imports (no Nuxt auto-imports)
- Package manager: **pnpm**

## PR Summary

When asked to "generate PR summary", run `git diff main...HEAD` and `git log main..HEAD --oneline` to analyze all changes on the current branch, then output a GitHub-flavored markdown PR description wrapped in a fenced code block so it can be copy-pasted. No emojis, no checklists. Use this structure:

```
## Summary
<high-level one paragraph description of the PR>

### <theme 1>
<bulleted details>

### <theme 2>
<bulleted details>

## Test plan
<manual verification steps relevant to the changes; do not include pnpm test/lint/typecheck as those are handled by CI>
```
