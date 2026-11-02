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
          :id="triggerId"
          ref="triggerButtonRef"
          class="button"
          :class="{
            [`is-${props.buttonVariant}`]: props.buttonVariant,
            'is-active': isActive,
            'cat-dropdown-caret': isCaretIcon(icon),
          }"
          type="button"
          v-bind="triggerAttrs"
        >
          <span v-if="iconLeft" class="icon is-small">
            <icon-glyph :name="iconLeft" />
          </span>
          <span>{{ label }}</span>
          <span v-if="icon" class="icon is-small">
            <icon-glyph :name="icon" />
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
      :aria-labelledby="menuLabelledBy"
      :data-side="menuSide"
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
import { ref, computed, provide, inject, useId, nextTick, onMounted, watch } from 'vue'
import { createTypeAhead } from '../util/type-ahead'
import { useDismissablePopup } from '../util/dismissable-popup'
import { useAnchoredPopover } from '../util/anchored-popover'
import { DropdownAnchorKey, isCaretIcon } from '../util/dropdown'
import IconGlyph from './icon-glyph.vue'

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
 * It also exposes `isActive`: bind it to Bulma's `is-active` on a `.button`
 * trigger so the trigger shows it is open, as the default trigger does. Give
 * a custom trigger an `id` too: the menu takes its accessible name from it
 * through aria-labelledby, which a `selectable` listbox requires.
 *
 * The menu is at least as wide as its trigger, and Bulma's
 * `--bulma-dropdown-content-offset` sets the gap between them.
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
const triggerId = `${menuId}-trigger`

// The menu's accessible name, from its trigger. The APG listbox-button
// pattern requires it (an unnamed role="listbox" is an axe
// aria-input-field-name violation), and the menu-button pattern recommends
// it. The default trigger carries `triggerId`; a custom #trigger is
// referenced by whatever id its focusable element already has (cat-field
// may have given an input one for its <label>, so it is not overwritten).
// Read from the DOM, so refreshed as the menu opens, which is the only time
// assistive technology can reach it.
const menuLabelledBy = ref<string | undefined>(undefined)
function resolveMenuLabel () {
  menuLabelledBy.value = focusableTrigger()?.id || undefined
}
onMounted(resolveMenuLabel)
watch(isActive, (open) => {
  if (open) resolveMenuLabel()
})

function focusableTrigger (): HTMLElement | null {
  // Prefer the default <button> we render; fall back to the first focusable
  // element inside the user-supplied #trigger slot (e.g., cat-input).
  if (triggerButtonRef.value) return triggerButtonRef.value
  const triggerWrapper = dropdownRef.value?.querySelector('.dropdown-trigger')
  if (!triggerWrapper) return null
  // Skip disabled elements: .focus() silently no-ops on one, so returning it
  // strands focus where it was rather than restoring it. Where the trigger
  // holds more than one focusable element (cat-datepicker's input plus its
  // calendar button), skipping means the next one gets focus instead.
  //
  // `:disabled`, not `[disabled]`: the pseudo-class also matches a control
  // disabled by an ancestor `<fieldset disabled>`, which is exactly what
  // cat-fieldset renders. Anchors are exempt — a fieldset does not disable
  // them, and they take no disabled attribute.
  return triggerWrapper.querySelector<HTMLElement>(
    'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), '
    + 'textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
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

// Bulma names the non-default placements `is-right` and `is-up`, not
// `is-bottom-right` / `is-top-left`. The interpolated form emitted a class
// Bulma has no rule for, so the CSS fallback always rendered bottom-left.
// Matches what cat-datepicker already does.
//
// These classes are bound unconditionally, so Bulma's placement rules apply in
// the Popover API path too, where useAnchoredPopover sets the coordinates
// itself. The `[popover]` reset in this file's style block is scoped to
// out-specify them there; see the comment above it.
const dropdownClass = computed(() => ({
  'is-active': isActive.value,
  'is-hoverable': props.hoverable,
  'is-right': props.position === 'bottom-right' || props.position === 'top-right',
  'is-up': props.position === 'top-left' || props.position === 'top-right'
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
  // Only on the closed -> open transition. A focusIndex call is allowed
  // through the guard above so the keyboard can move focus into an already
  // open menu (click the trigger, then ArrowDown), which must not read as a
  // second open to a consumer counting the event or lazy-loading on it.
  const wasActive = isActive.value
  isActive.value = true
  if (!wasActive) emit('open')
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

// What the menu is placed against and sized to: the dropdown's own root,
// unless a parent supplies the control the user actually sees (see
// DropdownAnchorKey). Re-provided as null so a dropdown nested in this menu
// does not inherit it.
const injectedAnchor = inject(DropdownAnchorKey, null)
provide(DropdownAnchorKey, null)
const anchorRef = computed(() => injectedAnchor?.value ?? dropdownRef.value)

// Render the menu in the top layer so it is not clipped by a scrollable
// ancestor (e.g. a modal body). No-op without the Popover API; the absolute
// positioning below is the fallback.
//
// `gap: 0` because the gap is the menu's own transparent padding, Bulma's
// --bulma-dropdown-content-offset, put on the trigger's side by `data-side`
// in the style block. Adding the composable's gap on top doubled it to 8px.
const { placed } = useAnchoredPopover({
  triggerRef: anchorRef,
  popoverRef: menuRef,
  isOpen: () => isActive.value,
  placement: () => props.position,
  gap: 0
})

// Which side of the trigger the menu is on: where it was last placed, which
// can differ from `position` when there was no room there, else `position`.
// Drives the gap's side and the direction the menu enters from.
const menuSide = computed((): 'top' | 'bottom' => {
  const side = placed.value?.side
  if (side === 'top' || side === 'bottom') return side
  return props.position.startsWith('top') ? 'top' : 'bottom'
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
/* The menu's surface. Bulma's own is white on what is usually a white page,
   edged only by a 2%-alpha ring, and in the dark scheme it is the page color
   exactly (rgb(20,22,26) for menu, card and body alike), so an open menu read
   as loose text rather than a panel opened from its trigger.

   Set through Bulma's dropdown tokens rather than over them, so a consumer
   can still restyle the menu the Bulma way. */
.cat-dropdown {
  /* Lift the surface off the page. Bulma's dark scheme raises its
     `scheme-main-ter` 4% above `scheme-main`, the light scheme has nowhere to
     go above white: one expression covers both, white in light and 13% in
     dark, with no theme selector. It is a lightness rather than a color
     because Bulma paints each `button.dropdown-item` from
     --bulma-dropdown-item-background-l, not from the panel: setting only the
     panel color left a dark tile behind every item. Both read the one value,
     so they match, and Bulma's hover delta still applies on top. */
  --bulma-dropdown-item-background-l: min(100%, calc(var(--bulma-scheme-main-l) + 4%));
  --bulma-dropdown-content-background-color: hsl(
    var(--bulma-scheme-h),
    var(--bulma-scheme-s),
    var(--bulma-dropdown-item-background-l)
  );

  /* Deliberately dark in both schemes: a shadow darkens what is under it.
     Bulma's dark scheme makes --bulma-shadow white, which draws a glow rather
     than elevation. Taken from the scheme's own hue, at Bulma's black. */
  --bulma-dropdown-content-shadow:
    0 0.125rem 0.25rem hsla(var(--bulma-scheme-h), var(--bulma-scheme-s), 4%, 0.08),
    0 0.75rem 1.5rem -0.25rem hsla(var(--bulma-scheme-h), var(--bulma-scheme-s), 4%, 0.24);

  /* Inset items, as the menu's highlight is drawn inside its edge. */
  --bulma-dropdown-content-padding-top: 0.25rem;
  --bulma-dropdown-content-padding-bottom: 0.25rem;

  /* Where the menu grows from: the trigger's edge it is aligned to. */
  --cat-dropdown-origin-x: left;

  &.is-right {
    --cat-dropdown-origin-x: right;
  }
}

/* At least as wide as the control that opened it, so the two read as one:
   a split button's menu spans the whole button group, a listbox's its
   trigger. useAnchoredPopover measures the anchor. The `width` prop, set
   inline, still overrides this. */
.cat-dropdown .dropdown-menu {
  min-width: max(var(--bulma-dropdown-menu-min-width), var(--cat-popover-anchor-width, 0px));

  /* The menu slides in from its trigger's side, so it reads as coming out of
     it. Flipped with the side the menu actually landed on. */
  --cat-dropdown-origin-y: top;
  --cat-dropdown-enter-y: -0.25rem;

  &[data-side="top"] {
    --cat-dropdown-origin-y: bottom;
    --cat-dropdown-enter-y: 0.25rem;
  }
}

/* An edge. Not required by WCAG 1.4.11, since the menu's items are identified
   by their text rather than by the panel's boundary, but it is what makes the
   panel distinct from a white card behind it in light, and from the page in
   dark, where a shadow barely shows. */
.cat-dropdown .dropdown-content {
  /* Keep weak text legible on the lifted surface. Bulma's dark text-weak is
     4.63:1 on its page and fell to 4.20:1 on the 13% surface, under the
     4.5:1 WCAG 1.4.3 asks of the hint lines a menu item often carries.

     Raised by twice the lift, to 61%: 5.55:1 on the surface and 4.74:1 on a
     hovered item, while still reading as weaker than body text. The clamp
     confines that to a dark scheme: its upper bound is zero wherever the
     surface did not move (Bulma's white light scheme), and its lower bound is
     zero for any light scheme, where lightening dark text would cost
     contrast rather than restore it. A custom off-white light scheme lifts
     the surface but keeps its text.

     Redefined whole, not by its `-l` part: Bulma resolves --bulma-text-weak
     once on :root, so a lightness set here would never reach it. */
  --bulma-text-weak: hsl(
    var(--bulma-text-h),
    var(--bulma-text-s),
    calc(var(--bulma-text-weak-l) + clamp(
      0%,
      (50% - var(--bulma-scheme-main-l)) * 100,
      2 * (var(--bulma-dropdown-item-background-l) - var(--bulma-scheme-main-l))
    ))
  );

  border: 1px solid var(--bulma-border);
  padding-inline: 0.25rem;
  transform-origin: var(--cat-dropdown-origin-x) var(--cat-dropdown-origin-y);
  /* Restarts each time the menu goes from display: none to shown, in the
     Popover API path and the fallback alike, so no @starting-style. There is
     no exit animation: the menu hides at once. */
  animation: cat-dropdown-enter 120ms ease-out;
}

@keyframes cat-dropdown-enter {
  from {
    opacity: 0;
    transform: translateY(var(--cat-dropdown-enter-y)) scale(0.97);
  }
}

/* Rounded highlights, held off the panel's edge by its padding above. */
.cat-dropdown .dropdown-content :deep(.dropdown-item) {
  border-radius: var(--bulma-radius-small);
}

/* The divider spans the whole panel, through the padding the items sit in. */
.cat-dropdown .dropdown-content :deep(.dropdown-divider) {
  margin-inline: -0.25rem;
}

/* A disclosure caret turns over while its menu is open (WAI-ARIA state is
   on aria-expanded; this is its visible counterpart, alongside the trigger's
   Bulma `is-active`). Only a caret icon is flipped, by isCaretIcon(). */
.cat-dropdown .dropdown-trigger :deep(.cat-dropdown-caret > .icon:last-child) {
  transition: transform 150ms ease-out;
}

.cat-dropdown .dropdown-trigger :deep(.cat-dropdown-caret[aria-expanded="true"] > .icon:last-child) {
  transform: rotate(180deg);
}

/* Matches cat-collapse, cat-steps, cat-msg and cat-tooltip. */
@media (prefers-reduced-motion: reduce) {
  .cat-dropdown .dropdown-content {
    animation: none;
  }

  .cat-dropdown .dropdown-trigger :deep(.cat-dropdown-caret > .icon:last-child) {
    transition: none;
  }
}

/* Top-layer rendering (Popover API): the menu is shown via showPopover() with
   fixed coordinates set inline, so neutralize Bulma's absolute positioning and
   keep the is-active display rule from also showing a clipped copy.

   The UA stylesheet's `[popover]` rule brings more than positioning, and Bulma
   overrides none of it on .dropdown-menu:
     - `border: solid` — a medium currentColor border, i.e. a black box around
       the whole menu.
     - `padding: 0.25em` — Bulma sets only padding-top (the offset between
       trigger and content), so the other three sides survive. Cleared on all
       four, then the offset is put back on whichever side faces the trigger,
       per `data-side`: Bulma's rule only knows the side `position` asked for,
       not the one the menu flipped to.
     - `background-color: Canvas` — .dropdown-menu has no background of its own
       in Bulma; .dropdown-content inside it does. An opaque Canvas backdrop
       therefore shows through the padding-top gap and behind the content's
       rounded corners.
     - `color: CanvasText` — the one that actually hurts. Bulma sets no
       `color-scheme`, so system colors resolve light and CanvasText is black
       whatever the theme. Anything in the menu without a color of its own
       inherits it, so in dark mode it rendered black on Bulma's dark
       .dropdown-content. Measured: page color rgb(171,177,191), menu color
       rgb(0,0,0).
   `overflow: auto` is deliberately left alone: a long menu needs to scroll.
   It does clip the .dropdown-content shadow to the menu's own box, though,
   which hid the shadow below and beside the panel and squared off its
   corners. So in this path the shadow is a `filter: drop-shadow()` on the
   menu instead: a filter paints outside the element's overflow clip, and
   follows the rounded panel rather than the transparent gap. The fallback
   path has no clip and keeps the box-shadow.

   Scoped to `.cat-dropdown` purely for specificity. Bulma's placement rules
   (`.dropdown.is-right .dropdown-menu { right: 0 }`, `.dropdown.is-up
   .dropdown-menu { bottom: 100% }`) are (0,3,0), exactly what this rule scores
   with its scope attribute — and `bulma` is a peerDependency the consumer
   imports separately, so which one wins would otherwise come down to their
   stylesheet order. The extra class makes this reset (0,4,0) and settles it. */
.cat-dropdown .dropdown-menu[popover] {
  position: fixed;
  margin: 0;
  inset: auto;
  border: 0;
  padding: 0;
  background: transparent;
  color: inherit;
  /* The same two layers as --bulma-dropdown-content-shadow; drop-shadow()
     takes no spread, so the second is drawn a little tighter instead. */
  filter:
    drop-shadow(0 0.125rem 0.25rem hsla(var(--bulma-scheme-h), var(--bulma-scheme-s), 4%, 0.08))
    drop-shadow(0 0.5rem 1rem hsla(var(--bulma-scheme-h), var(--bulma-scheme-s), 4%, 0.2));

  .dropdown-content {
    box-shadow: none;
  }

  &[data-side="bottom"] {
    padding-top: var(--bulma-dropdown-content-offset);
  }

  &[data-side="top"] {
    padding-bottom: var(--bulma-dropdown-content-offset);
  }

  &:not(:popover-open) {
    display: none;
  }

  &:popover-open {
    display: block;
  }
}
</style>
