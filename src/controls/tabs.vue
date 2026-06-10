<template>
  <div>
    <div
      class="tabs cat-tabs"
      :class="tabsClasses"
    >
      <div
        ref="tablistRef"
        role="tablist"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
        :aria-orientation="orientation"
        class="cat-tablist"
      >
        <button
          v-for="(tab, index) in tabs"
          :id="tab.tabId"
          :key="tab.value"
          ref="tabRefs"
          type="button"
          role="tab"
          class="cat-tab"
          :class="{ 'is-active': modelValue === tab.value }"
          :aria-selected="modelValue === tab.value"
          :aria-controls="tab.panelId"
          :tabindex="index === selectedIndex ? 0 : -1"
          :data-index="index"
          @click="selectTab(tab.value)"
          @keydown="onTablistKeydown"
        >
          <span v-if="tab.icon" class="icon">
            <i :class="`mdi mdi-${tab.icon}`" aria-hidden="true" />
          </span>
          <span>{{ tab.label }}</span>
        </button>
      </div>
    </div>
    <div class="cat-tab-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends string | number = string">
import { computed, provide, ref, watch, nextTick } from 'vue'

/**
 * Tabs component following the WAI-ARIA Authoring Practices tabs pattern.
 * https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
 *
 * Keyboard:
 *   - ArrowLeft / ArrowRight (horizontal) or ArrowUp / ArrowDown (vertical):
 *     move focus and activation to the previous/next tab, wrapping at ends.
 *   - Home / End: focus and activate the first / last tab.
 *   - Tab: leaves the tab list; only the active tab is in the tab order.
 *
 * Activation follows focus (automatic activation) because tab panels are
 * preloaded via v-show — there is no async loading penalty.
 *
 * Works with cat-tab-item children. Name the tablist with `ariaLabelledby`
 * pointing at a visible heading when one exists, or `ariaLabel` otherwise.
 *
 * @example
 * <cat-tabs v-model="activeTab" aria-label="Sections">
 *   <cat-tab-item label="First" value="first">Content 1</cat-tab-item>
 *   <cat-tab-item label="Second" value="second">Content 2</cat-tab-item>
 * </cat-tabs>
 */

import type { TabsSize, TabsPosition, TabsType } from './types'

const props = withDefaults(defineProps<{
  /** The active tab value (v-model) */
  modelValue?: T
  /** Position: 'left' (default), 'centered', 'right' */
  position?: TabsPosition
  /** Size: 'small', 'normal', 'medium', 'large' */
  size?: TabsSize
  /** Type: 'default', 'boxed', 'toggle', 'toggle-rounded' */
  type?: TabsType
  /** Make tabs take full width */
  expanded?: boolean
  /**
   * Accessible label for the tablist. Provide this when the tablist isn't
   * already labelled by visible heading text — without it, screen readers
   * announce only the active tab without group context.
   */
  ariaLabel?: string
  /**
   * id of a visible element (e.g. a heading) that labels the tablist.
   * Preferred over ariaLabel when a visible label exists.
   */
  ariaLabelledby?: string
  /** Tablist orientation. @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical'
}>(), {
  modelValue: undefined,
  position: 'left',
  size: 'normal',
  type: 'default',
  expanded: false,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  orientation: 'horizontal'
})

const emit = defineEmits<{
  'update:modelValue': [value: T]
}>()

interface TabItem {
  label: string
  value: string | number
  icon?: string
  tabId: string
  panelId: string
}

const tabs = ref<TabItem[]>([])
const tablistRef = ref<HTMLElement | null>(null)
const tabRefs = ref<HTMLButtonElement[]>([])

function registerTab (label: string, value: string | number, icon: string | undefined, tabId: string, panelId: string) {
  // Re-register: replace if value already known (covers hot-reload / dynamic tabs).
  const existing = tabs.value.findIndex(t => t.value === value)
  if (existing >= 0) {
    tabs.value[existing] = { label, value, icon, tabId, panelId }
  } else {
    tabs.value.push({ label, value, icon, tabId, panelId })
  }
}

function deregisterTab (value: string | number) {
  const idx = tabs.value.findIndex(t => t.value === value)
  if (idx >= 0) tabs.value.splice(idx, 1)
}

provide('registerTab', registerTab)
provide('deregisterTab', deregisterTab)
provide('activeTab', computed(() => props.modelValue))

// Roving tabindex anchor. Falls back to the first tab when modelValue matches
// no registered tab (stale value, or the active tab-item was removed via v-if)
// so the tablist never drops out of the page tab order entirely.
const selectedIndex = computed(() => {
  const i = tabs.value.findIndex(t => t.value === props.modelValue)
  return i >= 0 ? i : 0
})

function selectTab (value: string | number) {
  emit('update:modelValue', value as T)
}

function focusTabAt (index: number) {
  const next = tabRefs.value[index]
  if (!next) return
  next.focus()
  const value = tabs.value[index]?.value
  if (value !== undefined) selectTab(value)
}

function onTablistKeydown (event: KeyboardEvent) {
  const count = tabs.value.length
  if (count === 0) return

  // Source of truth is the actually-focused tab. Each tab carries data-index,
  // so we can read it off the active element. Falls back to modelValue if no
  // tab is currently focused (e.g., when handler fires before focus settles).
  let idx = -1
  if (typeof document !== 'undefined') {
    const focused = document.activeElement as HTMLElement | null
    const attr = focused?.getAttribute('data-index')
    if (attr !== null && attr !== undefined) {
      const parsed = Number.parseInt(attr, 10)
      if (!Number.isNaN(parsed)) idx = parsed
    }
  }
  if (idx < 0) {
    const fallback = tabs.value.findIndex(t => t.value === props.modelValue)
    idx = fallback >= 0 ? fallback : 0
  }

  const horizontalKeys = props.orientation === 'horizontal'
  const prevKey = horizontalKeys ? 'ArrowLeft' : 'ArrowUp'
  const nextKey = horizontalKeys ? 'ArrowRight' : 'ArrowDown'

  if (event.key === prevKey) {
    event.preventDefault()
    focusTabAt((idx - 1 + count) % count)
  } else if (event.key === nextKey) {
    event.preventDefault()
    focusTabAt((idx + 1) % count)
  } else if (event.key === 'Home') {
    event.preventDefault()
    focusTabAt(0)
  } else if (event.key === 'End') {
    event.preventDefault()
    focusTabAt(count - 1)
  }
}

const tabsClasses = computed(() => {
  const classes: string[] = []

  if (props.position === 'centered') classes.push('is-centered')
  if (props.position === 'right') classes.push('is-right')

  if (props.size !== 'normal') classes.push(`is-${props.size}`)

  if (props.type === 'boxed') classes.push('is-boxed')
  if (props.type === 'toggle') classes.push('is-toggle')
  if (props.type === 'toggle-rounded') classes.push('is-toggle', 'is-toggle-rounded')

  if (props.expanded) classes.push('is-fullwidth')

  if (props.orientation === 'vertical') classes.push('is-vertical')

  return classes
})

// Trigger resize event when tab changes (for maps and other components that need to resize)
watch(() => props.modelValue, () => {
  nextTick(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('resize'))
    }
  })
})
</script>

<style lang="scss">
@use "bulma/sass/utilities/initial-variables" as *;
@use "bulma/sass/utilities/derived-variables" as *;

/* Override .content ul styles for tabs - must be unscoped */
.content .cat-tabs ul {
  margin-left: 0;
  margin-inline-start: 0;
  list-style: none;
}

.cat-tabs .cat-tablist {
  display: flex;
  flex-grow: 1;
  flex-wrap: wrap;
  align-items: center;
  // Inherit Bulma's .tabs ul styling effects via the wrapper.
}

.cat-tabs.is-centered .cat-tablist { justify-content: center; }
.cat-tabs.is-right .cat-tablist { justify-content: flex-end; }
.cat-tabs.is-fullwidth .cat-tab { flex-grow: 1; }

.cat-tabs .cat-tab {
  // Render as a Bulma tab anchor visually, but it's a real <button>.
  appearance: none;
  background: transparent;
  border: 1px solid transparent;
  border-bottom-color: $border;
  margin-bottom: -1px;
  padding: 0.5em 1em;
  color: $text;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  font: inherit;
  line-height: 1.5;

  &:hover {
    color: $text-strong;
    border-bottom-color: $text-strong;
  }

  &.is-active {
    color: $link;
    border-bottom-color: $link;
  }

  &:focus-visible {
    outline: 2px solid $link;
    outline-offset: -2px;
  }
}

.cat-tabs.is-boxed .cat-tab {
  border: 1px solid transparent;
  border-radius: 4px 4px 0 0;

  &:hover {
    background-color: $background;
    border-color: $border;
  }

  &.is-active {
    background-color: $scheme-main;
    border-color: $border;
    border-bottom-color: transparent;
  }
}

.cat-tabs.is-toggle .cat-tablist {
  .cat-tab {
    border-color: $border;
    margin-bottom: 0;

    &.is-active {
      background-color: $link;
      border-color: $link;
      color: $white;
      z-index: 1;
    }
  }

  .cat-tab + .cat-tab { margin-left: -1px; }

  .cat-tab:first-child { border-radius: 4px 0 0 4px; }
  .cat-tab:last-child { border-radius: 0 4px 4px 0; }
}

.cat-tabs.is-toggle-rounded .cat-tab:first-child { border-radius: 290486px 0 0 290486px; padding-left: 1.25em; }
.cat-tabs.is-toggle-rounded .cat-tab:last-child { border-radius: 0 290486px 290486px 0; padding-right: 1.25em; }

// Vertical orientation: stack tabs in a column and move the active-tab rule
// from the bottom edge to the right edge so it reads as a side rail.
.cat-tabs.is-vertical .cat-tablist {
  flex-direction: column;
  align-items: stretch;
}

.cat-tabs.is-vertical .cat-tab {
  border-bottom-color: transparent;
  border-right: 1px solid $border;
  margin-bottom: 0;
  margin-right: -1px;
  justify-content: flex-start;

  &:hover {
    border-bottom-color: transparent;
    border-right-color: $text-strong;
  }

  &.is-active {
    border-bottom-color: transparent;
    border-right-color: $link;
  }
}

.cat-tabs.is-vertical.is-toggle .cat-tablist {
  .cat-tab {
    border-color: $border;
    margin-right: 0;

    &.is-active { border-color: $link; }
  }

  .cat-tab + .cat-tab { margin-left: 0; margin-top: -1px; }

  .cat-tab:first-child { border-radius: 4px 4px 0 0; }
  .cat-tab:last-child { border-radius: 0 0 4px 4px; }
}

.cat-tabs.is-vertical.is-toggle-rounded {
  .cat-tab:first-child { border-radius: 290486px 290486px 0 0; padding-left: 1em; }
  .cat-tab:last-child { border-radius: 0 0 290486px 290486px; padding-right: 1em; }
}
</style>
