import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createSSRApp, defineComponent, h, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import CatSteps from './steps.vue'
import CatStepItem from './step-item.vue'
import { expectNoAxeViolations } from '../testutil/component-helpers'

type StepProps = Record<string, unknown>

async function mountSteps (stepsProps: StepProps = {}, initial = 'one') {
  const active = ref(initial)
  const Host = defineComponent({
    setup () {
      return () => h(CatSteps, {
        'modelValue': active.value,
        'aria-label': 'Demo progress',
        'onUpdate:modelValue': (v: string | number | undefined) => { active.value = String(v) },
        ...stepsProps
      }, () => [
        h(CatStepItem, { label: 'One', value: 'one' }, () => 'Panel 1'),
        h(CatStepItem, { label: 'Two', value: 'two' }, () => 'Panel 2'),
        h(CatStepItem, { label: 'Three', value: 'three' }, () => 'Panel 3')
      ])
    }
  })
  const wrapper = mount(Host, { attachTo: document.body })
  // step-items register with the parent in onMounted; wait a tick so the
  // progress list renders.
  await wrapper.vm.$nextTick()
  return { wrapper, active }
}

describe('cat-steps progress list', () => {
  it('renders an ordered list with one item per step', async () => {
    const { wrapper } = await mountSteps()
    const list = wrapper.find('ol.cat-steps-list')
    expect(list.exists()).toBe(true)
    expect(list.attributes('aria-label')).toBe('Demo progress')
    const items = wrapper.findAll('li.cat-step')
    expect(items).toHaveLength(3)
    expect(items.map(i => i.find('.cat-step-label').text())).toEqual(['One', 'Two', 'Three'])
    wrapper.unmount()
  })

  it('marks only the active step with aria-current="step"', async () => {
    const { wrapper, active } = await mountSteps({}, 'two')
    let triggers = wrapper.findAll('.cat-step-trigger')
    expect(triggers.map(t => t.attributes('aria-current'))).toEqual([undefined, 'step', undefined])

    active.value = 'three'
    await wrapper.vm.$nextTick()
    triggers = wrapper.findAll('.cat-step-trigger')
    expect(triggers.map(t => t.attributes('aria-current'))).toEqual([undefined, undefined, 'step'])
    wrapper.unmount()
  })

  it('gives each step a completed / current / upcoming class', async () => {
    const { wrapper } = await mountSteps({}, 'two')
    const items = wrapper.findAll('li.cat-step')
    expect(items[0]?.classes()).toContain('is-completed')
    expect(items[1]?.classes()).toContain('is-current')
    expect(items[2]?.classes()).toContain('is-upcoming')
    wrapper.unmount()
  })

  it('states completed and upcoming status in screen-reader-only text', async () => {
    const { wrapper } = await mountSteps({}, 'two')
    const items = wrapper.findAll('li.cat-step')
    expect(items[0]?.find('.is-sr-only').text()).toBe('Completed')
    // The current step says nothing extra — aria-current announces it.
    expect(items[1]?.find('.is-sr-only').exists()).toBe(false)
    expect(items[2]?.find('.is-sr-only').text()).toBe('Not completed')
    wrapper.unmount()
  })

  it('shows a check on completed markers and the position on the others', async () => {
    const { wrapper } = await mountSteps({}, 'two')
    const markers = wrapper.findAll('.cat-step-marker')
    expect(markers[0]?.find('.mdi-check').exists()).toBe(true)
    expect(markers[1]?.text()).toBe('2')
    expect(markers[2]?.text()).toBe('3')
    wrapper.unmount()
  })

  it('keeps numbers when completedIcon is null', async () => {
    const { wrapper } = await mountSteps({ completedIcon: null }, 'two')
    const markers = wrapper.findAll('.cat-step-marker')
    expect(markers[0]?.text()).toBe('1')
    wrapper.unmount()
  })
})

describe('cat-steps panels', () => {
  it('names each panel with its step label and shows only the active one', async () => {
    const { wrapper } = await mountSteps({}, 'two')
    const panels = wrapper.findAll('.cat-step-panel')
    expect(panels).toHaveLength(3)

    const labels = wrapper.findAll('.cat-step-label')
    panels.forEach((panel, i) => {
      expect(panel.attributes('role')).toBe('group')
      expect(panel.attributes('aria-labelledby')).toBe(labels[i]?.attributes('id'))
    })

    const hidden = panels.map(p => (p.element as HTMLElement).style.display === 'none')
    expect(hidden).toEqual([true, false, true])
    wrapper.unmount()
  })

  it('falls back to the first panel when the model matches no step', async () => {
    const { wrapper } = await mountSteps({}, 'nonexistent')
    const panels = wrapper.findAll('.cat-step-panel')
    expect((panels[0]?.element as HTMLElement).style.display).not.toBe('none')
    expect(wrapper.findAll('li.cat-step')[0]?.classes()).toContain('is-current')
    wrapper.unmount()
  })
})

describe('cat-steps navigation by marker', () => {
  it('lets a user go back but not skip ahead by default', async () => {
    const { wrapper } = await mountSteps({}, 'two')
    const triggers = wrapper.findAll('.cat-step-trigger')
    expect(triggers.map(t => t.element.tagName)).toEqual(['BUTTON', 'BUTTON', 'BUTTON'])
    // The current step is not aria-disabled even though activating it does
    // nothing: "unavailable" is the wrong word for where the user already is,
    // and aria-current already says what it is.
    expect(triggers.map(t => t.attributes('aria-disabled'))).toEqual([undefined, undefined, 'true'])
    expect(triggers[1]?.attributes('aria-current')).toBe('step')
    wrapper.unmount()
  })

  it('does nothing when the current step is activated', async () => {
    const { wrapper, active } = await mountSteps({}, 'two')
    await wrapper.findAll('.cat-step-trigger')[1]?.trigger('click')
    expect(active.value).toBe('two')
    expect(wrapper.findAll('li.cat-step')[1]?.classes()).toContain('is-current')
    wrapper.unmount()
  })

  it('activates a completed step on click', async () => {
    const { wrapper, active } = await mountSteps({}, 'three')
    await wrapper.findAll('.cat-step-trigger')[0]?.trigger('click')
    expect(active.value).toBe('one')
    wrapper.unmount()
  })

  it('ignores clicks on steps that are not reachable yet', async () => {
    const { wrapper, active } = await mountSteps({}, 'one')
    await wrapper.findAll('.cat-step-trigger')[2]?.trigger('click')
    expect(active.value).toBe('one')
    wrapper.unmount()
  })

  it('clickable makes every step reachable', async () => {
    const { wrapper, active } = await mountSteps({ clickable: true }, 'one')
    const triggers = wrapper.findAll('.cat-step-trigger')
    expect(triggers.map(t => t.attributes('aria-disabled'))).toEqual([undefined, undefined, undefined])
    await triggers[2]?.trigger('click')
    expect(active.value).toBe('three')
    wrapper.unmount()
  })

  it('clickable=false renders a read-only progress list with no buttons', async () => {
    const { wrapper } = await mountSteps({ clickable: false }, 'two')
    expect(wrapper.findAll('button')).toHaveLength(0)
    const triggers = wrapper.findAll('.cat-step-trigger')
    expect(triggers.map(t => t.element.tagName)).toEqual(['SPAN', 'SPAN', 'SPAN'])
    expect(triggers[1]?.attributes('aria-current')).toBe('step')
    wrapper.unmount()
  })

  it('honours a per-step clickable override', async () => {
    const active = ref('one')
    const Host = defineComponent({
      setup () {
        return () => h(CatSteps, {
          'modelValue': active.value,
          'aria-label': 'Demo',
          'onUpdate:modelValue': (v: string | number | undefined) => { active.value = String(v) }
        }, () => [
          h(CatStepItem, { label: 'One', value: 'one' }, () => 'Panel 1'),
          h(CatStepItem, { label: 'Two', value: 'two', clickable: true }, () => 'Panel 2')
        ])
      }
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await wrapper.vm.$nextTick()

    await wrapper.findAll('.cat-step-trigger')[1]?.trigger('click')
    expect(active.value).toBe('two')
    wrapper.unmount()
  })

  it('emits change with the new and previous values', async () => {
    const wrapper = mount(CatSteps, {
      attachTo: document.body,
      props: { modelValue: 'two', clickable: true, ariaLabel: 'Demo' },
      slots: {
        default: () => [
          h(CatStepItem, { label: 'One', value: 'one' }, () => 'Panel 1'),
          h(CatStepItem, { label: 'Two', value: 'two' }, () => 'Panel 2')
        ]
      }
    })
    await wrapper.vm.$nextTick()

    await wrapper.findAll('.cat-step-trigger')[0]?.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['one'])
    expect(wrapper.emitted('change')?.[0]).toEqual(['one', 'two'])
    wrapper.unmount()
  })
})

describe('cat-steps built-in navigation buttons', () => {
  it('are absent unless asked for', async () => {
    const { wrapper } = await mountSteps()
    expect(wrapper.find('.cat-steps-nav').exists()).toBe(false)
    wrapper.unmount()
  })

  it('advance and retreat, and disable at the ends', async () => {
    const { wrapper, active } = await mountSteps({ hasNavigation: true }, 'one')
    const buttons = () => wrapper.find('.cat-steps-nav').findAll('button')

    expect(buttons()[0]?.attributes('disabled')).toBeDefined()
    await buttons()[1]?.trigger('click')
    expect(active.value).toBe('two')

    await buttons()[0]?.trigger('click')
    expect(active.value).toBe('one')

    active.value = 'three'
    await wrapper.vm.$nextTick()
    expect(buttons()[1]?.attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })

  it('work without a v-model', async () => {
    const wrapper = mount(CatSteps, {
      attachTo: document.body,
      props: { hasNavigation: true, ariaLabel: 'Demo' },
      slots: {
        default: () => [
          h(CatStepItem, { label: 'One', value: 'one' }, () => 'Panel 1'),
          h(CatStepItem, { label: 'Two', value: 'two' }, () => 'Panel 2')
        ]
      }
    })
    await wrapper.vm.$nextTick()

    await wrapper.find('.cat-steps-nav').findAll('button')[1]?.trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('li.cat-step')[1]?.classes()).toContain('is-current')
    wrapper.unmount()
  })

  it('expose the same state to a custom navigation slot', async () => {
    const wrapper = mount(CatSteps, {
      attachTo: document.body,
      props: { modelValue: 'one', ariaLabel: 'Demo' },
      slots: {
        default: () => [
          h(CatStepItem, { label: 'One', value: 'one' }, () => 'Panel 1'),
          h(CatStepItem, { label: 'Two', value: 'two' }, () => 'Panel 2')
        ],
        navigation: (slotProps: any) => h('button', {
          'type': 'button',
          'class': 'custom-next',
          'data-has-next': String(slotProps.hasNext),
          'data-has-previous': String(slotProps.hasPrevious),
          'onClick': slotProps.next
        }, 'Continue')
      }
    })
    await wrapper.vm.$nextTick()

    const custom = wrapper.find('.custom-next')
    expect(custom.attributes('data-has-next')).toBe('true')
    expect(custom.attributes('data-has-previous')).toBe('false')
    await custom.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['two'])
    wrapper.unmount()
  })
})

describe('cat-steps focus management', () => {
  it('moves focus to the new panel after in-component navigation', async () => {
    const { wrapper } = await mountSteps({ hasNavigation: true }, 'one')
    await wrapper.find('.cat-steps-nav').findAll('button')[1]?.trigger('click')
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const panels = wrapper.findAll('.cat-step-panel')
    expect(document.activeElement).toBe(panels[1]?.element)
    wrapper.unmount()
  })

  it('leaves focus alone when the step changes from outside', async () => {
    const { wrapper, active } = await mountSteps({}, 'one')
    const outside = document.createElement('button')
    document.body.appendChild(outside)
    outside.focus()

    active.value = 'two'
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(document.activeElement).toBe(outside)
    outside.remove()
    wrapper.unmount()
  })
})

describe('cat-steps dynamic step items', () => {
  it('drops a step from the list when its item unmounts', async () => {
    const show = ref(true)
    const Host = defineComponent({
      setup () {
        return () => h(CatSteps, { modelValue: 'one', ariaLabel: 'Demo' }, () => [
          h(CatStepItem, { label: 'One', value: 'one' }, () => 'Panel 1'),
          show.value ? h(CatStepItem, { label: 'Two', value: 'two' }, () => 'Panel 2') : null,
          h(CatStepItem, { label: 'Three', value: 'three' }, () => 'Panel 3')
        ])
      }
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('li.cat-step')).toHaveLength(3)

    show.value = false
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.cat-step-label').map(l => l.text())).toEqual(['One', 'Three'])
    wrapper.unmount()
  })

  it('places a step revealed later in document order, not at the end', async () => {
    const show = ref(false)
    const Host = defineComponent({
      setup () {
        return () => h(CatSteps, { modelValue: 'one', ariaLabel: 'Demo' }, () => [
          h(CatStepItem, { label: 'One', value: 'one' }, () => 'Panel 1'),
          show.value ? h(CatStepItem, { label: 'Two', value: 'two' }, () => 'Panel 2') : null,
          h(CatStepItem, { label: 'Three', value: 'three' }, () => 'Panel 3')
        ])
      }
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await wrapper.vm.$nextTick()

    show.value = true
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.cat-step-label').map(l => l.text())).toEqual(['One', 'Two', 'Three'])
    wrapper.unmount()
  })

  it('replaces the old entry when a step item changes its value', async () => {
    const second = ref('two')
    const Host = defineComponent({
      setup () {
        return () => h(CatSteps, { modelValue: 'one', ariaLabel: 'Demo' }, () => [
          h(CatStepItem, { label: 'One', value: 'one' }, () => 'Panel 1'),
          h(CatStepItem, { label: 'Two', value: second.value }, () => 'Panel 2')
        ])
      }
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('li.cat-step')).toHaveLength(2)

    second.value = 'deux'
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    // The renamed step replaces its old registration rather than adding a
    // second marker for a panel that no longer answers to that value.
    expect(wrapper.findAll('li.cat-step')).toHaveLength(2)
    expect(wrapper.findAll('.cat-step-label').map(l => l.text())).toEqual(['One', 'Two'])
    wrapper.unmount()
  })

  it('re-registers when a step item changes, e.g. one that failed', async () => {
    const variant = ref<'primary' | 'danger'>('primary')
    const Host = defineComponent({
      setup () {
        return () => h(CatSteps, { modelValue: 'two', ariaLabel: 'Demo' }, () => [
          h(CatStepItem, { label: 'One', value: 'one' }, () => 'Panel 1'),
          h(CatStepItem, { label: 'Two', value: 'two', variant: variant.value, icon: 'alert-circle' }, () => 'Panel 2')
        ])
      }
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('li.cat-step')[1]?.classes()).toContain('is-primary')

    variant.value = 'danger'
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const failed = wrapper.findAll('li.cat-step')[1]
    expect(failed?.classes()).toContain('is-danger')
    expect(failed?.find('.mdi-alert-circle').exists()).toBe(true)
    wrapper.unmount()
  })
})

describe('cat-steps server rendering', () => {
  async function renderServerSide (modelValue?: string) {
    const app = createSSRApp({
      render: () => h(CatSteps, { modelValue, ariaLabel: 'Demo' }, () => [
        h(CatStepItem, { label: 'One', value: 'one' }, () => 'Panel 1'),
        h(CatStepItem, { label: 'Two', value: 'two' }, () => 'Panel 2'),
        h(CatStepItem, { label: 'Three', value: 'three' }, () => 'Panel 3')
      ])
    })
    const html = await renderToString(app)
    // Parsed rather than pattern-matched. The server markup carries fragment
    // anchor comments around slot content and may nest elements inside a panel,
    // neither of which a regex over the string survives — and textContent skips
    // comment nodes for free.
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const panels = [...doc.querySelectorAll<HTMLElement>('.cat-step-panel')].map(el => ({
      hidden: el.style.display === 'none',
      text: el.textContent ?? ''
    }))
    return { html, doc, panels }
  }

  it('renders the active step visible and the rest hidden', async () => {
    const { panels } = await renderServerSide('two')
    expect(panels.map(p => p.text)).toEqual(['Panel 1', 'Panel 2', 'Panel 3'])
    // Without the model fallback in activeValue every panel would be hidden,
    // shipping the whole component's content behind display:none.
    expect(panels.map(p => p.hidden)).toEqual([true, false, true])
  })

  it('shows the first step when the stepper is unbound', async () => {
    // Previously every panel rendered hidden here: nothing had registered on
    // the server, so the stepper had no way to know which step came first.
    // Reading the slot gives it the list, so the fallback to index 0 works
    // server-side too.
    const { panels } = await renderServerSide()
    expect(panels.map(p => p.hidden)).toEqual([false, true, true])
  })

  it('renders the progress list in the server HTML', async () => {
    // This expectation is the one the old test said would flip: markers came
    // from onMounted registrations, which never run during renderToString, so
    // the list shipped empty and filled in only on hydration.
    const { doc } = await renderServerSide('two')
    expect(doc.querySelector('.cat-steps-list')).not.toBeNull()
    expect(doc.querySelectorAll('.cat-step-marker')).toHaveLength(3)
    expect([...doc.querySelectorAll('.cat-steps-list li')].map(li => li.textContent?.trim()))
      .toEqual(expect.arrayContaining([expect.stringContaining('One')]))
  })

  it('pairs marker labels with panels by id on the server', async () => {
    const { doc } = await renderServerSide('two')
    const panels = [...doc.querySelectorAll('.cat-step-panel')]
    expect(panels).toHaveLength(3)
    for (const panel of panels) {
      const labelId = panel.getAttribute('aria-labelledby')
      expect(labelId).toBeTruthy()
      expect(doc.getElementById(labelId as string)).not.toBeNull()
    }
  })
})

describe('cat-steps accessibility', () => {
  it('has no axe violations', async () => {
    const { wrapper } = await mountSteps({}, 'two')
    await expectNoAxeViolations(wrapper)
    wrapper.unmount()
  })

  it('has no axe violations as a read-only progress list', async () => {
    const { wrapper } = await mountSteps({ clickable: false }, 'two')
    await expectNoAxeViolations(wrapper)
    wrapper.unmount()
  })

  it('names the list from a visible heading with ariaLabelledby', async () => {
    const wrapper = mount(defineComponent({
      setup () {
        return () => h('div', [
          h('h2', { id: 'steps-heading' }, 'Upload progress'),
          h(CatSteps, { modelValue: 'one', ariaLabelledby: 'steps-heading' }, () => [
            h(CatStepItem, { label: 'One', value: 'one' }, () => 'Panel 1'),
            h(CatStepItem, { label: 'Two', value: 'two' }, () => 'Panel 2')
          ])
        ])
      }
    }), { attachTo: document.body })
    await wrapper.vm.$nextTick()

    const list = wrapper.find('ol.cat-steps-list')
    expect(list.attributes('aria-labelledby')).toBe('steps-heading')
    expect(list.attributes('aria-label')).toBeUndefined()
    await expectNoAxeViolations(wrapper)
    wrapper.unmount()
  })

  describe('cat-steps items derived from slot VNodes', () => {
  // Ordering was previously kept by comparing panel elements with
  // compareDocumentPosition after a late registration. Reading the slot gives
  // template order directly, and that workaround is gone.
    it('keeps template order when a middle step appears after mount', async () => {
      const showMiddle = ref(false)
      const Host = defineComponent({
        setup: () => () => h(CatSteps, { modelValue: 'a', ariaLabel: 'Demo' }, () => [
          h(CatStepItem, { label: 'Alpha', value: 'a' }, () => 'A'),
          showMiddle.value ? h(CatStepItem, { label: 'Beta', value: 'b' }, () => 'B') : null,
          h(CatStepItem, { label: 'Gamma', value: 'c' }, () => 'C')
        ])
      })
      const wrapper = mount(Host)
      const labels = () => wrapper.findAll('.cat-steps-list li').map(li => li.text())
      expect(labels().join('|')).toContain('Alpha')
      expect(labels()).toHaveLength(2)

      showMiddle.value = true
      await nextTick()
      const after = labels()
      expect(after).toHaveLength(3)
      expect(after[1]).toContain('Beta')
      wrapper.unmount()
    })

    // deregister/register on a value change needed a watcher in the item; with
    // the list read from the slot the old entry cannot outlive the render.
    // The active step disappearing must not leave the stepper with no visible
    // panel. Previously handled by a fallback in activeValue; when that fallback
    // briefly moved into a watch on the model, removing the active step stopped
    // triggering it and every panel went hidden.
    it('falls back to the first step when the active one is removed', async () => {
      const showSecond = ref(true)
      const Host = defineComponent({
        setup: () => () => h(CatSteps, { modelValue: 'b', ariaLabel: 'Demo' }, () => [
          h(CatStepItem, { label: 'A', value: 'a' }, () => 'A'),
          showSecond.value ? h(CatStepItem, { label: 'B', value: 'b' }, () => 'B') : null,
          h(CatStepItem, { label: 'C', value: 'c' }, () => 'C')
        ])
      })
      const wrapper = mount(Host, { attachTo: document.body })
      const visible = () => wrapper.findAll('.cat-step-panel')
        .filter(p => (p.element as HTMLElement).style.display !== 'none')
      expect(visible()).toHaveLength(1)
      expect(visible()[0]?.text()).toBe('B')

      showSecond.value = false
      await nextTick()
      await nextTick()
      expect(visible()).toHaveLength(1)
      expect(visible()[0]?.text()).toBe('A')
      wrapper.unmount()
    })

    it('does not strand an entry when a value changes', async () => {
      const value = ref('before')
      const Host = defineComponent({
        setup: () => () => h(CatSteps, { modelValue: 'first', ariaLabel: 'Demo' }, () => [
          h(CatStepItem, { label: 'First', value: 'first' }, () => 'one'),
          h(CatStepItem, { label: 'Second', value: value.value }, () => 'two')
        ])
      })
      const wrapper = mount(Host)
      expect(wrapper.findAll('.cat-steps-list li')).toHaveLength(2)

      value.value = 'after'
      await nextTick()
      expect(wrapper.findAll('.cat-steps-list li')).toHaveLength(2)
      wrapper.unmount()
    })
  })
})
