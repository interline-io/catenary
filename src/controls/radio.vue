<template>
  <label class="radio cat-radio" :class="radioClasses">
    <input
      type="radio"
      :checked="modelValue === nativeValue"
      :disabled="disabled"
      :name="groupName"
      :value="nativeValue"
      @change="handleChange"
    >
    <slot>{{ label }}</slot>
  </label>
</template>

<script setup lang="ts" generic="T extends string | number | boolean | null = string">
import { computed, inject, onMounted } from 'vue'
import { RadioGroupNameKey } from './types'
import type { RadioVariant, RadioSize } from './types'

/**
 * Radio button component using native HTML radio input with Bulma styling.
 * Type-safe with generic support for different value types.
 *
 * @component cat-radio
 * @example
 * <cat-radio v-model="selected" native-value="option1" name="choice">Option 1</cat-radio>
 * <cat-radio v-model="selected" native-value="option2" name="choice">Option 2</cat-radio>
 * <cat-radio v-model="count" :native-value="1" name="number">One</cat-radio>
 */

const props = withDefaults(defineProps<{
  /** The v-model value - should match nativeValue when this radio is selected */
  modelValue?: T
  /** The value this radio represents - what gets emitted when selected */
  nativeValue?: T
  /** The name attribute for the radio group - all radios in a group should have the same name */
  name?: string
  /** Whether the radio button is disabled */
  disabled?: boolean
  /** Color variant for the radio button */
  variant?: RadioVariant
  /** Size of the radio button */
  size?: RadioSize
  /** Label text (alternative to using default slot) */
  label?: string
}>(), {
  modelValue: undefined,
  nativeValue: undefined,
  name: undefined,
  disabled: false,
  variant: undefined,
  size: undefined,
  label: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: T]
}>()

const injectedGroupName = inject(RadioGroupNameKey, undefined)

/**
 * The `name` that groups this radio with its peers.
 *
 * Falls back to the one a wrapping <cat-fieldset radio-group> provides. Sharing a `v-model`
 * does not group radios — only a shared `name` does — so without either, each
 * radio is a group of one: arrow keys do not move between them, each is its
 * own tab stop, and a screen reader announces "1 of 1". A mouse user sees
 * nothing wrong, which is why it goes unnoticed.
 */
const groupName = computed(() => props.name ?? injectedGroupName?.value)

/*
 * Bare `process.env.NODE_ENV`, deliberately not wrapped in a `typeof process`
 * check. Bundlers replace this expression textually, so the whole block is
 * eliminated from a production build. Guarding it with `typeof process` instead
 * leaves a *runtime* test behind that no bundler can fold away, and `process`
 * is undefined in every browser — so `typeof process === 'undefined' || ...`
 * warns in production, and `typeof process !== 'undefined' && ...` never warns
 * at all. Vue itself ships the bare form for the same reason.
 */
if (process.env.NODE_ENV !== 'production') {
  // On mount, not during setup: this way it does not fire on the server for
  // every SSR render, and a `name` bound to a value that resolves during setup
  // has settled by the time we look.
  onMounted(() => {
    if (groupName.value) return
    console.warn(
      '[catenary] <cat-radio> has no `name`, so it forms a radio group of its '
      + 'own: arrow keys will not move between it and its peers, each is a '
      + 'separate tab stop, and a screen reader will announce it as "1 of 1". '
      + 'Give every radio in a group the same `name`, or wrap the group in '
      + '<cat-fieldset radio-group>.'
    )
  })
}

const radioClasses = computed(() => {
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

function handleChange () {
  if (!props.disabled && props.nativeValue !== undefined) {
    emit('update:modelValue', props.nativeValue)
  }
}
</script>

<style lang="scss" scoped>
.cat-radio {
  cursor: pointer;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  margin-right: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  input[type="radio"] {
    flex-shrink: 0;
    appearance: none;
    -webkit-appearance: none;
    width: 1.125rem;
    height: 1.125rem;
    border: 2px solid var(--bulma-grey-light);
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    transition: all 0.15s ease-in-out;

    &:hover {
      border-color: var(--bulma-grey);
    }

    &:checked {
      border-color: var(--bulma-grey-dark);
      background-color: transparent;

      &::after {
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: var(--bulma-grey-dark);
        transform: translate(-50%, -50%);
      }
    }
  }

  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Variant colors for radio */
  @each $name, $var in (
    "primary": "--bulma-primary",
    "link": "--bulma-link",
    "info": "--bulma-info",
    "success": "--bulma-success",
    "warning": "--bulma-warning",
    "danger": "--bulma-danger"
  ) {
    &.is-#{$name} input[type="radio"]:checked {
      border-color: var(#{$var});

      &::after {
        background-color: var(#{$var});
      }
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

      input[type="radio"] {
        width: $box-size;
        height: $box-size;
      }
    }
  }
}
</style>
