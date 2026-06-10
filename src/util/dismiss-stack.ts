/**
 * Shared LIFO stack of Escape-dismissable layers (modals, dropdown menus,
 * datepicker calendars). A single document-level keydown listener dismisses
 * only the topmost layer per Escape press, so e.g. a calendar open inside a
 * modal closes on the first Escape and the modal on the second, instead of
 * both closing at once and destroying in-progress form state.
 *
 * The listener runs in the bubble phase, deliberately not capture:
 * - Components that consume Escape on their own element and stopPropagation
 *   (cat-taginput's input) prevent the event from reaching the document, so
 *   the stack never sees it. A capture listener would run before them and
 *   dismiss the wrong layer.
 * - Components that handle Escape on their own element with preventDefault
 *   but let it bubble (cat-dropdown's menu keydown) are respected via the
 *   defaultPrevented check below.
 */
export interface DismissLayer {
  /** Dismiss this layer (called only when it is the topmost open layer). */
  onEscape: () => void
}

const stack: DismissLayer[] = []

function handleDocumentKeydown (event: KeyboardEvent): void {
  if (event.key !== 'Escape' || event.defaultPrevented) return
  const top = stack[stack.length - 1]
  if (!top) return
  // Consume the keypress so nothing beneath this layer also reacts.
  event.preventDefault()
  top.onEscape()
}

export function pushDismissLayer (layer: DismissLayer): void {
  if (typeof document === 'undefined') return
  if (stack.includes(layer)) return
  if (stack.length === 0) {
    document.addEventListener('keydown', handleDocumentKeydown)
  }
  stack.push(layer)
}

export function removeDismissLayer (layer: DismissLayer): void {
  if (typeof document === 'undefined') return
  const index = stack.indexOf(layer)
  if (index >= 0) {
    stack.splice(index, 1)
  }
  if (stack.length === 0) {
    document.removeEventListener('keydown', handleDocumentKeydown)
  }
}
