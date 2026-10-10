---
"@interline-io/catenary": minor
---

`cat-field` hands its id to a wrapped control only when the field has a label. The id is there for the `<label for>` to name a control, but a field without a label gave it to every catenary control inside, so a label-less group, such as a filter bar's search input and select, rendered duplicate ids. The default slot's `id` follows the same rule and is `undefined` without a label. A `cat-taginput` in a label-less field now falls back to its `aria-label` (its placeholder, or "Search tags"), as it does outside a field.

`FieldIdKey` now provides a `ComputedRef<string | undefined>` rather than a string. A custom control that injects the key reads `.value` in script; a template unwraps the ref on its own.
