---
"@interline-io/catenary": minor
---

`cat-dropdown` and `cat-datepicker` render their popups (menu, calendar) in the browser top layer via the Popover API, so they are no longer clipped by an ancestor with `overflow: auto/hidden`. The most visible case: a dropdown or datepicker inside a scrollable `cat-modal` body had its menu/calendar cut off at the modal's edge. This brings the two widgets in line with `cat-tooltip` (top-layer since 0.3.0).

- New `src/util/anchored-popover.ts` composable: shows the popup with `showPopover()` (`popover="manual"`, so it does not light-dismiss outside the components' own handling), positions it with fixed viewport coordinates computed from the trigger's box, flips the vertical side when the preferred side lacks room, clamps to the viewport, and repositions on scroll (capture phase, so scrolling any ancestor works) and resize. The popup stays in place in the DOM, so scoped styles, `aria-controls`/`aria-activedescendant`, focus management, and click-outside containment (`root.contains()`) are unchanged.
- Browsers without the Popover API (and jsdom) fall back to the existing absolute positioning; no behavior change there.
- The positioning math is a pure exported function (`computePopoverPosition`) with unit tests.
