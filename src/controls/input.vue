<template>
  <div class="control" :class="controlClasses">
    <input
      :id="fieldId"
      ref="inputRef"
      class="input"
      :class="inputClasses"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly || static"
      :aria-label="ariaLabel"
      :aria-describedby="mergedDescribedby"
      :aria-invalid="ariaInvalid"
      :maxlength="maxlength"
      :min="min"
      :max="max"
      :step="step"
      v-bind="$attrs"
      @input="handleInput"
    >
    <span v-if="icon" class="icon is-left">
      <i :class="`mdi mdi-${icon}`" aria-hidden="true" />
    </span>
    <button
      v-if="iconRight && iconRightClickable"
      type="button"
      class="icon is-right is-clickable cat-input-icon-button"
      :aria-label="iconRightAriaLabel || 'Action'"
      @click="handleIconRightClick"
    >
      <i :class="`mdi mdi-${iconRight}`" aria-hidden="true" />
    </button>
    <span
      v-else-if="iconRight"
      class="icon is-right"
      aria-hidden="true"
    >
      <i :class="`mdi mdi-${iconRight}`" />
    </span>
  </div>
</template>

<script setup lang="ts" generic="T extends string | number = string">
import { computed, inject, ref } from 'vue'
import type { InputVariant, InputSize } from './types'
import { FieldIdKey, FieldDescribedbyKey, FieldVariantKey } from './types'

const fieldId = inject(FieldIdKey, undefined)
const inputRef = ref<HTMLInputElement | null>(null)

/**
 * Text input component with Bulma styling.
 * Supports various input types, sizes, colors, states, and icons.
 *
 * @component cat-input
 * @example
 * <cat-input v-model="value" placeholder="Enter text" />
 * <cat-input v-model="email" type="email" variant="primary" />
 * <cat-input v-model="numberValue" type="number" />
 */

const props = withDefaults(defineProps<{
  /** Input value (v-model). Type is inferred from the binding: string for text inputs, number for numeric inputs. For type="number", bind to a number variable to get automatic number conversion. */
  modelValue?: T
  /** Input type attribute. @default 'text' */
  type?: 'text' | 'email' | 'tel' | 'password' | 'url' | 'search' | 'number' | 'date' | 'time' | 'datetime-local' | 'month' | 'week'
  /** Placeholder text. */
  placeholder?: string
  /** Input size variant. */
  size?: InputSize
  /** Input color variant. */
  variant?: InputVariant
  /** Disable the input. @default false */
  disabled?: boolean
  /** Make input readonly. @default false */
  readonly?: boolean
  /** Accessible label for the input, for use when there is no associated visible label. */
  ariaLabel?: string
  /** id of an element describing the input (bound as aria-describedby), e.g. a format hint. */
  ariaDescribedby?: string
  /** Show loading state. @default false */
  loading?: boolean
  /** Use rounded style. @default false */
  rounded?: boolean
  /** Make input static (non-interactive display). @default false */
  static?: boolean
  /** Maximum length attribute. */
  maxlength?: number | string
  /** Minimum value for number/date inputs. */
  min?: number | string
  /** Maximum value for number/date inputs. */
  max?: number | string
  /** Step value for number inputs. */
  step?: number | string
  /** Left icon (MDI icon name without 'mdi-' prefix). */
  icon?: string
  /** Right icon (MDI icon name without 'mdi-' prefix). */
  iconRight?: string
  /** Make right icon clickable. @default false */
  iconRightClickable?: boolean
  /** Accessible label for the right icon when clickable. */
  iconRightAriaLabel?: string
  /** Make input take full width (expanded). @default false */
  expanded?: boolean
}>(), {
  modelValue: undefined,
  type: 'text',
  placeholder: undefined,
  size: undefined,
  variant: undefined,
  disabled: false,
  readonly: false,
  ariaLabel: undefined,
  ariaDescribedby: undefined,
  loading: false,
  rounded: false,
  static: false,
  maxlength: undefined,
  min: undefined,
  max: undefined,
  step: undefined,
  icon: undefined,
  iconRight: undefined,
  iconRightClickable: false,
  iconRightAriaLabel: undefined,
  expanded: false
})

const emit = defineEmits<{
  'update:modelValue': [value: T]
  'icon-right-click': [event: MouseEvent]
}>()

// Merge the wrapping cat-field's help-message id (if any) with the
// component's own ariaDescribedby, and reflect a danger validation state
// (the field's or this component's own variant) as aria-invalid.
const fieldDescribedby = inject(FieldDescribedbyKey, undefined)
const fieldVariant = inject(FieldVariantKey, undefined)
const mergedDescribedby = computed(() => {
  const parts = [props.ariaDescribedby, fieldDescribedby?.value].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : undefined
})
const ariaInvalid = computed(() => {
  return (props.variant === 'danger' || fieldVariant?.value === 'danger') ? 'true' : undefined
})

const controlClasses = computed(() => {
  const classes: string[] = []

  if (props.icon) {
    classes.push('has-icons-left')
  }

  if (props.iconRight) {
    classes.push('has-icons-right')
  }

  if (props.loading) {
    classes.push('is-loading')
  }

  if (props.expanded) {
    classes.push('is-expanded')
  }

  return classes
})

const inputClasses = computed(() => {
  const classes: string[] = []

  if (props.size) {
    classes.push(`is-${props.size}`)
  }

  if (props.variant) {
    classes.push(`is-${props.variant}`)
  }

  if (props.rounded) {
    classes.push('is-rounded')
  }

  if (props.static) {
    classes.push('is-static')
  }

  return classes
})

function handleInput (event: Event) {
  const target = event.target as HTMLInputElement

  // Convert to number if the modelValue type is number
  if (props.type === 'number' && typeof props.modelValue === 'number') {
    const numValue = target.value === '' ? 0 : Number(target.value)
    emit('update:modelValue', numValue as T)
  } else {
    emit('update:modelValue', target.value as T)
  }
}

function handleIconRightClick (event: MouseEvent) {
  if (props.iconRightClickable) {
    emit('icon-right-click', event)
  }
}

defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  select: () => inputRef.value?.select()
})
</script>

<style scoped lang="scss">
@use "bulma/sass/utilities/initial-variables" as *;
@use "bulma/sass/utilities/derived-variables" as *;

/* Override default button styling so the clickable right icon visually
   matches the non-clickable span variant. */
.cat-input-icon-button {
  background: transparent;
  border: 0;
  padding: 0;
  pointer-events: all;
  color: inherit;

  &:focus-visible {
    outline: 2px solid $link;
    outline-offset: -2px;
  }
}
</style>
