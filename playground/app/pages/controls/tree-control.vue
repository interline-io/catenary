<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Tree Control Component
      </h1>
      <p class="subtitle">
        Recursive hierarchical tree with checkboxes for selection
      </p>

      <demo-box label="Basic Tree">
        <cat-tree-control :node="basicTree" @select="selectBasicTree" />
        <p class="has-text-grey mt-3">
          Excluded: {{ basicTree.getExcludeList().join(', ') || 'None' }}
        </p>
      </demo-box>

      <demo-box label="Initially Collapsed (maxDeep=0)">
        <cat-tree-control :node="collapsedTree" :max-deep="0" @select="selectCollapsedTree" />
      </demo-box>

      <demo-box label="Hidden Root">
        <cat-tree-control :node="hiddenRootTree" hide-root @select="selectHiddenRootTree" />
        <p class="has-text-grey mt-3">
          Selected deps: {{ hiddenRootTree.getSelectedDeps().join(', ') || 'None' }}
        </p>
      </demo-box>

      <demo-box label="Deep Nesting">
        <cat-tree-control :node="deepTree" @select="selectDeepTree" />
      </demo-box>

      <demo-box label="Example: File Browser" example>
        <cat-tree-control :node="fileTree" @select="selectFileTree" />
        <div class="mt-3">
          <cat-button size="small" variant="primary" outlined @click="toggleAllFiles">
            {{ fileAllSelected ? 'Deselect All' : 'Select All' }}
          </cat-button>
        </div>
        <p class="has-text-grey mt-3">
          Selected: {{ fileTree.getSel().sel }} / {{ fileTree.getSel().sel + fileTree.getSel().unsel }}
        </p>
      </demo-box>

      <demo-a11y
        pattern-name="Disclosure"
        pattern-url="https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/"
        :references="[
          { label: 'MDN: ARIA tree role', url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/tree_role', note: 'including the warning about when not to use it' },
          { label: 'MDN: ARIA treeitem role', url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/treeitem_role' },
        ]"
        :keyboard="[
          { key: 'Tab / Shift+Tab', description: 'Moves focus through the visible disclosure buttons and checkboxes in document order. Collapsed branches remove their descendants from the tab order.' },
          { key: 'Enter / Space', description: 'When focus is on a disclosure button, expands or collapses that branch.' },
          { key: 'Space', description: 'When focus is on a node checkbox, toggles that node\'s selection (and its descendants, per the tree selection model).' },
        ]"
      >
        <template #intro>
          Each branch renders a native disclosure <code>&lt;button&gt;</code> named after its node, with <code>aria-expanded</code> conveying open or closed state, and a native checkbox for selection. Children are wrapped in <code>role="group"</code> labeled with the parent node's name, so the hierarchy is exposed programmatically rather than only by visual indentation.
        </template>
        <template #notes>
          <p class="mt-3">
            This component deliberately does not use <code>role="tree"</code> / <code>role="treeitem"</code>. Those roles obligate the full native-application keyboard model (arrow-key navigation with a roving tabindex, Right/Left to expand and collapse, type-ahead), and MDN warns against adopting them without implementing all of it: screen readers announce a tree and users expect arrow keys to work. At this component's typical scale, conventional Tab navigation through native buttons and checkboxes is more predictable.
          </p>
          <p class="mt-2">
            If the component grows to handle large trees where Tab-stepping every node becomes burdensome, the right upgrade is the complete APG Tree View pattern (roles plus the whole keyboard model, <code>aria-level</code> / <code>aria-setsize</code> / <code>aria-posinset</code> for any virtualized nodes, and type-ahead), not the roles alone.
          </p>
          <p class="mt-2">
            The disclosure buttons intentionally omit <code>aria-controls</code>: the children container is conditionally rendered, so the reference would dangle while collapsed. The group immediately follows its button in DOM order.
          </p>
        </template>
      </demo-a11y>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { TreeNode } from '../../../../src/util/tree'
import DemoBox from '../../components/demo-box.vue'
import DemoA11y from '../../components/demo-a11y.vue'

function selectBasicTree (state: boolean, key: string) {
  basicTree.toggleUnselected(state, key)
}

function selectCollapsedTree (state: boolean, key: string) {
  collapsedTree.toggleUnselected(state, key)
}

function selectHiddenRootTree (state: boolean, key: string) {
  hiddenRootTree.toggleUnselected(state, key)
}

function selectDeepTree (state: boolean, key: string) {
  deepTree.toggleUnselected(state, key)
}

function selectFileTree (state: boolean, key: string) {
  fileTree.toggleUnselected(state, key)
}

const basicTree = reactive(new TreeNode({
  key: 'root',
  name: 'All Items',
  children: {
    fruits: {
      key: 'fruits',
      name: 'Fruits',
      children: {
        apple: { key: 'apple', name: 'Apple' },
        banana: { key: 'banana', name: 'Banana' },
        cherry: { key: 'cherry', name: 'Cherry' }
      }
    },
    vegetables: {
      key: 'vegetables',
      name: 'Vegetables',
      children: {
        carrot: { key: 'carrot', name: 'Carrot' },
        broccoli: { key: 'broccoli', name: 'Broccoli' }
      }
    }
  }
}).selectAll()) as TreeNode

const collapsedTree = reactive(new TreeNode({
  key: 'root',
  name: 'Expand me',
  children: {
    a: { key: 'a', name: 'Item A' },
    b: { key: 'b', name: 'Item B' },
    c: { key: 'c', name: 'Item C' }
  }
}).selectAll()) as TreeNode

const hiddenRootTree = reactive(new TreeNode({
  key: 'root',
  name: 'Root (hidden)',
  children: {
    option1: { key: 'option1', name: 'Option 1', deps: ['dep-1'] },
    option2: { key: 'option2', name: 'Option 2', deps: ['dep-2'] },
    option3: { key: 'option3', name: 'Option 3', deps: ['dep-3'] }
  }
}).selectAll()) as TreeNode

const deepTree = reactive(new TreeNode({
  key: 'root',
  name: 'Organization',
  children: {
    engineering: {
      key: 'engineering',
      name: 'Engineering',
      children: {
        frontend: {
          key: 'frontend',
          name: 'Frontend',
          children: {
            react: { key: 'react', name: 'React Team' },
            vue: { key: 'vue', name: 'Vue Team' }
          }
        },
        backend: {
          key: 'backend',
          name: 'Backend',
          children: {
            api: { key: 'api', name: 'API Team' },
            infra: { key: 'infra', name: 'Infrastructure' }
          }
        }
      }
    },
    design: {
      key: 'design',
      name: 'Design',
      children: {
        ux: { key: 'ux', name: 'UX Research' },
        ui: { key: 'ui', name: 'UI Design' }
      }
    }
  }
}).selectAll()) as TreeNode

const fileTree = reactive(new TreeNode({
  key: 'root',
  name: 'src/',
  children: {
    components: {
      key: 'components',
      name: 'components/',
      children: {
        button: { key: 'button', name: 'button.vue' },
        input: { key: 'input', name: 'input.vue' },
        modal: { key: 'modal', name: 'modal.vue' }
      }
    },
    utils: {
      key: 'utils',
      name: 'utils/',
      children: {
        format: { key: 'format', name: 'format.ts' },
        validate: { key: 'validate', name: 'validate.ts' }
      }
    },
    index: { key: 'index', name: 'index.ts' }
  }
}).selectAll()) as TreeNode

// Single toggle: offering Select All when everything is already selected is
// dead UI. Partial selection completes the selection first.
const fileAllSelected = computed(() => fileTree.getSel().unsel === 0)

function toggleAllFiles () {
  if (fileAllSelected.value) {
    fileTree.unselectAll()
  } else {
    fileTree.selectAll()
  }
}
</script>
