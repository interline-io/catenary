---
"@interline-io/catenary": minor
---

Icons render as inline SVG when their name is registered, so an app no longer needs the `@mdi/font` webfont for them. Catenary registers the icons its own controls use; apps register theirs with path data from `@mdi/js`, through the plugin (`app.use(CatenaryPlugin, { icons: { account: mdiAccount } })`) or the new `registerIcons()` export. A name that is not registered still renders the `mdi mdi-<name>` class, so existing apps keep working with the webfont loaded, and `@mdi/font` is now an optional peer dependency.

Two opt-in plugin options: `strictIcons: 'warn' | 'error'` reports icon names that are not registered, and `iconSprite: true` draws icons from shared `<symbol>`s rendered by the new `<cat-icon-sprite>`, each path once per page.

Built-in icons are now `<svg class="cat-icon-glyph">` elements rather than `<i class="mdi mdi-<name>">`. Selectors aimed at the old element inside Catenary's controls, such as `.mdi`, `.mdi-<name>` or `.icon i`, no longer match them. That covers consumer stylesheets as well as tests, and a style rule fails silently: `.cat-input .icon i { color: … }` or `.button .mdi-loading { … }` simply stops applying. Target `.cat-icon-glyph`, or `[data-icon="<name>"]` for a specific icon, instead. Every icon carries `data-icon`, whether it renders as SVG or as the webfont class. The SVG takes its color from `currentColor`, so a `color` set on the icon's container still applies.

`@mdi/js` is bundled at build time, only the paths Catenary registers, so it is not installed as a dependency. Apps that register their own icons add `@mdi/js` themselves.
