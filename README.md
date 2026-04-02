# Catenary

A Vue 3 UI controls library built on [Bulma](https://bulma.io/) and [Material Design Icons](https://pictogrammers.com/library/mdi/). Catenary provides 30 general-purpose, domain-agnostic components designed to be reusable across any application.

Published to GitHub Packages as `@interline-io/catenary`.

## Installation

Configure your project to use the GitHub Packages registry for the `@interline-io` scope. Add to your project's `.npmrc`:

```
@interline-io:registry=https://npm.pkg.github.com
```

Then install:

```bash
pnpm add @interline-io/catenary
```

### Peer dependencies

Your project must provide:

- `vue` 3.5+
- `bulma` 1.0+ -- CSS framework (configured and loaded by your app)
- `@mdi/font` 7.4+ -- Material Design Icons (loaded by your app)

`date-fns` 4.x is a direct dependency and installed automatically.

## Usage

### Vue plugin (recommended)

Register all components globally with the `t-` prefix:

```ts
import { createApp } from 'vue'
import CatenaryPlugin from '@interline-io/catenary'
import '@interline-io/catenary/style.css'

const app = createApp(App)
app.use(CatenaryPlugin)
app.mount('#app')
```

Components are then available everywhere as `<t-button>`, `<t-input>`, `<t-modal>`, etc.

### Individual imports

For tree-shaking, import only the components you need:

```ts
import { TButton, TInput, TField } from '@interline-io/catenary'
import '@interline-io/catenary/style.css'
```

### Nuxt

Create a plugin file to register the components:

```ts
// app/plugins/catenary.ts
import CatenaryPlugin from '@interline-io/catenary'
import '@interline-io/catenary/style.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(CatenaryPlugin)
})
```

No Nuxt module configuration is needed. The plugin handles global registration of all `t-*` components.

### Bulma and icon CSS

The `@interline-io/catenary/style.css` export includes the component-scoped styles extracted from the library. It does **not** include the full Bulma stylesheet or Material Design Icons font. You must load those in your app's global styles:

```scss
// In your app's main stylesheet or entry point
@use "bulma/sass" with (
  $primary: #9e0e84,  // customize as needed
);

@use "@mdi/font/css/materialdesignicons.css";
```

Or via CDN/link tags if you prefer.

## Components

### Form controls

| Component | Tag | Description |
|-----------|-----|-------------|
| TButton | `<t-button>` | Button with variants, sizes, loading state, icons |
| TCheckbox | `<t-checkbox>` | Checkbox with v-model support |
| TCheckboxGroup | `<t-checkbox-group>` | Multiple checkboxes from an options array |
| TRadio | `<t-radio>` | Radio button |
| TSwitch | `<t-switch>` | Toggle switch |
| TInput | `<t-input>` | Text input with icons, types, variants |
| TTextarea | `<t-textarea>` | Multi-line text input |
| TSelect | `<t-select>` | Select dropdown |
| TTaginput | `<t-taginput>` | Tag-based input with autocomplete and custom options |
| TDatepicker | `<t-datepicker>` | Calendar date picker with single/multiple selection |
| TField | `<t-field>` | Form field wrapper (labels, horizontal layout, addons, grouping) |
| TSlider | `<t-slider>` | Range slider |
| TSliderTick | `<t-slider-tick>` | Tick mark for slider |

### Layout and navigation

| Component | Tag | Description |
|-----------|-----|-------------|
| TTabs | `<t-tabs>` | Tab navigation |
| TTabItem | `<t-tab-item>` | Individual tab panel |
| TDropdown | `<t-dropdown>` | Dropdown menu |
| TDropdownItem | `<t-dropdown-item>` | Item within a dropdown |
| TModal | `<t-modal>` | Modal dialog with sizes, fullscreen, footer slots |
| TCard | `<t-card>` | Card container with optional expand/collapse |

### Data display

| Component | Tag | Description |
|-----------|-----|-------------|
| TTable | `<t-table>` | Data table with sortable columns |
| TTableColumn | `<t-table-column>` | Column definition for table |
| TPagination | `<t-pagination>` | Page navigation |
| TTag | `<t-tag>` | Badge/label tag |
| TNotification | `<t-notification>` | Notification banner |
| TMsg | `<t-msg>` | Message box with icon, expand/collapse, close |

### Utilities

| Component | Tag | Description |
|-----------|-----|-------------|
| TIcon | `<t-icon>` | Material Design Icon wrapper |
| TLoading | `<t-loading>` | Loading spinner overlay |
| TTooltip | `<t-tooltip>` | Tooltip overlay |
| TSearchBar | `<t-search-bar>` | Search input with clear button |
| TThemeToggle | `<t-theme-toggle>` | Light/dark theme switcher |

## Variants and sizes

Most components accept `variant` and `size` props. The core set is:

```
Variants: primary, link, info, success, warning, danger
Sizes:    small, normal, medium, large
```

Some components extend these (e.g., buttons add `white`, `light`, `dark`, `text`, `ghost`). All variant and size constants are exported as TypeScript types and runtime arrays:

```ts
import { CoreVariants, ButtonVariants, type ButtonVariant } from '@interline-io/catenary'
```

## CSS conventions

Components follow a consistent class naming pattern:

- Root element gets both the Bulma class and a `t-` prefixed class: `class="card t-card"`
- Bulma helper classes are used directly for spacing, typography, and flexbox
- Custom classes invented by the library always use the `t-` prefix
- Variant styles use SCSS `@each` loops over Bulma CSS variables

## Development

Requires **Node v22.21.1** (see `.nvmrc`) and **pnpm**.

```bash
pnpm install
pnpm dev              # Start Nuxt playground at localhost:3000
pnpm build            # Build library (dist/catenary.js + types)
pnpm test             # Run tests (vitest + jsdom)
pnpm check            # TypeScript type check
```

The `playground/` directory is a Nuxt app with interactive demos for every component. It is a devDependency and is not included in the published package.

## Publishing

The library is automatically published to GitHub Packages on every push via GitHub Actions. Version is computed from `package.json` version + git SHA. Pushes to `main` receive the `latest` dist-tag.
