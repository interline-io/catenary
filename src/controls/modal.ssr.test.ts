import { describe, it, expect, vi, afterEach } from 'vitest'
import { createSSRApp, defineComponent, h, mergeProps, type ComponentInternalInstance } from 'vue'
import { renderToString, ssrRenderComponent, type SSRContext } from 'vue/server-renderer'
import CatModal from './modal.vue'

afterEach(() => {
  vi.restoreAllMocks()
})

// A component whose template root is a cat-modal, in the form the SSR compiler
// emits: the root component receives `_attrs`, which carries the scope id of a
// scoped parent. A teleported root cannot inherit attributes.
const ModalWrapper = defineComponent({
  ssrRender (
    _ctx: unknown,
    push: (item: ReturnType<typeof ssrRenderComponent>) => void,
    parent: ComponentInternalInstance,
    attrs: Record<string, unknown>
  ) {
    push(ssrRenderComponent(CatModal, mergeProps({ modelValue: true, title: 'Versions' }, attrs), null, parent))
  }
})

async function render () {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const app = createSSRApp(defineComponent({
    __scopeId: 'data-v-page',
    render: () => h('main', [h(ModalWrapper, { class: 'versions-dialog' })])
  }))
  const ctx: SSRContext = {}
  await renderToString(app, ctx)
  const warnings = warn.mock.calls.map(c => String(c[0]))
  return { body: String(ctx.teleports?.body ?? ''), warnings }
}

describe('cat-modal server rendering', () => {
  it('takes a scoped parent\'s scope id on its root without warning', async () => {
    const { body, warnings } = await render()
    expect(warnings.filter(w => w.includes('Extraneous non-props attributes'))).toEqual([])
    const root = body.match(/<div[^>]*class="[^"]*\bcat-modal\b[^"]*"[^>]*>/)?.[0]
    expect(root).toContain('data-v-page')
    expect(root).toContain('versions-dialog')
  })
})
