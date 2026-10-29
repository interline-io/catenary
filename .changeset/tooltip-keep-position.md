---
"@interline-io/catenary": patch
---

`cat-tooltip` keeps the side its `position` names. Near a window edge along that side, the bubble now slides to stay in the window, with its arrow still pointing at the trigger. It used to move to another side, often over the trigger's neighbor. It moves to the opposite side only when it doesn't fit and that side has more room, and it may come within 4px of the window's edge, where it used to keep 20px away. Its placement now goes through the function that places `cat-dropdown` and `cat-datepicker` popups, which also takes centered and side placements. A bubble that moved to the opposite side also stays there while it fades out; it used to jump back to its own side, pointing its arrow away from the trigger.
