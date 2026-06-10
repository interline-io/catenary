---
"@interline-io/catenary": patch
---

`cat-tabs` / `cat-tab-item` accessibility fixes.

- Roving tabindex now falls back to the first tab when `modelValue` matches no registered tab (stale value, or the active tab-item removed via `v-if`), so the tablist never drops out of the page tab order.
- `orientation="vertical"` now changes the visual layout too: the tablist stacks in a column and the active-tab rule moves to the right edge, matching the existing `aria-orientation` and ArrowUp/ArrowDown key handling. Toggle and toggle-rounded types get vertical border-radius adjustments.
- New `ariaLabelledby` prop on `cat-tabs` binds `aria-labelledby` on the `role="tablist"` element, so a visible heading can name the tab list. Previously only `ariaLabel` was supported and a passed-through `aria-labelledby` attribute landed on the wrapper div instead of the tablist.
- `cat-tab-item` focusable-child detection now ignores disabled buttons, inputs, selects, and textareas (and hidden inputs); a panel whose only interactive content is disabled keeps `tabindex="0"` so keyboard users can still reach it.
- Playground tabs demos now label every tablist via `aria-label` or `aria-labelledby`, and include a vertical orientation example.
