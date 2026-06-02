---
'@interline-io/catenary': minor
---

Accessibility improvements aligning `cat-modal` and `cat-switch` with their WAI-ARIA Authoring Practices patterns.

**`cat-modal`** — [Modal Dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/):

- Focus trap: Tab and Shift+Tab now cycle inside the dialog instead of escaping behind the backdrop.
- On open, focus moves to the first focusable element (or to the title / body fallback when there are none). On close, focus returns to the opener, guarded against the opener being gone from the DOM.
- `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` (when titled) on the dialog container.
- New `ariaLabel` prop names the dialog when no title is set (defaults to "Dialog" so the dialog always has an accessible name).
- New `ariaDescribedby` prop applies `aria-describedby` for longer-form context.

**`cat-switch`** — [Switch pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/):

- Underlying `<input>` gains `role="switch"` and `aria-checked` so assistive tech announces the control as a switch rather than a checkbox.
