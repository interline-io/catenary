import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import CatTabs from './tabs.vue'
import CatTabItem from './tab-item.vue'

/**
 * The tablist is built from child registrations, so every one of these
 * exercises a way that list can drift from what the template says. Two earlier
 * attempts at this (#87, #88) each fixed some of these and regressed others;
 * they are written together so a fix has to satisfy all of them at once.
 */
function host (children: () => unknown[], modelValue = 'a') {
  const model = ref(modelValue)
  const Host = defineComponent({
    setup: () => () => h(CatTabs, {
      'modelValue': model.value,
      'ariaLabel': 'Sections',
      'onUpdate:modelValue': (v: string | number) => { model.value = String(v) }
    }, { default: children as never })
  })
  return { wrapper: mount(Host, { attachTo: document.body }), model }
}

const labels = (w: ReturnType<typeof host>['wrapper']) =>
  w.findAll('[role="tab"]').map(t => t.text())

const danglingPanels = (w: ReturnType<typeof host>['wrapper']) =>
  w.findAll('[role="tabpanel"]').filter((p) => {
    const id = p.attributes('aria-labelledby')
    return !id || !w.find(`#${id}`).exists()
  }).length

describe('cat-tabs dynamic children', () => {
  it('places a mid-list tab revealed after mount in template order', async () => {
    const show = ref(false)
    const { wrapper } = host(() => [
      h(CatTabItem, { label: 'A', value: 'a' }, () => 'A'),
      show.value ? h(CatTabItem, { label: 'B', value: 'b' }, () => 'B') : null,
      h(CatTabItem, { label: 'C', value: 'c' }, () => 'C')
    ])
    await nextTick()
    expect(labels(wrapper)).toEqual(['A', 'C'])
    show.value = true
    await nextTick(); await nextTick()
    expect(labels(wrapper)).toEqual(['A', 'B', 'C'])
    wrapper.unmount()
  })

  it('places a tab that belongs last at the end', async () => {
    const show = ref(false)
    const { wrapper } = host(() => [
      h(CatTabItem, { label: 'A', value: 'a' }, () => 'A'),
      h(CatTabItem, { label: 'B', value: 'b' }, () => 'B'),
      show.value ? h(CatTabItem, { label: 'C', value: 'c' }, () => 'C') : null
    ])
    await nextTick(); show.value = true
    await nextTick(); await nextTick()
    expect(labels(wrapper)).toEqual(['A', 'B', 'C'])
    wrapper.unmount()
  })

  // Arrow keys move focus by index into the tablist. If the registration order
  // and the rendered buttons ever disagree, focus lands on one tab while a
  // different one activates — worse than a mis-ordered header.
  it('keeps DOM focus and activation on the same tab after a mid-list reveal', async () => {
    const show = ref(false)
    const { wrapper, model } = host(() => [
      h(CatTabItem, { label: 'A', value: 'a' }, () => 'A'),
      show.value ? h(CatTabItem, { label: 'B', value: 'b' }, () => 'B') : null,
      h(CatTabItem, { label: 'C', value: 'c' }, () => 'C')
    ])
    await nextTick(); show.value = true
    await nextTick(); await nextTick()

    const tabs = wrapper.findAll('[role="tab"]')
    ;(tabs[0]!.element as HTMLElement).focus()
    await tabs[0]!.trigger('keydown', { key: 'ArrowRight' })
    await nextTick()
    expect(model.value).toBe('b')
    expect((document.activeElement as HTMLElement)?.textContent?.trim()).toBe('B')
    wrapper.unmount()
  })

  it('survives an unkeyed v-for shrinking', async () => {
    const items = ref(['a', 'b', 'c'])
    const { wrapper } = host(
      () => items.value.map(v => h(CatTabItem, { label: v.toUpperCase(), value: v }, () => v)),
      'b'
    )
    await nextTick()
    expect(labels(wrapper)).toEqual(['A', 'B', 'C'])
    items.value = ['b', 'c']
    await nextTick(); await nextTick()
    expect(labels(wrapper)).toEqual(['B', 'C'])
    expect(danglingPanels(wrapper)).toBe(0)
    wrapper.unmount()
  })

  it('survives two siblings exchanging values', async () => {
    const a = ref('a'); const b = ref('b')
    const { wrapper } = host(() => [
      h(CatTabItem, { label: 'One', value: a.value }, () => '1'),
      h(CatTabItem, { label: 'Two', value: b.value }, () => '2')
    ])
    await nextTick()
    a.value = 'b'; b.value = 'a'
    await nextTick(); await nextTick()
    expect(labels(wrapper)).toEqual(['One', 'Two'])
    expect(danglingPanels(wrapper)).toBe(0)
    wrapper.unmount()
  })

  it('does not strand an entry when a value changes', async () => {
    const value = ref('before')
    const { wrapper } = host(() => [
      h(CatTabItem, { label: 'First', value: 'first' }, () => 'one'),
      h(CatTabItem, { label: 'Second', value: value.value }, () => 'two')
    ], 'first')
    await nextTick()
    value.value = 'after'
    await nextTick(); await nextTick()
    expect(labels(wrapper)).toEqual(['First', 'Second'])
    // The surviving entry must carry the NEW value, not merely count right.
    const second = wrapper.findAll('[role="tab"]')[1]!
    const panel = wrapper.find(`#${second.attributes('aria-controls')}`)
    expect(panel.exists()).toBe(true)
    expect(panel.text()).toBe('two')
    wrapper.unmount()
  })

  it('keeps keyboard focus when a focused tab changes value', async () => {
    const value = ref('b')
    const { wrapper } = host(() => [
      h(CatTabItem, { label: 'A', value: 'a' }, () => 'A'),
      h(CatTabItem, { label: 'B', value: value.value }, () => 'B')
    ])
    await nextTick()
    const before = wrapper.findAll('[role="tab"]')[1]!.element as HTMLElement
    before.focus()
    value.value = 'b2'
    await nextTick(); await nextTick()
    expect(document.activeElement).not.toBe(document.body)
    expect((document.activeElement as HTMLElement)?.textContent?.trim()).toBe('B')
    wrapper.unmount()
  })

  // A tablist where nothing is selected and no panel shows is the worst
  // outcome: the content simply disappears.
  it('always selects exactly one tab and shows its panel', async () => {
    const value = ref('b')
    const { wrapper } = host(() => [
      h(CatTabItem, { label: 'A', value: 'a' }, () => 'A'),
      h(CatTabItem, { label: 'B', value: value.value }, () => 'B')
    ], 'b')
    await nextTick()
    const state = () => ({
      selected: wrapper.findAll('[role="tab"]').filter(t => t.attributes('aria-selected') === 'true').length,
      visible: wrapper.findAll('[role="tabpanel"]').filter(p => (p.element as HTMLElement).style.display !== 'none').length
    })
    expect(state()).toEqual({ selected: 1, visible: 1 })
    value.value = 'b2'
    await nextTick(); await nextTick()
    expect(state()).toEqual({ selected: 1, visible: 1 })
    wrapper.unmount()
  })

  it('reflects a label edited after mount', async () => {
    const label = ref('Before')
    const { wrapper } = host(() => [
      h(CatTabItem, { label: 'A', value: 'a' }, () => 'A'),
      h(CatTabItem, { label: label.value, value: 'b' }, () => 'B')
    ])
    await nextTick()
    label.value = 'After'
    await nextTick(); await nextTick()
    expect(labels(wrapper)).toEqual(['A', 'After'])
    wrapper.unmount()
  })

  it('selects exactly one tab when two items share a value', async () => {
    // Keying the registry on tabId removed the de-duplication that keying on
    // value used to provide, so both matched and the tablist rendered two
    // aria-selected="true" tabs with two visible panels. A single-select
    // tablist must have exactly one (APG).
    const { wrapper } = host(() => [
      h(CatTabItem, { label: 'One', value: 'a' }, () => '1'),
      h(CatTabItem, { label: 'Two', value: 'a' }, () => '2')
    ])
    await nextTick()
    expect(wrapper.findAll('[role="tab"]')).toHaveLength(2)
    expect(wrapper.findAll('[role="tab"]').filter(t => t.attributes('aria-selected') === 'true'))
      .toHaveLength(1)
    expect(wrapper.findAll('[role="tabpanel"]')
      .filter(p => (p.element as HTMLElement).style.display !== 'none')).toHaveLength(1)
    wrapper.unmount()
  })

  it('does not broadcast a resize while mounting or on a label edit', async () => {
    // Watching the tablist's shape made every instance dispatch a page-wide
    // resize as its children registered, and once per tick for a label bound
    // to live data — forcing maps and charts to relayout for nothing.
    const seen: Event[] = []
    const onResize = (e: Event) => seen.push(e)
    window.addEventListener('resize', onResize)
    const label = ref('A')
    const { wrapper } = host(() => [
      h(CatTabItem, { label: label.value, value: 'a' }, () => 'A'),
      h(CatTabItem, { label: 'B', value: 'b' }, () => 'B')
    ])
    await nextTick(); await nextTick()
    expect(seen).toHaveLength(0)

    label.value = 'A (12)'
    await nextTick(); await nextTick()
    expect(seen).toHaveLength(0)
    window.removeEventListener('resize', onResize)
    wrapper.unmount()
  })
})
