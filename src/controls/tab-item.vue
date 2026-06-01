<template>
  <div
    v-show="isActive"
    :id="panelId"
    role="tabpanel"
    :aria-labelledby="tabId"
    :tabindex="hasFocusableChild ? undefined : 0"
  >
    <slot />
  </div>
</template>

<script setup lang="ts" generic="T extends string | number = string">
import { inject, onMounted, computed, useId, ref, type ComputedRef } from 'vue'

/**
 * Tab panel — child of cat-tabs. Content is only displayed when the tab is active.
 * Renders as a `<div role="tabpanel">` paired with its tab via `aria-labelledby`.
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

type RegisterTabFn = (
  label: string,
  value: string | number,
  icon: string | undefined,
  tabId: string,
  panelId: string
) => void

const registerTab = inject<RegisterTabFn>('registerTab')
const activeTab = inject<ComputedRef<string | number | undefined>>('activeTab')

// Pair of IDs that bind tab button ↔ tabpanel via aria-controls / aria-labelledby.
const tabId = useId()
const panelId = useId()
const hasFocusableChild = ref(false)

onMounted(() => {
  if (registerTab) {
    registerTab(props.label, props.value, props.icon, tabId, panelId)
  }
})

const isActive = computed(() => {
  if (activeTab) {
    return activeTab.value === props.value
  }
  return false
})
</script>
