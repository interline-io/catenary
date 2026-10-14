<template>
  <!-- Always decorative: the accessible name, when there is one, belongs on the
       host (cat-icon's span, or the button the icon sits in). -->
  <svg
    v-if="path"
    class="cat-icon-glyph"
    :class="{ 'cat-icon-spin': spin }"
    :style="px ? { fontSize: `${px}px` } : undefined"
    :data-icon="name"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <use v-if="useSprite" :href="`#${iconSymbolId(name)}`" />
    <path v-else :d="path" />
  </svg>
  <i
    v-else
    class="mdi cat-icon-glyph"
    :class="[`mdi-${name}`, { [`mdi-${px}px`]: px, 'mdi-spin': spin }]"
    :data-icon="name"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import { computed, inject, onMounted } from 'vue'
import { IconContextKey } from './types'
import { expectIconSprite, iconPath, iconSymbolId, reportUnregisteredIcon } from '../util/icons'

/**
 * One MDI icon glyph, with no container. Renders an inline SVG when the name is
 * registered (see util/icons.ts) and the `@mdi/font` class otherwise. Both are
 * 1em square, so a glyph is the same size either way: `px` sets it the way the
 * font's `mdi-24px`/`mdi-36px`/`mdi-48px` classes do, and without it the glyph
 * follows the surrounding font size, as the webfont's does.
 *
 * With the plugin's `iconSprite`, the SVG references the icon's <symbol> in
 * <cat-icon-sprite> instead of carrying its path; `strictIcons` reports names
 * that fall back to the webfont.
 *
 * Internal: controls use it inside their own Bulma `.icon` containers;
 * cat-icon is the public component.
 */
const props = defineProps<{
  /** MDI icon name, without the `mdi-` prefix */
  name: string
  /** Glyph size in pixels; inherits the font size when unset */
  px?: 24 | 36 | 48
  /** Rotate continuously, for the loading icon */
  spin?: boolean
}>()

const context = inject(IconContextKey, undefined)

const path = computed(() => {
  const found = iconPath(props.name)
  if (!found) {
    reportUnregisteredIcon(context, props.name)
  }
  return found
})

// Only 'missing' falls back to the path: while 'pending' the sprite may still be
// ahead (it renders last), and server and client agree on that, so hydration
// matches.
const useSprite = computed(() => !!context?.sprite && context.spriteState.value !== 'missing')

onMounted(() => {
  if (context?.sprite) {
    expectIconSprite(context)
  }
})
</script>

<style lang="scss">
// Not scoped, so a control can size or align the glyph from its own styles.
svg.cat-icon-glyph {
  width: 1em;
  height: 1em;
  flex-shrink: 0;
  fill: currentColor;
}

.cat-icon-spin {
  animation: cat-icon-spin 2s infinite linear;
}

@keyframes cat-icon-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(359deg); }
}

// Slowed rather than stopped: a still spinner no longer says "working"
@media (prefers-reduced-motion: reduce) {
  .cat-icon-spin {
    animation-duration: 6s;
  }
}
</style>
