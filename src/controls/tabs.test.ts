import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import CatTabs from './tabs.vue'
import CatTabItem from './tab-item.vue'
import { expectNoAxeViolations } from '../testutil/component-helpers'

async function mountTabs (initial = 'one') {
  const active = ref(initial)
  const Host = defineComponent({
    components: { CatTabs, CatTabItem },
    setup () {
      return () => h(CatTabs, {
        'modelValue': active.value,
        'aria-label': 'Demo tabs',
        'onUpdate:modelValue': (v: string | number) => { active.value = String(v) }
      }, () => [
        h(CatTabItem, { label: 'One', value: 'one' }, () => 'Panel 1'),
        h(CatTabItem, { label: 'Two', value: 'two' }, () => 'Panel 2'),
        h(CatTabItem, { label: 'Three', value: 'three' }, () => 'Panel 3')
      ])
    }
  })
  const wrapper = mount(Host, { attachTo: document.body })
  // tab-item components register with the parent in onMounted; wait one tick
  // so the parent's tab buttons render.
  await wrapper.vm.$nextTick()
  return { wrapper, active }
}

describe('cat-tabs WAI-ARIA tablist', () => {
  it('renders role="tablist" and role="tab" buttons', async () => {
    const { wrapper } = await mountTabs()
    expect(wrapper.find('[role="tablist"]').exists()).toBe(true)
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs).toHaveLength(3)
    expect(tabs[0]?.element.tagName).toBe('BUTTON')
    wrapper.unmount()
  })

  it('renders role="tabpanel" paired with aria-controls / aria-labelledby', async () => {
    const { wrapper } = await mountTabs()
    const tabs = wrapper.findAll('[role="tab"]')
    const panels = wrapper.findAll('[role="tabpanel"]')
    expect(panels).toHaveLength(3)

    tabs.forEach((tab, i) => {
      const panelId = tab.attributes('aria-controls')
      const tabId = tab.attributes('id')
      const panel = panels[i]
      expect(panelId).toBeDefined()
      expect(tabId).toBeDefined()
      expect(panel?.attributes('id')).toBe(panelId)
      expect(panel?.attributes('aria-labelledby')).toBe(tabId)
    })
    wrapper.unmount()
  })

  it('reflects aria-selected and roving tabindex', async () => {
    const { wrapper, active } = await mountTabs('one')
    let tabs = wrapper.findAll('[role="tab"]')
    expect(tabs[0]?.attributes('aria-selected')).toBe('true')
    expect(tabs[1]?.attributes('aria-selected')).toBe('false')
    expect(tabs[0]?.attributes('tabindex')).toBe('0')
    expect(tabs[1]?.attributes('tabindex')).toBe('-1')

    active.value = 'two'
    await wrapper.vm.$nextTick()
    tabs = wrapper.findAll('[role="tab"]')
    expect(tabs[1]?.attributes('aria-selected')).toBe('true')
    expect(tabs[1]?.attributes('tabindex')).toBe('0')
    expect(tabs[0]?.attributes('tabindex')).toBe('-1')
    wrapper.unmount()
  })

  it('ArrowRight moves activation to the next tab and wraps at the end', async () => {
    const { wrapper, active } = await mountTabs('one')
    const firstTab = wrapper.findAll('[role="tab"]')[0]
    await firstTab?.trigger('keydown', { key: 'ArrowRight' })
    expect(active.value).toBe('two')

    const secondTab = wrapper.findAll('[role="tab"]')[1]
    await secondTab?.trigger('keydown', { key: 'ArrowRight' })
    expect(active.value).toBe('three')

    const thirdTab = wrapper.findAll('[role="tab"]')[2]
    await thirdTab?.trigger('keydown', { key: 'ArrowRight' })
    expect(active.value).toBe('one') // wraps
    wrapper.unmount()
  })

  it('ArrowLeft moves activation to the previous tab and wraps at the start', async () => {
    const { wrapper, active } = await mountTabs('one')
    const firstTab = wrapper.findAll('[role="tab"]')[0]
    await firstTab?.trigger('keydown', { key: 'ArrowLeft' })
    expect(active.value).toBe('three')
    wrapper.unmount()
  })

  it('Home / End jump to first / last tab', async () => {
    const { wrapper, active } = await mountTabs('two')
    const secondTab = wrapper.findAll('[role="tab"]')[1]
    await secondTab?.trigger('keydown', { key: 'End' })
    expect(active.value).toBe('three')
    const thirdTab = wrapper.findAll('[role="tab"]')[2]
    await thirdTab?.trigger('keydown', { key: 'Home' })
    expect(active.value).toBe('one')
    wrapper.unmount()
  })

  it('has no axe violations', async () => {
    const { wrapper } = await mountTabs()
    await expectNoAxeViolations(wrapper)
    wrapper.unmount()
  })
})
