---
"@interline-io/catenary": minor
---

`cat-dropdown` custom-trigger ARIA and APG keyboard focus. Previously the popup semantics (`aria-haspopup`, `aria-controls`, `aria-expanded`) were bound only on the default trigger button, so every consumer-supplied `#trigger` slot shipped with no indication a popup exists or whether it is open. Keyboard focus behavior also fell short of the APG menu-button and listbox-button patterns.

- New `triggerAttrs` slot prop on `#trigger` exposing the popup semantics; custom triggers spread it onto their focusable element: `<template #trigger="{ triggerAttrs }"><cat-button v-bind="triggerAttrs">`. The default button now consumes the same object.
- Enter and Space on the trigger toggle the menu, and opening moves focus to the first item (or the selected option in listbox mode) per the APG patterns. Typing fields inside a custom trigger keep their normal Enter/Space behavior. Previously the published keyboard documentation claimed this focus move but the implementation left focus on the trigger.
- Opening a `selectable` listbox with the keyboard (Enter, Space, ArrowDown) focuses the option with `aria-selected="true"` instead of always the first option, so users keep their place when reopening.
- When keyboard focus leaves the component while the menu is open (e.g. Tab from the trigger), the menu now closes without moving focus. Previously it lingered open with `aria-expanded="true"`, and a later document-level Escape would yank focus back to the trigger.
- Playground demos updated: the custom-trigger demos spread `triggerAttrs`, and the bare non-focusable `<a class="navbar-item">` trigger (unreachable by keyboard) is now a real button.
