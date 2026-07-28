---
"@interline-io/catenary": patch
---

Fix the black box drawn around open `cat-dropdown` menus and `cat-datepicker` calendars.

Since 0.7.0 moved both popups into the browser top layer, they inherit the user-agent stylesheet's `[popover]` rule. Their existing reset covered `position`, `margin` and `inset` but nothing else, and Bulma overrides none of the rest on `.dropdown-menu`:

- `border: solid` — a medium `currentColor` border, i.e. a black box around the whole popup. This is the visible symptom.
- `padding: 0.25em` — Bulma sets only `padding-top` (the trigger-to-content offset), so the other three sides survived.
- `background-color: Canvas` — `.dropdown-menu` has no background of its own in Bulma; `.dropdown-content` inside it does. The opaque backdrop showed through the `padding-top` gap and behind the content's rounded corners.
- `color: CanvasText` — **the one that actually hurt**. Nothing in Bulma sets a `color-scheme`, so system colors resolve light and `CanvasText` is black whatever the theme. `.dropdown-item` is `color: inherit`, so in dark mode every menu item and icon rendered black on Bulma's dark `.dropdown-content`. Measured with the page at `rgb(171, 177, 191)`, the menu resolved to `rgb(0, 0, 0)`.

All three are now reset, matching what `cat-tooltip` already did for its own bubble. `overflow: auto` is deliberately left in place so a long menu can still scroll.
