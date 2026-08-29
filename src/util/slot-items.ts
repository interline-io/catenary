import { Comment, Fragment, Text, type VNode } from 'vue'

/**
 * Collect the VNodes in a slot that are instances of a given component,
 * flattening the wrappers a template can put around them.
 *
 * Components that build a header from their children — cat-tabs' tablist,
 * cat-steps' progress list — read the slot at render time rather than waiting
 * for children to register themselves in `onMounted`. That is what gives them
 * document order for free, and what makes the header render on the server:
 * `onMounted` never runs during `renderToString`, so a registration-based
 * header is empty in the server HTML and only appears on hydration.
 *
 * Flattens Fragments (`v-for`, `<template>`) and drops Comments, which is what
 * a `v-if` renders when false.
 */
export function collectSlotItems (nodes: VNode[] | undefined, type: unknown): VNode[] {
  if (!nodes) return []
  return nodes.flatMap((node): VNode[] => {
    if (node.type === Fragment) {
      return collectSlotItems(node.children as VNode[], type)
    }
    if (node.type === Comment || node.type === Text) return []
    return node.type === type ? [node] : []
  })
}

/**
 * Build an id fragment from a child's `value`.
 *
 * Ids are derived from the value rather than the child's position, so
 * inserting a tab ahead of another does not renumber — and, more importantly,
 * so the parent and the child arrive at the same id without having to agree on
 * an index. The child knows its own `value`; it does not know where it sits.
 *
 * Whitespace is the only character an HTML id cannot carry, so that is all
 * that is replaced. Two values differing only in whitespace would collide,
 * which is why `value` is documented as needing to be unique per group
 * anyway — the registration model it replaces keyed on it too.
 */
export function idFragment (value: string | number): string {
  return String(value).replace(/\s+/g, '-')
}
