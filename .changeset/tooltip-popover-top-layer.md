---
'@interline-io/catenary': minor
---

`cat-tooltip` — render the bubble in the browser's top layer via the Popover API, and make its typography self-contained.

The a11y rebuild made the tooltip bubble a real element (`<span role="tooltip">`), which exposed two consumer-facing issues: the bubble inherited typography from its context (e.g. uppercase + letter-spacing inside Bulma's `.menu-label`), and as a `position: absolute` child it was clipped by `overflow: hidden`/`auto` ancestors such as scrollable side panels.

- **Top-layer rendering** — in browsers with the Popover API (Baseline Widely Available since 2025), the bubble is shown as a `popover="manual"` element. The top layer escapes ancestor overflow clipping, z-index stacking contexts, and transformed containing blocks, while the bubble stays in the component subtree — the `aria-describedby` association and scoped styles are unchanged. Browsers without the API keep the previous absolutely-positioned behavior.
- **Real-measurement positioning** — placement flips and coordinates now use the bubble's actual rendered size instead of fixed estimates, and the bubble is clamped to the viewport. When clamping shifts the bubble off the trigger's center, the arrow stays pointed at the trigger.
- **Arrow moves onto the bubble** — it now escapes clipping together with the bubble (this also fixes the arrow clipping in the non-popover fallback).
- **Self-contained typography** — the bubble resets `text-transform`, `letter-spacing`, `font-weight`, `text-align`, and `font-style`, so tooltips render identically regardless of surrounding context. Consumers that carried CSS overrides for inherited tooltip typography (e.g. `.cat-tooltip::after { text-transform: none }` from the pseudo-element era) can delete them.

### CSS impact

The bubble keeps the `.cat-tooltip-bubble` class. If you styled the old wrapper-attached arrow via `.cat-tooltip::before`, it is now `.cat-tooltip-bubble::before`. Top-layer bubbles ignore ancestor `z-index` entirely — selectors that tried to raise tooltip stacking are no longer needed.
