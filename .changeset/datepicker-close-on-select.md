---
"@interline-io/catenary": patch
---

`cat-datepicker` — close the calendar on date selection, and reopen on the selected date's month. The open state was driven through the wrapping `cat-dropdown`'s selection `model-value`, which does not control visibility — so `closeOnSelect` never actually dismissed the calendar (it only closed via outside-click / Escape). The datepicker now binds the dropdown's open state with `v-model:open`, fixing close-on-select for any consumer relying on `closeOnSelect`, and re-seeds the visible month from the current selection each time the calendar opens (so paging away and closing without selecting no longer leaves it on a stale month).
