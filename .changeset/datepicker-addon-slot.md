---
"@interline-io/catenary": minor
---

`cat-datepicker` gains an `#addon` slot that appends extra controls to the input's Bulma addon group, after the calendar toggle button. Use it to attach actions like a clear button so they render as part of the field instead of floating beside it: `<template #addon><cat-button icon="close" aria-label="Clear date" /></template>`. Slot content should be addon-shaped (a `.control` wrapping a `.button`); `cat-button` renders exactly that.
