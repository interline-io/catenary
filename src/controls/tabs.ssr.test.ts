import { describe, it, expect } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import CatTabs from './tabs.vue'
import CatTabItem from './tab-item.vue'

/**
 * cat-tabs had no server-rendering coverage at all, while cat-steps has three
 * such tests. That asymmetry is why an SSR regression shipped green: the
 * tablist is built from `onMounted` registrations, which never run during
 * renderToString, so anything derived from that registry has to stay correct
 * with it empty.
 */
async function render (modelValue?: string) {
  const app = createSSRApp({
    render: () => h(CatTabs, { modelValue, ariaLabel: 'Sections' }, () => [
      h(CatTabItem, { label: 'Alpha', value: 'a' }, () => 'Panel A'),
      h(CatTabItem, { label: 'Beta', value: 'b' }, () => 'Panel B')
    ])
  })
  const html = await renderToString(app)
  const panels = [...html.matchAll(/<div[^>]*role="tabpanel"[^>]*>/g)]
    .map(m => (m[0].includes('display:none') ? 'hidden' : 'visible'))
  return { html, panels }
}

describe('cat-tabs server rendering', () => {
  it('renders the active panel visible and the rest hidden', async () => {
    const { panels } = await render('b')
    expect(panels).toEqual(['hidden', 'visible'])
  })

  it('renders the first panel visible when the model names the first tab', async () => {
    const { panels } = await render('a')
    expect(panels).toEqual(['visible', 'hidden'])
  })

  it('ships the active panel content in the HTML, not behind display:none', async () => {
    const { html } = await render('b')
    const beta = html.indexOf('Panel B')
    expect(beta).toBeGreaterThan(-1)
    // The panel wrapping that content must not be the hidden one.
    const openTag = html.lastIndexOf('<div', beta)
    expect(html.slice(openTag, beta)).not.toContain('display:none')
  })

  // The tablist itself stays client-only: registrations arrive in onMounted.
  // Documented rather than endorsed — #67 tracks fixing it.
  it('leaves the tablist empty until hydration', async () => {
    const { html } = await render('a')
    expect(html).toContain('role="tablist"')
    expect(html).not.toContain('role="tab"')
  })
})
