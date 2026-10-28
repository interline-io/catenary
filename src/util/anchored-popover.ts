import { watch, nextTick, onBeforeUnmount, type Ref } from 'vue'

/**
 * Top-layer rendering for anchored popups (dropdown menus, datepicker
 * calendars). Without it, an open popup is clipped by any ancestor with
 * `overflow: auto/hidden` — most visibly a scrollable modal body. The Popover
 * API renders the element in the browser top layer, which escapes ancestor
 * overflow clipping, z-index stacking, and transformed containing blocks,
 * while keeping it in place in the DOM (so scoped styles, the
 * aria-controls/activedescendant relationships, and click-outside containment
 * via `root.contains()` are all unaffected).
 *
 * The popover is `popover="manual"`, not `auto`: auto popovers light-dismiss
 * on their own (Escape, outside click) outside our control, which would
 * bypass the shared dismiss stack and the components' own focus handling.
 *
 * Browsers without the Popover API (and jsdom) fall back to the components'
 * existing absolute positioning; this composable is a no-op there.
 */

export const popoverSupported = typeof HTMLElement !== 'undefined'
  && typeof HTMLElement.prototype.showPopover === 'function'

// A side of the trigger, and for the top and bottom an edge: 'bottom-left'
// opens below the trigger with the two left edges aligned. With no edge, the
// popover centers on the trigger, as a tooltip does.
export type PopoverPlacement = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'top' | 'bottom' | 'left' | 'right'

type Side = 'top' | 'bottom' | 'left' | 'right'

const OPPOSITE: Record<Side, Side> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }

interface RectLike {
  top: number
  left: number
  right: number
  bottom: number
  width: number
  height: number
}

interface Size {
  width: number
  height: number
}

// Computes fixed viewport coordinates for a popover anchored to a trigger, and
// the room on its side of the trigger as `maxHeight`, so an oversized popover
// scrolls rather than running off-screen. Pure, so it can be unit tested.
//
// Along its side the popover slides to stay on screen, and `arrow` is where the
// trigger's center falls along that side, from the popover's own start.
export function computePopoverPosition (
  trigger: RectLike,
  popover: Size,
  placement: PopoverPlacement,
  viewport: Size,
  gap = 4,
  margin = 8
): { left: number, top: number, maxHeight: number, placement: PopoverPlacement, arrow: number } {
  const [preferred, edge] = placement.split('-') as [Side, 'left' | 'right' | undefined]
  const vertical = preferred === 'top' || preferred === 'bottom'
  const room: Record<Side, number> = {
    top: trigger.top - gap - margin,
    bottom: viewport.height - trigger.bottom - gap - margin,
    left: trigger.left - gap - margin,
    right: viewport.width - trigger.right - gap - margin
  }
  // Flip when the preferred side cannot fit the popover and the other side
  // either can or, when neither can, has more room.
  const size = vertical ? popover.height : popover.width
  const other = OPPOSITE[preferred]
  const side = room[preferred] < size && (room[other] >= size || room[other] > room[preferred]) ? other : preferred

  // A popover beside the trigger has the window's height to fill.
  const maxHeight = Math.max(0, vertical ? room[side] : viewport.height - 2 * margin)
  const height = Math.min(popover.height, maxHeight)
  const centerX = trigger.left + trigger.width / 2
  const centerY = trigger.top + trigger.height / 2
  let rawLeft: number
  let rawTop: number
  if (vertical) {
    rawTop = side === 'top' ? trigger.top - gap - height : trigger.bottom + gap
    rawLeft = edge === 'left' ? trigger.left : edge === 'right' ? trigger.right - popover.width : centerX - popover.width / 2
  } else {
    rawLeft = side === 'left' ? trigger.left - gap - popover.width : trigger.right + gap
    rawTop = centerY - height / 2
  }

  const maxLeft = Math.max(margin, viewport.width - popover.width - margin)
  const maxTop = Math.max(margin, viewport.height - height - margin)
  const left = clamp(rawLeft, margin, maxLeft)
  const top = clamp(rawTop, margin, maxTop)

  return {
    left,
    top,
    maxHeight,
    placement: (edge ? `${side}-${edge}` : side) as PopoverPlacement,
    arrow: vertical ? centerX - left : centerY - top
  }
}

function clamp (value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

interface UseAnchoredPopoverOptions {
  /** The element the popover anchors to (its bounding box drives placement). */
  triggerRef: Ref<HTMLElement | null>
  /** The popover element (gets popover="manual" and fixed coordinates). */
  popoverRef: Ref<HTMLElement | null>
  /** Whether the popover is open. */
  isOpen: () => boolean
  /** Preferred placement. */
  placement: () => PopoverPlacement
}

export function useAnchoredPopover (opts: UseAnchoredPopoverOptions): void {
  if (!popoverSupported) return

  let raf = 0

  function position (): void {
    const trigger = opts.triggerRef.value
    const pop = opts.popoverRef.value
    if (!trigger || !pop) return
    const t = trigger.getBoundingClientRect()
    const p = pop.getBoundingClientRect()
    // The natural height, which the cap from the last position hides: the scroll
    // height plus the border the box adds. Clearing the cap to measure would
    // reset the popover's scroll position, and cost a layout per frame.
    const height = pop.scrollHeight + p.height - pop.clientHeight
    const { left, top, maxHeight } = computePopoverPosition(
      t,
      { width: p.width, height },
      opts.placement(),
      { width: window.innerWidth, height: window.innerHeight }
    )
    pop.style.left = `${left}px`
    pop.style.top = `${top}px`
    pop.style.maxHeight = `${maxHeight}px`
  }

  function schedulePosition (): void {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(position)
  }

  function open (): void {
    const pop = opts.popoverRef.value
    if (!pop) return
    if (!pop.hasAttribute('popover')) {
      pop.setAttribute('popover', 'manual')
    }
    // showPopover throws if already open or disconnected; both are harmless.
    try { pop.showPopover() } catch { /* noop */ }
    nextTick(position)
    // capture phase so scrolling any ancestor (e.g. the modal body) repositions.
    window.addEventListener('scroll', schedulePosition, true)
    window.addEventListener('resize', schedulePosition)
  }

  function close (): void {
    cancelAnimationFrame(raf)
    window.removeEventListener('scroll', schedulePosition, true)
    window.removeEventListener('resize', schedulePosition)
    const pop = opts.popoverRef.value
    if (pop) {
      try { pop.hidePopover() } catch { /* noop */ }
    }
  }

  watch(opts.isOpen, (isOpen) => {
    if (isOpen) {
      open()
    } else {
      close()
    }
  })

  onBeforeUnmount(close)
}
