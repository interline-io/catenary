<template>
  <div class="control">
    <button
      class="button"
      :class="buttonClasses"
      :disabled="disabled || loading"
      :type="type"
      v-bind="$attrs"
      @click="handleClick"
    >
      <span v-if="loading" class="icon is-small">
        <i class="mdi mdi-loading mdi-spin" />
      </span>
      <cat-icon v-if="iconLeft && !loading" :icon="iconLeft" :size="iconSize" />
      <cat-icon v-if="isIconOnly && !loading" :icon="icon" :size="iconSize" aria-hidden="true" />
      <span v-if="$slots.default || label">
        <slot>{{ label }}</slot>
      </span>
      <cat-icon v-if="iconRight && !loading" :icon="iconRight" :size="iconSize" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import type { ButtonVariant, ButtonSize } from './types'
import CatIcon from './icon.vue'

/**
 * Button component with Bulma styling.
 * Supports variants, sizes, loading state, and standard button features.
 *
 * @component cat-button
 * @example
 * <cat-button>Click me</cat-button>
 * <cat-button variant="primary" @click="handleClick">Save</cat-button>
 * <cat-button variant="danger" :loading="isLoading">Delete</cat-button>
 */

// Inherit native button attributes
defineOptions({
  inheritAttrs: false
})

const slots = useSlots()

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick (event: MouseEvent): void {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}

interface Props {
  /**
   * Button color variant using Bulma color classes.
   */
  variant?: ButtonVariant

  /**
   * Button size using Bulma size classes.
   * @default undefined (normal size)
   */
  size?: ButtonSize

  /**
   * Show loading spinner and disable button.
   * @default false
   */
  loading?: boolean

  /**
   * Disable button interaction.
   * @default false
   */
  disabled?: boolean

  /**
   * Use outlined button style.
   * When true without a variant, defaults to 'dark' variant for a neutral black outline.
   * @default false
   */
  outlined?: boolean

  /**
   * Use inverted button style (for dark backgrounds).
   * @default false
   */
  inverted?: boolean

  /**
   * Make button full width.
   * @default false
   */
  fullwidth?: boolean

  /**
   * Make button rounded.
   * @default false
   */
  rounded?: boolean

  /**
   * HTML button type attribute.
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset'

  /**
   * Render an icon-only button. The MDI icon becomes the button's sole content
   * (use this instead of slotting a bare `<cat-icon>`, which renders at the
   * wrong size and inflates the button's height).
   *
   * Ignored when a default slot, `label`, `iconLeft`, or `iconRight` is present.
   *
   * Accessibility: an icon-only button has no text, so you MUST supply an
   * accessible name via `aria-label` / `aria-labelledby` (or wrap it in
   * `<cat-tooltip>` and label it). The rendered icon is marked `aria-hidden`.
   * @example <cat-button variant="primary" icon="magnify" aria-label="Search" />
   * @default undefined
   */
  icon?: string

  /**
   * Icon to display on the left side of the button.
   * @default undefined
   */
  iconLeft?: string

  /**
   * Icon to display on the right side of the button.
   * @default undefined
   */
  iconRight?: string

  /**
   * Button label text (alternative to using default slot).
   */
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: undefined,
  size: undefined,
  loading: false,
  disabled: false,
  outlined: false,
  inverted: false,
  fullwidth: false,
  rounded: false,
  type: 'button',
  icon: undefined,
  iconLeft: undefined,
  iconRight: undefined,
  label: undefined
})

// True when `icon` should render as the button's sole content: an explicit
// label/slot or a left/right icon take precedence over the icon-only shorthand.
const isIconOnly = computed((): boolean =>
  !!props.icon && !props.label && !props.iconLeft && !props.iconRight && !slots.default)

const buttonClasses = computed(() => {
  const classes: string[] = []

  // If outlined is used without a variant, default to 'dark' to avoid white-on-white in Bulma 1.x
  const effectiveVariant = props.variant || (props.outlined ? 'dark' : undefined)

  if (effectiveVariant) {
    classes.push(`is-${effectiveVariant}`)
  }

  if (props.size) {
    classes.push(`is-${props.size}`)
  }

  if (props.outlined) {
    classes.push('is-outlined')
  }

  if (props.inverted) {
    classes.push('is-inverted')
  }

  if (props.fullwidth) {
    classes.push('is-fullwidth')
  }

  if (props.rounded) {
    classes.push('is-rounded')
  }

  if (props.loading) {
    classes.push('is-loading')
  }

  return classes
})

// Map button size to appropriate icon size
// Following Bulma's icon-in-button patterns
const iconSize = computed((): 'small' | 'medium' | 'large' | undefined => {
  // For small/normal buttons, use small icons
  // For medium buttons, use default (undefined) icons
  // For large buttons, use medium icons
  if (props.size === 'large') {
    return 'medium'
  }
  if (props.size === 'medium') {
    return undefined // default size
  }
  // small or normal button -> small icon
  return 'small'
})
</script>

<style lang="scss" scoped>
@use "bulma/sass/utilities/initial-variables" as *;
@use "bulma/sass/utilities/derived-variables" as *;

/**
 * WCAG 2.1 SC 1.4.11 / 2.4.7: focused buttons must have a focus indicator with
 * at least 3:1 contrast against the button background. Bulma's default focus
 * shadow on color variants (especially is-primary / is-link) doesn't meet that
 * threshold on light backgrounds, so we layer a high-contrast outline on top.
 *
 * Uses :focus-visible so mouse clicks don't trigger the outline — only keyboard
 * focus does.
 */
.button:focus-visible {
  outline: 2px solid $black;
  outline-offset: 2px;
  // Bulma's box-shadow focus ring stays for the "soft" look on light variants.
}

// Variants with dark backgrounds need a light outline instead.
@each $name in (primary, link, info, success, warning, danger, dark) {
  .button.is-#{$name}:not(.is-outlined):not(.is-inverted):focus-visible {
    outline-color: $white;
  }
}
</style>
