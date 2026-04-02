<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Textarea Component
      </h1>
      <p class="subtitle">
        Multi-line text input control
      </p>

      <!-- Basic Textarea -->
      <t-demo-box label="Basic Textarea">
        <cat-field label="Enter your message:">
          <cat-textarea v-model="basic" placeholder="Type something..." />
        </cat-field>
        <p class="has-text-grey">
          Length: {{ basic.length }} characters
        </p>
      </t-demo-box>

      <!-- Variants -->
      <t-demo-box label="Variants">
        <cat-field v-for="variant in variants" :key="variant" :label="capitalize(variant) + ':'">
          <cat-textarea v-model="variantValues[variant]" :variant="variant" :placeholder="capitalize(variant) + ' textarea'" />
        </cat-field>
      </t-demo-box>

      <!-- Sizes -->
      <t-demo-box label="Sizes">
        <cat-field v-for="textareaSize in sizes" :key="textareaSize" :label="capitalize(textareaSize) + ':'">
          <cat-textarea v-model="sizeValues[textareaSize]" :size="textareaSize" :placeholder="capitalize(textareaSize) + ' textarea'" />
        </cat-field>
      </t-demo-box>

      <!-- Rows -->
      <t-demo-box label="Custom Row Height">
        <cat-field label="3 rows:">
          <cat-textarea v-model="rows3" :rows="3" placeholder="3 rows" />
        </cat-field>
        <cat-field label="5 rows:">
          <cat-textarea v-model="rows5" :rows="5" placeholder="5 rows" />
        </cat-field>
        <cat-field label="10 rows:">
          <cat-textarea v-model="rows10" :rows="10" placeholder="10 rows" />
        </cat-field>
      </t-demo-box>

      <!-- States -->
      <t-demo-box label="States">
        <cat-field label="Disabled:">
          <cat-textarea v-model="stateDisabled" disabled placeholder="This is disabled" />
        </cat-field>
        <cat-field label="Readonly:">
          <cat-textarea v-model="stateReadonly" readonly />
        </cat-field>
        <cat-field label="Loading:">
          <cat-textarea v-model="stateLoading" loading placeholder="Loading..." />
        </cat-field>
      </t-demo-box>

      <!-- Maxlength -->
      <t-demo-box label="With Maxlength Counter">
        <cat-field label="Tweet (280 characters max):">
          <cat-textarea v-model="tweet" :maxlength="280" placeholder="What's happening?" />
        </cat-field>
        <p class="has-text-grey">
          {{ tweet.length }} / 280 characters
        </p>
      </t-demo-box>

      <!-- Fixed Size -->
      <t-demo-box label="Fixed Size (No Resize)">
        <cat-field label="Fixed size textarea:">
          <cat-textarea
            v-model="fixed"
            has-fixed-size
            placeholder="This textarea cannot be resized"
          />
        </cat-field>
      </t-demo-box>

      <!-- Practical Examples -->
      <t-demo-box label="Example: Feedback Form" example>
        <cat-field label="Your Feedback:" message="Help us improve our service">
          <cat-textarea
            v-model="feedback"
            :rows="5"
            placeholder="Tell us what you think..."
            :maxlength="500"
          />
        </cat-field>
        <p class="help">
          {{ feedback.length }} / 500 characters
        </p>
        <cat-button variant="primary" class="mt-3" @click="submitFeedback">
          Submit Feedback
        </cat-button>
      </t-demo-box>

      <!-- Code Editor -->
      <t-demo-box label="Example: Code Snippet" example>
        <cat-field label="Enter your code:">
          <cat-textarea
            v-model="code"
            :rows="8"
            placeholder="// Write your code here..."
            class="is-family-monospace"
          />
        </cat-field>
      </t-demo-box>

      <!-- Comment Section -->
      <t-demo-box label="Example: Comment Section" example>
        <cat-field label="Add a comment:">
          <cat-textarea
            v-model="comment"
            :rows="4"
            placeholder="Share your thoughts..."
            :maxlength="1000"
          />
        </cat-field>
        <div class="is-flex is-justify-content-space-between is-align-items-center mt-2">
          <p class="help">
            {{ comment.length }}/1000
          </p>
          <cat-button
            variant="primary"
            :disabled="comment.trim().length === 0"
            @click="postComment"
          >
            Post Comment
          </cat-button>
        </div>
      </t-demo-box>

      <!-- Description with Help -->
      <t-demo-box label="Example: With Help Text" example>
        <cat-field
          label="Product Description:"
          message="Provide a detailed description of your product"
        >
          <cat-textarea
            v-model="description"
            :rows="6"
            placeholder="Describe features, specifications, and benefits..."
          />
        </cat-field>
      </t-demo-box>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { TextareaVariants, TextareaSizes } from '../../../../src/controls/types'
import TDemoBox from '../../components/t-demo-box.vue'

const variants = TextareaVariants
const sizes = TextareaSizes

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const basic = ref('')

const variantValues = reactive<Record<string, string>>({})
for (const variant of variants) {
  variantValues[variant] = ''
}

const sizeValues = reactive<Record<string, string>>({})
for (const textareaSize of sizes) {
  sizeValues[textareaSize] = ''
}

const rows3 = ref('')
const rows5 = ref('')
const rows10 = ref('')

const stateDisabled = ref('This content cannot be edited')
const stateReadonly = ref('This is readonly text. You can select and copy it, but cannot modify it.')
const stateLoading = ref('')

const tweet = ref('Building an awesome component library with Vue and TypeScript! 🚀 #Vue #TypeScript #WebDev')
const fixed = ref('')
const feedback = ref('')
const code = ref('function hello() {\n  console.log("Hello, world!");\n}')
const comment = ref('')
const description = ref('')

const submitFeedback = () => {
  alert(`Feedback submitted: ${feedback.value}`)
}

const postComment = () => {
  alert(`Comment posted: ${comment.value}`)
  comment.value = ''
}
</script>
