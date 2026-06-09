---
"@interline-io/catenary": minor
---

`cat-dropdown` — add `v-model:open` for controlling and observing the menu's open state. Exposed as a named model via `defineModel('open')`, so the existing default `v-model` (selection) and the `open`/`close` events and `open()`/`close()`/`toggle()` methods are unchanged; with no binding the dropdown stays uncontrolled exactly as before. This gives consumers a declarative way to drive open state (e.g. `cat-datepicker` now closes the calendar through `v-model:open` instead of reaching for the open state via the selection model).
