---
"@interline-io/catenary": minor
---

New `cat-steps` / `cat-step-item` stepper ("wizard") components.

Adds the last widget in [gotransit-editor#397](https://github.com/interline-io/gotransit-editor/issues/397) with no catenary counterpart: `o-steps` / `o-step-item`, the 8 remaining Oruga tags in that audit. The API is close enough to Oruga's for the two wizard flows there to port over, but the accessibility model is not Oruga's — see below.

## `cat-steps`

A sequence of stages with one panel visible at a time and a progress list showing what is done, current and still ahead.

- `v-model` selects the active step, matched against each item's `value`. Left unbound, the stepper keeps the value itself, so `has-navigation` works with no state of its own.
- Steps behind the active one are clickable and those ahead are not, so users can go back but not skip. `clickable` on the parent forces all (`true`) or none (`false`, a read-only progress display with no buttons at all); `clickable` on an item overrides its own step.
- `has-navigation` renders Previous/Next buttons below the content, or the `#navigation` slot renders your own from the same state (`previous`, `next`, `goTo`, `hasPrevious`, `hasNext`, `activeIndex`, `count`), typed via `defineSlots`. Without either, navigation is the consumer's — drive `v-model` from buttons in the step content, which is what a wizard whose steps gate on server work needs.
- `orientation="vertical"` puts the list beside the panel; `label-position="right"` puts each label next to its marker.
- `variant` and `size` over the core sets, `completed-icon` (default `check`, `null` keeps numbers), `animated` opt-in panel transition suppressed under `prefers-reduced-motion`.
- Emits `change` with the new and previous values; exposes `previous()`, `next()`, `goTo(value)`.

`cat-step-item` takes `value`, `label`, and optionally `step` (marker text), `icon`, `variant` and `clickable`. Per-item `variant` plus `icon` is how a step that failed gets marked without recolouring the rest.

## Accessibility

There is no WAI-ARIA Authoring Practices pattern for a stepper. This renders the progress as an `<ol>` with `aria-current="step"` on the active item — the shape used by the GOV.UK, USWDS, Preline and Flowbite step indicators — rather than as a tablist, which is what Oruga and Buefy both use.

That choice is the substantive difference from Oruga. Tabs are interchangeable views of one thing, reachable in any order, and the pattern's arrow-key model assumes exactly that; steps are a sequence where the order matters, most steps cannot be reached yet, and moving between them is the task rather than a way to look at something else.

- **Every step's state is announced.** `aria-current="step"` marks the current one, and the others carry visually hidden "Completed" / "Not completed" text — a filled circle and a check glyph say nothing to a screen reader. Both strings are props (`ariaCompletedLabel`, `ariaUpcomingLabel`) for translation.
- **Markers that cannot be reached yet are `aria-disabled`, not `disabled`.** They stay focusable, so a keyboard user can read ahead instead of tabbing past a gap, and the element type never changes as the user advances — swapping a focused `<button>` for a `<span>` would drop focus to the body mid-wizard. The current step is exempt: activating it is a no-op like the others, but "unavailable" is the wrong word for where the user already is, and `aria-current` says it better.
- **Focus follows the user into the new panel, but only when the change came from inside the component.** Each panel is a group named by its step's label, so landing there announces which step it is. A change driven from outside — the app advancing after an upload finishes — leaves focus where it is rather than yanking it out of whatever the user was doing.
- **Inactive panels are hidden with `display: none`**, which takes them out of the accessibility tree and the tab order together. Their fields stay mounted, so stepping back preserves what was typed.
- The progress list takes `ariaLabel` (default `"Progress"`) or `ariaLabelledby`.

## Server rendering

The active step's panel renders visible on the server, so its content ships in the HTML rather than behind `display: none`. That needs a bound `v-model`: an unbound stepper has no way to know which step comes first until its items register.

The progress list itself is client-only. Step items register in `onMounted`, which never runs during `renderToString`, so the markers appear on hydration — the same limitation `cat-tabs` has. Fixing it means reading the slot's VNodes rather than waiting for registration, which is tracked separately for both components.
