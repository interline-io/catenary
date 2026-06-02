---
'@interline-io/catenary': minor
---

**`cat-datepicker`** — keyboard grid navigation per the [WAI-ARIA Date Picker Dialog example](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/). Day buttons use roving `tabindex` so only one day is in the page tab order at a time.

New keyboard interactions inside the day grid:

- **ArrowLeft / ArrowRight** — previous / next day
- **ArrowUp / ArrowDown** — same day in the previous / next week
- **Home / End** — first / last day of the current week
- **PageUp / PageDown** — same day in the previous / next month (day-of-month clamps when the target is shorter, e.g., Jan 31 → Feb 28)
- **Shift + PageUp / Shift + PageDown** — same day in the previous / next year (with the same clamping)
- **Enter / Space** — select the focused day

When focus crosses a month/year boundary the visible calendar follows along. The roving tab stop is clamped onto a selectable day, and arrow keys skip past disabled days in the direction of travel — so calendars with `minDate` / `maxDate` / `unselectableDates` / `unselectableDaysOfWeek` always have a focusable entry point.

The grid container gains `role="grid"` and an `aria-label` naming the visible month/year so screen readers announce the cursor's context. Days are grouped into week rows under `role="row"` per the WAI-ARIA grid structure (using `display: contents` so the visual layout is unchanged). Day buttons gain `role="gridcell"` and `aria-selected`.
