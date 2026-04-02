<template>
  <router-link v-if="resolvedTo" :to="resolvedTo" :title="title" v-bind="$attrs">
    <slot />
  </router-link>
  <span v-else :title="title" v-bind="$attrs">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { useRouter, type RouteLocationRaw, type RouteLocationNamedRaw } from 'vue-router'
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

let router: ReturnType<typeof useRouter> | null = null
try {
  router = useRouter()
} catch {
  // No router installed — all links will fall back to <span>
}

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
</script>
