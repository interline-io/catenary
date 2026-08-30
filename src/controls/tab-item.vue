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
  watch,
  type ComputedRef
} from 'vue'

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

type RegisterTabFn = (
  label: string,
  value: string | number,
  icon: string | undefined,
  tabId: string,
  panelId: string,
  el: HTMLElement | null
) => void
type DeregisterTabFn = (value: string | number) => void

const registerTab = inject<RegisterTabFn>('registerTab')
const deregisterTab = inject<DeregisterTabFn>('deregisterTab')
const activeTab = inject<ComputedRef<string | number | undefined>>('activeTab')

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
  registerTab?.(props.label, props.value, props.icon, tabId, panelId, panelRef.value)
}

onMounted(() => {
  register()
  nextTick(detectFocusableChild)
})

// The tablist is rendered from the registration, so anything shown there has
// to be pushed up again when it changes — a tab whose label is edited after
// mount is the case that matters.
watch(
  () => [props.value, props.label, props.icon],
  (_current, [oldValue]) => {
    // `value` is the key the parent registers under, so changing it makes this
    // a different tab as far as the tablist is concerned. Drop the old entry
    // first, or the list keeps a tab whose panel is gone and unmounting only
    // ever removes the current one. Same fix cat-step-item got in #66.
    if (oldValue !== props.value) {
      deregisterTab?.(oldValue as string | number)
    }
    register()
  }
)

onUpdated(() => {
  // Slot content can change after mount (v-if/v-for inside, async data).
  nextTick(detectFocusableChild)
})

// Drop the registration when the tab-item unmounts (e.g., v-if toggles a tab
// off). Without this, stale entries accumulate and the parent's keyboard nav
// can land on a value with no rendered panel.
onBeforeUnmount(() => {
  if (deregisterTab) {
    deregisterTab(props.value)
  }
})

const isActive = computed(() => {
  if (activeTab) {
    return activeTab.value === props.value
  }
  return false
})
</script>
