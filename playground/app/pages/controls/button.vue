<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Button Component
      </h1>
      <p class="subtitle">
        Interactive button control with various styles and states
      </p>

      <demo-box label="Variants">
        <div class="buttons">
          <cat-button>
            Default
          </cat-button>
          <cat-button v-for="variant in coreVariants" :key="variant" :variant="variant">
            {{ capitalize(variant) }}
          </cat-button>
        </div>
        <div class="buttons">
          <cat-button v-for="variant in additionalVariants" :key="variant" :variant="variant">
            {{ capitalize(variant) }}
          </cat-button>
        </div>
      </demo-box>

      <demo-box label="Sizes">
        <div class="buttons">
          <cat-button v-for="size in sizes" :key="size" :size="size">
            {{ capitalize(size) }}
          </cat-button>
        </div>
      </demo-box>

      <demo-box label="Outlined">
        <div class="buttons">
          <cat-button v-for="variant in coreVariants" :key="variant" :variant="variant" outlined>
            {{ capitalize(variant) }}
          </cat-button>
        </div>
        <div class="buttons">
          <cat-button v-for="variant in additionalVariants" :key="variant" :variant="variant" outlined>
            {{ capitalize(variant) }}
          </cat-button>
        </div>
      </demo-box>

      <demo-box label="Rounded">
        <div class="buttons">
          <cat-button variant="primary" rounded>
            Rounded
          </cat-button>
          <cat-button variant="info" rounded outlined>
            Rounded Outlined
          </cat-button>
        </div>
      </demo-box>

      <demo-box label="Icon Only">
        <!-- Icon-only buttons render no text, so each needs an explicit
             accessible name via aria-label (a declared prop). -->
        <div class="buttons">
          <cat-button variant="primary" aria-label="Favorite">
            <cat-icon icon="heart" />
          </cat-button>
          <cat-button variant="info" aria-label="Share">
            <cat-icon icon="share" />
          </cat-button>
          <cat-button variant="success" aria-label="Confirm">
            <cat-icon icon="check" />
          </cat-button>
          <cat-button variant="warning" aria-label="Warnings">
            <cat-icon icon="alert" />
          </cat-button>
          <cat-button variant="danger" aria-label="Close" title="Close">
            <cat-icon icon="close" />
          </cat-button>
        </div>
      </demo-box>

      <demo-box label="Icon Props (icon-left / icon-right)">
        <div class="buttons">
          <cat-button variant="primary" icon-left="check">
            Save
          </cat-button>
          <cat-button variant="danger" icon-left="delete">
            Delete
          </cat-button>
          <cat-button variant="info" icon-right="download">
            Download
          </cat-button>
          <cat-button variant="success" icon-left="upload" icon-right="check">
            Upload & Verify
          </cat-button>
        </div>
      </demo-box>

      <demo-box label="States">
        <div class="buttons">
          <cat-button variant="primary" loading>
            Loading
          </cat-button>
          <cat-button variant="info" disabled>
            Disabled
          </cat-button>
          <cat-button variant="success" @click="handleClick">
            Click Me ({{ clickCount }})
          </cat-button>
        </div>
      </demo-box>

      <demo-box label="Full Width">
        <cat-button variant="primary" fullwidth>
          Full Width Button
        </cat-button>
      </demo-box>

      <demo-box label="Button Groups">
        <cat-field addons>
          <cat-button variant="primary">
            Left
          </cat-button>
          <cat-button variant="primary">
            Middle
          </cat-button>
          <cat-button variant="primary">
            Right
          </cat-button>
        </cat-field>

        <cat-field addons>
          <cat-button>
            Yes
          </cat-button>
          <cat-button variant="info">
            Maybe
          </cat-button>
          <cat-button variant="danger">
            No
          </cat-button>
        </cat-field>
      </demo-box>

      <demo-a11y
        pattern-name="Button"
        pattern-url="https://www.w3.org/WAI/ARIA/apg/patterns/button/"
        :references="[
          { label: 'WCAG SC 1.4.11: Non-text Contrast', url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html', note: 'focus indicators must have 3:1 contrast against the adjacent background' },
          { label: 'WCAG SC 2.4.7: Focus Visible', url: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html' },
          { label: 'WCAG SC 4.1.2: Name, Role, Value', url: 'https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html', note: 'icon-only buttons need an accessible name' },
        ]"
        :keyboard="[
          { key: 'Space', description: 'Activates the button.' },
          { key: 'Enter', description: 'Activates the button.' },
        ]"
      >
        <template #notes>
          <p class="mt-3">
            <code>&lt;cat-button&gt;</code> renders as a native <code>&lt;button&gt;</code>, so all standard browser keyboard, focus, and form behaviors apply. Bulma's default focus ring is overridden with a <code>:focus-visible</code> outline that meets WCAG SC 1.4.11 (3:1 contrast) on the colored variants. Mouse clicks don't trigger the focus outline (only keyboard / programmatic focus does).
          </p>
          <p class="mt-3">
            Icon-only buttons render no text, so they need an explicit accessible name: pass <code>aria-label</code> (declared as a prop, so it typechecks under <code>strictTemplates</code>). Use the <code>title</code> prop for an advisory native tooltip when helpful.
          </p>
        </template>
      </demo-a11y>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CoreVariants, ButtonVariants, ButtonSizes } from '../../../../src/controls/types'
import DemoBox from '../../components/demo-box.vue'
import DemoA11y from '../../components/demo-a11y.vue'

const coreVariants = CoreVariants
const additionalVariants = ButtonVariants.filter(v => !CoreVariants.includes(v as any))
const sizes = ButtonSizes

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const clickCount = ref(0)

const handleClick = () => {
  clickCount.value++
}
</script>
