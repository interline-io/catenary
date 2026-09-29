import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, enableAutoUnmount, flushPromises } from '@vue/test-utils'
import { nextTick, defineComponent, ref } from 'vue'
import CatModal from './modal.vue'
import CatDropdown from './dropdown.vue'
import CatDropdownItem from './dropdown-item.vue'
import { axe } from '../testutil/axe'

// Unmount even when a test fails before its own wrapper.unmount(), so the
// module-level open-modal and dismiss stacks don't leak into later tests.
enableAutoUnmount(afterEach)

// Restore console.warn spies even when a test fails before restoring its own.
afterEach(() => {
  vi.restoreAllMocks()
})

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
    // Focus should have moved into the modal, onto the body's first control.
    const card = findCard()
    expect(card?.contains(document.activeElement)).toBe(true)
    // Close the modal and verify focus returns to the opener.
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    await nextTick()
    expect(document.activeElement).toBe(opener)
    wrapper.unmount()
  })

  it('restores focus to the opener when the modal is unmounted by the v-if its v-model drives', async () => {
    const Host = defineComponent({
      setup () {
        const open = ref(false)
        return { open }
      },
      template: `
        <div>
          <button id="opener" @click="open = true">Open</button>
          <CatModal v-if="open" v-model="open" title="X">
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
    await nextTick()
    expect(findCard()?.contains(document.activeElement)).toBe(true)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    await nextTick()
    expect(findCard()).toBeFalsy()
    expect(document.activeElement).toBe(opener)
    expect(document.documentElement.classList.contains('is-clipped')).toBe(false)
    wrapper.unmount()
  })

  it('restores focus to the outer opener when a nested open modal unmounts with its v-if parent', async () => {
    const Host = defineComponent({
      setup () {
        const editing = ref(false)
        const confirm = ref(false)
        return { editing, confirm }
      },
      template: `
        <div>
          <button id="opener" @click="editing = true">Edit</button>
          <CatModal v-if="editing" v-model="editing" title="Edit">
            <button id="discard" @click="confirm = true">Discard</button>
            <CatModal v-model="confirm" title="Sure?">
              <button id="yes" @click="confirm = false; editing = false">Yes</button>
            </CatModal>
          </CatModal>
        </div>
      `,
      components: { CatModal }
    })
    const wrapper = mount(Host, { attachTo: document.body })
    const opener = wrapper.get('#opener').element as HTMLButtonElement
    opener.focus()
    opener.click()
    await flushPromises()
    const discard = document.getElementById('discard') as HTMLButtonElement
    discard.focus()
    discard.click()
    await flushPromises()
    ;(document.getElementById('yes') as HTMLButtonElement).click()
    await flushPromises()
    expect(findCard()).toBeFalsy()
    expect(document.activeElement).toBe(opener)
    expect(document.documentElement.classList.contains('is-clipped')).toBe(false)
  })

  it('does not focus an opener that is removed in the same render as the modal', async () => {
    const Host = defineComponent({
      setup () {
        const section = ref(true)
        const open = ref(false)
        const opened = ref(0)
        return { section, open, opened }
      },
      template: `
        <div>
          <template v-if="section">
            <button id="opener" @click="open = true" @focus="opened++">Open</button>
            <CatModal v-if="open" v-model="open" title="X">
              <button id="inside">Inside</button>
            </CatModal>
          </template>
        </div>
      `,
      components: { CatModal }
    })
    const wrapper = mount(Host, { attachTo: document.body })
    const opener = wrapper.get('#opener').element as HTMLButtonElement
    opener.focus()
    opener.click()
    await flushPromises()
    const focusCount = wrapper.vm.opened
    wrapper.vm.section = false
    await flushPromises()
    expect(opener.isConnected).toBe(false)
    expect(wrapper.vm.opened).toBe(focusCount)
    expect(document.documentElement.classList.contains('is-clipped')).toBe(false)
  })

  it('leaves focus and the scroll lock with the modal on top when one beneath it unmounts', async () => {
    const Host = defineComponent({
      setup () {
        const item = ref<string | null>('a')
        const showA = ref(false)
        const showB = ref(false)
        return { item, showA, showB }
      },
      template: `
        <div>
          <button id="opener-a" @click="showA = true">Edit</button>
          <CatModal v-if="item" v-model="showA" title="A">
            <button id="opener-b" @click="showB = true">Delete</button>
          </CatModal>
          <CatModal v-model="showB" title="B">
            <button id="in-b" @click="item = null">Confirm</button>
          </CatModal>
        </div>
      `,
      components: { CatModal }
    })
    const wrapper = mount(Host, { attachTo: document.body })
    const openerA = wrapper.get('#opener-a').element as HTMLButtonElement
    openerA.focus()
    openerA.click()
    await flushPromises()
    const openerB = document.getElementById('opener-b') as HTMLButtonElement
    openerB.focus()
    openerB.click()
    await flushPromises()
    const inB = document.getElementById('in-b') as HTMLButtonElement
    inB.focus()
    inB.click()
    await flushPromises()
    expect(document.activeElement).toBe(inB)
    expect(document.documentElement.classList.contains('is-clipped')).toBe(true)
    wrapper.vm.showB = false
    await flushPromises()
    expect(document.documentElement.classList.contains('is-clipped')).toBe(false)
  })

  it('unmounting a closed modal leaves focus and another modal\'s scroll lock alone', async () => {
    const Host = defineComponent({
      setup () {
        const showA = ref(false)
        const hasB = ref(true)
        return { showA, hasB }
      },
      template: `
        <div>
          <button id="opener" @click="showA = true">Open</button>
          <CatModal v-model="showA" title="A">
            <button id="in-a" @click="hasB = false">Remove row</button>
          </CatModal>
          <CatModal v-if="hasB" :model-value="false" title="B" />
        </div>
      `,
      components: { CatModal }
    })
    const wrapper = mount(Host, { attachTo: document.body })
    const opener = wrapper.get('#opener').element as HTMLButtonElement
    opener.focus()
    opener.click()
    await flushPromises()
    const inA = document.getElementById('in-a') as HTMLButtonElement
    inA.focus()
    inA.click()
    await flushPromises()
    expect(document.activeElement).toBe(inA)
    expect(document.documentElement.classList.contains('is-clipped')).toBe(true)
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

  it('only the topmost of two open modals traps Tab', async () => {
    const Host = defineComponent({
      setup () {
        const showA = ref(true)
        const showB = ref(false)
        return { showA, showB }
      },
      template: `
        <div>
          <CatModal v-model="showA" title="A">
            <button id="opener-b" @click="showB = true">Open B</button>
          </CatModal>
          <CatModal v-model="showB" title="B">
            <button id="b-first">First</button>
            <button id="b-last">Last</button>
          </CatModal>
        </div>
      `,
      components: { CatModal }
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await flushPromises()
    wrapper.vm.showB = true
    await flushPromises()
    const bFirst = document.getElementById('b-first') as HTMLButtonElement
    bFirst.focus()
    const event = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true })
    document.dispatchEvent(event)
    // Not the last focusable in B, so B lets the browser move focus, and A
    // must not pull it back into A's card.
    expect(event.defaultPrevented).toBe(false)
    expect(document.activeElement).toBe(bFirst)
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

// Width and placement are CSS, which jsdom can't resolve (no var()
// substitution, no specificity), so these check the bindings the styles key
// off; the layout itself is checked in a browser.
describe('cat-modal width and position bindings', () => {
  async function openCard (props: Record<string, unknown>): Promise<HTMLElement> {
    mount(CatModal, { attachTo: document.body, props: { modelValue: true, title: 'X', ...props } })
    await nextTick()
    return findCard()!
  }

  it('sets no inline style by default', async () => {
    const card = await openCard({ size: 'small' })
    expect(card.getAttribute('style')).toBeNull()
  })

  it('sets --cat-modal-width from a string width', async () => {
    const card = await openCard({ size: 'large', width: '40rem' })
    expect(card.style.getPropertyValue('--cat-modal-width')).toBe('40rem')
  })

  it('treats a numeric width as pixels', async () => {
    const card = await openCard({ width: 640 })
    expect(card.style.getPropertyValue('--cat-modal-width')).toBe('640px')
  })

  it('is centered by default', async () => {
    const card = await openCard({})
    expect(card.closest('.modal')!.classList.contains('cat-modal-top')).toBe(false)
  })

  it('marks the root for position="top"', async () => {
    const card = await openCard({ position: 'top' })
    expect(card.closest('.modal')!.classList.contains('cat-modal-top')).toBe(true)
  })

  it('keeps the fullScreen class alongside position="top"', async () => {
    const card = await openCard({ position: 'top', fullScreen: true })
    expect(card.classList.contains('cat-modal-fullscreen')).toBe(true)
    expect(card.closest('.modal')!.classList.contains('cat-modal-top')).toBe(true)
  })
})

describe('cat-modal initial focus', () => {
  // jsdom has no layout; simulate an overflowing body. `fieldTop` places the
  // body's controls relative to its 300px-tall visible area.
  function overflowBody (fieldTop = 450): void {
    const section = document.body.querySelector<HTMLElement>('.modal-card-body')!
    Object.defineProperty(section, 'scrollHeight', { value: 600, configurable: true })
    Object.defineProperty(section, 'clientHeight', { value: 300, configurable: true })
    section.getBoundingClientRect = () => new DOMRect(0, 0, 400, 300)
    vi.spyOn(HTMLInputElement.prototype, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, fieldTop, 200, 30))
  }

  // Open with an optional hook that runs before modelValue flips, once the
  // card's static structure is in the DOM.
  async function open (options: Parameters<typeof mount<typeof CatModal>>[1], beforeOpen?: () => void) {
    const wrapper = mount(CatModal, { attachTo: document.body, ...options })
    beforeOpen?.()
    await wrapper.setProps({ modelValue: true })
    await flushPromises()
    return wrapper
  }

  function title (): Element | null | undefined {
    return findCard()?.querySelector('.modal-card-title')
  }

  it('focuses the first field of a form, not the close button', async () => {
    await open({
      props: { modelValue: false, title: 'Edit' },
      slots: { default: '<label>Name <input id="name"></label><input id="email" aria-label="Email">' }
    })
    expect(document.activeElement?.id).toBe('name')
  })

  it('does not focus a footer action by default; focuses the title', async () => {
    await open({
      props: { modelValue: false, title: 'Delete item?' },
      slots: {
        default: '<p>This cannot be undone.</p>',
        footer: '<button id="delete">Delete</button><button id="cancel">Cancel</button>'
      }
    })
    expect(document.activeElement).toBe(title())
  })

  it('focuses the title when the close button is the only control', async () => {
    await open({
      props: { modelValue: false, title: 'Notice' },
      slots: { default: '<p>Static text.</p>' }
    })
    expect(document.activeElement).toBe(title())
  })

  it('skips an overflowing body\'s first control when it is out of view, and focuses the title', async () => {
    await open({
      props: { modelValue: false, title: 'Terms' },
      slots: {
        default: '<p>Long text.</p><input id="agree" type="checkbox" aria-label="Agree">',
        footer: '<button id="decline">Decline</button>'
      }
    }, () => overflowBody(450))
    expect(document.activeElement).toBe(title())
  })

  it('keeps an overflowing body\'s first control when it is already in view', async () => {
    await open({
      props: { modelValue: false, title: 'Long form' },
      slots: { default: '<input id="field" aria-label="Field"><p>Long text.</p>' }
    }, () => overflowBody(20))
    expect(document.activeElement?.id).toBe('field')
  })

  it('skips controls in a disabled fieldset or an inert subtree', async () => {
    await open({
      props: { modelValue: false, title: 'X' },
      slots: {
        default: '<fieldset disabled><input id="locked" aria-label="Locked"></fieldset>'
          + '<div inert><input id="inert" aria-label="Inert"></div>'
          + '<input id="open" aria-label="Open">'
      }
    })
    expect(document.activeElement?.id).toBe('open')
  })

  it('moves on to the next candidate when one refuses focus', async () => {
    await open({
      props: {
        modelValue: false,
        title: 'X',
        initialFocus: () => {
          const el = document.getElementById('stubborn')!
          el.focus = () => {}
          return el
        }
      },
      slots: { default: '<input id="stubborn" aria-label="Stubborn">' }
    })
    // Both initialFocus and the body pick #stubborn, which refuses; the title is next.
    expect(document.activeElement).toBe(title())
  })

  it('initialFocus accepts a selector, a function or an element', async () => {
    const slots = {
      default: '<input id="field" aria-label="Field">',
      footer: '<button id="cancel">Cancel</button><button id="confirm">Delete</button>'
    }
    const bySelector = await open({ props: { modelValue: false, title: 'X', initialFocus: '#confirm' }, slots })
    expect(document.activeElement?.id).toBe('confirm')
    bySelector.unmount()

    const byFunction = await open({
      props: { modelValue: false, title: 'X', initialFocus: () => document.getElementById('cancel') },
      slots
    })
    expect(document.activeElement?.id).toBe('cancel')
    byFunction.unmount()

    // An element is a valid prop value, so Vue must not warn about its type.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const byElement = mount(CatModal, { attachTo: document.body, props: { modelValue: false, title: 'X' }, slots })
    await byElement.setProps({ modelValue: true, initialFocus: document.getElementById('cancel')! })
    await flushPromises()
    expect(document.activeElement?.id).toBe('cancel')
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  it('initialFocus can name the close button', async () => {
    await open({
      props: { modelValue: false, title: 'X', initialFocus: 'button.delete' },
      slots: { default: '<input id="field" aria-label="Field">' }
    })
    expect(document.activeElement?.classList.contains('delete')).toBe(true)
  })

  it('initialFocus=false skips controls and focuses the title', async () => {
    await open({
      props: { modelValue: false, title: 'Search', initialFocus: false },
      slots: { default: '<input id="query" aria-label="Query">' }
    })
    expect(document.activeElement).toBe(title())
  })

  it('initialFocus=false focuses the body wrapper when there is no title', async () => {
    await open({
      props: { modelValue: false, ariaLabel: 'Search', initialFocus: false },
      slots: { default: '<input id="query" aria-label="Query">' }
    })
    expect(document.activeElement?.classList.contains('cat-modal-body-content')).toBe(true)
  })

  it('falls through when initialFocus is missing, disabled, invalid or outside the dialog', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const outside = document.createElement('button')
    document.body.appendChild(outside)
    for (const initialFocus of ['#nope', '#off', '', '[[invalid', () => outside]) {
      const wrapper = await open({
        props: { modelValue: false, title: 'X', initialFocus },
        slots: { default: '<input id="field" aria-label="Field"><button id="off" disabled>Off</button>' }
      })
      expect(document.activeElement?.id).toBe('field')
      wrapper.unmount()
    }
  })

  it('falls through, without throwing, for a non-element or a function that throws', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const values: unknown[] = [
      true,
      { $el: null },
      () => { throw new Error('ref not ready') }
    ]
    for (const initialFocus of values) {
      const wrapper = await open({
        props: { modelValue: false, title: 'X', initialFocus: initialFocus as never },
        slots: { default: '<input id="field" aria-label="Field">' }
      })
      expect(document.activeElement?.id).toBe('field')
      wrapper.unmount()
    }
    // One warning per modal instance whose initialFocus did not resolve.
    expect(warn.mock.calls.filter(c => String(c[0]).includes('initialFocus did not resolve'))).toHaveLength(values.length)
  })

  it('accepts null without warning', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await open({
      props: { modelValue: false, title: 'X', initialFocus: null },
      slots: { default: '<input id="field" aria-label="Field">' }
    })
    expect(document.activeElement?.id).toBe('field')
    expect(warn).not.toHaveBeenCalled()
  })

  it('resolves a non-focusable wrapper element to its first focusable descendant', async () => {
    await open({
      props: { modelValue: false, title: 'X', initialFocus: '.wrapper' },
      slots: {
        default: '<input id="first" aria-label="First">',
        footer: '<div class="wrapper"><button id="cancel">Cancel</button></div>'
      }
    })
    expect(document.activeElement?.id).toBe('cancel')
  })
})

describe('cat-modal Tab trap from a non-tabbable focus', () => {
  async function openTitled (slots: Record<string, string>) {
    const wrapper = mount(CatModal, { attachTo: document.body, props: { modelValue: false, title: 'Notice' }, slots })
    await wrapper.setProps({ modelValue: true })
    await flushPromises()
    return wrapper
  }

  function tab (shiftKey = false): KeyboardEvent {
    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey, cancelable: true })
    document.dispatchEvent(event)
    return event
  }

  it('Shift+Tab from the title wraps to the last tabbable instead of leaving the dialog', async () => {
    await openTitled({ default: '<p>Static text.</p>', footer: '<button id="ok">OK</button>' })
    const titleEl = findCard()!.querySelector('.modal-card-title')
    expect(document.activeElement).toBe(titleEl)
    const event = tab(true)
    expect(event.defaultPrevented).toBe(true)
    expect(document.activeElement?.id).toBe('ok')
  })

  it('Tab from the title moves to the first tabbable after it', async () => {
    await openTitled({ default: '<p>Static text.</p>' })
    const event = tab()
    expect(event.defaultPrevented).toBe(true)
    expect(document.activeElement?.classList.contains('delete')).toBe(true)
  })

  it('Tab and Shift+Tab from the body wrapper step to its neighbors by DOM position', async () => {
    await openTitled({ default: '<p>Static text.</p>', footer: '<button id="ok">OK</button>' })
    const body = findCard()!.querySelector<HTMLElement>('.cat-modal-body-content')!
    body.focus()
    tab()
    expect(document.activeElement?.id).toBe('ok')
    body.focus()
    tab(true)
    expect(document.activeElement?.classList.contains('delete')).toBe(true)
  })
})
