<template>
  <div
    v-show="isActive"
    :id="panelId"
    ref="panelRef"
    role="tabpanel"
    :aria-labelledby="tabId"
    :tabindex="hasFocusableChild ? undefined : 0"
  >
    <slot />
  </div>
</template>

<script setup lang="ts" generic="T extends string | number = string">
import {
  inject,
  onMounted,
  onBeforeUnmount,
  onUpdated,
  computed,
  nextTick,
  useId,
  ref,
  watch
} from 'vue'
import { TabsContextKey } from './types'

/**
 * Tab panel — child of cat-tabs. Content is only displayed when the tab is active.
 * Renders as a `<div role="tabpanel">` paired with its tab via `aria-labelledby`.
 *
 * The panel itself receives `tabindex="0"` only when its content has no
 * focusable elements — this lets keyboard users reach inert panel text without
 * adding a redundant tab stop when the panel already contains buttons, links,
 * inputs, etc.
 *
 * @example
 * <cat-tab-item label="My Tab" value="my-tab">
 *   <p>Tab content here</p>
 * </cat-tab-item>
 */

const props = defineProps<{
  /** The label displayed in the tab header */
  label: string
  /** The value used to identify this tab */
  value: T
  /** Optional icon to display */
  icon?: string
}>()

const tabs = inject(TabsContextKey, undefined)

// Pair of IDs that bind tab button ↔ tabpanel via aria-controls / aria-labelledby.
const tabId = useId()
const panelId = useId()
const panelRef = ref<HTMLElement | null>(null)
const hasFocusableChild = ref(false)

function detectFocusableChild () {
  if (!panelRef.value) {
    hasFocusableChild.value = false
    return
  }
  // :not(:disabled) excludes disabled form controls, which are not focusable;
  // a panel whose only interactive content is disabled still needs tabindex=0.
  const focusable = panelRef.value.querySelector(
    'button:not(:disabled), a[href], input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
  )
  hasFocusableChild.value = focusable !== null
}

function register () {
  tabs?.register({
    label: props.label,
    value: props.value,
    icon: props.icon,
    tabId,
    panelId,
    el: panelRef.value
  })
}

onMounted(() => {
  register()
  nextTick(detectFocusableChild)
})

// The tablist is drawn from the registration, so anything it shows has to be
// pushed up again when it changes: a label edited after mount, or a `value`
// the consumer swapped. No deregister-then-register dance is needed, because
// the registry is keyed on this item's own `tabId` — re-registering updates
// this entry and cannot collide with a sibling's.
watch(() => [props.value, props.label, props.icon], register)

onUpdated(() => {
  // Slot content can change after mount (v-if/v-for inside, async data).
  nextTick(detectFocusableChild)
})

// Drop the registration when the tab-item unmounts (e.g., v-if toggles a tab
// off). Without this, stale entries accumulate and the parent's keyboard nav
// can land on a value with no rendered panel. Deregistered by `tabId`, so an
// item leaving cannot remove a sibling that happens to share its current
// `value` mid-update.
onBeforeUnmount(() => {
  tabs?.deregister(tabId)
})

const isActive = computed(() => {
  // Identity once the parent has registered this item, so two items sharing a
  // `value` cannot both be active. Before registration the registry is empty —
  // which is every server render, since children register in onMounted — so
  // fall back to the value, keeping the active panel visible in server HTML.
  if (tabs?.activeTabId.value !== undefined) return tabs.activeTabId.value === tabId
  return tabs?.activeValue.value === props.value
})
</script>
