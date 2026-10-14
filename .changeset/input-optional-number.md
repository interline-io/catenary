---
"@interline-io/catenary": minor
---

`cat-input` takes an `optional` prop for `type="number"` fields that may have no value. An emptied field, whether by deleting its text or with the clear button, emits `undefined` instead of `0`, so 0 stays a value someone typed. Typed text is converted to a number even while the bound value is `undefined` or `null`, where it used to be emitted as a string, which also lets `decimals` format it.

The emitted type includes `undefined` only when `optional` is set, so existing `@update:model-value` handlers typed against `number` keep typechecking. `modelValue` also accepts `null`, which shows as an empty field. Without `optional`, nothing changes.
