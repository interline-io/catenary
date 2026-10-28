import { describe, it, expect } from 'vitest'
import { computePopoverPosition, type PopoverPlacement } from './anchored-popover'

function rect (left: number, top: number, width: number, height: number) {
  return { left, top, width, height, right: left + width, bottom: top + height }
}

const viewport = { width: 1000, height: 800 }

describe('computePopoverPosition', () => {
  it('places a bottom-left popover under and left-aligned to the trigger', () => {
    const r = computePopoverPosition(rect(100, 100, 200, 30), { width: 320, height: 300 }, 'bottom-left', viewport)
    expect(r.left).toBe(100) // left edges align
    expect(r.top).toBe(134) // trigger.bottom (130) + gap (4)
    expect(r.placement).toBe('bottom-left')
  })

  it('right-aligns a bottom-right popover to the trigger', () => {
    const r = computePopoverPosition(rect(600, 100, 200, 30), { width: 320, height: 300 }, 'bottom-right', viewport)
    // right edge (800) minus width (320) = 480
    expect(r.left).toBe(480)
    expect(r.placement).toBe('bottom-right')
  })

  it('flips a bottom placement to top when there is no room below', () => {
    // Trigger near the bottom: 700+30=730, only 70px below; 300-tall popover
    // does not fit below but fits above (700px of room).
    const r = computePopoverPosition(rect(100, 700, 200, 30), { width: 320, height: 300 }, 'bottom-left', viewport)
    expect(r.placement).toBe('top-left')
    expect(r.top).toBe(700 - 4 - 300) // trigger.top - gap - height
    expect(r.maxHeight).toBe(700 - 4 - 8) // the room above: trigger.top - gap - margin
  })

  it('flips a top placement to bottom when there is no room above', () => {
    const r = computePopoverPosition(rect(100, 20, 200, 30), { width: 320, height: 300 }, 'top-left', viewport)
    expect(r.placement).toBe('bottom-left')
    expect(r.top).toBe(50 + 4) // trigger.bottom + gap
  })

  it('does not flip when the preferred side has room', () => {
    const r = computePopoverPosition(rect(100, 300, 200, 30), { width: 320, height: 300 }, 'bottom-left', viewport)
    expect(r.placement).toBe('bottom-left')
  })

  it('clamps horizontally so a wide popover stays on screen', () => {
    // Trigger far right; a 320-wide popover left-aligned would overflow.
    const r = computePopoverPosition(rect(900, 100, 80, 30), { width: 320, height: 300 }, 'bottom-left', viewport)
    expect(r.left).toBe(1000 - 320 - 8) // viewport.width - width - margin
  })

  it('clamps to the left margin rather than going negative', () => {
    const r = computePopoverPosition(rect(-50, 100, 40, 30), { width: 320, height: 300 }, 'bottom-left', viewport)
    expect(r.left).toBe(8) // margin
  })

  it('caps a popover too tall for either side to the roomier one', () => {
    const tall = { width: 320, height: 900 } // taller than the 800 viewport
    // 388px above the trigger (400 - 4 - 8) against 358px below (800 - 430 - 4 - 8).
    for (const placement of ['bottom-left', 'top-left'] as PopoverPlacement[]) {
      const r = computePopoverPosition(rect(100, 400, 200, 30), tall, placement, viewport)
      expect(r.placement).toBe('top-left')
      expect(r.maxHeight).toBe(388)
      expect(r.top).toBe(8) // trigger.top - gap - maxHeight, at the top margin
    }
  })

  it('stays on the preferred side when it is the roomier one, capped to its room', () => {
    // 458px below the trigger (800 - 330 - 4 - 8) against 288px above.
    const r = computePopoverPosition(rect(100, 300, 200, 30), { width: 320, height: 900 }, 'bottom-left', viewport)
    expect(r.placement).toBe('bottom-left')
    expect(r.top).toBe(334) // trigger.bottom + gap
    expect(r.maxHeight).toBe(458)
  })

  describe('centered and beside the trigger', () => {
    const bubble = { width: 200, height: 40 }

    it('centers a top popover on the trigger, with the arrow at its middle', () => {
      const r = computePopoverPosition(rect(400, 300, 100, 30), bubble, 'top', viewport)
      expect(r.placement).toBe('top')
      expect(r.left).toBe(350) // trigger center (450) - width / 2
      expect(r.top).toBe(256) // trigger.top - gap - height
      expect(r.arrow).toBe(100)
    })

    // Running past an edge along the side is no reason to change sides.
    it('slides a centered popover along the left edge, the arrow following the trigger', () => {
      const r = computePopoverPosition(rect(10, 300, 40, 30), bubble, 'top', viewport)
      expect(r.placement).toBe('top')
      expect(r.left).toBe(8) // margin
      expect(r.arrow).toBe(22) // trigger center (30) - left
    })

    it('slides a centered popover along the right edge', () => {
      const r = computePopoverPosition(rect(960, 300, 30, 30), bubble, 'bottom', viewport)
      expect(r.placement).toBe('bottom')
      expect(r.left).toBe(792) // viewport.width - width - margin
      expect(r.arrow).toBe(183) // trigger center (975) - left
    })

    it('keeps the preferred side with just enough room', () => {
      // 52 - gap 8 - margin 4 leaves exactly the popover's 40px.
      const r = computePopoverPosition(rect(400, 52, 40, 30), bubble, 'top', viewport, 8, 4)
      expect(r.placement).toBe('top')
      expect(r.top).toBe(4)
    })

    it('places a right popover beside the trigger, centered on it', () => {
      const r = computePopoverPosition(rect(400, 300, 100, 30), bubble, 'right', viewport)
      expect(r.placement).toBe('right')
      expect(r.left).toBe(504) // trigger.right + gap
      expect(r.top).toBe(295) // trigger center (315) - height / 2
      expect(r.arrow).toBe(20)
    })

    it('flips a left popover to the right when it does not fit and the right has more room', () => {
      const r = computePopoverPosition(rect(50, 300, 40, 30), bubble, 'left', viewport)
      expect(r.placement).toBe('right')
      expect(r.left).toBe(94) // trigger.right + gap
    })

    it('slides a popover beside the trigger along the top edge', () => {
      const r = computePopoverPosition(rect(400, 0, 40, 20), bubble, 'right', viewport)
      expect(r.placement).toBe('right')
      expect(r.top).toBe(8) // margin
      expect(r.arrow).toBe(2) // trigger center (10) - top
    })
  })
})
