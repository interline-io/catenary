import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import CatTabs from '../controls/tabs.vue'
import CatTabItem from '../controls/tab-item.vue'
import { idFragment } from './slot-items'

// Wrapping an item worked under the registration model — the child registered
// itself from wherever it mounted. Reading the slot only sees direct children,
// so a wrapped item renders its panel but never reaches the header.
const Wrapper = defineComponent({
  props: { label: { type: String, required: true }, value: { type: String, required: true } },
  setup: (p, { slots }) => () => h(CatTabItem, { label: p.label, value: p.value }, slots)
})

function mountWith (children: unknown[]) {
  return mount(CatTabs, {
    props: { modelValue: 'a' },
    slots: { default: () => children as never }
  })
}

describe('slot item collection', () => {
  let warn: MockInstance<(...args: unknown[]) => void>

  beforeEach(() => { warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) as unknown as MockInstance<(...args: unknown[]) => void> })
  afterEach(() => { warn.mockRestore() })

  it('warns once when an item is wrapped in another component', () => {
    const wrapper = mountWith([
      h(CatTabItem, { label: 'Direct', value: 'a' }, () => 'A'),
      h(Wrapper, { label: 'Wrapped', value: 'b' }, () => 'B')
    ])
    // The panel still renders; only the header entry is missing, which is
    // exactly why this needs saying out loud.
    expect(wrapper.findAll('[role="tab"]')).toHaveLength(1)
    expect(wrapper.findAll('[role="tabpanel"]')).toHaveLength(2)

    const messages = warn.mock.calls.map((c: unknown[]) => String(c[0]))
    expect(messages.some((m: string) => m.includes('cat-tab-item') && m.includes('direct child'))).toBe(true)
    wrapper.unmount()
  })

  it('stays silent for direct children, v-for fragments and v-if comments', () => {
    const wrapper = mountWith([
      h(CatTabItem, { label: 'First', value: 'a' }, () => 'A'),
      ['b', 'c'].map(v => h(CatTabItem, { key: v, label: v, value: v }, () => v)),
      null,
      false
    ])
    expect(wrapper.findAll('[role="tab"]')).toHaveLength(3)
    expect(warn.mock.calls.filter((c: unknown[]) => String(c[0]).includes('[catenary]'))).toHaveLength(0)
    wrapper.unmount()
  })

  it('does not warn about plain elements beside the items', () => {
    const wrapper = mountWith([
      h(CatTabItem, { label: 'First', value: 'a' }, () => 'A'),
      h('div', 'sibling content')
    ])
    expect(warn.mock.calls.filter((c: unknown[]) => String(c[0]).includes('[catenary]'))).toHaveLength(0)
    wrapper.unmount()
  })
})

describe('idFragment', () => {
  it('replaces whitespace, which is the only character an id cannot carry', () => {
    expect(idFragment('two words')).toBe('two-words')
    expect(idFragment('plain')).toBe('plain')
    expect(idFragment(3)).toBe('3')
  })
})
