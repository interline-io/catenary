---
"@interline-io/catenary": minor
---

`cat-modal` puts attributes passed to it, such as `class`, `style` and `data-*`, on its `.modal` root. The component's root is a Teleport, which cannot inherit attributes, so Vue used to drop them with an "Extraneous non-props attributes" warning. The same warning fired on every server render of a component whose template root is a `cat-modal` and whose parent has scoped styles, because the server passes the parent's scope id to that root as an attribute.

Listeners other than `update:modelValue` now bind to the `.modal` element as native listeners, where before they were dropped.
