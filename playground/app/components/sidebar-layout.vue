<template>
  <div class="sidebar-layout">
    <aside class="sidebar-nav is-hidden-touch">
      <nav-menu :groups="groups" />
    </aside>

    <!-- tabindex=-1 lets the skip link move focus here in every browser. -->
    <main id="main-content" class="sidebar-main" tabindex="-1">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import type { NavGroup } from '../../navigation'
import NavMenu from './nav-menu.vue'

defineProps<{
  groups: NavGroup[]
}>()
</script>

<style scoped>
.sidebar-layout {
  display: flex;
  padding: 1.5rem;
  gap: 2rem;
}

.sidebar-nav {
  flex-shrink: 0;
  width: 12rem;
}

.sidebar-main {
  flex: 1;
  min-width: 0;
}
</style>
