---
"@interline-io/catenary": patch
---

`cat-dropdown-item` shows which items are selected again, and highlights the item under the pointer. When items became `<button>` elements ([#12](https://github.com/interline-io/catenary/pull/12)), their style reset set `background: transparent` and `color: inherit` at a specificity that beats Bulma's `button.dropdown-item` rule. Bulma 1.x draws both states only by changing the variables that rule builds the background and text color from, so the `is-active` class was still applied but nothing painted it. The reset now leaves background and color to Bulma: a selected item takes the link fill with its invert text, and a hovered one the hover shade, in both themes.

Unselected items also take Bulma's dropdown item colors rather than inheriting the menu's, which makes their text slightly stronger in both themes.
