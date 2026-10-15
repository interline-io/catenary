<template>
  <div
    :class="hasAddons ? ['field', 'has-addons', 'cat-input-addons', { 'is-expanded': expanded }] : ['control', ...controlClasses]"
    v-bind="rootAttrs"
  >
    <div v-if="prefix" class="control">
      <span
        :id="prefixId"
        class="button is-static cat-input-addon"
        :class="addonClasses"
        aria-hidden="true"
      >{{ prefix }}</span>
    </div>
    <component :is="hasAddons ? 'div' : Passthrough" v-bind="hasAddons ? { class: ['control', ...controlClasses] } : {}">
      <input
        :id="id ?? fieldId"
        ref="inputRef"
        class="input"
        :class="inputClasses"
        :type="type"
        :value="displayValue"
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
        :inputmode="defaultInputmode"
        v-bind="controlAttrs"
        @input="handleInput"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      >
      <span v-if="icon" class="icon is-left">
        <icon-glyph :name="icon" />
      </span>
      <button
        v-if="showClear"
        type="button"
        class="icon is-right is-clickable cat-input-icon-button cat-input-clear-button"
        :aria-label="clearAriaLabel"
        @click="handleClear"
      >
        <icon-glyph name="close-circle" />
      </button>
      <button
        v-else-if="iconRight && iconRightClickable"
        type="button"
        class="icon is-right is-clickable cat-input-icon-button"
        :aria-label="iconRightAriaLabel || 'Action'"
        @click="handleIconRightClick"
      >
        <icon-glyph :name="iconRight" />
      </button>
      <span
        v-else-if="iconRight"
        class="icon is-right"
        aria-hidden="true"
      >
        <icon-glyph :name="iconRight" />
      </span>
    </component>
    <div v-if="suffix" class="control">
      <span
        :id="suffixId"
        class="button is-static cat-input-addon"
        :class="addonClasses"
        aria-hidden="true"
      >{{ suffix }}</span>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends string | number = string, O extends boolean = false">
import { computed, inject, nextTick, ref, useAttrs, useId, watch } from 'vue'
import type { FunctionalComponent } from 'vue'
import { filterAttrs, isRootAttr, isControlAttr } from '../util/attrs'
import type { InputVariant, InputSize } from './types'
import { FieldIdKey, FieldDescribedbyKey, FieldVariantKey } from './types'
import IconGlyph from './icon-glyph.vue'

// Fallthrough *attributes* go to the native element only. Without this, Vue
// also applied them to the root `.control` wrapper, so a consumer's `id`
// landed on both — and since the wrapper precedes the control in document
// order, a `<label for>` resolved to that wrapper, which is not a labelable
// element, and silently stopped labelling anything. Undeclared `aria-*` was
// duplicated onto a wrapper with no role the same way.
//
// `class` and `style` still reach the root as well, which is what they did
// before and what callers depend on: layout utilities (`mt-2`, `mr-2`) act on
// the wrapper, while typography (`is-family-monospace`) only works on the
// native element — Bulma's base stylesheet sets `font-family` directly on
// input/select/textarea, so it cannot be inherited from the wrapper.
//
// Listeners go to exactly one destination, never both. The root gets everything
// it can observe, so a listener there still sees events from the icons and the
// clear button, which are siblings of the native element rather than inside it.
// The native element gets what the root cannot see — `@focus`, `@blur`,
// `@invalid`, `@scroll`. See `util/attrs.ts` for the split.
//
// With a `prefix` or `suffix` the root is the addon group rather than the
// `.control`, so `mt-2` spaces the whole group and a listener still sees events
// from every part of it.
defineOptions({
  inheritAttrs: false
})

const attrs = useAttrs()

// class and style reach both; a bubbling listener is the wrapper's alone.
const rootAttrs = computed(() => filterAttrs(attrs, isRootAttr))

// With a prefix or suffix the root is a Bulma addon group, which layout classes
// and listeners land on, and the input and its icons sit in a `.control` of
// their own inside it. Without one, the root *is* that `.control` and this
// stands in for the inner one, rendering its children with no element of its
// own, so the markup is the single `.control` it always was. It is never the
// root itself: a fragment root would drop a parent's scoped-style id and `$el`.
const Passthrough: FunctionalComponent = (_props, { slots }) => slots.default?.()
const controlAttrs = computed(() => filterAttrs(attrs, isControlAttr))
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
 * <cat-input v-model="query" clearable @clear="onClear" />
 * <cat-input v-model="fare" type="number" prefix="$" :decimals="2" aria-label="Maximum fare in dollars" />
 * <cat-input v-model="headway" type="number" suffix="minutes" />
 */

const props = withDefaults(defineProps<{
  /**
   * Explicit id for the native element. Overrides the id injected by a
   * wrapping cat-field.
   *
   * A cat-field provides one id, so a grouped field containing more than one
   * control gives them all the same one — duplicate DOM ids, and a `<label
   * for>` that resolves to whichever comes first. cat-select has carried this
   * escape hatch; input and textarea did not.
   */
  id?: string

  /** Input value (v-model). Type is inferred from the binding: string for text inputs, number for numeric inputs. For type="number", bind to a number variable, or set `optional`, to get automatic number conversion. `null` shows as an empty field. */
  modelValue?: T | null
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
  /** Show a clear ("x") button in the right icon slot when the input has a value. Takes over the right slot, so it is mutually exclusive with `iconRight`. @default false */
  clearable?: boolean
  /** Accessible label for the clear button. @default 'Clear' */
  clearAriaLabel?: string
  /** Make input take full width (expanded). @default false */
  expanded?: boolean
  // `& boolean` below is for the runtime declaration, not the type: Vue cannot
  // derive a runtime type from a bare type parameter, so `optional?: O`
  // compiled to `type: null`, and a bare `optional` attribute arrived as ""
  // rather than being cast to true. The intersection compiles to Boolean.
  /**
   * For `type="number"`, marks a field that may have no value. An emptied
   * field, whether by deleting its text or with the clear button, emits
   * `undefined` instead of `0`, so 0 stays a value someone typed. Typed text
   * is converted to a number even while the bound value is `undefined` or
   * `null`, which also lets `decimals` format it. @default false
   */
  optional?: O & boolean
  /**
   * Static text attached to the start of the input, such as a currency
   * symbol. Renders as a Bulma static addon, which is not focusable.
   *
   * The visible text is hidden from assistive technology and added to the
   * input's accessible description instead, so it is announced with the input
   * rather than as a stray "$" before it. It is still only a description: give
   * the input a name that carries the unit too, e.g. "Maximum fare in dollars".
   */
  prefix?: string
  /** Static text attached to the end of the input, such as a unit ("minutes", "m"). Exposed the same way as `prefix`. */
  suffix?: string
  /**
   * For `type="number"`, the number of decimal places to show while the input
   * is not focused: with 2, a value of 2.5 displays as "2.50". Only the display
   * is formatted, and only on blur, so the cursor never moves while someone is
   * typing; the model keeps the number exactly as typed. If rounding hides
   * digits, as 2.125 shown as "2.13" does, focusing the input shows the full
   * value, so editing starts from the number the model holds.
   *
   * Needs a number bound: a field whose model starts out `undefined` or `null`
   * emits strings and is not formatted.
   *
   * With `min` at 0 or above, also defaults `inputmode` to `decimal` (or
   * `numeric` for 0 places), so a phone shows a number pad. Neither iOS pad has
   * a minus key, so there is no default when negative values are allowed. A
   * caller's own `inputmode` always wins.
   */
  decimals?: number
  /**
   * Set by Vue from `v-model` modifiers; not passed directly. With
   * `v-model.lazy`, the value is emitted on the native `change` event (when
   * the field is left, Enter is pressed, or a number's step buttons are used)
   * rather than on every keystroke, for a parent whose updates are costly,
   * such as one that keeps the value in the URL. A binding without `v-model`
   * passes `:model-modifiers="{ lazy: true }"` for the same effect.
   *
   * On blur the field shows the model, so a parent that applies the value late
   * shows its old value until it does: about one frame for `router.replace`.
   * Bind the input to state the parent updates at once, and write it to the
   * slow store from there.
   */
  modelModifiers?: { lazy?: boolean }
}>(), {
  id: undefined,
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
  clearable: false,
  clearAriaLabel: 'Clear',
  expanded: false,
  prefix: undefined,
  suffix: undefined,
  decimals: undefined,
  modelModifiers: () => ({})
})

type EmittedValue = O extends true ? T | undefined : T

const emit = defineEmits<{
  'update:modelValue': [value: EmittedValue]
  'icon-right-click': [event: MouseEvent]
  'clear': []
}>()

// `undefined` is emitted only when `optional` is set, which the conditional
// type expresses but cannot narrow on inside the component. A value emitted
// while editing is remembered until the model echoes it back; see the
// modelValue watcher.
const emitValue = (value: T | undefined): void => {
  if (focused.value && convertsToNumber.value) {
    pendingEchoes.push(value)
  }
  emit('update:modelValue', value as EmittedValue)
}

// Merge the wrapping cat-field's help-message id (if any) with the
// component's own ariaDescribedby, and reflect a danger validation state
// (the field's or this component's own variant) as aria-invalid.
const fieldDescribedby = inject(FieldDescribedbyKey, undefined)
const fieldVariant = inject(FieldVariantKey, undefined)
// A prefix or suffix is hidden from assistive technology where it is drawn, so
// it reaches the input through the description instead. Pointing
// aria-describedby at an aria-hidden element is deliberate: a referenced node's
// text is included even when it is hidden, which is what lets a screen reader
// in browse mode skip the bare "$" and still hear it on the focused input.
const baseId = useId()
const prefixId = `${baseId}-prefix`
const suffixId = `${baseId}-suffix`
const mergedDescribedby = computed(() => {
  const parts = [
    props.prefix ? prefixId : undefined,
    props.suffix ? suffixId : undefined,
    props.ariaDescribedby,
    fieldDescribedby?.value
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : undefined
})
const ariaInvalid = computed(() => {
  return (props.variant === 'danger' || fieldVariant?.value === 'danger') ? 'true' : undefined
})

// The clear button only appears once the input holds a value, and never when
// the input cannot be edited (disabled/readonly/static).
const showClear = computed(() => {
  const value = props.modelValue
  const hasValue = value !== undefined && value !== null && String(value).length > 0
  return props.clearable && hasValue && !props.disabled && !props.readonly && !props.static
})

const hasAddons = computed(() => !!(props.prefix || props.suffix))

// Sized with the input so the addon and the input share a height.
const addonClasses = computed(() => props.size ? [`is-${props.size}`] : [])

const controlClasses = computed(() => {
  const classes: string[] = []

  if (props.icon) {
    classes.push('has-icons-left')
  }

  if (props.iconRight || showClear.value) {
    classes.push('has-icons-right')
  }

  if (props.loading) {
    classes.push('is-loading')
  }

  // In an addon group the input takes whatever width the addons leave, so it
  // fills its container the way a lone input does. Bulma's addon controls
  // otherwise shrink to their content.
  if (props.expanded || hasAddons.value) {
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

// Decimal places to format to, or undefined when the field is not formatted.
// toFixed throws a RangeError outside 0..100.
const places = computed(() => {
  if (props.type !== 'number' || props.decimals === undefined || !Number.isFinite(props.decimals)) {
    return undefined
  }
  return Math.max(0, Math.min(100, Math.trunc(props.decimals)))
})

// The number pads have no minus key on iOS, so they are only offered when the
// field cannot take a negative value.
const defaultInputmode = computed(() => {
  if (places.value === undefined || props.min === undefined || props.min === '' || !(Number(props.min) >= 0)) {
    return undefined
  }
  return places.value > 0 ? 'decimal' : 'numeric'
})

// What handleInput emits for a numeric field's text, kept in one place so the
// display can tell whether the model still matches what was typed. Empty is
// `undefined` for an optional field, so it cannot be mistaken for a typed 0.
const parseNumber = (text: string): number | undefined => {
  if (text === '') return props.optional ? undefined : 0
  return Number(text)
}

// A numeric field emits numbers once its model is a number. An optional one
// does from the start, since its model is expected to begin unset.
const convertsToNumber = computed(() =>
  props.type === 'number' && (typeof props.modelValue === 'number' || props.optional))

const hasNumberModel = computed(() => props.type === 'number' && typeof props.modelValue === 'number')

// The model as shown while the field is not being edited.
function formatNumber (value: number): string {
  return places.value === undefined || !Number.isFinite(value) ? String(value) : value.toFixed(places.value)
}

// The model as shown while it is being edited: formatted, unless rounding hid
// digits. Editing starts from the number the model holds, so ArrowUp on 2.125
// shown as "2.13" steps from 2.125 rather than silently from 2.13.
function editableNumber (value: number): string {
  const formatted = formatNumber(value)
  return Number(formatted) === value ? formatted : String(value)
}

// While focused, a numeric field shows what the person typed, and only that.
// Without this, the model's own rendering replaces the text on every keystroke
// that changes it: deleting the last digit emits 0 and the field fills back in
// with "0" before the next digit can be typed, and with `decimals` "2.50"
// would be redrawn as "2.5" on focus. On blur the field shows the model again,
// whatever the parent made of the emits.
const focused = ref(false)
const typed = ref('')

// Values emitted since focus that the model has not yet echoed back. A parent
// that applies emits late, such as one that keeps the value in the URL, echoes
// "2" after "2.7" and "2.75" have been typed; that echo is not an outside
// change and must not replace the typed text. Matched and dropped one at a
// time, so echoes that arrive out of order are recognized too. Cleared on
// focus and blur, and by an outside change.
let pendingEchoes: unknown[] = []

// A model set from outside while focused, as a reset button does, replaces the
// typed text. A value the input emitted itself is an echo, not a reset.
watch(() => props.modelValue, (value) => {
  if (!focused.value || !convertsToNumber.value) {
    return
  }
  const echo = pendingEchoes.findIndex(emitted => Object.is(emitted, value))
  if (echo !== -1) {
    pendingEchoes.splice(echo, 1)
    return
  }
  if (parseNumber(typed.value) === value) {
    return
  }
  typed.value = typeof value === 'number' ? editableNumber(value) : ''
  pendingEchoes = []
})

const displayValue = computed(() => {
  const value = props.modelValue
  if (!convertsToNumber.value) {
    return value
  }
  if (focused.value) {
    return typed.value
  }
  return typeof value === 'number' ? formatNumber(value) : value
})

function handleFocus (event: FocusEvent) {
  typed.value = hasNumberModel.value
    ? editableNumber(props.modelValue as number)
    : (event.target as HTMLInputElement).value
  pendingEchoes = []
  focused.value = true
}

// Leaving the field shows the model, whatever the parent did with the emits. A
// parent that ignored the last one leaves the model where it was, so the
// display can come out as the very string it was before editing; Vue sees no
// change and does not patch the input, which would keep showing the rejected
// text. The element is set directly when it disagrees. Also clears a number
// input stuck on text it could not parse, such as a lone "-", whose value
// reads as "" and so would match an empty model without being empty.
function handleBlur () {
  focused.value = false
  pendingEchoes = []
  if (!convertsToNumber.value) {
    return
  }
  nextTick(() => {
    const el = inputRef.value
    const shown = displayValue.value == null ? '' : String(displayValue.value)
    if (el && document.activeElement !== el && (el.value !== shown || el.validity?.badInput)) {
      el.value = shown
    }
  })
}

// The value the field's text stands for, converted as the bound type expects
function emitText (text: string): void {
  if (convertsToNumber.value) {
    emitValue(parseNumber(text) as T | undefined)
  } else {
    emitValue(text as T)
  }
}

function handleInput (event: Event) {
  const target = event.target as HTMLInputElement
  typed.value = target.value
  // With `.lazy` the text is tracked for display but committed on change
  if (!props.modelModifiers.lazy) {
    emitText(target.value)
  }
}

function handleChange (event: Event) {
  if (props.modelModifiers.lazy) {
    emitText((event.target as HTMLInputElement).value)
  }
}

function handleIconRightClick (event: MouseEvent) {
  if (props.iconRightClickable) {
    emit('icon-right-click', event)
  }
}

function handleClear () {
  // Mirror handleInput's number handling so the emitted empty value matches the
  // bound type: undefined for an optional numeric input, 0 for any other
  // numeric one, '' otherwise.
  if (convertsToNumber.value) {
    emitValue(parseNumber('') as T | undefined)
  } else {
    emitValue('' as T)
  }
  emit('clear')
  // The clear button disappears once the value is empty, so return focus to the
  // input rather than letting it fall back to the document body.
  inputRef.value?.focus()
  // Focusing recorded the old value as typed. The field was just emptied, so
  // it shows empty until blur, as it does when the digits are deleted by hand,
  // rather than "0" waiting to have a digit typed after it.
  typed.value = ''
}

defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  select: () => inputRef.value?.select(),
  clear: handleClear
})
</script>

<style scoped lang="scss">
/* `type="search"` makes WebKit render its own clear affordance, and this
   component draws one of its own whenever `clearable` is set — cat-search-bar
   always does. Chrome already drops the native one because Bulma's control
   mixin sets `appearance: none` on `.input`, but Safari keeps it unless the
   pseudo-element is suppressed explicitly, which would show two X buttons in
   the same field. */
input[type="search"]::-webkit-search-cancel-button,
input[type="search"]::-webkit-search-decoration {
  appearance: none;
  -webkit-appearance: none;
}

/* The addon group is a .field only because Bulma's addon rules are written
   against `.field.has-addons`. It is part of one control, so it must not take
   the spacing Bulma gives a field that is followed by another, which would
   push a cat-field's help text away from its input. `.field` repeats here to
   outrank `.field:not(:last-child)` regardless of stylesheet order. */
.field.cat-input-addons {
  margin-bottom: 0;
}

/* In a grouped field the addon group stands where a `.control` would, so it
   takes the sizing Bulma gives one there: content width by default, and the
   rest of the row with `expanded`. Outside a grouped field the group is a
   block and fills its container either way. */
.field.is-grouped > .field.cat-input-addons {
  flex-shrink: 0;

  &.is-expanded {
    flex-grow: 1;
    flex-shrink: 1;
  }
}

/* Inside another addon group, such as a `<cat-field addons>` with a button
   beside the input, this group is one link in that chain. Bulma joins the
   links by squaring the corners each `.control` turns toward a neighbor and
   overlapping their borders by 1px, but its rules match `.control` children by
   position, and this group is a `.field`, so its outer corners stayed rounded
   against the neighbor and the shared border doubled. The same treatment is
   applied here to the edge controls of this group. `expanded` grows the group
   the way `is-expanded` grows a `.control` there. */
.field.has-addons > .field.cat-input-addons {
  &.is-expanded {
    flex-grow: 1;
    flex-shrink: 1;
  }

  &:not(:last-child) {
    margin-inline-end: -1px;

    > .control:last-child .input,
    > .control:last-child .button {
      border-start-end-radius: 0;
      border-end-end-radius: 0;
    }
  }

  &:not(:first-child) {
    > .control:first-child .input,
    > .control:first-child .button {
      border-start-start-radius: 0;
      border-end-start-radius: 0;
    }
  }
}

/* Bulma colors a static addon with `text-weak` on `scheme-main-ter`, which
   measures 4.26:1 in the light theme and 4.20:1 in the dark one, short of the
   4.5:1 that WCAG 1.4.3 asks of text this size. The addon carries the unit, so
   it is real content rather than decoration. `text` follows the theme and
   measures 8.59:1 and 7.66:1. Set through Bulma's own token so a consumer can
   still restyle it. */
.button.cat-input-addon {
  --bulma-button-static-color: var(--bulma-text);
}

/* Override default button styling so the clickable right icon visually
   matches the non-clickable span variant. */
.cat-input-icon-button {
  background: transparent;
  border: 0;
  padding: 0;
  pointer-events: all;
  color: inherit;

  &:focus-visible {
    outline: 2px solid var(--bulma-link-on-scheme);
    outline-offset: -2px;
  }
}
</style>
