---
"@interline-io/catenary": minor
---

`cat-taginput` rebuilt on the ARIA 1.2 combobox pattern, fixing screen reader and keyboard access. Accessibility testing of a consumer app found the widget hard to operate: Tab abandoned the highlighted option without selecting it, and the deprecated ARIA 1.0 wrapper-combobox markup hid the popup state from screen readers.

Combobox semantics:

- `role="combobox"`, `aria-expanded`, `aria-haspopup`, `aria-controls`, and the new `aria-autocomplete="list"` now live on the input itself (ARIA 1.2 pattern); the wrapper div carries no role. Screen readers compute popup state from the focused element, so users now hear expanded/collapsed changes.
- Options are no longer focusable and have no per-option keyboard handlers: the input is the single focus point and `aria-activedescendant` conveys the highlight. Previously every option sat in the Tab order, and tabbing to one triggered the input blur that closed the dropdown underneath it.
- The `role="listbox"` moved onto the options container, so the header slot and empty message are no longer invalid listbox children.
- A stale highlight is reset when filtering shrinks the list below the highlighted index; `aria-activedescendant` no longer points at a removed option.
- The input now injects `FieldIdKey`, so a wrapping labeled `cat-field` actually names it; `aria-label` (new `ariaLabel` prop, falling back to the placeholder) applies only when no field label is present, instead of always overriding it.

Keyboard and focus:

- Tab selects the highlighted option, closes the listbox, and lets focus move on. Previously Tab silently discarded the highlight, which testers read as the widget being broken.
- Reaching `maxTags` no longer disables the input (disabling the focused element dropped keyboard focus to the page body and removed the only way to Backspace-remove a tag). The limit is enforced in selection instead, the option list empties, and the existing placeholder swap and live counter convey the state.
- Removing a tag via its remove button moves focus to the same-position remaining remove button (or the input) instead of dropping it to the page body.
- Escape is consumed while it has something to dismiss (open listbox, then typed text, which it now clears); only a spent Escape reaches an enclosing dialog.

Announcements: a visually hidden `role="status"` region reports `Added X` on selection and free-text commit, `Removed X` on any removal (Backspace removal was previously completely silent), and `No results` when filtering empties the list.
