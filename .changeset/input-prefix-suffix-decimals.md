---
"@interline-io/catenary": minor
---

`cat-input` takes `prefix`, `suffix` and `decimals` props for unit and currency fields. `prefix` and `suffix` render static text attached to the input as Bulma static addons, such as "$" or "minutes". They are not focusable, are hidden from assistive technology where they are drawn, and are added to the input's `aria-describedby`, so a screen reader announces the unit with the focused input. The input's name should still carry the unit, e.g. "Maximum fare in dollars".

With a prefix or suffix, the component's root is a `.field.has-addons` group rather than the `.control`, and `class`, `style` and bubbling listeners go on the group. The input fills the width the addons leave, as a lone input fills its container.

`decimals` formats a `type="number"` value to that many places while the input is not focused, so 2.5 displays as "2.50". The model keeps the number as typed. It also defaults `inputmode` to `decimal` (`numeric` for 0), and a caller's own `inputmode` wins.

A focused numeric input now shows the text being typed rather than redrawing it from the model. Deleting the last digit used to refill the field with "0" before the next digit could be typed. The emitted value is unchanged: an emptied numeric field still emits `0`.
