---
"@interline-io/catenary": patch
---

A `cat-dropdown` menu or `cat-datepicker` calendar shown in the top layer no longer runs off the viewport. Its height is capped to the room on its side of the trigger, so a long menu scrolls. When neither side has room for the whole menu, it opens on the side with more room rather than always on the preferred side. Browsers without the Popover API keep the absolute positioning, which has no cap.
