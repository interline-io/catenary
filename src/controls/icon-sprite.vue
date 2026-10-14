<template>
  <!-- Symbols only; nothing here is visible or exposed. Sized to nothing rather
       than display:none, which some browsers do not render <use> targets from. -->
  <svg
    v-if="context?.sprite"
    class="cat-icon-sprite"
    aria-hidden="true"
    focusable="false"
    width="0"
    height="0"
  >
    <symbol v-for="name in names" :id="iconSymbolId(name)" :key="name" viewBox="0 0 24 24">
      <path :d="iconPath(name)" />
    </symbol>
  </svg>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeUnmount } from 'vue'
import { IconContextKey } from './types'
import { iconPath, iconSymbolId, registeredIcons } from '../util/icons'

/**
 * The shared <symbol>s icons draw from when the plugin's `iconSprite` is on.
 * Place it once, last in the root layout; it renders nothing otherwise.
 *
 * It holds every registered icon, not only the ones on the page. A sprite that
 * renders last cannot know the page's icons on the server: Vue renders the
 * content of an async component, or one inside <Suspense>, after the
 * components that follow it, so its icons would be missing from the server
 * HTML. The registry is the same on server and client, so this also hydrates
 * without a mismatch, and an icon registered later (by a lazily loaded route)
 * is added reactively. An app registers only the icons it uses, so this is the
 * app's icon set, each path once per page.
 *
 * @component cat-icon-sprite
 * @example
 * <cat-icon-sprite />
 */
const context = inject(IconContextKey, undefined)

if (context?.sprite) {
  context.spriteState.value = 'mounted'
  onBeforeUnmount(() => {
    context.spriteState.value = 'missing'
  })
}

const names = computed(() => registeredIcons())
</script>

<style lang="scss" scoped>
.cat-icon-sprite {
  position: absolute;
  overflow: hidden;
}
</style>
