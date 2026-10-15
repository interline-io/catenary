---
"@interline-io/catenary": patch
---

`cat-input` drives its field with Vue's own `v-model` directive for `<input>` (`vModelText`), so it behaves as a native `<input v-model>` does. While the field is focused, text that already means the model's value isn't rewritten: "2." for 2, "2.50" for 2.5, or an empty field for 0 or `undefined`. IME composition is left alone until it ends. On blur the field shows the model, formatted, even when the parent ignored the last value. A cleared field whose `undefined` was dropped used to stay blank while the model kept its value. Focusing a field whose value was rounded for display shows the full value. A model changed from outside while the field is focused shows as the plain number until the field is left, as with Vue's `v-model`.

Like Vue's `v-model`, this expects the bound value to update as soon as it is emitted. Bind the input to synchronous state, and write slow stores such as the URL from there.
