import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CatMsg from './msg.vue'
import { expectNoAxeViolations } from '../testutil/component-helpers'

describe('cat-msg', () => {
  it('renders a plain header with no button when not expandable', () => {
    const wrapper = mount(CatMsg, { props: { title: 'Heads up' } })
    expect(wrapper.find('.message-header').exists()).toBe(true)
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.find('[role="button"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Heads up')
  })

  // Bulma styles `.message-header + .message-body` to drop the accent border and
  // square the top corners. Any wrapper element between the two breaks that
  // adjacency and leaves a stray left stripe with a rounded top on every titled
  // message, so the sibling relationship is worth pinning.
  it('keeps message-body as a direct sibling of message-header', () => {
    const expectAdjacent = (props: {
      title?: string
      expandable?: boolean
      open?: boolean
      showIcon?: boolean
    }) => {
      const wrapper = mount(CatMsg, { props, slots: { default: '<p>Body</p>' } })
      const header = wrapper.find('.message-header').element
      const body = wrapper.find('.message-body').element
      expect(body.previousElementSibling, JSON.stringify(props)).toBe(header)
      expect(body.parentElement, JSON.stringify(props)).toBe(header.parentElement)
    }

    expectAdjacent({ title: 'Plain' })
    expectAdjacent({ title: 'Expandable', expandable: true, open: true })
    expectAdjacent({ title: 'With icon', showIcon: true })
  })

  it('puts the media class on message-body itself when showIcon is set', () => {
    const wrapper = mount(CatMsg, { props: { title: 'x', showIcon: true }, slots: { default: '<p>B</p>' } })
    const body = wrapper.find('.message-body')
    expect(body.classes()).toContain('media')
    expect(body.find('.media-left').exists()).toBe(true)
    expect(body.find('.media-content').text()).toContain('B')
  })

  describe('expandable', () => {
    it('uses a native button for the trigger, not role="button" on the header', () => {
      const wrapper = mount(CatMsg, { props: { title: 'Advanced', expandable: true } })
      const trigger = wrapper.find('button.cat-msg-trigger')
      expect(trigger.exists()).toBe(true)
      expect(trigger.attributes('type')).toBe('button')
      expect(wrapper.find('.message-header').attributes('role')).toBeUndefined()
      expect(wrapper.find('.message-header').attributes('tabindex')).toBeUndefined()
    })

    // Safari stops honouring a button's children-presentational semantics when
    // the button is itself a flex container, leaking its contents into the
    // accessibility tree as a trailing "group" in VoiceOver.
    it('keeps the flex layout off the button element itself', () => {
      const wrapper = mount(CatMsg, { props: { title: 'Advanced', expandable: true } })
      const trigger = wrapper.find('button.cat-msg-trigger')
      const inner = trigger.find('.cat-msg-trigger-inner')
      expect(inner.exists()).toBe(true)
      expect(trigger.element.children).toHaveLength(1)
      expect(trigger.element.firstElementChild).toBe(inner.element)
    })

    it('exposes aria-expanded and aria-controls pointing at the body', async () => {
      const wrapper = mount(CatMsg, { props: { title: 'Advanced', expandable: true, open: true } })
      const trigger = wrapper.find('button.cat-msg-trigger')
      expect(trigger.attributes('aria-expanded')).toBe('true')
      const controls = trigger.attributes('aria-controls')
      expect(controls).toBeTruthy()
      expect(wrapper.find(`#${controls}`).exists()).toBe(true)
    })

    it('toggles the body and emits update:open', async () => {
      const wrapper = mount(CatMsg, {
        props: { title: 'Advanced', expandable: true },
        slots: { default: '<p>Body</p>' }
      })
      const body = () => wrapper.find('.cat-expandable-content').element as HTMLElement
      expect(body().style.display).toBe('none')

      await wrapper.find('button.cat-msg-trigger').trigger('click')
      expect(body().style.display).not.toBe('none')
      expect(wrapper.emitted('update:open')).toEqual([[true]])

      await wrapper.find('button.cat-msg-trigger').trigger('click')
      expect(body().style.display).toBe('none')
      expect(wrapper.emitted('update:open')).toEqual([[true], [false]])
    })

    // aria-controls is an IDREF: it must resolve to a real element even while
    // collapsed. Hiding the body with v-if instead of v-show would leave the
    // reference dangling whenever the message is closed.
    it('keeps aria-controls resolvable while collapsed', () => {
      const wrapper = mount(CatMsg, {
        props: { title: 'Advanced', expandable: true, open: false },
        slots: { default: '<p>Body</p>' }
      })
      const controls = wrapper.find('button.cat-msg-trigger').attributes('aria-controls')!
      const target = wrapper.find(`#${controls}`)
      expect(target.exists()).toBe(true)
      expect((target.element as HTMLElement).style.display).toBe('none')
    })

    it('follows a controlled open prop', async () => {
      const wrapper = mount(CatMsg, { props: { title: 'Advanced', expandable: true, open: false } })
      expect(wrapper.find('button.cat-msg-trigger').attributes('aria-expanded')).toBe('false')
      await wrapper.setProps({ open: true })
      expect(wrapper.find('button.cat-msg-trigger').attributes('aria-expanded')).toBe('true')
    })

    // The bug this component used to have: the close button lived *inside* an
    // element with role="button", which is invalid nested interactive content and
    // needed `.self` key modifiers so the outer fake button did not swallow Space
    // meant for the inner real one.
    it('renders the close button as a sibling of the trigger, never inside it', () => {
      const wrapper = mount(CatMsg, {
        props: { title: 'Advanced', expandable: true, closable: true }
      })
      const trigger = wrapper.find('button.cat-msg-trigger')
      expect(trigger.exists()).toBe(true)
      const del = wrapper.find('button.delete')
      expect(del.exists()).toBe(true)
      // Not nested.
      expect(trigger.element.contains(del.element)).toBe(false)
      // Both are direct children of the header.
      expect(del.element.parentElement).toBe(trigger.element.parentElement)
    })

    // Without an explicit type a <button> defaults to submit, so a closable
    // message inside a <form> would submit it on dismiss.
    it('gives the dismiss button type=button and a descriptive name', async () => {
      const wrapper = mount(CatMsg, { props: { title: 'x', closable: true } })
      const del = wrapper.find('button.delete')
      expect(del.attributes('type')).toBe('button')
      expect(del.attributes('aria-label')).toBe('Dismiss message')

      const custom = mount(CatMsg, {
        props: { title: 'x', closable: true, ariaCloseLabel: 'Dismiss warning' }
      })
      expect(custom.find('button.delete').attributes('aria-label')).toBe('Dismiss warning')
    })

    it('emits close (dismiss) from the close button without toggling the body', async () => {
      const wrapper = mount(CatMsg, {
        props: { title: 'Advanced', expandable: true, closable: true, open: true }
      })
      await wrapper.find('button.delete').trigger('click')
      expect(wrapper.emitted('close')).toHaveLength(1)
      // `close` on cat-msg means dismissed, not collapsed — the disclosure state
      // must not have changed.
      expect(wrapper.emitted('update:open')).toBeUndefined()
    })

    it('has no axe violations, expanded and collapsed, with a close button', async () => {
      const collapsed = mount(CatMsg, {
        props: { title: 'Advanced', expandable: true, closable: true },
        slots: { default: '<p>Body</p>' },
        attachTo: document.body
      })
      await expectNoAxeViolations(collapsed)
      collapsed.unmount()

      const expanded = mount(CatMsg, {
        props: { title: 'Advanced', expandable: true, closable: true, open: true },
        slots: { default: '<p>Body</p>' },
        attachTo: document.body
      })
      await expectNoAxeViolations(expanded)
      expanded.unmount()
    })
  })
})
