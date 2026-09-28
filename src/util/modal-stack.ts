/**
 * Shared stack of open cat-modals, in the order they opened. Close side
 * effects consult it so that several open modals don't undo each other:
 * - html.is-clipped is removed only when the last open modal closes.
 * - Only the topmost modal restores focus to its opener. A modal beneath
 *   another that closes (or unmounts) must not pull focus out of the one
 *   still open on top of it.
 * - A modal that never opened is not on the stack, so its unmount is a no-op.
 */
const stack: object[] = []

export function pushOpenModal (modal: object): void {
  if (!stack.includes(modal)) {
    stack.push(modal)
  }
}

/** Whether the modal is currently open (on the stack). */
export function isOpenModal (modal: object): boolean {
  return stack.includes(modal)
}

/** Whether the modal is the most recently opened one still open. */
export function isTopModal (modal: object): boolean {
  return stack[stack.length - 1] === modal
}

export function removeOpenModal (modal: object): void {
  const index = stack.indexOf(modal)
  if (index >= 0) {
    stack.splice(index, 1)
  }
}

export function openModalCount (): number {
  return stack.length
}
