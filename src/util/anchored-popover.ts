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

export type PopoverPlacement = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'

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

/**
 * Compute fixed viewport coordinates for a popover anchored to a trigger.
 * Pure and side-effect free so it can be unit tested. Flips the vertical side
 * when the preferred side lacks room and the opposite side has it, then clamps
 * both axes to the viewport so an oversized popover never runs off-screen.
 */
export function computePopoverPosition (
  trigger: RectLike,
  popover: Size,
  placement: PopoverPlacement,
  viewport: Size,
  gap = 4,
  margin = 8
): { left: number, top: number, placement: PopoverPlacement } {
  const preferTop = placement === 'top-left' || placement === 'top-right'
  const alignRight = placement === 'bottom-right' || placement === 'top-right'

  const roomBelow = viewport.height - trigger.bottom - gap - margin
  const roomAbove = trigger.top - gap - margin
  // Flip only when the preferred side cannot fit and the other side can.
  let onTop = preferTop
  if (preferTop && roomAbove < popover.height && roomBelow >= popover.height) {
    onTop = false
  } else if (!preferTop && roomBelow < popover.height && roomAbove >= popover.height) {
    onTop = true
  }

  const rawTop = onTop ? trigger.top - gap - popover.height : trigger.bottom + gap
  const rawLeft = alignRight ? trigger.right - popover.width : trigger.left

  const maxLeft = Math.max(margin, viewport.width - popover.width - margin)
  const maxTop = Math.max(margin, viewport.height - popover.height - margin)
  const left = clamp(rawLeft, margin, maxLeft)
  const top = clamp(rawTop, margin, maxTop)

  return { left, top, placement: onTop ? (alignRight ? 'top-right' : 'top-left') : (alignRight ? 'bottom-right' : 'bottom-left') }
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
    const { left, top } = computePopoverPosition(
      t,
      { width: p.width, height: p.height },
      opts.placement(),
      { width: window.innerWidth, height: window.innerHeight }
    )
    pop.style.left = `${left}px`
    pop.style.top = `${top}px`
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
