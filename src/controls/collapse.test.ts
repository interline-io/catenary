import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CatCollapse from './collapse.vue'
import { expectNoAxeViolations } from '../testutil/component-helpers'

describe('cat-collapse', () => {
  it('renders a native button as the trigger, not a div with role="button"', () => {
    const wrapper = mount(CatCollapse, { props: { label: 'Details' } })
    const trigger = wrapper.find('button.cat-collapse-trigger')
    expect(trigger.exists()).toBe(true)
    expect(trigger.attributes('type')).toBe('button')
    // The role must come from the element itself, not an ARIA override.
    expect(trigger.attributes('role')).toBeUndefined()
    expect(wrapper.find('[role="button"]').exists()).toBe(false)
  })

  it('starts closed and reflects state via aria-expanded', async () => {
    const wrapper = mount(CatCollapse, { props: { label: 'Details' } })
    const trigger = wrapper.find('button')
    expect(trigger.attributes('aria-expanded')).toBe('false')

    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')

    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('false')
  })

  it('points aria-controls at the content element id', () => {
    const wrapper = mount(CatCollapse, { props: { label: 'Details', open: true } })
    const controls = wrapper.find('button').attributes('aria-controls')
    expect(controls).toBeTruthy()
    const content = wrapper.find('.cat-collapse-content')
    expect(content.attributes('id')).toBe(controls)
  })

  it('gives each instance unique ids so two collapses on a page do not collide', () => {
    // Both must live in one app instance: Vue's useId() counter is per-app, so
    // two separate mount() calls would each start from zero and collide in a way
    // that never happens in a real application.
    const Host = {
      components: { CatCollapse },
      template: '<div><cat-collapse label="A" /><cat-collapse label="B" /></div>'
    }
    const wrapper = mount(Host)
    const [a, b] = wrapper.findAll('button.cat-collapse-trigger')
    expect(a!.attributes('aria-controls')).toBeTruthy()
    expect(a!.attributes('aria-controls')).not.toBe(b!.attributes('aria-controls'))
    expect(a!.attributes('id')).not.toBe(b!.attributes('id'))
  })

  it('places the content immediately after the trigger in the DOM', () => {
    const wrapper = mount(CatCollapse, {
      props: { label: 'Details', open: true },
      slots: { default: '<p>Body</p>' },
      // Render the real <Transition> (test-utils stubs it by default), so this
      // asserts the shipped DOM shape rather than a stub wrapper.
      global: { stubs: { transition: false } }
    })
    const children = Array.from(wrapper.element.children) as Element[]
    expect(children).toHaveLength(2)
    // First child holds the trigger, second is the content — nothing between.
    expect(children[0]!.querySelector('button.cat-collapse-trigger')).not.toBeNull()
    expect(children[1]!.classList.contains('cat-collapse-content')).toBe(true)

    // And the content genuinely follows the trigger in document order.
    const trigger = wrapper.find('button.cat-collapse-trigger').element
    const content = wrapper.find('.cat-collapse-content').element

    expect(trigger.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING)
      .toBeTruthy()
  })

  it('hides collapsed content with display:none rather than aria-hidden', () => {
    const wrapper = mount(CatCollapse, {
      props: { label: 'Details' },
      slots: { default: '<button id="inner">Inner</button>' }
    })
    const content = wrapper.find('.cat-collapse-content')
    // v-show renders display:none, which removes the subtree from the
    // accessibility tree *and* the tab order.
    expect((content.element as HTMLElement).style.display).toBe('none')
    expect(content.attributes('aria-hidden')).toBeUndefined()
  })

  it('shows content when open', async () => {
    const wrapper = mount(CatCollapse, {
      props: { label: 'Details' },
      slots: { default: '<p>Body</p>' }
    })
    const content = wrapper.find('.cat-collapse-content')
    expect((content.element as HTMLElement).style.display).toBe('none')

    await wrapper.find('button').trigger('click')
    expect((content.element as HTMLElement).style.display).not.toBe('none')
  })

  it('emits update:open plus open/close on toggle', async () => {
    const wrapper = mount(CatCollapse, { props: { label: 'Details' } })
    const trigger = wrapper.find('button')

    await trigger.trigger('click')
    expect(wrapper.emitted('update:open')).toEqual([[true]])
    expect(wrapper.emitted('open')).toHaveLength(1)
    expect(wrapper.emitted('close')).toBeUndefined()

    await trigger.trigger('click')
    expect(wrapper.emitted('update:open')).toEqual([[true], [false]])
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('follows a controlled open prop, for accordion use', async () => {
    const wrapper = mount(CatCollapse, { props: { label: 'Details', open: false } })
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('false')

    await wrapper.setProps({ open: true })
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('true')

    await wrapper.setProps({ open: false })
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('false')
  })

  it('does not re-emit when the controlled prop sets the state it is already in', async () => {
    const wrapper = mount(CatCollapse, { props: { label: 'Details', open: false } })
    await wrapper.setProps({ open: true })
    // The prop watcher updates internal state directly; toggling to the value
    // it already holds must not emit.
    const before = wrapper.emitted('update:open')?.length ?? 0
    await wrapper.vm.$.exposed!.open()
    expect(wrapper.emitted('update:open')?.length ?? 0).toBe(before)
  })

  it('wraps the trigger in a heading of the requested level, with the button inside', () => {
    const wrapper = mount(CatCollapse, {
      props: { label: 'Methodology', headingLevel: 3 }
    })
    const heading = wrapper.find('h3')
    expect(heading.exists()).toBe(true)
    expect(heading.find('button').exists()).toBe(true)
    // The heading itself must stay a heading — no role override, or screen
    // readers drop it from the headings list.
    expect(heading.attributes('role')).toBeUndefined()
    // And the button must not wrap the heading.
    expect(wrapper.find('button h3').exists()).toBe(false)
  })

  it('renders no heading when headingLevel is omitted', () => {
    const wrapper = mount(CatCollapse, { props: { label: 'Details' } })
    expect(wrapper.find('h1, h2, h3, h4, h5, h6').exists()).toBe(false)
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('exposes the open state to the trigger slot', () => {
    const wrapper = mount(CatCollapse, {
      props: { open: true },
      slots: { trigger: '<template #trigger="{ open }"><span>{{ open ? "Hide" : "Show" }}</span></template>' }
    })
    expect(wrapper.text()).toContain('Hide')
  })

  it('does not render the default label markup when a trigger slot is supplied', () => {
    const wrapper = mount(CatCollapse, {
      props: { label: 'Ignored' },
      slots: { trigger: '<span>Custom</span>' }
    })
    expect(wrapper.find('.cat-collapse-label').exists()).toBe(false)
    expect(wrapper.text()).toContain('Custom')
    expect(wrapper.text()).not.toContain('Ignored')
  })

  // The default trigger's only other content is an aria-hidden chevron, so with
  // no label and no #trigger slot the button would have no accessible name.
  // Per the ARIA spec `button` is children-presentational, so its descendants
  // should not surface as separate accessibility objects. Safari stops honouring
  // that when the button itself is a flex container, leaking the label and icon
  // into the tree — VoiceOver then reads "…, button, group". The layout belongs
  // on an inner span so the button's own display stays out of it.
  it('keeps the flex layout off the button element itself', () => {
    const wrapper = mount(CatCollapse, { props: { label: 'Details' } })
    const trigger = wrapper.find('button.cat-collapse-trigger')
    const inner = trigger.find('.cat-collapse-trigger-inner')
    expect(inner.exists()).toBe(true)
    expect(inner.element.tagName).toBe('SPAN')
    // Everything the button renders sits inside the wrapper.
    expect(trigger.element.children).toHaveLength(1)
    expect(trigger.element.firstElementChild).toBe(inner.element)
  })

  it('falls back to an aria-label when nothing supplies visible text', () => {
    const wrapper = mount(CatCollapse)
    expect(wrapper.find('button').attributes('aria-label')).toBe('Toggle section')
  })

  it('omits aria-label when a label or trigger slot names the button', () => {
    const labelled = mount(CatCollapse, { props: { label: 'Details' } })
    expect(labelled.find('button').attributes('aria-label')).toBeUndefined()

    const slotted = mount(CatCollapse, { slots: { trigger: '<span>Custom</span>' } })
    expect(slotted.find('button').attributes('aria-label')).toBeUndefined()
  })

  it('lets ariaLabel override the fallback name', () => {
    const wrapper = mount(CatCollapse, { props: { ariaLabel: 'Show files' } })
    expect(wrapper.find('button').attributes('aria-label')).toBe('Show files')
  })

  it('does not toggle when disabled', async () => {
    const wrapper = mount(CatCollapse, { props: { label: 'Details', disabled: true } })
    const trigger = wrapper.find('button')
    expect(trigger.attributes('disabled')).toBeDefined()
    await trigger.trigger('click')
    expect(wrapper.emitted('update:open')).toBeUndefined()
  })

  it('has no axe violations closed or open', async () => {
    const closed = mount(CatCollapse, {
      props: { label: 'Details' },
      slots: { default: '<p>Body</p>' },
      attachTo: document.body
    })
    await expectNoAxeViolations(closed)
    closed.unmount()

    const open = mount(CatCollapse, {
      props: { label: 'Details', open: true, headingLevel: 3 },
      slots: { default: '<p>Body</p>' },
      attachTo: document.body
    })
    await expectNoAxeViolations(open)
    open.unmount()
  })
})
