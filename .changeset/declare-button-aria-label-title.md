---
"@interline-io/catenary": patch
---

`cat-button` — declare `ariaLabel` and `title` as props, bound onto the native `<button>` element.

Both already worked at runtime via attribute fallthrough, but consumers with `strictTemplates` enabled got a type error when passing `aria-label` / `title` — including the documented icon-only usage, where an accessible name is required. Declaring them as props makes `<cat-button icon="close" aria-label="…" title="…" />` typecheck. Other attributes continue to fall through unchanged.
