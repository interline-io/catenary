---
"@interline-io/catenary": patch
---

`cat-datepicker` — close the calendar on date selection. The open state lives in the wrapping `cat-dropdown` (its own `isActive`), but the datepicker was driving it through the dropdown's selection `model-value`, which does not control visibility — so `closeOnSelect` never actually dismissed the calendar (it only closed via outside-click / Escape). `close()` now delegates to the dropdown's exposed `close()`, fixing close-on-select for both single pickers and any consumer relying on `closeOnSelect`.
