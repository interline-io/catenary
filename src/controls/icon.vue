<template>
  <!-- Icons are decorative-by-default. The @click here only re-emits to allow
       parent components to attach listeners; consumers must wrap clickable
       icons in a <button> (see how cat-button uses cat-icon for icon-only
       buttons). -->
  <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions, vuejs-accessibility/click-events-have-key-events -->
  <span class="icon" :class="[sizeClass, variantClass]" @click="handleClick">
    <i :class="iconClass" />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * Icon component using Material Design Icons (MDI) with Bulma's icon container.
 *
 * @component cat-icon
 * @example
 * <cat-icon icon="check" />
 * <cat-icon icon="close" size="small" @click="handleClick" />
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
