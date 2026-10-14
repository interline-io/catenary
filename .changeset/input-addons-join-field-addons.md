---
"@interline-io/catenary": patch
---

A `cat-input` with a `prefix` or `suffix` now joins a surrounding addon group, such as a `<cat-field addons>` with a button or select beside the input. The input's own addon group used to keep its outer corners rounded and its border doubled against the neighbor, because Bulma joins only `.control` children. The edge controls of the group now square the corners that face a neighbor and overlap the shared border by 1px, as Bulma does for a `.control`, and `expanded` grows the group within the row.
