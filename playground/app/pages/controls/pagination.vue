<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Pagination Component
      </h1>
      <p class="subtitle">
        Navigation for paginated content with page numbers and controls
      </p>

      <!-- Basic Pagination -->
      <demo-box label="Basic Pagination">
        <cat-pagination v-model:current="basicPage" :total="100" :per-page="10" />
        <p class="has-text-grey mt-3">
          Current page: {{ basicPage }}
        </p>
      </demo-box>

      <!-- Positions -->
      <demo-box label="Positions">
        <div class="mb-4">
          <p class="has-text-weight-semibold mb-2">
            Left
          </p>
          <cat-pagination v-model:current="positionPage" :total="100" :per-page="10" position="left" />
        </div>
        <div class="mb-4">
          <p class="has-text-weight-semibold mb-2">
            Centered
          </p>
          <cat-pagination v-model:current="positionPage" :total="100" :per-page="10" position="centered" />
        </div>
        <div>
          <p class="has-text-weight-semibold mb-2">
            Right (default)
          </p>
          <cat-pagination v-model:current="positionPage" :total="100" :per-page="10" position="right" />
        </div>
      </demo-box>

      <!-- Sizes -->
      <demo-box label="Sizes">
        <div v-for="paginationSize in sizes" :key="paginationSize" class="mb-4">
          <p class="has-text-weight-semibold mb-2">
            {{ capitalize(paginationSize) }}
          </p>
          <cat-pagination v-model:current="sizePage" :total="100" :per-page="10" :size="paginationSize" />
        </div>
      </demo-box>

      <!-- Rounded -->
      <demo-box label="Rounded">
        <cat-pagination v-model:current="roundedPage" :total="100" :per-page="10" rounded />
      </demo-box>

      <!-- Custom Range -->
      <demo-box label="Custom Range">
        <div class="mb-4">
          <p class="has-text-weight-semibold mb-2">
            Range Before: 2, Range After: 2
          </p>
          <cat-pagination v-model:current="rangePage" :total="200" :per-page="10" :range-before="2" :range-after="2" />
        </div>
        <div>
          <p class="has-text-weight-semibold mb-2">
            Range Before: 3, Range After: 3
          </p>
          <cat-pagination v-model:current="rangePage" :total="200" :per-page="10" :range-before="3" :range-after="3" />
        </div>
        <p class="has-text-grey mt-3">
          Current page: {{ rangePage }}
        </p>
      </demo-box>

      <!-- Large Dataset -->
      <demo-box label="Large Dataset">
        <cat-pagination v-model:current="largePage" :total="1000" :per-page="25" />
        <p class="has-text-grey mt-3">
          Page {{ largePage }} of {{ Math.ceil(1000 / 25) }} ({{ 1000 }} total items)
        </p>
      </demo-box>

      <!-- Custom Per Page -->
      <demo-box label="Custom Items Per Page">
        <div class="mb-4">
          <div class="buttons">
            <cat-button
              v-for="perPage in [5, 10, 25, 50]"
              :key="perPage"
              :variant="customPerPage === perPage ? 'primary' : undefined"
              :outlined="customPerPage !== perPage"
              @click="customPerPage = perPage"
            >
              {{ perPage }}
            </cat-button>
          </div>
        </div>
        <cat-pagination v-model:current="customPage" :total="100" :per-page="customPerPage" />
        <p class="has-text-grey mt-3">
          Showing page {{ customPage }} with {{ customPerPage }} items per page ({{ Math.ceil(100 / customPerPage) }} total pages)
        </p>
      </demo-box>

      <!-- Example: Data Table -->
      <demo-box label="Example: Data Table with Pagination" example>
        <cat-table :data="paginatedData">
          <template #columns>
            <cat-table-column field="id" label="ID" />
            <cat-table-column field="name" label="Name" />
            <cat-table-column field="email" label="Email" />
          </template>
          <template #default="{ row }">
            <td>{{ row.id }}</td>
            <td>{{ row.name }}</td>
            <td>{{ row.email }}</td>
          </template>
        </cat-table>
        <div class="mt-4">
          <cat-pagination v-model:current="tablePage" :total="tableData.length" :per-page="tablePerPage" position="centered" />
        </div>
        <p class="has-text-grey has-text-centered mt-2">
          Showing {{ (tablePage - 1) * tablePerPage + 1 }} - {{ Math.min(tablePage * tablePerPage, tableData.length) }} of {{ tableData.length }} items
        </p>
      </demo-box>

      <demo-a11y
        :references="[
          { label: 'WAI-ARIA 1.2: aria-current', url: 'https://www.w3.org/TR/wai-aria-1.2/#aria-current' },
          { label: 'WAI-ARIA 1.2: navigation role', url: 'https://www.w3.org/TR/wai-aria-1.2/#navigation' },
        ]"
        :keyboard="[
          { key: 'Tab / Shift+Tab', description: 'Moves focus through the visible page-number and previous/next buttons.' },
          { key: 'Enter / Space', description: 'When focus is on a page button, navigates to that page.' },
        ]"
      >
        <template #intro>
          Renders a <code>&lt;nav role="navigation" aria-label="pagination"&gt;</code> containing native <code>&lt;button&gt;</code> elements. The current page button carries <code>aria-current="page"</code> so screen readers announce it as the current location within the pagination set.
        </template>
        <template #notes>
          <p class="mt-3">
            Every page button is labeled <code>Page N</code>, which screen readers combine with <code>aria-current</code> as e.g. <em>Page 7, current page</em>. The icon-only previous / next buttons are named via the <code>aria-previous-label</code> / <code>aria-next-label</code> props (defaults: <em>Previous page</em> / <em>Next page</em>), and the decorative ellipsis separators are hidden from assistive technology.
          </p>
          <p class="mt-2">
            When the current page is the first or last, the previous / next buttons are marked <code>disabled</code>, which removes them from the tab order and announces them as dimmed/unavailable.
          </p>
        </template>
      </demo-a11y>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { PaginationSizes } from '../../../../src/controls/types'
import DemoBox from '../../components/demo-box.vue'
import DemoA11y from '../../components/demo-a11y.vue'

const sizes = PaginationSizes

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

// Demo states
const basicPage = ref(1)
const positionPage = ref(5)
const sizePage = ref(3)
const roundedPage = ref(1)
const rangePage = ref(10)
const largePage = ref(1)
const customPage = ref(1)
const customPerPage = ref(10)

// Table example
const tablePage = ref(1)
const tablePerPage = 5

const tableData = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com' },
  { id: 6, name: 'Diana Miller', email: 'diana@example.com' },
  { id: 7, name: 'Edward Davis', email: 'edward@example.com' },
  { id: 8, name: 'Fiona Garcia', email: 'fiona@example.com' },
  { id: 9, name: 'George Martinez', email: 'george@example.com' },
  { id: 10, name: 'Helen Anderson', email: 'helen@example.com' },
  { id: 11, name: 'Ivan Taylor', email: 'ivan@example.com' },
  { id: 12, name: 'Julia Thomas', email: 'julia@example.com' },
  { id: 13, name: 'Kevin Jackson', email: 'kevin@example.com' },
  { id: 14, name: 'Laura White', email: 'laura@example.com' },
  { id: 15, name: 'Michael Harris', email: 'michael@example.com' }
]

const paginatedData = computed(() => {
  const start = (tablePage.value - 1) * tablePerPage
  const end = start + tablePerPage
  return tableData.slice(start, end)
})
</script>
