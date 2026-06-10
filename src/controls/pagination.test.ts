import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CatPagination from './pagination.vue'
import { expectNoAxeViolations } from '../testutil/component-helpers'

// total=200 / perPage=10 with current=7 renders every branch at once:
// the first-page shortcut, both ellipses, the in-range window, and the
// last-page shortcut.
function mountMidRange () {
  return mount(CatPagination, {
    attachTo: document.body,
    props: { total: 200, perPage: 10, current: 7 }
  })
}

describe('cat-pagination accessible names', () => {
  it('names the icon-only previous/next buttons', () => {
    const wrapper = mountMidRange()
    expect(wrapper.find('.pagination-previous').attributes('aria-label')).toBe('Previous page')
    expect(wrapper.find('.pagination-next').attributes('aria-label')).toBe('Next page')
    wrapper.unmount()
  })

  it('supports overriding the previous/next labels', () => {
    const wrapper = mount(CatPagination, {
      attachTo: document.body,
      props: { total: 100, ariaPreviousLabel: 'Vorige', ariaNextLabel: 'Volgende' }
    })
    expect(wrapper.find('.pagination-previous').attributes('aria-label')).toBe('Vorige')
    expect(wrapper.find('.pagination-next').attributes('aria-label')).toBe('Volgende')
    wrapper.unmount()
  })

  it('labels every page button with its page number', () => {
    const wrapper = mountMidRange()
    const links = wrapper.findAll('.pagination-link')
    expect(links.length).toBeGreaterThan(2)
    for (const link of links) {
      expect(link.attributes('aria-label')).toBe(`Page ${link.text()}`)
    }
    wrapper.unmount()
  })

  it('marks exactly the current page with aria-current="page"', () => {
    const wrapper = mountMidRange()
    const current = wrapper.findAll('[aria-current="page"]')
    expect(current.length).toBe(1)
    expect(current[0]!.text()).toBe('7')
    wrapper.unmount()
  })

  it('hides the decorative ellipses from assistive technology', () => {
    const wrapper = mountMidRange()
    const ellipses = wrapper.findAll('.pagination-ellipsis')
    expect(ellipses.length).toBe(2)
    for (const e of ellipses) {
      expect(e.attributes('aria-hidden')).toBe('true')
    }
    wrapper.unmount()
  })

  it('disables previous on the first page and next on the last page', async () => {
    const wrapper = mount(CatPagination, {
      attachTo: document.body,
      props: { total: 200, perPage: 10, current: 1 }
    })
    expect(wrapper.find('.pagination-previous').attributes('disabled')).toBeDefined()
    expect(wrapper.find('.pagination-next').attributes('disabled')).toBeUndefined()

    await wrapper.setProps({ current: 20 })
    expect(wrapper.find('.pagination-previous').attributes('disabled')).toBeUndefined()
    expect(wrapper.find('.pagination-next').attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })

  it('has no axe violations', async () => {
    const wrapper = mountMidRange()
    await expectNoAxeViolations(wrapper)
    wrapper.unmount()
  })
})
