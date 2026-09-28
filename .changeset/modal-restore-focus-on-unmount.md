---
"@interline-io/catenary": patch
---

`cat-modal` returns focus to its opener when it is unmounted while open. A modal rendered under the same `v-if` its `v-model` drives (`<cat-modal v-if="open" v-model="open">`) is removed in the same render that closes it, so it never saw `modelValue` go false and focus fell to `<body>`. Unmounting now runs the same close steps as closing: focus restore, the `is-clipped` class, the dismiss layer and the resize observer.
