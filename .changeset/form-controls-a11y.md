---
"@interline-io/catenary": minor
---

Five form-control accessibility fixes. Closes #49.

**`cat-radio` groups properly.** Radios are grouped by a shared `name`, not by sharing a `v-model` — without one, each radio is its own group of one: arrow keys do not move between them, every radio is a separate tab stop, and a screen reader announces each as "1 of 1". A mouse user sees nothing wrong, which is why it goes unnoticed. `cat-fieldset` now provides a generated `name` to the radios inside it, and a radio that resolves to no name at all warns in development. An explicit `name` still wins.

The playground's own radio demos shipped this bug — 27 radios, none named. All are grouped now, which is also what the documentation should have been showing.

**`cat-select` `readonly` no longer removes the control from the tab order.** It was implemented as `disabled`, so a keyboard or screen reader user could not reach it to read the current value, and it was announced as unavailable rather than read-only. It stays focusable, carries `aria-readonly`, and refuses to change — including if a change reaches it by some other route, where it puts the value back.

**`cat-input` and `cat-textarea` accept an explicit `id`.** A `cat-field` provides one id, so a grouped field containing more than one control gave them all the same one: duplicate DOM ids, and a `<label for>` resolving to whichever came first. `cat-select` has carried this escape hatch; these two did not.

**`cat-textarea` accepts `ariaLabel`**, matching `cat-input` and `cat-select`, so a textarea used without a labelled `cat-field` can be named under `strictTemplates`.

**`cat-checkbox-group`'s Select All / Select None report `aria-pressed`.** Which mode was in effect was conveyed only by a CSS class, so a screen reader heard two plain buttons with no indication of the current state.
