---
"@interline-io/catenary": patch
---

`cat-tabs` keys its tablist registry on each item's stable id rather than its `value`, which fixes five ways the tablist could drift from the template.

The registry was keyed on `value` — a prop the consumer can change — so a changed value read as a different tab. That single decision produced a cluster of failures, all of which go away when identity and content are separated: `tabId` is minted once per item with `useId()` and outlives every prop change.

Fixed:

- **A tab revealed after mount lands in template order.** Registrations arrive in mount order, so a `v-if` tab in the middle of a list appended to the end of the tablist while its panel rendered in the middle. Live in production. Placed by comparing panel elements, and re-placed on re-registration so a reordered list settles too.
- **Arrow keys focus the tab they activate.** `focusTabAt` indexed a `v-for` template-ref array, which Vue fills in mount order. Once the tablist is ordered by document position, indexing one by the other moves DOM focus to one button while activating another — the worse half of the ordering bug. Resolved from the DOM instead.
- **An unkeyed `v-for` shrinking no longer empties the tablist.** Re-registering under a value a sibling still owned overwrote that sibling's entry, which unmounting then deleted; `['a','b','c']` → `['b','c']` left zero tabs and two orphaned panels.
- **Two siblings exchanging values keep both tabs**, instead of deleting each other's registration and leaving a panel whose `aria-labelledby` names a tab that is not rendered.
- **A focused tab surviving a value change keeps focus.** The tablist keyed its buttons on `tab.value`, so changing one destroyed and recreated the button and dropped focus to `<body>`. Keyed on `tabId`, the button is patched in place.

Also: a bound `modelValue` that names no tab now falls back to the first tab rather than leaving a tablist with nothing selected and every panel hidden. An unbound tablist is unchanged — none selected, first still keyboard-reachable — since that is an unmade choice rather than a broken state.

`cat-steps` shares this registry's shape and most of these faults; it is not changed here. Extracting the two into one implementation is the real fix and is worth doing separately, since porting between them by hand is what let `cat-tabs` ship the ordering bug for months after `cat-steps` fixed it in #66.
