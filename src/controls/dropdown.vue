<template>
  <div
    ref="dropdownRef"
    class="dropdown cat-dropdown"
    :class="dropdownClass"
  >
    <!-- Wrapper catches click + ArrowUp/ArrowDown so the trigger toggles whether
         it's the default <button> (click bubbles up) or a user-supplied #trigger.
         The default button intentionally has no @click handler — clicks bubble to
         the wrapper for a single toggle. Consumers who call `toggle()` from a
         #trigger slot's own handler should stop propagation to avoid double-firing. -->
    <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
    <div
      class="dropdown-trigger"
      @click="toggle"
      @keydown="onTriggerKeydown"
    >
      <slot name="trigger" :toggle="toggle" :is-active="isActive">
        <button
          ref="triggerButtonRef"
          class="button"
          :class="{ [`is-${props.buttonVariant}`]: props.buttonVariant }"
          type="button"
          :aria-haspopup="ariaHaspopup"
          :aria-controls="menuId"
          :aria-expanded="isActive"
        >
          <span v-if="iconLeft" class="icon is-small">
            <i :class="`mdi mdi-${iconLeft}`" aria-hidden="true" />
          </span>
          <span>{{ label }}</span>
          <span v-if="icon" class="icon is-small">
            <i :class="`mdi mdi-${icon}`" aria-hidden="true" />
          </span>
        </button>
      </slot>
    </div>
    <!-- Element has role="menu" or "listbox" via :role binding (rule can't see
         dynamic bindings). Items inside are focusable buttons with arrow / Home /
         End / Escape handling on the wrapper. -->
    <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
    <div
      :id="menuId"
      ref="menuRef"
      class="dropdown-menu"
      :role="menuRole"
      :aria-multiselectable="isMultiSelectListbox || undefined"
      :style="menuStyle"
      @keydown="onMenuKeydown"
    >
      <div class="dropdown-content">
        <slot :close="close" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, provide, useId, nextTick } from 'vue'
import { createTypeAhead } from '../util/type-ahead'

/**
 * Dropdown component using Bulma dropdown structure with WAI-ARIA keyboard support.
 *
 * Implements the menu-button pattern when `selectable` is false (default), or the
 * listbox-with-button pattern when `selectable` is true:
 * https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/
 * https://www.w3.org/WAI/ARIA/apg/patterns/listbox/
 *
 * Keyboard:
 *   - Enter/Space on the trigger: toggle the menu.
 *   - ArrowDown on the trigger: open and focus the first item.
 *   - ArrowUp on the trigger: open and focus the last item.
 *   - ArrowUp/ArrowDown inside the menu: navigate between items, wrapping at ends.
 *   - Home/End inside the menu: jump to first/last item.
 *   - Enter/Space inside the menu: activate the focused item.
 *   - Escape: close the menu and return focus to the trigger.
 *
 * @component cat-dropdown
 * @example
 * <cat-dropdown v-model="selected" selectable>
 *   <template #trigger>
 *     <button class="button">Select item</button>
 *   </template>
 *   <cat-dropdown-item value="1">Option 1</cat-dropdown-item>
 *   <cat-dropdown-item value="2">Option 2</cat-dropdown-item>
 * </cat-dropdown>
 */

interface Props {
  /**
   * Selected value(s) - use with v-model
   */
  modelValue?: any | any[]

  /**
   * Enable selection behavior (closes on item click)
   */
  selectable?: boolean

  /**
   * Allow multiple selections (value becomes array)
   */
  multiple?: boolean

  /**
   * Position of dropdown menu
   * @default 'bottom-left'
   */
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'

  /**
   * Keep dropdown open after selection (only with selectable)
   */
  inline?: boolean

  /**
   * Custom width for dropdown menu (in pixels)
   */
  width?: number

  /**
   * ARIA role for the menu container. Defaults to 'menu' for action menus
   * and 'listbox' when `selectable` is true.
   */
  ariaRole?: 'menu' | 'listbox' | string

  /**
   * Label shown in default trigger button
   */
  label?: string

  /**
   * Icon shown in default trigger button (after label)
   * @default 'menu-down'
   */
  icon?: string

  /**
   * Icon shown before the label in default trigger button
   */
  iconLeft?: string

  /**
   * Button variant for default trigger
   */
  buttonVariant?: import('./types').DropdownTriggerVariant

  /**
   * Color variant inherited by dropdown items
   */
  variant?: import('./types').DropdownTriggerVariant

  /**
   * Open dropdown on hover instead of click
   */
  hoverable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  selectable: false,
  multiple: false,
  position: 'bottom-left',
  inline: false,
  ariaRole: undefined,
  label: 'Select',
  icon: 'menu-down',
  iconLeft: undefined,
  buttonVariant: undefined,
  variant: undefined,
  hoverable: false
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
  'change': [value: any]
  'select': [value: any]
  'open': []
  'close': []
}>()

const dropdownRef = ref<HTMLElement | null>(null)
const triggerButtonRef = ref<HTMLButtonElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const isActive = ref(false)
const menuId = useId()

function focusableTrigger (): HTMLElement | null {
  // Prefer the default <button> we render; fall back to the first focusable
  // element inside the user-supplied #trigger slot (e.g., cat-input).
  if (triggerButtonRef.value) return triggerButtonRef.value
  const triggerWrapper = dropdownRef.value?.querySelector('.dropdown-trigger')
  if (!triggerWrapper) return null
  return triggerWrapper.querySelector<HTMLElement>(
    'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
}

const menuRole = computed(() => props.ariaRole ?? (props.selectable ? 'listbox' : 'menu'))
const ariaHaspopup = computed<'menu' | 'listbox'>(() => props.selectable ? 'listbox' : 'menu')
const isMultiSelectListbox = computed(() => menuRole.value === 'listbox' && props.multiple)

const dropdownClass = computed(() => ({
  'is-active': isActive.value,
  'is-hoverable': props.hoverable,
  [`is-${props.position}`]: props.position !== 'bottom-left'
}))

const menuStyle = computed(() => {
  if (props.width) {
    return { minWidth: `${props.width}px` }
  }
  return undefined
})

function focusableMenuItems (): HTMLElement[] {
  if (!menuRef.value) return []
  return Array.from(
    menuRef.value.querySelectorAll<HTMLElement>(
      '.dropdown-item:not(.is-disabled):not([aria-disabled="true"]):not(hr)'
    )
  )
}

function focusMenuItem (index: number) {
  const items = focusableMenuItems()
  if (items.length === 0) return
  const wrapped = ((index % items.length) + items.length) % items.length
  const target = items[wrapped]
  if (target) {
    target.focus()
  }
}

function toggle () {
  if (isActive.value) close()
  else open()
}

function open (focusIndex?: 'first' | 'last') {
  if (isActive.value && focusIndex === undefined) return
  isActive.value = true
  emit('open')
  if (focusIndex !== undefined) {
    nextTick(() => {
      focusMenuItem(focusIndex === 'first' ? 0 : focusableMenuItems().length - 1)
    })
  }
}

function close (returnFocus = true) {
  if (!isActive.value) return
  isActive.value = false
  emit('close')
  if (returnFocus) {
    nextTick(() => {
      focusableTrigger()?.focus()
    })
  }
}

function onTriggerKeydown (event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    open('first')
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    open('last')
  } else if (event.key === 'Escape' && isActive.value) {
    event.preventDefault()
    close()
  }
}

const typeAhead = createTypeAhead()

function onMenuKeydown (event: KeyboardEvent) {
  const items = focusableMenuItems()
  if (items.length === 0) return

  const currentIndex = items.findIndex(el => el === document.activeElement)

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    focusMenuItem((currentIndex < 0 ? 0 : currentIndex + 1))
    typeAhead.reset()
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    focusMenuItem(currentIndex < 0 ? items.length - 1 : currentIndex - 1)
    typeAhead.reset()
  } else if (event.key === 'Home') {
    event.preventDefault()
    focusMenuItem(0)
    typeAhead.reset()
  } else if (event.key === 'End') {
    event.preventDefault()
    focusMenuItem(items.length - 1)
    typeAhead.reset()
  } else if (event.key === 'Escape') {
    event.preventDefault()
    typeAhead.reset()
    close()
  } else if (event.key === 'Tab') {
    // Per WAI-ARIA: Tab from an open menu closes it and continues focus order.
    typeAhead.reset()
    close(false)
  } else if (typeAhead.isTypeAheadKey(event)) {
    // Type-ahead: jump focus to the next item whose visible text starts with
    // the buffered characters. Per APG Listbox / Menu patterns.
    event.preventDefault()
    const labels = items.map(el => (el.textContent ?? '').trim())
    const buf = typeAhead.appendChar(event.key)
    const startFrom = currentIndex < 0 ? -1 : currentIndex
    const matchIndex = typeAhead.findMatch(labels, buf, startFrom)
    if (matchIndex >= 0) focusMenuItem(matchIndex)
  }
}

function handleItemClick (value: any) {
  // Always emit select event for any item click
  emit('select', value)

  if (!props.selectable) {
    // Close dropdown even if not selectable (for action menus)
    if (!props.inline && !props.hoverable) {
      close()
    }
    return
  }

  if (props.multiple) {
    const currentValues = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const index = currentValues.indexOf(value)

    if (index >= 0) {
      currentValues.splice(index, 1)
    } else {
      currentValues.push(value)
    }

    emit('update:modelValue', currentValues)
    emit('change', currentValues)
  } else {
    emit('update:modelValue', value)
    emit('change', value)

    if (!props.inline) {
      close()
    }
  }
}

function handleClickOutside (event: MouseEvent) {
  if (isActive.value && dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    close(false)
  }
}

function handleEscape (event: KeyboardEvent) {
  if (event.key === 'Escape' && isActive.value) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})

// Provide context to child dropdown items
provide('dropdown', {
  handleItemClick,
  isMultiple: props.multiple,
  selectedValue: computed(() => props.modelValue),
  variant: computed(() => props.variant),
  isSelectable: props.selectable
})

defineExpose({ open, close, toggle })
</script>

<style scoped lang="scss">
/* Custom overrides using cat-dropdown class */
.cat-dropdown .dropdown-menu {
  min-width: 12rem;
}
</style>
