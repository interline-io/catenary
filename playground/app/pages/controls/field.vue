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
        <cat-field label="Actions:" grouped>
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

        <cat-field label="Search with button:" grouped>
          <cat-input v-model="searchQuery" expanded placeholder="Find a repository..." />
          <cat-button variant="info">
            Search
          </cat-button>
        </cat-field>
      </demo-box>

      <!-- Multiple Inputs with Addons -->
      <demo-box label="Multiple Inputs with Addons">
        <cat-field label="Full Name:" addons>
          <cat-input v-model="firstName" placeholder="First name" expanded />
          <cat-input v-model="lastName" placeholder="Last name" expanded />
        </cat-field>

        <cat-field label="Date Range:" addons>
          <cat-input v-model="startDate" type="date" expanded />
          <div class="control">
            <span class="button is-static">to</span>
          </div>
          <cat-input v-model="endDate" type="date" expanded />
        </cat-field>
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

        <cat-field label="Confirm Password:">
          <cat-input
            v-model="regPasswordConfirm"
            type="password"
            placeholder="••••••••"
            :variant="regPassword && regPasswordConfirm && regPassword !== regPasswordConfirm ? 'danger' : undefined"
          />
          <template v-if="regPassword && regPasswordConfirm && regPassword !== regPasswordConfirm">
            <p class="help is-danger">
              Passwords do not match
            </p>
          </template>
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
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DemoBox from '../../components/demo-box.vue'

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
