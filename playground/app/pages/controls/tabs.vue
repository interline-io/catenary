<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Tabs Component
      </h1>
      <p class="subtitle">
        Tabbed navigation with multiple content panels
      </p>

      <!-- Basic Tabs -->
      <demo-box label="Basic Tabs">
        <cat-tabs v-model="basicTab">
          <cat-tab-item label="Home" value="home">
            <div class="content">
              <h3>Home Content</h3>
              <p>This is the content for the Home tab.</p>
            </div>
          </cat-tab-item>
          <cat-tab-item label="Profile" value="profile">
            <div class="content">
              <h3>Profile Content</h3>
              <p>This is the content for the Profile tab.</p>
            </div>
          </cat-tab-item>
          <cat-tab-item label="Settings" value="settings">
            <div class="content">
              <h3>Settings Content</h3>
              <p>This is the content for the Settings tab.</p>
            </div>
          </cat-tab-item>
        </cat-tabs>
        <p class="has-text-grey">
          Active tab: {{ basicTab }}
        </p>
      </demo-box>

      <!-- Types -->
      <demo-box label="Types">
        <div v-for="tabsType in tabsTypes" :key="tabsType" class="mb-4">
          <h3 class="subtitle is-5">
            {{ formatType(tabsType) }}
          </h3>
          <cat-tabs v-model="typeValues[tabsType]" :type="tabsType">
            <cat-tab-item label="Home" value="1" />
            <cat-tab-item label="Profile" value="2" />
            <cat-tab-item label="Settings" value="3" />
          </cat-tabs>
        </div>
      </demo-box>

      <!-- With Icons -->
      <demo-box label="With Icons">
        <cat-tabs v-model="iconTab">
          <cat-tab-item label="Dashboard" value="dashboard" icon="view-dashboard" />
          <cat-tab-item label="Messages" value="messages" icon="email" />
          <cat-tab-item label="Notifications" value="notifications" icon="bell" />
          <cat-tab-item label="Settings" value="settings" icon="cog" />
        </cat-tabs>
      </demo-box>

      <!-- Sizes -->
      <demo-box label="Sizes">
        <div v-for="tabsSize in sizes" :key="tabsSize" class="mb-4">
          <h3 class="subtitle is-5">
            {{ capitalize(tabsSize) }}
          </h3>
          <cat-tabs v-model="sizeValues[tabsSize]" :size="tabsSize">
            <cat-tab-item label="Tab 1" value="1" />
            <cat-tab-item label="Tab 2" value="2" />
          </cat-tabs>
        </div>
      </demo-box>

      <!-- Alignment -->
      <demo-box label="Alignment">
        <div v-for="position in positions" :key="position" class="mb-4">
          <h3 class="subtitle is-5">
            {{ capitalize(position) }}{{ position === 'left' ? '-aligned' : position === 'right' ? '-aligned' : '' }}
          </h3>
          <cat-tabs v-model="positionValues[position]" :position="position">
            <cat-tab-item label="One" value="1" />
            <cat-tab-item label="Two" value="2" />
            <cat-tab-item label="Three" value="3" />
          </cat-tabs>
        </div>
      </demo-box>

      <!-- Full Width -->
      <demo-box label="Full Width">
        <cat-tabs v-model="fullWidth" expanded>
          <cat-tab-item label="First" value="1" />
          <cat-tab-item label="Second" value="2" />
          <cat-tab-item label="Third" value="3" />
          <cat-tab-item label="Fourth" value="4" />
        </cat-tabs>
      </demo-box>

      <!-- Practical Example: Settings Panel -->
      <demo-box label="Example: Settings Panel" example>
        <cat-tabs v-model="settingsTab" type="boxed">
          <cat-tab-item label="Account" value="account" icon="account">
            <div class="content">
              <h3>Account Settings</h3>
              <cat-field label="Username:">
                <cat-input v-model="settings.username" />
              </cat-field>
              <cat-field label="Email:">
                <cat-input v-model="settings.email" type="email" />
              </cat-field>
              <cat-button variant="primary">
                Save Changes
              </cat-button>
            </div>
          </cat-tab-item>
          <cat-tab-item label="Privacy" value="privacy" icon="lock">
            <div class="content">
              <h3>Privacy Settings</h3>
              <cat-field>
                <cat-switch v-model="settings.profilePublic">
                  Public Profile
                </cat-switch>
              </cat-field>
              <cat-field>
                <cat-switch v-model="settings.showActivity">
                  Show Activity Status
                </cat-switch>
              </cat-field>
              <cat-field>
                <cat-switch v-model="settings.allowMessages">
                  Allow Messages
                </cat-switch>
              </cat-field>
            </div>
          </cat-tab-item>
          <cat-tab-item label="Notifications" value="notifications" icon="bell">
            <div class="content">
              <h3>Notification Preferences</h3>
              <cat-field>
                <cat-checkbox v-model="settings.emailNotifications">
                  Email Notifications
                </cat-checkbox>
              </cat-field>
              <cat-field>
                <cat-checkbox v-model="settings.pushNotifications">
                  Push Notifications
                </cat-checkbox>
              </cat-field>
              <cat-field>
                <cat-checkbox v-model="settings.smsNotifications">
                  SMS Notifications
                </cat-checkbox>
              </cat-field>
            </div>
          </cat-tab-item>
          <cat-tab-item label="Security" value="security" icon="shield">
            <div class="content">
              <h3>Security Settings</h3>
              <cat-field label="Current Password:">
                <cat-input type="password" />
              </cat-field>
              <cat-field label="New Password:">
                <cat-input type="password" />
              </cat-field>
              <cat-field label="Confirm Password:">
                <cat-input type="password" />
              </cat-field>
              <cat-button variant="primary">
                Update Password
              </cat-button>
            </div>
          </cat-tab-item>
        </cat-tabs>
      </demo-box>

      <!-- Interactive Example -->
      <demo-box label="Example: Product Details" example>
        <cat-tabs v-model="productTab">
          <cat-tab-item label="Description" value="description">
            <div class="content">
              <h3>Product Description</h3>
              <p>
                This is a high-quality product with excellent features and outstanding performance.
                Perfect for both professional and personal use.
              </p>
              <ul>
                <li>Feature 1: Advanced technology</li>
                <li>Feature 2: Durable construction</li>
                <li>Feature 3: Easy to use</li>
                <li>Feature 4: Energy efficient</li>
              </ul>
            </div>
          </cat-tab-item>
          <cat-tab-item label="Specifications" value="specs">
            <div class="content">
              <h3>Technical Specifications</h3>
              <table class="table">
                <tbody>
                  <tr>
                    <td><strong>Dimensions</strong></td>
                    <td>10" x 8" x 2"</td>
                  </tr>
                  <tr>
                    <td><strong>Weight</strong></td>
                    <td>2.5 lbs</td>
                  </tr>
                  <tr>
                    <td><strong>Material</strong></td>
                    <td>Aluminum alloy</td>
                  </tr>
                  <tr>
                    <td><strong>Color</strong></td>
                    <td>Space Gray</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </cat-tab-item>
          <cat-tab-item label="Reviews" value="reviews">
            <div class="content">
              <h3>Customer Reviews</h3>
              <article class="message is-success">
                <div class="message-body">
                  <strong>5/5 - Excellent product!</strong>
                  <p>Exactly what I was looking for. Great quality and fast shipping.</p>
                  <small class="has-text-grey">- John D.</small>
                </div>
              </article>
              <article class="message is-info">
                <div class="message-body">
                  <strong>4/5 - Very good</strong>
                  <p>Works as advertised. Would recommend to others.</p>
                  <small class="has-text-grey">- Sarah M.</small>
                </div>
              </article>
            </div>
          </cat-tab-item>
        </cat-tabs>
      </demo-box>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { TabsSizes, TabsPositions, TabsTypes } from '../../../../src/controls/types'
import DemoBox from '../../components/demo-box.vue'

const sizes = TabsSizes
const positions = TabsPositions
const tabsTypes = TabsTypes

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
const formatType = (tabsType: string) => {
  if (tabsType === 'toggle-rounded') return 'Toggle Rounded'
  return capitalize(tabsType)
}

const basicTab = ref('home')
const iconTab = ref('dashboard')

const sizeValues = reactive<Record<string, string>>({})
for (const tabsSize of sizes) {
  sizeValues[tabsSize] = '1'
}

const positionValues = reactive<Record<string, string>>({})
for (const position of positions) {
  positionValues[position] = '2'
}

const typeValues = reactive<Record<string, string>>({})
for (const tabsType of tabsTypes) {
  typeValues[tabsType] = '1'
}

const fullWidth = ref('2')

const settingsTab = ref('account')
const settings = ref({
  username: 'johndoe',
  email: 'john@example.com',
  profilePublic: true,
  showActivity: true,
  allowMessages: false,
  emailNotifications: true,
  pushNotifications: false,
  smsNotifications: false
})

const productTab = ref('description')
</script>
