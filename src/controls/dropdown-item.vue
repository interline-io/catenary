<template>
  <hr
    v-if="separator"
    class="dropdown-divider"
  >
  <a
    v-else
    :class="itemClass"
    :aria-disabled="props.disabled"
    :role="props.ariaRole"
    @click.stop="handleClick"
  >
    <slot>{{ label }}</slot>
  </a>
</template>

<script setup lang="ts" generic="T = any">
import { inject, computed } from 'vue'

/**
 * Dropdown item component - must be used within cat-dropdown.
 * Represents a single selectable option in a dropdown menu.
 * Type-safe with generic support matching parent dropdown's type.
 *
 * @component cat-dropdown-item
 * @example
 * <cat-dropdown-item value="option1">
 *   Option 1
 * </cat-dropdown-item>
 */

const props = withDefaults(defineProps<{
  /** Value associated with this item (used for selection). Type should match the parent cat-dropdown's generic type. */
  value?: T
  /** Label text (alternative to using default slot). */
  label?: string
  /** Disable this item (cannot be selected) */
  disabled?: boolean
  /** Mark this item as active/selected */
  active?: boolean
  /** Render as a separator (divider) */
  separator?: boolean
  /** ARIA role for accessibility @default 'listitem' */
  ariaRole?: string
  /** Color variant for this item (overrides parent dropdown variant) */
  variant?: import('./types').DropdownTriggerVariant
  /** Render as a nested/indented child item with tree connector styling */
  nested?: boolean
}>(), {
  value: undefined,
  label: undefined,
  disabled: false,
  active: false,
  separator: false,
  ariaRole: 'listitem',
  variant: undefined,
  nested: false
})

interface DropdownContext<T> {
  handleItemClick: (value: T) => void
  isMultiple: boolean
  selectedValue: { value: T | T[] | undefined }
  variant?: { value: import('./types').DropdownTriggerVariant | undefined }
}

const dropdown = inject<DropdownContext<T> | null>('dropdown', null)

const isSelected = computed(() => {
  if (!dropdown) return props.active

  const selectedValue = dropdown.selectedValue?.value

  if (dropdown.isMultiple) {
    return Array.isArray(selectedValue) && props.value !== undefined && selectedValue.includes(props.value)
  }

  return selectedValue === props.value
})

const itemClass = computed(() => ({
  'dropdown-item': true,
  'is-active': isSelected.value,
  'is-disabled': props.disabled,
  'cat-dropdown-item-nested': props.nested,
}))

function handleClick (event: MouseEvent) {
  if (props.disabled) {
    event.preventDefault()
    return
  }

  if (dropdown && props.value !== undefined) {
    dropdown.handleItemClick(props.value)
  }
}
</script>

<style lang="scss" scoped>
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dropdown-item.is-disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Tree-like hierarchy for nested items */
.cat-dropdown-item-nested {
  padding-left: 2rem;
  position: relative;
}

/* Vertical line for each nested item - always full height */
.cat-dropdown-item-nested::before {
  content: '';
  position: absolute;
  left: 1rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: var(--bulma-border, #dbdbdb);
}

/* Horizontal branch connecting to the vertical trunk line */
.cat-dropdown-item-nested::after {
  content: '';
  position: absolute;
  left: 1rem;
  top: 50%;
  width: 0.5rem;
  height: 2px;
  background-color: var(--bulma-border, #dbdbdb);
  transform: translateY(-50%);
}
</style>
