<template>
  <div
    class="buttons has-addons cat-split-button"
    :class="[rootClasses, $attrs.class]"
    :style="rootStyle"
  >
    <cat-button
      class="cat-split-button-action"
      v-bind="actionAttrs"
      :variant="variant"
      :size="size"
      :loading="loading"
      :disabled="disabled"
      :outlined="outlined"
      :inverted="inverted"
      :icon-left="iconLeft"
      :label="label"
      :type="type"
      :aria-label="ariaLabel"
      :title="title"
      @click="emit('click', $event)"
    >
      <template v-if="$slots.label" #default>
        <slot name="label" />
      </template>
    </cat-button>
    <cat-dropdown
      ref="dropdownRef"
      :position="position"
      :width="menuWidth"
      @select="emit('select', $event)"
      @open="emit('open')"
      @close="emit('close')"
    >
      <template #trigger="{ triggerAttrs }">
        <cat-button
          class="cat-split-button-toggle"
          :variant="variant"
          :size="size"
          :disabled="disabled || toggleDisabled"
          :outlined="outlined"
          :inverted="inverted"
          :icon="toggleIcon"
          :aria-label="toggleAriaLabel"
          v-bind="triggerAttrs"
        />
      </template>
      <template #default="{ close }">
        <slot :close="close" />
      </template>
    </cat-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs, useSlots, useTemplateRef } from 'vue'
import type { StyleValue } from 'vue'
import type { ButtonVariant, ButtonSize } from './types'
import CatButton from './button.vue'
import CatDropdown from './dropdown.vue'

/**
 * Split button — a primary action button with an attached dropdown of
 * secondary actions, joined into one control.
 *
 * Bulma has no split button: `.buttons.has-addons` joins adjacent `.button`
 * siblings, but a dropdown trigger is nested inside `.dropdown-trigger`, so
 * the corner and border rules never reach it. The style block below supplies
 * that missing geometry.
 *
 * The two halves are separately focusable, per the WAI-ARIA menu button
 * pattern: the action fires on Enter/Space, and the caret opens the menu
 * (cat-dropdown handles the arrow-key, type-ahead, and Escape behavior).
 * Because the caret has no text, it needs its own accessible name — see
 * `toggleLabel`.
 *
 * @component cat-split-button
 * @example
 * <cat-split-button label="Save" variant="primary" @click="save" @select="onSelect">
 *   <cat-dropdown-item value="draft">Save as draft</cat-dropdown-item>
 *   <cat-dropdown-item value="copy">Save a copy</cat-dropdown-item>
 * </cat-split-button>
 */

// Fallthrough attributes are routed by hand below: to the action button,
// except class/style which stay on the wrapper.
defineOptions({
  inheritAttrs: false
})

interface Props {
  /**
   * Action button label (alternative to the `label` slot).
   */
  label?: string

  /**
   * Color variant, applied to both halves so they read as one control.
   */
  variant?: ButtonVariant

  /**
   * Size, applied to both halves.
   * @default undefined (normal size)
   */
  size?: ButtonSize

  /**
   * Show a loading spinner on the action half. The dropdown stays usable.
   * @default false
   */
  loading?: boolean

  /**
   * Disable both halves.
   * @default false
   */
  disabled?: boolean

  /**
   * Disable only the dropdown half, leaving the action clickable.
   * @default false
   */
  toggleDisabled?: boolean

  /**
   * Use outlined button style for both halves.
   * @default false
   */
  outlined?: boolean

  /**
   * Use inverted button style for both halves (for dark backgrounds).
   * @default false
   */
  inverted?: boolean

  /**
   * Stretch to the container width. The action half takes the leftover space;
   * the caret stays at its natural width.
   * @default false
   */
  fullwidth?: boolean

  /**
   * Icon shown before the action label.
   */
  iconLeft?: string

  /**
   * HTML button type for the action half.
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset'

  /**
   * Icon for the dropdown half.
   * @default 'menu-down'
   */
  toggleIcon?: string

  /**
   * Accessible name for the dropdown half, which renders only a caret.
   * Defaults to "More <label> options" so several split buttons on a page are
   * distinguishable; set it explicitly when the action has no `label` prop
   * (e.g. content comes from the `label` slot).
   */
  toggleLabel?: string

  /**
   * Accessible name for the action half, when its visible text is not enough.
   */
  ariaLabel?: string

  /**
   * Advisory text (native tooltip) for the action half.
   */
  title?: string

  /**
   * Menu placement relative to the caret. Defaults to right-aligned so the
   * menu lines up with the right edge of the whole control rather than
   * hanging off the caret.
   * @default 'bottom-right'
   */
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'

  /**
   * Minimum width of the dropdown menu, in pixels.
   */
  menuWidth?: number
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  variant: undefined,
  size: undefined,
  loading: false,
  disabled: false,
  toggleDisabled: false,
  outlined: false,
  inverted: false,
  fullwidth: false,
  iconLeft: undefined,
  type: 'button',
  toggleIcon: 'menu-down',
  toggleLabel: undefined,
  ariaLabel: undefined,
  title: undefined,
  position: 'bottom-right',
  menuWidth: undefined
})

const emit = defineEmits<{
  /** Action half was clicked. */
  click: [event: MouseEvent]
  /** A dropdown item was activated; payload is the item's `value`. */
  select: [value: any]
  /** Menu opened. */
  open: []
  /** Menu closed. */
  close: []
}>()

const dropdownRef = useTemplateRef<InstanceType<typeof CatDropdown>>('dropdownRef')
const attrs = useAttrs()
const slots = useSlots()

// Fallthrough attributes belong on the action button, not the wrapper: `form`,
// `id`, `aria-describedby` and friends are meaningless on a non-interactive
// div, and a stray `tabindex` there would insert a phantom tab stop ahead of
// both real buttons. `class` and `style` are the exception — they describe the
// control as a whole, so they stay on the root.
const actionAttrs = computed(() => {
  const forwarded: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(attrs)) {
    if (key !== 'class' && key !== 'style') forwarded[key] = value
  }
  return forwarded
})

const rootStyle = computed(() => attrs.style as StyleValue | undefined)

const toggleAriaLabel = computed((): string => {
  if (props.toggleLabel) return props.toggleLabel
  // Deriving the name from `label` keeps several split buttons on a page
  // distinguishable, but only while `label` is what is actually on screen:
  // naming the caret after a prop the `label` slot has replaced would put text
  // in the accessible name that the user cannot see (WCAG 2.5.3 Label in Name).
  if (props.label && !slots.label) return `More ${props.label} options`
  return 'More options'
})

const rootClasses = computed(() => ({
  'cat-split-button-fullwidth': props.fullwidth
}))

// The caret is the menu's only trigger, so a disabled caret has to gate the
// programmatic entry points too. Opening past it would leave an expanded popup
// announced against a disabled control, and the matching close() would try to
// return focus to an unfocusable button and drop it to <body> instead.
const menuDisabled = computed((): boolean => props.disabled || props.toggleDisabled)

defineExpose({
  /** Open the menu, optionally moving focus into it. No-op while the caret is disabled. */
  open: (focusIndex?: 'first' | 'last' | 'selected') => {
    if (!menuDisabled.value) dropdownRef.value?.open(focusIndex)
  },
  /** Close the menu. Pass false to leave focus where it is. */
  close: (returnFocus?: boolean) => dropdownRef.value?.close(returnFocus),
  /** Toggle the menu. No-op while the caret is disabled. */
  toggle: () => {
    if (!menuDisabled.value) dropdownRef.value?.toggle()
  }
})
</script>

<style lang="scss" scoped>
/**
 * Bulma's `.buttons.has-addons` squares the facing corners of adjacent
 * `.button` siblings and pulls them together by 1px. Neither half qualifies
 * here: cat-button wraps its <button> in `.control`, and cat-dropdown wraps
 * the trigger in `.dropdown > .dropdown-trigger`, so each <button> is the
 * only child of its own parent and matches both `:first-child` and
 * `:last-child`. Restate the geometry against our own classes.
 *
 * `:deep()` because both <button> elements are rendered by cat-button and so
 * carry its scope id, not this component's.
 */
.cat-split-button {
  // `.buttons` is a block-level container for a *list* of buttons: it claims a
  // whole row and carries block spacing below it. This component is a single
  // control, so shrink-wrap it and drop the spacing — it then sits inline like
  // a plain <button>, and still lays out correctly as a flex item inside a
  // `.buttons` toolbar.
  display: inline-flex;
  vertical-align: top;
  flex-wrap: nowrap;

  // `.buttons` also inherits Bulma's %block spacing, which would leave a
  // split button sitting 1.5rem proud of anything beside it. A bare
  // `margin-bottom: 0` ties Bulma's `.buttons:not(:last-child)` on
  // specificity and loses on stylesheet order, so mirror that selector.
  &:not(:last-child) {
    margin-bottom: 0;
  }

  // Collapse the doubled border between the halves, as Bulma does for adjacent
  // .button siblings. This sits on cat-button's `.control` wrapper rather than
  // on the <button>, because the wrapper is the flex item: under `fullwidth`,
  // where flex distribution sizes the wrapper and `width: 100%` pins the button
  // to it, a negative margin on the button has no layout effect at all and the
  // join renders at double thickness.
  > :deep(.control) {
    margin-inline-end: -1px;
  }

  :deep(.cat-split-button-action) {
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }

  :deep(.cat-split-button-toggle) {
    border-start-start-radius: 0;
    border-end-start-radius: 0;
  }

  /**
   * The filled variants register `--bulma-button-border-width: 0`, so with no
   * border to collapse the two halves render as one unbroken block of color
   * and the split is invisible. Draw the seam from the button's own text
   * color, which tracks both the variant and the light/dark scheme —
   * `is-white` and `is-light` get a dark seam, `is-primary` a light one.
   *
   * `is-inverted` is deliberately NOT excluded: Bulma sets only background and
   * color there, so an inverted button has no border either and needs the seam
   * just as much. Only `is-outlined` restores a real border. `is-text` and
   * `is-ghost` are absent because they have no fill for a seam to divide.
   *
   * Opacity is set for WCAG 1.4.11 (3:1 non-text contrast): on a filled
   * variant the seam is the only thing identifying this as two independently
   * actionable controls, so it has to be discernible rather than tasteful.
   */
  :deep(.cat-split-button-toggle:is(
    .is-primary, .is-link, .is-info, .is-success,
    .is-warning, .is-danger, .is-white, .is-light, .is-dark
  ):not(.is-outlined))::before {
    content: '';
    // Bulma's control mixin already makes every .button position: relative,
    // which is the containing block this needs.
    position: absolute;
    inset-block: 0.25em;
    inset-inline-start: 0;
    width: 1px;
    background-color: currentcolor;
    opacity: 0.6;
    pointer-events: none;
  }

  &.cat-split-button-fullwidth {
    display: flex;
    width: 100%;

    // cat-button's `.control` wrapper is the flex item, so the growth has to
    // go there and the <button> inside has to fill it. No `min-width: 0`: it
    // would let the wrapper shrink under a long label, which Bulma keeps at
    // `white-space: nowrap`, hard-clipping it mid-word behind the caret.
    > :deep(.control) {
      flex: 1 1 auto;
    }

    :deep(.cat-split-button-action) {
      width: 100%;
    }
  }
}
</style>
