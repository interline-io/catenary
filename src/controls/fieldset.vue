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
import { computed, useSlots, provide, useId } from 'vue'

import { RadioGroupNameKey } from './types'

/**
 * Fieldset wrapper for grouping related form controls under a single descriptive
 * legend. Use this around `cat-radio` siblings, multiple related fields, or any
 * cluster of inputs that should be announced as a group by assistive technology.
 *
 * Implements the WCAG/WAI-ARIA grouping pattern: a native `<fieldset>` + `<legend>`
 * is the semantic primitive screen readers expect.
 *
 * @component cat-fieldset
 * @example Radio group -- `radio-group` supplies the shared `name` that makes
 * the radios one native group. It is opt-in: without it a fieldset holding two
 * separate questions would merge them into a single group.
 * <cat-fieldset label="Notifications" radio-group>
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
  /**
   * Treat every nested `cat-radio` as one radio group, supplying the shared
   * `name` that natively makes it one. Opt-in: a fieldset is a generic grouping
   * wrapper, so naming its radios automatically would merge two independent
   * questions in the same fieldset into a single group. Radios that carry their
   * own `name` keep it.
   */
  radioGroup?: boolean
}>(), {
  label: undefined,
  disabled: false,
  hiddenLegend: false,
  radioGroup: false
})

/*
 * Sharing a `v-model` does not group radios — only a shared `name` does; see
 * RadioGroupNameKey. Provided unconditionally so that a nested fieldset without
 * `radio-group` shadows an outer one's name rather than inheriting it, which
 * is what lets a second question sit inside a grouped fieldset.
 */
const groupName = useId()
provide(RadioGroupNameKey, computed(() => (props.radioGroup ? groupName : undefined)))

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
