<template>
  <cat-input
    ref="inputRef"
    v-bind="$attrs"
    expanded
    type="text"
    icon="magnify"
    clearable
    :model-value="modelValue ?? undefined"
    :placeholder="placeholder"
    :aria-label="ariaLabel"
    :clear-aria-label="clearAriaLabel"
    class="entity-search ml-0 mr-2"
    @update:model-value="handleInput"
    @clear="handleClear"
    @keydown.esc="handleEscape"
  />
  <!-- Polite live region for filter feedback (e.g. result counts). Only
       rendered when a consumer supplies the `status` slot; kept visually
       hidden so it announces to screen readers without changing layout. -->
  <div
    v-if="$slots.status"
    class="is-sr-only"
    role="status"
    aria-live="polite"
  >
    <slot name="status" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CatInput from './input.vue'

/**
 * Search bar wrapping cat-input with search-specific behavior: a magnifier
 * icon, a clear ("x") button that appears once populated, and Escape-to-clear.
 * Emits null (not empty string) when cleared.
 *
 * Accessibility:
 * - Provides an accessible name via `aria-label` (default "Search"), since
 *   search fields typically have no visible label. If you wrap it in a
 *   labelled `cat-field`, pass `:aria-label="undefined"` to avoid overriding
 *   that visible label.
 * - The clear button is a real, focusable `<button>` labelled by
 *   `clearAriaLabel` (default "Clear search"); clearing returns focus to the
 *   input (via cat-input).
 * - Escape clears the field when it has a value (and consumes the key so a
 *   surrounding dismissable layer is not also dismissed); when empty, Escape
 *   is left to bubble.
 * - When used to filter a table/report, feed the result count into the
 *   `status` slot — it renders into a polite live region so screen-reader
 *   users hear how many rows matched. Pass `aria-controls` (forwarded to the
 *   input) referencing the id of the region the search updates.
 *
 * @component cat-search-bar
 * @example
 * <cat-search-bar v-model="searchQuery" placeholder="Search..." />
 * @example
 * <cat-search-bar v-model="query" aria-controls="results-table">
 *   <template #status>{{ total }} results</template>
 * </cat-search-bar>
 */

interface Props {
  /**
   * Search query value (v-model). Can be null when cleared.
   */
  modelValue?: string | null
  /**
   * Placeholder text.
   * @default 'Search'
   */
  placeholder?: string
  /**
   * Accessible name for the search input. Search bars usually have no visible
   * label, so this defaults to "Search". Set to undefined when a visible label
   * (e.g. a wrapping cat-field) already names the field.
   * @default 'Search'
   */
  ariaLabel?: string
  /**
   * Accessible label for the clear button.
   * @default 'Clear search'
   */
  clearAriaLabel?: string
  /**
   * Clear the field when Escape is pressed and it has a value. When the field
   * is empty, Escape is always left to bubble (e.g. to close a modal).
   * @default true
   */
  clearOnEscape?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Search',
  ariaLabel: 'Search',
  clearAriaLabel: 'Clear search',
  clearOnEscape: true
})

// Fragment root (input + optional live region), so attrs are forwarded to the
// input explicitly rather than auto-inherited. This is what lets consumers pass
// e.g. `aria-controls` straight through to the native input.
defineOptions({ inheritAttrs: false })

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  'clear': []
}>()

// Typed by the methods we call rather than InstanceType<typeof CatInput>:
// cat-input is a generic component, so its instance type is not constructable.
const inputRef = ref<{ focus: () => void, blur: () => void } | null>(null)

function handleInput (value: string | number): void {
  const stringValue = String(value)
  emit('update:modelValue', (stringValue === '' || stringValue === undefined) ? null : stringValue)
}

// cat-input's clearable button already emptied the value (handled by
// handleInput via update:modelValue) and returned focus to the input; re-emit
// as our null-valued clear for consumers listening to @clear.
function handleClear (): void {
  emit('clear')
}

function handleEscape (event: KeyboardEvent): void {
  if (!props.clearOnEscape) return
  const hasValue = props.modelValue != null && String(props.modelValue) !== ''
  if (!hasValue) return
  // Consume Escape so the layered dismiss stack (modals, popups) does not also
  // react to this press: preventDefault (the stack bails on defaultPrevented)
  // and stopPropagation (cat-input forwards $attrs to both its input and its
  // root, so stopping here also collapses that duplicate keydown to one).
  event.preventDefault()
  event.stopPropagation()
  emit('update:modelValue', null)
  emit('clear')
}

defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur()
})
</script>
