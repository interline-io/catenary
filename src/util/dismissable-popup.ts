import { onMounted, onBeforeUnmount, type Ref } from 'vue'

/**
 * Shared light-dismiss behavior for popup-style components (dropdown menus,
 * datepicker calendars): close on a click outside the component's root
 * element, and close on Escape pressed anywhere in the document.
 *
 * The two dismissal paths are separate callbacks because they usually differ
 * in focus handling: Escape returns focus to the trigger (the user is
 * keyboard-driving), while an outside click must not steal focus from
 * whatever the user clicked.
 *
 * Listeners are registered on mount and removed before unmount. Both are
 * no-ops while `isOpen()` is false.
 */
export interface DismissablePopupOptions {
  /** Root element containing both the trigger and the popup; clicks inside it are ignored. */
  rootRef: Ref<HTMLElement | null>
  /** Whether the popup is currently open. */
  isOpen: () => boolean
  /** Called when a click lands outside `rootRef` while open. */
  onClickOutside: () => void
  /** Called when Escape is pressed anywhere in the document while open. */
  onEscape: () => void
}

export function useDismissablePopup (options: DismissablePopupOptions): void {
  function handleDocumentClick (event: MouseEvent) {
    if (!options.isOpen()) return
    const root = options.rootRef.value
    if (root && !root.contains(event.target as Node)) {
      options.onClickOutside()
    }
  }

  function handleDocumentKeydown (event: KeyboardEvent) {
    if (event.key === 'Escape' && options.isOpen()) {
      options.onEscape()
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleDocumentClick)
    document.addEventListener('keydown', handleDocumentKeydown)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleDocumentClick)
    document.removeEventListener('keydown', handleDocumentKeydown)
  })
}
