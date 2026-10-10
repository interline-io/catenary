---
"@interline-io/catenary": patch
---

`cat-safelink` fits its container. In a narrow container, such as a fixed-layout table's cell, the address shrinks with an ellipsis instead of overflowing, and the copy and open buttons keep their width. A table with automatic layout still widens its column to fit the whole safelink.

The safelink is also relatively positioned now, so its screen-reader status region stays inside a scrolling ancestor. Before, the region escaped a scroll container that was not itself positioned, and on phones it widened the page.
