---
"@interline-io/catenary": minor
---

`cat-datepicker` rebuilt as a standalone WAI-ARIA date picker dialog, fixing screen reader access. Accessibility testing found the picker effectively unusable with a screen reader: the calendar rendered inside the wrapping `cat-dropdown`'s `role="menu"` container (invalid ARIA composition that breaks screen reader navigation modes), the input exposed no popup semantics, the month/year selects had no accessible names and duplicated the wrapping `cat-field`'s input id, and manual typing was unsupported. The component no longer wraps `cat-dropdown`; it follows the APG date picker dialog pattern directly.

New trigger structure and typed entry:

- The input is typeable and pairs with an attached calendar toggle button (Bulma `has-addons`) carrying `aria-haspopup="dialog"`, `aria-expanded`, and `aria-controls`. The toggle button's accessible name includes the current selection (`Choose date, 2026-06-15`), configurable via the new `ariaToggleLabel` prop.
- Typed dates commit on Enter or when focus leaves the input; text that does not parse reverts to the current selection. A visually-hidden `role="status"` region announces commits (`Date set to ...`) and reverts (`Invalid date, reverted to ...`), configurable via the new `ariaDateSetLabel` and `ariaDateInvalidLabel` props. A visually-hidden format hint (`Date format: YYYY-MM-DD`) is bound to the input via `aria-describedby`, and the placeholder defaults to the format.
- Typed dates are deliberately not restricted by `minDate`/`maxDate`/`unselectableDates`; they are emitted as-is so consumers can show their own validation messaging. The constraints still restrict calendar selection.
- The `dateFormat` prop is now honored for display and typed parsing (it was previously ignored; display was always `yyyy-MM-dd`). The `date-string` model remains `yyyy-MM-dd` regardless of `dateFormat`.
- In `multiple` mode, the input accepts a comma-separated list and commits only if every part parses.
- New `ariaLabel` prop names the input when the datepicker is not paired with a visible `cat-field` label.

Calendar dialog fixes:

- The popup container no longer carries `role="menu"`; the `role="dialog"` calendar is the outermost popup semantic.
- The month/year selects get unique ids (previously they inherited the wrapping `cat-field`'s id, duplicating the input's id) and the `ariaSelectMonthLabel`/`ariaSelectYearLabel` props are now actually bound (they previously existed but were unused).
- The day grid gains a `role="columnheader"` row (weekday headers now rotate with `firstDayOfWeek`; previously they stayed Sunday-first and misaligned), real row elements instead of `display: contents` (which strips semantics in some browsers), a full-date `aria-label` on every day button (`June 15, 2026`), and `aria-current="date"` on today. Each `role="gridcell"` is a wrapper around a plain button (VoiceOver reads a gridcell's content separately from its name, so role-on-the-button double-announced the day), with `aria-selected` on the cell. A polite live region announces month/year changes from the prev/next buttons and PageUp/PageDown. New `dayNamesLong` prop supplies the announced header names.
- Focus management per the APG dialog pattern: opening moves focus to the selected day (or nearest selectable day), Escape and date selection return focus to the toggle button, tabbing out of the dialog closes it, and outside clicks close without stealing focus. The year select includes the focused year even when a typed selection falls outside `yearsRange`.

Removed (both were documented but nonfunctional): the `openOnFocus` prop (never implemented; the input no longer toggles the calendar on click or focus, only the button opens it) and the `focus`/`blur` emits (never fired). The default left input icon also changes from `calendar` to none, since the toggle button now carries the calendar icon (pass `icon="calendar"` to restore it); the toggle icon is configurable via the new `iconToggle` prop.

`cat-dropdown` is unchanged in behavior; its outside-click and document-Escape handling moved to a shared internal `useDismissablePopup` composable that the datepicker also uses.

### CSS impact

Existing `<cat-datepicker>` templates keep working, but the rendered trigger markup changed. Grep your consumer for these patterns:

- The input now sits inside `.cat-datepicker-field` (a `field has-addons` div) within `.dropdown-trigger`, next to a new `.cat-datepicker-toggle` button. Selectors assuming the input was the only child of `.dropdown-trigger` need updating, and layouts sized to the bare input now include the attached button.
- The `.dropdown` root carries `.cat-datepicker-dropdown` but no longer `.cat-dropdown`; selectors like `.cat-dropdown.cat-datepicker-dropdown` won't match.
- The weekday header row (`.cat-datepicker-weekdays`) moved inside `.cat-datepicker-days`, week rows (`.cat-datepicker-row`) are now `display: grid` instead of `display: contents`, and each day button sits inside a `.cat-datepicker-cell` wrapper div.
