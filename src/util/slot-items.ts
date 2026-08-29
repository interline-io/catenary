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
 * Flattens Fragments (`v-for`, `<template>`) and drops anything that is not
 * the component asked for: Comments, which is what a `v-if` renders when
 * false, and Text, which is the whitespace between elements in a template.
 */
export function collectSlotItems (
  nodes: VNode[] | undefined,
  type: unknown,
  expected?: string
): VNode[] {
  if (!nodes) return []
  return nodes.flatMap((node): VNode[] => {
    if (node.type === Fragment) {
      return collectSlotItems(node.children as VNode[], type, expected)
    }
    if (node.type === Comment || node.type === Text) return []
    if (node.type === type) return [node]
    warnUnrecognisedChild(node, expected)
    return []
  })
}

// Warned about once per offending component, not once per render: the caller
// runs on every render, so an unguarded warning would flood the console.
const warned = new Set<string>()

/**
 * Warn when a slot child is a component that is not the one being collected.
 *
 * This is the one behaviour the VNode approach takes away. Under the
 * registration model an item registered itself from wherever it was mounted,
 * so wrapping one in a component of your own worked. Reading the slot only
 * sees direct children, so a wrapped item still renders its panel but never
 * appears in the header — a half-working, silent failure that is worth a
 * pointer rather than an afternoon.
 *
 * Only components are reported. A plain element beside the items renders in
 * the content area and may well be deliberate; a component in that position
 * is far more likely to be a wrapper that used to work.
 */
function warnUnrecognisedChild (node: VNode, expected?: string): void {
  if (!expected) return
  if (process.env.NODE_ENV === 'production') return
  const type = node.type
  const isComponent = typeof type === 'function'
    || (typeof type === 'object' && type !== null)
  if (!isComponent) return

  const name = (typeof type === 'object' && type !== null && 'name' in type
    ? String((type as { name?: unknown }).name ?? '')
    : (type as { name?: string }).name ?? '') || 'a component'
  const key = `${expected}:${name}`
  if (warned.has(key)) return
  warned.add(key)
  console.warn(
    `[catenary] <${expected}> must be a direct child of its parent's default slot. `
    + `Found ${name} instead, so any ${expected} inside it will render its panel `
    + `but will not appear in the header. v-for and <template> are fine; a wrapper `
    + `component is not. Move the ${expected} up to the slot, or have the wrapper `
    + `render into the slot rather than around it.`
  )
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
