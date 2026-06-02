---
'@interline-io/catenary': minor
---

Two accessibility fixes flagged as known limitations by the playground a11y sections:

- **`cat-modal`** — now implements the [WAI-ARIA Modal Dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) more completely. The modal card carries `role="dialog"`, `aria-modal="true"`, and either `aria-labelledby` pointing at the title (when `title` or the `#title` slot is provided) or `aria-label`. When no title is set, the new `ariaLabel` prop names the dialog (defaults to "Dialog" so the modal always has an accessible name). A new `ariaDescribedby` prop applies `aria-describedby` to the dialog for longer-form context. On open, focus moves to the first focusable element inside the modal; if there are none, focus falls back to the title (per APG advice not to focus the dialog element itself) or the body wrapper. Tab and Shift+Tab now wrap at the boundaries instead of letting focus escape behind the backdrop. On close, focus is restored to whatever element opened the modal, guarded against the opener being removed from the DOM while the modal was open.
- **`cat-switch`** — the underlying `<input type="checkbox">` now carries `role="switch"` and `aria-checked` so assistive tech announces the control as a switch (per the [WAI-ARIA Switch pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/)) rather than a checkbox.
