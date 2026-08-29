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
  onUpdated,
  computed,
  nextTick,
  useId,
  ref,
  type ComputedRef
} from 'vue'
import { idFragment } from '../util/slot-items'
import { TabsIdBaseKey } from './types'

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

const activeTab = inject<ComputedRef<string | number | undefined>>('activeTab')

// Pair of ids binding tab button <-> tabpanel via aria-controls /
// aria-labelledby. Derived from the parent's id base plus this item's own
// `value`, exactly as cat-tabs derives them for the button, so the two agree
// without the item having to know its index. `value` must be unique within a
// tab group, which the parent's keyboard navigation already assumed.
const idBase = inject(TabsIdBaseKey, undefined)
const ownId = useId()
const fragment = computed(() => idFragment(props.value))
const tabId = computed(() => idBase ? `${idBase}-tab-${fragment.value}` : `${ownId}-tab`)
const panelId = computed(() => idBase ? `${idBase}-panel-${fragment.value}` : `${ownId}-panel`)
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

onMounted(() => {
  nextTick(detectFocusableChild)
})

onUpdated(() => {
  // Slot content can change after mount (v-if/v-for inside, async data).
  nextTick(detectFocusableChild)
})

const isActive = computed(() => {
  if (activeTab) {
    return activeTab.value === props.value
  }
  return false
})
</script>
