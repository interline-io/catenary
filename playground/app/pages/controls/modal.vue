<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Modal Component
      </h1>
      <p class="subtitle">
        Modal dialog with various configurations
      </p>

      <demo-box label="Basic Modal">
        <cat-button variant="primary" @click="showBasic = true">
          Open Basic Modal
        </cat-button>
        <cat-modal v-model="showBasic" title="Basic Modal">
          <p>This is a basic modal with a title and content.</p>
          <p>You can close it by clicking the X button or outside the modal.</p>
        </cat-modal>
      </demo-box>

      <demo-box label="Modal Sizes">
        <div class="buttons">
          <cat-button variant="info" @click="showSmall = true">
            Small Modal
          </cat-button>
          <cat-button variant="info" @click="showMedium = true">
            Medium Modal
          </cat-button>
          <cat-button variant="info" @click="showLarge = true">
            Large Modal
          </cat-button>
        </div>
        <cat-modal v-model="showSmall" title="Small Modal" size="small">
          <p>This is a small modal.</p>
        </cat-modal>
        <cat-modal v-model="showMedium" title="Medium Modal" size="medium">
          <p>This is a medium modal with more space for content.</p>
          <p>It can hold more information than a small modal.</p>
        </cat-modal>
        <cat-modal v-model="showLarge" title="Large Modal" size="large">
          <p>This is a large modal with plenty of space for extensive content.</p>
          <p>Perfect for forms or detailed information.</p>
          <p>You can add as much content as needed here.</p>
        </cat-modal>
      </demo-box>

      <demo-box label="Fullscreen Modal">
        <cat-button variant="success" @click="showFullscreen = true">
          Open Fullscreen Modal
        </cat-button>
        <cat-modal v-model="showFullscreen" title="Fullscreen Modal" full-screen>
          <div class="content">
            <h3>This modal takes up almost the entire viewport</h3>
            <p>Perfect for complex forms or detailed views.</p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Pellentesque risus mi, tempus quis placerat ut, porta nec nulla.
            </p>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
              <li>Item 3</li>
            </ul>
          </div>
        </cat-modal>
      </demo-box>

      <demo-box label="Modal with Footer">
        <cat-button variant="warning" @click="showFooter = true">
          Open Modal with Footer
        </cat-button>
        <cat-modal v-model="showFooter" title="Confirm Action">
          <p>Are you sure you want to proceed with this action?</p>
          <p>This operation cannot be undone.</p>
          <template #footer>
            <div class="buttons">
              <cat-button variant="danger" @click="handleConfirm">
                Confirm
              </cat-button>
              <cat-button @click="showFooter = false">
                Cancel
              </cat-button>
            </div>
          </template>
        </cat-modal>
      </demo-box>

      <demo-box label="Modal without Close Button">
        <cat-button variant="danger" @click="showNoClose = true">
          Open Modal (No Close Button)
        </cat-button>
        <cat-modal v-model="showNoClose" title="Important Message" :closable="false">
          <p>This modal doesn't have a close button.</p>
          <p>You must use the button below to close it.</p>
          <cat-button variant="primary" @click="showNoClose = false">
            I Understand
          </cat-button>
        </cat-modal>
      </demo-box>

      <demo-box label="Example: Form in Modal" example>
        <cat-button variant="primary" @click="showForm = true">
          Open Form Modal
        </cat-button>
        <cat-modal v-model="showForm" title="User Registration">
          <cat-field label="Full Name">
            <cat-input v-model="formData.name" placeholder="Enter your name" />
          </cat-field>
          <cat-field label="Email">
            <cat-input v-model="formData.email" type="email" placeholder="email@example.com" />
          </cat-field>
          <cat-field label="Password">
            <cat-input v-model="formData.password" type="password" placeholder="Enter password" />
          </cat-field>
          <cat-field label="Bio">
            <cat-textarea v-model="formData.bio" placeholder="Tell us about yourself" :rows="4" />
          </cat-field>
          <template #footer>
            <div class="buttons">
              <cat-button variant="primary" @click="handleSubmit">
                Submit
              </cat-button>
              <cat-button @click="showForm = false">
                Cancel
              </cat-button>
            </div>
          </template>
        </cat-modal>
        <cat-notification v-if="resultMessage" variant="success" class="mt-4">
          {{ resultMessage }}
        </cat-notification>
      </demo-box>

      <demo-box label="Example: Layered Escape (popups inside a modal)" example>
        <p class="mb-3">
          Open the modal, then open the dropdown or the date picker inside it.
          Pressing <kbd>Escape</kbd> closes only that popup; the modal stays
          open. A second <kbd>Escape</kbd> closes the modal. The form state you
          were entering is preserved through the first Escape.
        </p>
        <cat-button variant="primary" @click="showLayered = true">
          Open Modal with Popups
        </cat-button>
        <cat-modal v-model="showLayered" title="Schedule a trip">
          <cat-field label="Service day">
            <cat-dropdown v-model="layeredData.day" selectable :label="layeredData.day || 'Choose a day'">
              <cat-dropdown-item v-for="day in weekdays" :key="day" :value="day">
                {{ day }}
              </cat-dropdown-item>
            </cat-dropdown>
          </cat-field>
          <cat-field label="Date">
            <cat-datepicker v-model="layeredData.date" />
          </cat-field>
          <template #footer>
            <div class="buttons">
              <cat-button variant="primary" @click="showLayered = false">
                Done
              </cat-button>
            </div>
          </template>
        </cat-modal>
        <p class="mt-3 has-text-grey">
          Selected: {{ layeredData.day || 'no day' }},
          {{ layeredData.date ? layeredData.date.toLocaleDateString() : 'no date' }}
        </p>
      </demo-box>

      <demo-a11y
        pattern-name="Modal Dialog"
        pattern-url="https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/"
        :keyboard="[
          { key: 'Escape', description: 'Closes the modal (when `closable` is true; default).' },
          { key: 'Tab', description: 'Moves focus to the next focusable element inside the modal. From the last element, wraps to the first.' },
          { key: 'Shift + Tab', description: 'Moves focus to the previous focusable element. From the first element, wraps to the last.' },
        ]"
      >
        <template #notes>
          <p class="mt-3">
            The dialog renders with <code>role="dialog"</code>, <code>aria-modal="true"</code>, and either <code>aria-labelledby</code> pointing at the title (when set) or <code>aria-label</code> (defaults to "Dialog"). Pass <code>aria-describedby</code> with the id of a body element when the dialog needs longer-form context.
          </p>
          <p class="mt-2">
            On open, focus moves to the first focusable element inside the dialog. If the dialog has no focusable children, focus falls back to the title (preferred per APG: do not focus the dialog element itself) or the body wrapper. Tab and Shift+Tab cycle within the dialog. On close, focus returns to whatever element opened it; if that element is gone from the DOM, the restore is a safe no-op.
          </p>
          <p class="mt-2">
            Background clicks dismiss the modal when <code>closable</code> is true. Escape dismissal goes through a shared LIFO stack, so a popup opened inside the modal (a <code>cat-dropdown</code> menu or <code>cat-datepicker</code> calendar) closes on the first Escape and the modal on the second, rather than both at once. A non-closable modal still consumes Escape so it cannot dismiss a surface beneath it.
          </p>
          <p class="mt-2">
            When the body content is taller than the dialog, the scrollable body becomes a focusable region in the Tab order so keyboard users can scroll it.
          </p>
        </template>
      </demo-a11y>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DemoBox from '../../components/demo-box.vue'
import DemoA11y from '../../components/demo-a11y.vue'

const showBasic = ref(false)
const showSmall = ref(false)
const showMedium = ref(false)
const showLarge = ref(false)
const showFullscreen = ref(false)
const showFooter = ref(false)
const showNoClose = ref(false)
const showForm = ref(false)
const showLayered = ref(false)
const resultMessage = ref('')

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const layeredData = ref<{ day: string, date: Date | undefined }>({ day: '', date: undefined })

const formData = ref({
  name: '',
  email: '',
  password: '',
  bio: ''
})

const handleConfirm = () => {
  showFooter.value = false
}

const handleSubmit = () => {
  showForm.value = false
  resultMessage.value = `Form submitted for ${formData.value.name}`

  // Reset form
  setTimeout(() => {
    formData.value = { name: '', email: '', password: '', bio: '' }
    resultMessage.value = ''
  }, 3000)
}
</script>
