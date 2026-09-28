---
"@interline-io/catenary": patch
---

`cat-modal` returns focus to its opener when it is unmounted while open. A modal rendered under the same `v-if` its `v-model` drives (`<cat-modal v-if="open" v-model="open">`) is removed in the same render that closes it, so it never saw `modelValue` go false and focus fell to `<body>`. Unmounting now runs the same close steps as closing: focus restore, the `is-clipped` class, the dismiss layer and the resize observer.

Several open modals no longer undo each other. Only the topmost open modal restores focus when it closes, so closing or unmounting a modal beneath another leaves focus in the one on top. `is-clipped` is removed only when the last open modal closes, and unmounting a modal that was never open does nothing. Previously, unmounting any closed `cat-modal` removed the scroll lock of another modal that was still open. Tab is trapped only by the topmost open modal; before, a modal beneath pulled Tab focus out of a stacked modal and into its own card.
