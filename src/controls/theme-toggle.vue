<template>
  <cat-button
    :variant="isDark ? 'dark' : 'light'"
    :aria-pressed="isDark"
    @click="toggleTheme"
  >
    <span class="icon" aria-hidden="true">
      <i :class="`mdi mdi-${isDark ? 'weather-night' : 'weather-sunny'}`" />
    </span>
    <span>{{ label }}</span>
  </cat-button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CatButton from './button.vue'

/**
 * Theme toggle component that switches between light and dark Bulma themes.
 * Uses prefers-color-scheme and persists preference to localStorage.
 *
 * Rendered as a toggle button per the WAI-ARIA button pattern: a fixed label
 * naming what it controls, with `aria-pressed` reflecting whether dark mode is
 * currently on. The icon is decorative and aria-hidden.
 *
 * @component cat-theme-toggle
 * @example
 * <cat-theme-toggle />
 */

interface Props {
  /**
   * Button label. Fixed by design: this is a toggle button, so the label names
   * what it controls and `aria-pressed` carries whether dark mode is on. A
   * label naming the current state instead ("Dark Mode" while dark) is
   * ambiguous with one naming the action — a screen reader user cannot tell
   * whether pressing it turns dark mode on or off.
   * @default 'Dark mode'
   */
  label?: string
}

withDefaults(defineProps<Props>(), {
  label: 'Dark mode'
})

const isDark = ref(false)

function applyTheme (dark: boolean) {
  const html = document.documentElement
  if (dark) {
    html.setAttribute('data-theme', 'dark')
  } else {
    html.setAttribute('data-theme', 'light')
  }
}

function toggleTheme () {
  isDark.value = !isDark.value
  applyTheme(isDark.value)

  // Persist to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }
}

onMounted(() => {
  // Check localStorage first
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else {
      // Fall back to system preference
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyTheme(isDark.value)
  }
})
</script>
