---
"@interline-io/catenary": minor
---

`cat-input` gains an opt-in `clearable` prop that renders a clear button in the right icon slot once the input holds a value.

- The button is a real `<button type="button">` (focusable in tab order) using the `mdi-close-circle` icon, matching `cat-search-bar`'s clear affordance. The icon is `aria-hidden`; the button carries an accessible label, `"Clear"` by default and overridable via `clear-aria-label`.
- Activating it emits a new `clear` event alongside `update:modelValue` (`''`, or `0` for numeric inputs to match the bound type), then returns focus to the input so keyboard users are not stranded when the button disappears.
- The button auto-hides when the input is empty, `disabled`, `readonly`, or `static`. It takes over the right slot, so it is mutually exclusive with `icon-right`.
- A `clear()` method is exposed via `defineExpose` for programmatic clearing.
