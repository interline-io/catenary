import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
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

  it('keeps the first tab keyboard-reachable when modelValue matches no tab', async () => {
    const wrapper = mount(defineComponent({
      components: { CatTabs, CatTabItem },
      setup () {
        return () => h(CatTabs, { 'aria-label': 'Demo' }, () => [
          h(CatTabItem, { label: 'One', value: 'one' }, () => 'Panel 1'),
          h(CatTabItem, { label: 'Two', value: 'two' }, () => 'Panel 2')
        ])
      }
    }), { attachTo: document.body })
    await wrapper.vm.$nextTick()

    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs[0]?.attributes('tabindex')).toBe('0')
    expect(tabs[1]?.attributes('tabindex')).toBe('-1')
    // No tab is selected, but one must remain in the tab order
    expect(tabs[0]?.attributes('aria-selected')).toBe('false')
    wrapper.unmount()
  })

  it('binds aria-labelledby on the tablist', async () => {
    const wrapper = mount(defineComponent({
      components: { CatTabs, CatTabItem },
      setup () {
        return () => h('div', [
          h('h2', { id: 'tabs-heading' }, 'Sections'),
          h(CatTabs, { modelValue: 'one', ariaLabelledby: 'tabs-heading' }, () => [
            h(CatTabItem, { label: 'One', value: 'one' }, () => 'Panel 1'),
            h(CatTabItem, { label: 'Two', value: 'two' }, () => 'Panel 2')
          ])
        ])
      }
    }), { attachTo: document.body })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[role="tablist"]').attributes('aria-labelledby')).toBe('tabs-heading')
    await expectNoAxeViolations(wrapper)
    wrapper.unmount()
  })

  it('applies vertical layout class and aria-orientation when orientation="vertical"', async () => {
    const wrapper = mount(defineComponent({
      components: { CatTabs, CatTabItem },
      setup () {
        return () => h(CatTabs, { 'modelValue': 'one', 'aria-label': 'Demo', 'orientation': 'vertical' }, () => [
          h(CatTabItem, { label: 'One', value: 'one' }, () => 'Panel 1'),
          h(CatTabItem, { label: 'Two', value: 'two' }, () => 'Panel 2')
        ])
      }
    }), { attachTo: document.body })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.cat-tabs').classes()).toContain('is-vertical')
    expect(wrapper.find('[role="tablist"]').attributes('aria-orientation')).toBe('vertical')
    wrapper.unmount()
  })

  it('gives the panel tabindex="0" when its only interactive content is disabled', async () => {
    const wrapper = mount(defineComponent({
      components: { CatTabs, CatTabItem },
      setup () {
        return () => h(CatTabs, { 'modelValue': 'one', 'aria-label': 'Demo' }, () => [
          h(CatTabItem, { label: 'One', value: 'one' }, () => h('button', { disabled: true }, 'Pending')),
          h(CatTabItem, { label: 'Two', value: 'two' }, () => h('button', 'Active'))
        ])
      }
    }), { attachTo: document.body })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const panels = wrapper.findAll('[role="tabpanel"]')
    expect(panels[0]?.attributes('tabindex')).toBe('0')
    expect(panels[1]?.attributes('tabindex')).toBeUndefined()
    wrapper.unmount()
  })

  it('deregisters tabs when their tab-item unmounts', async () => {
    const active = ref('one')
    const showSecond = ref(true)
    const Host = defineComponent({
      components: { CatTabs, CatTabItem },
      setup () {
        return () => h(CatTabs, {
          'modelValue': active.value,
          'aria-label': 'Demo',
          'onUpdate:modelValue': (v: string | number) => { active.value = String(v) }
        }, () => [
          h(CatTabItem, { label: 'One', value: 'one' }, () => 'Panel 1'),
          showSecond.value ? h(CatTabItem, { label: 'Two', value: 'two' }, () => 'Panel 2') : null,
          h(CatTabItem, { label: 'Three', value: 'three' }, () => 'Panel 3')
        ])
      }
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('[role="tab"]')).toHaveLength(3)

    showSecond.value = false
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const remaining = wrapper.findAll('[role="tab"]')
    expect(remaining).toHaveLength(2)
    const labels = remaining.map(t => t.text())
    expect(labels).toEqual(['One', 'Three'])

    wrapper.unmount()
  })

  it('keeps a tab in the tab order after the active tab-item unmounts', async () => {
    const active = ref('two')
    const showSecond = ref(true)
    const Host = defineComponent({
      components: { CatTabs, CatTabItem },
      setup () {
        return () => h(CatTabs, {
          'modelValue': active.value,
          'aria-label': 'Demo',
          'onUpdate:modelValue': (v: string | number) => { active.value = String(v) }
        }, () => [
          h(CatTabItem, { label: 'One', value: 'one' }, () => 'Panel 1'),
          showSecond.value ? h(CatTabItem, { label: 'Two', value: 'two' }, () => 'Panel 2') : null,
          h(CatTabItem, { label: 'Three', value: 'three' }, () => 'Panel 3')
        ])
      }
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await wrapper.vm.$nextTick()

    showSecond.value = false
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const remaining = wrapper.findAll('[role="tab"]')
    expect(remaining).toHaveLength(2)
    const tabindexes = remaining.map(t => t.attributes('tabindex'))
    expect(tabindexes.filter(t => t === '0')).toHaveLength(1)
    expect(tabindexes.filter(t => t === '-1')).toHaveLength(1)

    wrapper.unmount()
  })
})

describe('cat-tabs dynamic children', () => {
// Registrations arrive in mount order, so a tab revealed later by v-if used
// to append to the end of the tablist regardless of where it sat in the
// template. cat-steps has compared panel elements since #66; cat-tabs never
// got the fix. Live in production: a conditional tab in the middle of a list
// rendered after the ones following it.
  it('keeps template order when a middle tab appears after mount', async () => {
    const showMiddle = ref(false)
    const Host = defineComponent({
      setup: () => () => h(CatTabs, { modelValue: 'a', ariaLabel: 'Sections' }, {
        default: () => [
          h(CatTabItem, { label: 'A', value: 'a' }, () => 'A'),
          showMiddle.value ? h(CatTabItem, { label: 'B', value: 'b' }, () => 'B') : null,
          h(CatTabItem, { label: 'C', value: 'c' }, () => 'C')
        ]
      })
    })
    const wrapper = mount(Host, { attachTo: document.body })
    // Children register in onMounted, so the parent's tab buttons are a tick away.
    await nextTick()
    expect(wrapper.findAll('[role="tab"]').map(t => t.text())).toEqual(['A', 'C'])

    showMiddle.value = true
    await nextTick()
    await nextTick()
    expect(wrapper.findAll('[role="tab"]').map(t => t.text())).toEqual(['A', 'B', 'C'])
    wrapper.unmount()
  })

  it('places a late tab at the end when that is where it belongs', async () => {
    const showLast = ref(false)
    const Host = defineComponent({
      setup: () => () => h(CatTabs, { modelValue: 'a', ariaLabel: 'Sections' }, {
        default: () => [
          h(CatTabItem, { label: 'A', value: 'a' }, () => 'A'),
          h(CatTabItem, { label: 'B', value: 'b' }, () => 'B'),
          showLast.value ? h(CatTabItem, { label: 'C', value: 'c' }, () => 'C') : null
        ]
      })
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await nextTick()
    showLast.value = true
    await nextTick()
    await nextTick()
    expect(wrapper.findAll('[role="tab"]').map(t => t.text())).toEqual(['A', 'B', 'C'])
    wrapper.unmount()
  })

  // deregister ran with the *current* props.value and nothing watched it, so
  // changing a value left the old entry in place and added a second.
  it('does not strand an entry when a value changes', async () => {
    const value = ref('before')
    const Host = defineComponent({
      setup: () => () => h(CatTabs, { modelValue: 'first', ariaLabel: 'Sections' }, {
        default: () => [
          h(CatTabItem, { label: 'First', value: 'first' }, () => 'one'),
          h(CatTabItem, { label: 'Second', value: value.value }, () => 'two')
        ]
      })
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await nextTick()
    expect(wrapper.findAll('[role="tab"]')).toHaveLength(2)

    value.value = 'after'
    await nextTick()
    await nextTick()
    expect(wrapper.findAll('[role="tab"]')).toHaveLength(2)
    wrapper.unmount()
  })

  // The tablist is drawn from the registration, so a label edited after mount
  // has to reach it.
  it('reflects a label edited after mount', async () => {
    const label = ref('Before')
    const Host = defineComponent({
      setup: () => () => h(CatTabs, { modelValue: 'a', ariaLabel: 'Sections' }, {
        default: () => [
          h(CatTabItem, { label: 'A', value: 'a' }, () => 'A'),
          h(CatTabItem, { label: label.value, value: 'b' }, () => 'B')
        ]
      })
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await nextTick()
    label.value = 'After'
    await nextTick()
    await nextTick()
    expect(wrapper.findAll('[role="tab"]').map(t => t.text())).toEqual(['A', 'After'])
    wrapper.unmount()
  })
})
