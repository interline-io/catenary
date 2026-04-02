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
    </section>
  </div>
</template>

<script setup lang="ts">
import DemoBox from '../../components/demo-box.vue'

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
