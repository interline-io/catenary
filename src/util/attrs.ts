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

/** `class`, `style` and `on*` listeners — the subset that also belongs on a wrapper. */
export const isPresentationalAttr = (key: string): boolean =>
  key === 'class' || key === 'style' || /^on[A-Z]/.test(key)
