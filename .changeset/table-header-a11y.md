---
"@interline-io/catenary": patch
---

`cat-table` header accessibility. Custom headers via the `#header` slot replaced the default `<th>` markup but could not reproduce its `aria-sort` exposure: the slot only passed `columns` and `sort`, so consumers silently lost sort-state announcements to assistive technology.

- The `#header` slot now also exposes `sortField`, `sortDirection`, and an `ariaSort(column)` helper; custom headers should render `<th scope="col" :aria-sort="ariaSort(column)">` for each sortable column.
- The default header cells now carry an explicit `scope="col"`, removing ambiguity for older assistive technology heuristics and keeping associations correct if body rows contain their own `<th scope="row">` cells.
- New tests cover `scope="col"` on default headers, sort-state slot props in a custom header (including an axe check), and the `aria-hidden` sort icon.
- Sort changes are announced through a visually hidden `role="status"` region ("Sorted by Name, ascending"): JAWS reads the `aria-sort` flip on the header, but NVDA and TalkBack stay silent without a live region. Unsorted columns now omit `aria-sort` entirely instead of emitting `aria-sort="none"`, per current field guidance.
