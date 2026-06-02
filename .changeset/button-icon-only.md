---
'@interline-io/catenary': minor
---

Fix icons inflating control height, and add an icon-only `cat-button` shorthand.

- **`cat-icon`** — clamp the MDI glyph to its Bulma `.icon` container. The webfont rendered a baseline-aligned glyph whose line box could exceed the container (e.g. the normal size produced a ~36px glyph in a 24px box), which pushed any surrounding control above the standard control height. Icons no longer change the height of the control they sit in.
- **`cat-button`** — new `icon` prop renders an icon-only button (e.g. an addon button in a `has-addons` field) at the correct size, instead of slotting a bare `<cat-icon>` which rendered oversized and made the button taller than adjacent inputs/selects. The rendered glyph is `aria-hidden`; supply an accessible name via `aria-label`/`aria-labelledby`. `icon` is ignored when a default slot, `label`, `iconLeft`, or `iconRight` is present.
