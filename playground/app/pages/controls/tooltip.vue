<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Tooltip Component
      </h1>
      <p class="subtitle">
        Contextual information on hover
      </p>

      <demo-box label="Basic Tooltip">
        <div class="has-text-centered">
          <cat-tooltip text="This is a tooltip">
            <cat-button>
              Hover me
            </cat-button>
          </cat-tooltip>
        </div>
      </demo-box>

      <demo-box label="Positions">
        <div class="has-text-centered mb-4">
          <cat-tooltip text="Top tooltip" position="top">
            <cat-button>
              Top
            </cat-button>
          </cat-tooltip>
        </div>
        <div class="is-flex is-justify-content-space-between mb-4">
          <cat-tooltip text="Left tooltip" position="left">
            <cat-button>
              Left
            </cat-button>
          </cat-tooltip>
          <cat-tooltip text="Right tooltip" position="right">
            <cat-button>
              Right
            </cat-button>
          </cat-tooltip>
        </div>
        <div class="has-text-centered">
          <cat-tooltip text="Bottom tooltip" position="bottom">
            <cat-button>
              Bottom
            </cat-button>
          </cat-tooltip>
        </div>
      </demo-box>

      <demo-box label="With Icons">
        <div class="buttons">
          <cat-tooltip text="Save changes">
            <cat-button icon="content-save" aria-label="Save changes" />
          </cat-tooltip>
          <cat-tooltip text="Edit item">
            <cat-button icon="pencil" aria-label="Edit item" />
          </cat-tooltip>
          <cat-tooltip text="Delete item">
            <cat-button icon="delete" aria-label="Delete item" />
          </cat-tooltip>
          <cat-tooltip text="Download file">
            <cat-button icon="download" aria-label="Download file" />
          </cat-tooltip>
          <cat-tooltip text="Share content">
            <cat-button icon="share-variant" aria-label="Share content" />
          </cat-tooltip>
        </div>
      </demo-box>

      <demo-box label="Example: Form Field Help" example>
        <cat-field label="Username:">
          <div class="is-flex">
            <cat-input v-model="username" expanded />
            <cat-tooltip text="Username must be 3-20 characters, alphanumeric only" position="right">
              <cat-button class="ml-2" icon="help-circle" aria-label="Username requirements" />
            </cat-tooltip>
          </div>
        </cat-field>

        <cat-field label="Password:">
          <div class="is-flex">
            <cat-input v-model="password" type="password" expanded />
            <cat-tooltip text="Password must be at least 8 characters with uppercase, lowercase, and numbers" position="right">
              <cat-button class="ml-2" icon="help-circle" aria-label="Password requirements" />
            </cat-tooltip>
          </div>
        </cat-field>
      </demo-box>

      <demo-box label="Example: Text with Tooltip" example>
        <p>
          Hover over
          <cat-tooltip text="This is an abbreviation for 'example'" position="top" affordance>
            <span>
              e.g.
            </span>
          </cat-tooltip>
          to see its meaning.
        </p>
        <p class="mt-3">
          The term
          <cat-tooltip text="Application Programming Interface" position="top" affordance>
            <span>
              API
            </span>
          </cat-tooltip>
          is commonly used in software development.
        </p>
      </demo-box>

      <demo-box label="Example: Status Indicators" example>
        <table class="table is-fullwidth">
          <thead>
            <tr>
              <th>Service</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Web Server</td>
              <td>
                <cat-tooltip text="All systems operational">
                  <cat-icon icon="check-circle" class="has-text-success" />
                </cat-tooltip>
              </td>
            </tr>
            <tr>
              <td>Database</td>
              <td>
                <cat-tooltip text="All systems operational">
                  <cat-icon icon="check-circle" class="has-text-success" />
                </cat-tooltip>
              </td>
            </tr>
            <tr>
              <td>Email Service</td>
              <td>
                <cat-tooltip text="Experiencing minor delays">
                  <cat-icon icon="alert" class="has-text-warning" />
                </cat-tooltip>
              </td>
            </tr>
            <tr>
              <td>API Gateway</td>
              <td>
                <cat-tooltip text="Service unavailable - maintenance in progress">
                  <cat-icon icon="alert-circle" class="has-text-danger" />
                </cat-tooltip>
              </td>
            </tr>
          </tbody>
        </table>
      </demo-box>

      <demo-box label="Example: Navigation Menu" example>
        <div class="buttons">
          <cat-tooltip text="Dashboard" position="bottom">
            <cat-button icon="view-dashboard" aria-label="Dashboard" />
          </cat-tooltip>
          <cat-tooltip text="Messages" position="bottom">
            <cat-button icon="email" aria-label="Messages" />
          </cat-tooltip>
          <cat-tooltip text="Notifications" position="bottom">
            <cat-button icon="bell" aria-label="Notifications" />
          </cat-tooltip>
          <cat-tooltip text="Settings" position="bottom">
            <cat-button icon="cog" aria-label="Settings" />
          </cat-tooltip>
          <cat-tooltip text="User Profile" position="bottom">
            <cat-button icon="account-circle" aria-label="User Profile" />
          </cat-tooltip>
        </div>
      </demo-box>

      <demo-box label="Example: Interactive Toolbar" example>
        <div class="buttons">
          <cat-tooltip text="Bold (Ctrl+B)" position="bottom">
            <cat-button icon="format-bold" aria-label="Bold (Ctrl+B)" />
          </cat-tooltip>
          <cat-tooltip text="Italic (Ctrl+I)" position="bottom">
            <cat-button icon="format-italic" aria-label="Italic (Ctrl+I)" />
          </cat-tooltip>
          <cat-tooltip text="Underline (Ctrl+U)" position="bottom">
            <cat-button icon="format-underline" aria-label="Underline (Ctrl+U)" />
          </cat-tooltip>
          <cat-tooltip text="Align Left" position="bottom">
            <cat-button icon="format-align-left" aria-label="Align Left" />
          </cat-tooltip>
          <cat-tooltip text="Align Center" position="bottom">
            <cat-button icon="format-align-center" aria-label="Align Center" />
          </cat-tooltip>
          <cat-tooltip text="Align Right" position="bottom">
            <cat-button icon="format-align-right" aria-label="Align Right" />
          </cat-tooltip>
          <cat-tooltip text="Insert Link" position="bottom">
            <cat-button icon="link" aria-label="Insert Link" />
          </cat-tooltip>
          <cat-tooltip text="Insert Image" position="bottom">
            <cat-button icon="image" aria-label="Insert Image" />
          </cat-tooltip>
        </div>
      </demo-box>

      <demo-box label="Example: Tags with Info" example>
        <div class="tags">
          <cat-tooltip text="Primary programming language" position="top">
            <cat-tag>
              TypeScript
            </cat-tag>
          </cat-tooltip>
          <cat-tooltip text="UI framework" position="top">
            <cat-tag>
              Vue.js
            </cat-tag>
          </cat-tooltip>
          <cat-tooltip text="Meta framework for Vue" position="top">
            <cat-tag>
              Nuxt
            </cat-tag>
          </cat-tooltip>
          <cat-tooltip text="CSS framework" position="top">
            <cat-tag>
              Bulma
            </cat-tag>
          </cat-tooltip>
        </div>
      </demo-box>

      <demo-box label="Inside Clipping Containers">
        <p class="mb-3">
          Bubbles render in the browser's top layer (Popover API), so they
          escape <code>overflow: hidden</code>/<code>auto</code> ancestors,
          z-index stacking, and inherited typography like Bulma's uppercase
          <code>.menu-label</code>.
        </p>
        <div
          class="p-4"
          style="width: 280px; height: 120px; overflow: auto; border: 1px dashed #999;"
        >
          <p class="menu-label">
            Scrollable panel
            <cat-tooltip text="This tooltip is wider than its scrollable, overflow-clipped container — and renders sentence-case despite the uppercase menu-label around it.">
              <cat-icon icon="information" size="small" />
            </cat-tooltip>
          </p>
          <p>
            A narrow <code>overflow: auto</code> box like a filter sidebar.
          </p>
        </div>
      </demo-box>

      <demo-box label="Affordance and Motion">
        <p class="mb-3">
          Nothing on screen tells a pointer user a tooltip exists unless the trigger says so.
          <code>affordance</code> adds <code>cursor: help</code> and a dotted underline. It is opt-in,
          because it changes how slot content looks at every existing call site.
        </p>
        <div class="cat-demo-row">
          <cat-tooltip text="No affordance — you have to find this by chance">
            <span>Plain trigger</span>
          </cat-tooltip>
          <cat-tooltip text="The dotted underline and help cursor mark this as explainable" affordance>
            <span>With affordance</span>
          </cat-tooltip>
          <cat-tooltip text="No fade in or out" :animated="false" affordance>
            <span>animated=false</span>
          </cat-tooltip>
        </div>
        <p class="mt-3">
          The fade is also suppressed automatically under <code>prefers-reduced-motion: reduce</code>,
          matching <code>cat-collapse</code> and <code>cat-steps</code>.
        </p>
      </demo-box>

      <demo-a11y
        pattern-name="Tooltip"
        pattern-url="https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/"
        :keyboard="[
          { key: 'Escape', description: 'Dismisses the tooltip.' },
        ]"
      >
        <template #notes>
          <p class="mt-3">
            Tooltips show on hover (mouseenter) and keyboard focus (focusin), and hide on mouseleave, focusout, or Escape. Per the WAI-ARIA pattern, the tooltip stays open while focus or the cursor remains inside the wrapper.
          </p>
          <p class="mt-2">
            WCAG 1.4.13 (Content on Hover or Focus) asks for three things, and the bubble does all of them. It is <strong>hoverable</strong>: the pointer can move onto it to read or select long text, which matters for anyone using magnification — a short close delay bridges the gap between trigger and bubble so crossing it does not dismiss. It is <strong>dismissible</strong> without moving the pointer: Escape closes it even when focus is somewhere else entirely. And it is <strong>persistent</strong> until dismissed, rather than timing out.
          </p>
          <p class="mt-2">
            Escape goes through the shared dismiss stack, so a tooltip open inside a <code>cat-modal</code> takes the first press and the dialog stays open — one layer per press.
          </p>
          <p class="mt-2">
            Focus shows the tooltip only when the focus did not come from a pointer press. When the slot has no focusable child the wrapper becomes the tab stop, so without that a click would focus it and leave the bubble up after the pointer had gone.
          </p>
          <p class="mt-2">
            When the slot contains a focusable element (e.g., a <code>&lt;button&gt;</code>), <code>aria-describedby</code> is applied to that element so screen readers announce the tooltip text on focus. When the slot has no focusable child, the wrapper itself becomes the tab stop (<code>tabindex="0"</code>) and carries <code>aria-describedby</code>.
          </p>
          <p class="mt-2">
            Tooltips per the spec should not contain interactive content; for that, build a non-modal dialog (popover) instead.
          </p>
          <p class="mt-2">
            <code>aria-describedby</code> supplies a <em>description</em>, not a name, so an icon-only trigger still needs its own <code>aria-label</code> — every trigger on this page passes one, usually the same words as the tooltip.
          </p>
        </template>
      </demo-a11y>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DemoBox from '../../components/demo-box.vue'
import DemoA11y from '../../components/demo-a11y.vue'

const username = ref('')
const password = ref('')
</script>

<style lang="scss" scoped>
/* Demo scaffolding: a wrapping row with room for the bubbles to sit above. */
.cat-demo-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2rem;
  padding-top: 1rem;
}
</style>
