<script setup lang="ts">
import { ref } from 'vue'

const newsletter = ref('weekly')
const colors = ref<string[]>([])
const billing = ref({ first: '', last: '', email: '' })
const archivedColors = ref<string[]>(['blue'])
</script>

<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Fieldset Component
      </h1>
      <p class="subtitle">
        Groups related form controls under a single legend for assistive technology (WCAG 1.3.1, 3.3.2).
      </p>

      <demo-box label="Radio group">
        <cat-fieldset label="Newsletter frequency">
          <cat-radio v-model="newsletter" native-value="daily">
            Daily
          </cat-radio>
          <cat-radio v-model="newsletter" native-value="weekly">
            Weekly
          </cat-radio>
          <cat-radio v-model="newsletter" native-value="monthly">
            Monthly
          </cat-radio>
        </cat-fieldset>
        <p class="content is-small mt-3">
          Selected: <code>{{ newsletter }}</code>
        </p>
      </demo-box>

      <demo-box label="Checkbox group inside a fieldset">
        <cat-fieldset label="Favorite colors">
          <cat-checkbox-group
            v-model="colors"
            :options="['red', 'green', 'blue']"
            :hide-select-all="true"
            undefined-means-none
          />
        </cat-fieldset>
        <p class="content is-small mt-3">
          Selected: <code>{{ colors }}</code>
        </p>
      </demo-box>

      <demo-box label="Multiple related inputs under one legend">
        <cat-fieldset label="Billing contact">
          <cat-field label="First name">
            <cat-input v-model="billing.first" />
          </cat-field>
          <cat-field label="Last name">
            <cat-input v-model="billing.last" />
          </cat-field>
          <cat-field label="Email">
            <cat-input v-model="billing.email" type="email" />
          </cat-field>
        </cat-fieldset>
      </demo-box>

      <demo-box label="Hidden legend (still announced by screen readers)">
        <cat-fieldset label="Search filters" hidden-legend>
          <div class="field is-grouped">
            <cat-input placeholder="Search…" />
            <cat-button variant="primary">
              Search
            </cat-button>
          </div>
        </cat-fieldset>
      </demo-box>

      <demo-box label="Disabled fieldset disables every nested control">
        <cat-fieldset label="Archived selection" disabled>
          <cat-checkbox-group
            v-model="archivedColors"
            :options="['red', 'green', 'blue']"
            :hide-select-all="true"
            undefined-means-none
          />
        </cat-fieldset>
      </demo-box>

      <demo-box label="Checkbox group with its own label (renders as a fieldset)">
        <cat-checkbox-group
          v-model="colors"
          label="Favorite colors"
          :options="['red', 'green', 'blue']"
          :hide-select-all="true"
          undefined-means-none
        />
      </demo-box>

      <demo-a11y
        :references="[
          { label: 'W3C Tutorial: Grouping Controls', url: 'https://www.w3.org/WAI/tutorials/forms/grouping/' },
          { label: 'WCAG SC 1.3.1: Info and Relationships', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' },
          { label: 'WCAG SC 3.3.2: Labels or Instructions', url: 'https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html' },
        ]"
      >
        <template #intro>
          Renders as native <code>&lt;fieldset&gt;</code> with <code>&lt;legend&gt;</code> — the most reliable way to group related form controls so screen readers announce the group's name when entering it. Keyboard behavior is the browser default (Tab to enter and traverse the group; standard control keys inside).
        </template>
        <template #notes>
          <p class="mt-3">
            Use <code>hiddenLegend</code> (via Bulma's <code>.is-sr-only</code>) when the group's name is already visible in surrounding UI but you still want screen-reader users to hear the group context. Setting <code>disabled</code> on the fieldset disables every nested form control via native HTML — no extra wiring needed.
          </p>
        </template>
      </demo-a11y>
    </section>
  </div>
</template>
