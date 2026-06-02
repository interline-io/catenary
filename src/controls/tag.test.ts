import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CatTag from './tag.vue'

describe('cat-tag', () => {
  it('renders as <span> when no click listener is attached', () => {
    const wrapper = mount(CatTag, {
      props: { label: 'Display only' }
    })
    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.classes()).toContain('tag')
  })

  it('renders as <button> when a parent attaches @click', () => {
    const wrapper = mount(CatTag, {
      props: { label: 'Clickable' },
      attrs: { onClick: () => {} }
    })
    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('type')).toBe('button')
    expect(wrapper.classes()).toContain('tag')
  })

  it('emits click when the button variant is activated', async () => {
    const wrapper = mount(CatTag, {
      props: { label: 'Clickable' },
      attrs: { onClick: () => {} }
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('renders isDelete mode as <button> with aria-label="Delete"', () => {
    const wrapper = mount(CatTag, {
      props: { isDelete: true }
    })
    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('aria-label')).toBe('Delete')
    expect(wrapper.classes()).toContain('is-delete')
  })

  it('emits click when isDelete button is activated', async () => {
    const wrapper = mount(CatTag, {
      attachTo: document.body,
      props: { isDelete: true }
    })
    // Native <button> activates on Space/Enter as a synthetic click event.
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
    wrapper.unmount()
  })

  it('renders the closable cross button with aria-label="Remove"', () => {
    const wrapper = mount(CatTag, {
      props: { label: 'With close', closable: true }
    })
    const closeBtn = wrapper.find('button.delete')
    expect(closeBtn.exists()).toBe(true)
    expect(closeBtn.attributes('aria-label')).toBe('Remove')
  })
})
