---
'@interline-io/catenary': patch
---

Restore visible focus indicators on `cat-slider` and `cat-switch`. Both components had `outline: none` on their inputs with no `:focus-visible` replacement, so keyboard focus worked (arrow keys / Space toggle) but the user couldn't tell which control was focused — a WCAG SC 2.4.7 (Focus Visible) violation.

- **`cat-slider`** — adds a `:focus-visible` outline (`$link`, 2px, offset 4px) around the range input. Mouse interaction is unaffected.
- **`cat-switch`** — the underlying checkbox is visually hidden (`opacity: 0`, `z-index: -1`) so its own focus ring is never visible. Adds `input[type="checkbox"]:focus-visible + .check { outline: ... }` so the focus indicator appears on the styled toggle instead.
