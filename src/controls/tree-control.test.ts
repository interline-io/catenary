import { describe, it, expect } from 'vitest'
import CatTreeControl from './tree-control.vue'
import { TreeNode } from '../util/tree'
import { mountComponent, expectNoAxeViolations } from '../testutil/component-helpers'

function makeTree (): TreeNode {
  return new TreeNode({
    key: 'root',
    name: 'All Items',
    children: {
      fruits: {
        key: 'fruits',
        name: 'Fruits',
        children: {
          apple: { key: 'apple', name: 'Apple' },
          banana: { key: 'banana', name: 'Banana' }
        }
      },
      vegetables: {
        key: 'vegetables',
        name: 'Vegetables',
        children: {
          carrot: { key: 'carrot', name: 'Carrot' }
        }
      }
    }
  })
}

describe('CatTreeControl', () => {
  describe('accessibility', () => {
    it('has no axe violations when fully expanded', async () => {
      const wrapper = mountComponent(CatTreeControl, {
        attachTo: document.body,
        props: { node: makeTree() }
      })
      await expectNoAxeViolations(wrapper)
      wrapper.unmount()
    })

    it('has no axe violations when collapsed', async () => {
      const wrapper = mountComponent(CatTreeControl, {
        attachTo: document.body,
        props: { node: makeTree(), maxDeep: 0 }
      })
      await expectNoAxeViolations(wrapper)
      wrapper.unmount()
    })
  })

  describe('expand button', () => {
    it('uses the node name as a constant accessible name across toggles', async () => {
      const wrapper = mountComponent(CatTreeControl, {
        props: { node: makeTree() }
      })

      const button = wrapper.find('.expand-button')
      expect(button.attributes('aria-label')).toBe('All Items')
      expect(button.attributes('title')).toBe('All Items')

      await button.trigger('click')
      expect(button.attributes('aria-label')).toBe('All Items')
      expect(button.attributes('title')).toBe('All Items')
    })

    it('falls back to the node key when name is not set', () => {
      const node = new TreeNode({
        key: 'unnamed',
        children: {
          child: { key: 'child', name: 'Child' }
        }
      })
      const wrapper = mountComponent(CatTreeControl, {
        props: { node }
      })

      expect(wrapper.find('.expand-button').attributes('aria-label')).toBe('unnamed')
    })

    it('toggles aria-expanded between true and false', async () => {
      const wrapper = mountComponent(CatTreeControl, {
        props: { node: makeTree() }
      })

      const button = wrapper.find('.expand-button')
      expect(button.attributes('aria-expanded')).toBe('true')

      await button.trigger('click')
      expect(button.attributes('aria-expanded')).toBe('false')

      await button.trigger('click')
      expect(button.attributes('aria-expanded')).toBe('true')
    })

    it('is not rendered for leaf nodes', () => {
      const wrapper = mountComponent(CatTreeControl, {
        props: { node: new TreeNode({ key: 'leaf', name: 'Leaf' }) }
      })

      expect(wrapper.find('.expand-button').exists()).toBe(false)
      expect(wrapper.find('.indent-spacer').exists()).toBe(true)
    })
  })

  describe('children group', () => {
    it('wraps children in role=group labeled by the parent node', () => {
      const wrapper = mountComponent(CatTreeControl, {
        props: { node: makeTree() }
      })

      const groups = wrapper.findAll('[role="group"]')
      const labels = groups.map(g => g.attributes('aria-label'))
      expect(labels).toEqual(['All Items', 'Fruits', 'Vegetables'])
    })

    it('removes the children group from the DOM when collapsed', async () => {
      const wrapper = mountComponent(CatTreeControl, {
        props: { node: makeTree() }
      })
      expect(wrapper.find('[role="group"]').exists()).toBe(true)

      await wrapper.find('.expand-button').trigger('click')
      expect(wrapper.find('[role="group"]').exists()).toBe(false)
    })

    it('does not render an empty group for leaf nodes', () => {
      const wrapper = mountComponent(CatTreeControl, {
        props: { node: new TreeNode({ key: 'leaf', name: 'Leaf' }) }
      })

      expect(wrapper.find('[role="group"]').exists()).toBe(false)
    })

    it('starts collapsed when maxDeep is 0', () => {
      const wrapper = mountComponent(CatTreeControl, {
        props: { node: makeTree(), maxDeep: 0 }
      })

      expect(wrapper.find('.expand-button').attributes('aria-expanded')).toBe('false')
      expect(wrapper.find('[role="group"]').exists()).toBe(false)
    })
  })

  describe('selection', () => {
    it('emits select with the node key when a checkbox is toggled', async () => {
      const wrapper = mountComponent(CatTreeControl, {
        props: { node: makeTree() }
      })

      // Checkbox order follows DOM order: root, fruits, apple, ...
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      expect(checkboxes.length).toBe(6)
      await checkboxes[2]!.setValue(true)

      expect(wrapper.emitted('select')).toBeTruthy()
      expect(wrapper.emitted('select')![0]).toEqual([true, 'apple'])
    })
  })
})
