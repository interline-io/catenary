import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, defineComponent, ref } from 'vue'
import CatModal from './modal.vue'
import CatDropdown from './dropdown.vue'
import CatDropdownItem from './dropdown-item.vue'
import { axe } from '../testutil/axe'

beforeEach(() => {
  // Modal teleports to document.body; clean it up between tests so each one
  // starts from a known DOM state.
  document.body.innerHTML = ''
  document.documentElement.classList.remove('is-clipped')
})

function findCard (): HTMLElement | null {
  return document.body.querySelector<HTMLElement>('.modal-card')
}

describe('cat-modal', () => {
  it('renders the dialog with role="dialog", aria-modal, and aria-labelledby when a title is set', async () => {
    const wrapper = mount(CatModal, {
      attachTo: document.body,
      props: { modelValue: true, title: 'Edit item' }
    })
    await nextTick()
    const card = findCard()
    expect(card).not.toBeNull()
    expect(card?.getAttribute('role')).toBe('dialog')
    expect(card?.getAttribute('aria-modal')).toBe('true')
    const labelledby = card?.getAttribute('aria-labelledby')
    expect(labelledby).toBeTruthy()
    const titleEl = document.getElementById(labelledby!)
    expect(titleEl?.textContent?.trim()).toBe('Edit item')
    expect(card?.getAttribute('aria-label')).toBeNull()
    wrapper.unmount()
  })

  it('falls back to a generic aria-label when neither title nor ariaLabel is provided', async () => {
    const wrapper = mount(CatModal, {
      attachTo: document.body,
      props: { modelValue: true }
    })
    await nextTick()
    const card = findCard()
    expect(card?.getAttribute('aria-labelledby')).toBeNull()
    expect(card?.getAttribute('aria-label')).toBe('Dialog')
    wrapper.unmount()
  })

  it('uses the ariaLabel prop when provided and no title is set', async () => {
    const wrapper = mount(CatModal, {
      attachTo: document.body,
      props: { modelValue: true, ariaLabel: 'Confirm action' }
    })
    await nextTick()
    const card = findCard()
    expect(card?.getAttribute('aria-label')).toBe('Confirm action')
    wrapper.unmount()
  })

  it('forwards ariaDescribedby onto the dialog element', async () => {
    const wrapper = mount(CatModal, {
      attachTo: document.body,
      props: { modelValue: true, title: 'X', ariaDescribedby: 'modal-summary' }
    })
    await nextTick()
    expect(findCard()?.getAttribute('aria-describedby')).toBe('modal-summary')
    wrapper.unmount()
  })

  it('makes the title focusable (tabindex="-1") so it can serve as an initial focus fallback', async () => {
    const wrapper = mount(CatModal, {
      attachTo: document.body,
      props: { modelValue: true, title: 'X' }
    })
    await nextTick()
    expect(findCard()?.querySelector('.modal-card-title')?.getAttribute('tabindex')).toBe('-1')
    wrapper.unmount()
  })

  it('focuses the title rather than the dialog itself when there are no focusable children', async () => {
    const wrapper = mount(CatModal, {
      attachTo: document.body,
      props: { modelValue: false, title: 'Read-only notice', closable: false },
      slots: { default: '<p>Static text with no focusable elements.</p>' }
    })
    await wrapper.setProps({ modelValue: true })
    await nextTick()
    await nextTick()
    const title = findCard()?.querySelector('.modal-card-title')
    expect(document.activeElement).toBe(title)
    wrapper.unmount()
  })

  it('emits update:modelValue=false on Escape when closable (default)', async () => {
    const wrapper = mount(CatModal, {
      attachTo: document.body,
      props: { modelValue: true, title: 'X' }
    })
    await nextTick()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    wrapper.unmount()
  })

  it('does not emit close on Escape when closable=false', async () => {
    const wrapper = mount(CatModal, {
      attachTo: document.body,
      props: { modelValue: true, title: 'X', closable: false }
    })
    await nextTick()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('moves focus into the modal on open', async () => {
    const wrapper = mount(CatModal, {
      attachTo: document.body,
      props: { modelValue: false, title: 'X' },
      slots: { default: '<button id="modal-btn">Inside</button>' }
    })
    await wrapper.setProps({ modelValue: true })
    await nextTick()
    await nextTick()
    const card = findCard()
    expect(card?.contains(document.activeElement)).toBe(true)
    wrapper.unmount()
  })

  it('restores focus to the opener on close when the opener is still in the DOM', async () => {
    const Host = defineComponent({
      setup () {
        const open = ref(false)
        return { open }
      },
      template: `
        <div>
          <button id="opener" ref="opener" @click="open = true">Open</button>
          <CatModal v-model="open" title="X">
            <button id="inside">Inside</button>
          </CatModal>
        </div>
      `,
      components: { CatModal }
    })
    const wrapper = mount(Host, { attachTo: document.body })
    const opener = wrapper.get('#opener').element as HTMLButtonElement
    opener.focus()
    expect(document.activeElement).toBe(opener)
    await opener.click()
    await nextTick()
    await nextTick()
    // Focus should have moved into the modal (the exact element is the first
    // focusable, which may be the title-row close button).
    const card = findCard()
    expect(card?.contains(document.activeElement)).toBe(true)
    // Close the modal and verify focus returns to the opener.
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    await nextTick()
    expect(document.activeElement).toBe(opener)
    wrapper.unmount()
  })

  it('does not throw when restoring focus to a removed opener', async () => {
    const Host = defineComponent({
      setup () {
        const open = ref(false)
        const showOpener = ref(true)
        return { open, showOpener }
      },
      template: `
        <div>
          <button v-if="showOpener" id="opener" @click="open = true">Open</button>
          <CatModal v-model="open" title="X">
            <button id="inside">Inside</button>
          </CatModal>
        </div>
      `,
      components: { CatModal }
    })
    const wrapper = mount(Host, { attachTo: document.body })
    const opener = wrapper.get('#opener').element as HTMLButtonElement
    opener.focus()
    await opener.click()
    await nextTick()
    // Simulate the opener disappearing while the modal is open.
    wrapper.vm.showOpener = false
    await nextTick()
    // Closing should not throw, even though the opener is no longer in the DOM.
    expect(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    }).not.toThrow()
    wrapper.unmount()
  })

  it('wraps Tab from the last focusable to the first', async () => {
    const wrapper = mount(CatModal, {
      attachTo: document.body,
      props: { modelValue: true, title: 'X' },
      slots: { default: '<button id="a">A</button><button id="b">B</button>' }
    })
    await nextTick()
    await nextTick()
    // First focusable inside is the title-row close button, then A, then B.
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.modal-card button'))
    const first = buttons[0]!
    const last = buttons[buttons.length - 1]!
    last.focus()
    expect(document.activeElement).toBe(last)
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    document.dispatchEvent(tab)
    expect(document.activeElement).toBe(first)
    expect(tab.defaultPrevented).toBe(true)
    wrapper.unmount()
  })

  it('wraps Shift+Tab from the first focusable to the last', async () => {
    const wrapper = mount(CatModal, {
      attachTo: document.body,
      props: { modelValue: true, title: 'X' },
      slots: { default: '<button id="a">A</button><button id="b">B</button>' }
    })
    await nextTick()
    await nextTick()
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.modal-card button'))
    const first = buttons[0]!
    const last = buttons[buttons.length - 1]!
    first.focus()
    const tab = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true })
    document.dispatchEvent(tab)
    expect(document.activeElement).toBe(last)
    expect(tab.defaultPrevented).toBe(true)
    wrapper.unmount()
  })
})

describe('cat-modal layered Escape dismissal', () => {
  function pressEscape () {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    return nextTick()
  }

  it('closes an open popup inside the modal first, then the modal', async () => {
    const Host = defineComponent({
      components: { CatModal, CatDropdown, CatDropdownItem },
      setup () {
        const open = ref(true)
        return { open }
      },
      template: `
        <cat-modal v-model="open" title="Pick">
          <cat-dropdown label="Menu">
            <cat-dropdown-item value="a">A</cat-dropdown-item>
          </cat-dropdown>
        </cat-modal>
      `
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await nextTick()
    const trigger = document.body.querySelector<HTMLElement>('.dropdown-trigger button')!
    trigger.click()
    await nextTick()
    expect(document.body.querySelector('.cat-dropdown')?.classList.contains('is-active')).toBe(true)

    // First Escape: only the dropdown closes.
    await pressEscape()
    expect(document.body.querySelector('.cat-dropdown')?.classList.contains('is-active')).toBe(false)
    expect((wrapper.vm as any).open).toBe(true)

    // Second Escape: the modal closes.
    await pressEscape()
    expect((wrapper.vm as any).open).toBe(false)
    wrapper.unmount()
  })

  it('a non-closable modal swallows Escape instead of passing it on', async () => {
    const wrapper = mount(CatModal, {
      attachTo: document.body,
      props: { 'modelValue': true, 'closable': false, 'title': 'Stay', 'onUpdate:modelValue': () => {} }
    })
    await nextTick()
    await pressEscape()
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    wrapper.unmount()
  })
})

describe('cat-modal open-state behaviors', () => {
  it('runs open side effects when mounted with modelValue already true', async () => {
    const wrapper = mount(CatModal, {
      attachTo: document.body,
      props: { modelValue: true, title: 'Already open' },
      slots: { default: '<button type="button" class="inside">Go</button>' }
    })
    await nextTick()
    await nextTick()
    expect(document.documentElement.classList.contains('is-clipped')).toBe(true)
    expect(findCard()?.contains(document.activeElement)).toBe(true)
    wrapper.unmount()
  })

  it.skipIf(typeof HTMLElement.prototype.checkVisibility !== 'function')(
    'skips hidden focusable candidates in the focus trap', async () => {
      const wrapper = mount(CatModal, {
        attachTo: document.body,
        props: { modelValue: true, title: 'Trap' },
        slots: { default: '<button type="button" class="visible-btn">A</button><button type="button" style="display:none" class="hidden-btn">B</button>' }
      })
      await nextTick()
      await nextTick()
      // Tab from the close button (last visible) wraps to the first visible
      // element instead of dead-ending on the hidden button.
      const card = findCard()!
      const closeBtn = card.querySelector<HTMLElement>('button.delete')!
      closeBtn.focus()
      card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }))
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }))
      expect(document.activeElement?.classList.contains('hidden-btn')).toBe(false)
      wrapper.unmount()
    })

  it('makes an overflowing body a focusable named region', async () => {
    const wrapper = mount(CatModal, {
      attachTo: document.body,
      props: { modelValue: false, title: 'Long content' }
    })
    const section = document.body.querySelector<HTMLElement>('.modal-card-body')!
    // jsdom has no layout; simulate an overflowing body.
    Object.defineProperty(section, 'scrollHeight', { value: 600, configurable: true })
    Object.defineProperty(section, 'clientHeight', { value: 300, configurable: true })

    await wrapper.setProps({ modelValue: true })
    await nextTick()
    await nextTick()
    expect(section.getAttribute('tabindex')).toBe('0')
    expect(section.getAttribute('role')).toBe('region')
    expect(section.getAttribute('aria-labelledby')).toBeTruthy()
    wrapper.unmount()
  })

  it('has no axe violations while open', async () => {
    const wrapper = mount(CatModal, {
      attachTo: document.body,
      props: { modelValue: true, title: 'Audit me' },
      slots: { default: '<button type="button">Inside</button>' }
    })
    await nextTick()
    await nextTick()
    const results = await axe(document.body)
    expect(results.violations).toEqual([])
    wrapper.unmount()
  })
})
