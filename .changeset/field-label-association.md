---
"@interline-io/catenary": minor
---

`cat-field` accessibility review. Part of #64.

**The default slot now exposes `id` and `describedby`.** `cat-field` renders a real `<label for>`, but only the controls that inject `FieldIdKey` — `cat-input`, `cat-select`, `cat-textarea`, `cat-slider`, `cat-taginput`, and anything built on them — ever carried that id. Wrapping anything else left the label attached to nothing: visually correct, and unnamed to a screen reader. There was no way for a raw control to reach the id, which made the component's own documented example (`<cat-field label="Name"><input class="input"></cat-field>`) one of the broken cases. Now:

```vue
<cat-field v-slot="{ id, describedby }" label="Email" message="We never share it.">
  <input :id="id" :aria-describedby="describedby" class="input" type="email">
</cat-field>
```

**`cat-field` warns in development when its label names nothing.** Three distinct cases, each naming its own fix: the label resolves to no element (bind the id from the slot, or use `cat-fieldset`), to more than one (duplicate DOM ids — give every control after the first an explicit `id`), or the field wraps no form control at all (a `<label>` is the wrong element for a caption).

**Expect these warnings when you upgrade.** A label over a *group* of controls is the common one — one `<label>` cannot name a set, so a label above several checkboxes, radios, switches or buttons is orphaned. `cat-fieldset` is the component for that: its `<legend>` names the group. `cat-checkbox`, `cat-radio` and `cat-switch` deliberately do not take the field id, since they render their own wrapping `<label>` and a second name would be concatenated onto the first.

The playground's own field page demonstrated three of these bugs — a label over three buttons, and two pairs of inputs sharing one id. All now use `cat-fieldset` with per-control names, and the registration form routes its validation error through `variant`/`message` instead of a hand-written `<p class="help">`, so the error is linked by `aria-describedby` and the input is marked `aria-invalid`. The page gains the `demo-a11y` section it was missing.
