<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Input Component
      </h1>
      <p class="subtitle">
        Text input control with validation and variants
      </p>

      <demo-box label="Basic Input">
        <cat-field label="Name">
          <cat-input v-model="name" placeholder="Enter your name" />
        </cat-field>
        <p class="has-text-grey">
          Value: {{ name }}
        </p>
      </demo-box>

      <demo-box label="Input Types">
        <cat-field v-for="inputType in inputTypes" :key="inputType" :label="capitalize(inputType) + ':'">
          <cat-input v-model="typeValues[inputType]" :type="inputType" :placeholder="getPlaceholder(inputType)" />
        </cat-field>
      </demo-box>

      <demo-box label="Variants">
        <cat-field v-for="variant in variants" :key="variant" :label="capitalize(variant) + ':'">
          <cat-input v-model="variantValues[variant]" :variant="variant" :placeholder="capitalize(variant)" />
        </cat-field>
      </demo-box>

      <demo-box label="Sizes">
        <cat-field v-for="size in sizes" :key="size" :label="capitalize(size) + ':'">
          <cat-input v-model="sizeValues[size]" :size="size" :placeholder="capitalize(size) + ' input'" />
        </cat-field>
      </demo-box>

      <demo-box label="States">
        <cat-field label="Disabled">
          <cat-input v-model="disabled" disabled placeholder="Disabled input" />
        </cat-field>
        <cat-field label="Readonly">
          <cat-input v-model="readonly" readonly placeholder="Readonly input" />
        </cat-field>
        <cat-field label="Loading">
          <cat-input v-model="loadingValue" loading placeholder="Loading input" />
        </cat-field>
      </demo-box>

      <demo-box label="Static">
        <p class="mb-3">
          Static inputs display like plain text, useful for read-only values in forms.
        </p>
        <cat-field label="Username" horizontal>
          <cat-input v-model="staticUsername" static />
        </cat-field>
        <cat-field label="Email" horizontal>
          <cat-input v-model="staticEmail" type="email" static />
        </cat-field>
      </demo-box>

      <demo-box label="Rounded">
        <cat-field label="Rounded Input">
          <cat-input v-model="rounded" rounded placeholder="Rounded corners" />
        </cat-field>
      </demo-box>

      <demo-box label="With Icons">
        <cat-field label="Search">
          <cat-input v-model="search" icon="magnify" placeholder="Search..." />
        </cat-field>
        <cat-field label="Email with Icon">
          <cat-input v-model="emailIcon" type="email" icon="email" placeholder="email@example.com" />
        </cat-field>
        <cat-field label="With Right Icon">
          <cat-input v-model="clearable" icon="magnify" icon-right="close-circle" icon-right-clickable placeholder="Clearable search" @icon-right-click="clearable = ''" />
        </cat-field>
      </demo-box>

      <demo-box label="Example: Maxlength" example>
        <cat-field label="Username (max 20 chars)">
          <cat-input v-model="username" maxlength="20" placeholder="Enter username" />
        </cat-field>
        <p class="has-text-grey">
          {{ username.length }} / 20 characters
        </p>
      </demo-box>

      <demo-a11y
        :references="[
          { label: 'W3C Tutorial: Labeling Controls', url: 'https://www.w3.org/WAI/tutorials/forms/labels/' },
          { label: 'WCAG SC 3.3.2: Labels or Instructions', url: 'https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html' },
        ]"
        :keyboard="[
          { key: 'Tab / Shift+Tab', description: 'Moves focus into and out of the input.' },
          { key: 'Enter / Space', description: 'When focus is on the clickable right icon (if `icon-right-clickable` is set), activates the icon button.' },
        ]"
      >
        <template #intro>
          Renders a native <code>&lt;input&gt;</code>, so standard browser keyboard, IME, and validation behaviors apply. Pair with <code>&lt;cat-field label="…"&gt;</code> so the label is programmatically associated via <code>&lt;label for&gt;</code>.
        </template>
        <template #notes>
          <p class="mt-3">
            When <code>icon-right-clickable</code> is set, the right icon renders as a real <code>&lt;button&gt;</code> with its own focus-visible outline. Set <code>icon-right-aria-label</code> (e.g., <code>"Search"</code>, <code>"Clear input"</code>) so screen readers announce a meaningful action name; the default is the generic <em>Action</em>.
          </p>
          <p class="mt-2">
            Parents that need to focus the input programmatically can call <code>focus()</code> / <code>blur()</code> / <code>select()</code> via a template ref — these are exposed by <code>defineExpose</code>.
          </p>
        </template>
      </demo-a11y>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { InputVariants, InputSizes, InputTypes } from '../../../../src/controls/types'
import DemoBox from '../../components/demo-box.vue'
import DemoA11y from '../../components/demo-a11y.vue'

const variants = InputVariants
const sizes = InputSizes
const inputTypes = InputTypes

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const getPlaceholder = (inputType: string) => {
  const placeholders: Record<string, string> = {
    'text': 'Text input',
    'email': 'email@example.com',
    'tel': '555-1234',
    'password': 'Enter password',
    'url': 'https://example.com',
    'search': 'Search...',
    'number': '123',
    'date': '',
    'time': '',
    'datetime-local': '',
    'month': '',
    'week': ''
  }
  return placeholders[inputType] || ''
}

const name = ref('')

const variantValues = reactive<Record<string, string>>({})
for (const variant of variants) {
  variantValues[variant] = ''
}

const sizeValues = reactive<Record<string, string>>({})
for (const size of sizes) {
  sizeValues[size] = ''
}

const typeValues = reactive<Record<string, string>>({})
for (const inputType of inputTypes) {
  typeValues[inputType] = ''
}

const disabled = ref('This is disabled')
const readonly = ref('This is readonly')
const loadingValue = ref('')
const staticUsername = ref('john_doe')
const staticEmail = ref('john@example.com')
const rounded = ref('')
const search = ref('')
const emailIcon = ref('')
const clearable = ref('Type to test')
const username = ref('')
</script>
