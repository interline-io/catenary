---
'@interline-io/catenary': patch
---

Restore visible focus indicators on `cat-slider` and `cat-switch`. Both components had `outline: none` on their inputs with no `:focus-visible` replacement, so keyboard focus worked (arrow keys / Space toggle) but the user couldn't tell which control was focused — a WCAG SC 2.4.7 (Focus Visible) violation.

- **`cat-slider`** — adds a `:focus-visible` outline (2px, offset 4px) around the range input. Mouse interaction is unaffected.
- **`cat-switch`** — the underlying checkbox is visually hidden, so adds the focus outline to the adjacent styled `.check` toggle.

Both outlines use Bulma's `--bulma-focus-h` / `-s` / `-l` CSS variables so consumers can theme the focus color independently of `$link` (e.g., to give it more contrast on a colored variant) without overriding the component styles.
