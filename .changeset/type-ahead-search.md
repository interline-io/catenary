---
'@interline-io/catenary': minor
---

Type-ahead character search and Home / End jumps, per the [WAI-ARIA Listbox](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction) and [Menu](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/#keyboardinteraction) patterns.

- **`cat-dropdown`** — pressing a printable character inside the open menu or listbox jumps focus to the next item whose label starts with that character. Multiple characters typed in quick succession (within ~500 ms) extend the search; single-character presses cycle through items sharing that initial letter. Space is reserved for activating the focused item; arrow / Home / End / Escape / Tab keys reset the buffer.
- **`cat-taginput`** — Home and End now move the highlighted option to the first / last option when the listbox is open. Type-ahead itself doesn't apply here because the combobox's search input already filters options per the [Combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).

A new internal `createTypeAhead()` helper at `src/util/type-ahead.ts` implements the buffering and matching logic and is fully unit-tested.
