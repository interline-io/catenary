import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, createSSRApp, defineComponent, h, ref, Suspense } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { mount } from '@vue/test-utils'
import { mdiAccount, mdiBell, mdiHome } from '@mdi/js'
import CatIcon from './icon.vue'
import CatIconSprite from './icon-sprite.vue'
import { CatenaryPlugin, type CatenaryPluginOptions } from '../index'
import { registerIcons } from '../util/icons'

const withPlugin = (options: CatenaryPluginOptions) => ({ global: { plugins: [[CatenaryPlugin, options]] as never } })
const flush = () => new Promise(resolve => setTimeout(resolve, 0))

let warn: ReturnType<typeof vi.spyOn>
let error: ReturnType<typeof vi.spyOn>
beforeEach(() => {
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  error = vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  warn.mockRestore()
  error.mockRestore()
})
const warnings = (match: string) => warn.mock.calls.filter((args: unknown[]) => String(args[0]).includes(match))

describe('strictIcons', () => {
  it('is off by default', () => {
    mount(CatIcon, { props: { icon: 'strict-default' }, ...withPlugin({}) }).unmount()
    expect(warnings('not registered')).toHaveLength(0)
  })

  it('warn reports each unregistered name once and still renders the webfont class', () => {
    const app = mount(defineComponent({
      render: () => [
        h(CatIcon, { icon: 'strict-one' }),
        h(CatIcon, { icon: 'strict-one' }),
        h(CatIcon, { icon: 'strict-two' }),
        h(CatIcon, { icon: 'check' })
      ]
    }), withPlugin({ strictIcons: 'warn' }))
    expect(warnings('"strict-one" is not registered')).toHaveLength(1)
    expect(warnings('"strict-two" is not registered')).toHaveLength(1)
    expect(warnings('"check"')).toHaveLength(0)
    expect(app.findAll('i.mdi-strict-one')).toHaveLength(2)
    app.unmount()
  })

  it('warn is silent in production', () => {
    const env = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    try {
      mount(CatIcon, { props: { icon: 'strict-prod' }, ...withPlugin({ strictIcons: 'warn' }) }).unmount()
    } finally {
      process.env.NODE_ENV = env
    }
    expect(warnings('not registered')).toHaveLength(0)
  })

  it('error throws for an unregistered name, and not for a registered one', () => {
    expect(() => mount(CatIcon, { props: { icon: 'strict-throws' }, ...withPlugin({ strictIcons: 'error' }) }))
      .toThrow('"strict-throws" is not registered')
    expect(() => mount(CatIcon, { props: { icon: 'check' }, ...withPlugin({ strictIcons: 'error' }) }).unmount())
      .not.toThrow()
  })

  it('keeps its warned names per app', () => {
    mount(CatIcon, { props: { icon: 'strict-per-app' }, ...withPlugin({ strictIcons: 'warn' }) }).unmount()
    mount(CatIcon, { props: { icon: 'strict-per-app' }, ...withPlugin({ strictIcons: 'warn' }) }).unmount()
    mount(CatIcon, { props: { icon: 'strict-per-app' }, ...withPlugin({}) }).unmount()
    expect(warnings('"strict-per-app"')).toHaveLength(2)
  })
})

describe('iconSprite', () => {
  const Page = (icons: string[]) => defineComponent({
    render: () => h('main', [...icons.map(icon => h(CatIcon, { icon })), h(CatIconSprite)])
  })

  it('draws icons as <use> of one shared symbol each', async () => {
    const wrapper = mount(Page(['check', 'check', 'magnify']), withPlugin({ iconSprite: true }))
    await flush()
    const uses = wrapper.findAll('svg[data-icon="check"] use')
    expect(uses).toHaveLength(2)
    expect(uses[0]?.attributes('href')).toBe('#cat-icon-check')
    expect(wrapper.findAll('#cat-icon-check')).toHaveLength(1)
    expect(wrapper.find('#cat-icon-check path').attributes('d')).toBeTruthy()
    // Same host semantics as an inline path
    const svg = wrapper.find('svg[data-icon="check"]')
    expect(svg.attributes('aria-hidden')).toBe('true')
    expect(svg.attributes('focusable')).toBe('false')
    expect(svg.attributes('viewBox')).toBe('0 0 24 24')
    expect(wrapper.find('svg.cat-icon-sprite').attributes('aria-hidden')).toBe('true')
    expect(warnings('cat-icon-sprite')).toHaveLength(0)
    wrapper.unmount()
  })

  it('keeps spin and size on the <use> form', async () => {
    const wrapper = mount(defineComponent({
      render: () => [h(CatIcon, { icon: 'loading', size: 'large' }), h(CatIconSprite)]
    }), withPlugin({ iconSprite: true }))
    await flush()
    const svg = wrapper.find('svg[data-icon="loading"]')
    expect(svg.find('use').exists()).toBe(true)
    expect((svg.element as SVGElement).style.fontSize).toBe('48px')
    wrapper.unmount()
  })

  it('renders nothing from the sprite, and inline paths, when the option is off', async () => {
    const wrapper = mount(Page(['check']), withPlugin({}))
    await flush()
    expect(wrapper.find('svg.cat-icon-sprite').exists()).toBe(false)
    expect(wrapper.find('svg[data-icon="check"] path').exists()).toBe(true)
    wrapper.unmount()
  })

  it('falls back to inline paths, with a warning, when no sprite is mounted', async () => {
    const wrapper = mount(CatIcon, { props: { icon: 'check' }, ...withPlugin({ iconSprite: true }) })
    expect(wrapper.find('use').exists()).toBe(true)
    await flush()
    expect(wrapper.find('use').exists()).toBe(false)
    expect(wrapper.find('path').exists()).toBe(true)
    expect(warnings('no <cat-icon-sprite> has mounted')).toHaveLength(1)
    wrapper.unmount()
  })

  it('adds the symbol for an icon registered after mount, as a lazily loaded route would', async () => {
    const showRoute = ref(false)
    const wrapper = mount(defineComponent({
      render: () => [showRoute.value ? h(CatIcon, { icon: 'sprite-late-route' }) : null, h(CatIconSprite)]
    }), withPlugin({ iconSprite: true }))
    await flush()
    expect(wrapper.find('#cat-icon-sprite-late-route').exists()).toBe(false)

    registerIcons({ 'sprite-late-route': mdiBell })
    showRoute.value = true
    await flush()
    expect(wrapper.find('#cat-icon-sprite-late-route path').attributes('d')).toBe(mdiBell)
    expect(wrapper.find('svg[data-icon="sprite-late-route"] use').attributes('href')).toBe('#cat-icon-sprite-late-route')
    wrapper.unmount()
  })

  it('keeps sprite state per app', async () => {
    const withSprite = mount(Page(['check']), withPlugin({ iconSprite: true }))
    const without = mount(CatIcon, { props: { icon: 'check' }, ...withPlugin({ iconSprite: true }) })
    await flush()
    expect(withSprite.find('svg[data-icon="check"] use').exists()).toBe(true)
    expect(without.find('svg[data-icon="check"] path').exists()).toBe(true)
    withSprite.unmount()
    without.unmount()
  })
})

describe('iconSprite with server rendering', () => {
  registerIcons({ 'ssr-async': mdiHome, 'ssr-suspended': mdiAccount })

  // Icons rendered by an async component and inside <Suspense>, both of which
  // Vue's server renderer renders *after* the sprite that follows them
  const AsyncIcons = defineComponent({
    async setup () {
      await new Promise(resolve => setTimeout(resolve, 5))
      return () => h(CatIcon, { icon: 'ssr-async' })
    }
  })
  const SuspendedIcons = defineComponent({
    async setup () {
      await new Promise(resolve => setTimeout(resolve, 5))
      return () => h(CatIcon, { icon: 'ssr-suspended' })
    }
  })
  const Root = defineComponent({
    render: () => h(Suspense, null, {
      default: () => h('div', [
        h(CatIcon, { icon: 'check' }),
        h(CatIcon, { icon: 'check' }),
        h(AsyncIcons),
        h(Suspense, null, { default: () => h(SuspendedIcons) }),
        h(CatIconSprite)
      ])
    })
  })

  it('puts a symbol for every icon, async ones included, in the server HTML, once each', async () => {
    const app = createSSRApp(Root).use(CatenaryPlugin, { iconSprite: true })
    const html = await renderToString(app)
    for (const name of ['check', 'ssr-async', 'ssr-suspended']) {
      expect(html).toContain(`href="#cat-icon-${name}"`)
      expect(html.split(`id="cat-icon-${name}"`)).toHaveLength(2)
    }
  })

  it('hydrates without a mismatch', async () => {
    const html = await renderToString(createSSRApp(Root).use(CatenaryPlugin, { iconSprite: true }))
    const container = document.createElement('div')
    container.innerHTML = html
    document.body.appendChild(container)

    const app = createSSRApp(Root).use(CatenaryPlugin, { iconSprite: true })
    app.mount(container)
    await new Promise(resolve => setTimeout(resolve, 30))

    const logged = [...warn.mock.calls, ...error.mock.calls].map((args: unknown[]) => String(args[0]))
    expect(logged.filter(message => /hydration|mismatch/i.test(message))).toEqual([])
    expect(container.querySelector('svg[data-icon="ssr-async"] use')?.getAttribute('href')).toBe('#cat-icon-ssr-async')
    expect(container.querySelectorAll('#cat-icon-check')).toHaveLength(1)
    app.unmount()
    container.remove()
  })

  it('keeps concurrent renders apart', async () => {
    const Single = defineComponent({ render: () => h(CatIcon, { icon: 'check' }) })
    const [sprite, inline] = await Promise.all([
      renderToString(createSSRApp(Single).use(CatenaryPlugin, { iconSprite: true })),
      renderToString(createSSRApp(Single).use(CatenaryPlugin, {}))
    ])
    expect(sprite).toContain('<use href="#cat-icon-check"')
    expect(inline).toContain('<path d=')
    expect(inline).not.toContain('<use')
  })

  it('does not need the plugin', () => {
    const app = createApp(CatIcon, { icon: 'check' })
    const container = document.createElement('div')
    app.mount(container)
    expect(container.querySelector('svg path')).not.toBeNull()
    app.unmount()
  })
})
