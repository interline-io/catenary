import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CatCard from './card.vue'
import { expectNoAxeViolations } from '../testutil/component-helpers'

describe('cat-card', () => {
  it('renders header, content and footer without any button when not expandable', () => {
    const wrapper = mount(CatCard, {
      props: { label: 'Settings' },
      slots: { default: '<p>Body</p>', footer: '<span>Foot</span>' }
    })
    expect(wrapper.find('.card-header-title').text()).toBe('Settings')
    expect(wrapper.find('.card-content').text()).toContain('Body')
    expect(wrapper.find('.card-footer').text()).toContain('Foot')
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.find('[role="button"]').exists()).toBe(false)
  })

  it('shows content when not expandable', () => {
    const wrapper = mount(CatCard, { slots: { default: '<p>Body</p>' } })
    expect(wrapper.text()).toContain('Body')
  })

  describe('expandable', () => {
    it('uses a native button for the trigger, not role="button" on the header', () => {
      const wrapper = mount(CatCard, { props: { label: 'Details', expandable: true } })
      const trigger = wrapper.find('button.cat-card-trigger')
      expect(trigger.exists()).toBe(true)
      expect(trigger.attributes('type')).toBe('button')
      const header = wrapper.find('.card-header')
      expect(header.attributes('role')).toBeUndefined()
      expect(header.attributes('tabindex')).toBeUndefined()
    })

    it('exposes aria-expanded and aria-controls pointing at the content', () => {
      const wrapper = mount(CatCard, { props: { label: 'Details', expandable: true, open: true } })
      const trigger = wrapper.find('button.cat-card-trigger')
      expect(trigger.attributes('aria-expanded')).toBe('true')
      const controls = trigger.attributes('aria-controls')
      expect(controls).toBeTruthy()
      expect(wrapper.find(`#${controls}`).exists()).toBe(true)
    })

    // The bug this component used to have: the chevron was a <button> nested
    // inside an element with role="button", which is invalid and only worked
    // because of @click.stop.
    it('renders the chevron as a span inside the trigger, not a nested button', () => {
      const wrapper = mount(CatCard, { props: { label: 'Details', expandable: true } })
      expect(wrapper.findAll('button')).toHaveLength(1)
      const icon = wrapper.find('.card-header-icon')
      expect(icon.exists()).toBe(true)
      expect(icon.element.tagName).toBe('SPAN')
    })

    it('keeps #actions content outside the trigger button', () => {
      const wrapper = mount(CatCard, {
        props: { label: 'Details', expandable: true },
        slots: { actions: '<button class="act">Act</button>' }
      })
      const trigger = wrapper.find('button.cat-card-trigger')
      const action = wrapper.find('button.act')
      expect(action.exists()).toBe(true)
      expect(trigger.element.contains(action.element)).toBe(false)
    })

    it('toggles content and emits update:open', async () => {
      const wrapper = mount(CatCard, {
        props: { label: 'Details', expandable: true },
        slots: { default: '<p>Body</p>' }
      })
      const content = wrapper.find('.card-content')
      expect((content.element.parentElement as HTMLElement).style.display).toBe('none')

      await wrapper.find('button.cat-card-trigger').trigger('click')
      expect((content.element.parentElement as HTMLElement).style.display).not.toBe('none')
      expect(wrapper.emitted('update:open')).toEqual([[true]])

      await wrapper.find('button.cat-card-trigger').trigger('click')
      expect(wrapper.emitted('update:open')).toEqual([[true], [false]])
    })

    // The trigger lives in the header, and the header only renders when it has
    // something to show. Without `expandable` in that condition, a bare
    // <cat-card expandable> renders no trigger while still hiding its content
    // behind isOpen — permanently invisible with no way to open it.
    it('renders a trigger even with no label, #header or #actions', async () => {
      const wrapper = mount(CatCard, {
        props: { expandable: true },
        slots: { default: '<p>Body</p>' }
      })
      const trigger = wrapper.find('button.cat-card-trigger')
      expect(trigger.exists()).toBe(true)

      const content = wrapper.find('.card-content').element.parentElement as HTMLElement
      expect(content.style.display).toBe('none')
      await trigger.trigger('click')
      expect(content.style.display).not.toBe('none')
    })

    it('follows a controlled open prop', async () => {
      const wrapper = mount(CatCard, { props: { label: 'Details', expandable: true, open: false } })
      expect(wrapper.find('button.cat-card-trigger').attributes('aria-expanded')).toBe('false')
      await wrapper.setProps({ open: true })
      expect(wrapper.find('button.cat-card-trigger').attributes('aria-expanded')).toBe('true')
    })

    it('has no axe violations, collapsed and expanded', async () => {
      const collapsed = mount(CatCard, {
        props: { label: 'Details', expandable: true },
        slots: { default: '<p>Body</p>' },
        attachTo: document.body
      })
      await expectNoAxeViolations(collapsed)
      collapsed.unmount()

      const expanded = mount(CatCard, {
        props: { label: 'Details', expandable: true, open: true },
        slots: { default: '<p>Body</p>', actions: '<button class="act">Act</button>' },
        attachTo: document.body
      })
      await expectNoAxeViolations(expanded)
      expanded.unmount()
    })
  })
})
