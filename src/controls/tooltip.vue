<template>
  <!-- The wrapper IS the keyboard-accessible trigger when the slot has no
       focusable child; otherwise the slot's focusable element is the trigger
       and gets aria-describedby applied programmatically. -->
  <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
  <span
    ref="wrapperRef"
    class="cat-tooltip"
    :class="[
      `is-tooltip-${effectivePosition}`,
      { 'is-visible': isVisible, 'cat-tooltip-affordance': affordance, 'cat-tooltip-static': !animated },
    ]"
    :tabindex="needsTabindex ? 0 : undefined"
    :aria-describedby="needsTabindex ? tooltipId : undefined"
    @pointerdown="onPointerdown"
    @mouseenter="onMouseenter"
    @mouseleave="onMouseleave"
    @focusin="onFocusin"
    @focusout="onFocusout"
  >
    <slot />
    <!-- The bubble needs its own pointer handlers now that it is hoverable:
         the wrapper's mouseleave already fired when the pointer crossed onto
         the bubble, so without these the tooltip would stay up indefinitely
         once the pointer left the bubble again.

         Both rules are waived deliberately. The bubble is role="tooltip" and
         carries no interaction of its own — these handlers only decide when it
         stops being shown — and the keyboard equivalents the second rule asks
         for are on the wrapper (focusin / focusout) plus Escape via the shared
         dismiss stack, neither of which belongs on the bubble itself. -->
    <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions, vuejs-accessibility/mouse-events-have-key-events -->
    <span
      :id="tooltipId"
      ref="bubbleRef"
      class="cat-tooltip-bubble"
      role="tooltip"
      @mouseenter="cancelClose"
      @mouseleave="onBubbleMouseleave"
    >
      {{ text }}
    </span>
  </span>
</template>

<script setup lang="ts">
import { ref, computed, useId, nextTick, onMounted, onUpdated, onBeforeUnmount, watch } from 'vue'
import { pushDismissLayer, removeDismissLayer, type DismissLayer } from '../util/dismiss-stack'

/**
 * Accessible tooltip following the WAI-ARIA Authoring Practices tooltip pattern.
 * https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/
 *
 * Behavior:
 * - Shows on hover (mouseenter) AND keyboard focus (focusin) of the trigger.
 * - Dismissed by mouseleave, focusout, or Escape — but stays open while focus
 *   remains inside the wrapper, and while the mouse moves between wrapper
 *   children.
 * - Tooltip is associated with the trigger via `aria-describedby` and
 *   `role="tooltip"`. When the slot contains a focusable element, the id is
 *   applied to that element (since aria-describedby is not inherited from the
 *   wrapper); otherwise it lives on the wrapper, which is also the tab stop.
 * - If the slot content isn't natively focusable, the wrapper exposes
 *   `tabindex="0"` so the tooltip's trigger is reachable by keyboard.
 *
 * Rendering: in browsers with the Popover API (Baseline 2025), the bubble is
 * shown as a `popover="manual"` element in the top layer, positioned with
 * fixed viewport coordinates. The top layer escapes ancestor `overflow`
 * clipping, z-index stacking, and transformed containing blocks — tooltips
 * inside scrollable side panels are no longer cut off — while the bubble
 * stays in the component subtree, so the aria-describedby relationship and
 * scoped styles are untouched. Browsers without the Popover API fall back to
 * the previous absolutely-positioned bubble.
 *
 * Tooltips per the spec should not contain interactive content — for that,
 * build a non-modal dialog (popover) instead.
 *
 * @component cat-tooltip
 * @example
 * <cat-tooltip text="Click to save">
 *   <button class="button">Save</button>
 * </cat-tooltip>
 */

interface Props {
  /** Tooltip text content. */
  text: string
  /** Tooltip position relative to element. @default 'top' */
  position?: 'top' | 'bottom' | 'left' | 'right'
  /**
   * Force the wrapper to be focusable even when the slot already contains a
   * focusable element. Defaults to auto-detect on mount.
   */
  alwaysFocusable?: boolean

  /**
   * Mark the trigger as having a tooltip: `cursor: help` and a dotted
   * underline. Opt-in, because it changes the appearance of the slot content
   * at every existing call site.
   *
   * Worth setting whenever the trigger is not otherwise obviously
   * interactive — without it there is nothing on screen telling a pointer
   * user a tooltip exists, and they have to happen to hover the right pixels.
   * @default false
   */
  affordance?: boolean

  /**
   * Fade the bubble in and out. Suppressed automatically under
   * `prefers-reduced-motion: reduce` regardless of this prop, matching
   * cat-collapse and cat-steps.
   * @default true
   */
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top',
  alwaysFocusable: false,
  affordance: false,
  animated: true
})

const wrapperRef = ref<HTMLElement | null>(null)
const bubbleRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
const slotIsFocusable = ref(false)
const adjustedPosition = ref<string | null>(null)
const tooltipId = useId()

// Popover API support (Baseline 2025). Checked once; jsdom and older
// browsers take the absolutely-positioned fallback path.
const popoverSupported = typeof HTMLElement !== 'undefined'
  && typeof HTMLElement.prototype.showPopover === 'function'

// Slot element we've applied aria-describedby to, so we can clean it up when
// the slot changes or the component unmounts.
let describedSlotEl: HTMLElement | null = null

const effectivePosition = computed(() => adjustedPosition.value || props.position)
const needsTabindex = computed(() => props.alwaysFocusable || !slotIsFocusable.value)

function detectFocusableSlot () {
  const wrapper = wrapperRef.value
  if (!wrapper) {
    applyDescribedBy(null)
    return
  }
  // `:disabled`, not `[disabled]`: the pseudo-class also matches a control
  // disabled by an ancestor `<fieldset disabled>`, which is what cat-fieldset
  // renders. A disabled control is not in the tab order, so treating it as the
  // tab stop left the wrapper without a tabindex of its own and hung
  // aria-describedby on something unreachable — making the tooltip
  // keyboard-invisible in the case that needs it most, explaining why an
  // action is unavailable. Excluding it makes the wrapper take the tabindex.
  const focusable = wrapper.querySelector<HTMLElement>(
    'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), '
    + 'textarea:not(:disabled), [tabindex]:not([tabindex="-1"]):not(:disabled)'
  )
  // The tooltip bubble itself contains no focusable elements by design, so
  // any focusable here is from the user's slot.
  const isSlotFocusable = focusable !== null && !focusable.classList.contains('cat-tooltip-bubble')
  slotIsFocusable.value = isSlotFocusable
  applyDescribedBy(isSlotFocusable ? focusable : null)
}

// aria-describedby is not inherited, so when the slot child is the tab stop it
// must carry the id itself. Append/remove our id without clobbering any
// existing aria-describedby the consumer set.
function applyDescribedBy (el: HTMLElement | null) {
  if (el === describedSlotEl) return
  if (describedSlotEl) {
    const existing = describedSlotEl.getAttribute('aria-describedby')
    if (existing) {
      const ids = existing.split(/\s+/).filter(id => id && id !== tooltipId)
      if (ids.length) describedSlotEl.setAttribute('aria-describedby', ids.join(' '))
      else describedSlotEl.removeAttribute('aria-describedby')
    }
  }
  describedSlotEl = el
  if (el) {
    const existing = el.getAttribute('aria-describedby')
    const ids = existing ? existing.split(/\s+/).filter(Boolean) : []
    if (!ids.includes(tooltipId)) ids.push(tooltipId)
    el.setAttribute('aria-describedby', ids.join(' '))
  }
}

function isFocusInside (): boolean {
  const active = document.activeElement
  return !!(active && wrapperRef.value && wrapperRef.value.contains(active))
}

function relatedTargetInside (event: FocusEvent | MouseEvent): boolean {
  const target = event.relatedTarget as Node | null
  return !!(target && wrapperRef.value && wrapperRef.value.contains(target))
}

// Crossing the gap between trigger and bubble briefly puts the pointer over
// neither, which would otherwise read as a mouseleave. A short close delay,
// cancelled by re-entry, bridges it — and is position-agnostic, unlike a
// transparent CSS bridge which would need geometry per side.
const CLOSE_DELAY_MS = 150
let closeTimer: ReturnType<typeof setTimeout> | undefined

function cancelClose () {
  clearTimeout(closeTimer)
  closeTimer = undefined
}

function onMouseenter () {
  cancelClose()
  show()
}

// Showing on focus is right for a keyboard user and wrong for a pointer one.
// When the slot has no focusable child the wrapper takes a tabindex of its
// own, so a click focuses it; the bubble then stays up after the pointer has
// left, because onMouseleave declines to hide while focus is inside. That
// reads as the tooltip getting stuck — which matters most on a trigger that
// is itself clickable.
//
// Tracked from pointerdown rather than `:focus-visible`, which is the same
// distinction but only as a rendering hint: jsdom reports it false for a
// synthetic focus, so the behaviour would be untestable and would differ
// between environments.
let focusFromPointer = false

function onPointerdown (event: PointerEvent) {
  // Only a press on the trigger counts. The bubble is inside the wrapper and
  // is now a pointer target itself, so selecting the tooltip's text would
  // otherwise re-label a keyboard-driven focus as pointer-driven and start
  // dismissing on the next mouseleave, with the trigger still focused.
  if (bubbleRef.value?.contains(event.target as Node)) return
  focusFromPointer = true
}

function onFocusin () {
  // A pointer press has already shown the bubble via mouseenter; showing it
  // again here is what would make it outlast the pointer.
  if (focusFromPointer) return
  show()
}

function show () {
  cancelClose()
  isVisible.value = true
  nextTick(() => {
    if (popoverSupported && bubbleRef.value) {
      // Throws if the element is disconnected or already open; both are
      // harmless races here.
      try { bubbleRef.value.showPopover() } catch { /* noop */ }
    }
    adjustPosition()
  })
}

function onMouseleave (event: MouseEvent) {
  // The bubble is a DOM child of the wrapper even when rendered in the top
  // layer, so moving the pointer onto it counts as inside and keeps it open.
  if (relatedTargetInside(event)) return
  // Keyboard focus inside keeps it open; focus the pointer itself just put
  // there does not, or the bubble outlives the pointer that summoned it.
  if (isFocusInside() && !focusFromPointer) return
  scheduleHide()
}

function onFocusout (event: FocusEvent) {
  if (relatedTargetInside(event)) return
  focusFromPointer = false
  hide()
}

// Leaving the bubble for anywhere outside the component dismisses; moving
// back onto the trigger does not, and the wrapper's own mouseleave takes over
// from there.
function onBubbleMouseleave (event: MouseEvent) {
  if (relatedTargetInside(event)) return
  if (isFocusInside() && !focusFromPointer) return
  scheduleHide()
}

function scheduleHide () {
  cancelClose()
  closeTimer = setTimeout(hide, CLOSE_DELAY_MS)
}

function hide () {
  cancelClose()
  isVisible.value = false
  adjustedPosition.value = null
  if (popoverSupported && bubbleRef.value) {
    try { bubbleRef.value.hidePopover() } catch { /* noop */ }
  }
}

onMounted(() => {
  detectFocusableSlot()
  // Applied post-mount (not a template binding) so SSR markup matches the
  // client on browsers without Popover API support.
  if (popoverSupported && bubbleRef.value) {
    bubbleRef.value.setAttribute('popover', 'manual')
  }
})

onUpdated(() => {
  detectFocusableSlot()
})

// Escape goes through the shared LIFO dismiss stack rather than a handler on
// the wrapper. Two things fall out of that: a hover-opened tooltip is
// dismissable even though focus is elsewhere (the old wrapper handler only
// fired with focus inside, so Escape did nothing and the pointer had to be
// moved — which WCAG 1.4.13 says must not be required), and the keypress is
// consumed, so a tooltip open inside a cat-modal no longer closes the dialog
// in the same press.
const dismissLayer: DismissLayer = { onEscape: () => hide() }

watch(isVisible, (visible) => {
  if (visible) {
    pushDismissLayer(dismissLayer)
  } else {
    removeDismissLayer(dismissLayer)
  }
})

onBeforeUnmount(() => {
  cancelClose()
  removeDismissLayer(dismissLayer)
  applyDescribedBy(null)
})

function adjustPosition () {
  if (!wrapperRef.value) return
  adjustedPosition.value = null

  requestAnimationFrame(() => {
    if (!wrapperRef.value) return

    const rect = wrapperRef.value.getBoundingClientRect()
    // In popover mode the bubble is rendered (top layer), so measure its real
    // size; the fallback path keeps the previous estimates.
    const bubbleRect = popoverSupported ? bubbleRef.value?.getBoundingClientRect() : undefined
    const tooltipWidth = bubbleRect?.width || 300
    const tooltipHeight = bubbleRect?.height || 100
    const margin = 20

    let newPosition: 'top' | 'bottom' | 'left' | 'right' = props.position

    if (props.position === 'top' || props.position === 'bottom') {
      const tooltipLeft = rect.left + rect.width / 2 - tooltipWidth / 2
      const tooltipRight = rect.left + rect.width / 2 + tooltipWidth / 2

      if (tooltipLeft < margin) {
        if (rect.right + tooltipWidth + margin < window.innerWidth) {
          newPosition = 'right'
        } else if (props.position === 'top') {
          newPosition = 'bottom'
        } else {
          newPosition = 'top'
        }
      } else if (tooltipRight > window.innerWidth - margin) {
        if (rect.left - tooltipWidth - margin > 0) {
          newPosition = 'left'
        } else if (props.position === 'top') {
          newPosition = 'bottom'
        } else {
          newPosition = 'top'
        }
      }
    }

    if (props.position === 'top' && rect.top - tooltipHeight < margin) {
      newPosition = 'bottom'
    } else if (props.position === 'bottom' && rect.bottom + tooltipHeight > window.innerHeight - margin) {
      newPosition = 'top'
    }

    if (props.position === 'left' && rect.left - tooltipWidth < margin) {
      newPosition = 'right'
    } else if (props.position === 'right' && rect.right + tooltipWidth > window.innerWidth - margin) {
      newPosition = 'left'
    }

    if (newPosition !== props.position) {
      adjustedPosition.value = newPosition
    }

    if (popoverSupported) {
      placeBubble(newPosition, rect, tooltipWidth, tooltipHeight)
    }
  })
}

// Top-layer bubbles are position: fixed, so compute viewport coordinates
// directly. Both axes are clamped to the viewport: the flip logic handles
// the main axis in normal cases, but a bubble too large for either side
// would otherwise still run off-screen (it's pointer-events: none, so
// overlapping the trigger in that degenerate case causes no hover flicker).
// When clamping shifts the bubble off the trigger's center, a CSS variable
// keeps the arrow pointing at the trigger.
const BUBBLE_OFFSET = 8 // matches $tooltip-offset
const ARROW_INSET = 12 // keep the arrow off the bubble's rounded corners

function placeBubble (
  position: 'top' | 'bottom' | 'left' | 'right',
  rect: DOMRect,
  bubbleWidth: number,
  bubbleHeight: number,
) {
  const bubble = bubbleRef.value
  if (!bubble) return
  const margin = 8
  const maxLeft = window.innerWidth - bubbleWidth - margin
  const maxTop = window.innerHeight - bubbleHeight - margin
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  let left: number
  let top: number
  if (position === 'top' || position === 'bottom') {
    left = clamp(centerX - bubbleWidth / 2, margin, maxLeft)
    top = position === 'top' ? rect.top - bubbleHeight - BUBBLE_OFFSET : rect.bottom + BUBBLE_OFFSET
    const arrowX = clamp(centerX - left, ARROW_INSET, bubbleWidth - ARROW_INSET)
    bubble.style.setProperty('--cat-tooltip-arrow-pos', `${arrowX}px`)
  } else {
    top = clamp(centerY - bubbleHeight / 2, margin, maxTop)
    left = position === 'left' ? rect.left - bubbleWidth - BUBBLE_OFFSET : rect.right + BUBBLE_OFFSET
    const arrowY = clamp(centerY - top, ARROW_INSET, bubbleHeight - ARROW_INSET)
    bubble.style.setProperty('--cat-tooltip-arrow-pos', `${arrowY}px`)
  }
  bubble.style.left = `${clamp(left, margin, maxLeft)}px`
  bubble.style.top = `${clamp(top, margin, maxTop)}px`
}

function clamp (value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max))
}
</script>

<style lang="scss" scoped>
@use "bulma/sass/utilities/initial-variables" as *;
@use "bulma/sass/utilities/derived-variables" as *;

$tooltip-bg: rgba($black, 0.9);
$tooltip-arrow-size: 6px;
$tooltip-offset: 8px;

.cat-tooltip {
  position: relative;
  display: inline-block;

  // Wrapper-applied focus ring when the slot itself isn't focusable.
  &[tabindex]:focus-visible {
    outline: 2px solid var(--bulma-text-strong);
    outline-offset: 2px;
    border-radius: $radius-small;
  }

  .cat-tooltip-bubble {
    position: absolute;
    padding: 8px 12px;
    // Deliberately theme-independent: the bubble is always dark ($tooltip-bg
    // is black at 90%), so white text is correct in both schemes.
    background: $tooltip-bg;
    color: $white;
    border-radius: $radius;
    font-size: $size-small;
    line-height: 1.4;
    white-space: normal;
    width: max-content;
    max-width: 300px;
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s, visibility 0.2s;
    z-index: 1000;
    // Self-contained typography: a real element inherits from its context
    // (e.g. Bulma's uppercase .menu-label), so reset everything that would
    // make tooltips render differently depending on where they're placed.
    font-weight: $weight-normal;
    text-transform: none;
    letter-spacing: normal;
    text-align: left;
    font-style: normal;

    // Arrow rides on the bubble so it escapes clipping together with it.
    // --cat-tooltip-arrow-pos keeps it pointing at the trigger when the
    // top-layer bubble is clamped to the viewport edge.
    &::before {
      content: '';
      position: absolute;
      border: $tooltip-arrow-size solid transparent;
      pointer-events: none;
    }
  }

  &.is-visible .cat-tooltip-bubble {
    opacity: 1;
    visibility: visible;
    // WCAG 1.4.13 (Content on Hover or Focus) requires hover content to be
    // hoverable: a user relying on magnification, or wanting to select a long
    // tooltip's text, must be able to move the pointer onto it. With
    // pointer-events: none the bubble was never a pointer target, so any move
    // toward it fired mouseleave on the wrapper and dismissed it. Only while
    // visible — a hidden bubble must not intercept clicks on the page.
    pointer-events: auto;
  }

  // Trigger affordance: opt-in, because it changes how slot content looks.
  &.cat-tooltip-affordance {
    cursor: help;
    text-decoration: underline dotted;
    text-underline-offset: 0.2em;
  }

  // Top-layer rendering (Popover API): fixed coordinates are set inline by
  // the component; reset the UA popover centering and keep the arrow
  // (positioned outside the bubble box) unclipped.
  .cat-tooltip-bubble[popover] {
    position: fixed;
    margin: 0;
    inset: auto;
    border: 0;
    overflow: visible;
    transition: opacity 0.2s, visibility 0.2s, display 0.2s allow-discrete, overlay 0.2s allow-discrete;
  }

  // Both of these have to name [popover] explicitly and sit after the rule
  // above: `.cat-tooltip .cat-tooltip-bubble[popover]` is (0,4,0), so a plain
  // `.cat-tooltip-static .cat-tooltip-bubble` ties it and loses on order,
  // leaving the fade in place on every browser with the Popover API.
  &.cat-tooltip-static {
    .cat-tooltip-bubble,
    .cat-tooltip-bubble[popover] {
      transition: none;
    }
  }

  // Matches the convention in cat-collapse, cat-steps and cat-msg: the fade is
  // suppressed for users who ask for reduced motion regardless of `animated`.
  @media (prefers-reduced-motion: reduce) {
    .cat-tooltip-bubble,
    .cat-tooltip-bubble[popover] {
      transition: none;
    }
  }

  &.is-tooltip-top {
    .cat-tooltip-bubble:not([popover]) {
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-bottom: $tooltip-offset;
    }

    .cat-tooltip-bubble::before {
      top: 100%;
      left: var(--cat-tooltip-arrow-pos, 50%);
      transform: translateX(-50%);
      border-top-color: $tooltip-bg;
    }
  }

  &.is-tooltip-bottom {
    .cat-tooltip-bubble:not([popover]) {
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-top: $tooltip-offset;
    }

    .cat-tooltip-bubble::before {
      bottom: 100%;
      left: var(--cat-tooltip-arrow-pos, 50%);
      transform: translateX(-50%);
      border-bottom-color: $tooltip-bg;
    }
  }

  &.is-tooltip-left {
    .cat-tooltip-bubble:not([popover]) {
      right: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-right: $tooltip-offset;
    }

    .cat-tooltip-bubble::before {
      left: 100%;
      top: var(--cat-tooltip-arrow-pos, 50%);
      transform: translateY(-50%);
      border-left-color: $tooltip-bg;
    }
  }

  &.is-tooltip-right {
    .cat-tooltip-bubble:not([popover]) {
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-left: $tooltip-offset;
    }

    .cat-tooltip-bubble::before {
      right: 100%;
      top: var(--cat-tooltip-arrow-pos, 50%);
      transform: translateY(-50%);
      border-right-color: $tooltip-bg;
    }
  }
}

// Fade-in from the top layer: the bubble goes display:none → block when
// shown via showPopover(), so the opacity transition needs a starting style.
@starting-style {
  .cat-tooltip.is-visible .cat-tooltip-bubble[popover] {
    opacity: 0;
  }
}
</style>
