import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import CatSplitButton from './split-button.vue'
import CatDropdownItem from './dropdown-item.vue'
import { expectNoAxeViolations } from '../testutil/component-helpers'

function mountSplitButton (props: Record<string, any> = {}, slots: Record<string, any> = {}) {
  const Host = defineComponent({
    setup () {
      return () => h(CatSplitButton, { label: 'Save', ...props }, {
        default: () => [
          h(CatDropdownItem, { value: 'draft' }, () => 'Save as draft'),
          h(CatDropdownItem, { value: 'copy' }, () => 'Save a copy')
        ],
        ...slots
      })
    }
  })
  return mount(Host, { attachTo: document.body })
}

// Mounts with a template ref on the component, which is how a consumer reaches
// the exposed open() / close() / toggle().
function mountWithRef (props: Record<string, any> = {}) {
  const split = ref<any>(null)
  const Host = defineComponent({
    setup () {
      return () => h(CatSplitButton, { ref: split, label: 'Save', ...props }, {
        default: () => [
          h(CatDropdownItem, { value: 'draft' }, () => 'Save as draft'),
          h(CatDropdownItem, { value: 'copy' }, () => 'Save a copy')
        ]
      })
    }
  })
  return { wrapper: mount(Host, { attachTo: document.body }), split }
}

function halves (wrapper: ReturnType<typeof mountSplitButton>) {
  return {
    action: wrapper.find('.cat-split-button-action'),
    toggle: wrapper.find('.cat-split-button-toggle')
  }
}

describe('cat-split-button structure', () => {
  it('renders both halves as buttons inside a has-addons group', () => {
    const wrapper = mountSplitButton()
    const root = wrapper.find('.cat-split-button')
    expect(root.classes()).toContain('buttons')
    expect(root.classes()).toContain('has-addons')

    const { action, toggle } = halves(wrapper)
    expect(action.element.tagName).toBe('BUTTON')
    expect(toggle.element.tagName).toBe('BUTTON')
    expect(action.text()).toBe('Save')
    wrapper.unmount()
  })

  it('applies the variant and size to both halves so they read as one control', () => {
    const wrapper = mountSplitButton({ variant: 'primary', size: 'small' })
    const { action, toggle } = halves(wrapper)
    for (const half of [action, toggle]) {
      expect(half.classes()).toContain('is-primary')
      expect(half.classes()).toContain('is-small')
    }
    wrapper.unmount()
  })

  it('renders the label slot in place of the label prop', () => {
    const wrapper = mountSplitButton({}, { label: () => 'Publish now' })
    expect(halves(wrapper).action.text()).toBe('Publish now')
    wrapper.unmount()
  })
})

describe('cat-split-button accessibility', () => {
  it('names the caret half, which renders no text', () => {
    const wrapper = mountSplitButton()
    const { toggle } = halves(wrapper)
    expect(toggle.text()).toBe('')
    expect(toggle.attributes('aria-label')).toBe('More Save options')
    wrapper.unmount()
  })

  it('honors an explicit toggleLabel and falls back without a label', () => {
    const explicit = mountSplitButton({ toggleLabel: 'Save options' })
    expect(halves(explicit).toggle.attributes('aria-label')).toBe('Save options')
    explicit.unmount()

    const unlabeled = mountSplitButton({ label: undefined }, { label: () => 'Go' })
    expect(halves(unlabeled).toggle.attributes('aria-label')).toBe('More options')
    unlabeled.unmount()
  })

  it('puts the popup relationship on the caret half only', () => {
    const wrapper = mountSplitButton()
    const { action, toggle } = halves(wrapper)
    expect(action.attributes('aria-haspopup')).toBeUndefined()
    expect(toggle.attributes('aria-haspopup')).toBe('menu')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    const controls = toggle.attributes('aria-controls')
    expect(wrapper.find('.dropdown-menu').attributes('id')).toBe(controls)
    wrapper.unmount()
  })

  // One scan, on the open state. A second pass over the closed state would
  // audit identical markup: jsdom has no Popover API and vitest injects no
  // CSS, so Bulma's `.dropdown-menu { display: none }` never applies and the
  // menu sits in the accessibility tree either way. The closed state is
  // asserted explicitly below instead.
  it('has no axe violations with the menu open', async () => {
    const wrapper = mountSplitButton({ variant: 'primary' })
    await halves(wrapper).toggle.trigger('click')
    await nextTick()
    await expectNoAxeViolations(wrapper)
    wrapper.unmount()
  })

  it('reports the menu as collapsed before it is opened', () => {
    const wrapper = mountSplitButton()
    expect(halves(wrapper).toggle.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('.dropdown').classes()).not.toContain('is-active')
    wrapper.unmount()
  })

  it('forwards fallthrough attributes to the action button, not the wrapper', () => {
    const wrapper = mountSplitButton({ 'id': 'save-me', 'form': 'settings', 'data-test': 'x' })
    const root = wrapper.find('.cat-split-button')
    const { action } = halves(wrapper)
    // A phantom tab stop or a stray `form` on the non-interactive wrapper is
    // the failure this guards against.
    expect(root.attributes('id')).toBeUndefined()
    expect(root.attributes('form')).toBeUndefined()
    expect(action.attributes('id')).toBe('save-me')
    expect(action.attributes('form')).toBe('settings')
    expect(action.attributes('data-test')).toBe('x')
    wrapper.unmount()
  })

  it('keeps class and style on the wrapper, which is the whole control', () => {
    const wrapper = mountSplitButton({ class: 'mr-2', style: 'margin-top: 4px' })
    const root = wrapper.find('.cat-split-button')
    expect(root.classes()).toContain('mr-2')
    expect(root.attributes('style')).toContain('margin-top')
    expect(halves(wrapper).action.classes()).not.toContain('mr-2')
    wrapper.unmount()
  })

  it('does not name the caret after a label prop the label slot has replaced', () => {
    // Naming it "More Save options" while the button reads "Publish" would put
    // invisible text in the accessible name (WCAG 2.5.3).
    const wrapper = mountSplitButton({ label: 'Save' }, { label: () => 'Publish' })
    expect(halves(wrapper).action.text()).toBe('Publish')
    expect(halves(wrapper).toggle.attributes('aria-label')).toBe('More options')
    wrapper.unmount()
  })
})

describe('cat-split-button behavior', () => {
  it('emits click from the action half without opening the menu', async () => {
    const wrapper = mountSplitButton()
    const { action, toggle } = halves(wrapper)
    await action.trigger('click')
    expect(wrapper.findComponent(CatSplitButton).emitted('click')).toHaveLength(1)
    expect(toggle.attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })

  it('opens the menu from the caret half without emitting click', async () => {
    const wrapper = mountSplitButton()
    const { toggle } = halves(wrapper)
    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(wrapper.findComponent(CatSplitButton).emitted('click')).toBeUndefined()
    expect(wrapper.findComponent(CatSplitButton).emitted('open')).toHaveLength(1)
    wrapper.unmount()
  })

  it('ArrowDown on the caret opens the menu and focuses the first item', async () => {
    const wrapper = mountSplitButton()
    const { toggle } = halves(wrapper)
    ;(toggle.element as HTMLElement).focus()
    await toggle.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    expect(wrapper.findAll('.dropdown-item')[0]?.element).toBe(document.activeElement)
    wrapper.unmount()
  })

  it('emits select with the item value and closes the menu', async () => {
    const wrapper = mountSplitButton()
    const { toggle } = halves(wrapper)
    await toggle.trigger('click')
    await wrapper.findAll('.dropdown-item')[1]?.trigger('click')
    await nextTick()
    const split = wrapper.findComponent(CatSplitButton)
    expect(split.emitted('select')?.[0]).toEqual(['copy'])
    expect(split.emitted('close')).toHaveLength(1)
    expect(toggle.attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })

  it('disabled disables both halves; toggleDisabled disables only the caret', () => {
    const both = mountSplitButton({ disabled: true })
    expect(halves(both).action.attributes('disabled')).toBeDefined()
    expect(halves(both).toggle.attributes('disabled')).toBeDefined()
    both.unmount()

    const caretOnly = mountSplitButton({ toggleDisabled: true })
    expect(halves(caretOnly).action.attributes('disabled')).toBeUndefined()
    expect(halves(caretOnly).toggle.attributes('disabled')).toBeDefined()
    caretOnly.unmount()
  })

  it('exposed open() forwards its focus target and close() its focus flag', async () => {
    const { wrapper, split } = mountWithRef()
    split.value.open('last')
    await nextTick()
    const items = wrapper.findAll('.dropdown-item')
    expect(items[items.length - 1]?.element).toBe(document.activeElement)

    // close(false) leaves focus where it is rather than yanking it back to the
    // caret, which would steal it from wherever the app moved it.
    split.value.close(false)
    await nextTick()
    expect(halves(wrapper).toggle.attributes('aria-expanded')).toBe('false')
    expect(halves(wrapper).toggle.element).not.toBe(document.activeElement)
    wrapper.unmount()
  })

  it('exposed open()/toggle() are no-ops while the caret is disabled', async () => {
    for (const props of [{ disabled: true }, { toggleDisabled: true }]) {
      const { wrapper, split } = mountWithRef(props)
      split.value.open()
      split.value.toggle()
      await nextTick()
      // An expanded popup announced against a disabled control, and a close()
      // that cannot return focus to it, are the failures this prevents.
      expect(halves(wrapper).toggle.attributes('aria-expanded')).toBe('false')
      wrapper.unmount()
    }
  })

  it('loading disables the action half but leaves the menu usable', async () => {
    const wrapper = mountSplitButton({ loading: true })
    const { action, toggle } = halves(wrapper)
    expect(action.attributes('disabled')).toBeDefined()
    expect(action.attributes('aria-busy')).toBe('true')
    expect(toggle.attributes('disabled')).toBeUndefined()
    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    wrapper.unmount()
  })
})
