---
"@interline-io/catenary": minor
---

New `cat-collapse` disclosure component, and `cat-msg` / `cat-card` rebuilt on the same shared implementation.

The library had two hand-rolled disclosures — the `expandable` modes of `cat-msg` and `cat-card` — which had drifted apart and shared the same accessibility flaws. Rather than adding a third, the state and ARIA wiring now live in one place (`util/disclosure.ts`) and all three render it.

**New: `cat-collapse`.** A standalone disclosure following the [WAI-ARIA disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/):

- `label` and `icon` for the default trigger, or a `#trigger` slot receiving the current `open` state.
- `v-model:open`, plus `open`/`close` events so several collapses can be driven by one parent value as an accordion.
- `#actions` slot for controls that belong next to the trigger — rendered as a sibling, never nested inside the button.
- `heading-level` (2–6) wraps the trigger in a real heading, so a set of collapses is navigable by heading. The button goes inside the heading, never the reverse: most screen readers do not announce a heading nested inside an interactive element, and `role="button"` on a heading removes it from the headings list.
- `animated` opt-in transition, suppressed under `prefers-reduced-motion`.
- `disabled`, and an exposed `open()` / `close()` / `toggle()` / `focus()` API.

**Accessibility fixes to `cat-msg` and `cat-card`.** Both previously put `role="button"` and `tabindex="0"` on a `<div>` header with hand-written Enter/Space handlers. Both now use a native `<button>`, which brings role, focus, keyboard handling and forced-colors rendering from the platform:

- **`cat-msg`: the close button is no longer nested inside the trigger.** With `expandable` and `closable` together, the `delete` button sat inside an element with `role="button"` — invalid nested interactive content, which is why the keydown handlers needed `.self` modifiers to stop the header swallowing Space meant for the close button. The trigger and the close button are now siblings, and those modifiers are gone.
- **`cat-card`: the chevron is no longer a nested `<button>`.** It was a real button inside `role="button"`, working only because of `@click.stop`. It is now a `<span>` inside the single trigger button. Interactive header content belongs in `#actions`, which renders outside the trigger.
- Both now set `aria-controls` on the trigger, pointing at the content element, and both dropped their `eslint-disable` for `vuejs-accessibility/no-static-element-interactions`.
- **`cat-msg`: the body is now hidden with `v-show` rather than removed with `v-if`.** The trigger's `aria-controls` is an IDREF, so removing the body while collapsed left it pointing at nothing. `display: none` keeps the reference valid and still takes the subtree out of the accessibility tree and the tab order. Content inside an expandable message now stays mounted while collapsed.
- **`cat-collapse` and `cat-card` guarantee the trigger has an accessible name.** With no `label` and no `#trigger` / `#header` slot the button held only an aria-hidden chevron, leaving it unnamed (WCAG 4.1.2). Both fall back to a generic name in that case, overridable with a new `ariaLabel` prop. Supplying visible text is still preferable, since the name then describes the content.
- **`cat-card`: fixed an expandable card with no header rendering permanently invisible content.** The header only rendered when it had a `label`, `#header` or `#actions`, but the toggle lives in the header — so `<cat-card expandable>` with none of those produced no trigger at all while still hiding its content behind the open state, with no way to reveal it. `expandable` is now part of that condition. Pre-existing; found while reviewing this change, and covered by a regression test.

Public APIs are unchanged: `cat-msg` and `cat-card` keep the same props, slots and events, including `cat-msg`'s `close` event still meaning "dismissed" rather than "collapsed".

Markup changes are confined to the `expandable` path. A non-expandable `cat-card` or `cat-msg` renders exactly as before, with no added wrapper — which matters because plain cards are by far the common case. When expandable, the header title is now inside a `<button>` (`.cat-card-trigger` / `.cat-msg-trigger`), so consumer CSS that selects header internals as *direct* children of `.card-header` or `.message-header` needs checking. Descendant selectors, including the `:deep(.card-header-title)` form used in the apps, continue to match.
