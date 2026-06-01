---
'@interline-io/catenary': minor
---

Form-grouping primitive and programmatic focus exposure for text inputs.

- **New `cat-fieldset` component** — renders a native `<fieldset>` with `<legend>` populated from a `label` prop or `#label` slot. Optional `hiddenLegend` uses Bulma's `.is-sr-only` for visually-hidden-but-AT-readable legends. Optional `disabled` forwards to the native attribute. Use it to group `cat-radio` siblings, related fields, or any cluster of inputs that should be announced as a group (WCAG 1.3.1, 3.3.2).
- **`cat-checkbox-group`** gains `label` and `hiddenLegend` props. When `label` is set, the group renders as a `<fieldset>` with `<legend>`; without it, the existing `<div>` output is preserved so current call sites don't change behavior.
- **Focus exposure** — `cat-input`, `cat-select`, and `cat-textarea` now `defineExpose({ focus, blur, select })` so parents can call `inputRef.value?.focus()` when fields are dynamically revealed or enabled.
