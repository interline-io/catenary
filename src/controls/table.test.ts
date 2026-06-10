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

  it('forwards ariaLabelledby and ariaDescribedby to the <table> element', async () => {
    const wrapper = await mountTable({
      ariaLabelledby: 'tab-routes',
      ariaDescribedby: 'tab-routes-summary'
    })
    const table = wrapper.find('table')
    expect(table.attributes('aria-labelledby')).toBe('tab-routes')
    expect(table.attributes('aria-describedby')).toBe('tab-routes-summary')
    wrapper.unmount()
  })

  it('applies aria-sort to sortable headers, toggled via the inner button', async () => {
    const wrapper = await mountTable({ defaultSort: ['id', 'asc'] })
    const headers = wrapper.findAll('th')
    expect(headers[0]?.attributes('aria-sort')).toBe('ascending')
    expect(headers[1]?.attributes('aria-sort')).toBeUndefined()
    expect(headers[0]?.attributes('scope')).toBe('col')
    expect(headers[1]?.attributes('scope')).toBe('col')

    // Sortable headers are activated via the keyboard-accessible <button> inside the th.
    const sortButtons = wrapper.findAll('th .cat-table-sort')
    expect(sortButtons.length).toBe(2)

    await sortButtons[0]?.trigger('click')
    expect(headers[0]?.attributes('aria-sort')).toBe('descending')

    await sortButtons[1]?.trigger('click')
    expect(headers[1]?.attributes('aria-sort')).toBe('ascending')
    expect(headers[0]?.attributes('aria-sort')).toBeUndefined()
    wrapper.unmount()
  })

  it('hides the decorative sort icon from assistive technology', async () => {
    const wrapper = await mountTable()
    const icons = wrapper.findAll('.cat-sort-icon')
    expect(icons.length).toBe(2)
    for (const icon of icons) {
      expect(icon.attributes('aria-hidden')).toBe('true')
    }
    // The button's accessible name is exactly the column label.
    expect(wrapper.find('th .cat-table-sort').text()).toBe('ID')
    wrapper.unmount()
  })

  it('exposes sort state to custom #header slots', async () => {
    type AriaSortFn = (column: { field: string, label: string, sortable?: boolean }) => string | undefined
    const Host = defineComponent({
      components: { CatTable, CatTableColumn },
      setup () {
        const data = [
          { id: 1, name: 'Aardvark' },
          { id: 2, name: 'Badger' }
        ]
        return () => h(CatTable, { data, defaultSort: ['id', 'asc'], caption: 'Custom header table' }, {
          columns: () => [
            h(CatTableColumn, { field: 'id', label: 'ID', sortable: true }),
            h(CatTableColumn, { field: 'name', label: 'Name', sortable: true })
          ],
          header: ({ columns, sort, sortField, sortDirection, ariaSort }: {
            columns: { field: string, label: string, sortable?: boolean }[]
            sort: (field: string) => void
            sortField: string | null
            sortDirection: 'asc' | 'desc'
            ariaSort: AriaSortFn
          }) => columns.map(column => h('th', {
            'key': column.field,
            'scope': 'col',
            'aria-sort': ariaSort(column),
            'data-sort-state': column.field === sortField ? sortDirection : undefined
          }, [
            h('button', { type: 'button', onClick: () => sort(column.field) }, column.label)
          ])),
          default: ({ row }: { row: Record<string, unknown> }) => [
            h('td', String(row.id)),
            h('td', String(row.name))
          ]
        })
      }
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await wrapper.vm.$nextTick()

    const headers = wrapper.findAll('th')
    expect(headers[0]?.attributes('aria-sort')).toBe('ascending')
    expect(headers[0]?.attributes('data-sort-state')).toBe('asc')
    expect(headers[1]?.attributes('aria-sort')).toBeUndefined()

    // Sorting through the slot's sort() callback updates the slot props.
    await headers[1]?.find('button').trigger('click')
    expect(headers[0]?.attributes('aria-sort')).toBeUndefined()
    expect(headers[1]?.attributes('aria-sort')).toBe('ascending')
    expect(headers[1]?.attributes('data-sort-state')).toBe('asc')

    await headers[1]?.find('button').trigger('click')
    expect(headers[1]?.attributes('aria-sort')).toBe('descending')
    expect(headers[1]?.attributes('data-sort-state')).toBe('desc')

    await expectNoAxeViolations(wrapper)
    wrapper.unmount()
  })

  it('has no axe violations with a caption', async () => {
    const wrapper = await mountTable({ caption: 'Sample table' })
    await expectNoAxeViolations(wrapper)
    wrapper.unmount()
  })
})

describe('cat-table sort announcements', () => {
  it('announces sort changes through a status region and omits aria-sort on unsorted columns', async () => {
    const wrapper = await mountTable()
    const status = wrapper.find('[role="status"]')
    expect(status.text()).toBe('')

    await wrapper.findAll('button.cat-table-sort')[0]!.trigger('click')
    await wrapper.vm.$nextTick()
    expect(status.text()).toBe('Sorted by ID, ascending')
    const headers = wrapper.findAll('th')
    expect(headers[0]?.attributes('aria-sort')).toBe('ascending')
    expect(headers[1]?.attributes('aria-sort')).toBeUndefined()

    await wrapper.findAll('button.cat-table-sort')[0]!.trigger('click')
    await wrapper.vm.$nextTick()
    expect(status.text()).toBe('Sorted by ID, descending')
    wrapper.unmount()
  })
})
