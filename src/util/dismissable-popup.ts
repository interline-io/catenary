import { onMounted, onBeforeUnmount, watch, type Ref } from 'vue'
import { pushDismissLayer, removeDismissLayer, type DismissLayer } from './dismiss-stack'

/**
 * Shared light-dismiss behavior for popup-style components (dropdown menus,
 * datepicker calendars): close on a click outside the component's root
 * element, and close on Escape via the shared dismiss stack (only the
 * topmost open layer dismisses per Escape press).
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
    const target = event.target
    // contains() throws on non-Node EventTargets, which synthetic or
    // programmatic events can produce; with no Node we can't tell inside
    // from outside, so do nothing rather than guess.
    if (!root || !(target instanceof Node)) return
    if (!root.contains(target)) {
      options.onClickOutside()
    }
  }

  // Escape goes through the shared LIFO dismiss stack rather than a direct
  // document listener, so when this popup is open inside a modal (or another
  // layered surface) one Escape closes only the topmost layer.
  const layer: DismissLayer = { onEscape: () => options.onEscape() }
  watch(() => options.isOpen(), (open) => {
    if (open) {
      pushDismissLayer(layer)
    } else {
      removeDismissLayer(layer)
    }
  }, { immediate: true })

  onMounted(() => {
    document.addEventListener('click', handleDocumentClick)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleDocumentClick)
    removeDismissLayer(layer)
  })
}
