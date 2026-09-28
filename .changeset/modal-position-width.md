---
"@interline-io/catenary": minor
---

`cat-modal` gains `position` (`center`, the default, or `top`) and `width` (any CSS length). `position="top"` anchors the card near the top of the viewport, so a dialog whose content grows, such as a search palette, grows downward instead of moving. `width` covers sizes between the `size` steps, through a `--cat-modal-width` custom property that the size classes now set too. A modal that passes neither is unchanged. Closes [#98](https://github.com/interline-io/catenary/issues/98).
