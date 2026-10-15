---
"@interline-io/catenary": minor
---

`cat-input` supports `v-model.lazy`. The value is emitted on the native `change` event, when the field is left, Enter is pressed, or a number's step buttons are used, rather than on every keystroke. It is for a parent whose updates are costly, such as one that keeps the value in the URL. Vue passes the modifier as `modelModifiers`, so a binding without `v-model` passes `:model-modifiers="{ lazy: true }"`. While editing, the field still shows what was typed. The clear button still commits at once.
