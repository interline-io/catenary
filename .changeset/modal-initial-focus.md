---
"@interline-io/catenary": minor
---

`cat-modal` no longer opens with focus on its close button. Focus goes to the first focusable element in the body, so a form modal focuses its first field. If the body has none, or its first control is out of view in a body that overflows, focus goes to the title, then the body wrapper. Footer actions are never focused by default, because a footer often leads with its primary or destructive action. A new `initialFocus` prop takes a selector, an element (a wrapper resolves to its first focusable descendant) or a function to pick the target, or `false` to skip controls and focus the title. Tab and Shift+Tab from the title now stay inside the dialog. Fixes [#96](https://github.com/interline-io/catenary/issues/96).

This changes where focus lands for nearly every modal. Check:

- **Confirm dialogs** now open on the title. To focus Cancel, set `initialFocus`.
- **Modals with a text field that open on phones.** Focusing the field raises the on-screen keyboard as the dialog opens. `:initial-focus="false"` opts out.
- **A body control with focus behavior**, such as `cat-taginput` with `open-on-focus`, opens its dropdown as the modal opens when it is the first control.
- **Body content that renders after the modal opens** (async components, `<ClientOnly>`, loading states) is not a candidate; focus goes to the title instead.
- **Tests or flows that expected focus on the close button** after open need updating.
