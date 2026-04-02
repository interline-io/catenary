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
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DemoBox from '../../components/demo-box.vue'

const showBasic = ref(false)
const showSmall = ref(false)
const showMedium = ref(false)
const showLarge = ref(false)
const showFullscreen = ref(false)
const showFooter = ref(false)
const showNoClose = ref(false)
const showForm = ref(false)
const resultMessage = ref('')

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
