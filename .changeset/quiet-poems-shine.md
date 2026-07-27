---
"@interline-io/catenary": minor
---

New `cat-collapse` disclosure component, with `cat-msg` and `cat-card` rebuilt on the same shared implementation.

The library already had two hand-rolled disclosures — the `expandable` modes of `cat-msg` and `cat-card` — which had drifted apart and shared the same accessibility flaws. Rather than adding a third, the state and ARIA wiring now live in one place (`util/disclosure.ts`) and all three render it.

## New: `cat-collapse`

A standalone disclosure following the [WAI-ARIA disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/):

- `label` and `icon` for the default trigger, or a `#trigger` slot receiving the current `open` state.
- `v-model:open`, plus `open`/`close` events so several collapses can be driven by one parent value as an accordion.
- `#actions` slot for controls that belong next to the trigger — rendered as a sibling, never nested inside the button.
- `heading-level` (2–6) wraps the trigger in a real heading, so a set of collapses is navigable by heading. The button goes inside the heading, never the reverse: most screen readers do not announce a heading nested inside an interactive element, and `role="button"` on a heading removes it from the headings list entirely.
- `animated` opt-in transition, suppressed under `prefers-reduced-motion`.
- `disabled`, `ariaLabel`, and an exposed `open()` / `close()` / `toggle()` / `focus()` API.

## Accessibility fixes

`cat-msg` and `cat-card` both put `role="button"` and `tabindex="0"` on a `<div>` header with hand-written Enter/Space handlers. Both now use a native `<button>`, which brings role, focus, keyboard activation and forced-colors rendering from the platform instead of from handlers that have to be kept correct.

- **`cat-msg`: the close button is no longer nested inside the trigger.** With `expandable` and `closable` together, the `delete` button sat inside an element with `role="button"` — invalid nested interactive content, and the reason the keydown handlers needed `.self` modifiers to stop the header swallowing Space meant for the close button. The two are now siblings and those modifiers are gone.
- **`cat-card`: the chevron is no longer a nested `<button>`.** It was a real button inside `role="button"`, working only because of `@click.stop`. It is now a `<span>` inside the single trigger button. Interactive header content belongs in `#actions`, which renders outside the trigger.
- **Both guarantee the trigger has an accessible name.** With no `label` and no `#trigger`/`#header` slot the button held only an aria-hidden chevron, leaving it unnamed (WCAG 4.1.2). Both now fall back to a generic name, overridable with the new `ariaLabel` prop, and omit `aria-label` entirely when visible text already supplies the name.
- **`cat-msg`'s body is hidden with `v-show` rather than removed with `v-if`.** `aria-controls` is an IDREF, so removing the body while collapsed left it pointing at nothing. `display: none` keeps the reference valid while still taking the subtree out of the accessibility tree and the tab order.
- Both now set `aria-controls` on the trigger, and both dropped their `eslint-disable` for `vuejs-accessibility/no-static-element-interactions`.
- **`cat-msg`'s dismiss button gains `type="button"` and a descriptive name.** Without an explicit type a `<button>` defaults to `submit`, so a `closable` message inside a `<form>` submitted it on dismiss. Its accessible name was also the bare `"delete"` — Bulma's class name rather than a description of the action. It now defaults to `"Dismiss message"` and is overridable via a new `ariaCloseLabel` prop, matching `cat-notification`. `cat-modal` and `cat-notification` already had both; `cat-msg` was the outlier. Pre-existing.

## Pre-existing bugs fixed

Both found while doing the above, neither introduced by it:

- **`cat-card`: an expandable card with no header rendered permanently invisible content.** The header only rendered given a `label`, `#header` or `#actions` — but the toggle lives in the header, so `<cat-card expandable>` with none of those produced no trigger at all while still hiding its content behind the open state, with no way to reveal it. `expandable` is now part of that condition, with a regression test.
- **`cat-msg`: the body was wrapped in an extra `<div>`, suppressing Bulma's intended appearance.** Bulma styles `.message-header + .message-body` to drop the accent border and square the top corners so the body sits flush beneath the header. The wrapper broke that adjacency, so **every titled message** rendered with a stray left stripe and a rounded top meeting the header's square bottom. The body element now carries the `media` class, the transition class and the id directly, so Bulma's own defaults apply with no CSS of our own.

## Migration notes

**Public APIs are additive.** `cat-msg` and `cat-card` keep their existing props, slots and events — including `cat-msg`'s `close` still meaning "dismissed", not "collapsed". `cat-collapse` and `cat-card` each gain an optional `ariaLabel` prop.

**Markup changes, by component:**

- **`cat-msg` changed for every message, not just expandable ones**, because the body wrapper was removed. `.message-body` is now a direct child of `.message` and carries `media` / `cat-expandable-content` / the content id itself. Consumer CSS that reached the body through the wrapper, or that targeted the wrapper, needs checking.
- **`cat-card` changed only in the `expandable` path.** A plain card renders exactly as before with no added wrapper, which matters because non-expandable cards are by far the common case.
- When expandable, the header title of either component now sits inside a `<button>` (`.cat-card-trigger` / `.cat-msg-trigger`), so CSS selecting header internals as *direct* children of `.card-header` / `.message-header` needs checking. Descendant selectors, including the `:deep(.card-header-title)` form used in the apps, continue to match.
- On an expandable `cat-card` the built-in title renders as `<span class="card-header-title">` rather than `<p>`, because a button's content model is phrasing content and a paragraph inside one is invalid HTML. Bulma sets `display` on that class, so it renders identically. Plain cards keep the `<p>`. Content supplied through `#header` also lands inside the trigger when expandable, so it must be phrasing content too.

**Behavioural change:** content inside an expandable `cat-msg` now stays mounted while collapsed, rather than being created and destroyed on each toggle.
