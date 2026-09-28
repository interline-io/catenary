---
"@interline-io/catenary": minor
---

`cat-modal` no longer opens with focus on its close button. Focus now goes to the first focusable element in the body, so a form modal focuses its first field. If the body has none, or it overflows, focus goes to the first control in the footer, then the title, then the body wrapper. A new `initialFocus` prop takes a selector, an element or a function to pick the target, or `false` to skip controls and focus the title. Fixes [#96](https://github.com/interline-io/catenary/issues/96).

This changes where focus lands for nearly every modal. Three things to check:

- **Destructive confirms.** If the footer puts the destructive button before Cancel, it now gets focus. Set `initialFocus` to the Cancel button.
- **Modals with a text field that open on phones.** Focusing the field raises the on-screen keyboard as the dialog opens. `:initial-focus="false"` opts out.
- **Tests or flows that expected focus on the close button** after open need updating.
