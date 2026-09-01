<template>
  <component :is="linkComponent" v-if="resolvedTo" :to="resolvedTo" :title="title" v-bind="$attrs">
    <slot />
  </component>
  <span v-else :title="title" v-bind="$attrs">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, inject, onMounted, defineAsyncComponent } from 'vue'
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
    /*
     * The injected map exists to remap a canonical key into a host app's own
     * route namespace. A host whose route names already match the keys needs no
     * entry, so fall back to the key itself rather than returning null: a
     * missing entry used to render the inert <span> below, which consumers
     * style as a button, so a forgotten map produced look-alikes rather than an
     * error. `router.resolve` still rejects a name that does not exist.
     */
    const name = routes[props.routeKey] ?? props.routeKey

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

/*
 * An unresolved link still renders its slot content, in a <span> that carries
 * whatever classes the caller passed -- and callers style these as buttons. The
 * result looks exactly like a link, has no link role, is not focusable and does
 * nothing when clicked, with nothing in the console to say so. That silence is
 * the actual defect: it has already cost a downstream app a debugging session.
 *
 * See radio.vue for why the NODE_ENV guard is bare.
 */
if (process.env.NODE_ENV !== 'production') {
  onMounted(() => {
    if (resolvedTo.value) return
    if (!props.routeKey && !props.to) return
    const asked = props.routeKey
      ? `route-key="${props.routeKey}"`
      : `to=${JSON.stringify(props.to)}`
    console.warn(
      `[catenary] <cat-link ${asked}> did not resolve to a route, so it renders a `
      + 'plain <span>: it keeps its classes and its text, but it is not navigable, has no '
      + 'link role and cannot be focused. '
      + (props.routeKey
        ? 'Either the key is missing from the map provided as LinkRoutesKey, or no route of '
        + 'that name exists. A host whose route names match the keys needs no map entry.'
        : 'Check that the target route exists.')
    )
  })
}
</script>
