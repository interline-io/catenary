/**
 * Split a component's fallthrough attributes between its wrapper and the
 * native element it wraps.
 *
 * Components that render a native control inside a `.control` wrapper set
 * `inheritAttrs: false` so attributes reach the control rather than being
 * duplicated onto the wrapper, then route a subset back to the wrapper by
 * hand. This centralizes the one subtlety in doing that.
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

// Events a listener on the wrapper cannot observe at all, so they have to be
// bound to the native control itself.
//
// The test is "can the wrapper see it", which is narrower than "does it
// bubble". `mouseenter` and its pointer counterpart do not bubble, yet the
// browser fires them separately on every element being entered — so the wrapper
// does see them, over a larger area than the control. They belong on the
// wrapper with the rest. `focusin` / `focusout` are the bubbling counterparts
// of the first two here and are deliberately absent.
//
// This is an allowlist, so an event missing from it is silently dead rather
// than merely misplaced — `invalid` was missed on the first pass and would have
// left constraint validation unreachable through these components. To check a
// candidate, put a listener on a wrapper and on the control, provoke the *real*
// event and see which fires; dispatching a synthetic one only echoes back
// whichever `bubbles` you passed, and reasoning from `bubbles` alone is what
// put the enter/leave family in this list by mistake.
const WRAPPER_CANNOT_SEE = new Set([
  'onFocus',
  'onBlur',
  // Scrolling an element does not notify its ancestors.
  'onScroll',
  'onScrollend',
  // Fired by constraint validation, e.g. form.reportValidity() on a control
  // with an unmet `required` or `pattern`.
  'onInvalid'
])

const isWrapperBlindListener = (key: string): boolean =>
  WRAPPER_CANNOT_SEE.has(key.replace(LISTENER_MODIFIERS, ''))

// Everything the wrapper can observe belongs on the wrapper and nowhere else.
// It sees the control's own events on the way up *and* events from the icons
// and clear button beside it, which is why it is the better of the two
// destinations — and binding it in both places is what made a single keypress
// fire twice.
const isWrapperListener = (key: string): boolean =>
  isListenerAttr(key) && !isWrapperBlindListener(key)

/**
 * The wrapper's share: `class`, `style` and every listener for an event the
 * wrapper can observe.
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
 * The native control's share for a component whose wrapper also takes `class`
 * and `style`: everything except the listeners the wrapper already took.
 *
 * Not the same predicate as `!isRootAttr`, which `cat-checkbox` uses: there
 * `class` and `style` stay on the wrapper alone. The two differ only on those
 * two keys, deliberately, so they are not interchangeable.
 */
export const isControlAttr = (key: string): boolean => !isWrapperListener(key)

/**
 * The native control's share for a component whose wrapper keeps `class` and
 * `style` to itself — `cat-checkbox`, whose root *is* the `<label>`, where a
 * consumer's spacing class already applied and must keep applying.
 *
 * Named rather than written inline at the call site so the difference from
 * `isControlAttr` is visible: tidying the two into one would move a spacing
 * class onto the box and shift the layout of every existing call site.
 */
export const isLabelledControlAttr = (key: string): boolean => !isRootAttr(key)
