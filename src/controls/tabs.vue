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
          :key="tab.tabId"
          type="button"
          role="tab"
          class="cat-tab"
          :class="{ 'is-active': activeValue === tab.value }"
          :aria-selected="activeValue === tab.value"
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

import type { TabsSize, TabsPosition, TabsType, TabRegistration } from './types'
import { TabsContextKey } from './types'

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

const tabs = ref<TabRegistration[]>([])
const tablistRef = ref<HTMLElement | null>(null)

/**
 * Register or update a tab.
 *
 * Keyed on `tabId`, not on `value`. `value` is a prop the consumer can change,
 * and keying the registry on it meant a changed value read as a different tab:
 * two siblings exchanging values deleted each other's entry, an unkeyed v-for
 * shrinking emptied the tablist, and re-registering under a value a sibling
 * still owned overwrote it. `tabId` is minted once per item with useId() and
 * outlives every prop change, so identity and content stay separate concerns.
 */
function registerTab (entry: TabRegistration) {
  const existing = tabs.value.findIndex(t => t.tabId === entry.tabId)
  if (existing >= 0) tabs.value.splice(existing, 1)
  insertInDocumentOrder(entry)
}

/**
 * Place a registration where its panel sits in the DOM.
 *
 * Registrations arrive in mount order, which is document order for a static
 * list but not for a tab revealed later by v-if — that one mounts last and
 * would otherwise sit at the end of the tablist while its panel renders in the
 * middle. Re-registrations are re-placed rather than assigned in position, so
 * a reordered list settles too.
 */
function insertInDocumentOrder (entry: TabRegistration) {
  const before = entry.el
    ? tabs.value.findIndex((t) => {
        if (!t.el) return false
        const position = t.el.compareDocumentPosition(entry.el as Node)
        // Across disconnected trees the mask is implementation-defined, and a
        // PRECEDING or FOLLOWING bit is still set — so trusting it would place
        // the tab arbitrarily. A KeepAlive'd or teleported panel is the case
        // that produces this. Appending is the honest answer there.
        if (position & Node.DOCUMENT_POSITION_DISCONNECTED) return false
        return (position & Node.DOCUMENT_POSITION_PRECEDING) !== 0
      })
    : -1
  if (before >= 0) {
    tabs.value.splice(before, 0, entry)
  } else {
    tabs.value.push(entry)
  }
}

function deregisterTab (tabId: string) {
  const idx = tabs.value.findIndex(t => t.tabId === tabId)
  if (idx >= 0) tabs.value.splice(idx, 1)
}

/**
 * The value actually shown, which is `modelValue` whenever it names a real
 * tab and the first tab otherwise.
 *
 * Without the fallback a model naming no tab — a stale value, or the active
 * item's `value` edited out from under it — leaves a tablist with nothing
 * selected and every panel hidden, so the content simply disappears. cat-steps
 * has carried the same fallback since #66.
 */
const activeValue = computed(() => {
  // An unbound tablist is left alone: the consumer has not chosen a tab, and
  // the documented behaviour is that none is selected while the first stays
  // keyboard-reachable. A bound value that matches nothing is different — it
  // is a broken state, not an unmade choice.
  if (props.modelValue === undefined || props.modelValue === null) return props.modelValue
  const match = tabs.value.some(t => t.value === props.modelValue)
  if (match) return props.modelValue
  // Falling back to the raw model when nothing has registered is what makes
  // this safe on the server: children register in onMounted, which never runs
  // during renderToString, so `tabs` is empty there and a bound value would
  // otherwise match nothing and hide every panel — shipping the active tab's
  // content behind display:none. cat-steps carries the same tail for the same
  // reason (steps.vue: `?? model.value`).
  return tabs.value[0]?.value ?? props.modelValue
})
provide(TabsContextKey, {
  register: registerTab,
  deregister: deregisterTab,
  activeValue
})

// Roving tabindex anchor. Falls back to the first tab when modelValue matches
// no registered tab (stale value, or the active tab-item was removed via v-if)
// so the tablist never drops out of the page tab order entirely.
const selectedIndex = computed(() => {
  const i = tabs.value.findIndex(t => t.value === activeValue.value)
  return i >= 0 ? i : 0
})

function selectTab (value: string | number) {
  emit('update:modelValue', value as T)
}

function focusTabAt (index: number) {
  // Resolved from the DOM rather than a `v-for` template-ref array. Vue fills
  // those by pushing on mount and removing on unmount, so the array is in
  // mount order — once the tablist is ordered by document position instead,
  // indexing one by the other moves focus to a different tab than the one it
  // activates.
  const next = tablistRef.value?.children[index] as HTMLElement | undefined
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
// Anything that can change the tablist's height, not just the active tab:
// `.cat-tablist` wraps, so revealing a tab or lengthening a label can gain a
// row and shift the panel below it.
const tablistShape = computed(() => tabs.value.map(t => t.label).join('\u0000'))

watch([() => props.modelValue, tablistShape], () => {
  nextTick(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('resize'))
    }
  })
})
</script>

<style lang="scss">
/* Colors come from Bulma's runtime theme tokens, not SCSS variables: those
   resolve at compile time and would keep their light-theme values when
   cat-theme-toggle switches the scheme, which is what made the tab labels
   unreadable in dark mode. */

/* Override .content ul styles for tabs - must be unscoped */
.content .cat-tabs ul {
  margin-left: 0;
  margin-inline-start: 0;
  list-style: none;
}

/* The tablist is a <div role="tablist">, not Bulma's <ul>, so `.tabs ul` never
   matches it and every rule Bulma puts there has to be restated. Missing them
   cost two bugs: the tab bar had no rule of its own, and because each tab
   carries `margin-bottom: -1 * border-width` to overlap a line that was not
   there, the tablist resolved 1px shorter than its buttons and `.tabs`
   (overflow: hidden) clipped every tab's bottom border. Measured before the
   fix: tabs 41px, tablist 41px, tab 42px.

   Taking the values from the --bulma-tabs-* tokens rather than the generic
   ones also means a consumer overriding them on .tabs gets what they asked
   for, which the hardcoded equivalents ignored. */
.cat-tabs .cat-tablist {
  display: flex;
  flex-grow: 1;
  flex-wrap: wrap;
  align-items: center;
  border-bottom-color: var(--bulma-tabs-border-bottom-color);
  border-bottom-style: var(--bulma-tabs-border-bottom-style);
  border-bottom-width: var(--bulma-tabs-border-bottom-width);
}

.cat-tabs.is-centered .cat-tablist { justify-content: center; }
.cat-tabs.is-right .cat-tablist { justify-content: flex-end; }
.cat-tabs.is-fullwidth .cat-tab { flex-grow: 1; }

// Restates Bulma's `.tabs a`, since the tab is a real <button>. Values come
// from the --bulma-tabs-* tokens so the two stay in step; the transparent
// border on the other three sides is catenary's own, so is-boxed can color
// them without shifting the layout.
.cat-tabs .cat-tab {
  appearance: none;
  background: transparent;
  border: var(--bulma-tabs-border-bottom-width) solid transparent;
  border-bottom-color: var(--bulma-tabs-border-bottom-color);
  border-bottom-style: var(--bulma-tabs-border-bottom-style);
  margin-bottom: calc(-1 * var(--bulma-tabs-border-bottom-width));
  padding: var(--bulma-tabs-link-padding);
  color: var(--bulma-tabs-link-color);
  display: inline-flex;
  align-items: center;
  // Bulma's `.tabs a` centers its content. Without it a tab that is wider than
  // its label — which is every tab under `expanded` — left-aligns the text.
  justify-content: center;
  gap: 0.25rem;
  cursor: pointer;
  font: inherit;
  line-height: 1.5;

  &:hover {
    color: var(--bulma-tabs-link-hover-color);
    border-bottom-color: var(--bulma-tabs-link-hover-border-bottom-color);
  }

  &.is-active {
    color: var(--bulma-tabs-link-active-color);
    border-bottom-color: var(--bulma-tabs-link-active-border-bottom-color);
  }

  &:focus-visible {
    outline: 2px solid var(--bulma-link-on-scheme);
    outline-offset: -2px;
  }
}

.cat-tabs.is-boxed .cat-tab {
  border-color: transparent;
  border-radius: var(--bulma-tabs-boxed-link-radius) var(--bulma-tabs-boxed-link-radius) 0 0;

  &:hover {
    background-color: var(--bulma-background);
    border-color: var(--bulma-border);
  }

  &.is-active {
    background-color: var(--bulma-scheme-main);
    border-color: var(--bulma-border);
    border-bottom-color: transparent;
  }
}

.cat-tabs.is-toggle .cat-tablist {
  // Bulma does the same on `.tabs.is-toggle ul`: the group is drawn by the
  // buttons' own borders, so a rule under it would be a stray line.
  border-bottom: none;

  .cat-tab {
    border-color: var(--bulma-tabs-toggle-link-border-color);
    border-style: var(--bulma-tabs-toggle-link-border-style);
    border-width: var(--bulma-tabs-toggle-link-border-width);
    margin-bottom: 0;

    &.is-active {
      background-color: var(--bulma-tabs-toggle-link-active-background-color);
      border-color: var(--bulma-tabs-toggle-link-active-border-color);
      color: var(--bulma-tabs-toggle-link-active-color);
      z-index: 1;
    }
  }

  // Overlap the shared edge so adjacent buttons draw one border, not two.
  // Derived from the same token as the border it overlaps, or an override
  // leaves a seam or a double line.
  .cat-tab + .cat-tab { margin-left: calc(-1 * var(--bulma-tabs-toggle-link-border-width)); }

  .cat-tab:first-child { border-radius: var(--bulma-tabs-toggle-link-radius) 0 0 var(--bulma-tabs-toggle-link-radius); }
  .cat-tab:last-child { border-radius: 0 var(--bulma-tabs-toggle-link-radius) var(--bulma-tabs-toggle-link-radius) 0; }
}

.cat-tabs.is-toggle-rounded .cat-tab:first-child { border-radius: 290486px 0 0 290486px; padding-left: 1.25em; }
.cat-tabs.is-toggle-rounded .cat-tab:last-child { border-radius: 0 290486px 290486px 0; padding-right: 1.25em; }

// Vertical orientation: stack tabs in a column and move the active-tab rule
// from the bottom edge to the right edge so it reads as a side rail.
.cat-tabs.is-vertical .cat-tablist {
  flex-direction: column;
  align-items: stretch;
  // The horizontal tablist wraps; with a vertical main axis, wrapping would
  // spill tabs into extra columns whenever the container height is short.
  flex-wrap: nowrap;
  // The rail moves to the right edge with the tabs' own borders, so the
  // bottom one would be a stray line under the column. Bulma has no vertical
  // tabs to mirror here — this is the same reasoning applied to the axis the
  // orientation actually uses.
  border-bottom: none;
  border-right-color: var(--bulma-tabs-border-bottom-color);
  border-right-style: var(--bulma-tabs-border-bottom-style);
  border-right-width: var(--bulma-tabs-border-bottom-width);
}

// is-fullwidth grows tabs along the main axis, which in a column layout
// means height; neutralize so expanded does not produce giant vertical tabs.
.cat-tabs.is-vertical.is-fullwidth .cat-tab {
  flex-grow: 0;
}

.cat-tabs.is-vertical .cat-tab {
  border-bottom-color: transparent;
  border-right-color: var(--bulma-tabs-border-bottom-color);
  border-right-style: var(--bulma-tabs-border-bottom-style);
  border-right-width: var(--bulma-tabs-border-bottom-width);
  margin-bottom: 0;
  margin-right: calc(-1 * var(--bulma-tabs-border-bottom-width));
  justify-content: flex-start;

  &:hover {
    border-bottom-color: transparent;
    border-right-color: var(--bulma-tabs-link-hover-border-bottom-color);
  }

  &.is-active {
    border-bottom-color: transparent;
    border-right-color: var(--bulma-tabs-link-active-border-bottom-color);
  }
}

.cat-tabs.is-vertical.is-toggle .cat-tablist {
  .cat-tab {
    // The horizontal toggle rules above already set the toggle border tokens;
    // this only neutralizes the side-rail offset the vertical layout adds.
    border-color: var(--bulma-tabs-toggle-link-border-color);
    margin-right: 0;

    &.is-active { border-color: var(--bulma-tabs-toggle-link-active-border-color); }
  }

  .cat-tab + .cat-tab {
    margin-left: 0;
    margin-top: calc(-1 * var(--bulma-tabs-toggle-link-border-width));
  }

  .cat-tab:first-child { border-radius: var(--bulma-tabs-toggle-link-radius) var(--bulma-tabs-toggle-link-radius) 0 0; }
  .cat-tab:last-child { border-radius: 0 0 var(--bulma-tabs-toggle-link-radius) var(--bulma-tabs-toggle-link-radius); }
}

// Vertical rounding puts the pill ends on top and bottom, so the extra
// padding belongs there too; reset the horizontal first/last padding that
// the base toggle-rounded rules add for the row layout.
.cat-tabs.is-vertical.is-toggle-rounded {
  .cat-tab:first-child {
    border-radius: 290486px 290486px 0 0;
    padding-left: 1em;
    padding-top: 0.75em;
  }
  .cat-tab:last-child {
    border-radius: 0 0 290486px 290486px;
    padding-right: 1em;
    padding-bottom: 0.75em;
  }
}
</style>
