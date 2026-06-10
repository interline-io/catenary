---
"@interline-io/catenary": patch
---

`cat-icon` decorative-by-default semantics, plus a sweep of unhidden glyphs. Icons were documented as decorative but the rendered span was not actually hidden from assistive technology; icon-font glyphs sit in a private-use codepoint range that some screen readers voice as garbage.

- `cat-icon` now renders `aria-hidden="true"` by default. A new `ariaLabel` prop marks an icon as meaningful: it renders `role="img"` with that accessible name instead of being hidden. Use it only when the icon conveys information not present in adjacent text; icon-only buttons should keep their name on the button.
- Decorative glyphs rendered directly by other components are now hidden as well: the `cat-button` loading spinner, the `cat-select` left icon, the `cat-table` sort glyphs (sort state is already exposed via `aria-sort` on the header cell), and the `cat-theme-toggle` weather icon.
- `cat-button` now exposes its loading state to assistive technology, since the spinner glyph alone never did: the button carries `aria-busy="true"` while loading, plus visually hidden text (new `ariaLoadingLabel` prop, default `Loading`) that joins the accessible name.
- New `icon.test.ts` covers both modes plus axe checks, and the playground icon page documents the decorative/meaningful distinction.
