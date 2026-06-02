<template>
  <Teleport to="body">
    <div class="modal cat-modal" :class="{ 'is-active': modelValue }">
      <!-- Backdrop click is a convenience dismissal; the WAI-ARIA-compliant
           keyboard dismissal is Escape, handled at document level via
           handleKeydown. -->
      <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions, vuejs-accessibility/click-events-have-key-events -->
      <div class="modal-background" @click="handleBackgroundClick" />
      <div
        ref="modalCardRef"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="hasTitle ? titleId : undefined"
        tabindex="-1"
        class="modal-card"
        :class="modalCardClasses"
      >
        <header class="modal-card-head">
          <p :id="titleId" class="modal-card-title">
            <slot name="title">
              {{ title }}
            </slot>
          </p>
          <button
            v-if="closable"
            type="button"
            class="delete"
            aria-label="close"
            @click="close"
          />
        </header>
        <section class="modal-card-body">
          <div v-if="modelValue">
            <slot :close="close" />
            <br>
          </div>
        </section>
        <footer v-if="$slots.footer" class="modal-card-foot">
          <slot name="footer" :close="close" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch, useSlots, useId, nextTick, onMounted, onBeforeUnmount } from 'vue'

/**
 * Modal component using Bulma modal-card structure.
 * Wrapper around native Bulma modal with v-model support.
 *
 * @component cat-modal
 * @example
 * <cat-modal v-model="showModal" title="Edit Item">
 *   <p>Modal content</p>
 * </cat-modal>
 */

interface Props {
  /**
   * Modal visibility state (v-model).
   */
  modelValue?: boolean

  /**
   * Modal title displayed in header.
   */
  title?: string

  /**
   * Show close button and allow closing via background/ESC.
   * @default true
   */
  closable?: boolean

  /**
   * Apply fullscreen mode with padding.
   * @default false
   */
  fullScreen?: boolean

  /**
   * Modal size
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  title: '',
  closable: true,
  fullScreen: false,
  size: 'medium'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const slots = useSlots()
const modalCardRef = ref<HTMLElement | null>(null)
const titleId = useId()
let previouslyFocused: HTMLElement | null = null

const hasTitle = computed(() => Boolean(props.title || slots.title))

const modalCardClasses = computed(() => ({
  'cat-modal-fullscreen': props.fullScreen,
  'cat-modal-small': props.size === 'small',
  'cat-modal-medium': props.size === 'medium',
  'cat-modal-large': props.size === 'large'
}))

function close (): void {
  emit('update:modelValue', false)
}

function handleBackgroundClick (): void {
  if (props.closable) {
    close()
  }
}

// Collect focusable descendants of the modal card. Used to seed focus on open
// and to wrap Tab / Shift+Tab at the boundaries per the WAI-ARIA Modal Dialog
// pattern.
function focusableElements (): HTMLElement[] {
  const root = modalCardRef.value
  if (!root) return []
  const sel = 'a[href], area[href], button, input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"]), audio[controls], video[controls], iframe, object, embed, [contenteditable]'
  return Array.from(root.querySelectorAll<HTMLElement>(sel))
    .filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1)
}

function handleKeydown (event: KeyboardEvent): void {
  if (!props.modelValue) return
  if (event.key === 'Escape' && props.closable) {
    close()
    return
  }
  if (event.key !== 'Tab') return
  const root = modalCardRef.value
  if (!root) return
  const els = focusableElements()
  const active = document.activeElement as HTMLElement | null
  // If focus has escaped the modal entirely (e.g., AT or scripted focus),
  // pull it back to the first focusable element (or the card itself).
  if (!active || !root.contains(active)) {
    event.preventDefault()
    ;(els[0] ?? root).focus()
    return
  }
  if (els.length === 0) {
    // No focusable children — keep focus on the card itself.
    event.preventDefault()
    root.focus()
    return
  }
  const first = els[0]!
  const last = els[els.length - 1]!
  if (event.shiftKey && active === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

// Toggle html clipping, move focus into the modal on open, and restore focus
// to whatever element opened it on close.
watch(() => props.modelValue, async (isActive) => {
  if (typeof document === 'undefined') return
  if (isActive) {
    document.documentElement.classList.add('is-clipped')
    previouslyFocused = document.activeElement as HTMLElement | null
    await nextTick()
    const els = focusableElements()
    ;(els[0] ?? modalCardRef.value)?.focus()
  } else {
    document.documentElement.classList.remove('is-clipped')
    previouslyFocused?.focus()
    previouslyFocused = null
  }
})

onMounted(() => {
  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', handleKeydown)
  }
})

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('keydown', handleKeydown)
    document.documentElement.classList.remove('is-clipped')
  }
})
</script>

<style scoped lang="scss">
@use "bulma/sass/utilities/initial-variables" as *;
@use "bulma/sass/utilities/derived-variables" as *;

.cat-modal {
  .modal-card {
    width: 800px;
    max-width: 90vw;

    &.cat-modal-small {
      width: 480px;
    }

    &.cat-modal-medium {
      width: 800px;
    }

    &.cat-modal-large {
      width: 1200px;
    }

    &.cat-modal-fullscreen {
      width: calc(100vw - 40px);
      height: calc(100vh - 40px);
      max-height: calc(100vh - 40px);
      margin: 20px;
    }
  }

  .modal-card-foot {
    justify-content: flex-end;
  }
}
</style>
