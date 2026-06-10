<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Table Component
      </h1>
      <p class="subtitle">
        Sortable table component with column configuration
      </p>

      <demo-box label="Basic Table">
        <cat-table :data="basicData">
          <template #columns>
            <cat-table-column field="name" label="Name" />
            <cat-table-column field="age" label="Age" />
            <cat-table-column field="city" label="City" />
          </template>
          <template #default="{ row }">
            <td>{{ row.name }}</td>
            <td>{{ row.age }}</td>
            <td>{{ row.city }}</td>
          </template>
        </cat-table>
      </demo-box>

      <demo-box label="Sortable Columns">
        <cat-table :data="sortableData" hoverable>
          <template #columns>
            <cat-table-column field="product" label="Product" sortable />
            <cat-table-column field="price" label="Price" sortable numeric />
            <cat-table-column field="stock" label="Stock" sortable numeric />
            <cat-table-column field="category" label="Category" sortable />
          </template>
          <template #default="{ row }">
            <td>{{ row.product }}</td>
            <td class="has-text-right">
              ${{ row.price.toFixed(2) }}
            </td>
            <td class="has-text-right">
              {{ row.stock }}
            </td>
            <td>{{ row.category }}</td>
          </template>
        </cat-table>
      </demo-box>

      <demo-box label="Striped">
        <cat-table :data="basicData" striped>
          <template #columns>
            <cat-table-column field="name" label="Name" />
            <cat-table-column field="age" label="Age" />
            <cat-table-column field="city" label="City" />
          </template>
          <template #default="{ row }">
            <td>{{ row.name }}</td>
            <td>{{ row.age }}</td>
            <td>{{ row.city }}</td>
          </template>
        </cat-table>
      </demo-box>

      <demo-box label="Bordered">
        <cat-table :data="basicData" bordered>
          <template #columns>
            <cat-table-column field="name" label="Name" />
            <cat-table-column field="age" label="Age" />
            <cat-table-column field="city" label="City" />
          </template>
          <template #default="{ row }">
            <td>{{ row.name }}</td>
            <td>{{ row.age }}</td>
            <td>{{ row.city }}</td>
          </template>
        </cat-table>
      </demo-box>

      <demo-box label="Narrowed">
        <cat-table :data="basicData" narrowed>
          <template #columns>
            <cat-table-column field="name" label="Name" />
            <cat-table-column field="age" label="Age" />
            <cat-table-column field="city" label="City" />
          </template>
          <template #default="{ row }">
            <td>{{ row.name }}</td>
            <td>{{ row.age }}</td>
            <td>{{ row.city }}</td>
          </template>
        </cat-table>
      </demo-box>

      <demo-box label="Combined Modifiers">
        <cat-table :data="basicData" hoverable striped bordered>
          <template #columns>
            <cat-table-column field="name" label="Name" />
            <cat-table-column field="age" label="Age" />
            <cat-table-column field="city" label="City" />
          </template>
          <template #default="{ row }">
            <td>{{ row.name }}</td>
            <td>{{ row.age }}</td>
            <td>{{ row.city }}</td>
          </template>
        </cat-table>
      </demo-box>

      <demo-box label="Nested Field Sorting">
        <cat-table :data="nestedData" hoverable striped>
          <template #columns>
            <cat-table-column field="name" label="Name" sortable />
            <cat-table-column field="address.city" label="City" sortable />
            <cat-table-column field="address.country" label="Country" sortable />
            <cat-table-column field="contact.email" label="Email" sortable />
          </template>
          <template #default="{ row }">
            <td>{{ row.name }}</td>
            <td>{{ row.address.city }}</td>
            <td>{{ row.address.country }}</td>
            <td>{{ row.contact.email }}</td>
          </template>
        </cat-table>
      </demo-box>

      <demo-box label="Empty State">
        <cat-table :data="[]" hoverable>
          <template #columns>
            <cat-table-column field="name" label="Name" />
            <cat-table-column field="value" label="Value" />
          </template>
          <template #default="{ row }">
            <td>{{ row.name }}</td>
            <td>{{ row.value }}</td>
          </template>
          <template #empty>
            <div class="has-text-centered py-5">
              <cat-icon icon="inbox" size="large" />
              <p class="has-text-grey">
                No data available
              </p>
            </div>
          </template>
        </cat-table>
      </demo-box>

      <demo-a11y
        :references="[
          { label: 'W3C Tutorial: Tables', url: 'https://www.w3.org/WAI/tutorials/tables/' },
          { label: 'W3C Tutorial: Caption & Summary', url: 'https://www.w3.org/WAI/tutorials/tables/caption-summary/' },
          { label: 'WAI-ARIA 1.2: aria-sort', url: 'https://www.w3.org/TR/wai-aria-1.2/#aria-sort' },
        ]"
        :keyboard="[
          { key: 'Tab', description: 'Moves focus to each sortable column header button in turn.' },
          { key: 'Enter / Space', description: 'When focus is on a sortable header button, toggles or sets the sort direction.' },
        ]"
      >
        <template #intro>
          Uses native HTML table semantics (<code>&lt;table&gt;</code>, <code>&lt;caption&gt;</code>, <code>&lt;th&gt;</code>, <code>aria-sort</code>) rather than a WAI-ARIA widget pattern.
        </template>
        <template #notes>
          <p class="mt-3">
            Provide an accessible name with one of: a visible <code>caption</code> prop, <code>captionHidden</code> to hide the caption visually but expose it to assistive tech, <code>aria-labelledby</code> pointing at an id whose text names the table (e.g., a surrounding tab label), or <code>aria-label</code> as a fallback. Use <code>aria-describedby</code> for longer-form context that complements the name.
          </p>
          <p class="mt-2">
            Sortable column headers carry <code>scope="col"</code> and <code>aria-sort=ascending/descending/none</code>, and render the label inside a <code>&lt;button class="cat-table-sort"&gt;</code> so keyboard users can change sort by pressing Enter or Space.
          </p>
          <p class="mt-2">
            If you override the <code>#header</code> slot, the default header markup is replaced, so you must reproduce these semantics yourself: render <code>&lt;th scope="col" :aria-sort="ariaSort(column)"&gt;</code> for each sortable column using the <code>ariaSort</code> slot prop (the slot also exposes <code>columns</code>, <code>sort</code>, <code>sortField</code>, and <code>sortDirection</code>). Row-header cells in body rows should use <code>&lt;th scope="row"&gt;</code>.
          </p>
        </template>
      </demo-a11y>
    </section>
  </div>
</template>

<script setup lang="ts">
import DemoBox from '../../components/demo-box.vue'
import DemoA11y from '../../components/demo-a11y.vue'

const basicData = [
  { name: 'Alice Johnson', age: 28, city: 'New York' },
  { name: 'Bob Smith', age: 35, city: 'San Francisco' },
  { name: 'Carol White', age: 42, city: 'Chicago' },
  { name: 'David Brown', age: 31, city: 'Seattle' },
  { name: 'Eve Davis', age: 26, city: 'Austin' }
]

const sortableData = [
  { product: 'Laptop', price: 999.99, stock: 15, category: 'Electronics' },
  { product: 'Mouse', price: 29.99, stock: 50, category: 'Electronics' },
  { product: 'Desk Chair', price: 249.99, stock: 8, category: 'Furniture' },
  { product: 'Monitor', price: 349.99, stock: 22, category: 'Electronics' },
  { product: 'Keyboard', price: 79.99, stock: 35, category: 'Electronics' },
  { product: 'Desk Lamp', price: 45.99, stock: 18, category: 'Furniture' }
]

const nestedData = [
  {
    name: 'John Doe',
    address: { city: 'London', country: 'UK' },
    contact: { email: 'john@example.com' }
  },
  {
    name: 'Jane Smith',
    address: { city: 'Paris', country: 'France' },
    contact: { email: 'jane@example.com' }
  },
  {
    name: 'Mike Johnson',
    address: { city: 'Berlin', country: 'Germany' },
    contact: { email: 'mike@example.com' }
  },
  {
    name: 'Sarah Williams',
    address: { city: 'Tokyo', country: 'Japan' },
    contact: { email: 'sarah@example.com' }
  }
]
</script>
