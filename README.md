<figure>
  <img src="./docs/catbus.jpg" alt="still from the film 'My Neighbor Toroto' showing the Catbus in front of a train with a catenary power supply" />
  <figcaption><a href="https://ghibli.fandom.com/wiki/Catbus?file=Carbus_and_Everyone.jpg">Film still © Studio Ghibli</a></figcaption>
</figure>

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

Register all components globally with the `cat-` prefix:

```ts
import { createApp } from 'vue'
import CatenaryPlugin from '@interline-io/catenary'
import '@interline-io/catenary/style.css'

const app = createApp(App)
app.use(CatenaryPlugin)
app.mount('#app')
```

Components are then available everywhere as `<cat-button>`, `<cat-input>`, `<cat-modal>`, etc.

### Individual imports

For tree-shaking, import only the components you need:

```ts
import { CatButton, CatInput, CatField } from '@interline-io/catenary'
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

No Nuxt module configuration is needed. The plugin handles global registration of all `cat-*` components.

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
| CatButton | `<cat-button>` | Button with variants, sizes, loading state, icons |
| CatCheckbox | `<cat-checkbox>` | Checkbox with v-model support |
| CatCheckboxGroup | `<cat-checkbox-group>` | Multiple checkboxes from an options array |
| CatRadio | `<cat-radio>` | Radio button |
| CatSwitch | `<cat-switch>` | Toggle switch |
| CatInput | `<cat-input>` | Text input with icons, types, variants |
| CatTextarea | `<cat-textarea>` | Multi-line text input |
| CatSelect | `<cat-select>` | Select dropdown |
| CatTaginput | `<cat-taginput>` | Tag-based input with autocomplete and custom options |
| CatDatepicker | `<cat-datepicker>` | Calendar date picker with single/multiple selection |
| CatField | `<cat-field>` | Form field wrapper (labels, horizontal layout, addons, grouping) |
| CatSlider | `<cat-slider>` | Range slider |
| CatSliderTick | `<cat-slider-tick>` | Tick mark for slider |

### Layout and navigation

| Component | Tag | Description |
|-----------|-----|-------------|
| CatTabs | `<cat-tabs>` | Tab navigation |
| CatTabItem | `<cat-tab-item>` | Individual tab panel |
| CatDropdown | `<cat-dropdown>` | Dropdown menu |
| CatDropdownItem | `<cat-dropdown-item>` | Item within a dropdown |
| CatModal | `<cat-modal>` | Modal dialog with sizes, fullscreen, footer slots |
| CatCard | `<cat-card>` | Card container with optional expand/collapse |

### Data display

| Component | Tag | Description |
|-----------|-----|-------------|
| CatTable | `<cat-table>` | Data table with sortable columns |
| CatTableColumn | `<cat-table-column>` | Column definition for table |
| CatPagination | `<cat-pagination>` | Page navigation |
| CatTag | `<cat-tag>` | Badge/label tag |
| CatNotification | `<cat-notification>` | Notification banner |
| CatMsg | `<cat-msg>` | Message box with icon, expand/collapse, close |

### Utilities

| Component | Tag | Description |
|-----------|-----|-------------|
| CatIcon | `<cat-icon>` | Material Design Icon wrapper |
| CatLoading | `<cat-loading>` | Loading spinner overlay |
| CatTooltip | `<cat-tooltip>` | Tooltip overlay |
| CatSearchBar | `<cat-search-bar>` | Search input with clear button |
| CatThemeToggle | `<cat-theme-toggle>` | Light/dark theme switcher |

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

- Root element gets both the Bulma class and a `cat-` prefixed class: `class="card cat-card"`
- Bulma helper classes are used directly for spacing, typography, and flexbox
- Custom classes invented by the library always use the `cat-` prefix
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
