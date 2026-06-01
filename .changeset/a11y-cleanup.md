---
'@interline-io/catenary': minor
---

Clean up remaining accessibility lint warnings, convert clickable non-button elements to native `<button>`, and tighten the lint cap to 0.

- **Native-button conversions** — components that rendered clickable `<div>`/`<span>`/href-less `<a>` elements now use real `<button>` elements (or stay as `<span>` when non-interactive). Each gets a focus-visible outline meeting WCAG 1.4.11 contrast.
  - `cat-safelink` — copy action becomes `<button>`; external link keeps `<a href>` and gains `aria-label="Open URL in new tab"`.
  - `cat-tag` — `isDelete` mode becomes `<button aria-label="Delete">`; the normal variant renders as `<button>` only when a click listener is attached, else `<span>`.
  - `cat-slider-tick` — `<button>` when the parent slider provides `setValue`, else `<div>`.
  - `cat-tree-control` — expand toggle becomes `<button aria-expanded>`.
  - `cat-input` — clickable right icon becomes `<button>`. **New `iconRightAriaLabel` prop is now expected when `iconRightClickable` is true.**
- **`cat-taginput`** — search input gains `aria-label` (defaulting to `placeholder`). Dropdown options pair `@focus` with `@mouseenter` so keyboard navigation highlights match pointer hover. When `readonly`, the `combobox` role and popup-related ARIA attributes (`aria-expanded`, `aria-haspopup`, `aria-controls`) are now omitted, since the listbox is removed from the DOM and the previous attributes pointed at a non-existent element.
- **`cat-msg`** — expandable header now has real keyboard handlers (`@keydown.enter/space`, `tabindex`, `role`) that were missing.
- **Lint cap → 0** — `package.json` `--max-warnings` drops from 26 to 0. The following rules are promoted from `warn` to `error` in the exported ESLint config: `anchor-has-content`, `click-events-have-key-events`, `form-control-has-label`, `interactive-supports-focus`, `mouse-events-have-key-events`, `no-static-element-interactions`.

### CSS impact (no Vue template changes needed)

Existing `<cat-*>` templates keep working — no consumer template needs to be edited. The native-button conversions do change the rendered tag, which will break CSS selectors that pinned the old element. Grep your consumer for these patterns:

- **`cat-tag`** (`isDelete`): was `<a class="tag is-delete">`; now `<button class="tag is-delete">`. Selectors like `a.tag.is-delete` won't match — drop the `a` qualifier.
- **`cat-tag`** (normal): renders as `<button>` only when a click listener is attached, else `<span>`. Selectors that always expected `<a>` or `<span>` are no longer reliable; style `.tag` (or `.tag.is-*`) without the tag qualifier.
- **`cat-slider-tick`**: was `<div>`; now `<button>` when the parent slider provides `setValue`, else `<div>`. Selectors like `div.cat-slider-tick` won't match the interactive case.
- **`cat-tree-control`** expand toggle: was `<span>` / `<div>`; now `<button class="cat-tree-control-toggle" aria-expanded>`.
- **`cat-safelink`** copy action: was clickable `<span>` / anchor; now `<button>`. The external link variant keeps `<a href>` (unchanged).
- **`cat-input`** clickable right icon: was clickable `<span class="icon is-right is-clickable">`; now `<button class="icon is-right is-clickable">`. Also: **new `iconRightAriaLabel` prop expected when `iconRightClickable` is true** (defaults to "Action").

If your consumer styles or queries don't match any of the above, this change is non-breaking for you.
