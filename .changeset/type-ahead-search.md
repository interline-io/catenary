---
'@interline-io/catenary': minor
---

Type-ahead character search and Home/End jumps for menu / listbox keyboard navigation, per the [WAI-ARIA Listbox](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction) and [Menu](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/#keyboardinteraction) patterns.

- **`cat-dropdown`** — pressing a printable character inside the open menu jumps focus to the next item whose label starts with that character. Multiple characters typed in quick succession (within ~500 ms) extend the search (e.g., "ap" → next item starting with "ap"). Single-character presses cycle through items sharing that initial letter on each subsequent press. Existing arrow / Home / End / Escape / Tab handling is unchanged; the type-ahead buffer resets on any of those navigation keys.
- **`cat-taginput`** — adds Home / End handling: when the listbox is open with options, Home moves the highlighted index to the first option and End moves it to the last. (Type-ahead itself doesn't apply here — the combobox's search input already filters options as you type.)

A new shared `createTypeAhead()` helper at `src/util/type-ahead.ts` implements the buffering and matching logic and is fully unit-tested. It's an internal utility, not part of the public package exports.
