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
        :aria-label="effectiveAriaLabel"
        :aria-describedby="ariaDescribedby"
        tabindex="-1"
        class="modal-card"
        :class="modalCardClasses"
      >
        <header class="modal-card-head">
          <!-- tabindex="-1" so the title can serve as the initial focus target
               when the dialog has no focusable children, per the APG advice
               not to focus the dialog element itself. -->
          <p :id="titleId" class="modal-card-title" tabindex="-1">
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
        <!-- When the body can scroll, it becomes a focusable named region so
             keyboard users can scroll it (Safari does not make scroll
             containers focusable automatically). -->
        <section
          ref="bodySectionRef"
          class="modal-card-body"
          :tabindex="bodyOverflows ? 0 : undefined"
          :role="bodyOverflows ? 'region' : undefined"
          :aria-labelledby="bodyOverflows && hasTitle ? titleId : undefined"
          :aria-label="bodyOverflows && !hasTitle ? effectiveAriaLabel : undefined"
        >
          <div v-if="modelValue" ref="bodyContentRef" tabindex="-1">
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
import { pushDismissLayer, removeDismissLayer, type DismissLayer } from '../util/dismiss-stack'

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

  /**
   * Accessible name for the dialog when there's no visible title. Ignored
   * when `title` or the `#title` slot is provided (those drive
   * `aria-labelledby` automatically). Falls back to "Dialog" if neither a
   * title nor an `ariaLabel` is given, so the modal always has a name for
   * assistive technology.
   */
  ariaLabel?: string

  /**
   * Space-separated id(s) of element(s) that further describe this dialog,
   * applied as `aria-describedby` on the dialog container. Use for longer-form
   * context (e.g., the id of a body paragraph that explains the dialog's
   * purpose). Optional per the WAI-ARIA Modal Dialog pattern.
   */
  ariaDescribedby?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  title: '',
  closable: true,
  fullScreen: false,
  size: 'medium',
  ariaLabel: undefined,
  ariaDescribedby: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const slots = useSlots()
const modalCardRef = ref<HTMLElement | null>(null)
const bodyContentRef = ref<HTMLElement | null>(null)
const bodySectionRef = ref<HTMLElement | null>(null)
const bodyOverflows = ref(false)
let bodyResizeObserver: ResizeObserver | null = null
const titleId = useId()
let previouslyFocused: HTMLElement | null = null

const hasTitle = computed(() => Boolean(props.title || slots.title))
// When there's no visible title, fall back to the ariaLabel prop or a generic
// "Dialog" so the dialog always has an accessible name (axe / WAI-ARIA both
// flag unnamed dialogs).
const effectiveAriaLabel = computed(() => {
  if (hasTitle.value) return undefined
  return props.ariaLabel || 'Dialog'
})

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
    // Hidden candidates (display:none etc.) cannot receive focus; including
    // them dead-ends the Tab wrap. checkVisibility is a pass-through where
    // the API is absent (older jsdom).
    .filter(el => (el as HTMLElement & { checkVisibility?: () => boolean }).checkVisibility?.() !== false)
}

// Tab containment only; Escape dismissal goes through the shared dismiss
// stack so a popup open inside the modal closes first.
function handleKeydown (event: KeyboardEvent): void {
  if (!props.modelValue) return
  if (event.key !== 'Tab') return
  const root = modalCardRef.value
  if (!root) return
  const els = focusableElements()
  const active = document.activeElement as HTMLElement | null
  if (els.length === 0) {
    // No focusable children — keep focus on the card itself.
    event.preventDefault()
    root.focus()
    return
  }
  const first = els[0]!
  const last = els[els.length - 1]!
  // If focus has escaped the modal entirely, pull it back — to the LAST
  // focusable element for Shift+Tab (preserving expected backward direction),
  // otherwise to the first.
  if (!active || !root.contains(active)) {
    event.preventDefault()
    ;(event.shiftKey ? last : first).focus()
    return
  }
  if (event.shiftKey && active === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

// Pick the element that should receive initial focus when the dialog opens.
// Order matches APG guidance: focus the first interactive element if one
// exists; otherwise focus a static element at the start of the content (the
// title, then the body wrapper) rather than the dialog itself, which the
// APG advises against focusing.
function initialFocusTarget (): HTMLElement | null {
  const els = focusableElements()
  if (els.length > 0) return els[0]!
  if (hasTitle.value) {
    const titleEl = modalCardRef.value?.querySelector<HTMLElement>('.modal-card-title')
    if (titleEl) return titleEl
  }
  return bodyContentRef.value ?? modalCardRef.value
}

// A non-closable modal still pushes a layer: it must swallow Escape rather
// than let the press fall through and dismiss a surface beneath it.
const dismissLayer: DismissLayer = {
  onEscape: () => {
    if (props.closable) {
      close()
    }
  }
}

function updateBodyOverflow (): void {
  const el = bodySectionRef.value
  bodyOverflows.value = !!el && el.scrollHeight > el.clientHeight
}

// Open/close side effects live in named functions (not only the watch)
// because a modal mounted with modelValue already true never fires the watch.
async function openSideEffects (): Promise<void> {
  if (typeof document === 'undefined') return
  document.documentElement.classList.add('is-clipped')
  previouslyFocused = document.activeElement as HTMLElement | null
  pushDismissLayer(dismissLayer)
  await nextTick()
  updateBodyOverflow()
  if (typeof ResizeObserver !== 'undefined' && bodySectionRef.value) {
    bodyResizeObserver = new ResizeObserver(updateBodyOverflow)
    bodyResizeObserver.observe(bodySectionRef.value)
    if (bodyContentRef.value) {
      bodyResizeObserver.observe(bodyContentRef.value)
    }
  }
  initialFocusTarget()?.focus()
}

function closeSideEffects (): void {
  if (typeof document === 'undefined') return
  document.documentElement.classList.remove('is-clipped')
  removeDismissLayer(dismissLayer)
  bodyResizeObserver?.disconnect()
  bodyResizeObserver = null
  // The opener may have been removed from the DOM while the modal was open
  // (e.g., it lived inside a v-if branch that re-rendered). Guard against
  // calling focus() on a stale reference.
  const prev = previouslyFocused
  if (prev && prev.isConnected) {
    prev.focus()
  }
  previouslyFocused = null
}

// Toggle html clipping, move focus into the modal on open, and restore focus
// to whatever element opened it on close.
watch(() => props.modelValue, (isActive) => {
  if (isActive) {
    void openSideEffects()
  } else {
    closeSideEffects()
  }
})

onMounted(() => {
  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', handleKeydown)
  }
  if (props.modelValue) {
    void openSideEffects()
  }
})

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('keydown', handleKeydown)
    document.documentElement.classList.remove('is-clipped')
  }
  removeDismissLayer(dismissLayer)
  bodyResizeObserver?.disconnect()
  bodyResizeObserver = null
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
