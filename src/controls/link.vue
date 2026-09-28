<template>
  <component :is="linkComponent" v-if="resolvedTo" :to="resolvedTo" :title="title" v-bind="$attrs">
    <slot />
  </component>
  <span v-else :title="title" v-bind="fallbackAttrs" class="cat-link-unresolved">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, inject, defineAsyncComponent, useAttrs, watch } from 'vue'
import type { Router, RouteLocationRaw, RouteLocationNamedRaw } from 'vue-router'
import { LinkRoutesKey } from './types'

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

const resolvedTo = computed((): RouteLocationRaw | null => {
  if (!router) return null

  let target: RouteLocationRaw | undefined

  if (props.routeKey) {
    const name = routes[props.routeKey]
    if (!name) return null

    // If `to` is an object, merge params/query/hash into a named route
    if (typeof props.to === 'object' && props.to !== null && !Array.isArray(props.to)) {
      const base = props.to as RouteLocationNamedRaw
      const merged: RouteLocationNamedRaw = { name }
      if (base.params) merged.params = base.params
      if (base.query) merged.query = base.query
      if (base.hash) merged.hash = base.hash
      target = merged
    } else {
      target = { name }
    }
  } else {
    target = props.to
  }

  if (!target) return null

  try {
    router.resolve(target)
    return target
  } catch {
    return null
  }
})

// The unresolved fallback is plain text. Callers style links as buttons and
// attach handlers, and passing those through made a span that looked like a
// button and answered a mouse click but was unreachable by keyboard and
// announced as text (WCAG 2.1.1). So drop listeners and anything that makes
// it look interactive to assistive tech; keep class, style, id and data-*
// so layout holds. The cat-link-unresolved class marks it for styling.
const INTERACTIVE_ATTRS = new Set(['tabindex', 'role', 'href', 'target', 'rel', 'download', 'aria-current'])

const fallbackAttrs = computed(() => {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(attrs)) {
    if (/^on[A-Z]/.test(key)) continue
    if (INTERACTIVE_ATTRS.has(key.toLowerCase())) continue
    out[key] = value
  }
  return out
})

/*
 * Warn when a route key has no entry in the provided route map, the usual
 * cause being that nothing provides LinkRoutesKey at all. `=== undefined`,
 * not falsiness: an empty string is a deliberate "no route for this key"
 * sentinel. A `to` that is still null while data loads is not warned about.
 * Watched, not checked once, since the key can change; warned once per key.
 * Bare process.env check so bundlers strip it; see radio.vue.
 */
if (process.env.NODE_ENV !== 'production') {
  watch(() => props.routeKey, (key) => {
    if (!key || !router || routes[key] !== undefined || warnedKeys.has(key)) return
    warnedKeys.add(key)
    console.warn(
      `[catenary] <cat-link route-key="${key}"> has no entry in the route map, `
      + 'so it renders as plain text rather than a link. Provide the key via '
      + 'LinkRoutesKey, or map it to "" to mark it deliberately unlinked.'
    )
  }, { immediate: true })
}
</script>

<script lang="ts">
const warnedKeys = new Set<string>()
</script>

<style scoped lang="scss">
// A fallback styled as a button takes Bulma's disabled-button look, so the
// dead control is visibly distinct rather than a working-looking look-alike.
// Background and border are left alone: Bulma keeps a colored button's own
// fill when disabled, and forcing the neutral disabled background under
// is-primary's invert text made the label invisible.
.cat-link-unresolved.button {
  box-shadow: var(--bulma-button-disabled-shadow);
  opacity: var(--bulma-button-disabled-opacity);
  cursor: not-allowed;
}
</style>
