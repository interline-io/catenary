<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Checkbox Component
      </h1>
      <p class="subtitle">
        Checkbox input control with various styles
      </p>

      <demo-box label="Basic Checkbox">
        <cat-field>
          <cat-checkbox v-model="basic">
            Checkbox label
          </cat-checkbox>
        </cat-field>
        <p class="has-text-grey">
          Checked: {{ basic }}
        </p>
      </demo-box>

      <demo-box label="Multiple Checkboxes">
        <cat-field>
          <cat-checkbox v-model="option1">
            Option 1
          </cat-checkbox>
        </cat-field>
        <cat-field>
          <cat-checkbox v-model="option2">
            Option 2
          </cat-checkbox>
        </cat-field>
        <cat-field>
          <cat-checkbox v-model="option3">
            Option 3
          </cat-checkbox>
        </cat-field>
        <p class="has-text-grey">
          Selected: {{ [option1 && 'Option 1', option2 && 'Option 2', option3 && 'Option 3'].filter(Boolean).join(', ') || 'None' }}
        </p>
      </demo-box>

      <demo-box label="Variants">
        <cat-field v-for="variant in variants" :key="variant">
          <cat-checkbox v-model="variantValues[variant]" :variant="variant">
            {{ capitalize(variant) }}
          </cat-checkbox>
        </cat-field>
      </demo-box>

      <demo-box label="Sizes">
        <cat-field v-for="size in sizes" :key="size">
          <cat-checkbox v-model="sizeValues[size]" :size="size">
            {{ capitalize(size) }} checkbox
          </cat-checkbox>
        </cat-field>
      </demo-box>

      <demo-box label="States">
        <cat-field>
          <cat-checkbox v-model="stateDisabled" disabled>
            Disabled checkbox
          </cat-checkbox>
        </cat-field>
        <cat-field>
          <cat-checkbox v-model="stateDisabledChecked" disabled>
            Disabled checked
          </cat-checkbox>
        </cat-field>
      </demo-box>

      <demo-box label="Indeterminate State">
        <p class="mb-3">
          The indeterminate state is useful for "Select All" checkboxes when some but not all items are selected.
        </p>
        <cat-field>
          <cat-checkbox
            v-model="selectAll"
            :indeterminate="indeterminate"
            @update:model-value="handleSelectAll"
          >
            <strong>Select All</strong>
          </cat-checkbox>
        </cat-field>
        <div class="ml-5 mt-3">
          <cat-field>
            <cat-checkbox v-model="items.item1" @update:model-value="updateSelectAll">
              Item 1
            </cat-checkbox>
          </cat-field>
          <cat-field>
            <cat-checkbox v-model="items.item2" @update:model-value="updateSelectAll">
              Item 2
            </cat-checkbox>
          </cat-field>
          <cat-field>
            <cat-checkbox v-model="items.item3" @update:model-value="updateSelectAll">
              Item 3
            </cat-checkbox>
          </cat-field>
          <cat-field>
            <cat-checkbox v-model="items.item4" @update:model-value="updateSelectAll">
              Item 4
            </cat-checkbox>
          </cat-field>
        </div>
        <p class="has-text-grey mt-3">
          Selected: {{ selectedItemsCount }} of {{ totalItems }}
        </p>
      </demo-box>

      <demo-box label="Array Binding">
        <p class="mb-3">
          Select your favorite fruits:
        </p>
        <cat-field>
          <cat-checkbox v-model="fruits" native-value="apple">
            Apple
          </cat-checkbox>
        </cat-field>
        <cat-field>
          <cat-checkbox v-model="fruits" native-value="banana">
            Banana
          </cat-checkbox>
        </cat-field>
        <cat-field>
          <cat-checkbox v-model="fruits" native-value="orange">
            Orange
          </cat-checkbox>
        </cat-field>
        <cat-field>
          <cat-checkbox v-model="fruits" native-value="grape">
            Grape
          </cat-checkbox>
        </cat-field>
        <p class="has-text-grey mt-3">
          Selected: {{ Array.isArray(fruits) && fruits.length > 0 ? fruits.join(', ') : 'None' }}
        </p>
      </demo-box>

      <demo-box label="With Additional Content">
        <cat-field>
          <cat-checkbox v-model="option1Content">
            <div>
              <strong>Option 1</strong>
              <p class="help">
                Additional content for option 1
              </p>
            </div>
          </cat-checkbox>
        </cat-field>
        <cat-field>
          <cat-checkbox v-model="option2Content">
            <div>
              <strong>Option 2</strong>
              <p class="help">
                Additional content for option 2
              </p>
            </div>
          </cat-checkbox>
        </cat-field>
      </demo-box>
      <demo-box label="Accessible name without a visible label">
        <p class="content is-small">
          A checkbox that selects a row has no visible text of its own. Give it
          <code>aria-label</code> so it is not announced as an unnamed checkbox.
        </p>
        <table class="table is-narrow">
          <caption class="is-sr-only">
            Shapes
          </caption>
          <thead>
            <tr><th><span class="is-sr-only">Select</span></th><th>Shape</th></tr>
          </thead>
          <tbody>
            <tr v-for="row in shapeRows" :key="row.id">
              <td>
                <cat-checkbox
                  :model-value="selectedShapes.includes(row.id)"
                  :aria-label="`Select ${row.name}`"
                  @update:model-value="toggleShape(row.id)"
                />
              </td>
              <td>{{ row.name }}</td>
            </tr>
          </tbody>
        </table>
        <p class="content is-small">
          Selected: <code>{{ selectedShapes }}</code>
        </p>
      </demo-box>

      <demo-box label="Custom true/false values">
        <p class="content is-small">
          <code>true-value</code> and <code>false-value</code> emit something other
          than a boolean, for a model that stores a string or a number.
        </p>
        <cat-checkbox v-model="consent" true-value="granted" false-value="denied">
          Share usage data
        </cat-checkbox>
        <p class="content is-small mt-2">
          Emitted: <code>{{ consent }}</code>
        </p>
      </demo-box>

      <demo-box label="Native form submission">
        <p class="content is-small">
          <code>name</code> and <code>value</code> put the checkbox in a native form's
          payload; <code>required</code> makes the browser enforce it.
        </p>
        <form class="cat-demo-form" @submit.prevent="onSubmit">
          <cat-checkbox name="terms" value="accepted" required>
            I accept the terms
          </cat-checkbox>
          <div class="mt-2">
            <cat-button type="submit" variant="primary" size="small">
              Submit
            </cat-button>
          </div>
        </form>
        <p class="content is-small mt-2">
          Submitted: <code>{{ submitted ?? '(nothing yet)' }}</code>
        </p>
      </demo-box>

      <demo-a11y
        :references="[
          { label: 'W3C Tutorial: Checkboxes', url: 'https://www.w3.org/WAI/tutorials/forms/checkbox/' },
          { label: 'WCAG SC 4.1.2: Name, Role, Value', url: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html' },
          { label: 'WCAG SC 1.3.1: Info and Relationships', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' },
        ]"
        :keyboard="[
          { key: 'Tab / Shift+Tab', description: 'Moves focus to and from the checkbox.' },
          { key: 'Space', description: 'Toggles the checkbox. Native behavior; nothing is intercepted.' },
        ]"
      >
        <template #intro>
          Renders a native <code>&lt;input type="checkbox"&gt;</code> inside its own <code>&lt;label&gt;</code>, so the slot content or the <code>label</code> prop <em>is</em> the accessible name and standard keyboard behavior applies unmodified. Because it names itself, do not also put a <code>&lt;cat-field label="…"&gt;</code> around it — that label would associate with nothing, and <code>cat-field</code> warns about it in development.
        </template>
        <template #notes>
          <p class="mt-3">
            <strong>A checkbox with no visible text needs <code>aria-label</code>.</strong> A row selector in a table is the usual case. Without it the control is announced as just "checkbox", with nothing to distinguish it from the others in the column. <code>aria-label</code> and <code>aria-describedby</code> are routed to the native input; <code>class</code> and <code>style</code> stay on the wrapping label, where they already applied.
          </p>
          <p class="mt-3">
            <strong>The mixed state is native.</strong> <code>indeterminate</code> sets the DOM property, which the browser maps to a mixed state in the accessibility tree — no <code>aria-checked</code> is set, because redundant ARIA over working native semantics is a regression, not an improvement. The APG's <code>aria-checked="mixed"</code> example is for custom <code>role="checkbox"</code> widgets, not native inputs.
          </p>
          <p class="mt-3">
            The browser clears <code>indeterminate</code> the moment the box is clicked. If the owner still considers the state mixed — a parent checkbox whose children have not changed — the component restores it, so the accessibility tree keeps reporting mixed rather than silently dropping to unchecked.
          </p>
          <p class="mt-3">
            <strong>Grouping.</strong> Several related checkboxes belong in a <code>&lt;cat-fieldset label="…"&gt;</code>, whose <code>&lt;legend&gt;</code> names the set. <code>cat-checkbox-group</code> does this for you and adds select-all/none controls.
          </p>
          <p class="mt-3">
            <strong>Disabled</strong> renders the native <code>disabled</code> attribute, so the control leaves the tab order and is announced as unavailable. It is dimmed to 50% opacity; WCAG's contrast minimum exempts disabled controls, but do not rely on the dimming alone to convey why something cannot be used.
          </p>
          <p class="mt-3">
            <code>data-state</code> (<code>checked</code> / <code>unchecked</code> / <code>indeterminate</code>) and <code>data-disabled</code> are on the wrapper for styling and test hooks, following the same convention as Reka UI.
          </p>
        </template>
      </demo-a11y>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { CoreVariants, CheckboxSizes } from '../../../../src/controls/types'
import DemoBox from '../../components/demo-box.vue'
import DemoA11y from '../../components/demo-a11y.vue'

const variants = CoreVariants
const sizes = CheckboxSizes

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const basic = ref<boolean>(false)

const shapeRows = [
  { id: 'shp_1', name: 'Route 12 — Northbound' },
  { id: 'shp_2', name: 'Route 12 — Southbound' },
  { id: 'shp_3', name: 'Route 40 — Loop' }
]
const selectedShapes = ref<string[]>(['shp_2'])
function toggleShape (id: string) {
  const i = selectedShapes.value.indexOf(id)
  if (i > -1) selectedShapes.value.splice(i, 1)
  else selectedShapes.value.push(id)
}

const consent = ref<string>('denied')

const submitted = ref<string | null>(null)
function onSubmit (event: Event) {
  const data = new FormData(event.target as HTMLFormElement)
  submitted.value = JSON.stringify(Object.fromEntries(data.entries()))
}
const option1 = ref<boolean>(false)
const option2 = ref<boolean>(true)
const option3 = ref<boolean>(false)

const variantValues = reactive<Record<string, boolean>>({
  primary: true,
  link: true,
  info: true,
  success: true,
  warning: true,
  danger: true
})

const sizeValues = reactive<Record<string, boolean>>({
  small: true,
  normal: true,
  medium: true,
  large: true
})

const stateDisabled = ref<boolean>(false)
const stateDisabledChecked = ref<boolean>(true)

const fruits = ref<string[]>(['banana', 'orange'])
const option1Content = ref<boolean>(true)
const option2Content = ref<boolean>(false)

// Indeterminate state demo
const selectAll = ref<boolean>(false)
const indeterminate = ref(true)
const items = ref<Record<string, boolean>>({
  item1: true,
  item2: false,
  item3: true,
  item4: false
})

const selectedItemsCount = computed(() => {
  return Object.values(items.value).filter(Boolean).length
})

const totalItems = computed(() => {
  return Object.keys(items.value).length
})

function updateSelectAll () {
  const selected = selectedItemsCount.value
  const total = totalItems.value

  if (selected === 0) {
    selectAll.value = false
    indeterminate.value = false
  } else if (selected === total) {
    selectAll.value = true
    indeterminate.value = false
  } else {
    selectAll.value = false
    indeterminate.value = true
  }
}

function handleSelectAll () {
  const newValue = selectAll.value
  items.value.item1 = newValue
  items.value.item2 = newValue
  items.value.item3 = newValue
  items.value.item4 = newValue
  indeterminate.value = false
}
</script>
