---
"@interline-io/catenary": patch
---

`cat-notification` accessibility. The close button was an icon-only Bulma delete with no accessible name (announced as just "button", an axe failure) and no `type="button"` (submitting forms when nested in one), and dynamically shown notifications were never announced.

- The close button gains `type="button"` and an accessible name via the new `ariaCloseLabel` prop (default `Dismiss notification`).
- New `role` prop (`status` or `alert`) renders the notification as a live region for dynamically shown messages such as toasts; `alert` is for errors that should interrupt, `status` for everything else. Omit for static page content.
- New `notification.test.ts` with an axe check.
