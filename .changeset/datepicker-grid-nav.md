---
'@interline-io/catenary': minor
---

**`cat-datepicker`** — implement keyboard grid navigation per the [WAI-ARIA Date Picker Dialog example](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/), addressing a limitation flagged in the playground accessibility section. Day buttons use roving `tabindex` (only one day is in the page tab order at a time) and the grid container exposes the new keyboard interactions:

- **ArrowLeft / ArrowRight** — move focus to the previous / next day
- **ArrowUp / ArrowDown** — move focus to the same day in the previous / next week
- **Home / End** — move focus to the first / last day of the current week
- **PageUp / PageDown** — move focus to the same day in the previous / next month
- **Shift + PageUp / Shift + PageDown** — move focus to the same day in the previous / next year
- **Enter / Space** — select the focused day

When focus crosses a month/year boundary the visible calendar follows along. The grid container gains `role="grid"` with `tabindex="-1"` (so the container itself isn't a tab stop but is programmatically focusable), and day buttons gain `role="gridcell"` and `aria-selected` so assistive tech announces the structure correctly.

Month and year shifts (PageUp/Down and Shift+PageUp/Down) clamp the day-of-month when the target is shorter — e.g., Jan 31 → PageDown → Feb 28, Feb 29 (leap year) → Shift+PageDown → Feb 28 next year. The roving tab stop is also clamped onto a selectable day so calendars with `minDate` / `maxDate` / `unselectableDates` always have a focusable entry point.
