---
"@interline-io/catenary": minor
---

`cat-tooltip` conforms to WCAG 1.4.13, gains an affordance and motion control, and stops sticking after a click. Closes #50 and #79.

## Content on Hover or Focus (WCAG 1.4.13)

The success criterion asks for three things and the bubble now does all three.

**Hoverable.** The bubble carried `pointer-events: none`, so it was never a pointer target: any move toward it fired `mouseleave` on the wrapper and dismissed it. Anyone using magnification, or wanting to select a long tooltip's text, could not reach the content. It is now `pointer-events: auto` while visible, with a short close delay bridging the gap between trigger and bubble so crossing it does not dismiss — position-agnostic, unlike a transparent CSS bridge which would need geometry per side.

Making it hoverable moved the dismissal boundary, so the bubble also handles its own `mouseleave`. Without that the wrapper's `mouseleave` had already fired when the pointer crossed onto the bubble, and nothing was left to dismiss it once the pointer left again — a tooltip stuck open would have been worse than the bug being fixed.

**Dismissible without moving the pointer.** Escape was bound on the wrapper, so it only fired with focus inside; a tooltip opened by hover while focus sat elsewhere could only be dismissed by moving the pointer, which the criterion explicitly disallows. Escape now goes through the shared LIFO dismiss stack, which also means the keypress is consumed — a tooltip open inside a `cat-modal` takes the first press and the dialog stays open, instead of both closing at once.

## No longer sticks after a click

When the slot has no focusable child the wrapper takes a `tabindex` of its own, so clicking it focused it and the bubble stayed up after the pointer had left. Focus now shows the tooltip only when the focus did not come from a pointer press, tracked from `pointerdown` rather than `:focus-visible` — the same distinction, but `:focus-visible` is a rendering hint that jsdom reports false for synthetic focus, which would make the behaviour untestable and environment-dependent. Keyboard focus still holds the bubble open when the pointer wanders away.

This is the dominant usage pattern in the consumer apps: 91 of their 129 `cat-tooltip` call sites wrap a non-focusable icon or span.

## New props

- **`affordance`** — `cursor: help` and a dotted underline on the trigger. Opt-in, since it changes how slot content looks at every existing call site. Without it nothing on screen tells a pointer user a tooltip exists; two playground demos had already hand-rolled exactly these declarations inline.
- **`animated`** (default `true`) — turn the fade off. Suppressed automatically under `prefers-reduced-motion: reduce` regardless of the prop, matching `cat-collapse`, `cat-steps` and `cat-msg`, which had the block `cat-tooltip` lacked.

## Playground

The tooltip page had **20 icon-only triggers with no accessible name at all** — a critical axe `button-name` violation on the page that documents the component, teaching the opposite of what `cat-button`'s own docs say. `aria-describedby` supplies a description, not a name. Each now uses `cat-button`'s `icon` prop with an `aria-label`, which is both the documented pattern and the correct icon sizing. With the two hand-rolled affordances replaced by the prop (removing a `has-text-info` span that failed contrast), the page goes from 21 axe violations to zero in both themes.
