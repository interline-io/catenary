<template>
  <p
    class="control"
    :class="controlClasses"
    v-bind="rootAttrs"
  >
    <textarea
      :id="fieldId"
      ref="textareaRef"
      :aria-describedby="mergedDescribedby"
      :aria-invalid="ariaInvalid"
      class="textarea"
      :class="textareaClasses"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      :rows="rows"
      :cols="cols"
      :wrap="wrap"
      v-bind="$attrs"
      @input="handleInput"
    />
  </p>
</template>

<script setup lang="ts">
import { computed, inject, ref, useAttrs } from 'vue'
import type { TextareaVariant, TextareaSize } from './types'
import { FieldIdKey, FieldDescribedbyKey, FieldVariantKey } from './types'

// Fallthrough *attributes* go to the native element only. Without this, Vue
// also applied them to the root `.control` wrapper, so a consumer's `id`
// landed on both — and since the wrapper precedes the control in document
// order, a `<label for>` resolved to a non-labelable div and silently stopped
// labelling anything. Undeclared `aria-*` was duplicated onto a role-less div
// the same way.
//
// `class`, `style` and event listeners still reach the root as well, which is
// what they did before and what callers depend on:
//   - layout utilities (`mt-2`, `mr-2`) act on the wrapper, while typography
//     (`is-family-monospace`) only works on the native element — Bulma's base
//     stylesheet sets `font-family` directly on input/select/textarea, so it
//     cannot be inherited from the wrapper.
//   - a listener on the root sees events from the icons and the clear button,
//     which are siblings of the native element rather than inside it, while
//     one on the native element is what non-bubbling `@focus` / `@blur` need.
//     Both destinations are load-bearing; see cat-search-bar's Escape handler,
//     which stops propagation to collapse the resulting duplicate keydown.
defineOptions({
  inheritAttrs: false
})

const attrs = useAttrs()

// class, style and on* listeners — the subset that keeps reaching the wrapper.
const rootAttrs = computed(() => {
  const forwarded: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'class' || key === 'style' || /^on[A-Z]/.test(key)) forwarded[key] = value
  }
  return forwarded
})
const fieldId = inject(FieldIdKey, undefined)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

interface Props {
  /**
   * The v-model value of the textarea.
   * @default ''
   */
  modelValue?: string

  /**
   * Placeholder text for the textarea.
   */
  placeholder?: string

  /**
   * The size of the textarea.
   * @values small, normal, medium, large
   */
  size?: TextareaSize

  /**
   * The color variant of the textarea.
   * @values primary, link, info, success, warning, danger, white, light, dark
   */
  variant?: TextareaVariant
  /** id of an element describing the control (bound as aria-describedby), merged with a wrapping cat-field's message id. */
  ariaDescribedby?: string

  /**
   * Whether the textarea is disabled.
   * @default false
   */
  disabled?: boolean

  /**
   * Whether the textarea is readonly.
   * @default false
   */
  readonly?: boolean

  /**
   * Whether to show the textarea in a loading state.
   * @default false
   */
  loading?: boolean

  /**
   * Whether the textarea has rounded corners.
   * @default false
   */
  rounded?: boolean

  /**
   * Maximum length of the textarea content.
   */
  maxlength?: number

  /**
   * Number of visible text rows.
   * @default 4
   */
  rows?: number

  /**
   * Number of visible text columns.
   */
  cols?: number

  /**
   * How text wraps in the textarea.
   * @values soft, hard, off
   */
  wrap?: 'soft' | 'hard' | 'off'

  /**
   * Make textarea take full width (expanded).
   * @default false
   */
  expanded?: boolean

  /**
   * Disable textarea resizing.
   * @default false
   */
  hasFixedSize?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: undefined,
  size: undefined,
  variant: undefined,
  ariaDescribedby: undefined,
  disabled: false,
  readonly: false,
  loading: false,
  rounded: false,
  maxlength: undefined,
  rows: 4,
  cols: undefined,
  wrap: undefined,
  expanded: false,
  hasFixedSize: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
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

  if (props.loading) {
    classes.push('is-loading')
  }

  if (props.expanded) {
    classes.push('is-expanded')
  }

  return classes
})

const textareaClasses = computed(() => {
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

  if (props.hasFixedSize) {
    classes.push('has-fixed-size')
  }

  return classes
})

function handleInput (event: Event) {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}

defineExpose({
  focus: () => textareaRef.value?.focus(),
  blur: () => textareaRef.value?.blur(),
  select: () => textareaRef.value?.select()
})
</script>
