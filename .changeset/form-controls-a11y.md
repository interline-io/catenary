---
"@interline-io/catenary": minor
---

Four form-control accessibility fixes. Closes #49.

**`cat-radio` groups properly.** Radios are grouped by a shared `name`, not by sharing a `v-model` — without one, each radio is its own group of one: arrow keys do not move between them, every radio is a separate tab stop, and a screen reader announces each as "1 of 1". A mouse user sees nothing wrong, which is why it goes unnoticed.

A radio that resolves to no name warns in development, naming the two ways to fix it. **Expect this warning when you upgrade** — it is the point of the change, and it fires once per unnamed radio on mount. Either give every radio in a group the same `name`, or wrap the group in the new `<cat-fieldset radio-group>`, which supplies a generated one. An explicit `name` always wins.

`radio-group` is opt-in rather than automatic because a fieldset is a generic grouping wrapper: naming *every* descendant radio would merge two independent questions under one legend into a single group, and the resulting bug is silent — picking "Red" makes the browser natively uncheck "Small", and since `size` never changed, Vue's patch skips the DOM write, so the size selection vanishes from the UI while state still says it is selected.

The playground's own radio demos shipped the ungrouped bug — 27 radios, none named. All are grouped now, which is also what the documentation should have been showing.

**`cat-select` `readonly` no longer removes the control from the tab order.** It was implemented as `disabled`, so a keyboard or screen reader user could not reach it to read the current value, and it was announced as unavailable rather than read-only. It now stays focusable, carries `aria-readonly`, gets a muted surface so it does not look editable, and refuses to change — while leaving Enter (so a form still submits) and Cmd/Ctrl shortcuts (copy, select-all) alone. If a change reaches it by another route it restores the previous selection, including every option of a `multiple` select.

**`cat-input` and `cat-textarea` accept an explicit `id`.** A `cat-field` provides one id, so a grouped field containing more than one control gave them all the same one: duplicate DOM ids, and a `<label for>` resolving to whichever came first. `cat-select` has carried this escape hatch; these two did not.

**`cat-textarea` accepts `ariaLabel`**, matching `cat-input` and `cat-select`, so a textarea used without a labelled `cat-field` can be named under `strictTemplates`.
