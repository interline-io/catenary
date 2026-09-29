---
"@interline-io/catenary": minor
---

`cat-modal` gains `position` (`centered`, the default, or `top`) and `width` (a number of pixels or any CSS length). `position="top"` anchors the card near the top of the viewport, so a dialog whose content grows, such as a search palette, grows downward instead of moving. `width` covers sizes between the `size` steps by setting `--cat-modal-width` on the card; the same property set on any ancestor or `:root` sizes every modal beneath it. New `ModalPosition` and `ModalWidth` types are exported. A modal that passes neither prop is unchanged. Closes [#98](https://github.com/interline-io/catenary/issues/98).
