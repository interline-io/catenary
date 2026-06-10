<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Notification Component
      </h1>
      <p class="subtitle">
        Alert messages with variants and actions
      </p>

      <demo-box label="Basic Notification">
        <cat-notification>
          This is a basic notification message.
        </cat-notification>
      </demo-box>

      <demo-box label="Variants">
        <cat-notification v-for="variant in variants" :key="variant" :variant="variant">
          <strong>{{ capitalize(variant) }}</strong> notification message.
        </cat-notification>
      </demo-box>

      <demo-box label="Light Variants">
        <cat-notification v-for="variant in variants" :key="variant" :variant="variant" light>
          <strong>{{ capitalize(variant) }}</strong> light notification.
        </cat-notification>
      </demo-box>

      <demo-box label="Closable">
        <cat-notification variant="info" closeable>
          <strong>Closable notification.</strong> Click the X to dismiss.
        </cat-notification>
      </demo-box>

      <demo-box label="Example: Closable Notifications" example>
        <cat-notification v-if="notifications.welcome" variant="info" closeable @close="notifications.welcome = false">
          <strong>Welcome!</strong> Thanks for joining our platform.
        </cat-notification>
        <cat-notification v-if="notifications.update" variant="success" closeable @close="notifications.update = false">
          <strong>Updated!</strong> Your profile has been updated successfully.
        </cat-notification>
        <cat-notification v-if="notifications.warning" variant="warning" closeable @close="notifications.warning = false">
          <strong>Attention:</strong> Your trial period expires in 3 days.
        </cat-notification>
        <cat-button v-if="!allNotificationsVisible" @click="resetNotifications">
          Show Notifications Again
        </cat-button>
      </demo-box>

      <demo-box label="Example: With Icons" example>
        <cat-notification variant="success">
          <div class="is-flex is-align-items-center">
            <cat-icon icon="check-circle" class="mr-2" />
            <span><strong>Success:</strong> Your file has been uploaded.</span>
          </div>
        </cat-notification>
        <cat-notification variant="info">
          <div class="is-flex is-align-items-center">
            <cat-icon icon="information" class="mr-2" />
            <span><strong>Info:</strong> New features are now available.</span>
          </div>
        </cat-notification>
        <cat-notification variant="warning">
          <div class="is-flex is-align-items-center">
            <cat-icon icon="alert" class="mr-2" />
            <span><strong>Warning:</strong> Scheduled maintenance at midnight.</span>
          </div>
        </cat-notification>
        <cat-notification variant="danger">
          <div class="is-flex is-align-items-center">
            <cat-icon icon="alert-circle" class="mr-2" />
            <span><strong>Error:</strong> Failed to connect to server.</span>
          </div>
        </cat-notification>
      </demo-box>

      <demo-box label="Example: With Action Buttons" example>
        <cat-notification variant="primary">
          <div class="is-flex is-justify-content-space-between is-align-items-center">
            <div>
              <strong>New version available!</strong>
              <p>Version 2.0.0 is ready to install.</p>
            </div>
            <div class="buttons">
              <cat-button size="small">
                Update Now
              </cat-button>
              <cat-button size="small" variant="light">
                Later
              </cat-button>
            </div>
          </div>
        </cat-notification>

        <cat-notification variant="warning" light>
          <div class="is-flex is-justify-content-space-between is-align-items-center">
            <div>
              <strong>Cookies Policy</strong>
              <p>We use cookies to improve your experience.</p>
            </div>
            <div class="buttons">
              <cat-button size="small" variant="warning">
                Accept
              </cat-button>
              <cat-button size="small">
                Learn More
              </cat-button>
            </div>
          </div>
        </cat-notification>
      </demo-box>

      <demo-box label="Example: Form Submission Status" example>
        <cat-field label="Email:">
          <cat-input v-model="email" type="email" placeholder="your@email.com" />
        </cat-field>
        <cat-button variant="primary" @click="submitForm">
          Submit
        </cat-button>
        <cat-notification v-if="formStatus === 'success'" variant="success" light role="status" class="mt-3">
          <cat-icon icon="check-circle" />
          Form submitted successfully! Check your email for confirmation.
        </cat-notification>
        <cat-notification v-if="formStatus === 'error'" variant="danger" light role="alert" class="mt-3">
          <cat-icon icon="alert-circle" />
          Failed to submit form. Please try again.
        </cat-notification>
        <p class="is-size-7 has-text-grey mt-2">
          These notifications appear dynamically, so they carry the
          <code>role</code> prop: <code>alert</code> for the error,
          <code>status</code> for the confirmation.
        </p>
      </demo-box>

      <demo-box label="Example: Loading State" example>
        <cat-notification variant="info">
          <div class="is-flex is-align-items-center">
            <cat-loading />
            <span class="ml-3">Processing your request...</span>
          </div>
        </cat-notification>
      </demo-box>

      <demo-box label="Example: Multi-line Content" example>
        <cat-notification variant="info" light>
          <p class="has-text-weight-bold">
            <cat-icon icon="lightbulb" />
            Pro Tip
          </p>
          <p>
            You can use keyboard shortcuts to navigate faster:
          </p>
          <ul class="mt-2">
            <li><kbd>Ctrl</kbd> + <kbd>S</kbd> to save</li>
            <li><kbd>Ctrl</kbd> + <kbd>Z</kbd> to undo</li>
            <li><kbd>Ctrl</kbd> + <kbd>F</kbd> to search</li>
          </ul>
        </cat-notification>
      </demo-box>

      <demo-a11y
        :references="[
          { label: 'APG: Alert pattern', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/alert/' },
          { label: 'MDN: ARIA status role', url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/status_role' },
          { label: 'MDN: ARIA alert role', url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/alert_role' },
        ]"
        :keyboard="[
          { key: 'Tab', description: 'Moves focus to the close button when closeable is set.' },
          { key: 'Enter / Space', description: 'When focus is on the close button, dismisses the notification.' },
        ]"
      >
        <template #intro>
          The close button is a real <code>&lt;button type="button"&gt;</code> with an accessible name from the <code>aria-close-label</code> prop (default <em>Dismiss notification</em>), so it no longer announces as an unnamed button or submits an enclosing form.
        </template>
        <template #notes>
          <p class="mt-3">
            Notifications shown dynamically (toasts, form feedback, query results) should set the <code>role</code> prop so screen readers announce them: <code>alert</code> for errors that must interrupt, <code>status</code> for everything else. Static notifications that are part of the page when it loads should omit <code>role</code>; announcing them on load is noise.
          </p>
          <p class="mt-2">
            Reliability caveat: <code>role="alert"</code> is designed to announce when the element is inserted, and does so consistently. <code>role="status"</code> announces most reliably when the live region already exists and its text changes; if a status notification inserted with its content is not announced in some screen readers, render the notification element ahead of time and fill in the message, or keep a persistent container.
          </p>
        </template>
      </demo-a11y>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NotificationVariants } from '../../../../src/controls/types'
import DemoBox from '../../components/demo-box.vue'
import DemoA11y from '../../components/demo-a11y.vue'

const variants = NotificationVariants

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const notifications = ref({
  welcome: true,
  update: true,
  warning: true
})

const allNotificationsVisible = computed(() => {
  return notifications.value.welcome || notifications.value.update || notifications.value.warning
})

const resetNotifications = () => {
  notifications.value = {
    welcome: true,
    update: true,
    warning: true
  }
}

const email = ref('')
const formStatus = ref<'success' | 'error' | null>(null)

const submitForm = () => {
  if (email.value.includes('@')) {
    formStatus.value = 'success'
  } else {
    formStatus.value = 'error'
  }
  setTimeout(() => {
    formStatus.value = null
  }, 5000)
}
</script>
