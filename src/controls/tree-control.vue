<template>
  <div>
    <div v-if="!hideRoot && node" class="cat-tree-row">
      <span v-if="!hasChildren" class="cat-tree-indent" />
      <span
        v-else
        class="cat-tree-expand"
        :class="expanded ? 'cat-tree-expand-down' : 'cat-tree-expand-right'"
        :title="expanded ? 'Collapse' : 'Expand'"
        @click="toggleExpand"
      />
      <cat-checkbox
        :model-value="node.selected"
        :indeterminate="node.indet"
        variant="primary"
        @update:model-value="select(Array.isArray($event) ? $event[0] : $event, node.key)"
      >
        <span :class="node.opts?.style">
          {{ node.name }}
        </span>
      </cat-checkbox>
      <slot name="node-extra" :node="node" />
    </div>
    <div v-if="expanded">
      <div
        v-for="g of node.children"
        :key="g.key"
      >
        <div
          :class="hideRoot ? '' : 'cat-tree-indented'"
        >
          <cat-tree-control
            :node="g"
            :max-deep="maxDeep - 1"
            @select="select"
          >
            <template #node-extra="slotProps">
              <slot name="node-extra" :node="slotProps.node" />
            </template>
          </cat-tree-control>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TreeNode } from '../util/tree'
import CatCheckbox from './checkbox.vue'

interface Props {
  node?: TreeNode
  maxDeep?: number
  hideRoot?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  node: () => ({} as TreeNode),
  maxDeep: 10,
  hideRoot: false
})

const emit = defineEmits<{
  select: [value: boolean, key: string]
}>()

const expanded = ref(props.maxDeep > 0)
const hasChildren = computed(() => Object.keys(props.node?.children || {}).length > 0)

function select (v: boolean | undefined, key: string): void {
  if (v !== undefined) {
    emit('select', v, key)
  }
}

function toggleExpand (): void {
  expanded.value = !expanded.value
}
</script>

<style scoped>
.cat-tree-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cat-tree-indent {
  width: 1.125rem;
  display: inline-block;
  flex-shrink: 0;
}

.cat-tree-expand {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.125rem;
  height: 1.125rem;
  padding: 0;
  margin: 0;
  border: none;
  background: none;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
}

.cat-tree-expand-right::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 0.375rem solid #363636;
  border-top: 0.25rem solid transparent;
  border-bottom: 0.25rem solid transparent;
}

.cat-tree-expand-down::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 0.375rem solid #363636;
  border-left: 0.25rem solid transparent;
  border-right: 0.25rem solid transparent;
}

.cat-tree-expand:hover {
  opacity: 0.7;
}

.cat-tree-indented {
  margin-left: 30px;
}
</style>
