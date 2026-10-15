---
"@interline-io/catenary": patch
---

`cat-input` writes its value into the field the way Vue's own `v-model` on `<input>` does. While the field is focused, the model's rendering doesn't rewrite text that already means the same value ("2." for 2, "2.50" for 2.5, an empty field for 0 or `undefined`). Text mid-way through an IME composition is never rewritten, and is emitted once when the composition ends rather than on each keystroke. On blur the field shows the model, formatted, even when the parent ignored the last value. A cleared field whose `undefined` was dropped used to stay blank while the model kept its value.

Like Vue's `v-model`, this expects the bound value to update as soon as it is emitted. Bind the input to synchronous state, and write slow stores such as the URL from there.
