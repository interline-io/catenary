<template>
  <Teleport to="body">
    <div class="modal cat-modal" :class="{ 'is-active': modelValue, 'cat-modal-top': position === 'top' }" v-bind="$attrs">
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
        :style="modalCardStyle"
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
          <div v-if="modelValue" ref="bodyContentRef" tabindex="-1" class="cat-modal-body-content">
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
import { computed, ref, watch, useSlots, useId, nextTick, onMounted, onBeforeUnmount, onUnmounted } from 'vue'
import { pushDismissLayer, removeDismissLayer, type DismissLayer } from '../util/dismiss-stack'
import { isOpenModal, isTopModal, openModalCount, pushOpenModal, removeOpenModal } from '../util/modal-stack'
import type { ModalPosition, ModalWidth } from './types'

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
   * Card width, for a width the `size` steps don't cover: a number is pixels
   * (as in cat-dropdown), a string any CSS length (`640px`, `40rem`). Overrides
   * `size`, and is still capped at 90vw. No effect with `fullScreen`.
   *
   * Sets `--cat-modal-width` inline on the card. The same property set on any
   * ancestor, or `:root`, sizes every modal beneath it.
   */
  width?: ModalWidth

  /**
   * Vertical placement. `top` anchors the card near the top of the viewport, so
   * a dialog whose content grows — a search palette's result list — grows
   * downward instead of moving. No effect with `fullScreen`.
   * @default 'centered'
   */
  position?: ModalPosition

  /**
   * Drop `fullScreen`'s inset at every width, so the dialog is the whole
   * viewport rather than a card with a margin around it. `fullScreen` already
   * does this below Bulma's mobile breakpoint; this is for a dialog that should
   * never read as a card, whatever the screen. No effect without `fullScreen`.
   * @default false
   */
  fullBleed?: boolean

  /**
   * Hand the body's height down to the slot, for content that scrolls within
   * the dialog rather than scrolling the dialog itself — a table that keeps its
   * header in view, say. The slot becomes a column flex container filling the
   * body, so a child with `flex: 1; min-height: 0` gets a bounded height to
   * scroll inside.
   *
   * Off by default, and deliberately: it makes every direct child of the slot a
   * flex item, which blockifies inline content, drops floats, and squashes any
   * child that scrolls on its own axis. Only turn it on for content written
   * against it.
   *
   * Content that scrolls itself also has to carry its own `tabindex` and
   * accessible name — the body's scroll-region wiring keys off the body
   * overflowing, which it no longer does.
   * @default false
   */
  fillBody?: boolean

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

  /**
   * Where focus lands when the dialog opens. By default: the first focusable
   * element in the body, if it is in view; otherwise the title, then the body
   * wrapper. The close button and footer actions are never picked by default,
   * since a footer often leads with its primary or destructive action.
   *
   * Pass a CSS selector (matched inside the dialog), an element, or a function
   * returning one to override, e.g. the Cancel button of a destructive confirm.
   * An element that can't take focus itself, such as a component's wrapper, is
   * resolved to its first focusable descendant. Pass `false` to skip controls
   * and focus the title or body wrapper, e.g. so a text field doesn't raise the
   * on-screen keyboard on a phone. A target that is missing, outside the
   * dialog, or not focusable falls through to the default, with a warning in
   * development.
   */
  // `& object` makes the SFC compiler emit an Object runtime type. It can't
  // resolve HTMLElement, and the production build (which consumers validate
  // against in dev) keeps only the types it can, so an element would warn.
  // `null` is accepted so a template ref can be passed directly.
  initialFocus?: string | (HTMLElement & object) | (() => HTMLElement | null) | false | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  title: '',
  closable: true,
  fullScreen: false,
  size: 'medium',
  width: undefined,
  position: 'centered',
  fullBleed: false,
  fillBody: false,
  ariaLabel: undefined,
  ariaDescribedby: undefined,
  initialFocus: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// The root is a Teleport, which cannot inherit attributes, so they go on .modal
// by hand: a caller's class, say, or the scope id a scoped parent passes while
// rendering on the server.
defineOptions({ inheritAttrs: false })

const slots = useSlots()
const modalCardRef = ref<HTMLElement | null>(null)
const bodyContentRef = ref<HTMLElement | null>(null)
const bodySectionRef = ref<HTMLElement | null>(null)
const bodyOverflows = ref(false)
let bodyResizeObserver: ResizeObserver | null = null
const titleId = useId()
let previouslyFocused: HTMLElement | null = null
let warnedInitialFocus = false
// Identifies this instance on the shared open-modal stack.
const openToken = {}

const hasTitle = computed(() => Boolean(props.title || slots.title))
// When there's no visible title, fall back to the ariaLabel prop or a generic
// "Dialog" so the dialog always has an accessible name (axe / WAI-ARIA both
// flag unnamed dialogs).
const effectiveAriaLabel = computed(() => {
  if (hasTitle.value) return undefined
  return props.ariaLabel || 'Dialog'
})

const modalCardStyle = computed(() => {
  // A bare number would be an invalid length for `width`, which then drops
  // to auto and shrinks the card to its content, so numbers mean pixels.
  const w = typeof props.width === 'number' ? `${props.width}px` : props.width
  return w ? { '--cat-modal-width': w } : undefined
})

const modalCardClasses = computed(() => ({
  'cat-modal-fullscreen': props.fullScreen,
  'cat-modal-fullbleed': props.fullBleed,
  'cat-modal-fill': props.fillBody,
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

const focusableSelector = 'a[href], area[href], button, input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"]), audio[controls], video[controls], iframe, object, embed, [contenteditable]'

// Hidden candidates (display:none etc.) cannot receive focus; including them
// dead-ends the Tab wrap. checkVisibility is a pass-through where the API is
// absent (older jsdom).
function isVisible (el: HTMLElement): boolean {
  return (el as HTMLElement & { checkVisibility?: () => boolean }).checkVisibility?.() !== false
}

// Whether an element is disabled or inert. `:disabled` also covers controls
// inside a disabled <fieldset>; the attribute check covers elements `:disabled`
// doesn't apply to. An inert subtree takes no focus at all.
function isInactive (el: HTMLElement): boolean {
  return el.hasAttribute('disabled') || el.matches(':disabled') || Boolean(el.closest('[inert]'))
}

function isTabbable (el: HTMLElement): boolean {
  return el.tabIndex !== -1 && !isInactive(el) && isVisible(el)
}

// Collect the tabbable descendants of the modal card, to wrap Tab / Shift+Tab
// at the boundaries per the WAI-ARIA Modal Dialog pattern.
function focusableElements (root: HTMLElement | null = modalCardRef.value): HTMLElement[] {
  if (!root) return []
  return Array.from(root.querySelectorAll<HTMLElement>(focusableSelector)).filter(isTabbable)
}

// The first tabbable descendant, without building the whole list: a body can
// hold a large table of row controls, and only the first is wanted.
function firstFocusable (root: HTMLElement | null): HTMLElement | null {
  if (!root) return null
  for (const el of root.querySelectorAll<HTMLElement>(focusableSelector)) {
    if (isTabbable(el)) return el
  }
  return null
}

// Tab containment only; Escape dismissal goes through the shared dismiss
// stack so a popup open inside the modal closes first.
function handleKeydown (event: KeyboardEvent): void {
  if (!props.modelValue) return
  if (event.key !== 'Tab') return
  // Only the topmost modal traps Tab. A stacked modal is teleported to body,
  // outside this card, so trapping here too would yank focus out of it.
  if (!isTopModal(openToken)) return
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
  if (!els.includes(active)) {
    // Focus is inside the card but not on a tabbable element: the title, the
    // body wrapper, or a tabindex="-1" initialFocus target. The browser would
    // move from there by DOM position, and from the title, which precedes every
    // control, Shift+Tab would leave the dialog. So step to the neighboring
    // tabbable by DOM position here, wrapping at either end.
    event.preventDefault()
    const follows = (el: HTMLElement) => Boolean(active.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING)
    const target = event.shiftKey
      ? [...els].reverse().find(el => !follows(el)) ?? last
      : els.find(follows) ?? first
    target.focus()
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

// Resolve the initialFocus prop to an element inside the card that can take
// focus, or null to fall through to the default order. tabindex="-1" targets
// are allowed: they can't be tabbed to but can be focused programmatically.
// Bad values (an invalid selector, a function that throws, a non-element such
// as `true` or a component instance) resolve to null rather than throwing,
// which would abort the open and leave focus behind the dialog.
function requestedFocusTarget (): HTMLElement | null {
  const root = modalCardRef.value
  const req = props.initialFocus
  if (!root || req == null) return null
  let el: unknown
  try {
    if (typeof req === 'string') {
      el = req ? root.querySelector(req) : null
    } else if (typeof req === 'function') {
      el = req()
    } else {
      el = req
    }
  } catch {
    el = null
  }
  if (!(el instanceof HTMLElement) || !root.contains(el)) return null
  const selfFocusable = (el.matches(focusableSelector) || el.hasAttribute('tabindex'))
    && !isInactive(el) && isVisible(el)
  // A component's root (a .control wrapper, say) is not focusable itself;
  // use the control inside it.
  return selfFocusable ? el : firstFocusable(el)
}

// The body's first control, if focusing it won't scroll. APG's caveat: in a
// dialog whose content overflows, focusing a control far down scrolls the
// start of the content out of view. A control already fully in view is fine.
function bodyFocusTarget (): HTMLElement | null {
  const section = bodySectionRef.value
  const el = firstFocusable(section)
  if (!el || !section || !bodyOverflows.value) return el
  const box = section.getBoundingClientRect()
  const rect = el.getBoundingClientRect()
  return rect.top >= box.top && rect.bottom <= box.bottom ? el : null
}

// Candidates for initial focus, in order. APG says to focus the first
// focusable element, but searching the whole card in document order always
// found the header's close button first. So the search is scoped to the body.
// The footer is not searched: Bulma's convention puts the primary or
// destructive action first, and opening a confirm dialog with Delete focused
// is worse than opening it on the title. Callers who want a footer action
// focused name it with initialFocus. After the body, focus a static element at
// the start of the content (the title, then the body wrapper) rather than the
// dialog itself, which the APG advises against focusing.
function initialFocusCandidates (): Array<HTMLElement | null | undefined> {
  const candidates: Array<HTMLElement | null | undefined> = []
  if (props.initialFocus !== false) {
    if (props.initialFocus != null) {
      const requested = requestedFocusTarget()
      if (!requested && process.env.NODE_ENV !== 'production' && !warnedInitialFocus) {
        warnedInitialFocus = true
        console.warn('[catenary] <cat-modal> initialFocus did not resolve to a focusable element inside the dialog; using the default focus order.')
      }
      candidates.push(requested)
    }
    candidates.push(bodyFocusTarget())
  }
  if (hasTitle.value) {
    candidates.push(modalCardRef.value?.querySelector<HTMLElement>('.modal-card-title'))
  }
  candidates.push(bodyContentRef.value, modalCardRef.value)
  return candidates
}

// Focus the first candidate that actually takes focus. A candidate can pass
// every check and still refuse it (visibility:hidden, which checkVisibility
// does not test by default, or a contenteditable="false" element), and
// leaving focus on the opener behind an open modal is the worst outcome.
function focusInitial (): void {
  for (const el of initialFocusCandidates()) {
    if (!el) continue
    el.focus()
    if (document.activeElement === el) return
  }
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
  pushOpenModal(openToken)
  pushDismissLayer(dismissLayer)
  await nextTick()
  // Closed or unmounted during the tick; don't leave an observer or steal focus.
  if (!isOpenModal(openToken)) return
  updateBodyOverflow()
  if (typeof ResizeObserver !== 'undefined' && bodySectionRef.value) {
    bodyResizeObserver = new ResizeObserver(updateBodyOverflow)
    bodyResizeObserver.observe(bodySectionRef.value)
    if (bodyContentRef.value) {
      bodyResizeObserver.observe(bodyContentRef.value)
    }
  }
  focusInitial()
}

function closeSideEffects (): void {
  if (typeof document === 'undefined') return
  if (!isOpenModal(openToken)) return
  // Read before removing: a modal beneath another one closing must leave
  // focus inside the modal still open on top.
  const wasTop = isTopModal(openToken)
  removeOpenModal(openToken)
  if (openModalCount() === 0) {
    document.documentElement.classList.remove('is-clipped')
  }
  removeDismissLayer(dismissLayer)
  bodyResizeObserver?.disconnect()
  bodyResizeObserver = null
  // The opener may have been removed from the DOM while the modal was open
  // (e.g., it lived inside a v-if branch that re-rendered). Guard against
  // calling focus() on a stale reference.
  const prev = previouslyFocused
  if (wasTop && prev && prev.isConnected) {
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
  }
})

// Unmounting while open is a close, focus restore included. A modal under the
// same v-if its v-model drives is removed in the render that clears it, so it
// never sees modelValue go false and the watch above never runs.
// This runs in onUnmounted, after the DOM is removed, rather than in
// onBeforeUnmount: then isConnected is false for an opener torn down in the
// same patch, and a nested modal (unmounted child-first) skips an opener inside
// its removed parent, leaving the parent to restore focus to its own opener.
onUnmounted(() => {
  closeSideEffects()
})
</script>

<style scoped lang="scss">
@use "bulma/sass/utilities/initial-variables" as *;
@use "bulma/sass/utilities/derived-variables" as *;
@use "bulma/sass/utilities/mixins" as mx;

// The whole viewport, with nothing between the dialog and its edges. Square
// corners because a radius only reads against a backdrop there is no longer any
// of, and the padding halved because at this width it is content the space
// should go to rather than margin — both off Bulma's own custom properties,
// which inherit into the head, body and foot, rather than selectors reaching in.
@mixin edge-to-edge {
  --bulma-modal-card-head-radius: 0;
  --bulma-modal-card-foot-radius: 0;
  --bulma-modal-card-head-padding: 1rem;
  --bulma-modal-card-body-padding: 1rem;

  // Against .modal, which is fixed at inset 0, so this is the viewport exactly —
  // where 100vw would add the classic scrollbar's width and be clipped.
  width: 100%;
  max-width: 100%;
  margin: 0;
  // dvh so the browser's own chrome sliding in and out does not leave the dialog
  // taller than the screen; vh first for anything that lacks it.
  height: 100vh;
  height: 100dvh;
  max-height: 100vh;
  max-height: 100dvh;
}

.cat-modal {
  // Width. The size classes set an internal step, and --cat-modal-width, when
  // set, wins over it: inline on the card from the `width` prop, or inherited
  // from any ancestor (:root, a page wrapper), since the card never sets it
  // itself. The 800px default lives only here, so a card with no size class
  // (size="normal") still gets it.
  .modal-card {
    --cat-modal-size-width: 800px;

    width: var(--cat-modal-width, var(--cat-modal-size-width));
    max-width: 90vw;

    &.cat-modal-small {
      --cat-modal-size-width: 480px;
    }

    &.cat-modal-large {
      --cat-modal-size-width: 1200px;
    }

    // fillBody. The body lays out as a column and the slot takes what is left,
    // so a definite height reaches the content instead of the content making
    // one. min-height is what lets the slot shrink below its content — a flex
    // item refuses to by default, and the height never arrives.
    //
    // Only under the modifier: it makes every direct child of the slot a flex
    // item, which is not something to do to a modal not written for it.
    &.cat-modal-fill {
      .modal-card-body {
        display: flex;
        flex-direction: column;
      }

      .cat-modal-body-content {
        flex: 1 1 auto;
        min-height: 0;
        display: flex;
        flex-direction: column;

        // Trailing space below the slot, which a filled column would spend real
        // height on rather than leaving at the end of a scroll.
        > br:last-child {
          display: none;
        }
      }
    }

    &.cat-modal-fullscreen {
      width: calc(100vw - 40px);
      height: calc(100vh - 40px);
      max-height: calc(100vh - 40px);
      margin: 20px;

      // Below Bulma's mobile ceiling the inset stops reading as a frame and
      // starts eating the content, so full screen means the whole screen.
      // Measured at 600px, the margin, the 90vw cap and 2rem of body padding
      // between them took a third of the width.
      @include mx.mobile {
        @include edge-to-edge;
      }

      // fullBleed. The same treatment at every width, for a dialog that should
      // never read as a card. Written as a modifier of the modifier, so the
      // prop has no meaning on its own rather than half of one.
      &.cat-modal-fullbleed {
        @include edge-to-edge;
      }
    }
  }

  .modal-card-foot {
    justify-content: flex-end;
  }
}

// position="top". .modal is a centered column, so the card moves to the top on
// the main axis. The offset comes out of max-height as well, or a tall card
// would run off the bottom.
//
// :where() keeps these at (0,2,0) with the scope attribute: enough to beat
// Bulma's .modal and .modal-card, below the fullScreen modifier (0,4,0), which
// therefore wins by specificity, and tied with a consumer's own
// `.cat-modal .modal-card` override rather than outranking it.
//
// Spacing reads Bulma's runtime --bulma-modal-card-spacing rather than the
// SCSS variable CLAUDE.md prefers: $modal-card-spacing is not in
// initial-variables, and @use-ing Bulma's modal module would emit its CSS again.
:where(.cat-modal).cat-modal-top {
  justify-content: flex-start;
}

:where(.cat-modal.cat-modal-top) .modal-card {
  --cat-modal-top-offset: 10vh;

  margin-top: var(--cat-modal-top-offset);
  max-height: calc(100vh - var(--cat-modal-top-offset) - var(--bulma-modal-card-spacing));
  max-height: calc(100dvh - var(--cat-modal-top-offset) - var(--bulma-modal-card-spacing));

  // On a phone 10vh is space the content needs; keep an even gap instead.
  @include mx.mobile {
    --cat-modal-top-offset: calc(var(--bulma-modal-card-spacing) / 2);

    max-height: calc(100vh - 2 * var(--cat-modal-top-offset));
    max-height: calc(100dvh - 2 * var(--cat-modal-top-offset));
  }
}
</style>
