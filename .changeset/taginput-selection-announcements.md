---
"@interline-io/catenary": patch
---

`cat-taginput` announcement and description improvements, following accessibility review of the multi-select combobox pattern. The input clears after each selection so users can keep adding items, which leaves screen reader users unsure what is currently held; and nothing explained the interaction model.

- Add/remove announcements now restate the resulting selection: `Added Banana. Selected: Apple, Banana.` and `Removed Apple. None selected.`
- The input is described by a visually hidden usage hint via `aria-describedby` (new `ariaUsageHint` prop with a default covering type-to-search, arrow browsing, and Enter/Tab selection), merged with the existing max-tags counter and a wrapping `cat-field`'s help message id (`FieldDescribedbyKey`, matching input/textarea/select/slider).
