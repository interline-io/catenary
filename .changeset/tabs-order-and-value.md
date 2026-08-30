---
"@interline-io/catenary": patch
---

`cat-tabs` keeps its tablist in template order, and no longer strands an entry when a tab's `value` changes.

Both are fixes `cat-steps` has carried since #66 that `cat-tabs` never got. Ported as-is, so the two components now behave the same way for the same reasons.

**Ordering.** Tab items register with their parent in `onMounted`, which is document order for a static list but not for one revealed later by `v-if` — that item mounts last and appended to the end of the tablist while its panel rendered in the middle. Registrations are now placed by comparing panel elements, as `cat-steps` does. This is live in production: a conditional tab sitting between two static ones renders after both.

**Changed values.** `deregister` ran with the *current* `props.value` and nothing watched it, so changing a value left the old entry in place and added a second. A watcher now drops the old entry first, which also means a `label` or `icon` edited after mount reaches the tablist instead of leaving it showing what the item looked like when it registered.

No API change, and nothing about how items may be nested changes.

Server-rendered tablists are a separate matter and remain unfixed: the header is built from `onMounted` registrations, which never run during `renderToString`. #67 stays open for that, and #87 records what a slot-VNode implementation costs — chiefly that a parent reading its own slot cannot see items nested inside a wrapper component, which registration handles at any depth.
