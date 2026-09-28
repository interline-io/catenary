---
"@interline-io/catenary": patch
---

`cat-link` renders an unresolved link as inert text. Closes [#94](https://github.com/interline-io/catenary/issues/94).

When neither `to` nor `route-key` resolves, the fallback `<span>` used to keep every attribute and listener the caller passed. A link styled as a button therefore looked like a button and answered a mouse click, but was unreachable by keyboard and announced as plain text (WCAG 2.1.1). The fallback now drops event listeners, `tabindex`, `role`, `href`, `target`, `rel`, `download` and `aria-current`, and keeps `class`, `style`, `id` and `data-*` so layout holds. It carries a `cat-link-unresolved` class, and one styled as a Bulma `button` takes the disabled-button look.

In development, a `route-key` with no entry in the `LinkRoutesKey` map logs a warning once per key. A key mapped to `""` (a deliberate "no route") and a `to` that is still null while loading do not warn.
