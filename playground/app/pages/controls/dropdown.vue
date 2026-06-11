<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Dropdown Component
      </h1>
      <p class="subtitle">
        Contextual dropdown menu with custom triggers
      </p>

      <demo-box label="Basic Dropdown">
        <cat-dropdown label="Actions">
          <cat-dropdown-item value="edit">
            <cat-icon icon="pencil" size="small" />
            <span>Edit</span>
          </cat-dropdown-item>
          <cat-dropdown-item value="duplicate">
            <cat-icon icon="content-copy" size="small" />
            <span>Duplicate</span>
          </cat-dropdown-item>
          <cat-dropdown-item value="delete">
            <cat-icon icon="delete" size="small" />
            <span>Delete</span>
          </cat-dropdown-item>
        </cat-dropdown>
      </demo-box>

      <demo-box label="Trigger Variants">
        <div class="buttons">
          <cat-dropdown v-for="variant in triggerVariants" :key="variant" :button-variant="variant" :label="capitalize(variant)">
            <cat-dropdown-item value="1">
              Option 1
            </cat-dropdown-item>
            <cat-dropdown-item value="2">
              Option 2
            </cat-dropdown-item>
            <cat-dropdown-item value="3">
              Option 3
            </cat-dropdown-item>
          </cat-dropdown>
        </div>
      </demo-box>

      <demo-box label="Hoverable Dropdown">
        <p class="mb-3">
          Hover over the button to open the dropdown
        </p>
        <cat-dropdown hoverable label="Hover me" button-variant="link">
          <cat-dropdown-item value="option1">
            Option 1
          </cat-dropdown-item>
          <cat-dropdown-item value="option2">
            Option 2
          </cat-dropdown-item>
          <cat-dropdown-item value="option3">
            Option 3
          </cat-dropdown-item>
        </cat-dropdown>
      </demo-box>

      <demo-box label="With Icons">
        <cat-dropdown label="My Account" icon-left="account-circle">
          <cat-dropdown-item value="profile">
            <cat-icon icon="account" size="small" />
            <span>Profile</span>
          </cat-dropdown-item>
          <cat-dropdown-item value="settings">
            <cat-icon icon="cog" size="small" />
            <span>Settings</span>
          </cat-dropdown-item>
          <cat-dropdown-item separator />
          <cat-dropdown-item value="help">
            <cat-icon icon="help-circle" size="small" />
            <span>Help</span>
          </cat-dropdown-item>
          <cat-dropdown-item value="logout">
            <cat-icon icon="logout" size="small" />
            <span>Logout</span>
          </cat-dropdown-item>
        </cat-dropdown>
      </demo-box>

      <demo-box label="Dropdown Positions">
        <div class="buttons">
          <cat-dropdown label="Bottom Left (Default)">
            <cat-dropdown-item value="1">
              Item 1
            </cat-dropdown-item>
            <cat-dropdown-item value="2">
              Item 2
            </cat-dropdown-item>
          </cat-dropdown>

          <cat-dropdown position="bottom-right" label="Bottom Right">
            <cat-dropdown-item value="1">
              Item 1
            </cat-dropdown-item>
            <cat-dropdown-item value="2">
              Item 2
            </cat-dropdown-item>
          </cat-dropdown>

          <cat-dropdown position="top-left" label="Top Left">
            <cat-dropdown-item value="1">
              Item 1
            </cat-dropdown-item>
            <cat-dropdown-item value="2">
              Item 2
            </cat-dropdown-item>
          </cat-dropdown>

          <cat-dropdown position="top-right" label="Top Right">
            <cat-dropdown-item value="1">
              Item 1
            </cat-dropdown-item>
            <cat-dropdown-item value="2">
              Item 2
            </cat-dropdown-item>
          </cat-dropdown>
        </div>
      </demo-box>

      <demo-box label="With Disabled Items">
        <cat-dropdown label="File">
          <cat-dropdown-item value="new">
            <cat-icon icon="file-plus" size="small" />
            <span>New</span>
          </cat-dropdown-item>
          <cat-dropdown-item value="open">
            <cat-icon icon="folder-open" size="small" />
            <span>Open</span>
          </cat-dropdown-item>
          <cat-dropdown-item value="save" disabled>
            <cat-icon icon="content-save" size="small" />
            <span>Save (disabled)</span>
          </cat-dropdown-item>
          <cat-dropdown-item separator />
          <cat-dropdown-item value="export">
            <cat-icon icon="export" size="small" />
            <span>Export</span>
          </cat-dropdown-item>
        </cat-dropdown>
      </demo-box>

      <demo-box label="Custom Trigger">
        <cat-dropdown>
          <template #trigger="{ triggerAttrs }">
            <button type="button" class="button is-ghost navbar-item" v-bind="triggerAttrs">
              <span>More</span>
              <cat-icon icon="menu-down" size="small" />
            </button>
          </template>
          <cat-dropdown-item value="docs">
            Documentation
          </cat-dropdown-item>
          <cat-dropdown-item value="examples">
            Examples
          </cat-dropdown-item>
          <cat-dropdown-item value="api">
            API Reference
          </cat-dropdown-item>
        </cat-dropdown>
      </demo-box>

      <demo-box label="Multiple Selection (Array Model)">
        <p class="mb-3">
          Selected items: <strong>{{ multipleSelection.length > 0 ? multipleSelection.join(', ') : 'None' }}</strong>
        </p>
        <cat-dropdown v-model="multipleSelection as string[]" selectable multiple inline label="Select Multiple" button-variant="primary">
          <cat-dropdown-item value="cat">
            🐱 Cat
          </cat-dropdown-item>
          <cat-dropdown-item value="dog">
            🐶 Dog
          </cat-dropdown-item>
          <cat-dropdown-item value="rabbit">
            🐰 Rabbit
          </cat-dropdown-item>
          <cat-dropdown-item value="mouse">
            🐭 Mouse
          </cat-dropdown-item>
        </cat-dropdown>
      </demo-box>

      <demo-box label="Example: Interactive Actions" example>
        <p class="mb-3">
          Selected action: <strong>{{ selectedAction || 'None' }}</strong>
        </p>
        <cat-dropdown @select="handleSelect">
          <template #trigger="{ triggerAttrs }">
            <cat-button variant="primary" v-bind="triggerAttrs">
              <span>Choose Action</span>
              <cat-icon icon="menu-down" size="small" />
            </cat-button>
          </template>
          <cat-dropdown-item value="save">
            <cat-icon icon="content-save" size="small" />
            <span>Save</span>
          </cat-dropdown-item>
          <cat-dropdown-item value="export">
            <cat-icon icon="export" size="small" />
            <span>Export</span>
          </cat-dropdown-item>
          <cat-dropdown-item value="print">
            <cat-icon icon="printer" size="small" />
            <span>Print</span>
          </cat-dropdown-item>
          <cat-dropdown-item separator />
          <cat-dropdown-item value="share">
            <cat-icon icon="share-variant" size="small" />
            <span>Share</span>
          </cat-dropdown-item>
        </cat-dropdown>
      </demo-box>

      <demo-box label="Example: Notification Menu" example>
        <cat-dropdown>
          <template #trigger="{ triggerAttrs }">
            <cat-button variant="info" aria-label="Notifications" v-bind="triggerAttrs">
              <cat-icon icon="bell" size="small" />
              <span class="tag is-danger is-rounded">
                3
              </span>
            </cat-button>
          </template>
          <cat-dropdown-item>
            <div style="min-width: 250px;">
              <p class="has-text-weight-bold">
                New message from John
              </p>
              <p class="is-size-7 has-text-grey">
                2 minutes ago
              </p>
            </div>
          </cat-dropdown-item>
          <cat-dropdown-item separator />
          <cat-dropdown-item>
            <div style="min-width: 250px;">
              <p class="has-text-weight-bold">
                Update completed
              </p>
              <p class="is-size-7 has-text-grey">
                1 hour ago
              </p>
            </div>
          </cat-dropdown-item>
          <cat-dropdown-item separator />
          <cat-dropdown-item>
            <div style="min-width: 250px;">
              <p class="has-text-weight-bold">
                System maintenance scheduled
              </p>
              <p class="is-size-7 has-text-grey">
                Yesterday
              </p>
            </div>
          </cat-dropdown-item>
          <cat-dropdown-item separator />
          <cat-dropdown-item value="view-all">
            <p class="has-text-centered has-text-link">
              View all notifications
            </p>
          </cat-dropdown-item>
        </cat-dropdown>
      </demo-box>

      <demo-box label="Example: Language Selector" example>
        <p class="mb-3">
          Current language: <strong>{{ currentLanguage }}</strong>
        </p>
        <cat-dropdown @select="handleLanguageSelect">
          <template #trigger="{ triggerAttrs }">
            <cat-button v-bind="triggerAttrs">
              <cat-icon icon="translate" size="small" />
              <span>{{ currentLanguage }}</span>
              <cat-icon icon="menu-down" size="small" />
            </cat-button>
          </template>
          <cat-dropdown-item value="English">
            🇺🇸 English
          </cat-dropdown-item>
          <cat-dropdown-item value="Español">
            🇪🇸 Español
          </cat-dropdown-item>
          <cat-dropdown-item value="Français">
            🇫🇷 Français
          </cat-dropdown-item>
          <cat-dropdown-item value="Deutsch">
            🇩🇪 Deutsch
          </cat-dropdown-item>
          <cat-dropdown-item value="日本語">
            🇯🇵 日本語
          </cat-dropdown-item>
        </cat-dropdown>
      </demo-box>

      <demo-box label="Single Selection with v-model">
        <p class="mb-3">
          Selected option: <strong>{{ singleSelection || 'None' }}</strong>
        </p>
        <cat-dropdown v-model:model-value="singleSelection as any" selectable label="Select Option" button-variant="link">
          <cat-dropdown-item value="option1">
            Option 1
          </cat-dropdown-item>
          <cat-dropdown-item value="option2">
            Option 2
          </cat-dropdown-item>
          <cat-dropdown-item value="option3">
            Option 3
          </cat-dropdown-item>
        </cat-dropdown>
      </demo-box>

      <demo-box label="Example: Numeric Values" example>
        <p class="mb-3">
          Selected user ID: <strong>{{ selectedUserId || 'None' }}</strong>
        </p>
        <cat-dropdown v-model:model-value="selectedUserId as any" selectable label="Select User" button-variant="info">
          <cat-dropdown-item :value="1">
            👤 John Doe (ID: 1)
          </cat-dropdown-item>
          <cat-dropdown-item :value="2">
            👤 Jane Smith (ID: 2)
          </cat-dropdown-item>
          <cat-dropdown-item :value="3">
            👤 Bob Johnson (ID: 3)
          </cat-dropdown-item>
        </cat-dropdown>
      </demo-box>

      <demo-a11y
        pattern-name="Menu Button"
        pattern-url="https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/"
        :references="[
          { label: 'APG: Listbox pattern', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/listbox/', note: 'used when the `selectable` prop is set' },
          { label: 'APG: Menu and Menubar pattern', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/menubar/', note: 'reference for menu keyboard behavior' },
        ]"
        :keyboard="[
          { key: 'Enter / Space', description: 'When focus is on the trigger, toggles the menu; opening places focus on the first item (or the selected option in listbox mode).' },
          { key: 'ArrowDown', description: 'When focus is on the trigger, opens the menu and places focus on the first item (or the selected option in listbox mode).' },
          { key: 'ArrowUp', description: 'When focus is on the trigger, opens the menu and places focus on the last item.' },
          { key: 'ArrowDown / ArrowUp', description: 'When focus is inside the menu, moves focus to the next / previous item. Wraps at the ends.' },
          { key: 'Home / End', description: 'When focus is inside the menu, moves focus to the first / last item.' },
          { key: 'Enter / Space', description: 'When focus is on an item, activates the item.' },
          { key: 'Escape', description: 'Closes the menu and returns focus to the trigger.' },
          { key: 'Tab', description: 'When the menu is open, closes the menu and continues the page tab sequence.' },
          { key: 'Printable characters', description: 'Type-ahead: jumps focus to the next item whose label starts with the typed character(s). Multiple characters in quick succession extend the search (e.g., type \'ap\' to find the next item starting with \'ap\'). Space is reserved for activating the focused item.' },
        ]"
      >
        <template #notes>
          <p class="mt-3">
            With <code>selectable</code> the menu is a <code>role="listbox"</code> and items expose <code>aria-selected</code>; adding <code>multiple</code> further sets <code>aria-multiselectable="true"</code>. The default trigger button carries <code>aria-haspopup</code> (either <code>"menu"</code> or <code>"listbox"</code>) and <code>aria-expanded</code> that tracks open state.
          </p>
          <p class="mt-2">
            Custom triggers must spread the <code>triggerAttrs</code> slot prop onto their focusable element (<code>&lt;template #trigger="{ triggerAttrs }"&gt;&lt;cat-button v-bind="triggerAttrs"&gt;</code>) to get the same popup semantics. Click-to-toggle is on the trigger wrapper, so any trigger opens the menu on click without needing to call the slot's <code>toggle</code> helper, but the trigger element itself must be focusable (a real button, not a bare anchor) for keyboard users to reach it.
          </p>
          <p class="mt-2">
            When keyboard focus leaves the component while the menu is open (e.g. Tab from the trigger), the menu closes without moving focus.
          </p>
          <p class="mt-2">
            The menu renders in the browser top layer (Popover API) so it is not clipped by a scrollable ancestor such as a modal body; browsers without the API fall back to absolute positioning.
          </p>
        </template>
      </demo-a11y>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DropdownTriggerVariants } from '../../../../src/controls/types'
import DemoBox from '../../components/demo-box.vue'
import DemoA11y from '../../components/demo-a11y.vue'

const triggerVariants = DropdownTriggerVariants

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const selectedAction = ref('')
const currentLanguage = ref('English')
const singleSelection = ref<string | undefined>(undefined)
const multipleSelection = ref<string[]>(['cat', 'rabbit'])
const selectedUserId = ref<number | undefined>(undefined)

const handleSelect = (value: string) => {
  selectedAction.value = value
}

const handleLanguageSelect = (value: string) => {
  currentLanguage.value = value
}
</script>
