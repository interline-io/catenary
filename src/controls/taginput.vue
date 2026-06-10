<template>
  <!-- Combobox semantics live on the input (ARIA 1.2 pattern); the wrapper
       carries no role. The status region confirms tag additions/removals and
       empty results to screen reader users; it is rendered from mount because
       live regions inserted at announcement time are unreliable. -->
  <div
    class="cat-taginput"
    :class="containerClasses"
  >
    <span class="is-sr-only" role="status">{{ statusMessage }}</span>
    <span v-if="!readonly" :id="usageHintId" class="is-sr-only">{{ ariaUsageHint }}</span>
    <!-- Selected tags (above input) -->
    <div class="cat-taginput-tags" role="list" aria-label="Selected tags">
      <template v-if="selectedTags.length > 0">
        <div
          v-for="(tag, tagIndex) in selectedTags"
          :key="tag.value"
          class="tags has-addons"
          role="listitem"
        >
          <button
            v-if="!disabled && !readonly && closable"
            :ref="el => setRemoveButtonRef(el, tagIndex)"
            type="button"
            class="tag is-delete"
            :class="tagClasses"
            :aria-label="`Remove ${tag.label}`"
            @click="removeTag(tag)"
          />
          <span class="tag" :class="tagClasses">
            <slot name="tag" :tag="tag">
              {{ tag.label }}
            </slot>
          </span>
        </div>
      </template>
      <!-- Placeholder to reserve vertical space when no tags selected -->
      <span v-else class="cat-taginput-placeholder">
        {{ emptyText }}
      </span>
      <!-- Counter for max tags -->
      <span
        v-if="maxTags !== undefined"
        :id="counterId"
        class="cat-taginput-counter"
        :class="{ 'is-max': isMaxReached }"
        aria-live="polite"
      >
        {{ counterText }}
      </span>
    </div>

    <!-- Input wrapper with dropdown positioned relative to it (hidden in readonly mode) -->
    <div v-if="!readonly" class="cat-taginput-input-wrapper">
      <!-- Input with icon -->
      <div class="control" :class="controlClasses">
        <!-- The accessible name comes from a wrapping cat-field label when
             present (via FieldIdKey); aria-label is only a fallback so it
             never overrides the visible label association. The max-tags state
             keeps the input enabled: disabling the focused element would drop
             keyboard focus to the page body and remove the only way to
             Backspace-remove a tag. -->
        <input
          :id="fieldId"
          ref="inputRef"
          v-model="searchText"
          type="text"
          class="input"
          :class="inputClasses"
          :placeholder="isMaxReached ? 'Maximum reached' : placeholder"
          :aria-label="ariaLabel ?? (fieldId ? undefined : (placeholder || 'Search tags'))"
          :disabled="disabled"
          autocomplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          :aria-expanded="showDropdown"
          :aria-controls="listboxId"
          :aria-activedescendant="highlightedIndex >= 0 ? `${componentId}-option-${highlightedIndex}` : undefined"
          :aria-describedby="inputDescribedby"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown="handleKeydown"
        >
        <span v-if="icon" class="icon is-left">
          <i :class="`mdi mdi-${icon}`" aria-hidden="true" />
        </span>
      </div>

      <!-- Dropdown. The listbox role sits on the options container so the
           header slot and empty message are not invalid listbox children. -->
      <div
        v-show="showDropdown"
        class="cat-taginput-dropdown"
      >
        <!-- Header slot -->
        <div v-if="$slots.header" class="cat-taginput-dropdown-header">
          <slot name="header" />
        </div>

        <!-- Options list. DOM focus stays in the input per the ARIA 1.2
             combobox pattern; the highlighted option is conveyed through
             aria-activedescendant, so options are deliberately not focusable
             and have no keyboard handlers of their own. -->
        <div
          :id="listboxId"
          class="cat-taginput-dropdown-content"
          role="listbox"
          aria-multiselectable="true"
          :aria-label="ariaLabel || placeholder || 'Select options'"
        >
          <!-- Keyboard interaction happens on the input (arrows move the
               highlight, hover only mirrors it), so the focus-pairing rules
               do not apply to these activedescendant-driven options. -->
          <!-- eslint-disable vuejs-accessibility/interactive-supports-focus, vuejs-accessibility/mouse-events-have-key-events -->
          <div
            v-for="(option, index) in filteredOptions"
            :id="`${componentId}-option-${index}`"
            :key="option.value"
            class="cat-taginput-dropdown-item"
            :class="{ 'is-active': index === highlightedIndex }"
            role="option"
            :aria-selected="modelValue?.includes(option.value) || false"
            @mousedown.prevent="selectOption(option)"
            @mouseenter="highlightedIndex = index"
          >
            <slot name="option" :option="option">
              {{ option.label }}
            </slot>
          </div>
          <!-- eslint-enable vuejs-accessibility/interactive-supports-focus, vuejs-accessibility/mouse-events-have-key-events -->
        </div>
        <div v-if="filteredOptions.length === 0 && $slots.empty" class="cat-taginput-dropdown-item is-empty">
          <slot name="empty" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends string | number = string">
import { computed, ref, watch, useSlots, useId, inject, nextTick } from 'vue'
import type { TaginputVariant, TaginputSize, TagOption as TagOptionBase } from './types'
import { FieldIdKey, FieldDescribedbyKey } from './types'

/**
 * Tag input component with autocomplete dropdown.
 * Allows selecting multiple values displayed as removable tags.
 * Uses generic type T for value types (defaults to string).
 *
 * @component cat-taginput
 * @example
 * <cat-taginput v-model="selectedIds" :options="options" />
 * <cat-taginput v-model="tags" :options="items" variant="primary" open-on-focus />
 */

defineOptions({
  inheritAttrs: true
})

/**
 * Option type for taginput items, parameterized by this component's generic T.
 */
type TagOption = TagOptionBase<T>

const props = withDefaults(defineProps<{
  /** Array of options to choose from. @default [] */
  options?: TagOption[]
  /** Placeholder text for the input. */
  placeholder?: string
  /** MDI icon name for left icon (without mdi- prefix). @example 'magnify', 'tag', 'account' */
  icon?: string
  /** Open dropdown when input is focused. @default false */
  openOnFocus?: boolean
  /** Disable the input and prevent interaction. @default false */
  disabled?: boolean
  /** Make the input readonly (can view but not modify). @default false */
  readonly?: boolean
  /** Make the component take full width. @default false */
  fullwidth?: boolean
  /** Show loading state. @default false */
  loading?: boolean
  /** Color variant for the tags. */
  variant?: TaginputVariant
  /** Size of the input and tags. */
  size?: TaginputSize
  /** Allow removing tags by clicking the delete button. @default true */
  closable?: boolean
  /** Use rounded style for tags and input. @default false */
  rounded?: boolean
  /** Text to display when no tags are selected. @default 'None selected' */
  emptyText?: string
  /** Maximum number of tags that can be selected. When undefined, there is no limit. */
  maxTags?: number
  /** Allow creating new tags not in the options list. Only for string-typed taginputs. @default false */
  allowNew?: boolean
  /** Separator keys that trigger creating a new tag (in addition to Enter). @default [','] */
  separators?: string[]
  /** Accessible name for the input, for use when the taginput is not paired with a visible cat-field label. */
  ariaLabel?: string
  /** Visually hidden usage hint describing the input (bound via aria-describedby), since the multi-select interaction is not self-evident: the field clears after each selection. */
  ariaUsageHint?: string
}>(), {
  options: () => [],
  placeholder: '',
  icon: undefined,
  openOnFocus: false,
  disabled: false,
  readonly: false,
  fullwidth: false,
  loading: false,
  variant: undefined,
  size: undefined,
  closable: true,
  rounded: false,
  emptyText: 'None selected',
  maxTags: undefined,
  allowNew: false,
  separators: () => [','],
  ariaLabel: undefined,
  ariaUsageHint: 'Type to search. Use the up and down arrows to browse results, and Enter or Tab to add the highlighted result. Selected items are listed before the field as removable buttons.'
})

const emit = defineEmits<{
  /** Emitted when an option is selected */
  select: [option: TagOption]
  /** Emitted when a tag is removed */
  remove: [option: TagOption]
}>()

// v-model for selected values (array of value IDs)
const modelValue = defineModel<T[]>({ default: () => [] })

// v-model:input for search text
const searchText = defineModel<string>('input', { default: '' })

const slots = useSlots()
const inputRef = ref<HTMLInputElement | null>(null)
const isOpen = ref(false)
const highlightedIndex = ref(-1)

const componentId = useId()
const listboxId = `${componentId}-listbox`
const counterId = `${componentId}-counter`

// Associates a wrapping cat-field's label with the input. In readonly mode
// the input is removed from the DOM, so the label dangles; acceptable, since
// readonly taginputs render only the tag list.
const fieldId = inject(FieldIdKey, undefined)

// The usage hint, the max-tags counter, and a wrapping cat-field's help
// message all describe the input.
const usageHintId = `${componentId}-hint`
const fieldDescribedby = inject(FieldDescribedbyKey, undefined)
const inputDescribedby = computed(() => {
  const parts = [
    usageHintId,
    props.maxTags !== undefined ? counterId : undefined,
    fieldDescribedby?.value
  ].filter(Boolean)
  return parts.join(' ')
})

// Screen reader status feedback for tag additions and removals (Backspace
// removal is otherwise completely silent) and for empty filter results.
const statusMessage = ref('')

// The input clears after each selection, so the announcement restates the
// resulting selection; the delta alone leaves users unsure what is held.
// Computed from the post-change labels passed by the caller, because the
// selectedTags computed only updates after the parent round-trips v-model.
function selectionSummary (labels: string[]): string {
  return labels.length === 0 ? 'None selected.' : `Selected: ${labels.join(', ')}.`
}

function announceStatus (message: string) {
  // Clear first so repeating the same message still triggers an announcement.
  statusMessage.value = ''
  nextTick(() => {
    statusMessage.value = message
  })
}

// Remove-button elements by tag index, for restoring keyboard focus after a
// tag is removed (the focused button unmounts with its tag).
const removeButtonRefs = ref<(HTMLButtonElement | null)[]>([])
function setRemoveButtonRef (el: unknown, index: number) {
  removeButtonRefs.value[index] = el as HTMLButtonElement | null
}

// Check if max tags limit is reached
const isMaxReached = computed(() => {
  if (props.maxTags === undefined) return false
  return (modelValue.value?.length || 0) >= props.maxTags
})

// Counter text for max tags
const counterText = computed(() => {
  if (props.maxTags === undefined) return ''
  const current = modelValue.value?.length || 0
  return `${current} / ${props.maxTags} selected`
})

// Compute selected tags with labels from options
const selectedTags = computed(() => {
  const selected: TagOption[] = []
  for (const val of modelValue.value || []) {
    const option = props.options.find(o => o.value === val)
    if (option) {
      selected.push(option)
    } else {
      // If not found in options, create a basic tag
      selected.push({ value: val, label: String(val) })
    }
  }
  return selected
})

// Filter options: exclude already selected. At the max-tags limit no option
// is addable, so offer none rather than a list of dead entries.
const filteredOptions = computed(() => {
  if (isMaxReached.value) return []
  const selectedValues = new Set(modelValue.value || [])
  let filtered = props.options.filter(o => !selectedValues.has(o.value))

  // Filter by search text if present
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter(o => o.label.toLowerCase().includes(search))
  }

  return filtered
})

const showDropdown = computed(() => {
  return isOpen.value && (filteredOptions.value.length > 0 || !!slots.header || !!slots.empty)
})

const containerClasses = computed(() => {
  const classes: string[] = []

  if (props.fullwidth) {
    classes.push('is-fullwidth')
  }

  if (props.disabled) {
    classes.push('is-disabled')
  }

  return classes
})

const controlClasses = computed(() => {
  const classes: string[] = []

  if (props.icon) {
    classes.push('has-icons-left')
  }

  if (props.loading) {
    classes.push('is-loading')
  }

  return classes
})

const inputClasses = computed(() => {
  const classes: string[] = []

  if (props.size) {
    classes.push(`is-${props.size}`)
  }

  if (props.rounded) {
    classes.push('is-rounded')
  }

  return classes
})

const tagClasses = computed(() => {
  const classes: string[] = []

  if (props.variant) {
    classes.push(`is-${props.variant}`)
  }

  // Bump up tag size by one level for better readability
  // small -> normal, normal/medium/default -> medium, large -> large
  if (props.size === 'small') {
    classes.push('is-normal')
  } else if (props.size === 'large') {
    classes.push('is-large')
  } else {
    // Default, 'normal', and 'medium' all map to 'is-medium'
    classes.push('is-medium')
  }

  if (props.rounded) {
    classes.push('is-rounded')
  }

  return classes
})

function handleFocus () {
  if (props.openOnFocus && !props.readonly) {
    isOpen.value = true
  }
}

function handleBlur () {
  // Delay to allow click on dropdown item
  setTimeout(() => {
    isOpen.value = false
    highlightedIndex.value = -1
  }, 150)
}

function handleKeydown (event: KeyboardEvent) {
  if (props.readonly) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (!isOpen.value) {
        isOpen.value = true
      } else if (highlightedIndex.value < filteredOptions.value.length - 1) {
        highlightedIndex.value++
      }
      break
    case 'ArrowUp':
      event.preventDefault()
      if (highlightedIndex.value > 0) {
        highlightedIndex.value--
      }
      break
    case 'Home':
      // Per APG Listbox: jump to the first option when the listbox is open.
      // Browsers also use Home to move the text cursor to the start of an
      // input; we only intercept when the dropdown is showing options.
      if (isOpen.value && filteredOptions.value.length > 0) {
        event.preventDefault()
        highlightedIndex.value = 0
      }
      break
    case 'End':
      if (isOpen.value && filteredOptions.value.length > 0) {
        event.preventDefault()
        highlightedIndex.value = filteredOptions.value.length - 1
      }
      break
    case 'Enter':
      event.preventDefault()
      if (highlightedIndex.value >= 0 && highlightedIndex.value < filteredOptions.value.length) {
        const option = filteredOptions.value[highlightedIndex.value]
        if (option) {
          selectOption(option)
        }
      } else {
        addNewTag()
      }
      break
    case 'Escape':
      // Consume the Escape that dismisses the listbox (or clears typed text)
      // so an enclosing dialog does not also close on the same keypress; only
      // a "spent" Escape with nothing left to dismiss falls through.
      if (isOpen.value) {
        event.preventDefault()
        event.stopPropagation()
        isOpen.value = false
        highlightedIndex.value = -1
      } else if (searchText.value) {
        event.preventDefault()
        event.stopPropagation()
        searchText.value = ''
      }
      break
    case 'Tab':
      // Tab commits the highlighted option before moving on; accessibility
      // testers expected Tab (not only Enter) to select, and previously it
      // silently abandoned the highlight. The default is not prevented, so
      // focus continues to the next element.
      if (isOpen.value && highlightedIndex.value >= 0 && highlightedIndex.value < filteredOptions.value.length) {
        const option = filteredOptions.value[highlightedIndex.value]
        if (option) {
          selectOption(option)
        }
      }
      isOpen.value = false
      highlightedIndex.value = -1
      break
    case 'Backspace':
      if (searchText.value === '' && modelValue.value.length > 0 && props.closable) {
        const lastTag = selectedTags.value[selectedTags.value.length - 1]
        if (lastTag) {
          removeTag(lastTag)
        }
      }
      break
    default:
      if (props.allowNew && props.separators.includes(event.key)) {
        event.preventDefault()
        addNewTag()
      }
      break
  }
}

function addNewTag () {
  const text = searchText.value.trim()
  if (!text || !props.allowNew || isMaxReached.value) return false
  // Check if it already exists as a selected value
  if (modelValue.value.includes(text as T)) {
    searchText.value = ''
    return true
  }
  const option: TagOption = { value: text as T, label: text }
  const nextLabels = [...selectedTags.value.map(t => t.label), option.label]
  modelValue.value = [...modelValue.value, text as T]
  emit('select', option)
  announceStatus(`Added ${option.label}. ${selectionSummary(nextLabels)}`)
  searchText.value = ''
  highlightedIndex.value = -1
  inputRef.value?.focus()
  return true
}

function selectOption (option: TagOption) {
  // The input stays enabled at the max-tags limit (disabling the focused
  // element drops keyboard focus to the page body), so enforce the limit
  // here instead.
  if (isMaxReached.value && !modelValue.value.includes(option.value)) return
  if (!modelValue.value.includes(option.value)) {
    const nextLabels = [...selectedTags.value.map(t => t.label), option.label]
    modelValue.value = [...modelValue.value, option.value]
    emit('select', option)
    announceStatus(`Added ${option.label}. ${selectionSummary(nextLabels)}`)
  }
  searchText.value = ''
  highlightedIndex.value = -1
  // Keep dropdown open for multiple selections
  inputRef.value?.focus()
}

function removeTag (tag: TagOption) {
  const index = selectedTags.value.findIndex(t => t.value === tag.value)
  // When the removal was activated from the tag's own remove button, that
  // button unmounts with the tag and focus would fall to the page body.
  // Restore it to the same-position remove button (or the input). The
  // Backspace-in-input path leaves focus in the input untouched.
  const active = document.activeElement
  const hadButtonFocus = !!active && removeButtonRefs.value.includes(active as HTMLButtonElement)
  const nextLabels = selectedTags.value.filter(t => t.value !== tag.value).map(t => t.label)
  modelValue.value = modelValue.value.filter(v => v !== tag.value)
  emit('remove', tag)
  announceStatus(`Removed ${tag.label}. ${selectionSummary(nextLabels)}`)
  if (hadButtonFocus) {
    nextTick(() => {
      const buttons = removeButtonRefs.value.filter((b): b is HTMLButtonElement => !!b && b.isConnected)
      const target = buttons[Math.min(index, buttons.length - 1)]
      if (target) {
        target.focus()
      } else {
        inputRef.value?.focus()
      }
    })
  }
}

// Open dropdown when typing
watch(searchText, (val) => {
  if (val.length > 0 && !props.readonly) {
    isOpen.value = true
  }
})

// Filtering can shrink the list below the highlighted index, leaving
// aria-activedescendant pointing at an option that no longer exists. Reset
// rather than clamp: the user never moved to the option that would otherwise
// become highlighted.
watch(filteredOptions, (opts) => {
  if (highlightedIndex.value >= opts.length) {
    highlightedIndex.value = -1
  }
})

// Announce empty filter results; the listbox simply not rendering is
// invisible to screen reader users. Announce only on the transition into
// the empty state: re-announcing on every keystroke while the list stays
// empty would be disruptive.
const inNoResultsState = ref(false)
watch([isOpen, filteredOptions, searchText], () => {
  const empty = isOpen.value && !!searchText.value && filteredOptions.value.length === 0 && !isMaxReached.value
  if (empty && !inNoResultsState.value) {
    announceStatus('No results')
  }
  inNoResultsState.value = empty
})

// Expose focus method
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur()
})
</script>

<style scoped lang="scss">
.cat-taginput {
  &.is-fullwidth {
    width: 100%;
  }

  &.is-disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .cat-taginput-input-wrapper {
    position: relative;
  }

  .cat-taginput-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    min-height: 2em; // Reserve space for tags
    align-items: center;

    // Reset Bulma's default margin on .tags
    .tags {
      margin-bottom: 0;
    }

    // Reduce left padding on label tag when following delete button
    .tag.is-delete + .tag {
      padding-left: 0.5em;
    }
  }

  .cat-taginput-placeholder {
    color: var(--bulma-text-weak);
    font-style: italic;
    line-height: 2em; // Match tag height
  }

  .cat-taginput-counter {
    margin-left: auto;
    font-size: 0.875rem;
    color: var(--bulma-text-weak);

    &.is-max {
      color: var(--bulma-danger);
      font-weight: 600;
    }
  }

  .cat-taginput-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 20;
    max-height: 300px;
    overflow-y: auto;
    background: var(--bulma-scheme-main);
    border: 1px solid var(--bulma-border);
    border-radius: var(--bulma-radius);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .cat-taginput-dropdown-header {
    padding: 0.5rem 0.75rem;
    background: var(--bulma-scheme-main-bis);
    border-bottom: 1px solid var(--bulma-border);
  }

  .cat-taginput-dropdown-content {
    padding: 0.25rem 0;
  }

  .cat-taginput-dropdown-item {
    display: block;
    padding: 0.5rem 0.75rem;
    color: var(--bulma-text);
    cursor: pointer;

    &:hover,
    &.is-active {
      background: var(--bulma-scheme-main-ter);
    }

    &.is-empty {
      color: var(--bulma-text-weak);
      cursor: default;

      &:hover {
        background: transparent;
      }
    }
  }
}
</style>
