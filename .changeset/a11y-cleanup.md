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

Consumers with CSS targeting the old DOM elements (e.g., `span.is-delete` on `cat-tag`, `div` for slider ticks) may need to update selectors.
