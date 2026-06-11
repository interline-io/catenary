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

  it('clamps the top when a popover is too tall for either side', () => {
    const tall = { width: 320, height: 900 } // taller than the 800 viewport
    for (const placement of ['bottom-left', 'top-left'] as PopoverPlacement[]) {
      const r = computePopoverPosition(rect(100, 400, 200, 30), tall, placement, viewport)
      expect(r.top).toBe(8) // clamped to top margin
    }
  })
})
