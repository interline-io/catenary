import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CatNotification from './notification.vue'
import { expectNoAxeViolations } from '../testutil/component-helpers'

describe('cat-notification accessibility', () => {
  it('names the icon-only close button and gives it type=button', () => {
    const wrapper = mount(CatNotification, {
      props: { closeable: true, message: 'Saved' }
    })
    const close = wrapper.find('button.delete')
    expect(close.attributes('aria-label')).toBe('Dismiss notification')
    expect(close.attributes('type')).toBe('button')
  })

  it('supports overriding the close label', () => {
    const wrapper = mount(CatNotification, {
      props: { closeable: true, ariaCloseLabel: 'Close message' }
    })
    expect(wrapper.find('button.delete').attributes('aria-label')).toBe('Close message')
  })

  it('renders a live-region role when requested, none by default', () => {
    const status = mount(CatNotification, { props: { role: 'status', message: 'Query complete' } })
    expect(status.find('.notification').attributes('role')).toBe('status')

    const plain = mount(CatNotification, { props: { message: 'Static content' } })
    expect(plain.find('.notification').attributes('role')).toBeUndefined()
  })

  it('emits close when the close button is activated', async () => {
    const wrapper = mount(CatNotification, { props: { closeable: true } })
    await wrapper.find('button.delete').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('has no axe violations', async () => {
    const wrapper = mount(CatNotification, {
      attachTo: document.body,
      props: { closeable: true, role: 'status', message: 'Saved' }
    })
    await expectNoAxeViolations(wrapper)
    wrapper.unmount()
  })
})
