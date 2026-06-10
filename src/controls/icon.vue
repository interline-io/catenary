<template>
  <!-- Icons are decorative by default and hidden from assistive technology;
       passing ariaLabel marks the icon as meaningful (role="img" with that
       name). The @click here only re-emits to allow parent components to
       attach listeners; consumers must wrap clickable icons in a <button>
       (see how cat-button uses cat-icon for icon-only buttons). -->
  <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions, vuejs-accessibility/click-events-have-key-events -->
  <span
    class="icon"
    :class="[sizeClass, variantClass]"
    :role="ariaLabel ? 'img' : undefined"
    :aria-label="ariaLabel"
    :aria-hidden="ariaLabel ? undefined : 'true'"
    @click="handleClick"
  >
    <i :class="iconClass" />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * Icon component using Material Design Icons (MDI) with Bulma's icon container.
 *
 * Icons are decorative by default: the rendered span carries
 * aria-hidden="true" so screen readers skip it (icon-font glyphs sit in a
 * private-use codepoint range that some screen readers otherwise voice as
 * garbage). When an icon conveys information that no adjacent text does
 * (a status glyph, a warning marker), pass `ariaLabel` to render it as
 * role="img" with that accessible name. For icon-only buttons, the name
 * belongs on the button, not the icon.
 *
 * @component cat-icon
 * @example
 * <cat-icon icon="check" />
 * <cat-icon icon="alert" aria-label="Warning" />
 * <cat-icon icon="loading" size="large" />
 */

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick (event: MouseEvent): void {
  emit('click', event)
}

interface Props {
  /**
   * MDI icon name (without 'mdi-' prefix).
   * @example "check", "close", "alert", "information"
   */
  icon: string

  /**
   * Icon size using Bulma size classes.
   * @default undefined (normal size)
   */
  size?: 'small' | 'medium' | 'large'

  /**
   * Icon variant/color using Bulma color classes.
   * Used to apply has-text-{variant} class.
   */
  variant?: 'primary' | 'link' | 'info' | 'success' | 'warning' | 'danger' | 'dark' | 'text' | 'white'

  /**
   * Accessible name for a meaningful icon. When set, the icon renders as
   * role="img" with this name instead of being hidden from assistive
   * technology. Use only when the icon conveys information not present in
   * adjacent text.
   */
  ariaLabel?: string
}

const props = defineProps<Props>()

const sizeClass = computed(() => {
  if (!props.size) return ''
  return `is-${props.size}`
})

const variantClass = computed(() => {
  if (!props.variant) return ''
  return `has-text-${props.variant}`
})

const iconClass = computed(() => {
  const classes = ['mdi', `mdi-${props.icon}`]
  // Add MDI size classes to match Bulma container sizes.
  // MDI default is ~18px which works for 'small'.
  // Each size needs explicit MDI sizing to fill the Bulma container properly.
  if (props.size === 'small') {
    // Small uses default MDI size (~18px)
  } else if (props.size === 'medium') {
    classes.push('mdi-36px')
  } else if (props.size === 'large') {
    classes.push('mdi-48px')
  } else {
    // Normal/default size
    classes.push('mdi-24px')
  }
  return classes
})
</script>

<style lang="scss" scoped>
/**
 * Keep the MDI glyph from inflating its host's line box.
 *
 * Bulma's `.icon` is a fixed-size inline-flex box (1.5rem by default), but the
 * MDI webfont sets its glyph (`.mdi::before`) as a baseline-aligned inline-block
 * whose font-size we bump via `mdi-24px`/`mdi-36px`/`mdi-48px`. A large glyph
 * baseline-aligned inside a normal control line-height produces a line box
 * taller than the `.icon` container, which then pushes the surrounding control
 * (e.g. an icon-only button in a `has-addons` field) above the standard control
 * height. Laying the glyph out with flex centering and line-height 1 clamps it
 * to its container so icons never change the height of the control they sit in.
 */
.icon i {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
</style>
