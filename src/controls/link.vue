<template>
  <component :is="linkComponent" v-if="resolvedTo" :to="resolvedTo" :title="title" v-bind="$attrs">
    <slot />
  </component>
  <span v-else :title="title" v-bind="fallbackAttrs" class="cat-link-unresolved">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, inject, defineAsyncComponent, onMounted, ref, useAttrs, watch } from 'vue'
import type { Router, RouteLocationRaw, RouteLocationNamedRaw } from 'vue-router'
import { LinkRoutesKey } from './types'
import { filterAttrs } from '../util/attrs'

defineOptions({
  inheritAttrs: false
})

const props = defineProps<{
  to?: RouteLocationRaw
  routeKey?: string
  title?: string
}>()

const attrs = useAttrs()
const routes = inject(LinkRoutesKey, {})

// Check for router via app instance to avoid swallowing unrelated errors
const instance = getCurrentInstance()
const router: Router | null = instance?.appContext.config.globalProperties.$router ?? null

// Only resolve RouterLink when a router is actually installed
const linkComponent = router
  ? defineAsyncComponent(() => import('vue-router').then(m => m.RouterLink))
  : 'span'

// Own properties only: `routes.constructor` would otherwise count as mapped.
function lookupRoute (key: string): string | undefined {
  return Object.prototype.hasOwnProperty.call(routes, key) ? routes[key] : undefined
}

// The resolved target, or why there is none. The reason drives the
// development warning; `null` means the fallback is deliberate or pending
// (a key mapped to "", or a `to` still null while data loads).
const resolution = computed((): { to: RouteLocationRaw | null, reason: string | null } => {
  if (props.routeKey) {
    const name = lookupRoute(props.routeKey)
    if (name === undefined) {
      return { to: null, reason: `route-key="${props.routeKey}" has no entry in the route map; provide it via LinkRoutesKey, or map it to "" to mark it deliberately unlinked` }
    }
    if (!name) return { to: null, reason: null }
    if (!router) return { to: null, reason: 'no router is installed' }

    // If `to` is an object, merge params/query/hash into a named route
    const merged: RouteLocationNamedRaw = { name }
    if (typeof props.to === 'object' && props.to !== null && !Array.isArray(props.to)) {
      const base = props.to as RouteLocationNamedRaw
      if (base.params) merged.params = base.params
      if (base.query) merged.query = base.query
      if (base.hash) merged.hash = base.hash
    }
    return tryResolve(merged, `route-key="${props.routeKey}" maps to route "${name}", which the router cannot resolve`)
  }
  if (!props.to) return { to: null, reason: null }
  if (!router) return { to: null, reason: 'no router is installed' }
  return tryResolve(props.to, `the router cannot resolve to=${JSON.stringify(props.to)}`)
})

function tryResolve (target: RouteLocationRaw, reason: string) {
  try {
    router!.resolve(target)
    return { to: target, reason: null }
  } catch {
    return { to: null, reason }
  }
}

const resolvedTo = computed(() => resolution.value.to)

// The unresolved fallback is plain text. Callers style links as buttons and
// attach handlers, and passing those through made a span that looked like a
// button and answered a mouse click but was unreachable by keyboard and
// announced as text (WCAG 2.1.1). An allowlist, not a denylist: string
// `onclick`, `contenteditable` and role-dependent aria-* would all survive a
// denylist. filterAttrs, not a local loop, for its reactivity fix.
const fallbackAttrs = computed(() => filterAttrs(attrs, keepOnFallback))

/*
 * Warn in development when a link falls back for a reason the caller likely
 * did not intend. From onMounted, so it never fires during SSR (see
 * radio.vue), and watched afterwards since the key, `to` or a reactive route
 * map can change. A map filled after mount warns at mount; the link still
 * resolves once the entry arrives. Warned once per message.
 * Bare process.env check so bundlers strip it; see radio.vue.
 */
if (process.env.NODE_ENV !== 'production') {
  const mounted = ref(false)
  onMounted(() => { mounted.value = true })
  watch([mounted, () => resolution.value.reason], ([isMounted, reason]) => {
    if (!isMounted || !reason) return
    const message = `[catenary] <cat-link> renders as plain text rather than a link: ${reason}.`
    if (warnedMessages.has(message)) return
    warnedMessages.add(message)
    console.warn(message)
  })
}
</script>

<script lang="ts">
const warnedMessages = new Set<string>()

/** Test hook: forget which warnings were already logged. */
export function resetLinkWarnings (): void {
  warnedMessages.clear()
}

// Layout-bearing attributes, plus Vue's vnode lifecycle hooks
// (`@vue:mounted` arrives as `onVnodeMounted`), which are not interaction.
function keepOnFallback (key: string): boolean {
  return key === 'class' || key === 'style' || key === 'id'
    || key.startsWith('data-') || /^onVnode[A-Z]/.test(key)
}
</script>

<style scoped lang="scss">
// A fallback styled as a button keeps its colors at full strength: it is a
// span, not a disabled control, so WCAG 1.4.3's exemption for inactive
// controls does not cover it and dimming would fail contrast. It is marked
// instead by the cursor and by not reacting to hover or press. Bulma drives
// those states by swapping in the hover/active lightness deltas, so zeroing
// the deltas turns them off whatever the selector specificity.
.cat-link-unresolved.button {
  --bulma-button-hover-background-l-delta: 0%;
  --bulma-button-active-background-l-delta: 0%;
  --bulma-button-hover-border-l-delta: 0%;
  --bulma-button-active-border-l-delta: 0%;
  box-shadow: var(--bulma-button-disabled-shadow);
  cursor: not-allowed;
}
</style>
