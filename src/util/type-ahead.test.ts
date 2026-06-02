import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createTypeAhead } from './type-ahead'

describe('createTypeAhead', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('isTypeAheadKey', () => {
    const ta = createTypeAhead()
    it('accepts printable single characters', () => {
      expect(ta.isTypeAheadKey(new KeyboardEvent('keydown', { key: 'a' }))).toBe(true)
      expect(ta.isTypeAheadKey(new KeyboardEvent('keydown', { key: 'Z' }))).toBe(true)
      expect(ta.isTypeAheadKey(new KeyboardEvent('keydown', { key: '5' }))).toBe(true)
    })
    it('rejects Space so it stays available to activate the focused item', () => {
      // Per WAI-ARIA Menu / Listbox: Space activates the focused button. If
      // type-ahead consumed Space, native button activation would break.
      expect(ta.isTypeAheadKey(new KeyboardEvent('keydown', { key: ' ' }))).toBe(false)
    })
    it('rejects multi-character keys', () => {
      expect(ta.isTypeAheadKey(new KeyboardEvent('keydown', { key: 'ArrowDown' }))).toBe(false)
      expect(ta.isTypeAheadKey(new KeyboardEvent('keydown', { key: 'Enter' }))).toBe(false)
      expect(ta.isTypeAheadKey(new KeyboardEvent('keydown', { key: 'Tab' }))).toBe(false)
    })
    it('rejects keys with modifiers', () => {
      expect(ta.isTypeAheadKey(new KeyboardEvent('keydown', { key: 'a', ctrlKey: true }))).toBe(false)
      expect(ta.isTypeAheadKey(new KeyboardEvent('keydown', { key: 'a', metaKey: true }))).toBe(false)
      expect(ta.isTypeAheadKey(new KeyboardEvent('keydown', { key: 'a', altKey: true }))).toBe(false)
    })
  })

  describe('findMatch', () => {
    const ta = createTypeAhead()
    const items = ['Apple', 'Apricot', 'Banana', 'Blueberry', 'Cherry']

    it('returns -1 when there are no items or the buffer is empty', () => {
      expect(ta.findMatch([], 'a', 0)).toBe(-1)
      expect(ta.findMatch(items, '', 0)).toBe(-1)
    })

    it('cycles single-character matches forward starting after the current index', () => {
      // From Apple (0), pressing "a" should advance to Apricot (1).
      expect(ta.findMatch(items, 'a', 0)).toBe(1)
      // From Apricot (1), pressing "a" should wrap back to Apple (0).
      expect(ta.findMatch(items, 'a', 1)).toBe(0)
      // From Cherry (4), pressing "b" finds Banana (2).
      expect(ta.findMatch(items, 'b', 4)).toBe(2)
    })

    it('multi-character buffers match in-place (do not advance past the current item)', () => {
      // If the user has been typing "ap" while focus is on Apple, refining
      // should keep matching Apple at index 0 rather than cycling away.
      expect(ta.findMatch(items, 'ap', 0)).toBe(0)
      expect(ta.findMatch(items, 'apr', 0)).toBe(1) // Apricot is the only match
    })

    it('is case-insensitive', () => {
      expect(ta.findMatch(items, 'C', 0)).toBe(4)
      expect(ta.findMatch(items, 'BAN', 0)).toBe(2)
    })

    it('returns -1 when no item starts with the buffer', () => {
      expect(ta.findMatch(items, 'z', 0)).toBe(-1)
      expect(ta.findMatch(items, 'app le', 0)).toBe(-1)
    })
  })

  describe('appendChar + reset timing', () => {
    it('accumulates characters into a single buffer', () => {
      const ta = createTypeAhead(500)
      expect(ta.appendChar('a')).toBe('a')
      expect(ta.appendChar('p')).toBe('ap')
      expect(ta.appendChar('R')).toBe('apr') // lowercased
    })

    it('resets the buffer after the configured timeout', () => {
      const ta = createTypeAhead(500)
      ta.appendChar('a')
      ta.appendChar('p')
      vi.advanceTimersByTime(499)
      expect(ta.appendChar('x')).toBe('apx')
      vi.advanceTimersByTime(500)
      expect(ta.appendChar('y')).toBe('y')
    })

    it('reset() clears the buffer immediately', () => {
      const ta = createTypeAhead(500)
      ta.appendChar('a')
      ta.appendChar('b')
      ta.reset()
      expect(ta.appendChar('z')).toBe('z')
    })
  })
})
