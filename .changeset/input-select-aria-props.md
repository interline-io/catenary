---
"@interline-io/catenary": patch
---

`cat-input` and `cat-select` gain explicitly declared accessibility props, following the `cat-button` precedent of declaring ARIA attributes as props so `strictTemplates` consumers typecheck:

- `cat-input`: `ariaLabel` (accessible name when there is no associated visible label) and `ariaDescribedby` (id of a describing element, e.g. a format hint).
- `cat-select`: `ariaLabel` (same purpose) and `id` (explicit id for the native select, overriding the id injected by a wrapping `cat-field`; use when a composite control contains multiple selects so ids stay unique).
