import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, ref, nextTick } from 'vue'
import CatDropdown from './dropdown.vue'
import CatDropdownItem from './dropdown-item.vue'
import { expectNoAxeViolations } from '../testutil/component-helpers'

function mountDropdown (props: Record<string, any> = {}) {
  const selected = ref<string | undefined>(undefined)
  const Host = defineComponent({
    components: { CatDropdown, CatDropdownItem },
    setup () {
      return () => h(CatDropdown, {
        'label': 'Menu',
        'modelValue': selected.value,
        'onUpdate:modelValue': (v: string) => { selected.value = v },
        ...props
      }, {
        default: () => [
          h(CatDropdownItem, { value: 'one' }, () => 'One'),
          h(CatDropdownItem, { value: 'two' }, () => 'Two'),
          h(CatDropdownItem, { value: 'three' }, () => 'Three')
        ]
      })
    }
  })
  return { wrapper: mount(Host, { attachTo: document.body }), selected }
}

describe('cat-dropdown WAI-ARIA + keyboard', () => {
  it('renders aria-haspopup, aria-controls, and aria-expanded on the trigger', () => {
    const { wrapper } = mountDropdown()
    const trigger = wrapper.find('button')
    expect(trigger.attributes('aria-haspopup')).toBe('menu')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    const controls = trigger.attributes('aria-controls')
    const menu = wrapper.find('.dropdown-menu')
    expect(controls).toBeDefined()
    expect(menu.attributes('id')).toBe(controls)
    wrapper.unmount()
  })

  it('uses role="menu" by default and role="listbox" when selectable', () => {
    const { wrapper: actionMenu } = mountDropdown()
    expect(actionMenu.find('.dropdown-menu').attributes('role')).toBe('menu')
    actionMenu.unmount()

    const { wrapper: select } = mountDropdown({ selectable: true })
    expect(select.find('.dropdown-menu').attributes('role')).toBe('listbox')
    select.unmount()
  })

  it('aria-expanded flips to true after toggle', async () => {
    const { wrapper } = mountDropdown()
    const trigger = wrapper.find('button')
    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')
    wrapper.unmount()
  })

  it('ArrowDown on the trigger opens the menu and focuses the first item', async () => {
    const { wrapper } = mountDropdown()
    const trigger = wrapper.find('button')
    trigger.element.focus()
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    const items = wrapper.findAll('.dropdown-item')
    expect(items[0]?.element).toBe(document.activeElement)
    wrapper.unmount()
  })

  it('Escape in the menu closes the dropdown and returns focus to the trigger', async () => {
    const { wrapper } = mountDropdown()
    const trigger = wrapper.find('button')
    trigger.element.focus()
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    const menu = wrapper.find('.dropdown-menu')
    await menu.trigger('keydown', { key: 'Escape' })
    await nextTick()
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger.element)
    wrapper.unmount()
  })

  it('dropdown items render with role="menuitem" by default', () => {
    const { wrapper } = mountDropdown()
    const items = wrapper.findAll('.dropdown-item')
    expect(items[0]?.attributes('role')).toBe('menuitem')
    wrapper.unmount()
  })

  it('dropdown items render with role="option" when selectable', () => {
    const { wrapper } = mountDropdown({ selectable: true })
    const items = wrapper.findAll('.dropdown-item')
    expect(items[0]?.attributes('role')).toBe('option')
    wrapper.unmount()
  })

  it('has no axe violations when closed', async () => {
    const { wrapper } = mountDropdown()
    await expectNoAxeViolations(wrapper)
    wrapper.unmount()
  })
})
