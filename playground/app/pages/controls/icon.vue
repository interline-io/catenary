<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Icon Component
      </h1>
      <p class="subtitle">
        Material Design Icons integration
      </p>

      <!-- Basic Icons -->
      <demo-box label="Basic Icons">
        <div class="is-flex is-align-items-center" style="gap: 1rem;">
          <cat-icon icon="home" />
          <cat-icon icon="account" />
          <cat-icon icon="cog" />
          <cat-icon icon="bell" />
          <cat-icon icon="email" />
          <cat-icon icon="heart" />
          <cat-icon icon="star" />
          <cat-icon icon="check" />
        </div>
      </demo-box>

      <!-- Inline SVG or webfont -->
      <demo-box label="Inline SVG or Webfont">
        <p class="mb-3">
          A registered icon name renders as an inline <code>&lt;svg&gt;</code> with its path from
          <a href="https://pictogrammers.com/docs/library/mdi/getting-started/vuejs/" target="_blank" rel="noopener noreferrer"><code>@mdi/js</code><span class="is-sr-only"> (opens in a new tab)</span></a>.
          Any other name falls back to the <code>mdi mdi-&lt;name&gt;</code> class from
          <a href="https://pictogrammers.com/docs/library/mdi/getting-started/webfont/" target="_blank" rel="noopener noreferrer"><code>@mdi/font</code><span class="is-sr-only"> (opens in a new tab)</span></a>,
          which shows nothing unless the webfont is loaded. Both are the same size, so they can sit side by side. Most demos on this
          page use names Catenary does not register, so they render through the webfont, which this playground loads.
        </p>
        <table class="table is-narrow">
          <thead>
            <tr>
              <th scope="col">
                Icon
              </th>
              <th scope="col">
                Name
              </th>
              <th scope="col">
                Renders as
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="name in comparedIcons" :key="name">
              <td><cat-icon :icon="name" /></td>
              <td><code>{{ name }}</code></td>
              <td>{{ iconPath(name) ? 'Inline SVG (registered)' : 'Webfont class (not registered)' }}</td>
            </tr>
          </tbody>
        </table>

        <p class="mt-4 mb-2">
          Register an app's own icons through the plugin, or with <code>registerIcons()</code> anywhere before they render. An app
          that registers every icon it uses can stop loading <code>@mdi/font</code>.
        </p>
        <pre v-pre class="content"><code>import { mdiAccount, mdiCog } from '@mdi/js'
import { CatenaryPlugin, registerIcons } from '@interline-io/catenary'

app.use(CatenaryPlugin, { icons: { account: mdiAccount, cog: mdiCog } })
// or, outside the plugin:
registerIcons({ account: mdiAccount })</code></pre>

        <p class="mt-4 mb-2">
          Catenary registers the {{ builtInIcons.length }} icons its own controls use, so they need no webfont:
        </p>
        <div class="tags">
          <span v-for="name in builtInIcons" :key="name" class="tag">
            <cat-icon :icon="name" size="small" class="mr-1" />{{ name }}
          </span>
        </div>
      </demo-box>

      <!-- Plugin options -->
      <demo-box label="Plugin Options">
        <p class="mb-2">
          Two options, both off by default and both set on the plugin:
        </p>
        <ul class="content ml-5" style="list-style: disc;">
          <li>
            <code>strictIcons: 'warn' | 'error'</code> reports a name that is not registered, which would show nothing without the
            webfont. <code>'warn'</code> logs once per name outside production, which is the way to find every name an app uses
            before dropping the font. <code>'error'</code> throws while rendering, for test suites.
          </li>
          <li>
            <code>iconSprite: true</code> draws each icon as a <code>&lt;use&gt;</code> of a shared <code>&lt;symbol&gt;</code>, so
            each path appears once per page. Place <code>&lt;cat-icon-sprite /&gt;</code> once, last in the root layout. Without a
            mounted sprite, icons fall back to inline paths and warn in development.
          </li>
        </ul>
        <pre v-pre class="content mt-3"><code>app.use(CatenaryPlugin, { strictIcons: 'warn', iconSprite: true })

&lt;!-- app.vue, after everything else --&gt;
&lt;cat-icon-sprite /&gt;</code></pre>
        <p class="mt-3">
          To style or select an icon, target <code>.cat-icon-glyph</code>, or <code>[data-icon="&lt;name&gt;"]</code> for one icon.
          Both work whether the icon renders as SVG or as the webfont class. The SVG fills with <code>currentColor</code>, so a
          <code>color</code> on the icon or its container applies to either.
        </p>
      </demo-box>

      <!-- Sizes -->
      <demo-box label="Sizes">
        <div class="is-flex is-align-items-center" style="gap: 1rem;">
          <cat-icon icon="home" size="small" />
          <cat-icon icon="home" />
          <cat-icon icon="home" size="medium" />
          <cat-icon icon="home" size="large" />
        </div>
        <p class="has-text-grey mt-3">
          Sizes: small, normal (default), medium, large
        </p>
      </demo-box>

      <!-- Colors -->
      <demo-box label="Colors">
        <div class="is-flex is-align-items-center" style="gap: 1rem;">
          <cat-icon icon="heart" variant="primary" />
          <cat-icon icon="heart" variant="info" />
          <cat-icon icon="heart" variant="success" />
          <cat-icon icon="heart" variant="warning" />
          <cat-icon icon="heart" variant="danger" />
          <cat-icon icon="heart" variant="dark" />
        </div>
        <p class="has-text-grey mt-3">
          Use the <code>variant</code> prop to change icon colors
        </p>
      </demo-box>

      <!-- Common Icons -->
      <demo-box label="Common Icons">
        <div class="columns is-multiline">
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="home" />
              <span class="ml-2">home</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="account" />
              <span class="ml-2">account</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="cog" />
              <span class="ml-2">cog</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="bell" />
              <span class="ml-2">bell</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="email" />
              <span class="ml-2">email</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="heart" />
              <span class="ml-2">heart</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="star" />
              <span class="ml-2">star</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="check" />
              <span class="ml-2">check</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="close" />
              <span class="ml-2">close</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="menu" />
              <span class="ml-2">menu</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="search" />
              <span class="ml-2">search</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="plus" />
              <span class="ml-2">plus</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="pencil" />
              <span class="ml-2">pencil</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="delete" />
              <span class="ml-2">delete</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="upload" />
              <span class="ml-2">upload</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="download" />
              <span class="ml-2">download</span>
            </div>
          </div>
        </div>
      </demo-box>

      <!-- With Buttons -->
      <demo-box label="Icons in Buttons">
        <div class="buttons">
          <cat-button variant="primary">
            <cat-icon icon="plus" size="small" />
            <span>Add</span>
          </cat-button>
          <cat-button variant="info">
            <cat-icon icon="pencil" size="small" />
            <span>Edit</span>
          </cat-button>
          <cat-button variant="danger">
            <cat-icon icon="delete" size="small" />
            <span>Delete</span>
          </cat-button>
          <cat-button>
            <cat-icon icon="download" size="small" />
            <span>Download</span>
          </cat-button>
        </div>
        <div class="buttons">
          <cat-button variant="primary">
            <cat-icon icon="content-save" size="small" />
          </cat-button>
          <cat-button variant="info">
            <cat-icon icon="share-variant" size="small" />
          </cat-button>
          <cat-button>
            <cat-icon icon="dots-vertical" size="small" />
          </cat-button>
        </div>
      </demo-box>

      <!-- Navigation Icons -->
      <demo-box label="Navigation Icons">
        <div class="columns is-multiline">
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="arrow-left" />
              <span class="ml-2">arrow-left</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="arrow-right" />
              <span class="ml-2">arrow-right</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="arrow-up" />
              <span class="ml-2">arrow-up</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="arrow-down" />
              <span class="ml-2">arrow-down</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="chevron-left" />
              <span class="ml-2">chevron-left</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="chevron-right" />
              <span class="ml-2">chevron-right</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="chevron-up" />
              <span class="ml-2">chevron-up</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="chevron-down" />
              <span class="ml-2">chevron-down</span>
            </div>
          </div>
        </div>
      </demo-box>

      <!-- Status Icons -->
      <demo-box label="Status Icons">
        <div class="columns is-multiline">
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="check-circle" class="has-text-success" />
              <span class="ml-2">Success</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="information" class="has-text-info" />
              <span class="ml-2">Information</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="alert" class="has-text-warning" />
              <span class="ml-2">Warning</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="alert-circle" class="has-text-danger" />
              <span class="ml-2">Error</span>
            </div>
          </div>
        </div>
      </demo-box>

      <!-- File Type Icons -->
      <demo-box label="File Type Icons">
        <div class="columns is-multiline">
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="file-document" />
              <span class="ml-2">Document</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="file-image" />
              <span class="ml-2">Image</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="file-video" />
              <span class="ml-2">Video</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="file-music" />
              <span class="ml-2">Music</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="file-pdf-box" />
              <span class="ml-2">PDF</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="file-code" />
              <span class="ml-2">Code</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="folder" />
              <span class="ml-2">Folder</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="zip-box" />
              <span class="ml-2">Archive</span>
            </div>
          </div>
        </div>
      </demo-box>

      <!-- Social Media Icons -->
      <demo-box label="Social Media Icons">
        <div class="buttons">
          <cat-button>
            <cat-icon icon="facebook" size="small" />
          </cat-button>
          <cat-button>
            <cat-icon icon="twitter" size="small" />
          </cat-button>
          <cat-button>
            <cat-icon icon="instagram" size="small" />
          </cat-button>
          <cat-button>
            <cat-icon icon="linkedin" size="small" />
          </cat-button>
          <cat-button>
            <cat-icon icon="github" size="small" />
          </cat-button>
          <cat-button>
            <cat-icon icon="youtube" size="small" />
          </cat-button>
        </div>
      </demo-box>

      <demo-box label="Meaningful Icons (aria-label)">
        <p class="mb-3">
          Icons are decorative by default and hidden from screen readers. When an
          icon conveys information that no adjacent text does, give it an
          <code>aria-label</code> to announce it as an image:
        </p>
        <p>
          <cat-icon icon="alert" variant="warning" aria-label="Warning" />
          <span class="ml-2">Service alert on this route</span>
        </p>
        <p class="mt-2">
          <cat-icon icon="check-circle" variant="success" aria-label="Completed" />
          <span class="ml-2">Import finished</span>
        </p>
      </demo-box>

      <!-- Icon Reference -->
      <demo-box label="Icon Reference">
        <p>
          Icons come from <strong>Material Design Icons</strong> by Pictogrammers. Icon props take a name from the library
          without its <code>mdi-</code> prefix.
        </p>
        <ul class="content ml-5 mt-2" style="list-style: disc;">
          <li v-for="link in referenceLinks" :key="link.url">
            <a :href="link.url" target="_blank" rel="noopener noreferrer">{{ link.label }}<span class="is-sr-only"> (opens in a new tab)</span></a>
            <span v-if="link.note">: {{ link.note }}</span>
          </li>
        </ul>
      </demo-box>
      <demo-a11y
        :references="[
          { label: 'W3C: Images Tutorial, decorative images', url: 'https://www.w3.org/WAI/tutorials/images/decorative/' },
          { label: 'W3C: Images Tutorial, informative images', url: 'https://www.w3.org/WAI/tutorials/images/informative/' },
        ]"
      >
        <template #intro>
          Icons render with <code>aria-hidden="true"</code> by default: an icon next to text usually just repeats the text, and webfont glyphs sit in a private-use codepoint range that some screen readers otherwise voice as garbage. The inline SVG of a registered icon is likewise <code>aria-hidden</code>, and <code>focusable="false"</code> so older browsers do not put it in the tab order. Passing <code>aria-label</code> switches the icon to <code>role="img"</code> with that accessible name, for icons that carry meaning on their own (status markers, warnings).
        </template>
        <template #notes>
          <p class="mt-3">
            For icon-only buttons, put the accessible name on the button, not the icon (e.g. <code>&lt;cat-button icon="close" aria-label="Close" /&gt;</code>). For state conveyed by an icon (a checkmark on a selected item), expose the state with ARIA attributes like <code>aria-selected</code> rather than labeling the glyph.
          </p>
        </template>
      </demo-a11y>
    </section>
  </div>
</template>

<script setup lang="ts">
import DemoBox from '../../components/demo-box.vue'
import DemoA11y from '../../components/demo-a11y.vue'
import { iconPath, registeredIcons } from '../../../../src/util/icons'

// Three Catenary registers and three it does not, to show the two side by side
const comparedIcons = ['check', 'magnify', 'close-circle', 'home', 'account', 'cog']

// The playground registers nothing of its own, so this is Catenary's built-in set
const builtInIcons = registeredIcons()

const referenceLinks = [
  { label: 'Material Design Icons library', url: 'https://pictogrammers.com/library/mdi/', note: 'browse and search icon names' },
  { label: 'Using @mdi/js with Vue', url: 'https://pictogrammers.com/docs/library/mdi/getting-started/vuejs/', note: 'path data for registering icons' },
  { label: 'Using the @mdi/font webfont', url: 'https://pictogrammers.com/docs/library/mdi/getting-started/webfont/', note: 'the fallback for unregistered names' },
  { label: 'License', url: 'https://pictogrammers.com/docs/general/license/' },
  { label: 'MaterialDesign-JS on GitHub', url: 'https://github.com/Templarian/MaterialDesign-JS', note: 'source of @mdi/js' },
  { label: 'MaterialDesign-Webfont on GitHub', url: 'https://github.com/Templarian/MaterialDesign-Webfont', note: 'source of @mdi/font' }
]
</script>
