<template>
  <fieldset class="cat-fieldset" :class="fieldsetClasses" :disabled="disabled">
    <legend v-if="hasLegend" class="label" :class="{ 'is-sr-only': hiddenLegend }">
      <slot name="label">
        {{ label }}
      </slot>
    </legend>
    <slot />
  </fieldset>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

/**
 * Fieldset wrapper for grouping related form controls under a single descriptive
 * legend. Use this around `cat-radio` siblings, multiple related fields, or any
 * cluster of inputs that should be announced as a group by assistive technology.
 *
 * Implements the WCAG/WAI-ARIA grouping pattern: a native `<fieldset>` + `<legend>`
 * is the semantic primitive screen readers expect.
 *
 * @component cat-fieldset
 * @example
 * <cat-fieldset label="Notifications">
 *   <cat-radio v-model="freq" native-value="daily">Daily</cat-radio>
 *   <cat-radio v-model="freq" native-value="weekly">Weekly</cat-radio>
 * </cat-fieldset>
 *
 * @example Hidden legend (still announced by screen readers):
 * <cat-fieldset label="Toolbar" hidden-legend>
 *   <cat-button>Bold</cat-button>
 *   <cat-button>Italic</cat-button>
 * </cat-fieldset>
 */

const slots = useSlots()

const props = withDefaults(defineProps<{
  /** Group label rendered inside `<legend>`. */
  label?: string
  /** Disable all nested form controls via the native `<fieldset disabled>` attribute. */
  disabled?: boolean
  /** Visually hide the legend while keeping it readable by assistive technology. */
  hiddenLegend?: boolean
}>(), {
  label: undefined,
  disabled: false,
  hiddenLegend: false
})

const hasLegend = computed(() => Boolean(props.label || slots.label))

const fieldsetClasses = computed(() => {
  const classes: string[] = []
  if (props.disabled) classes.push('is-disabled')
  return classes
})
</script>

<style lang="scss" scoped>
.cat-fieldset {
  border: 0;
  padding: 0;
  margin: 0;
  min-inline-size: 0;

  > legend.label {
    padding: 0;
    margin-bottom: 0.5em;
  }
}
</style>
