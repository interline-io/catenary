/**
 * Split a component's fallthrough attributes between its wrapper and the
 * native element it wraps.
 *
 * Components that render a native control inside a `.control` wrapper set
 * `inheritAttrs: false` so attributes reach the control rather than being
 * duplicated onto the wrapper, then route a subset back to the wrapper by
 * hand. This centralises the one subtlety in doing that.
 */
export function filterAttrs (
  attrs: Record<string, unknown>,
  keep: (key: string) => boolean
): Record<string, unknown> {
  // Touch a key so the calling computed actually subscribes to `$attrs`.
  // Reactive tracking happens in the attrs proxy's `get` trap, and
  // `Object.entries()` on an empty attrs object triggers only `ownKeys` — so a
  // component that first renders with no fallthrough attributes at all would
  // register no dependency and keep returning that first empty result even
  // after a consumer adds one. Verified: `<cat-input v-bind="extra">` with
  // `extra` starting as `{}` never got a later-added class onto its wrapper.
  void attrs.class

  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(attrs)) {
    if (keep(key)) out[key] = value
  }
  return out
}

/** A fallthrough event listener, e.g. `onKeydown`. */
const isListenerAttr = (key: string): boolean => /^on[A-Z]/.test(key)

// Vue appends modifiers to the listener key — `@click.capture.once` arrives as
// `onClickCaptureOnce` — so they are stripped before matching and a modified
// listener is classified by its event rather than by its modifiers. Key
// modifiers (`@keydown.esc`) do not appear here: they compile to a `withKeys`
// guard around the handler and leave the key as `onKeydown`.
const LISTENER_MODIFIERS = /(?:Capture|Once|Passive)+$/

// Events that do not bubble. A listener on the wrapper would never see these
// fire on the native control inside it, so they have to be bound to the control
// itself. `focusin` / `focusout` are the bubbling counterparts of the first two
// and are deliberately absent.
const NON_BUBBLING = new Set([
  'onFocus',
  'onBlur',
  'onMouseenter',
  'onMouseleave',
  'onScroll'
])

const isNonBubblingListener = (key: string): boolean =>
  NON_BUBBLING.has(key.replace(LISTENER_MODIFIERS, ''))

// A bubbling listener belongs on the wrapper and nowhere else. The wrapper sees
// the control's own events on the way up *and* events from the icons and clear
// button beside it, which is why it is the better of the two destinations —
// and binding it in both places is what made a single keypress fire twice.
const isWrapperListener = (key: string): boolean =>
  isListenerAttr(key) && !isNonBubblingListener(key)

/**
 * The wrapper's share: `class`, `style` and every listener for an event that
 * bubbles.
 *
 * `class` and `style` deliberately reach both destinations. Layout utilities
 * style the wrapper, while typography only takes effect on the native element —
 * Bulma's `base/generic.scss` sets `font-family` directly on `input, select,
 * textarea`, so `is-family-monospace` on the wrapper alone cannot be inherited
 * in.
 */
export const isRootAttr = (key: string): boolean =>
  key === 'class' || key === 'style' || isWrapperListener(key)

/**
 * The native control's share: everything except the bubbling listeners the
 * wrapper already took. Non-bubbling listeners stay here, since the wrapper
 * cannot see them.
 */
export const isControlAttr = (key: string): boolean => !isWrapperListener(key)
