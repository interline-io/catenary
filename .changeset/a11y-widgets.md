---
'@interline-io/catenary': minor
---

Rebuild interactive widgets around their WAI-ARIA Authoring Practices patterns for keyboard operability and correct assistive-technology announcements.

- **`cat-tooltip`** — rebuilt around the [WAI-ARIA tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/). Trigger gets `aria-describedby` pointing at a real `<div role="tooltip">`; shows on `mouseenter`/`focusin`, hides on `mouseleave`/`focusout`/`Escape`. Wrapper gets `tabindex="0"` only when the slot has no focusable child.
- **`cat-tabs` / `cat-tab-item`** — rebuilt around the [WAI-ARIA tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/). `<div role="tablist">` wraps `<button role="tab">` entries with paired `aria-controls`/`aria-labelledby` ids; panels are `<div role="tabpanel" tabindex="0">`. Keyboard: ArrowLeft/Right (or Up/Down when `orientation="vertical"`), Home, End; roving tabindex; activation follows focus. New `ariaLabel` and `orientation` props. `cat-tab-item` deregisters on unmount so `v-if`-toggled tabs don't leave stale entries.
- **`cat-dropdown` / `cat-dropdown-item`** — trigger gains `aria-expanded` + `aria-haspopup` (`"menu"` or `"listbox"` based on a new `selectable` prop). Keyboard: Enter/Space toggle; ArrowDown/Up on trigger opens and focuses first/last item; ArrowUp/Down inside the menu navigates with wraparound; Home/End jump to ends; Escape closes and returns focus to the trigger; Tab from open menu closes it. Items render as `<button role="menuitem">` (or `role="option"` in selectable mode) with roving tabindex.
- **`cat-datepicker`** — calendar gets `role="dialog"`, `aria-modal="false"`, and a configurable `ariaDialogLabel` prop (default "Choose date"). Escape returns focus to the input.
- **`cat-button`** — adds a `:focus-visible` outline override meeting WCAG SC 1.4.11 (3:1 contrast) on Bulma's color variants. Mouse clicks don't trigger the outline.
- **`cat-table`** — new `caption`, `captionHidden`, and `ariaLabel` props. Sortable headers gain `aria-sort=ascending/descending/none`.

Consumers with CSS targeting the old DOM structure of these widgets (e.g., selectors expecting `<div>` instead of `<button>` for tabs or dropdown items) may need to update their selectors.
