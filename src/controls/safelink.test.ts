import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { mountComponent, expectNoAxeViolations } from '../testutil/component-helpers'
import CatSafelink from './safelink.vue'

const URL_A = 'https://example.com/feeds/alpha.zip'
const URL_B = 'https://example.com/feeds/beta.zip'

function stubClipboard (impl: () => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: vi.fn(impl) },
    configurable: true
  })
}

describe('CatSafelink', () => {
  beforeEach(() => {
    stubClipboard(() => Promise.resolve())
  })

  // A safelink is typically one per row of a table, so constant labels left a
  // screen reader's elements list showing N indistinguishable "Copy to
  // clipboard" buttons, and the link's name never said where it went.
  it('names the copy button and link after their subject', () => {
    const a = mountComponent(CatSafelink, { props: { url: URL_A } })
    const b = mountComponent(CatSafelink, { props: { url: URL_B } })

    const labelA = a.find('button').attributes('aria-label')
    const labelB = b.find('button').attributes('aria-label')
    expect(labelA).toContain(URL_A)
    expect(labelB).toContain(URL_B)
    expect(labelA).not.toBe(labelB)

    expect(a.find('a').attributes('aria-label')).toContain(URL_A)
    a.unmount(); b.unmount()
  })

  it('prefers the display text over the url when naming the copy button', () => {
    const wrapper = mountComponent(CatSafelink, { props: { url: URL_A, text: 'Alpha feed' } })
    expect(wrapper.find('button').attributes('aria-label')).toBe('Copy Alpha feed to clipboard')
    wrapper.unmount()
  })

  // The clipboard write produces no visible change, so without a live region a
  // screen reader user gets no confirmation anything happened.
  it('announces a successful copy', async () => {
    const wrapper = mountComponent(CatSafelink, { props: { url: URL_A } })
    const status = wrapper.find('[role="status"]')
    expect(status.exists()).toBe(true)
    expect(status.text()).toBe('')

    await wrapper.find('button').trigger('click')
    await nextTick()
    await nextTick()
    expect(status.text()).toContain('Copied to clipboard')
    expect(status.text()).toContain(URL_A)
    wrapper.unmount()
  })

  it('announces a failed copy rather than only logging it', async () => {
    stubClipboard(() => Promise.reject(new Error('denied')))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = mountComponent(CatSafelink, { props: { url: URL_A } })

    await wrapper.find('button').trigger('click')
    await nextTick()
    await nextTick()
    expect(wrapper.find('[role="status"]').text()).toBe('Copy failed')
    wrapper.unmount()
  })

  // The region must exist from mount: a role="status" inserted together with
  // its content is announced unreliably.
  it('renders the live region before any copy happens', () => {
    const wrapper = mountComponent(CatSafelink, { props: { url: URL_A } })
    expect(wrapper.find('[role="status"]').exists()).toBe(true)
    wrapper.unmount()
  })

  // Browsers suspend requestAnimationFrame in a backgrounded tab, so
  // sequencing the live region with it meant the announcement never arrived
  // in exactly the case where the clipboard write also fails for want of
  // focus. nextTick is not frame-dependent.
  it('announces when the Clipboard API is unavailable entirely', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mountComponent(CatSafelink, { props: { url: URL_A } })

    await wrapper.find('button').trigger('click')
    await nextTick()
    await nextTick()
    expect(wrapper.find('[role="status"]').text()).toBe('Copy failed')
    wrapper.unmount()
  })

  it('has no axe violations', async () => {
    const wrapper = mountComponent(CatSafelink, {
      attachTo: document.body,
      props: { url: URL_A, text: 'Alpha feed' }
    })
    await expectNoAxeViolations(wrapper)
    wrapper.unmount()
  })
})
