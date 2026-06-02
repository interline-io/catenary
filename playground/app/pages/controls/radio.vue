<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Radio Component
      </h1>
      <p class="subtitle">
        Radio button input for single selection
      </p>

      <demo-box label="Basic Radio Group">
        <cat-field>
          <cat-radio v-model="basic" native-value="option1">
            Option 1
          </cat-radio>
          <cat-radio v-model="basic" native-value="option2">
            Option 2
          </cat-radio>
          <cat-radio v-model="basic" native-value="option3">
            Option 3
          </cat-radio>
        </cat-field>
        <p class="has-text-grey">
          Selected: {{ basic }}
        </p>
      </demo-box>

      <demo-box label="Variants">
        <cat-field>
          <cat-radio v-for="variant in variants" :key="variant" :model-value="true" :native-value="true" :variant="variant">
            {{ capitalize(variant) }}
          </cat-radio>
        </cat-field>
      </demo-box>

      <demo-box label="Sizes">
        <cat-field>
          <cat-radio v-for="size in sizes" :key="size" :model-value="true" :native-value="true" :size="size">
            {{ capitalize(size) }} radio
          </cat-radio>
        </cat-field>
      </demo-box>

      <demo-box label="Disabled State">
        <cat-field>
          <cat-radio v-model="disabledDemo" native-value="enabled">
            Enabled option
          </cat-radio>
          <cat-radio v-model="disabledDemo" native-value="disabled" disabled>
            Disabled option
          </cat-radio>
          <cat-radio v-model="disabledDemo" native-value="another">
            Another enabled option
          </cat-radio>
        </cat-field>
      </demo-box>

      <demo-box label="With Additional Content">
        <cat-field>
          <cat-radio v-model="contentDemo" native-value="option1">
            <div>
              <strong>Option 1</strong>
              <p class="help">
                Additional content for option 1
              </p>
            </div>
          </cat-radio>
          <cat-radio v-model="contentDemo" native-value="option2">
            <div>
              <strong>Option 2</strong>
              <p class="help">
                Additional content for option 2
              </p>
            </div>
          </cat-radio>
          <cat-radio v-model="contentDemo" native-value="option3">
            <div>
              <strong>Option 3</strong>
              <p class="help">
                Additional content for option 3
              </p>
            </div>
          </cat-radio>
        </cat-field>
      </demo-box>

      <demo-box label="Example: Payment Method Selection" example>
        <cat-field label="Choose payment method:">
          <cat-radio v-model="payment" native-value="credit">
            <div>
              <strong>Credit Card</strong>
              <p class="help">
                Pay with Visa, Mastercard, or Amex
              </p>
            </div>
          </cat-radio>
          <cat-radio v-model="payment" native-value="paypal">
            <div>
              <strong>PayPal</strong>
              <p class="help">
                Fast and secure payment
              </p>
            </div>
          </cat-radio>
          <cat-radio v-model="payment" native-value="bank">
            <div>
              <strong>Bank Transfer</strong>
              <p class="help">
                Direct transfer from your bank
              </p>
            </div>
          </cat-radio>
        </cat-field>
        <p class="has-text-grey mt-3">
          Selected method: {{ payment }}
        </p>
      </demo-box>

      <demo-box label="Example: Shipping Options" example>
        <cat-field label="Select shipping speed:">
          <cat-radio v-model="shipping" native-value="standard">
            <span><strong>Standard Shipping</strong> - FREE (5-7 days)</span>
          </cat-radio>
          <cat-radio v-model="shipping" native-value="express">
            <span><strong>Express Shipping</strong> - $9.99 (2-3 days)</span>
          </cat-radio>
          <cat-radio v-model="shipping" native-value="overnight">
            <span><strong>Overnight Shipping</strong> - $24.99 (next day)</span>
          </cat-radio>
        </cat-field>
      </demo-box>

      <demo-box label="Example: Survey Question" example>
        <p class="mb-3">
          <strong>How satisfied are you with our service?</strong>
        </p>
        <cat-field>
          <cat-radio v-model="satisfaction" native-value="very-satisfied" variant="success">
            Very Satisfied
          </cat-radio>
          <cat-radio v-model="satisfaction" native-value="satisfied" variant="success">
            Satisfied
          </cat-radio>
          <cat-radio v-model="satisfaction" native-value="neutral" variant="warning">
            Neutral
          </cat-radio>
          <cat-radio v-model="satisfaction" native-value="dissatisfied" variant="danger">
            Dissatisfied
          </cat-radio>
          <cat-radio v-model="satisfaction" native-value="very-dissatisfied" variant="danger">
            Very Dissatisfied
          </cat-radio>
        </cat-field>
      </demo-box>

      <demo-box label="Example: Numeric Values (Rating)" example>
        <p class="mb-3">
          <strong>Rate this product (1-5 stars):</strong>
        </p>
        <cat-field>
          <cat-radio v-model="rating" :native-value="1">
            ⭐ 1 Star
          </cat-radio>
          <cat-radio v-model="rating" :native-value="2">
            ⭐⭐ 2 Stars
          </cat-radio>
          <cat-radio v-model="rating" :native-value="3">
            ⭐⭐⭐ 3 Stars
          </cat-radio>
          <cat-radio v-model="rating" :native-value="4">
            ⭐⭐⭐⭐ 4 Stars
          </cat-radio>
          <cat-radio v-model="rating" :native-value="5">
            ⭐⭐⭐⭐⭐ 5 Stars
          </cat-radio>
        </cat-field>
        <p class="has-text-grey mt-3">
          Rating: {{ rating }} (type: {{ typeof rating }})
        </p>
      </demo-box>

      <demo-a11y
        pattern-name="Radio Group"
        pattern-url="https://www.w3.org/WAI/ARIA/apg/patterns/radio/"
        :keyboard="[
          { key: 'Tab / Shift+Tab', description: 'Moves focus into and out of the radio group.' },
          { key: 'ArrowDown / ArrowRight', description: 'Moves focus to the next radio in the group, unchecks the previously focused button, and checks the newly focused one.' },
          { key: 'ArrowUp / ArrowLeft', description: 'Moves focus to the previous radio in the group, unchecks the previously focused button, and checks the newly focused one.' },
          { key: 'Space', description: 'Checks the focused radio if it is not already checked.' },
        ]"
      >
        <template #intro>
          <code>&lt;cat-radio&gt;</code> renders a native <code>&lt;input type="radio"&gt;</code>; group all radios that share a <code>v-model</code> inside a <code>&lt;cat-fieldset&gt;</code> so screen readers announce the group's name when focus enters it.
        </template>
      </demo-a11y>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RadioVariants, RadioSizes } from '../../../../src/controls/types'
import DemoBox from '../../components/demo-box.vue'
import DemoA11y from '../../components/demo-a11y.vue'

const variants = RadioVariants
const sizes = RadioSizes

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const basic = ref('option2')
const disabledDemo = ref('enabled')
const contentDemo = ref('option1')
const payment = ref('credit')
const shipping = ref('standard')
const satisfaction = ref('satisfied')
const rating = ref<number>(4)
</script>
