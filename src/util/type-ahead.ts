/**
 * Type-ahead character search for composite widgets (menu, listbox, etc.).
 *
 * Implements the WAI-ARIA Authoring Practices type-ahead pattern:
 *   - Pressing a printable character moves focus to the next item whose name
 *     starts with that character.
 *   - Typing multiple characters in quick succession (within `resetMs`)
 *     extends the search to match items starting with the full string.
 *   - Returns to a single-character search after a timeout.
 *
 * Pattern reference:
 *   https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction
 *   https://www.w3.org/WAI/ARIA/apg/patterns/menubar/#keyboardinteraction
 */

export interface TypeAheadHandle {
  /** True if the key is a printable character usable for type-ahead. */
  isTypeAheadKey: (event: KeyboardEvent) => boolean
  /** Append the key character to the buffer (resetting the timer). Returns the new buffer. */
  appendChar: (ch: string) => string
  /** Clear the buffer and pending timer immediately. */
  reset: () => void
  /**
   * Find the next item whose name starts with `buf`, searching forward from
   * `startIndex` (exclusive) with wrap-around. Single-char buffers prefer the
   * next item after the current one (so repeated presses cycle through items
   * starting with that character).
   * @returns the matched index, or -1 if no match.
   */
  findMatch: (items: string[], buf: string, startIndex: number) => number
}

export function createTypeAhead (resetMs: number = 500): TypeAheadHandle {
  let buffer = ''
  let timer: ReturnType<typeof setTimeout> | null = null

  function reset (): void {
    buffer = ''
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  function isTypeAheadKey (event: KeyboardEvent): boolean {
    if (event.key.length !== 1) return false
    if (event.ctrlKey || event.metaKey || event.altKey) return false
    return /\S/.test(event.key) || event.key === ' '
  }

  function appendChar (ch: string): string {
    buffer += ch.toLowerCase()
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => { buffer = '' }, resetMs)
    return buffer
  }

  function findMatch (items: string[], buf: string, startIndex: number): number {
    const n = items.length
    if (n === 0 || !buf) return -1
    const lower = buf.toLowerCase()
    // Cycle forward from startIndex, wrapping around. For a single-character
    // buffer (the common "press a key to cycle" case), advancing past the
    // current item gives the natural cycle behavior; for multi-char buffers
    // searching from the current position lets the user refine in-place.
    const advance = lower.length === 1 ? 1 : 0
    for (let offset = advance; offset < n + advance; offset++) {
      const i = (startIndex + offset + n) % n
      if (items[i]?.toLowerCase().startsWith(lower)) return i
    }
    return -1
  }

  return { isTypeAheadKey, appendChar, reset, findMatch }
}
