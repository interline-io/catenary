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
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { InputVariants, InputSizes, InputTypes } from '../../../../src/controls/types'
import DemoBox from '../../components/demo-box.vue'

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
