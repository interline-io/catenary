---
"@interline-io/catenary": patch
---

`cat-tree-control` accessibility. Expand/collapse buttons previously all shared the same state-bearing label ("Expand"/"Collapse"), so screen readers heard an undifferentiated list of identical buttons, and the label duplicated the state already conveyed by `aria-expanded`. Tree nesting was also expressed only by visual indentation.

- Each disclosure button now uses the node name (falling back to the node key) as a constant `aria-label`/`title`; `aria-expanded` continues to convey open/closed state, per APG disclosure guidance.
- Children are wrapped in `role="group"` with an `aria-label` naming the parent node, so screen readers announce entry into and exit from each subtree. The wrapper is only rendered when the node actually has children.
- New `tree-control.test.ts` covers the accessible names, `aria-expanded` toggling, group semantics, collapsed-state DOM removal, select event emission, and axe checks.
