<template>
  <!-- The wrapper IS the keyboard-accessible trigger: tabindex="0" when the
       slot has no focusable child; mouse and focus events paired per the
       WAI-ARIA tooltip pattern. -->
  <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
  <span
    ref="wrapperRef"
    class="cat-tooltip"
    :class="[`is-tooltip-${effectivePosition}`, { 'is-visible': isVisible }]"
    :tabindex="needsTabindex ? 0 : undefined"
    :aria-describedby="tooltipId"
    @mouseenter="show"
    @mouseleave="hide"
    @focusin="show"
    @focusout="hide"
    @keydown.escape="hide"
  >
    <slot />
    <span
      :id="tooltipId"
      class="cat-tooltip-bubble"
      role="tooltip"
    >
      {{ text }}
    </span>
  </span>
</template>

<script setup lang="ts">
import { ref, computed, useId, nextTick } from 'vue'

/**
 * Accessible tooltip following the WAI-ARIA Authoring Practices tooltip pattern.
 * https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/
 *
 * Behavior:
 * - Shows on hover (mouseenter) AND keyboard focus (focusin) of the trigger.
 * - Dismissed by mouseleave, focusout, or Escape.
 * - Tooltip is associated with the trigger via `aria-describedby` and `role="tooltip"`.
 * - If the slot content isn't natively focusable, the wrapper exposes `tabindex="0"`
 *   so the tooltip's trigger is reachable by keyboard.
 *
 * Tooltips per the spec should not contain interactive content — for that, build a
 * non-modal dialog (popover) instead.
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
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top',
  alwaysFocusable: false
})

const wrapperRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
const slotIsFocusable = ref(false)
const adjustedPosition = ref<string | null>(null)
const tooltipId = useId()

const effectivePosition = computed(() => adjustedPosition.value || props.position)
const needsTabindex = computed(() => props.alwaysFocusable || !slotIsFocusable.value)

function detectFocusableSlot () {
  if (!wrapperRef.value) return
  const focusable = wrapperRef.value.querySelector<HTMLElement>(
    'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  // The tooltip bubble itself contains no focusable elements by design, so
  // any focusable here is from the user's slot.
  slotIsFocusable.value = focusable !== null && !focusable.classList.contains('cat-tooltip-bubble')
}

function show () {
  detectFocusableSlot()
  isVisible.value = true
  nextTick(adjustPosition)
}

function hide () {
  isVisible.value = false
  adjustedPosition.value = null
}

function adjustPosition () {
  if (!wrapperRef.value) return
  adjustedPosition.value = null

  requestAnimationFrame(() => {
    if (!wrapperRef.value) return

    const rect = wrapperRef.value.getBoundingClientRect()
    const tooltipWidth = 300
    const tooltipHeight = 100
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
  })
}
</script>

<style lang="scss" scoped>
@use "bulma/sass/utilities/initial-variables" as *;
@use "bulma/sass/utilities/derived-variables" as *;

$tooltip-bg: rgba($black, 0.9);
$tooltip-arrow-size: 6px;
$tooltip-arrow-offset: 2px;
$tooltip-offset: 8px;

.cat-tooltip {
  position: relative;
  display: inline-block;

  // Wrapper-applied focus ring when the slot itself isn't focusable.
  &[tabindex]:focus-visible {
    outline: 2px solid $black;
    outline-offset: 2px;
    border-radius: $radius-small;
  }

  .cat-tooltip-bubble {
    position: absolute;
    padding: 8px 12px;
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
  }

  &::before {
    content: '';
    position: absolute;
    border: $tooltip-arrow-size solid transparent;
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s, visibility 0.2s;
    z-index: 1000;
  }

  &.is-visible {
    .cat-tooltip-bubble,
    &::before {
      opacity: 1;
      visibility: visible;
    }
  }

  &.is-tooltip-top {
    .cat-tooltip-bubble {
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-bottom: $tooltip-offset;
    }

    &::before {
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-bottom: $tooltip-arrow-offset;
      border-top-color: $tooltip-bg;
    }
  }

  &.is-tooltip-bottom {
    .cat-tooltip-bubble {
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-top: $tooltip-offset;
    }

    &::before {
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-top: $tooltip-arrow-offset;
      border-bottom-color: $tooltip-bg;
    }
  }

  &.is-tooltip-left {
    .cat-tooltip-bubble {
      right: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-right: $tooltip-offset;
    }

    &::before {
      right: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-right: $tooltip-arrow-offset;
      border-left-color: $tooltip-bg;
    }
  }

  &.is-tooltip-right {
    .cat-tooltip-bubble {
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-left: $tooltip-offset;
    }

    &::before {
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-left: $tooltip-arrow-offset;
      border-right-color: $tooltip-bg;
    }
  }
}
</style>
