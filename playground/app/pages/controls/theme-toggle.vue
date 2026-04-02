<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Theme Toggle Component
      </h1>
      <p class="subtitle">
        Switch between light and dark themes
      </p>

      <demo-box label="Basic Usage">
        <p class="mb-3">
          Click the button below to toggle between light and dark themes. The preference is saved to localStorage.
        </p>
        <cat-theme-toggle />
      </demo-box>

      <demo-box label="Example: Theme Preview" example>
        <h3 class="subtitle is-5">
          Sample Content
        </h3>
        <p>
          This is regular paragraph text that adapts to the current theme.
        </p>
        <p class="has-text-grey">
          This is muted text using the <code>has-text-grey</code> class.
        </p>

        <div class="mt-4">
          <cat-field label="Sample Input">
            <cat-input v-model="sampleText" placeholder="Type something..." />
          </cat-field>
        </div>

        <div class="mt-4">
          <cat-field label="Sample Textarea">
            <cat-textarea v-model="sampleTextarea" placeholder="Enter multiple lines..." />
          </cat-field>
        </div>

        <div class="mt-4">
          <cat-field label="Sample Select">
            <cat-select v-model="sampleSelect">
              <option value="option1">
                Option 1
              </option>
              <option value="option2">
                Option 2
              </option>
              <option value="option3">
                Option 3
              </option>
            </cat-select>
          </cat-field>
        </div>

        <div class="mt-4">
          <cat-field>
            <cat-checkbox v-model="sampleCheckbox">
              Sample checkbox
            </cat-checkbox>
          </cat-field>
        </div>

        <div class="mt-4 buttons">
          <cat-button variant="primary">
            Primary Button
          </cat-button>
          <cat-button variant="info">
            Info Button
          </cat-button>
          <cat-button variant="success">
            Success Button
          </cat-button>
          <cat-button variant="warning">
            Warning Button
          </cat-button>
          <cat-button variant="danger">
            Danger Button
          </cat-button>
        </div>
      </demo-box>

      <demo-box label="Example: Cards" example>
        <div class="columns">
          <div class="column">
            <cat-card>
              <template #header>
                <p class="card-header-title">
                  Sample Card 1
                </p>
              </template>
              <div class="content">
                <p>Card content adapts to the theme automatically.</p>
              </div>
            </cat-card>
          </div>
          <div class="column">
            <cat-card>
              <template #header>
                <p class="card-header-title">
                  Sample Card 2
                </p>
              </template>
              <div class="content">
                <p>All components work seamlessly in both light and dark modes.</p>
              </div>
            </cat-card>
          </div>
        </div>
      </demo-box>

      <demo-box label="Example: Notifications" example>
        <cat-notification variant="info" class="mb-3">
          <strong>Info:</strong> This is an info notification.
        </cat-notification>
        <cat-notification variant="success" class="mb-3">
          <strong>Success:</strong> This is a success notification.
        </cat-notification>
        <cat-notification variant="warning" class="mb-3">
          <strong>Warning:</strong> This is a warning notification.
        </cat-notification>
        <cat-notification variant="danger">
          <strong>Error:</strong> This is an error notification.
        </cat-notification>
      </demo-box>

      <demo-box label="Example: Table" example>
        <cat-table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>John Doe</td>
              <td>john@example.com</td>
              <td>Developer</td>
            </tr>
            <tr>
              <td>Jane Smith</td>
              <td>jane@example.com</td>
              <td>Designer</td>
            </tr>
            <tr>
              <td>Bob Johnson</td>
              <td>bob@example.com</td>
              <td>Manager</td>
            </tr>
          </tbody>
        </cat-table>
      </demo-box>

      <demo-box label="Implementation">
        <h3 class="subtitle is-5">
          How It Works
        </h3>
        <p class="mb-3">
          The theme toggle component:
        </p>
        <ul>
          <li>Adds/removes the <code>theme-dark</code> class to the document root</li>
          <li>Saves the preference to localStorage</li>
          <li>Respects the system's <code>prefers-color-scheme</code> on first load</li>
          <li>Provides comprehensive dark theme styles for all Bulma components</li>
        </ul>

        <h3 class="subtitle is-5 mt-5">
          Usage
        </h3>
        <pre class="content"><code>&lt;cat-theme-toggle /&gt;</code></pre>

        <p class="help">
          Place this component anywhere in your layout, typically in the header or navigation bar.
        </p>
      </demo-box>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DemoBox from '../../components/demo-box.vue'

const sampleText = ref('')
const sampleTextarea = ref('')
const sampleSelect = ref('option1')
const sampleCheckbox = ref(false)
</script>
