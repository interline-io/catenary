<template>
  <div class="table-container">
    <div style="display: none;">
      <slot name="columns" />
    </div>
    <table
      class="table cat-table"
      :class="tableClasses"
      :aria-label="ariaLabel"
      :aria-labelledby="ariaLabelledby"
      :aria-describedby="ariaDescribedby"
    >
      <caption v-if="hasCaption" :class="{ 'is-sr-only': captionHidden }">
        <slot name="caption">
          {{ caption }}
        </slot>
      </caption>
      <thead v-if="hasHeader">
        <tr>
          <!--
            Custom headers replace the default <th> markup below; to keep sort
            state exposed to assistive technology they must render
            <th scope="col" :aria-sort="ariaSort(column)"> for each sortable
            column, using the ariaSort slot prop.
          -->
          <slot
            name="header"
            :columns="columns"
            :sort="handleSort"
            :sort-field="sortField"
            :sort-direction="sortDirection"
            :aria-sort="getAriaSort"
          >
            <th
              v-for="column in columns"
              :key="column.field"
              scope="col"
              :class="getHeaderClasses(column)"
              :aria-sort="getAriaSort(column)"
            >
              <button
                v-if="column.sortable"
                type="button"
                class="cat-table-sort"
                @click="handleSort(column.field)"
              >
                {{ column.label }}
                <!-- Sort state is exposed via aria-sort on the header cell;
                     the glyph is decorative. -->
                <span class="cat-sort-icon" aria-hidden="true">
                  <i v-if="sortField === column.field" :class="sortIcon" />
                  <i v-else class="mdi mdi-sort" />
                </span>
              </button>
              <template v-else>
                {{ column.label }}
              </template>
            </th>
          </slot>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!sortedData.length">
          <td :colspan="columns.length" class="has-text-centered">
            <slot name="empty">
              No data available
            </slot>
          </td>
        </tr>
        <tr v-for="(row, index) in sortedData" :key="index">
          <slot :row="row" :index="index" />
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, provide, useSlots } from 'vue'

const slots = useSlots()

interface Column {
  field: string
  label: string
  sortable?: boolean
  numeric?: boolean
}

interface Props {
  /**
   * Array of data to display in the table.
   */
  data?: any[]

  /**
   * Whether the table has narrow spacing.
   * @default false
   */
  narrowed?: boolean

  /**
   * Whether the table has striped rows.
   * @default false
   */
  striped?: boolean

  /**
   * Whether the table is bordered.
   * @default false
   */
  bordered?: boolean

  /**
   * Whether the table is hoverable.
   * @default false
   */
  hoverable?: boolean

  /**
   * Default sort field and direction [field, 'asc' | 'desc'].
   */
  defaultSort?: [string, 'asc' | 'desc']

  /**
   * Table caption rendered as a native `<caption>`. Required for WCAG when
   * the table's purpose is not clear from surrounding context. Use the
   * `caption` slot for richer markup.
   */
  caption?: string

  /**
   * Visually hide the `<caption>` (still announced by assistive technology).
   * Use when the table's title lives in surrounding UI — e.g., a tab name
   * above the table — but you still want screen readers to know what the
   * table represents.
   * @default false
   */
  captionHidden?: boolean

  /**
   * Accessible name for the table when a visible caption isn't suitable.
   * Prefer `caption` for sighted users; `ariaLabel` is a fallback.
   */
  ariaLabel?: string

  /**
   * Space-separated id(s) of element(s) that name this table. Use when the
   * table's name is rendered elsewhere in the page (e.g., a tab label or a
   * heading above the table) so screen readers can announce it without
   * duplicating the text inside a caption.
   */
  ariaLabelledby?: string

  /**
   * Space-separated id(s) of element(s) that further describe this table.
   * Use for longer-form context that complements the name — e.g., a summary
   * sentence below the table, or a note about how the data was computed.
   */
  ariaDescribedby?: string
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  narrowed: false,
  striped: false,
  bordered: false,
  hoverable: false,
  defaultSort: undefined,
  caption: undefined,
  captionHidden: false,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined
})

const hasCaption = computed(() => Boolean(props.caption || slots.caption))

const columns = ref<Column[]>([])
const sortField = ref<string | null>(props.defaultSort?.[0] || null)
const sortDirection = ref<'asc' | 'desc'>(props.defaultSort?.[1] || 'asc')

const hasHeader = computed(() => columns.value.length > 0)

const tableClasses = computed(() => {
  const classes: string[] = []

  if (props.narrowed) {
    classes.push('is-narrow')
  }

  if (props.striped) {
    classes.push('is-striped')
  }

  if (props.bordered) {
    classes.push('is-bordered')
  }

  if (props.hoverable) {
    classes.push('is-hoverable')
  }

  classes.push('is-fullwidth')

  return classes
})

const sortIcon = computed(() => {
  return sortDirection.value === 'asc' ? 'mdi mdi-sort-ascending' : 'mdi mdi-sort-descending'
})

const sortedData = computed(() => {
  if (!sortField.value) {
    return props.data
  }

  const field = sortField.value
  const direction = sortDirection.value

  return [...props.data].sort((a, b) => {
    // Handle nested fields like "level.level_index"
    const aVal = getNestedValue(a, field)
    const bVal = getNestedValue(b, field)

    // Handle null/undefined
    if (aVal == null && bVal == null) return 0
    if (aVal == null) return direction === 'asc' ? 1 : -1
    if (bVal == null) return direction === 'asc' ? -1 : 1

    // Compare values
    let comparison = 0
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      comparison = aVal.localeCompare(bVal)
    } else if (typeof aVal === 'number' && typeof bVal === 'number') {
      comparison = aVal - bVal
    } else {
      comparison = String(aVal).localeCompare(String(bVal))
    }

    return direction === 'asc' ? comparison : -comparison
  })
})

function getNestedValue (obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

function getHeaderClasses (column: Column) {
  const classes: string[] = []

  if (column.sortable) {
    classes.push('is-sortable')
  }

  if (column.numeric) {
    classes.push('has-text-right')
  }

  return classes
}

function getAriaSort (column: Column): 'ascending' | 'descending' | 'none' | undefined {
  if (!column.sortable) return undefined
  if (sortField.value !== column.field) return 'none'
  return sortDirection.value === 'asc' ? 'ascending' : 'descending'
}

function handleSort (field: string) {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

function registerColumn (column: Column) {
  const existing = columns.value.find(col => col.field === column.field)
  if (!existing) {
    columns.value.push(column)
  }
}

// Provide registration function for columns
provide('registerColumn', registerColumn)
</script>

<style lang="scss" scoped>
@use "bulma/sass/utilities/initial-variables" as *;
@use "bulma/sass/utilities/derived-variables" as *;

.cat-table {
  th.is-sortable {
    padding: 0;

    &:hover .cat-table-sort {
      background-color: $white-bis;
    }
  }

  .cat-table-sort {
    // Make the button fill the th so the entire cell is the click target,
    // matching the previous click-anywhere-in-th behavior.
    appearance: none;
    background: transparent;
    border: 0;
    width: 100%;
    padding: 0.5em 0.75em;
    text-align: inherit;
    font: inherit;
    color: inherit;
    cursor: pointer;
    user-select: none;

    &:focus-visible {
      outline: 2px solid $link;
      outline-offset: -2px;
    }
  }

  .cat-sort-icon {
    margin-left: 0.25rem;

    .mdi {
      font-size: $size-normal;
      vertical-align: middle;
    }
  }
}
</style>
