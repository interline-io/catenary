---
"@interline-io/catenary": patch
---

`cat-tooltip` no longer opens on a tap. A tap has no hover to end, so a tooltip opened by one stayed up until the next tap somewhere else. The trigger and the bubble now show and hide on `pointerenter` and `pointerleave` from a mouse or pen and ignore touch, while keyboard focus shows the tooltip as before.
