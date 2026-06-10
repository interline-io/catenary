<template>
  <div
    ref="dropdownRef"
    class="dropdown cat-dropdown"
    :class="dropdownClass"
    @focusout="onFocusOut"
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
      <slot
        name="trigger"
        :toggle="toggle"
        :is-active="isActive"
        :trigger-attrs="triggerAttrs"
      >
        <button
          ref="triggerButtonRef"
          class="button"
          :class="{ [`is-${props.buttonVariant}`]: props.buttonVariant }"
          type="button"
          v-bind="triggerAttrs"
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
import { ref, computed, provide, useId, nextTick } from 'vue'
import { createTypeAhead } from '../util/type-ahead'
import { useDismissablePopup } from '../util/dismissable-popup'

/**
 * Dropdown component using Bulma dropdown structure with WAI-ARIA keyboard support.
 *
 * Implements the menu-button pattern when `selectable` is false (default), or the
 * listbox-with-button pattern when `selectable` is true:
 * https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/
 * https://www.w3.org/WAI/ARIA/apg/patterns/listbox/
 *
 * Keyboard:
 *   - Enter/Space on the trigger: toggle the menu; opening places focus on the
 *     first item (or the selected option in listbox mode).
 *   - ArrowDown on the trigger: open and focus the first item (or the selected
 *     option in listbox mode).
 *   - ArrowUp on the trigger: open and focus the last item.
 *   - ArrowUp/ArrowDown inside the menu: navigate between items, wrapping at ends.
 *   - Home/End inside the menu: jump to first/last item.
 *   - Enter/Space inside the menu: activate the focused item.
 *   - Escape: close the menu and return focus to the trigger.
 *   - Tab out of the component: close the menu without moving focus.
 *
 * Custom triggers: the #trigger slot exposes `triggerAttrs` (aria-haspopup,
 * aria-controls, aria-expanded), which must be spread onto the focusable
 * trigger element so assistive technology can discover and track the popup.
 *
 * @component cat-dropdown
 * @example
 * <cat-dropdown v-model="selected" selectable>
 *   <template #trigger="{ triggerAttrs }">
 *     <button class="button" type="button" v-bind="triggerAttrs">Select item</button>
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
// Open state, exposed as `v-model:open` so a parent can both control and
// observe it (e.g. cat-datepicker closing on selection). With no binding it
// behaves as a plain local ref — defineModel falls back to its default — so
// existing uncontrolled usage is unchanged. The `open`/`close` events and the
// exposed open()/close()/toggle() remain for backward compatibility.
const isActive = defineModel<boolean>('open', { default: false })
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

// Popup semantics for the trigger element. The default button binds these
// itself; a custom #trigger slot must spread them onto its focusable element
// (v-bind="triggerAttrs") or assistive technology has no way to know the
// trigger opens a popup, or whether it is expanded.
const triggerAttrs = computed(() => ({
  'aria-haspopup': ariaHaspopup.value,
  'aria-controls': menuId,
  'aria-expanded': isActive.value
}))

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

function open (focusIndex?: 'first' | 'last' | 'selected') {
  if (isActive.value && focusIndex === undefined) return
  isActive.value = true
  emit('open')
  if (focusIndex !== undefined) {
    nextTick(() => {
      const items = focusableMenuItems()
      if (items.length === 0) return
      if (focusIndex === 'last') {
        focusMenuItem(items.length - 1)
        return
      }
      // 'selected' lands on the current selection per the APG listbox-button
      // pattern (the first selected option wins under `multiple`), falling
      // back to the first item when nothing is selected.
      let index = 0
      if (focusIndex === 'selected') {
        const selected = items.findIndex(el => el.getAttribute('aria-selected') === 'true')
        if (selected >= 0) index = selected
      }
      focusMenuItem(index)
    })
  }
}

// Focus target when the keyboard opens the popup: the selected option for a
// listbox, the first item for a menu.
function openFocusTarget (): 'first' | 'selected' {
  return menuRole.value === 'listbox' ? 'selected' : 'first'
}

const typeAhead = createTypeAhead()

function close (returnFocus = true) {
  if (!isActive.value) return
  isActive.value = false
  // Clear any in-flight type-ahead buffer so the next open starts fresh.
  // Without this, characters typed before the menu closed (via item click,
  // outside click, or document Escape) leak into the next session.
  typeAhead.reset()
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
    open(openFocusTarget())
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    open('last')
  } else if (event.key === 'Enter' || event.key === ' ') {
    // Form fields inside a custom #trigger keep their native Enter/Space
    // (typing in inputs/textareas, opening a select's option picker).
    const target = event.target as HTMLElement
    if (target.closest('input, textarea, select, [contenteditable="true"]')) return
    // preventDefault suppresses the trigger's synthetic click (Enter fires
    // click on keydown, Space on keyup), which would bubble to the wrapper's
    // @click and toggle a second time. Per the APG menu-button pattern,
    // opening via keyboard moves focus into the popup.
    event.preventDefault()
    if (isActive.value) {
      close()
    } else {
      open(openFocusTarget())
    }
  } else if (event.key === 'Escape' && isActive.value) {
    event.preventDefault()
    close()
  }
}

// Close (without stealing focus) when keyboard focus leaves the component
// entirely, e.g. Tab from a still-focused trigger while the menu is open.
// Without this the menu lingers with aria-expanded="true", and a later
// document-level Escape would yank focus back to the trigger. Only act on a
// Node relatedTarget: null means focus left the document (window blur),
// which the outside-click handler already covers, and contains() throws on
// non-Node EventTargets from synthetic events.
function onFocusOut (event: FocusEvent) {
  if (!isActive.value) return
  const next = event.relatedTarget
  if (!(next instanceof Node)) return
  if (dropdownRef.value && !dropdownRef.value.contains(next)) {
    close(false)
  }
}

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

useDismissablePopup({
  rootRef: dropdownRef,
  isOpen: () => isActive.value,
  onClickOutside: () => close(false),
  onEscape: () => close()
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
