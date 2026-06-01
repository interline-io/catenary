<template>
  <button
    v-if="isDelete"
    type="button"
    class="tag is-delete"
    aria-label="Delete"
    @click="handleClick"
  />
  <component
    :is="hasClickListener ? 'button' : 'span'"
    v-else
    :type="hasClickListener ? 'button' : undefined"
    class="tag"
    :class="tagClasses"
    @click="hasClickListener ? handleClick() : undefined"
  >
    <slot>{{ label }}</slot>
    <button
      v-if="closable"
      type="button"
      class="delete is-small"
      aria-label="Remove"
      @click.stop="handleClose"
    />
  </component>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, onUpdated, ref } from 'vue'
import type { TagVariant, TagSize } from './types'

// Reflect whether the parent attached a click listener so we can render the
// tag as a <button> (keyboard-accessible) only when it's actually clickable.
// `vnode.props` itself isn't reactive — Vue replaces vnode on each render but
// doesn't notify reactive dependencies. Read it at setup for the initial
// render and re-sync on update so the rendered tag follows the parent if
// listeners are added or removed across re-renders.
const instance = getCurrentInstance()
function detectClickListener (): boolean {
  return 'onClick' in (instance?.vnode?.props ?? {})
}
const hasClickListenerRef = ref(detectClickListener())
onUpdated(() => {
  hasClickListenerRef.value = detectClickListener()
})
const hasClickListener = computed(() => hasClickListenerRef.value)

interface Props {
  /**
   * Tag label text (alternative to using default slot).
   */
  label?: string

  /**
   * Color variant of the tag.
   */
  variant?: TagVariant

  /**
   * Size of the tag.
   */
  size?: TagSize

  /**
   * Whether the tag has rounded corners.
   */
  rounded?: boolean

  /**
   * Whether the tag uses light color variant.
   */
  light?: boolean

  /**
   * Whether the tag has a close button.
   */
  closable?: boolean

  /**
   * Whether the tag is a delete button (renders as pure delete X).
   */
  isDelete?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  variant: undefined,
  size: undefined,
  rounded: false,
  light: false,
  closable: false,
  isDelete: false
})

const emit = defineEmits<{
  close: []
  click: []
}>()

const handleClick = () => emit('click')
const handleClose = () => emit('close')

const tagClasses = computed(() => {
  const classes: string[] = []

  if (props.isDelete) {
    classes.push('is-delete')
    return classes
  }

  if (props.variant) {
    classes.push(`is-${props.variant}`)
  }

  if (props.size) {
    classes.push(`is-${props.size}`)
  }

  if (props.rounded) {
    classes.push('is-rounded')
  }

  if (props.light) {
    classes.push('is-light')
  }

  return classes
})
</script>
