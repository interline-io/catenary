---
"@interline-io/catenary": patch
---

`cat-pagination` accessible names. The previous/next buttons were icon-only with no text alternative, so screen readers announced them as just "button" (an axe `button-name` failure), and page buttons announced as bare numbers with no context.

- New `ariaPreviousLabel`/`ariaNextLabel` props (defaults `Previous page`/`Next page`) bound as `aria-label` on the previous/next buttons. The redundant `aria-disabled` is dropped; the native `disabled` attribute already conveys the state.
- Every page button gets `aria-label="Page N"`, which screen readers combine with the existing `aria-current="page"` as e.g. "Page 7, current page".
- The decorative ellipsis separators are hidden from assistive technology.
- New `pagination.test.ts` covers the names, `aria-current` uniqueness, boundary disabled states, and an axe check.
