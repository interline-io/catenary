---
"@interline-io/catenary": patch
---

`cat-modal` returns focus to its opener when it is unmounted while open, as with `<cat-modal v-if="open" v-model="open">`, where focus used to fall to `<body>`. Several open modals also no longer undo each other: only the topmost one restores focus and traps Tab, and `is-clipped` is removed only when the last one closes, so unmounting a closed modal no longer unlocks scrolling under an open one.
