<template>
  <div class="cat-collapse">
    <div class="cat-collapse-header">
      <!-- The trigger is optionally wrapped in a heading so screen reader users
           can reach it from the headings list. The button goes *inside* the
           heading, never the other way round: most screen readers do not
           announce a heading nested inside an interactive element, and putting
           role="button" on the heading would drop it from the headings list. -->
      <component :is="headingLevel ? `h${headingLevel}` : 'div'" class="cat-collapse-heading">
        <button
          ref="triggerRef"
          class="cat-collapse-trigger"
          :class="{ 'cat-collapse-trigger--default': !$slots.trigger }"
          :disabled="disabled || undefined"
          :aria-label="triggerAriaLabel"
          v-bind="triggerAttrs"
          @click="toggle"
        >
          <slot name="trigger" :open="isOpen">
            <span class="cat-collapse-label">{{ label }}</span>
            <cat-icon
              :icon="icon"
              class="cat-collapse-icon"
              :class="{ 'is-collapsed': !isOpen }"
            />
          </slot>
        </button>
      </component>
      <!-- Sibling of the trigger, never inside it: nesting a control within the
           disclosure button would be invalid and would swallow its key events. -->
      <div v-if="$slots.actions" class="cat-collapse-actions">
        <slot name="actions" :open="isOpen" />
      </div>
    </div>

    <!-- Content sits immediately after the trigger in the DOM so a screen reader
         user lands on it straight after activating the button, with nothing to
         hunt for. Hidden with v-show (display: none) rather than aria-hidden, so
         collapsed content leaves the accessibility tree *and* the tab order —
         aria-hidden alone would leave focusable children reachable by Tab. -->
    <Transition :name="animated ? 'cat-collapse-expand' : undefined">
      <div
        v-show="isOpen"
        class="cat-collapse-content"
        v-bind="contentAttrs"
      >
        <slot :open="isOpen" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useSlots } from 'vue'
import CatIcon from './icon.vue'
import { useDisclosure } from '../util/disclosure'

/**
 * Collapse (disclosure) component: a button that shows and hides a section of
 * content.
 *
 * Implements the WAI-ARIA disclosure pattern:
 * https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
 *
 * Keyboard: Enter and Space on the trigger toggle the content. Both come from
 * the native `<button>` — there are no custom key handlers. Focus deliberately
 * does not move when the content opens or closes, so a user who triggers the
 * control by accident keeps their place.
 *
 * Use `headingLevel` whenever the collapse introduces a section, so the trigger
 * shows up in a screen reader's headings list. Stack several with a controlled
 * `open` prop to build an accordion.
 *
 * The shared state and ARIA wiring live in `util/disclosure.ts`, which
 * `cat-msg` and `cat-card` also use for their `expandable` modes.
 *
 * @component cat-collapse
 * @example
 * <cat-collapse label="Learn more">Details</cat-collapse>
 * <cat-collapse label="Methodology" :heading-level="3">Details</cat-collapse>
 * <cat-collapse v-model:open="isOpen" label="Advanced">Details</cat-collapse>
 */

interface Props {
  /** Text for the default trigger. Ignored when the #trigger slot is used. */
  label?: string

  /**
   * Control the open/closed state (v-model:open).
   * @default false
   */
  open?: boolean

  /**
   * Wrap the trigger button in a heading of this level, so the collapse appears
   * in a screen reader's headings list. Omit for a standalone disclosure that
   * does not introduce a section.
   */
  headingLevel?: 2 | 3 | 4 | 5 | 6

  /**
   * Icon shown in the default trigger. Rotates to indicate state.
   * @default 'chevron-down'
   */
  icon?: string

  /**
   * Animate the open/close transition. Respects prefers-reduced-motion.
   * @default false
   */
  animated?: boolean

  /**
   * Disable the trigger.
   * @default false
   */
  disabled?: boolean

  /**
   * Accessible name for the trigger. Only needed when neither `label` nor a
   * #trigger slot supplies visible text — otherwise the name comes from the
   * content, which is preferable. Overrides the fallback name in that case.
   */
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  open: false,
  headingLevel: undefined,
  icon: 'chevron-down',
  animated: false,
  disabled: false,
  ariaLabel: undefined
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'open': []
  'close': []
}>()

const slots = useSlots()
const triggerRef = ref<HTMLButtonElement | null>(null)

// A disclosure button must have an accessible name. Normally it comes from the
// visible text — `label`, or whatever the #trigger slot renders — which is the
// better outcome because the name then describes the content. But with neither,
// the default trigger is just an aria-hidden chevron, leaving an unnamed button
// (WCAG 4.1.2). Fall back to a generic name so that misuse degrades rather than
// fails outright; `ariaLabel` overrides it.
const triggerAriaLabel = computed(() => {
  if (props.ariaLabel) {
    return props.ariaLabel
  }
  return slots.trigger || props.label ? undefined : 'Toggle section'
})

const { isOpen, triggerAttrs, contentAttrs, toggle, setOpen } = useDisclosure({
  open: () => props.open,
  idPrefix: 'cat-collapse',
  onChange: (value) => {
    emit('update:open', value)
    // Branch rather than `emit(value ? 'open' : 'close')`: the typed emit has
    // one overload per event name, so a union argument matches neither.
    if (value) {
      emit('open')
    } else {
      emit('close')
    }
  }
})

defineExpose({
  /** Open the content. */
  open: () => setOpen(true),
  /** Close the content. */
  close: () => setOpen(false),
  /** Toggle the content. */
  toggle,
  /** Move focus to the trigger button. */
  focus: () => triggerRef.value?.focus()
})
</script>

<style lang="scss" scoped>
@use "bulma/sass/utilities/derived-variables" as *;

.cat-collapse-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cat-collapse-heading {
  // Structural only — it must not inherit Bulma's heading margins or sizing, or
  // wrapping a trigger in <h3> would visibly move it on the page.
  flex: 1 1 auto;
  min-width: 0;
  margin: 0;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
}

.cat-collapse-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  // Positive offset, unlike cat-card's inset ring: this trigger is not clipped
  // by a container, so the ring can sit outside its box. cat-msg uses
  // `currentcolor` instead of $link because its header is variant-tinted.
  &:focus-visible {
    outline: 2px solid $link;
    outline-offset: 2px;
  }
}

// Vertical padding only, for a comfortable hit target. Deliberately no
// horizontal padding: the label must sit flush with the content below it, and
// the chevron flush with the content's right edge. Indenting the trigger would
// make every collapse look misaligned against its own body text, and this is a
// generic primitive — horizontal insets belong to whatever container the
// consumer puts it in.
//
// Only the built-in label+icon trigger gets this. A consumer-supplied #trigger
// slot brings its own markup (e.g. a Bulma card-header, already padded) and
// must not be padded twice.
.cat-collapse-trigger--default {
  padding: 0.5rem 0;
}

.cat-collapse-label {
  flex: 1 1 auto;
}

.cat-collapse-actions {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cat-collapse-icon {
  flex: 0 0 auto;
  transition: transform 0.2s ease;

  &.is-collapsed {
    transform: rotate(-90deg);
  }
}

.cat-collapse-expand-enter-active,
.cat-collapse-expand-leave-active {
  transition: opacity 0.2s ease, max-height 0.2s ease;
  overflow: hidden;
}

.cat-collapse-expand-enter-from,
.cat-collapse-expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.cat-collapse-expand-enter-to,
.cat-collapse-expand-leave-from {
  opacity: 1;
  max-height: 100vh;
}

@media (prefers-reduced-motion: reduce) {
  .cat-collapse-icon,
  .cat-collapse-expand-enter-active,
  .cat-collapse-expand-leave-active {
    transition: none;
  }
}
</style>
