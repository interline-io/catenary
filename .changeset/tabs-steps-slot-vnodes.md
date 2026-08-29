---
"@interline-io/catenary": minor
---

`cat-tabs` and `cat-steps` build their headers from the default slot's VNodes instead of collecting `onMounted` registrations. Closes #67.

One design decision caused three separate bugs, so one change fixes all three and removes the machinery that was working around them.

## Items appear in template order

An item revealed later by `v-if` registered last, so it landed at the end of the header regardless of where it sat in the template — a tab in the middle of a list rendered after the ones following it. `cat-steps` worked around this by comparing panel elements with `compareDocumentPosition`; `cat-tabs` had no workaround at all. Reading the slot gives document order directly, and the workaround is gone.

## A changed `value` no longer strands an entry

`deregister` ran with the *current* `props.value` and nothing watched it, so changing a value left the old entry in place and added a second. `cat-step-item` grew a watcher for this in #66; `cat-tab-item` never got one. Neither needs it now: the list cannot outlive the render that produced it.

## The headers render on the server

`onMounted` never runs during `renderToString`, so the tablist and the progress list were empty in server HTML and appeared only on hydration. Both now render server-side, with tests using `renderToString` to prove it.

Worth being precise about the scope: this fixes the component's half. A page whose tabs sit behind data that is only fetched on the client still renders nothing there, because the items never reach the slot in the first place.

## Ids

Both sides derive the id pair from one `useId()` on the parent plus the item's own `value` — `${base}-tab-${value}` / `${base}-panel-${value}` — rather than from a position. Deriving from an index would mean parent and child had to agree on one, and inserting an item would renumber everything after it; deriving from `value` means neither side needs to know where an item sits. `value` already had to be unique within a group, which is what the registration keyed on.

## Notes

Slot VNodes are not a reactive dependency, so everything read from them is resolved in a function called during render rather than cached in a computed — Vue warns that a slot invoked outside a render "will not track dependencies used in the slot", and a computed would go stale exactly when a `v-if` adds or removes an item. In `cat-steps` that means one resolver returns the list along with the active index and each item's completed/current/upcoming state, so the template makes a single pass.

`cat-steps` normalises its model to the first step when the bound value names no step, rather than resolving that fallback downstream; children then compare against the model alone and need no slot dependency of their own. `cat-steps` also focuses a panel by id now instead of through a callback handed up at registration.
