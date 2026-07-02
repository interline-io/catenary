import { describe, it, expect } from 'vitest'
import CatSearchBar from './search-bar.vue'
import { mountComponent, expectNoAxeViolations } from '../testutil/component-helpers'

function dispatchEscape (el: Element): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
  el.dispatchEvent(event)
  return event
}

function lastEmit (events: unknown[][] | undefined): unknown[] | undefined {
  return events?.[events.length - 1]
}

describe('CatSearchBar', () => {
  it('renders a search input with a magnifier icon and a default accessible name', () => {
    const wrapper = mountComponent(CatSearchBar, { props: { modelValue: '' } })

    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
    expect(input.attributes('aria-label')).toBe('Search')
    expect(wrapper.find('.icon.is-left i.mdi-magnify').exists()).toBe(true)
  })

  it('allows overriding the accessible name', () => {
    const wrapper = mountComponent(CatSearchBar, {
      props: { modelValue: '', ariaLabel: 'Filter routes' }
    })

    expect(wrapper.find('input').attributes('aria-label')).toBe('Filter routes')
  })

  it('shows a labelled clear button only once populated', async () => {
    const wrapper = mountComponent(CatSearchBar, { props: { modelValue: '' } })
    expect(wrapper.find('.cat-input-clear-button').exists()).toBe(false)

    await wrapper.setProps({ modelValue: 'bus' })
    const clear = wrapper.find('.cat-input-clear-button')
    expect(clear.exists()).toBe(true)
    expect(clear.element.tagName).toBe('BUTTON')
    expect(clear.attributes('aria-label')).toBe('Clear search')
  })

  it('emits the string on input and null when emptied', async () => {
    const wrapper = mountComponent(CatSearchBar, { props: { modelValue: '' } })
    const input = wrapper.find('input')

    await input.setValue('train')
    expect(lastEmit(wrapper.emitted('update:modelValue'))).toEqual(['train'])

    await input.setValue('')
    expect(lastEmit(wrapper.emitted('update:modelValue'))).toEqual([null])
  })

  it('clicking the clear button emits null and clear', async () => {
    const wrapper = mountComponent(CatSearchBar, { props: { modelValue: 'bus' } })

    await wrapper.find('.cat-input-clear-button').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.some(e => e[0] === null)).toBe(true)
    expect(wrapper.emitted('clear')).toHaveLength(1)
  })

  it('clears a populated field on Escape and consumes the key', () => {
    const wrapper = mountComponent(CatSearchBar, { props: { modelValue: 'bus' } })

    const event = dispatchEscape(wrapper.find('input').element)

    expect(event.defaultPrevented).toBe(true)
    expect(lastEmit(wrapper.emitted('update:modelValue'))).toEqual([null])
    // Duplicate keydown (cat-input forwards $attrs to input and root) collapses
    // to a single clear.
    expect(wrapper.emitted('clear')).toHaveLength(1)
  })

  it('keeps focus in the field when Escape clears while the clear button is focused', async () => {
    const wrapper = mountComponent(CatSearchBar, {
      attachTo: document.body,
      props: { modelValue: 'bus' }
    })

    const clearButton = wrapper.find('.cat-input-clear-button').element as HTMLElement
    clearButton.focus()
    expect(document.activeElement).toBe(clearButton)

    // Escape while the clear button holds focus: clears, then the parent applies
    // the emitted null which unmounts the button. Focus must land on the input,
    // not fall back to <body>.
    dispatchEscape(clearButton)
    await wrapper.setProps({ modelValue: null })

    expect(document.activeElement).toBe(wrapper.find('input').element)
    wrapper.unmount()
  })

  it('leaves Escape to bubble when the field is empty', () => {
    const wrapper = mountComponent(CatSearchBar, { props: { modelValue: '' } })

    const event = dispatchEscape(wrapper.find('input').element)

    expect(event.defaultPrevented).toBe(false)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('does not clear on Escape when clearOnEscape is false', () => {
    const wrapper = mountComponent(CatSearchBar, {
      props: { modelValue: 'bus', clearOnEscape: false }
    })

    const event = dispatchEscape(wrapper.find('input').element)

    expect(event.defaultPrevented).toBe(false)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('renders the status slot into a polite live region', () => {
    const wrapper = mountComponent(CatSearchBar, {
      props: { modelValue: 'bus' },
      slots: { status: '12 results' }
    })

    const status = wrapper.find('[role="status"]')
    expect(status.exists()).toBe(true)
    expect(status.attributes('aria-live')).toBe('polite')
    expect(status.classes()).toContain('is-sr-only')
    expect(status.text()).toBe('12 results')
  })

  it('omits the live region when no status slot is provided', () => {
    const wrapper = mountComponent(CatSearchBar, { props: { modelValue: 'bus' } })
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
  })

  it('forwards aria-controls to the input so it can point at the filtered region', () => {
    const wrapper = mountComponent(CatSearchBar, {
      props: { modelValue: '' },
      attrs: { 'aria-controls': 'results-table' }
    })

    expect(wrapper.find('input').attributes('aria-controls')).toBe('results-table')
  })

  it('exposes clear() for programmatic clearing', () => {
    const wrapper = mountComponent(CatSearchBar, { props: { modelValue: 'bus' } })

    const exposed = wrapper.vm as unknown as { clear: () => void }
    expect(typeof exposed.clear).toBe('function')

    exposed.clear()
    expect(lastEmit(wrapper.emitted('update:modelValue'))).toEqual([null])
    expect(wrapper.emitted('clear')).toHaveLength(1)
  })

  it('has no axe violations when populated', async () => {
    const wrapper = mountComponent(CatSearchBar, {
      attachTo: document.body,
      props: { modelValue: 'bus' }
    })
    await expectNoAxeViolations(wrapper)
    wrapper.unmount()
  })
})
