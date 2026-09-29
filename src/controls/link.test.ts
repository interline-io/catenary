import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, flushPromises, enableAutoUnmount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createSSRApp, defineComponent, h, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import CatLink, { resetLinkWarnings } from './link.vue'
import { LinkRoutesKey } from './types'
import { axe } from '../testutil/axe'

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
    attachTo: document.body,
    props,
    attrs,
    slots: { default: 'Go' },
    global: { plugins: [router], provide: { [LinkRoutesKey as symbol]: routes } }
  })
  await flushPromises()
  return wrapper
}

enableAutoUnmount(afterEach)

afterEach(() => {
  vi.restoreAllMocks()
  resetLinkWarnings()
  document.documentElement.removeAttribute('data-theme')
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

    it('drops attributes outside the allowlist, including string handlers and role-dependent aria', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {})
      const onVnodeMounted = vi.fn()
      const wrapper = await mountLink({ routeKey: 'nope' }, {}, {
        'onclick': 'window.__clicked = true',
        'contenteditable': 'true',
        'accesskey': 'g',
        'draggable': 'true',
        'aria-label': 'Save',
        'aria-pressed': 'true',
        onVnodeMounted
      })
      const span = wrapper.get('span')
      for (const attr of ['onclick', 'contenteditable', 'accesskey', 'draggable', 'aria-label', 'aria-pressed']) {
        expect(span.attributes(attr)).toBeUndefined()
      }
      // Vnode lifecycle hooks are not interaction, so they still run
      expect(onVnodeMounted).toHaveBeenCalled()
    })

    it('picks up attributes added after a first render with none', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {})
      const extra = ref<Record<string, string>>({})
      const Host = defineComponent({
        render: () => h(CatLink, { routeKey: 'k1', ...extra.value }, () => 'Go')
      })
      const router = makeRouter()
      await router.push('/')
      const wrapper = mount(Host, { global: { plugins: [router] } })
      await flushPromises()
      extra.value = { 'class': 'button', 'data-x': '1' }
      await nextTick()
      const span = wrapper.get('span')
      expect(span.classes()).toContain('button')
      expect(span.attributes('data-x')).toBe('1')
    })

    it('does not treat Object.prototype keys as mapped', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const wrapper = await mountLink({ routeKey: 'constructor' })
      expect(wrapper.find('a').exists()).toBe(false)
      expect(warn).toHaveBeenCalledTimes(1)
      expect(warn.mock.calls[0]![0]).toContain('route-key="constructor" has no entry')
    })

    it('warns when a mapped route name does not exist in the router', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      await mountLink({ routeKey: 'st' }, { st: 'stationz' })
      expect(warn).toHaveBeenCalledTimes(1)
      expect(warn.mock.calls[0]![0]).toContain('route "stationz"')
    })

    it('warns when a direct `to` cannot be resolved', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      // Missing the required :id param
      await mountLink({ to: { name: 'station' } })
      expect(warn).toHaveBeenCalledTimes(1)
      expect(warn.mock.calls[0]![0]).toContain('cannot resolve')
    })

    it('warns when no router is installed', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mount(CatLink, { props: { to: '/' }, slots: { default: 'Go' } })
      await flushPromises()
      expect(warn).toHaveBeenCalledTimes(1)
      expect(warn.mock.calls[0]![0]).toContain('no router')
    })

    it('does not warn during server rendering', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const router = makeRouter()
      const app = createSSRApp({ render: () => h(CatLink, { routeKey: 'ssr-key' }, () => 'Go') })
      app.use(router)
      const html = await renderToString(app)
      expect(html).toContain('cat-link-unresolved')
      expect(warn).not.toHaveBeenCalled()
    })

    for (const theme of ['light', 'dark']) {
      it(`has no axe violations as a button-styled fallback (${theme})`, async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {})
        document.documentElement.setAttribute('data-theme', theme)
        const wrapper = await mountLink({ routeKey: 'nope' }, {}, {
          'class': 'button is-primary',
          'role': 'button',
          'aria-label': 'Save',
          'aria-pressed': 'true'
        })
        const results = await axe(wrapper.element)
        expect(results.violations).toEqual([])
      })
    }

    it('does not warn for a key mapped to the "" no-route sentinel', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const wrapper = await mountLink({ routeKey: 'none' }, { none: '' })
      expect(wrapper.find('a').exists()).toBe(false)
      expect(warn).not.toHaveBeenCalled()
    })
  })
})
