<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Split Button Component
      </h1>
      <p class="subtitle">
        A primary action with an attached dropdown of related actions
      </p>

      <demo-box label="Basic Split Button">
        <cat-split-button label="Save" variant="primary" @click="record('Save')" @select="record">
          <cat-dropdown-item value="Save as draft">
            <cat-icon icon="file-document-outline" size="small" />
            <span>Save as draft</span>
          </cat-dropdown-item>
          <cat-dropdown-item value="Save a copy">
            <cat-icon icon="content-copy" size="small" />
            <span>Save a copy</span>
          </cat-dropdown-item>
          <cat-dropdown-item separator />
          <cat-dropdown-item value="Save and close">
            <cat-icon icon="check-all" size="small" />
            <span>Save and close</span>
          </cat-dropdown-item>
        </cat-split-button>
        <p class="mt-3">
          Last action: <strong>{{ lastAction || 'none' }}</strong>
        </p>
      </demo-box>

      <demo-box label="Variants">
        <p class="mb-3">
          Bulma zeroes the border on filled variants, so the seam between the two halves is drawn
          from the button's own text color rather than a border.
        </p>
        <div class="cat-demo-row">
          <cat-split-button
            v-for="variant in buttonVariants"
            :key="variant"
            :label="capitalize(variant)"
            :variant="variant"
          >
            <cat-dropdown-item value="1">
              Option 1
            </cat-dropdown-item>
            <cat-dropdown-item value="2">
              Option 2
            </cat-dropdown-item>
          </cat-split-button>
        </div>
      </demo-box>

      <demo-box label="Default and Outlined">
        <p class="mb-3">
          These keep a real border, so the halves share a single collapsed 1px line.
        </p>
        <div class="cat-demo-row">
          <cat-split-button label="Default">
            <cat-dropdown-item value="1">
              Option 1
            </cat-dropdown-item>
            <cat-dropdown-item value="2">
              Option 2
            </cat-dropdown-item>
          </cat-split-button>
          <cat-split-button v-for="variant in coreVariants" :key="variant" :label="capitalize(variant)" :variant="variant" outlined>
            <cat-dropdown-item value="1">
              Option 1
            </cat-dropdown-item>
            <cat-dropdown-item value="2">
              Option 2
            </cat-dropdown-item>
          </cat-split-button>
        </div>
      </demo-box>

      <demo-box label="Inverted">
        <p class="mb-3">
          Bulma's <code>is-inverted</code> swaps background and text color but does not restore the
          border the filled variant removed, so these need the seam just as much as the filled ones.
        </p>
        <div class="cat-demo-row cat-demo-dark">
          <cat-split-button
            v-for="variant in coreVariants"
            :key="variant"
            :label="capitalize(variant)"
            :variant="variant"
            inverted
          >
            <cat-dropdown-item value="1">
              Option 1
            </cat-dropdown-item>
            <cat-dropdown-item value="2">
              Option 2
            </cat-dropdown-item>
          </cat-split-button>
        </div>
      </demo-box>

      <demo-box label="Sizes">
        <div class="cat-demo-row">
          <cat-split-button
            v-for="size in sizes"
            :key="size"
            :label="capitalize(size)"
            :size="size"
            variant="link"
          >
            <cat-dropdown-item value="1">
              Option 1
            </cat-dropdown-item>
            <cat-dropdown-item value="2">
              Option 2
            </cat-dropdown-item>
          </cat-split-button>
        </div>
      </demo-box>

      <demo-box label="With a Leading Icon">
        <div class="cat-demo-row">
          <cat-split-button label="Export" variant="success" icon-left="download">
            <cat-dropdown-item value="csv">
              Export as CSV
            </cat-dropdown-item>
            <cat-dropdown-item value="json">
              Export as JSON
            </cat-dropdown-item>
          </cat-split-button>
        </div>
      </demo-box>

      <demo-box label="Loading and Disabled">
        <p class="mb-3">
          <code>loading</code> spins the action half while the menu stays usable.
          <code>disabled</code> disables both halves; <code>toggle-disabled</code> disables only the caret.
        </p>
        <div class="cat-demo-row">
          <cat-split-button label="Saving" variant="primary" loading>
            <cat-dropdown-item value="cancel">
              Cancel
            </cat-dropdown-item>
          </cat-split-button>
          <cat-split-button label="Disabled" variant="primary" disabled>
            <cat-dropdown-item value="1">
              Option 1
            </cat-dropdown-item>
          </cat-split-button>
          <cat-split-button label="Menu disabled" variant="primary" toggle-disabled>
            <cat-dropdown-item value="1">
              Option 1
            </cat-dropdown-item>
          </cat-split-button>
        </div>
      </demo-box>

      <demo-box label="Menu Placement">
        <p class="mb-3">
          The menu is right-aligned by default so it lines up with the right edge of the whole
          control. Use <code>position</code> to change it.
        </p>
        <div class="cat-demo-row">
          <cat-split-button
            v-for="position in positions"
            :key="position"
            :label="position"
            :position="position"
            variant="info"
          >
            <cat-dropdown-item value="1">
              Option 1
            </cat-dropdown-item>
            <cat-dropdown-item value="2">
              Option 2
            </cat-dropdown-item>
          </cat-split-button>
        </div>
      </demo-box>

      <demo-box label="Full Width">
        <cat-split-button label="Publish" variant="primary" fullwidth :menu-width="240">
          <cat-dropdown-item value="schedule">
            Schedule for later
          </cat-dropdown-item>
          <cat-dropdown-item value="preview">
            Preview before publishing
          </cat-dropdown-item>
        </cat-split-button>
      </demo-box>

      <demo-a11y
        pattern-name="Menu Button"
        pattern-url="https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/"
        :references="[
          { label: 'WCAG 2.1 SC 4.1.2: Name, Role, Value', url: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html', note: 'the caret half renders no text and needs an explicit name' },
        ]"
        :keyboard="[
          { key: 'Tab', description: 'Moves focus to the action half, then to the caret half. They are two separate controls.' },
          { key: 'Enter / Space', description: 'When focus is on the action half, fires the action. When focus is on the caret, toggles the menu and places focus on the first item.' },
          { key: 'ArrowDown', description: 'When focus is on the caret, opens the menu and places focus on the first item.' },
          { key: 'ArrowUp', description: 'When focus is on the caret, opens the menu and places focus on the last item.' },
          { key: 'ArrowDown / ArrowUp', description: 'When focus is inside the menu, moves focus to the next / previous item. Wraps at the ends.' },
          { key: 'Home / End', description: 'When focus is inside the menu, moves focus to the first / last item.' },
          { key: 'Escape', description: 'Closes the menu and returns focus to the caret.' },
        ]"
      >
        <template #notes>
          <p class="mt-3">
            The two halves are separately focusable controls, which is what the pattern requires: a
            split button that trapped both behaviors on one element could not expose both an action
            and a popup to assistive technology.
          </p>
          <p class="mt-2">
            The caret half renders only an icon, so it needs its own accessible name.
            <code>toggle-label</code> sets it; by default it is derived from the action label
            (<code>label="Save"</code> gives <code>"More Save options"</code>), which keeps several
            split buttons on one page distinguishable. Set it explicitly when the action label comes
            from the <code>label</code> slot rather than the prop.
          </p>
          <p class="mt-2">
            Popup semantics (<code>aria-haspopup</code>, <code>aria-controls</code>,
            <code>aria-expanded</code>) sit on the caret half only — the action half opens nothing.
            Menu keyboard behavior is <code>cat-dropdown</code>'s.
          </p>
        </template>
      </demo-a11y>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CoreVariants, ButtonSizes } from '../../../../src/controls/types'
import type { ButtonVariant } from '../../../../src/controls/types'
import DemoBox from '../../components/demo-box.vue'
import DemoA11y from '../../components/demo-a11y.vue'

const buttonVariants: ButtonVariant[] = [...CoreVariants, 'light', 'dark']
const coreVariants = CoreVariants
const sizes = ButtonSizes
const positions = ['bottom-left', 'bottom-right', 'top-left', 'top-right'] as const

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const lastAction = ref('')
const record = (value: string) => {
  lastAction.value = value
}
</script>

<style lang="scss" scoped>
/* Demo scaffolding: lay the split buttons out in a wrapping row. A plain
   Bulma `.buttons` wrapper would apply its has-addons-adjacent spacing rules
   to the group, so use a bare flex row instead. */
.cat-demo-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

/* Inverted buttons are meant for a dark surface; on the page background they
   would be invisible in light mode. Deliberately theme-independent. */
.cat-demo-dark {
  background-color: var(--bulma-dark);
  padding: 1rem;
  border-radius: var(--bulma-radius);
}
</style>
