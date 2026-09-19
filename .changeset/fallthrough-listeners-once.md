---
"@interline-io/catenary": patch
---

Fallthrough event listeners now fire once. Fixes #95.

**A listener passed to `cat-input`, `cat-select`, `cat-textarea` or `cat-slider` ran twice for one event.** Each of these binds `$attrs` to the native control inside a wrapper, and also routed listeners back to that wrapper — so a consumer's `@keydown` fired on the control and again as the event bubbled through the wrapper. A key that moved a highlight through a list of results moved it two rows at a time.

Listeners are now bound in exactly one place, chosen by whether the event bubbles. A bubbling listener goes to the wrapper, which sees the control's events on the way up *and* events from the icons and clear button beside it. A non-bubbling one (`@focus`, `@blur`, `@mouseenter`, `@mouseleave`, `@scroll`) goes to the control, which is the only element that can see it. `class` and `style` still reach both, unchanged.

**`cat-slider` was missing `inheritAttrs: false` entirely**, so every fallthrough attribute was applied twice — a caller's `id` landed on both the wrapper and the range input, breaking `getElementById`, `<label for>` and anything pointing at it through `aria-controls` or `aria-describedby`. The other three had this fixed in 0.13.0; the slider was missed. It also gains its first test file.

**`cat-checkbox` now delivers `@focus` and `@blur`.** It sent every listener to the wrapping `<label>`, and neither event bubbles out of the input, so neither ever fired. It shares the same rule now. Its `class` and `style` still stay on the wrapper alone, as before.

Consumers working around the double-fire — binding a key handler to a wrapper element, or writing attributes directly onto the control rather than passing them down — can drop those workarounds.
