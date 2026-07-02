---
"@interline-io/catenary": minor
---

`cat-search-bar` accessibility pass, and a first-class pattern for announcing filtered-table results.

- The search input now has an accessible name: a new `ariaLabel` prop defaulting to `"Search"` (previously it was labelled only by its placeholder, which is not an accessible name — WCAG 4.1.2 / 3.3.2). Set `:aria-label="undefined"` when a visible label already names the field.
- The clear button is now a properly labelled `<button>` (`clearAriaLabel`, default `"Clear search"`) instead of announcing as the generic "Action", and clearing returns focus to the input instead of dropping it to the page (WCAG 2.4.3). Internally the component now builds on `cat-input`'s `clearable`.
- New optional `#status` slot renders into a visually-hidden `role="status" aria-live="polite"` region, so consumers filtering a table/report can feed it a result count and screen-reader users hear how many rows matched (WCAG 4.1.3). `aria-controls` (and other attrs) are forwarded to the input, so the search can point at the region it updates.
- Escape now clears the field when it has a value (and stops there, cooperating with the layered dismiss stack so an enclosing modal/popup is not also dismissed); when the field is empty, Escape is left to bubble. Opt out with `clear-on-escape="false"`.
- A new `clear` event fires whenever the field is cleared — via the clear button, Escape, or the newly exposed `clear()` method (alongside `focus()`/`blur()`) for programmatic use.
