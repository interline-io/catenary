---
'@interline-io/catenary': minor
---

Rebuild interactive widgets around their WAI-ARIA Authoring Practices patterns for keyboard operability and correct assistive-technology announcements.

- **`cat-tooltip`** — rebuilt around the [WAI-ARIA tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/). Trigger gets `aria-describedby` pointing at a `<span role="tooltip">`; shows on `mouseenter`/`focusin`, hides on `mouseleave`/`focusout`/`Escape` (but stays open while focus or pointer stays inside the wrapper). When the slot contains a focusable element, `aria-describedby` is applied to that element; otherwise the wrapper gets `tabindex="0"` and carries `aria-describedby` itself.
- **`cat-tabs` / `cat-tab-item`** — rebuilt around the [WAI-ARIA tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/). `<div role="tablist">` wraps `<button role="tab">` entries with paired `aria-controls`/`aria-labelledby` ids; panels are `<div role="tabpanel">` and receive `tabindex="0"` only when they have no focusable children. Keyboard handler reads the focused tab's `data-index` (not just `modelValue`) so navigation works correctly when focus and selection diverge. Keyboard: ArrowLeft/Right (or Up/Down when `orientation="vertical"`), Home, End; roving tabindex; activation follows focus. New `ariaLabel` and `orientation` props. `cat-tab-item` deregisters on unmount so `v-if`-toggled tabs don't leave stale entries.
- **`cat-dropdown` / `cat-dropdown-item`** — trigger gains `aria-expanded` + `aria-haspopup` (`"menu"` or `"listbox"` based on a new `selectable` prop), and the listbox gets `aria-multiselectable="true"` when `multiple` is set. Click-to-toggle stays on the trigger wrapper, so existing `#trigger` slot usages (datepicker input, custom anchors) continue to open on click. Keyboard: Enter/Space toggle; ArrowDown/Up on trigger opens and focuses first/last item; ArrowUp/Down inside the menu navigates with wraparound; Home/End jump to ends; Escape closes and returns focus to the trigger; Tab from open menu closes it. Items render as `<button role="menuitem">` (or `role="option"` in selectable mode) with roving tabindex.
- **`cat-datepicker`** — calendar gets `role="dialog"`, `aria-modal="false"`, and a configurable `ariaDialogLabel` prop (default "Choose date"). Escape returns focus to the input.
- **`cat-button`** — adds a `:focus-visible` outline override meeting WCAG SC 1.4.11 (3:1 contrast) on Bulma's color variants. Mouse clicks don't trigger the outline.
- **`cat-table`** — new `caption`, `captionHidden`, and `ariaLabel` props. Sortable headers gain `aria-sort=ascending/descending/none` and now render the column label inside a real `<button>` so keyboard users can change sort via Enter/Space.

### CSS impact (no Vue template changes needed)

Existing `<cat-*>` templates keep working — no consumer template needs to be edited. However, the rebuilt internal markup will break CSS selectors that targeted the old DOM. Grep your consumer for these patterns:

- **`cat-tabs`**: was Bulma's `<ul><li><a class="is-active">` structure; now `<div role="tablist"><button role="tab" class="cat-tab is-active">`. Selectors like `.tabs ul`, `.tabs li`, `.tabs a`, `.tabs a.is-active` will silently stop matching. Style `.cat-tab` / `.cat-tab.is-active` instead.
- **`cat-dropdown-item`**: was `<a class="dropdown-item">`; now `<button class="dropdown-item">`. Selectors like `a.dropdown-item` or `.dropdown-content a` won't match — drop the tag qualifier or switch to `button.dropdown-item`.
- **`cat-table`**: sortable column labels now render inside a `<button class="cat-table-sort">` nested in the `<th>`. Selectors targeting text or hover state directly on `th.is-sortable` may need to move to `.cat-table-sort` (e.g., `th.is-sortable:hover` no longer paints the text since the button fills the cell).
- **`cat-dropdown`**: the menu container's default `ariaRole` changed from `'list'` to `'menu'` (or `'listbox'` when `selectable`). Tests or queries that read `role="list"` need updating.

If your consumer styles or queries don't match any of the above, this change is non-breaking for you.
