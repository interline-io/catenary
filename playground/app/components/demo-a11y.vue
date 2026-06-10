<template>
  <demo-box label="Accessibility">
    <p>
      <template v-if="patternName && patternUrl">
        Modeled on the
        <a :href="patternUrl" target="_blank" rel="noopener noreferrer">
          {{ patternName }} WAI-ARIA design pattern
        </a>.<template v-if="$slots.intro">
          <slot name="intro" />
        </template>
      </template>
      <template v-else-if="$slots.intro">
        <slot name="intro" />
      </template>
    </p>

    <ul v-if="references && references.length" class="cat-demo-a11y-refs">
      <li v-for="ref in references" :key="ref.url">
        <a :href="ref.url" target="_blank" rel="noopener noreferrer">{{ ref.label }}</a>
        <template v-if="ref.note">
          : {{ ref.note }}
        </template>
      </li>
    </ul>

    <template v-if="keyboard && keyboard.length">
      <h3 class="title is-6 mt-4 mb-2">
        Keyboard interactions
      </h3>
      <table class="table is-narrow is-fullwidth cat-demo-a11y-keys">
        <thead>
          <tr>
            <th style="width: 14rem;">
              Key
            </th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in keyboard" :key="i">
            <td>
              <template v-for="(k, j) in row.key.split(' / ')" :key="j">
                <span v-if="j > 0" class="cat-demo-a11y-kbd-sep"> / </span>
                <kbd>{{ k }}</kbd>
              </template>
            </td>
            <td>{{ row.description }}</td>
          </tr>
        </tbody>
      </table>
    </template>

    <slot name="notes" />
  </demo-box>
</template>

<script setup lang="ts">
import DemoBox from './demo-box.vue'

/**
 * Accessibility section for a playground component page. Renders inside a
 * demo-box and shows:
 *  - Pattern statement linking to the relevant WAI-ARIA Authoring Practices pattern
 *  - Optional list of additional references (WCAG SCs, W3C tutorials)
 *  - Keyboard interactions table
 *  - Optional free-form notes via the `notes` slot
 *
 * "Modeled on" wording is intentional: it accommodates components that
 * implement most of an APG pattern but document specific deviations in their
 * notes slot.
 *
 * @component demo-a11y
 * @internal
 *
 * @example
 * <demo-a11y
 *   pattern-name="Tabs"
 *   pattern-url="https://www.w3.org/WAI/ARIA/apg/patterns/tabs/"
 *   :keyboard="[
 *     { key: 'Tab', description: 'Moves focus to the active tab.' },
 *     { key: 'ArrowLeft / ArrowRight', description: 'Moves focus between tabs (horizontal).' },
 *   ]"
 * />
 */

interface Reference {
  label: string
  url: string
  note?: string
}

interface KeyboardRow {
  /** Key name or names. Multiple keys can be separated by ' / ' (e.g., 'ArrowLeft / ArrowRight'). */
  key: string
  /** What the key does in this component. */
  description: string
}

defineProps<{
  /** Name of the WAI-ARIA pattern this component is modeled on (e.g., "Tabs"). */
  patternName?: string
  /** Link to the WAI-ARIA Authoring Practices pattern page. */
  patternUrl?: string
  /** Optional additional reference links (WCAG SCs, W3C tutorials, etc.). */
  references?: Reference[]
  /** Optional table of keyboard interactions. */
  keyboard?: KeyboardRow[]
}>()
</script>

<style lang="scss" scoped>
@use "bulma/sass/utilities/initial-variables" as *;
@use "bulma/sass/utilities/derived-variables" as *;

.cat-demo-a11y-refs {
  list-style: disc;
  padding-left: 1.25rem;
  margin-top: 0.5rem;
}

.cat-demo-a11y-keys {
  margin-bottom: 1rem;

  kbd {
    background: $background;
    border: 1px solid $border;
    border-radius: 3px;
    padding: 0.1rem 0.4rem;
    font-family: monospace;
    font-size: 0.85em;
  }
}
</style>
