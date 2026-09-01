<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Field Component
      </h1>
      <p class="subtitle">
        Form field wrapper with label, message, and validation
      </p>

      <!-- Basic Field with Label -->
      <demo-box label="Basic Field with Label">
        <cat-field label="Username:">
          <cat-input v-model="username" placeholder="Enter username" />
        </cat-field>
        <cat-field label="Email:">
          <cat-input v-model="email" type="email" placeholder="you@example.com" />
        </cat-field>
      </demo-box>

      <!-- With Help Message -->
      <demo-box label="With Help Message">
        <cat-field label="Password:" message="Must be at least 8 characters">
          <cat-input v-model="password" type="password" placeholder="Enter password" />
        </cat-field>
        <cat-field label="Website:" message="Include http:// or https://">
          <cat-input v-model="website" type="url" placeholder="https://example.com" />
        </cat-field>
      </demo-box>

      <!-- Validation States -->
      <demo-box label="Validation States">
        <cat-field label="Valid Email:" variant="success" message="Email format is correct">
          <cat-input v-model="validEmail" type="email" variant="success" />
        </cat-field>
        <cat-field label="Invalid Email:" variant="danger" message="Please enter a valid email address">
          <cat-input v-model="invalidEmail" type="email" variant="danger" />
        </cat-field>
        <cat-field label="Warning:" variant="warning" message="This username might be taken">
          <cat-input v-model="warningUsername" variant="warning" />
        </cat-field>
        <cat-field label="Info:" variant="info" message="This field is optional">
          <cat-input v-model="infoField" variant="info" />
        </cat-field>
      </demo-box>

      <!-- Required Field -->
      <demo-box label="Required Field">
        <cat-field label="Full Name:">
          <cat-input v-model="fullName" placeholder="John Doe" />
        </cat-field>
        <cat-field label="Company:" message="This information is required">
          <cat-input v-model="company" placeholder="Acme Corp" />
        </cat-field>
      </demo-box>

      <!-- Horizontal Field -->
      <demo-box label="Horizontal Layout">
        <cat-field label="Name:" horizontal>
          <cat-input v-model="horizontalName" placeholder="First and last name" />
        </cat-field>
        <cat-field label="Email:" horizontal>
          <cat-input v-model="horizontalEmail" type="email" placeholder="Email address" />
        </cat-field>
        <cat-field label="Phone:" horizontal message="Include country code">
          <cat-input v-model="horizontalPhone" type="tel" placeholder="+1 (555) 123-4567" />
        </cat-field>
      </demo-box>

      <!-- Addons (Attached Controls) -->
      <demo-box label="Addons (Attached Controls)">
        <cat-field label="URL:" addons horizontal>
          <cat-input v-model="urlPath" expanded placeholder="username" />
          <cat-button variant="primary">
            Check
          </cat-button>
        </cat-field>

        <cat-field label="Amount:" addons horizontal>
          <cat-button>
            $
          </cat-button>
          <cat-input v-model="amount" type="number" expanded placeholder="0.00" />
          <cat-button variant="success">
            Submit
          </cat-button>
        </cat-field>

        <cat-field label="Search:" addons>
          <cat-input v-model="searchQuery" expanded placeholder="Search products..." />
          <cat-button variant="info">
            <cat-icon icon="magnify" />
          </cat-button>
        </cat-field>
      </demo-box>

      <!-- Grouped Fields (Side by Side) -->
      <demo-box label="Grouped Fields (Side by Side)">
        <cat-fieldset label="Actions">
          <cat-field grouped>
            <cat-button variant="primary">
              Save
            </cat-button>
            <cat-button variant="light">
              Cancel
            </cat-button>
            <cat-button variant="danger">
              Delete
            </cat-button>
          </cat-field>
        </cat-fieldset>

        <cat-field label="Search with button:" grouped>
          <cat-input v-model="searchQuery" expanded placeholder="Find a repository..." />
          <cat-button variant="info">
            Search
          </cat-button>
        </cat-field>
      </demo-box>

      <!-- Multiple Inputs with Addons -->
      <demo-box label="Multiple Inputs with Addons">
        <cat-fieldset label="Full name">
          <cat-field addons>
            <cat-input v-model="firstName" aria-label="First name" placeholder="First name" expanded />
            <cat-input v-model="lastName" aria-label="Last name" placeholder="Last name" expanded />
          </cat-field>
        </cat-fieldset>

        <cat-fieldset label="Date range">
          <cat-field addons>
            <cat-input v-model="startDate" aria-label="Start date" type="date" expanded />
            <div class="control">
              <span class="button is-static">to</span>
            </div>
            <cat-input v-model="endDate" aria-label="End date" type="date" expanded />
          </cat-field>
        </cat-fieldset>
      </demo-box>

      <!-- Practical Form Example -->
      <demo-box label="Example: Registration Form" example>
        <cat-field label="Username:" message="Choose a unique username">
          <cat-input v-model="regUsername" placeholder="username" />
        </cat-field>

        <cat-field label="Email Address:">
          <cat-input v-model="regEmail" type="email" placeholder="you@example.com" />
        </cat-field>

        <cat-field label="Password:" message="Minimum 8 characters">
          <cat-input v-model="regPassword" type="password" placeholder="••••••••" />
        </cat-field>

        <!--
          Routed through `variant` + `message` rather than a hand-written
          <p class="help">: that is what links the error to the input via
          aria-describedby and marks it aria-invalid.
        -->
        <cat-field
          label="Confirm Password:"
          :variant="passwordMismatch ? 'danger' : undefined"
          :message="passwordMismatch ? 'Passwords do not match' : undefined"
        >
          <cat-input
            v-model="regPasswordConfirm"
            type="password"
            placeholder="••••••••"
            :variant="passwordMismatch ? 'danger' : undefined"
          />
        </cat-field>

        <cat-field label="Country:">
          <cat-select v-model="regCountry" fullwidth>
            <option value="">
              Select a country
            </option>
            <option value="us">
              United States
            </option>
            <option value="uk">
              United Kingdom
            </option>
            <option value="ca">
              Canada
            </option>
            <option value="au">
              Australia
            </option>
          </cat-select>
        </cat-field>

        <cat-field>
          <cat-checkbox v-model="regTerms">
            I agree to the terms and conditions
          </cat-checkbox>
        </cat-field>

        <cat-field grouped>
          <cat-button
            variant="primary"
            :disabled="!canRegister"
            @click="handleRegister"
          >
            Register
          </cat-button>
          <cat-button @click="resetForm">
            Reset
          </cat-button>
        </cat-field>
      </demo-box>

      <!-- Stacked Fields -->
      <demo-box label="Example: Address Form" example>
        <cat-field label="Street Address:">
          <cat-input v-model="address.street" placeholder="123 Main St" />
        </cat-field>

        <cat-field label="Apartment, suite, etc.">
          <cat-input v-model="address.apt" placeholder="Apt 4B" />
        </cat-field>

        <div class="columns">
          <div class="column">
            <cat-field label="City:">
              <cat-input v-model="address.city" placeholder="New York" />
            </cat-field>
          </div>
          <div class="column">
            <cat-field label="State:">
              <cat-input v-model="address.state" placeholder="NY" />
            </cat-field>
          </div>
          <div class="column">
            <cat-field label="ZIP Code:">
              <cat-input v-model="address.zip" placeholder="10001" />
            </cat-field>
          </div>
        </div>
      </demo-box>

      <demo-a11y
        :references="[
          { label: 'W3C Tutorial: Labeling Controls', url: 'https://www.w3.org/WAI/tutorials/forms/labels/' },
          { label: 'W3C Tutorial: Grouping Controls', url: 'https://www.w3.org/WAI/tutorials/forms/grouping/' },
          { label: 'WCAG SC 1.3.1: Info and Relationships', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' },
          { label: 'WCAG SC 3.3.2: Labels or Instructions', url: 'https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html' },
        ]"
        :keyboard="[
          { key: 'Tab / Shift+Tab', description: 'Moves through the controls inside the field. cat-field adds no tab stop of its own.' },
          { key: 'Click on label', description: 'Focuses the associated control, which is what a correctly wired <label for> buys you.' },
        ]"
      >
        <template #intro>
          <code>&lt;cat-field label="…"&gt;</code> renders a real <code>&lt;label for&gt;</code>, and a <code>&lt;label&gt;</code> names <strong>exactly one</strong> control. Catenary controls that inject <code>FieldIdKey</code> — <code>cat-input</code>, <code>cat-select</code>, <code>cat-textarea</code>, <code>cat-slider</code>, <code>cat-taginput</code>, and anything built on them such as <code>cat-datepicker</code> and <code>cat-search-bar</code> — claim the generated id automatically. Anything else must be given it, or the label attaches to nothing: visually correct, and unnamed to a screen reader.
        </template>
        <template #notes>
          <p class="mt-3">
            <strong>Wrapping a non-catenary control.</strong> Take the id from the default slot. The same slot exposes <code>describedby</code>, which is the id of the help/validation message when one is rendered:
          </p>
          <pre class="mt-2"><code>&lt;cat-field v-slot="{ id, describedby }" label="Email" message="We never share it."&gt;
  &lt;input :id="id" :aria-describedby="describedby" class="input" type="email"&gt;
&lt;/cat-field&gt;</code></pre>
          <p class="mt-3">
            <strong>Controls that do not take the field id.</strong> <code>cat-checkbox</code>, <code>cat-radio</code> and <code>cat-switch</code> render their own wrapping <code>&lt;label&gt;</code> and are named by their slot content or <code>label</code> prop, so they ignore the field id on purpose — a second name would be concatenated onto the first. <code>cat-dropdown</code> has no labelable element at all. Put a <code>cat-field</code> label on none of these.
          </p>
          <p class="mt-3">
            <strong>A group of controls needs <code>cat-fieldset</code>, not <code>cat-field</code>.</strong> One <code>&lt;label&gt;</code> cannot name a set, so a label above several checkboxes, radios, switches or buttons is orphaned. <code>cat-fieldset</code> names the set with a <code>&lt;legend&gt;</code>, which assistive technology announces on entering the group. The <em>Grouped</em> and <em>Multiple Inputs</em> demos above use it for exactly this reason, and each control inside carries its own name.
          </p>
          <p class="mt-3">
            <strong>Two controls under one field share one id.</strong> The field mints a single id, so a second <code>cat-input</code> inside the same field would render a duplicate. Give every control after the first an explicit <code>id</code>, or split them into separate fields inside a <code>cat-fieldset</code>.
          </p>
          <p class="mt-3">
            <strong>Validation.</strong> Pass the error through <code>variant</code> and <code>message</code> rather than writing a <code>&lt;p class="help"&gt;</code> by hand. The message gets a stable id that wrapped controls merge into their <code>aria-describedby</code>, and <code>variant="danger"</code> renders <code>aria-invalid="true"</code> on the control — neither of which a hand-written paragraph provides. Colour is never the only signal: the message text carries the meaning.
          </p>
          <p class="mt-3">
            In development, <code>cat-field</code> warns in the console whenever its label resolves to nothing, to more than one element, or to no form control at all, and names the fix for that case.
          </p>
        </template>
      </demo-a11y>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DemoBox from '../../components/demo-box.vue'
import DemoA11y from '../../components/demo-a11y.vue'

const username = ref('')
const email = ref('')
const password = ref('')
const website = ref('')

const validEmail = ref('user@example.com')
const invalidEmail = ref('not-an-email')
const warningUsername = ref('john')
const infoField = ref('')

const fullName = ref('')
const company = ref('')

const horizontalName = ref('')
const horizontalEmail = ref('')
const horizontalPhone = ref('')

const urlPath = ref('')
const amount = ref('')
const searchQuery = ref('')

const firstName = ref('')
const lastName = ref('')
const startDate = ref('')
const endDate = ref('')

const regUsername = ref('')
const regEmail = ref('')
const regPassword = ref('')
const regPasswordConfirm = ref('')
const passwordMismatch = computed(() =>
  Boolean(regPassword.value && regPasswordConfirm.value && regPassword.value !== regPasswordConfirm.value))
const regCountry = ref<string | null>('')
const regTerms = ref<boolean | any[]>(false)

const address = ref({
  street: '',
  apt: '',
  city: '',
  state: '',
  zip: ''
})

const canRegister = computed(() => {
  return regUsername.value
    && regEmail.value
    && regPassword.value
    && regPassword.value === regPasswordConfirm.value
    && regTerms.value
})

const handleRegister = () => {
  alert('Registration submitted!')
}

const resetForm = () => {
  regUsername.value = ''
  regEmail.value = ''
  regPassword.value = ''
  regPasswordConfirm.value = ''
  regCountry.value = ''
  regTerms.value = false
}
</script>
