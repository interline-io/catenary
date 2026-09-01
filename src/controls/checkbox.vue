<template>
  <label
    class="checkbox cat-checkbox"
    :class="checkboxClasses"
    v-bind="rootAttrs"
  >
    <input
      ref="inputRef"
      type="checkbox"
      :checked="isChecked"
      :disabled="disabled"
      :name="name"
      :value="value"
      :required="required"
      :aria-label="ariaLabel"
      v-bind="nativeAttrs"
      @change="handleChange"
    >
    <slot>{{ label }}</slot>
  </label>
</template>

<script setup lang="ts" generic="T extends boolean | string | number | any[] = boolean">
import { ref, watch, onMounted, computed, nextTick, useAttrs } from 'vue'
import { filterAttrs, isPresentationalAttr } from '../util/attrs'
import type { CheckboxVariant, CheckboxSize } from './types'

/**
 * Checkbox input component with v-model support.
 * Follows Bulma checkbox styling with indeterminate state support.
 *
 * @component cat-checkbox
 * @example
 * <cat-checkbox v-model="checked">Accept terms</cat-checkbox>
 * <cat-checkbox v-model="checked" disabled>Disabled option</cat-checkbox>
 * <cat-checkbox v-model="options" native-value="option1">Option 1</cat-checkbox>
 */

const props = withDefaults(defineProps<{
  /** Checkbox checked state (v-model). Type is inferred: boolean for single checkbox, array for checkbox groups. */
  modelValue?: T
  /** Value to add/remove from array when used with array binding. Required when modelValue is an array. */
  nativeValue?: T extends any[] ? T[number] : never
  /** Disable checkbox interaction. @default false */
  disabled?: boolean
  /** Show indeterminate state (visual only, for parent checkboxes). @default false */
  indeterminate?: boolean
  /** Label text (alternative to using default slot). */
  label?: string
  /** Color variant for the checkbox. */
  variant?: CheckboxVariant
  /** Size of the checkbox. */
  size?: CheckboxSize
  /** Accessible name, for a checkbox with no visible label -- a row selector in a table, say. */
  ariaLabel?: string
  /** `name` on the native input, for native form submission. */
  name?: string
  /** `value` on the native input, for native form submission. */
  value?: string
  /** Mark the checkbox required. */
  required?: boolean
  /** Value emitted when checked. Defaults to `true`. */
  trueValue?: T
  /** Value emitted when unchecked. Defaults to `false`. */
  falseValue?: T
}>(), {
  modelValue: undefined,
  nativeValue: undefined,
  disabled: false,
  indeterminate: false,
  label: undefined,
  variant: undefined,
  size: undefined,
  ariaLabel: undefined,
  name: undefined,
  value: undefined,
  required: false,
  trueValue: undefined,
  falseValue: undefined
})

defineOptions({ inheritAttrs: false })

/*
 * The root is the <label>, so undirected fallthrough attributes land there --
 * where `aria-label` and `aria-describedby` do nothing for the input's
 * accessible name. Route everything except class, style and listeners to the
 * input instead. The presentational three stay on the wrapper alone, which is
 * where they already applied: moving a consumer's spacing class onto the box
 * would shift the layout of every existing call site.
 */
const attrs = useAttrs()
const rootAttrs = computed(() => filterAttrs(attrs, isPresentationalAttr))
const nativeAttrs = computed(() => filterAttrs(attrs, key => !isPresentationalAttr(key)))

/**
 * Emitted when checkbox state changes.
 * @event update:modelValue
 */
const emit = defineEmits<{
  'update:modelValue': [value: T]
}>()

const inputRef = ref<HTMLInputElement | null>(null)

/*
 * `trueValue`/`falseValue` only take over when one of them is set. Comparing
 * `modelValue === trueValue` unconditionally would change behaviour for every
 * existing caller binding a truthy non-boolean, which today reads as checked.
 */
const usesCustomValues = computed(() => props.trueValue !== undefined || props.falseValue !== undefined)
const checkedValue = computed(() => (props.trueValue !== undefined ? props.trueValue : true))
const uncheckedValue = computed(() => (props.falseValue !== undefined ? props.falseValue : false))

const isChecked = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.nativeValue !== undefined && props.modelValue.includes(props.nativeValue)
  }
  if (usesCustomValues.value) return props.modelValue === checkedValue.value
  return Boolean(props.modelValue)
})

const checkboxClasses = computed(() => {
  const classes: string[] = []

  if (props.disabled) {
    classes.push('is-disabled')
  }

  if (props.variant) {
    classes.push(`is-${props.variant}`)
  }

  if (props.size) {
    classes.push(`is-${props.size}`)
  }

  return classes
})

function handleChange (event: Event) {
  const target = event.target as HTMLInputElement

  if (Array.isArray(props.modelValue)) {
    // Array binding mode
    const newValue = [...props.modelValue]
    if (target.checked) {
      // Add to array if not present
      if (!newValue.includes(props.nativeValue)) {
        newValue.push(props.nativeValue)
      }
    } else {
      // Remove from array
      const index = newValue.indexOf(props.nativeValue)
      if (index > -1) {
        newValue.splice(index, 1)
      }
    }
    emit('update:modelValue', newValue as T)
  } else if (usesCustomValues.value) {
    emit('update:modelValue', (target.checked ? checkedValue.value : uncheckedValue.value) as T)
  } else {
    // Boolean binding mode
    emit('update:modelValue', target.checked as T)
  }

  // The browser clears `.indeterminate` as soon as the box is clicked. If the
  // owner still says indeterminate -- a parent checkbox whose children have not
  // changed -- the DOM would silently disagree with the prop, and the mixed
  // state would be gone from the accessibility tree. Put it back once the
  // parent has had a chance to react to the emit above.
  nextTick(updateIndeterminate)
}

function updateIndeterminate () {
  if (inputRef.value) {
    inputRef.value.indeterminate = props.indeterminate
  }
}

// Update indeterminate state when prop changes
watch(() => props.indeterminate, updateIndeterminate)

// Set initial indeterminate state
onMounted(updateIndeterminate)
</script>

<style lang="scss" scoped>
/* Uses Bulma CSS custom properties to respect theme configuration */
.cat-checkbox {
  /* Add slight padding for better vertical alignment */
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  input[type="checkbox"] {
    flex-shrink: 0;
    appearance: none;
    -webkit-appearance: none;
    width: 1.125rem;
    height: 1.125rem;
    border: 2px solid var(--bulma-grey-light);
    border-radius: var(--bulma-radius);
    cursor: pointer;
    position: relative;
    transition: all 0.15s ease-in-out;

    &:hover {
      border-color: var(--bulma-grey);
    }

    &:checked {
      border-color: var(--bulma-grey-dark);
      background-color: var(--bulma-grey-dark);

      &::after {
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        width: 4px;
        height: 8px;
        border: solid var(--bulma-white);
        border-width: 0 2px 2px 0;
        transform: translate(-50%, -60%) rotate(45deg);
      }
    }

    &:indeterminate {
      border-color: var(--bulma-grey-dark);
      background-color: var(--bulma-grey-dark);

      &::after {
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        width: 8px;
        height: 2px;
        background-color: var(--bulma-white);
        transform: translate(-50%, -50%);
      }
    }
  }

  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Variant colors for checkbox */
  @each $name, $var in (
    "primary": "--bulma-primary",
    "link": "--bulma-link",
    "info": "--bulma-info",
    "success": "--bulma-success",
    "danger": "--bulma-danger"
  ) {
    &.is-#{$name} input[type="checkbox"]:checked,
    &.is-#{$name} input[type="checkbox"]:indeterminate {
      border-color: var(#{$var});
      background-color: var(#{$var});
    }
  }

  /* Warning variant needs dark checkmark for contrast */
  &.is-warning input[type="checkbox"]:checked,
  &.is-warning input[type="checkbox"]:indeterminate {
    border-color: var(--bulma-warning);
    background-color: var(--bulma-warning);

    &::after {
      border-color: rgba(0, 0, 0, 0.7);
      background-color: rgba(0, 0, 0, 0.7);
    }
  }

  /* Size variants */
  @each $name, $var, $box-size in (
    ("small", "--bulma-size-small", 0.875rem),
    ("medium", "--bulma-size-medium", 1.25rem),
    ("large", "--bulma-size-large", 1.5rem)
  ) {
    &.is-#{$name} {
      font-size: var(#{$var});

      input[type="checkbox"] {
        width: $box-size;
        height: $box-size;
      }
    }
  }
}
</style>
