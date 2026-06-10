---
"@interline-io/catenary": minor
---

Layered Escape dismissal and cat-modal fixes. Escape pressed while a popup (cat-dropdown menu, cat-datepicker calendar) is open inside a cat-modal closed both at once, destroying in-progress form state.

- New shared LIFO dismiss stack (`src/util/dismiss-stack.ts`): a single document keydown listener dismisses only the topmost open layer per Escape press. cat-modal, cat-dropdown, and cat-datepicker register through it (via `useDismissablePopup` for the popups); cat-taginput continues to self-consume Escape on its input. A popup inside a modal now closes on the first Escape and the modal on the second. A non-closable modal still registers a layer, so it swallows Escape rather than letting it dismiss a surface beneath it.

cat-modal also gains:

- Open-state side effects (html clipping, focus capture, initial focus) now run when the modal is mounted with `modelValue` already true, not only when it transitions open.
- The focus trap skips hidden focusable candidates (`display:none` etc.) so Tab no longer dead-ends on them.
- An overflowing `modal-card-body` becomes a focusable named region (`tabindex="0"`, `role="region"`, labeled by the title) so keyboard users can scroll it; Safari does not make scroll containers focusable automatically. Overflow is tracked with a ResizeObserver while open.
- An axe smoke test, matching sibling controls.
