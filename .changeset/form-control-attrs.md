---
"@interline-io/catenary": patch
---

Fallthrough attributes, disabled tooltip triggers, and typed ARIA state props — the three fixes `cat-split-button` surfaced, applied where the same bugs already lived.

## `cat-input` / `cat-textarea` / `cat-select` route attributes to the native element

All three bound `v-bind="$attrs"` onto the native control without `inheritAttrs: false`, so Vue *also* applied every fallthrough attribute to the root `.control` wrapper. A consumer's `id` landed on both, and because the wrapper precedes the control in document order, a `<label for>` resolved to that non-labelable wrapper element and silently stopped labelling anything. Undeclared `aria-*` was duplicated onto a role-less wrapper the same way.

`class`, `style` and event listeners deliberately still reach the wrapper as well, because both destinations turned out to be load-bearing:

- Layout utilities (`mt-2`, `mr-2` — both in real consumer code) style the wrapper, while typography (`is-family-monospace`) only takes effect on the native element: Bulma's base stylesheet sets `font-family` directly on `input, select, textarea`, so it cannot be inherited from an ancestor.
- A listener on the wrapper sees events from the icons and the clear button, which are siblings of the native element rather than inside it; one on the native element is what non-bubbling `@focus` / `@blur` need. `cat-search-bar`'s Escape-to-clear depends on the former — routing listeners to the native element alone broke it, because the clear button is not inside the input.

Regression tests per component assert that `id`, `aria-*` and `data-*` reach the native element only, and that `class` still reaches both.

## `cat-tooltip` keeps disabled triggers keyboard-reachable

`detectFocusableSlot` matched `button, input, select, textarea` without excluding disabled ones, so wrapping a disabled control — the commonest reason to use a tooltip at all, explaining why an action is unavailable — made the tooltip keyboard-invisible: the wrapper skipped its own `tabindex` and hung `aria-describedby` on an element that is not in the tab order.

Uses `:disabled` rather than `[disabled]` so it also covers a control disabled by an ancestor `<fieldset disabled>`, which is what `cat-fieldset` renders. Same correction Copilot caught on `cat-dropdown`'s `focusableTrigger()`.

## `cat-button` gains typed ARIA state props

`ariaPressed`, `ariaExpanded`, `ariaHaspopup` and `ariaControls`, following the existing `ariaLabel` convention. Attribute fallthrough already worked at runtime, but failed consumer typechecks under `strictTemplates`, which steered callers to a raw `<button>` and away from the shared `:focus-visible` styling — `cat-datepicker`'s toggle is written that way for exactly this reason.

`false` renders rather than dropping the attribute: "not pressed" is what distinguishes an un-pressed toggle from a plain button. The prop docs record the convention that a toggle keeps a fixed label naming what it controls and lets `aria-pressed` carry the state, since a label naming the current state is ambiguous with one naming the action.

Addresses parts of #49, #50 and #51; each issue has further findings still open.
