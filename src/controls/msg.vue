<template>
  <article :class="msgClass">
    <div
      v-if="title || expandable || closable"
      class="message-header"
    >
      <!-- When expandable the title becomes a real <button> carrying the
           disclosure semantics, rather than role="button" on this header div.
           That matters most when `closable` is also set: the delete button is a
           sibling of the trigger, not nested inside it, so there is no invalid
           nested control and no need for `.self` key modifiers to stop the
           header swallowing Space meant for the close button. -->
      <button
        v-if="expandable"
        class="cat-msg-trigger"
        v-bind="triggerAttrs"
        @click="toggle"
      >
        <span>{{ title || defaultTitle }}</span>
        <cat-icon
          :icon="isOpen ? 'chevron-up' : 'chevron-down'"
          class="cat-expand-icon"
        />
      </button>
      <span v-else>{{ title || defaultTitle }}</span>
      <button
        v-if="closable"
        class="delete"
        aria-label="delete"
        @click="handleClose"
      />
    </div>
    <div
      v-if="!expandable || isOpen"
      :class="expandable ? 'cat-expandable-content' : ''"
      v-bind="expandable ? contentAttrs : {}"
    >
      <template v-if="hasIcon">
        <div class="media message-body">
          <cat-icon :icon="getIcon" :size="iconSize" class="media-left" />
          <div class="media-content">
            <slot />
          </div>
        </div>
      </template>
      <template v-else>
        <div class="message-body">
          <slot />
        </div>
      </template>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MsgVariant } from './types'
import CatIcon from './icon.vue'
import { useDisclosure } from '../util/disclosure'

// TypeScript types and interfaces
type MessageVariant = MsgVariant | 'error'

const props = withDefaults(defineProps<{
  variant?: MessageVariant
  title?: string | null
  icon?: string | null
  showIcon?: boolean
  iconSize?: 'small' | 'medium' | 'large'
  expandable?: boolean
  open?: boolean
  closable?: boolean
  defaultTitle?: string
}>(), {
  variant: 'light',
  title: null,
  icon: null,
  showIcon: false,
  iconSize: 'large',
  expandable: false,
  open: false,
  closable: false,
  defaultTitle: 'Information'
})

// Emits
const emit = defineEmits<{
  'update:open': [value: boolean]
  'close': []
}>()

// Disclosure state and ARIA wiring, shared with cat-collapse and cat-card.
// Note `close` on this component means "the message was dismissed", not "the
// body collapsed", so only `update:open` is forwarded here.
const { isOpen, triggerAttrs, contentAttrs, toggle } = useDisclosure({
  open: () => props.open,
  idPrefix: 'cat-msg',
  onChange: (value: boolean) => emit('update:open', value)
})

// Computed properties
const getIcon = computed<string>(() => {
  if (props.icon) {
    return props.icon
  }
  if (props.variant === 'success') {
    return 'check-circle'
  }
  if (props.variant === 'danger' || props.variant === 'warning' || props.variant === 'error') {
    return 'alert'
  }
  return 'information'
})

const hasIcon = computed<boolean>(() => props.showIcon)

const msgClass = computed<string>(() => {
  if (props.variant) {
    return `message cat-message mb-4 is-${props.variant}`
  }
  return 'message cat-message mb-4'
})

const handleClose = (): void => {
  emit('close')
}
</script>

<style scoped lang="scss">
.cat-message {
  // The trigger is a real button now, so it needs the header's own typography
  // and layout reset back onto it rather than inheriting Bulma's button styles.
  .cat-msg-trigger {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    min-width: 0;
    padding: 0;
    border: none;
    background: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.8;
    }

    // `currentcolor`, not Bulma's $link as in cat-collapse and cat-card: a
    // message header is tinted by its variant (danger, dark, …), and a fixed
    // link-blue ring can disappear against those backgrounds. Inheriting the
    // header's own text colour keeps the ring visible on every variant.
    &:focus-visible {
      outline: 2px solid currentcolor;
      outline-offset: 2px;
    }
  }

  .cat-expand-icon {
    transition: transform 0.2s ease;
  }

  .cat-expandable-content {
    transition: all 0.2s ease;
  }

  @media (prefers-reduced-motion: reduce) {
    .cat-msg-trigger,
    .cat-expand-icon,
    .cat-expandable-content {
      transition: none;
    }
  }
}
</style>
