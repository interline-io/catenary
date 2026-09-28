import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { defineComponent, h } from 'vue'
import CatLink from './link.vue'
import { LinkRoutesKey } from './types'

const Stub = defineComponent({ render: () => h('div') })

function makeRouter () {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: Stub },
      { path: '/stations/:id', name: 'station', component: Stub }
    ]
  })
}

async function mountLink (props: Record<string, unknown>, routes: Record<string, string> = {}, attrs: Record<string, unknown> = {}) {
  const router = makeRouter()
  await router.push('/')
  const wrapper = mount(CatLink, {
    props,
    attrs,
    slots: { default: 'Go' },
    global: { plugins: [router], provide: { [LinkRoutesKey as symbol]: routes } }
  })
  await flushPromises()
  return wrapper
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('cat-link', () => {
  it('renders a link to the route a mapped route key names', async () => {
    const wrapper = await mountLink({ routeKey: 'st', to: { params: { id: '7' } } }, { st: 'station' })
    expect(wrapper.find('a').attributes('href')).toBe('/stations/7')
  })

  it('renders a link for a direct `to`', async () => {
    const wrapper = await mountLink({ to: { name: 'station', params: { id: '3' } } })
    expect(wrapper.find('a').attributes('href')).toBe('/stations/3')
  })

  it('keeps listeners and attrs on a resolved link', async () => {
    const onClick = vi.fn()
    const wrapper = await mountLink({ to: '/' }, {}, { class: 'button is-primary', onClick })
    const a = wrapper.get('a')
    expect(a.classes()).toContain('button')
    expect(a.classes()).not.toContain('cat-link-unresolved')
    await a.trigger('click')
    expect(onClick).toHaveBeenCalled()
  })

  describe('unresolved fallback', () => {
    it('renders inert text: no link, no listeners, no interactive attrs', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {})
      const onClick = vi.fn()
      const onKeydown = vi.fn()
      const wrapper = await mountLink({ routeKey: 'nope' }, {}, {
        'class': 'button is-primary',
        'style': 'margin: 1px',
        'id': 'x',
        'data-test': 'y',
        'tabindex': '0',
        'role': 'link',
        'aria-current': 'page',
        onClick,
        onKeydown
      })
      expect(wrapper.find('a').exists()).toBe(false)
      const span = wrapper.get('span')
      await span.trigger('click')
      await span.trigger('keydown', { key: 'Enter' })
      expect(onClick).not.toHaveBeenCalled()
      expect(onKeydown).not.toHaveBeenCalled()
      expect(span.attributes('tabindex')).toBeUndefined()
      expect(span.attributes('role')).toBeUndefined()
      expect(span.attributes('aria-current')).toBeUndefined()
      // Layout-bearing attrs survive
      expect(span.classes()).toEqual(expect.arrayContaining(['button', 'is-primary', 'cat-link-unresolved']))
      expect(span.attributes('style')).toContain('margin')
      expect(span.attributes('id')).toBe('x')
      expect(span.attributes('data-test')).toBe('y')
      expect(span.text()).toBe('Go')
    })

    it('marks a missing `to` as unresolved without warning', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const wrapper = await mountLink({ to: null })
      expect(wrapper.get('span').classes()).toContain('cat-link-unresolved')
      expect(warn).not.toHaveBeenCalled()
    })

    it('warns once per unmapped route key', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      await mountLink({ routeKey: 'unmapped-once' })
      await mountLink({ routeKey: 'unmapped-once' })
      expect(warn).toHaveBeenCalledTimes(1)
      expect(warn.mock.calls[0]![0]).toContain('unmapped-once')
    })

    it('warns when the route key changes to an unmapped one', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const wrapper = await mountLink({ routeKey: 'st', to: { params: { id: '1' } } }, { st: 'station' })
      expect(warn).not.toHaveBeenCalled()
      await wrapper.setProps({ routeKey: 'unmapped-later' })
      expect(warn).toHaveBeenCalledTimes(1)
      expect(wrapper.find('a').exists()).toBe(false)
    })

    it('does not warn for a key mapped to the "" no-route sentinel', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const wrapper = await mountLink({ routeKey: 'none' }, { none: '' })
      expect(wrapper.find('a').exists()).toBe(false)
      expect(warn).not.toHaveBeenCalled()
    })
  })
})
