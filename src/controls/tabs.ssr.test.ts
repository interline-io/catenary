import { describe, it, expect } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import CatTabs from './tabs.vue'
import CatTabItem from './tab-item.vue'

/**
 * The tablist used to be built from `onMounted` registrations, which never run
 * during renderToString — so the server HTML contained the panels but no tabs
 * at all, and the header appeared only on hydration. Tabs carry page content,
 * so that is the SEO-relevant half of #67.
 */
describe('cat-tabs server rendering', () => {
  async function render (modelValue = 'a') {
    const app = createSSRApp({
      render: () => h(CatTabs, { modelValue, ariaLabel: 'Sections' }, {
        default: () => [
          h(CatTabItem, { label: 'Alpha', value: 'a' }, () => 'Alpha panel'),
          h(CatTabItem, { label: 'Beta', value: 'b' }, () => 'Beta panel')
        ]
      })
    })
    return renderToString(app)
  }

  it('renders the tablist and its tabs in the server HTML', async () => {
    const html = await render()
    expect(html).toContain('role="tablist"')
    expect(html).toContain('role="tab"')
    expect(html).toContain('Alpha')
    expect(html).toContain('Beta')
  })

  it('renders tabs in template order', async () => {
    const html = await render()
    expect(html.indexOf('Alpha')).toBeLessThan(html.indexOf('Beta'))
  })

  // Ids are derived from the parent's useId() plus each item's value, so the
  // server and client agree without either side counting positions. Getting
  // this wrong would trade the SSR bug for a hydration mismatch, which is worse.
  it('pairs tab and panel ids consistently in server output', async () => {
    const html = await render()
    const tabIds = [...html.matchAll(/id="([^"]*-tab-[^"]*)"/g)].map(m => m[1])
    const controls = [...html.matchAll(/aria-controls="([^"]*)"/g)].map(m => m[1])
    const labelledby = [...html.matchAll(/aria-labelledby="([^"]*-tab-[^"]*)"/g)].map(m => m[1])

    expect(tabIds).toHaveLength(2)
    expect(new Set(tabIds).size).toBe(2)
    // Every aria-controls resolves to a panel id present in the output.
    for (const id of controls) expect(html).toContain(`id="${id}"`)
    // Every panel points back at a real tab id.
    expect(labelledby.sort()).toEqual([...tabIds].sort())
  })

  it('marks the active tab selected on the server', async () => {
    const html = await render('b')
    const selected = [...html.matchAll(/aria-selected="(true|false)"/g)].map(m => m[1])
    expect(selected.filter(v => v === 'true')).toHaveLength(1)
  })
})
