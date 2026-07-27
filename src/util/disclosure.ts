import { ref, computed, watch, useId, type ComputedRef } from 'vue'

/**
 * Shared wiring for the WAI-ARIA disclosure (show/hide) pattern.
 * https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
 *
 * Owns the state and the ARIA contract so every disclosure in the library
 * behaves identically: `cat-collapse` renders it standalone, while `cat-msg` and
 * `cat-card` render their own Bulma header markup and spread the attrs onto it.
 * Returning attrs rather than markup is what lets those two keep `message-header`
 * / `card-header` as a direct child of `.message` / `.card`, which Bulma's
 * adjacent-sibling styling depends on.
 *
 * What the pattern requires, and where it is enforced:
 *   - The trigger must have role `button`. Callers spread `triggerAttrs` onto a
 *     real `<button>`; `type="button"` is included so it never submits a form.
 *     A native button also brings Enter/Space, focus, and forced-colors support,
 *     so there are no key handlers here at all.
 *   - `aria-expanded` tracks the state (required).
 *   - `aria-controls` points at the content element (optional in the APG, and
 *     support in assistive tech is uneven, but harmless and occasionally useful).
 *   - Focus deliberately does not move on toggle: per the APG, someone who hits
 *     the control by accident keeps their place and can toggle straight back.
 *
 * Callers are responsible for hiding collapsed content with `v-show`/`v-if`
 * (i.e. `display: none` or removal) rather than `aria-hidden`, so the subtree
 * leaves both the accessibility tree and the tab order.
 */

export interface UseDisclosureOptions {
  /** Reactive read of the controlled `open` prop. */
  open: () => boolean
  /** Notified after every state change, with the new value. */
  onChange?: (value: boolean) => void
  /** Prefix for the generated element ids. Defaults to `cat-disclosure`. */
  idPrefix?: string
}

export interface UseDisclosureReturn {
  isOpen: ComputedRef<boolean>
  triggerId: string
  contentId: string
  /** Spread onto the trigger `<button>`. */
  triggerAttrs: ComputedRef<{
    'id': string
    'type': 'button'
    'aria-expanded': boolean
    'aria-controls': string
  }>
  /** Spread onto the element holding the collapsible content. */
  contentAttrs: { id: string }
  toggle: () => void
  setOpen: (value: boolean) => void
}

export function useDisclosure (options: UseDisclosureOptions): UseDisclosureReturn {
  const uid = useId()
  const prefix = options.idPrefix ?? 'cat-disclosure'
  const triggerId = `${prefix}-trigger-${uid}`
  const contentId = `${prefix}-content-${uid}`

  // Internal state mirrors the prop, so a component works both uncontrolled
  // (<cat-collapse label="…">) and controlled (v-model:open, or :open + @open to
  // build an accordion where the parent decides which panel is showing).
  const internalOpen = ref(options.open())
  watch(options.open, (value) => {
    internalOpen.value = value
  })

  const isOpen = computed(() => internalOpen.value)

  function setOpen (value: boolean) {
    // Guard against re-emitting when the parent pushes down the state we are
    // already in — otherwise a controlled parent and this component ping-pong.
    if (internalOpen.value === value) {
      return
    }
    internalOpen.value = value
    options.onChange?.(value)
  }

  function toggle () {
    setOpen(!internalOpen.value)
  }

  const triggerAttrs = computed(() => ({
    'id': triggerId,
    'type': 'button' as const,
    'aria-expanded': internalOpen.value,
    'aria-controls': contentId
  }))

  return {
    isOpen,
    triggerId,
    contentId,
    triggerAttrs,
    contentAttrs: { id: contentId },
    toggle,
    setOpen
  }
}
