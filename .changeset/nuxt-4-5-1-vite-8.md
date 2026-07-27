---
"@interline-io/catenary": minor
---

Support vue-router 5, externalize it from the bundle, and move the dev toolchain to Nuxt 4.5.1 / Vite 8.

- **`vue-router` peer range widened to `^4.0.0 || ^5.0.0`.** Nuxt 4.4+ ships vue-router 5, so the previous `^4.0.0` range forced consumers on modern Nuxt to resolve a *second* copy of the router alongside their own. Catenary's only vue-router coupling is a type-only import in `cat-link` (`Router`, `RouteLocationRaw`, `RouteLocationNamedRaw`), and those types are unchanged across v4 and v5 — the library typechecks clean against both.
- **`vue-router` is now external to the build.** `cat-link` resolves `RouterLink` through a dynamic `import('vue-router')`, and because vue-router was not in the externals list the bundler was emitting a bundled 21 kB copy of it into `dist/`. Consumers now always get their own router instance. This was pre-existing behaviour, not introduced by the Vite 8 upgrade.
- Dev toolchain moved to Nuxt 4.5.1, Vite 8.1.5, `@vitejs/plugin-vue` 6.0.8, `nuxi` 3.37.0, vue 3.5.40. Nuxt 4.5.1 is a security release; it also pulls `@nuxt/devtools` to 3.3.1, which fixes a critical development-only RCE (GHSA-279x-mwfv-vcqv) where an unauthenticated RPC could run arbitrary commands on the machine running `nuxt dev`.
- `build.rollupOptions` renamed to `build.rolldownOptions` — Vite 8 replaced Rollup with Rolldown and deprecated the old key. Output is byte-identical under either name.
- The playground's devtools are now gated behind `isDev` instead of being unconditionally enabled, matching the convention in the sibling apps.

No runtime API changes.
