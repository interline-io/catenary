---
"@interline-io/catenary": minor
---

Modal: edge-to-edge below Bulma's mobile breakpoint, and `fullBleed` and `fillBody` props.

Below 769px a `full-screen` modal now goes edge to edge with square corners and halved padding — at that width the inset stops reading as a frame and starts eating the content. `fullBleed` applies the same treatment at every width, for a dialog that should never read as a card.

`fillBody` hands the body's height down to the slot, for content that scrolls within the dialog rather than scrolling the dialog: a table that keeps its header in view, say. Off by default, since it makes every direct child of the slot a flex item. Content that opts in carries its own scroll-region `tabindex` and label, because the body no longer overflows.
