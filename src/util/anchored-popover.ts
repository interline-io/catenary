import { watch, nextTick, onBeforeUnmount, shallowRef, type Ref, type ShallowRef } from 'vue'

// Top-layer rendering for anchored popups: dropdown menus, datepicker
// calendars and tooltips.
//
// Without it, an open popup is clipped by any ancestor with `overflow:
// auto/hidden` — most visibly a scrollable modal body. The Popover API renders
// the element in the browser top layer, which escapes ancestor overflow
// clipping, z-index stacking, and transformed containing blocks, while keeping
// it in place in the DOM (so scoped styles, the aria-controls/activedescendant
// relationships, and click-outside containment via `root.contains()` are all
// unaffected).
//
// The popover is `popover="manual"`, not `auto`: auto popovers light-dismiss
// on their own (Escape, outside click) outside our control, which would
// bypass the shared dismiss stack and the components' own focus handling.
//
// Browsers without the Popover API (and jsdom) keep the components' own
// absolute positioning. The composable still reports where it would place the
// popover, for a component that styles its fallback from that.

// Whether the browser has the Popover API (Baseline 2025). Read as each
// component sets up rather than once at import, so a test can stub the API.
export function supportsPopover (): boolean {
  return typeof HTMLElement !== 'undefined'
    && typeof HTMLElement.prototype.showPopover === 'function'
}

// A side of the trigger, and for the top and bottom an edge: 'bottom-left'
// opens below the trigger with the two left edges aligned. With no edge, the
// popover centers on the trigger, as a tooltip does.
export type PopoverPlacement = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'top' | 'bottom' | 'left' | 'right'

// The side of the trigger a popover sits on.
export type PopoverSide = 'top' | 'bottom' | 'left' | 'right'

const OPPOSITE: Record<PopoverSide, PopoverSide> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }

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

// How a popover sits against its trigger and the window.
export interface PopoverLayout {
  // Space between the trigger and the popover. Default 4.
  gap?: number
  // How close the popover may come to the window's edges. Default 8.
  margin?: number
  // Cap the popover's height at the room on its side, so a menu too tall for
  // either side scrolls. Uncapped, the popover keeps its height and stays in
  // the window, over its trigger when neither side fits. Default true.
  capHeight?: boolean
  // How far an arrow keeps from the popover's corners. Default 0.
  arrowInset?: number
}

// Where a popover goes, in fixed viewport coordinates.
export interface PopoverPosition {
  left: number
  top: number
  // The room on the popover's side of the trigger.
  maxHeight: number
  placement: PopoverPlacement
  side: PopoverSide
  // Where the trigger's center falls along the popover's side, from the
  // popover's own start: where an arrow points at the trigger.
  arrow: number
  // How far the popover moved along its side to stay in the window.
  slide: number
}

// Computes where a popover anchored to a trigger goes. Pure, so it can be
// unit tested.
//
// The popover takes the other side only when its preferred side can't fit it
// and the other side can, or has more room. Along its side it slides to stay
// in the window.
export function computePopoverPosition (
  trigger: RectLike,
  popover: Size,
  placement: PopoverPlacement,
  viewport: Size,
  { gap = 4, margin = 8, capHeight = true, arrowInset = 0 }: PopoverLayout = {}
): PopoverPosition {
  const [preferred, edge] = placement.split('-') as [PopoverSide, 'left' | 'right' | undefined]
  const vertical = preferred === 'top' || preferred === 'bottom'
  const room: Record<PopoverSide, number> = {
    top: trigger.top - gap - margin,
    bottom: viewport.height - trigger.bottom - gap - margin,
    left: trigger.left - gap - margin,
    right: viewport.width - trigger.right - gap - margin
  }
  const size = vertical ? popover.height : popover.width
  const other = OPPOSITE[preferred]
  const side = room[preferred] < size && (room[other] >= size || room[other] > room[preferred]) ? other : preferred

  // A popover beside the trigger has the window's height to fill.
  const maxHeight = Math.max(0, vertical ? room[side] : viewport.height - 2 * margin)
  const height = capHeight ? Math.min(popover.height, maxHeight) : popover.height
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
  const arrow = vertical ? centerX - left : centerY - top

  return {
    left,
    top,
    maxHeight,
    placement: (edge ? `${side}-${edge}` : side) as PopoverPlacement,
    side,
    arrow: clamp(arrow, arrowInset, (vertical ? popover.width : height) - arrowInset),
    slide: vertical ? left - rawLeft : top - rawTop
  }
}

function clamp (value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

interface UseAnchoredPopoverOptions extends PopoverLayout {
  // The element the popover anchors to; its bounding box drives placement.
  triggerRef: Ref<HTMLElement | null>
  // The popover element, which gets popover="manual" and fixed coordinates.
  popoverRef: Ref<HTMLElement | null>
  // Whether the popover is open.
  isOpen: () => boolean
  // Preferred placement.
  placement: () => PopoverPlacement
}

// Shows a popover in the top layer while it is open, placed against its
// trigger and kept there as the page scrolls or the window resizes. `placed`
// is the last position computed, kept after the popover closes.
export function useAnchoredPopover (opts: UseAnchoredPopoverOptions): { placed: ShallowRef<PopoverPosition | null> } {
  const supported = supportsPopover()
  const capHeight = opts.capHeight ?? true
  const placed = shallowRef<PopoverPosition | null>(null)
  let raf = 0

  function position (): void {
    const trigger = opts.triggerRef.value
    const pop = opts.popoverRef.value
    // A placement still pending when the popover closed has nothing to place.
    if (!trigger || !pop || !opts.isOpen()) return
    const t = trigger.getBoundingClientRect()
    const p = pop.getBoundingClientRect()
    // A capped popover's natural height, which the cap from the last position
    // hides: the scroll height plus the border the box adds. Clearing the cap
    // to measure would reset the popover's scroll position, and cost a layout
    // per frame.
    const height = capHeight ? pop.scrollHeight + p.height - pop.clientHeight : p.height
    // The root's client size leaves out a classic scrollbar, which covers
    // fixed content beside it.
    const root = document.documentElement
    const placement = computePopoverPosition(
      t,
      { width: p.width, height },
      opts.placement(),
      { width: root.clientWidth, height: root.clientHeight },
      opts
    )
    placed.value = placement
    if (!supported) return
    pop.style.left = `${placement.left}px`
    pop.style.top = `${placement.top}px`
    if (capHeight) {
      pop.style.maxHeight = `${placement.maxHeight}px`
    }
  }

  function schedulePosition (): void {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(position)
  }

  function open (): void {
    const pop = opts.popoverRef.value
    if (!pop) return
    if (supported) {
      if (!pop.hasAttribute('popover')) {
        pop.setAttribute('popover', 'manual')
      }
      // showPopover throws if already open or disconnected; both are harmless.
      try { pop.showPopover() } catch { /* noop */ }
      // capture phase so scrolling any ancestor (e.g. the modal body) repositions.
      window.addEventListener('scroll', schedulePosition, true)
      window.addEventListener('resize', schedulePosition)
    }
    nextTick(position)
  }

  function close (): void {
    cancelAnimationFrame(raf)
    window.removeEventListener('scroll', schedulePosition, true)
    window.removeEventListener('resize', schedulePosition)
    const pop = opts.popoverRef.value
    if (supported && pop) {
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

  return { placed }
}
