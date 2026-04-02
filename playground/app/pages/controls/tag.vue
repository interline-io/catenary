<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Tag Component
      </h1>
      <p class="subtitle">
        Small label components for categorization
      </p>

      <demo-box label="Basic Tag">
        <cat-tag>
          Tag label
        </cat-tag>
      </demo-box>

      <demo-box label="Variants">
        <div class="tags">
          <cat-tag>
            Default
          </cat-tag>
          <cat-tag v-for="variant in variants" :key="variant" :variant="variant">
            {{ capitalize(variant) }}
          </cat-tag>
        </div>
      </demo-box>

      <demo-box label="Sizes">
        <div class="tags">
          <cat-tag v-for="size in sizes" :key="size" :size="size">
            {{ capitalize(size) }}
          </cat-tag>
        </div>
      </demo-box>

      <demo-box label="Rounded">
        <div class="tags">
          <cat-tag rounded>
            Rounded
          </cat-tag>
          <cat-tag v-for="variant in roundedVariants" :key="variant" rounded :variant="variant">
            {{ capitalize(variant) }}
          </cat-tag>
        </div>
      </demo-box>

      <demo-box label="Closable Tags">
        <p class="mb-3">
          Selected tags: {{ selectedTags.join(', ') || 'None' }}
        </p>
        <div class="tags">
          <cat-tag v-if="selectedTags.includes('javascript')" closable @close="removeTag('javascript')">
            JavaScript
          </cat-tag>
          <cat-tag v-if="selectedTags.includes('vue')" closable variant="success" @close="removeTag('vue')">
            Vue
          </cat-tag>
          <cat-tag v-if="selectedTags.includes('typescript')" closable variant="info" @close="removeTag('typescript')">
            TypeScript
          </cat-tag>
          <cat-tag v-if="selectedTags.includes('nuxt')" closable variant="primary" @close="removeTag('nuxt')">
            Nuxt
          </cat-tag>
        </div>
        <cat-button size="small" @click="resetTags">
          Reset Tags
        </cat-button>
      </demo-box>

      <demo-box label="Light Variants">
        <div class="tags">
          <cat-tag variant="primary" light>
            Primary
          </cat-tag>
          <cat-tag variant="info" light>
            Info
          </cat-tag>
          <cat-tag variant="success" light>
            Success
          </cat-tag>
          <cat-tag variant="warning" light>
            Warning
          </cat-tag>
          <cat-tag variant="danger" light>
            Danger
          </cat-tag>
        </div>
      </demo-box>

      <demo-box label="Tag Combinations">
        <div class="field is-grouped is-grouped-multiline">
          <div class="control">
            <div class="tags has-addons">
              <cat-tag>
                Package
              </cat-tag>
              <cat-tag variant="success">
                v1.0.0
              </cat-tag>
            </div>
          </div>
          <div class="control">
            <div class="tags has-addons">
              <cat-tag>
                Status
              </cat-tag>
              <cat-tag variant="success">
                Active
              </cat-tag>
            </div>
          </div>
          <div class="control">
            <div class="tags has-addons">
              <cat-tag>
                Type
              </cat-tag>
              <cat-tag variant="primary">
                Feature
              </cat-tag>
            </div>
          </div>
        </div>
      </demo-box>

      <demo-box label="Example: Delete Tag Combinations" example>
        <p class="mb-3">
          Selected items (click X to remove):
        </p>
        <div class="field is-grouped is-grouped-multiline">
          <div v-for="item in selectedItems" :key="item.id" class="control">
            <div class="tags has-addons">
              <cat-tag :variant="item.variant">
                {{ item.label }}
              </cat-tag>
              <cat-tag is-delete @click="removeItem(item.id)" />
            </div>
          </div>
        </div>
        <cat-button v-if="selectedItems.length === 0" size="small" @click="resetItems">
          Reset Items
        </cat-button>
      </demo-box>

      <demo-box label="Example: Status Indicators" example>
        <table class="table is-fullwidth">
          <thead>
            <tr>
              <th>Item</th>
              <th>Status</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Item 1</td>
              <td>
                <cat-tag variant="success">
                  Active
                </cat-tag>
              </td>
              <td>
                <cat-tag variant="danger">
                  High
                </cat-tag>
              </td>
            </tr>
            <tr>
              <td>Item 2</td>
              <td>
                <cat-tag variant="warning">
                  In Review
                </cat-tag>
              </td>
              <td>
                <cat-tag variant="warning">
                  Medium
                </cat-tag>
              </td>
            </tr>
            <tr>
              <td>Item 3</td>
              <td>
                <cat-tag variant="info">
                  Planning
                </cat-tag>
              </td>
              <td>
                <cat-tag variant="info">
                  Low
                </cat-tag>
              </td>
            </tr>
            <tr>
              <td>Item 4</td>
              <td>
                <cat-tag>
                  On Hold
                </cat-tag>
              </td>
              <td>
                <cat-tag variant="info">
                  Low
                </cat-tag>
              </td>
            </tr>
          </tbody>
        </table>
      </demo-box>

      <demo-box label="Example: Category Tags" example>
        <article class="media">
          <div class="media-content">
            <div class="content">
              <p>
                <strong>Article Title</strong>
                <br>
                Article description text goes here
              </p>
              <div class="tags">
                <cat-tag variant="info" size="small">
                  Category
                </cat-tag>
                <cat-tag variant="success" size="small">
                  Level
                </cat-tag>
                <cat-tag variant="primary" size="small">
                  Topic 1
                </cat-tag>
                <cat-tag variant="primary" size="small">
                  Topic 2
                </cat-tag>
              </div>
            </div>
          </div>
        </article>

        <article class="media">
          <div class="media-content">
            <div class="content">
              <p>
                <strong>Another Article</strong>
                <br>
                Another article description text
              </p>
              <div class="tags">
                <cat-tag variant="info" size="small">
                  Category
                </cat-tag>
                <cat-tag variant="danger" size="small">
                  Level
                </cat-tag>
                <cat-tag variant="primary" size="small">
                  Topic
                </cat-tag>
              </div>
            </div>
          </div>
        </article>
      </demo-box>

      <demo-box label="Example: Interactive Filter" example>
        <p class="mb-3">
          <strong>Filter by category:</strong>
        </p>
        <div class="tags mb-4">
          <cat-tag
            v-for="tech in technologies"
            :key="tech"
            :variant="activeTech === tech ? 'primary' : undefined"
            style="cursor: pointer"
            @click="activeTech = tech"
          >
            {{ tech }}
          </cat-tag>
          <cat-tag
            v-if="activeTech"
            variant="danger"
            style="cursor: pointer"
            @click="activeTech = null"
          >
            Clear filter
          </cat-tag>
        </div>
        <p v-if="activeTech" class="notification is-info is-light">
          Showing results for: <strong>{{ activeTech }}</strong>
        </p>
        <p v-else class="has-text-grey">
          Select a category to filter
        </p>
      </demo-box>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TagVariants, TagSizes } from '../../../../src/controls/types'
import DemoBox from '../../components/demo-box.vue'

const variants = TagVariants
const sizes = TagSizes
const roundedVariants = ['primary', 'info', 'success', 'warning', 'danger'] as const

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const selectedTags = ref(['javascript', 'vue', 'typescript', 'nuxt'])

const removeTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  }
}

const resetTags = () => {
  selectedTags.value = ['javascript', 'vue', 'typescript', 'nuxt']
}

const technologies = ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5', 'Option 6']
const activeTech = ref<string | null>(null)

const selectedItems = ref([
  { id: 1, label: 'Item 1', variant: 'primary' as const },
  { id: 2, label: 'Item 2', variant: 'info' as const },
  { id: 3, label: 'Item 3', variant: 'success' as const },
  { id: 4, label: 'Item 4', variant: 'warning' as const }
])

const removeItem = (id: number) => {
  const index = selectedItems.value.findIndex(item => item.id === id)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  }
}

const resetItems = () => {
  selectedItems.value = [
    { id: 1, label: 'Item 1', variant: 'primary' as const },
    { id: 2, label: 'Item 2', variant: 'info' as const },
    { id: 3, label: 'Item 3', variant: 'success' as const },
    { id: 4, label: 'Item 4', variant: 'warning' as const }
  ]
}
</script>
