<template>
  <Transition :name="animated ? 'cat-step-fade' : undefined">
    <!-- A named group rather than a landmark: the panel is a chunk of the page
         that belongs to one step, not a region of the site. The name comes from
         the step's own label in the progress list, so when cat-steps moves
         focus here after a step change, a screen reader announces which step
         the user has landed on before reading the content.

         Hidden with v-show (display: none), which drops inactive panels out of
         the accessibility tree and the tab order together — aria-hidden alone
         would leave their fields and buttons reachable by Tab. -->
    <div
      v-show="isActive"
      :id="panelId"
      ref="panel"
      class="cat-step-panel"
      role="group"
      :aria-labelledby="labelId"
      tabindex="-1"
    >
      <slot />
    </div>
  </Transition>
</template>

<script setup lang="ts" generic="T extends string | number = string">
import { computed, inject, onBeforeUnmount, onMounted, useId, useTemplateRef, watch } from 'vue'
import type { CoreVariant } from './types'
import { StepsContextKey } from '../util/steps-context'

/**
 * One step of a cat-steps wizard: a panel of content plus the label, marker and
 * state its parent draws in the progress list.
 *
 * The panel is only *shown* while its step is active; it stays mounted the rest
 * of the time, hidden with `display: none`. So a user who steps back finds what
 * they typed, and `onMounted` in the content runs once rather than on every
 * visit — but the content is also live from the start, which matters for a step
 * that kicks off work of its own.
 *
 * @component cat-step-item
 * @example
 * <cat-step-item value="2" label="Validate feed">
 *   <p>Review the results below.</p>
 * </cat-step-item>
 * <cat-step-item value="3" label="Import" variant="danger" icon="alert-circle">
 *   <p>The import failed.</p>
 * </cat-step-item>
 */

// Inlined rather than a named interface: in a generic component the emitted
// declaration cannot reference a local type (TS4025).
const props = withDefaults(defineProps<{
  /** Identifies this step. Matched against the parent's v-model. */
  value: T

  /** Label shown in the progress list. Also names this panel. */
  label: string

  /**
   * Marker text, replacing the step's 1-based position. Ignored when `icon` is
   * set, or when the step is completed and the parent shows a completed icon.
   */
  step?: string

  /** MDI icon name shown in the marker instead of text. */
  icon?: string

  /**
   * Color override for this step's marker, e.g. 'danger' for one that failed.
   * Defaults to the parent's variant.
   */
  variant?: CoreVariant

  /**
   * Whether this step's marker can be activated to jump here, overriding the
   * parent's rule. Omitted, the parent decides: by default a step is reachable
   * once the user is past it.
   */
  clickable?: boolean
}>(), {
  step: undefined,
  icon: undefined,
  variant: undefined,
  clickable: undefined
})

const steps = inject(StepsContextKey, undefined)

// Pair of ids binding marker ↔ panel: the parent puts labelId on the label text
// it renders, and this panel points at it with aria-labelledby.
const labelId = useId()
const panelId = useId()
const panelRef = useTemplateRef<HTMLElement>('panel')

function registration () {
  return {
    value: props.value,
    label: props.label,
    step: props.step,
    icon: props.icon,
    variant: props.variant,
    clickable: props.clickable,
    labelId,
    panelId,
    el: panelRef.value,
    focus: () => panelRef.value?.focus()
  }
}

onMounted(() => {
  steps?.register(registration())
})

// The progress list is rendered from the registration, so anything shown there
// has to be pushed up again when it changes — a step that fails part-way
// through and switches to variant="danger" is the case that matters.
watch(
  () => [props.value, props.label, props.step, props.icon, props.variant, props.clickable],
  (_current, [oldValue]) => {
    // `value` is the key the parent registers under, so changing it makes this
    // a different step as far as the list is concerned. Drop the old entry
    // first, or the list keeps a marker for a step that no longer exists and
    // unmounting only ever removes the current one.
    if (oldValue !== props.value) {
      steps?.deregister(oldValue as string | number)
    }
    steps?.register(registration())
  }
)

// Drop the registration when the item unmounts, e.g. a v-if step that no longer
// applies. Without this the progress list keeps a marker whose panel is gone.
onBeforeUnmount(() => {
  steps?.deregister(props.value)
})

const isActive = computed(() => steps?.activeValue.value === props.value)
const animated = computed(() => steps?.animated.value ?? false)
</script>

<style lang="scss" scoped>
// Programmatic focus lands here after a step change. Browsers do not paint a
// focus ring for that on their own, and a keyboard user who just pressed Next
// should be able to see where focus went.
.cat-step-panel:focus-visible {
  outline: 2px solid var(--bulma-link-on-scheme);
  outline-offset: 4px;
}

.cat-step-fade-enter-active,
.cat-step-fade-leave-active {
  transition: opacity 0.2s ease;
}

.cat-step-fade-enter-from,
.cat-step-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .cat-step-fade-enter-active,
  .cat-step-fade-leave-active {
    transition: none;
  }
}
</style>
