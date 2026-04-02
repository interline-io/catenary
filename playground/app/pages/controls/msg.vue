<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Msg Component
      </h1>
      <p class="subtitle">
        Message box for displaying important information
      </p>

      <demo-box label="Basic Message">
        <cat-msg>
          This is a basic message box.
        </cat-msg>
      </demo-box>

      <demo-box label="Variants">
        <cat-msg v-for="variant in variants" :key="variant" :variant="variant">
          <strong>{{ capitalize(variant) }}:</strong> This is a {{ variant }} message variant.
        </cat-msg>
      </demo-box>

      <demo-box label="With Title">
        <cat-msg variant="info" title="Did you know?">
          You can use keyboard shortcuts to navigate the application faster.
          Press <kbd>?</kbd> to see all available shortcuts.
        </cat-msg>
        <cat-msg variant="success" title="Well done!">
          You have successfully completed all the required steps. Your account is now active.
        </cat-msg>
        <cat-msg variant="warning" title="Action Required">
          Your subscription expires in 7 days. Please update your payment method to continue using our services.
        </cat-msg>
      </demo-box>

      <demo-box label="With Icons">
        <cat-msg variant="info" show-icon>
          <template #header>
            <div class="is-flex is-align-items-center">
              <cat-icon icon="information" class="mr-2" />
              <span class="has-text-weight-bold">Information</span>
            </div>
          </template>
          <p>
            This message includes an icon in the header for better visual communication.
          </p>
        </cat-msg>
        <cat-msg variant="success">
          <template #header>
            <div class="is-flex is-align-items-center">
              <cat-icon icon="check-circle" class="mr-2" />
              <span class="has-text-weight-bold">Success</span>
            </div>
          </template>
          <p>
            Your changes have been saved successfully.
          </p>
        </cat-msg>
      </demo-box>

      <demo-box label="Icon Sizes">
        <cat-msg variant="info" show-icon icon-size="small">
          Small icon size.
        </cat-msg>
        <cat-msg variant="success" show-icon icon-size="medium">
          Medium icon size.
        </cat-msg>
        <cat-msg variant="warning" show-icon icon-size="large">
          Large icon size (default).
        </cat-msg>
      </demo-box>

      <demo-box label="Closable Messages">
        <cat-msg v-if="messages.tips" variant="info" closable @close="messages.tips = false">
          <template #header>
            <span class="has-text-weight-bold">
              Pro Tip
            </span>
          </template>
          <p>
            You can customize the theme in your settings panel.
          </p>
        </cat-msg>
        <cat-msg v-if="messages.announcement" variant="primary" closable @close="messages.announcement = false">
          <template #header>
            <span class="has-text-weight-bold">
              Announcement
            </span>
          </template>
          <p>
            New features have been added to the dashboard!
          </p>
        </cat-msg>
        <cat-button v-if="!allMessagesVisible" @click="resetMessages">
          Show Messages Again
        </cat-button>
      </demo-box>

      <demo-box label="Expandable Messages">
        <cat-msg expandable title="Click to expand">
          This content is hidden by default. Click the header to reveal it.
          You can use this for FAQ sections, additional details, or collapsible information.
        </cat-msg>
        <cat-msg expandable :open="true" title="Initially expanded" variant="info">
          This message starts expanded. Click the header to collapse it.
        </cat-msg>
        <cat-msg v-model:open="msgOpen" expandable title="Controlled state" variant="success">
          <p>This message's state is controlled externally via <code>v-model:open</code>.</p>
          <p class="mt-2">
            Current state: <strong>{{ msgOpen ? 'Open' : 'Closed' }}</strong>
          </p>
        </cat-msg>
        <div class="buttons mt-3">
          <cat-button size="small" @click="msgOpen = !msgOpen">
            Toggle Controlled Message
          </cat-button>
        </div>
      </demo-box>

      <demo-box label="Example: System Messages" example>
        <cat-msg variant="warning">
          <template #header>
            <div class="is-flex is-align-items-center">
              <cat-icon icon="alert" class="mr-2" />
              <span class="has-text-weight-bold">Scheduled Maintenance</span>
            </div>
          </template>
          <p>
            Our systems will be under maintenance on <strong>Saturday, January 15th</strong>
            from <strong>2:00 AM to 6:00 AM EST</strong>.
          </p>
          <p class="mt-2">
            During this time, you may experience brief interruptions in service.
          </p>
        </cat-msg>

        <cat-msg variant="danger">
          <template #header>
            <div class="is-flex is-align-items-center">
              <cat-icon icon="alert-circle" class="mr-2" />
              <span class="has-text-weight-bold">Service Disruption</span>
            </div>
          </template>
          <p>
            We're currently experiencing technical difficulties. Our team is working
            to resolve the issue as quickly as possible.
          </p>
          <p class="mt-2">
            <strong>Affected services:</strong> Authentication, API access, File uploads
          </p>
        </cat-msg>
      </demo-box>

      <demo-box label="Example: Feature Announcements" example>
        <cat-msg variant="success">
          <template #header>
            <div class="is-flex is-align-items-center">
              <cat-icon icon="new-box" class="mr-2" />
              <span class="has-text-weight-bold">New Feature Released!</span>
            </div>
          </template>
          <p>
            We've just released our new dark mode theme. You can enable it in your
            profile settings.
          </p>
          <div class="buttons mt-3">
            <cat-button size="small" variant="success">
              Try it now
            </cat-button>
            <cat-button size="small" variant="light">
              Learn more
            </cat-button>
          </div>
        </cat-msg>
      </demo-box>

      <demo-box label="Example: Help & Documentation" example>
        <cat-msg variant="info">
          <template #header>
            <div class="is-flex is-align-items-center">
              <cat-icon icon="help-circle" class="mr-2" />
              <span class="has-text-weight-bold">Need Help?</span>
            </div>
          </template>
          <div class="content">
            <p>
              Here are some resources that might help:
            </p>
            <ul>
              <li>
                <a href="#">Documentation</a> - Comprehensive guides and API reference
              </li>
              <li>
                <a href="#">Community Forum</a> - Ask questions and share knowledge
              </li>
              <li>
                <a href="#">Video Tutorials</a> - Step-by-step video guides
              </li>
              <li>
                <a href="#">Contact Support</a> - Get help from our support team
              </li>
            </ul>
          </div>
        </cat-msg>
      </demo-box>

      <demo-box label="Example: Form Validation" example>
        <cat-field label="Email:">
          <cat-input v-model="validationEmail" type="email" />
        </cat-field>
        <cat-button variant="primary" @click="validateForm">
          Validate
        </cat-button>
        <cat-msg v-if="validationStatus === 'success'" variant="success" class="mt-3">
          <template #header>
            <span class="has-text-weight-bold">
              Validation Passed
            </span>
          </template>
          <p>
            All fields are valid. You can proceed with submission.
          </p>
        </cat-msg>
        <cat-msg v-if="validationStatus === 'error'" variant="danger" class="mt-3">
          <template #header>
            <span class="has-text-weight-bold">
              Validation Failed
            </span>
          </template>
          <ul>
            <li>Email address is required</li>
            <li>Please enter a valid email format</li>
          </ul>
        </cat-msg>
      </demo-box>

      <demo-box label="Example: Promotional Message" example>
        <cat-msg variant="primary">
          <template #header>
            <span class="has-text-weight-bold">
              Limited Time Offer
            </span>
          </template>
          <p>
            Upgrade to Pro and get <strong>50% off</strong> your first year!
            This offer expires in 48 hours.
          </p>
          <div class="buttons mt-3">
            <cat-button variant="primary">
              Upgrade Now
            </cat-button>
            <cat-button variant="light">
              Compare Plans
            </cat-button>
          </div>
        </cat-msg>
      </demo-box>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { MsgVariants } from '../../../../src/controls/types'
import DemoBox from '../../components/demo-box.vue'

const variants = MsgVariants

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const messages = ref({
  tips: true,
  announcement: true
})

const msgOpen = ref(false)

const allMessagesVisible = computed(() => {
  return messages.value.tips || messages.value.announcement
})

const resetMessages = () => {
  messages.value = {
    tips: true,
    announcement: true
  }
}

const validationEmail = ref('')
const validationStatus = ref<'success' | 'error' | null>(null)

const validateForm = () => {
  if (validationEmail.value && validationEmail.value.includes('@')) {
    validationStatus.value = 'success'
  } else {
    validationStatus.value = 'error'
  }
}
</script>
