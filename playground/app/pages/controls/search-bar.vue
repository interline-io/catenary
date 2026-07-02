<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Search Bar Component
      </h1>
      <p class="subtitle">
        Search input with suggestions and filtering
      </p>

      <demo-box label="Basic Search Bar">
        <cat-search-bar v-model="basicSearch" placeholder="Search..." />
        <p class="has-text-grey mt-3">
          Search query: {{ basicSearch || 'None' }}
        </p>
      </demo-box>

      <demo-box label="Example: Filtering a Table (screen-reader friendly)" example>
        <p class="mb-3">
          The search bar names itself ("Filter routes"), points at the table it
          filters via <code>aria-controls</code>, and feeds the result count into
          the <code>#status</code> slot &mdash; which renders into a polite live
          region so screen-reader users hear how many rows matched as they type.
        </p>
        <cat-search-bar
          v-model="tableFilter"
          placeholder="Filter routes..."
          aria-label="Filter routes"
          aria-controls="sb-routes-table"
        >
          <template #status>
            {{ filterStatus }}
          </template>
        </cat-search-bar>
        <table id="sb-routes-table" class="table is-fullwidth is-striped mt-3">
          <caption class="is-sr-only">
            Routes matching the current filter
          </caption>
          <thead>
            <tr>
              <th>Route</th>
              <th>Mode</th>
              <th>Agency</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="route in filteredRoutes" :key="route.id">
              <td>{{ route.name }}</td>
              <td>{{ route.mode }}</td>
              <td>{{ route.agency }}</td>
            </tr>
          </tbody>
        </table>
        <p v-if="filteredRoutes.length === 0" class="has-text-grey">
          No results found
        </p>
      </demo-box>

      <demo-box label="Example: Interactive Search with Results" example>
        <cat-search-bar
          v-model="interactiveSearch as string | null"
          placeholder="Search products..."
        />
        <div v-if="searchResults.length > 0" class="mt-4">
          <p class="has-text-weight-bold mb-3">
            Results ({{ searchResults.length }}):
          </p>
          <div class="list">
            <div v-for="result in searchResults" :key="result.id" class="list-item">
              <div class="is-flex is-justify-content-space-between is-align-items-center">
                <div>
                  <p class="has-text-weight-bold">
                    {{ result.name }}
                  </p>
                  <p class="is-size-7 has-text-grey">
                    {{ result.category }}
                  </p>
                </div>
                <cat-tag :variant="result.inStock ? 'success' : 'danger'">
                  {{ result.inStock ? 'In Stock' : 'Out of Stock' }}
                </cat-tag>
              </div>
            </div>
          </div>
        </div>
        <p v-else-if="interactiveSearch" class="has-text-grey mt-3">
          No results found
        </p>
      </demo-box>

      <demo-box label="Example: Search with Filters" example>
        <div class="field has-addons">
          <div class="control is-expanded">
            <cat-search-bar v-model="filterSearch" placeholder="Search..." />
          </div>
          <div class="control">
            <cat-select v-model="filterCategory">
              <option value="">
                All Categories
              </option>
              <option value="electronics">
                Electronics
              </option>
              <option value="clothing">
                Clothing
              </option>
              <option value="books">
                Books
              </option>
            </cat-select>
          </div>
          <div class="control">
            <cat-button variant="primary" icon="magnify" aria-label="Search" />
          </div>
        </div>
      </demo-box>

      <demo-box label="Example: Navbar Search" example>
        <nav class="navbar is-light">
          <div class="navbar-brand">
            <a class="navbar-item" href="#">
              <strong>Logo</strong>
            </a>
          </div>
          <div class="navbar-menu">
            <div class="navbar-start">
              <a class="navbar-item" href="#">Home</a>
              <a class="navbar-item" href="#">Products</a>
              <a class="navbar-item" href="#">About</a>
            </div>
            <div class="navbar-end">
              <div class="navbar-item">
                <cat-search-bar v-model="navbarSearch" placeholder="Search..." />
              </div>
            </div>
          </div>
        </nav>
      </demo-box>

      <demo-box label="Example: With Suggestions" example>
        <cat-search-bar
          v-model="suggestionSearch"
          placeholder="Type to see suggestions..."
        />
        <div v-if="suggestionSearch && suggestions.length > 0" class="dropdown is-active" style="width: 100%;">
          <div class="dropdown-menu" style="width: 100%;">
            <div class="dropdown-content">
              <a
                v-for="suggestion in suggestions"
                :key="suggestion"
                href="#"
                class="dropdown-item"
                @click.prevent="applySuggestion(suggestion)"
              >
                <cat-icon icon="magnify" class="mr-2" />
                {{ suggestion }}
              </a>
            </div>
          </div>
        </div>
      </demo-box>

      <demo-box label="Example: Advanced Search Form" example>
        <cat-search-bar v-model="advancedSearch" placeholder="Search..." class="mb-4" />
        <div v-if="showAdvancedOptions" class="content">
          <p class="has-text-weight-bold">
            Advanced Options:
          </p>
          <div class="columns">
            <div class="column">
              <cat-field label="Category:">
                <cat-select v-model="advancedCategory" fullwidth>
                  <option value="">
                    All
                  </option>
                  <option value="web">
                    Web
                  </option>
                  <option value="mobile">
                    Mobile
                  </option>
                  <option value="desktop">
                    Desktop
                  </option>
                </cat-select>
              </cat-field>
            </div>
            <div class="column">
              <cat-field label="Date Range:">
                <cat-select v-model="advancedDateRange" fullwidth>
                  <option value="any">
                    Any time
                  </option>
                  <option value="day">
                    Past 24 hours
                  </option>
                  <option value="week">
                    Past week
                  </option>
                  <option value="month">
                    Past month
                  </option>
                </cat-select>
              </cat-field>
            </div>
          </div>
          <cat-field>
            <cat-checkbox v-model="advancedExact">
              Exact match only
            </cat-checkbox>
          </cat-field>
        </div>
        <cat-button size="small" @click="showAdvancedOptions = !showAdvancedOptions">
          {{ showAdvancedOptions ? 'Hide' : 'Show' }} Advanced Options
        </cat-button>
      </demo-box>

      <demo-box label="Example: Real-time Search" example>
        <p class="mb-3">
          Search updates as you type
        </p>
        <cat-search-bar
          v-model="realtimeSearch"
          placeholder="Search users..."
        />
        <div v-if="isSearching" class="mt-3">
          <div class="is-flex is-align-items-center">
            <cat-loading />
            <span class="ml-3">Searching...</span>
          </div>
        </div>
        <div v-else-if="realtimeResults.length > 0" class="mt-3">
          <table class="table is-fullwidth is-hoverable">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in realtimeResults" :key="user.id">
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <cat-tag>
                    {{ user.role }}
                  </cat-tag>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </demo-box>

      <demo-a11y
        :references="[
          { label: 'WCAG SC 4.1.3: Status Messages', url: 'https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html' },
          { label: 'WCAG SC 3.3.2: Labels or Instructions', url: 'https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html' },
          { label: 'ARIA: search landmark role', url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/search_role' },
        ]"
        :keyboard="[
          { key: 'Tab / Shift+Tab', description: 'Moves focus into and out of the search field, and to the clear button when present.' },
          { key: 'Escape', description: 'Clears the field when it has a value (and stops there, so an enclosing modal or popup is not also dismissed). When the field is already empty, Escape is left to bubble.' },
          { key: 'Enter / Space', description: 'When focus is on the clear button, clears the field and returns focus to the input.' },
        ]"
      >
        <template #intro>
          Search fields usually have no visible label, so <code>cat-search-bar</code> names itself via <code>aria-label</code> (default <em>Search</em>). Override it to describe what is being searched (e.g. <code>"Filter routes"</code>), or set <code>:aria-label="undefined"</code> when a visible label already names the field.
        </template>
        <template #notes>
          <p class="mt-3">
            The clear button is a real <code>&lt;button&gt;</code> labelled <code>"Clear search"</code> (override with <code>clear-aria-label</code>); its icon is <code>aria-hidden</code>, and clearing &mdash; by click, Enter/Space, or Escape &mdash; returns focus to the input.
          </p>
          <p class="mt-2">
            When the search filters a table or report, pass the result count into the <code>#status</code> slot. It renders into a visually-hidden <code>role="status" aria-live="polite"</code> region so screen-reader users hear how many rows matched without the count needing to be visible. Pair it with <code>aria-controls</code> (forwarded to the input) referencing the <code>id</code> of the region the search updates, as in the table example above.
          </p>
        </template>
      </demo-a11y>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import DemoBox from '../../components/demo-box.vue'
import DemoA11y from '../../components/demo-a11y.vue'

const basicSearch = ref<string | null>('')
const navbarSearch = ref<string | null>('')

// Table-filter example: demonstrates aria-controls + the #status live region.
const tableFilter = ref<string | null>('')
const routes = [
  { id: 1, name: 'Route 1 - Downtown', mode: 'Bus', agency: 'Metro' },
  { id: 2, name: 'Route 12 - Airport', mode: 'Bus', agency: 'Metro' },
  { id: 3, name: 'Blue Line', mode: 'Light Rail', agency: 'Metro' },
  { id: 4, name: 'Ferry - Bay Crossing', mode: 'Ferry', agency: 'Harbor Transit' },
  { id: 5, name: 'Express 500', mode: 'Bus', agency: 'Regional' }
]
const filteredRoutes = computed(() => {
  const query = (tableFilter.value || '').trim().toLowerCase()
  if (!query) return routes
  return routes.filter(r =>
    `${r.name} ${r.mode} ${r.agency}`.toLowerCase().includes(query))
})
const filterStatus = computed(() => {
  const n = filteredRoutes.value.length
  return n === 0 ? 'No results found' : `${n} ${n === 1 ? 'result' : 'results'} found`
})

const interactiveSearch = ref('')
const products = [
  { id: 1, name: 'Laptop Computer', category: 'Electronics', inStock: true },
  { id: 2, name: 'Wireless Mouse', category: 'Electronics', inStock: true },
  { id: 3, name: 'Mechanical Keyboard', category: 'Electronics', inStock: false },
  { id: 4, name: 'USB Cable', category: 'Electronics', inStock: true },
  { id: 5, name: 'Monitor Stand', category: 'Accessories', inStock: true },
  { id: 6, name: 'Desk Lamp', category: 'Accessories', inStock: false }
]

const searchResults = computed(() => {
  if (!interactiveSearch.value) return []
  const query = (interactiveSearch.value || '').toLowerCase()
  return products.filter(p =>
    p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query))
})

const filterSearch = ref<string | null>('')
const filterCategory = ref<string | null>('')

const suggestionSearch = ref<string | null>('')
const allSuggestions = [
  'laptop computer',
  'laptop bag',
  'laptop stand',
  'wireless mouse',
  'wireless keyboard',
  'wireless headphones',
  'mechanical keyboard',
  'gaming keyboard'
]

const suggestions = computed(() => {
  if (!suggestionSearch.value) return []
  const query = (suggestionSearch.value || '').toLowerCase()
  return allSuggestions.filter(s => s.includes(query)).slice(0, 5)
})

const applySuggestion = (suggestion: string) => {
  suggestionSearch.value = suggestion
}

const advancedSearch = ref<string | null>('')
const showAdvancedOptions = ref(false)
const advancedCategory = ref<string | null>('')
const advancedDateRange = ref<string | null>('any')
const advancedExact = ref<boolean | any[]>(false)

const realtimeSearch = ref<string | null>('')
const isSearching = ref(false)
const allUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor' },
  { id: 4, name: 'Alice Williams', email: 'alice@example.com', role: 'User' },
  { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Admin' }
]

const realtimeResults = ref<typeof allUsers>([])

const handleRealtimeSearch = () => {
  if (!realtimeSearch.value) {
    realtimeResults.value = []
    return
  }

  isSearching.value = true
  setTimeout(() => {
    const query = realtimeSearch.value?.toLowerCase() || ''
    realtimeResults.value = allUsers.filter(u =>
      u.name.toLowerCase().includes(query)
      || u.email.toLowerCase().includes(query)
      || u.role.toLowerCase().includes(query))
    isSearching.value = false
  }, 500)
}

// Watch for changes and trigger search
watch(realtimeSearch, handleRealtimeSearch)
</script>

<style scoped>
.list {
  border: 1px solid #dbdbdb;
  border-radius: 4px;
}

.list-item {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #dbdbdb;
}

.list-item:last-child {
  border-bottom: none;
}

.list-item:hover {
  background-color: #f5f5f5;
}
</style>
