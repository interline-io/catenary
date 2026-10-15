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
import { computed, inject, onActivated, onBeforeUnmount, onDeactivated } from 'vue'
import { IconContextKey, iconPath, iconSymbolId, registeredIcons, spriteActivated, spriteDeactivated } from '../util/icons'

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

// Counted in and out per instance. Inside <KeepAlive>, a page that is navigated
// away from keeps its sprite alive but moves its symbols out of the document, so
// deactivation counts as going away too. `active` keeps a kept-alive sprite that
// is later destroyed from counting itself out twice.
if (context?.sprite) {
  let active = false
  const activate = (): void => {
    if (!active) {
      active = true
      spriteActivated(context)
    }
  }
  const deactivate = (): void => {
    if (active) {
      active = false
      spriteDeactivated(context)
    }
  }
  activate()
  onActivated(activate)
  onDeactivated(deactivate)
  onBeforeUnmount(deactivate)
}

const names = computed(() => registeredIcons())
</script>

<style lang="scss" scoped>
.cat-icon-sprite {
  position: absolute;
  overflow: hidden;
}
</style>
