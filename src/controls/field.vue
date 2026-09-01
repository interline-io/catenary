<template>
  <div
    ref="root"
    class="field"
    :class="fieldClasses"
  >
    <label v-if="hasLabel && !horizontal" class="label" :for="fieldId">
      <slot name="label">{{ label }}</slot>
    </label>

    <div v-if="horizontal" class="field-label" :class="labelSizeClass">
      <label v-if="hasLabel" class="label" :for="fieldId">
        <slot name="label">{{ label }}</slot>
      </label>
    </div>

    <div v-if="horizontal" class="field-body">
      <div class="field" :class="{ 'has-addons': addons }">
        <slot :id="fieldId" :describedby="describedbyId" />
        <p v-if="message || $slots.message" :id="messageId" class="help" :class="messageClass">
          <slot name="message">
            {{ message }}
          </slot>
        </p>
      </div>
    </div>

    <template v-else>
      <!-- Wrap controls in nested field if we have a label and grouped/addons controls -->
      <div v-if="(grouped || addons) && hasLabel" class="field" :class="{ 'is-grouped': grouped, 'has-addons': addons }">
        <slot :id="fieldId" :describedby="describedbyId" />
      </div>
      <template v-else>
        <slot :id="fieldId" :describedby="describedbyId" />
      </template>
      <p v-if="message || $slots.message" :id="messageId" class="help" :class="messageClass">
        <slot name="message">
          {{ message }}
        </slot>
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, useId, useSlots, provide } from 'vue'
import { FieldIdKey, FieldDescribedbyKey, FieldVariantKey } from './types'

const slots = useSlots()
const fieldId = useId()
provide(FieldIdKey, fieldId)

/**
 * Form field wrapper component following Bulma field structure.
 * Supports labels, horizontal layout, addons, grouping, and validation messages.
 *
 * The label is a real `<label for>`, so it names exactly one control. Catenary
 * controls that inject `FieldIdKey` claim the generated id automatically; give
 * anything else the id from the default slot. For a *group* of controls reach
 * for `cat-fieldset`, whose `<legend>` can name a set.
 *
 * @component cat-field
 * @example A catenary control claims the id on its own:
 * <cat-field label="Name">
 *   <cat-input v-model="name" />
 * </cat-field>
 *
 * @example A raw control takes it from the slot, otherwise the label names nothing:
 * <cat-field v-slot="{ id, describedby }" label="Email" message="We never share it.">
 *   <input :id="id" :aria-describedby="describedby" class="input" type="email">
 * </cat-field>
 *
 * @example Addons -- the label names the text input, and the button carries its own name:
 * <cat-field v-slot="{ id }" addons label="Search">
 *   <div class="control">
 *     <input :id="id" class="input" type="text">
 *   </div>
 *   <div class="control">
 *     <button class="button">Search</button>
 *   </div>
 * </cat-field>
 */

interface Props {
  /**
   * Field label text.
   */
  label?: string

  /**
   * Use horizontal layout (label beside input).
   * @default false
   */
  horizontal?: boolean

  /**
   * Use addons layout (attached controls).
   * @default false
   */
  addons?: boolean

  /**
   * Use grouped layout (side-by-side controls).
   * @default false
   */
  grouped?: boolean

  /**
   * Help text message below field.
   */
  message?: string

  /**
   * Validation state variant.
   */
  variant?: 'success' | 'warning' | 'danger' | 'info'

  /**
   * Label size for horizontal fields.
   */
  labelSize?: 'small' | 'normal' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  horizontal: false,
  addons: false,
  grouped: false,
  message: undefined,
  variant: undefined,
  labelSize: 'normal'
})

// Wire the help/validation message and validation state to the wrapped
// control: the message <p> gets a stable id that controls merge into their
// aria-describedby, and a danger variant renders as aria-invalid on the
// control. Both are provided as computeds (provide must run unconditionally
// in setup) that resolve to undefined when there is nothing to convey.
const messageId = `${fieldId}-help`
const describedbyId = computed(() => (props.message || slots.message) ? messageId : undefined)
provide(FieldDescribedbyKey, describedbyId)
provide(FieldVariantKey, computed(() => props.variant))

// Check if label exists via prop or slot
const hasLabel = computed(() => !!(props.label || slots.label))

const fieldClasses = computed(() => {
  const classes: string[] = []

  if (props.horizontal) {
    classes.push('is-horizontal')
  }

  // Only add has-addons/is-grouped to parent if there's no label (label will wrap controls in nested field)
  if (props.addons && !props.horizontal && !hasLabel.value) {
    classes.push('has-addons')
  }

  if (props.grouped && !props.horizontal && !hasLabel.value) {
    classes.push('is-grouped')
  }

  return classes
})

const messageClass = computed(() => {
  if (!props.variant) return ''
  return `is-${props.variant}`
})

const labelSizeClass = computed(() => {
  return `is-${props.labelSize}`
})

const root = ref<HTMLElement | null>(null)

/*
 * A visible label that names nothing is the failure this component is most
 * prone to: it renders `<label :for="fieldId">` unconditionally, but only the
 * controls that inject FieldIdKey (input, select, textarea, slider, taginput,
 * and anything built on them) ever carry that id. Wrap a raw `<input>`, a
 * cat-checkbox, a cat-dropdown or a group of controls and the label silently
 * attaches to nothing -- visually fine, and unnamed to a screen reader.
 *
 * Checked in the DOM rather than by inspecting slot VNodes, so it sees through
 * wrapper components, v-if and fragments alike. See radio.vue for why the
 * `process.env.NODE_ENV` guard is bare.
 */
if (process.env.NODE_ENV !== 'production') {
  onMounted(() => {
    if (!hasLabel.value || !root.value) return
    const claimed = Array.from(root.value.querySelectorAll<HTMLElement>('[id]'))
      .filter(el => el.id === fieldId)
    if (claimed.length === 1) return

    if (claimed.length > 1) {
      console.warn(
        `[catenary] <cat-field label="${props.label ?? ''}"> has ${claimed.length} elements sharing `
        + `the id "${fieldId}", so the DOM has duplicate ids and the label resolves to whichever `
        + 'comes first. Give every control after the first an explicit `id`.'
      )
      return
    }

    const controls = root.value.querySelectorAll(
      'input:not([type="hidden"]), select, textarea, button, meter, output, progress'
    )
    if (controls.length === 0) {
      console.warn(
        `[catenary] <cat-field label="${props.label ?? ''}"> renders a <label> but wraps no form `
        + 'control, so the label names nothing. Use a heading or plain text for a caption, or '
        + 'drop `label` and let the content speak for itself.'
      )
    } else if (controls.length > 1) {
      console.warn(
        `[catenary] <cat-field label="${props.label ?? ''}"> wraps ${controls.length} controls and `
        + 'its label is not associated with any control. A <label> can only name one, so a label '
        + 'over a group is orphaned -- use <cat-fieldset label="..."> instead, which names the '
        + 'group with a <legend>.'
      )
    } else {
      console.warn(
        `[catenary] <cat-field label="${props.label ?? ''}"> has a label that is not associated `
        + 'with any control. Controls like cat-checkbox, cat-radio, cat-switch and cat-dropdown do '
        + 'not take the field id; bind it yourself from the default slot: '
        + '<cat-field v-slot="{ id }"><input :id="id"></cat-field>.'
      )
    }
  })
}
</script>
