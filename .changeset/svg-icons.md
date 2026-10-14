---
"@interline-io/catenary": minor
---

Icons render as inline SVG when their name is registered, so an app no longer needs the `@mdi/font` webfont for them. Catenary registers the icons its own controls use; apps register theirs with path data from `@mdi/js`, through the plugin (`app.use(CatenaryPlugin, { icons: { account: mdiAccount } })`) or the new `registerIcons()` export. A name that is not registered still renders the `mdi mdi-<name>` class, so existing apps keep working with the webfont loaded, and `@mdi/font` is now an optional peer dependency.

Two opt-in plugin options: `strictIcons: 'warn' | 'error'` reports icon names that are not registered, and `iconSprite: true` draws icons from shared `<symbol>`s rendered by the new `<cat-icon-sprite>`, each path once per page.

Every icon now carries `data-icon="<name>"`, which tests can select on in place of the `mdi-<name>` class. Built-in icons are SVG, so a selector like `.mdi-loading` no longer matches them.
