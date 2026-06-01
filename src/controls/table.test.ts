import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import CatTable from './table.vue'
import CatTableColumn from './table-column.vue'
import { expectNoAxeViolations } from '../testutil/component-helpers'

async function mountTable (props: Record<string, any> = {}) {
  const Host = defineComponent({
    components: { CatTable, CatTableColumn },
    setup () {
      const data = [
        { id: 1, name: 'Aardvark' },
        { id: 2, name: 'Badger' }
      ]
      return () => h(CatTable, { data, ...props }, {
        columns: () => [
          h(CatTableColumn, { field: 'id', label: 'ID', sortable: true }),
          h(CatTableColumn, { field: 'name', label: 'Name', sortable: true })
        ],
        default: ({ row }: { row: Record<string, unknown> }) => [
          h('td', String(row.id)),
          h('td', String(row.name))
        ]
      })
    }
  })
  const wrapper = mount(Host, { attachTo: document.body })
  // table-column registers via onMounted; wait one tick for the header row.
  await wrapper.vm.$nextTick()
  return wrapper
}

describe('cat-table accessibility', () => {
  it('renders a <caption> when the caption prop is set', async () => {
    const wrapper = await mountTable({ caption: 'Census tracts' })
    const caption = wrapper.find('caption')
    expect(caption.exists()).toBe(true)
    expect(caption.text()).toBe('Census tracts')
    // Caption must be the first child of <table>
    const table = wrapper.find('table')
    expect(table.element.firstElementChild?.tagName).toBe('CAPTION')
    wrapper.unmount()
  })

  it('applies is-sr-only to the caption when captionHidden is true', async () => {
    const wrapper = await mountTable({ caption: 'Hidden but readable', captionHidden: true })
    expect(wrapper.find('caption').classes()).toContain('is-sr-only')
    wrapper.unmount()
  })

  it('forwards ariaLabel to the <table> element', async () => {
    const wrapper = await mountTable({ ariaLabel: 'Top 10 routes' })
    expect(wrapper.find('table').attributes('aria-label')).toBe('Top 10 routes')
    wrapper.unmount()
  })

  it('applies aria-sort to sortable headers', async () => {
    const wrapper = await mountTable({ defaultSort: ['id', 'asc'] })
    const headers = wrapper.findAll('th')
    expect(headers[0]?.attributes('aria-sort')).toBe('ascending')
    expect(headers[1]?.attributes('aria-sort')).toBe('none')

    await headers[0]?.trigger('click')
    expect(headers[0]?.attributes('aria-sort')).toBe('descending')

    await headers[1]?.trigger('click')
    expect(headers[1]?.attributes('aria-sort')).toBe('ascending')
    expect(headers[0]?.attributes('aria-sort')).toBe('none')
    wrapper.unmount()
  })

  it('has no axe violations with a caption', async () => {
    const wrapper = await mountTable({ caption: 'Sample table' })
    await expectNoAxeViolations(wrapper)
    wrapper.unmount()
  })
})
