---
"@interline-io/catenary": patch
---

`cat-field` help/validation messages are now announced. The message rendered below a field was visible but never programmatically associated with the wrapped control, so screen reader users focusing the input never heard why a value was invalid.

- The help `<p>` gets a stable id, and `cat-field` provides it (new `FieldDescribedbyKey`) together with its validation variant (new `FieldVariantKey`).
- `cat-input`, `cat-textarea`, `cat-select`, and `cat-slider` merge the field message id into their `aria-describedby` alongside their own `ariaDescribedby` prop (newly declared on textarea, select, and slider) and render `aria-invalid="true"` when the field's variant, or their own `variant` prop, is `danger`.
- Composite controls that already pass `ariaDescribedby` to `cat-input` (such as the datepicker's format hint) get both ids merged automatically.
