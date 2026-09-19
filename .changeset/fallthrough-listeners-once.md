---
"@interline-io/catenary": minor
---

Fallthrough event listeners now fire once. Fixes #95.

**A listener passed to `cat-input`, `cat-select`, `cat-textarea` or `cat-slider` ran twice for one event.** Each of these binds `$attrs` to the native control inside a wrapper, and also routed listeners back to that wrapper — so a consumer's `@keydown` fired on the control and again as the event bubbled through the wrapper. A key that moved a highlight through a list of results moved it two rows at a time.

Listeners are now bound in exactly one place, chosen by whether the wrapper can observe the event. Almost everything goes to the wrapper, which sees the control's events on the way up *and* events from the icons and clear button beside it — including `@mouseenter` and `@mouseleave`, which do not bubble but are fired by the browser on each element being entered, so the wrapper sees them over a larger area than the control. Only the events a wrapper genuinely cannot observe go to the control: `@focus`, `@blur`, `@invalid`, `@scroll` and `@scrollend`. `class` and `style` still reach both, unchanged.

`@invalid` is worth calling out for anyone using constraint validation: it is a form-control event that does not bubble, so it now reaches the control rather than being bound somewhere it could never fire.

**One ordering change to be aware of.** Because a consumer's `@input` / `@change` listener now sits on the wrapper rather than on the control, it runs *after* the component's own handler, which is where `update:modelValue` is emitted. Previously it ran before. If you normalize a value in `@input` — upper-casing it, stripping characters — the raw value is now emitted first and your correction lands on the following tick. Move that work to a `watch` on the bound value, or to `@change`.

**`cat-slider` was missing `inheritAttrs: false` entirely**, so every fallthrough attribute was applied twice — a caller's `id` landed on both the wrapper and the range input, breaking `getElementById`, `<label for>` and anything pointing at it through `aria-controls` or `aria-describedby`. The other three had this fixed in 0.13.0; the slider was missed. Note that `data-*` attributes, including a `data-testid`, now resolve to the range input rather than to the wrapper — check any selector or style rule that relied on the old placement. It also gains its first test file.

**`cat-checkbox`, `cat-radio` and `cat-switch` now deliver `@focus` and `@blur`.** All three render their native control inside their own `<label>`, which is the component's root, so every fallthrough attribute landed there. Neither event reaches a label from the input, so a consumer's handlers never fired at all. `cat-radio` and `cat-switch` were also missing `inheritAttrs: false` entirely, so a caller's `id` resolved to a non-labelable `<label>` — breaking `getElementById` and `<label for>` — and `aria-describedby` never reached the control's accessible description. All three share one routing rule now, and their `class` and `style` still stay on the label alone.

Note for `cat-radio` and `cat-switch` specifically: `id`, `aria-*` and `data-*` move from the `<label>` to the `<input>`. Check any selector, style rule or test that relied on the old placement.

Consumers working around the double-fire — binding a key handler to a wrapper element, or writing attributes directly onto the control rather than passing them down — can drop those workarounds.
