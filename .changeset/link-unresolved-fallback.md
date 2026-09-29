---
"@interline-io/catenary": minor
---

`cat-link` renders an unresolved link as inert text. Closes [#94](https://github.com/interline-io/catenary/issues/94).

When neither `to` nor `route-key` resolved, the fallback `<span>` kept every attribute and listener the caller passed, so a link styled as a button answered a mouse click but was unreachable by keyboard (WCAG 2.1.1). The fallback now keeps only `class`, `style`, `id`, `data-*` and vnode hooks, and drops listeners, `tabindex`, `role`, `aria-*` and every other attribute. It carries a `cat-link-unresolved` class. One styled as a Bulma `button` keeps its colors, shows a not-allowed cursor, and does not react to hover or press.

In development, a link that falls back unintentionally logs a warning once, naming the cause: a `route-key` missing from the `LinkRoutesKey` map, a route the router cannot resolve, or no router installed. A key mapped to `""` and a `to` that is still null do not warn, and nothing is logged during SSR.

Check any call site that relied on `@click` or `tabindex` on a link that might not resolve.
