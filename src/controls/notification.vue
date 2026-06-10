<template>
  <div class="notification" :class="notificationClasses" :role="role">
    <button
      v-if="closeable"
      type="button"
      class="delete"
      :aria-label="ariaCloseLabel"
      @click="handleClose"
    />
    <slot>{{ message }}</slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NotificationVariant } from './types'

/**
 * Notification/alert message component using Bulma styling.
 * Displays contextual messages with optional close button.
 *
 * @component cat-notification
 * @example
 * <cat-notification>Default info message</cat-notification>
 * <cat-notification variant="warning" closeable @close="handleClose">
 *   Warning message
 * </cat-notification>
 */

interface Props {
  /**
   * Notification color variant using Bulma color classes.
   * @default 'light'
   */
  variant?: NotificationVariant

  /**
   * Message text (alternative to using default slot).
   */
  message?: string

  /**
   * Show close button and allow user to dismiss.
   * @default false
   */
  closeable?: boolean

  /**
   * Use light variant of the notification.
   * @default false
   */
  light?: boolean

  /**
   * ARIA live-region role. Set 'status' (polite) or 'alert' (assertive,
   * errors only) when the notification is shown dynamically, so screen
   * readers announce it; the element must be present, or the role applied,
   * before the message appears. Omit for static page content.
   */
  role?: 'status' | 'alert'

  /**
   * Accessible name for the close button, which renders as an icon-only
   * Bulma delete button.
   * @default 'Dismiss notification'
   */
  ariaCloseLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'light',
  message: undefined,
  closeable: false,
  light: false,
  role: undefined,
  ariaCloseLabel: 'Dismiss notification'
})

/**
 * Emitted when close button is clicked.
 * @event close
 */
const emit = defineEmits<{
  close: []
}>()

const notificationClasses = computed(() => {
  const classes: string[] = []

  if (props.variant) {
    classes.push(`is-${props.variant}`)
  }

  if (props.light) {
    classes.push('is-light')
  }

  return classes
})

function handleClose () {
  emit('close')
}
</script>
