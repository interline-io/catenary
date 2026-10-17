---
"@interline-io/catenary": patch
---

`cat-dropdown-item` no longer shows an item without a `value` as selected. In a menu without a model, such an item's undefined value matched the undefined model, so every item of a plain menu, such as a list of links, counted as selected; since items show their selected state again, each one drew in the selected fill. An item without a value is now selected only when marked `active`.
