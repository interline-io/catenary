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
  const type = node.type
  const isComponent = typeof type === 'function'
    || (typeof type === 'object' && type !== null)
  // A plain element beside the items renders in the content area and may well
  // be deliberate; a component in that position is far more likely to be a
  // wrapper that used to work. Checked before the environment guard so the
  // common case never reaches it.
  if (!isComponent) return
  // `typeof` first: Vite skips the process.env define in library mode, so this
  // reference survives into the published bundle. A consumer loading the ESM
  // build without a bundler — a plain <script type="module">, a CDN import map
  // — has no `process` at all, and a bare reference would throw.
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') return

  const name = componentName(type) || 'a component'
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
 * inserting an item ahead of another does not renumber — and, more
 * importantly, so the parent and the child arrive at the same id without
 * having to agree on an index. The child knows its own `value`; it does not
 * know where it sits.
 *
 * Anything outside `[A-Za-z0-9_-]` is replaced, since ids also have to survive
 * being written into a CSS selector. Replacing alone would make distinct
 * values collide — `'a b'` and `'a-b'` are both legitimately unique yet would
 * flatten to the same fragment, cross-wiring two items' aria-controls — so a
 * short hash of the original is appended whenever anything was replaced. The
 * common case of a plain identifier is left readable and unhashed.
 */
export function idFragment (value: string | number): string {
  const raw = String(value)
  const safe = raw.replace(/[^\w-]/g, '-')
  return safe === raw ? safe : `${safe}-${hashString(raw)}`
}

/**
 * Read a boolean prop off a raw VNode.
 *
 * VNode props are pre-normalization, so a valueless attribute — `<cat-step-item
 * clickable>` — arrives as the empty string, which is falsy. Read naively that
 * made `clickable` mean the *opposite* of what it says: the marker rendered as
 * a non-interactive span. Vue's own prop normalization does this conversion;
 * anything reading props from VNodes has to do it by hand.
 */
export function booleanProp (value: unknown): boolean | undefined {
  if (value === undefined || value === null) return undefined
  if (value === '') return true
  return value !== false && value !== 'false'
}

/** djb2, base 36. Short and stable across server and client — not for security. */
function hashString (input: string): string {
  let hash = 5381
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0
  }
  return Math.abs(hash).toString(36)
}

/**
 * Best-effort display name for a component VNode type.
 *
 * `<script setup>` SFCs do not set `name` — the compiler emits `__name`, and
 * `__file` when filename-based naming is on. Without those the dedupe key
 * collapsed to the same generic string for every wrapper, so only the first
 * one in an app was ever reported and the message could not say which
 * component to move.
 */
function componentName (type: unknown): string {
  if (typeof type === 'function') return type.name || ''
  if (typeof type !== 'object' || type === null) return ''
  const c = type as { name?: string, __name?: string, __file?: string }
  if (c.name) return c.name
  if (c.__name) return c.__name
  if (c.__file) return c.__file.split('/').pop() ?? ''
  return ''
}
