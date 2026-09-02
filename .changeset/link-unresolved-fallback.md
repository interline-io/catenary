---
"@interline-io/catenary": minor
---

`cat-link` accessibility review. Part of #64.

**An unmapped `route-key` is now tried as a route name.** The map injected as `LinkRoutesKey` exists to remap a canonical key into a host app's own route namespace. A host whose route names already match the keys needed an identity entry for every one of them, and a missing entry did not fail — it rendered the inert `<span>` fallback. `router.resolve` still rejects a name that does not exist, so only a key matching neither a map entry nor a real route falls through.

**An unresolved link warns in development, naming the key.** This is the accessibility fix. The fallback `<span>` keeps whatever classes it was given, and callers style these as buttons, so an unresolved link can render as something that looks exactly like a button but has no link role, cannot be focused, and does nothing on click or Enter — with nothing in the console to say so. A sighted mouse user sees a dead button; a keyboard user never reaches it; a screen reader announces plain text.

There is no markup fix available inside the component — stripping the caller's classes would be a surprise, and rendering nothing would drop content — so the silence is what changes.

This failure mode is not hypothetical: a downstream app already carries a plugin whose comment records it, having found that every keyed link was silently falling back to a styled, non-navigable `<span>`.

The playground page gains the `demo-a11y` section it was missing, a demo of the unmapped-key resolution, and a side-by-side of a real button-styled link against an inert look-alike.
