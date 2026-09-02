import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { h, defineComponent } from 'vue'
import CatLink from './link.vue'
import { LinkRoutesKey } from './types'

const Blank = defineComponent({ render: () => h('div') })

function makeRouter () {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: Blank },
      { path: '/stations/:id', name: 'apps-stations-stationKey', component: Blank },
      { path: '/saas/transfers/:id', name: 'saas-transfer-analyst-stationKey', component: Blank }
    ]
  })
}

let warn: ReturnType<typeof vi.spyOn>
beforeEach(() => { warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })
afterEach(() => { warn.mockRestore() })
const catWarnings = () => warn.mock.calls
  .filter((c: unknown[]) => String(c[0]).includes('[catenary]')).map((c: unknown[]) => String(c[0]))

async function mountLink (props: Record<string, unknown>, routes?: Record<string, string>) {
  const router = makeRouter()
  router.push('/'); await router.isReady()
  const w = mount(CatLink, {
    props,
    slots: { default: () => 'Edit station' },
    global: { plugins: [router], provide: routes ? { [LinkRoutesKey as symbol]: routes } : {} }
  })
  await flushPromises()
  return w
}

describe('cat-link resolution', () => {
  it('resolves a mapped route key', async () => {
    const w = await mountLink({ routeKey: 'apps-transfers', to: { params: { id: '1' } } },
      { 'apps-transfers': 'saas-transfer-analyst-stationKey' })
    expect(w.find('a').exists()).toBe(true)
    expect(catWarnings()).toHaveLength(0)
  })

  it('resolves a plain `to`', async () => {
    const w = await mountLink({ to: { name: 'home' } })
    expect(w.find('a').exists()).toBe(true)
    expect(catWarnings()).toHaveLength(0)
  })

  // The map exists to remap a key into a host's own route namespace. When a host
  // needs no remapping, requiring an identity entry for every key is a trap: a
  // missing entry renders an inert look-alike rather than failing loudly.
  it('falls back to using the key as a route name when the map has no entry', async () => {
    const w = await mountLink({ routeKey: 'apps-stations-stationKey', to: { params: { id: '1' } } }, {})
    expect(w.find('a').exists()).toBe(true)
    expect(w.find('span').exists()).toBe(false)
    expect(catWarnings()).toHaveLength(0)
  })

  it('still falls back to a span when nothing resolves', async () => {
    const w = await mountLink({ routeKey: 'no-such-route' }, {})
    expect(w.find('a').exists()).toBe(false)
    expect(w.find('span').exists()).toBe(true)
  })
})

describe('cat-link inert fallback is announced in development', () => {
  // 44 of the 70 consumer usages pass `class="button is-primary"` and the like,
  // so an unresolved link renders a <span> styled as a button: no role, not
  // focusable, does nothing when clicked or activated.
  it('warns, naming the key it could not resolve', async () => {
    await mountLink({ routeKey: 'apps-stations-missing' }, {})
    expect(catWarnings().join('\n')).toMatch(/apps-stations-missing/)
  })

  it('says the fallback is not navigable', async () => {
    await mountLink({ routeKey: 'nope' }, {})
    expect(catWarnings().join('\n')).toMatch(/not navigable|<span>/i)
  })

  // A warning that throws is worse than no warning: `to` can legitimately hold
  // values JSON cannot serialise (a cycle, a BigInt in `state`).
  it('does not throw when `to` is not JSON-serialisable', async () => {
    const cyclic: Record<string, unknown> = { name: 'no-such-route' }
    cyclic.self = cyclic
    await expect(mountLink({ to: cyclic as never })).resolves.toBeTruthy()
    expect(catWarnings().length).toBeGreaterThan(0)
  })

  // With no router at all, every destination fails to resolve. Blaming the
  // route map would send someone looking in the wrong place.
  it('names the real cause when no router is installed', async () => {
    const w = mount(CatLink, {
      props: { routeKey: 'anything' },
      slots: { default: () => 'x' }
    })
    await flushPromises()
    expect(w.find('span').exists()).toBe(true)
    expect(catWarnings().join('\n')).toMatch(/router/i)
    expect(catWarnings().join('\n')).not.toMatch(/missing from the map/i)
    w.unmount()
  })

  it('stays silent when no destination was asked for', async () => {
    const w = await mountLink({})
    expect(w.find('span').exists()).toBe(true)
    expect(catWarnings()).toHaveLength(0)
  })
})
