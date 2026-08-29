---
"@interline-io/catenary": minor
---

`cat-theme-toggle` becomes a real toggle button, and `cat-safelink` names and announces its actions. Closes the remaining findings in #51.

## `cat-theme-toggle`

The label named the *current* state ("Dark Mode" while dark) with no `aria-pressed`, which is ambiguous with the opposite convention where a label names the action — a screen reader user heard "Dark Mode, button" and could not tell whether pressing it turned dark mode on or off. It actually turned it off, the inverse of the Play/Pause convention.

Now the standard toggle-button shape: a fixed label naming what the button controls, with `aria-pressed` carrying the state. Uses the `ariaPressed` prop added to `cat-button` in #82.

**Visible change:** the button now reads "Dark mode" in both states rather than "Light Mode" / "Dark Mode". A new `label` prop overrides it for translation. The sun/moon icon still indicates the state visually and remains `aria-hidden`.

## `cat-safelink`

- **Both actions are named after their subject** — `Copy https://example.com/… to clipboard` and `Open https://example.com/… in new tab` — instead of the constant `"Copy to clipboard"` / `"Open URL in new tab"`. A safelink is usually rendered once per row of a table, so identical names left a screen reader's elements list showing N indistinguishable buttons, and the link's name never said where it went (WCAG 2.4.4). The display `text` is preferred over the URL when present.
- **Copy results are announced.** The clipboard write produces no visible change, so success and failure now go to a visually hidden `role="status"`; failures previously only reached `console.error`. The region is rendered from mount and only its text changes, because a live region inserted together with its content is announced unreliably. `copiedLabel` and `copyFailedLabel` are props for translation, and the `copy` event still fires for consumers wiring their own UI.

## `cat-search-bar`

`type="search"` rather than `type="text"`, giving the input its implicit `searchbox` role.

`cat-input` now suppresses WebKit's native search clear affordance, since it draws its own whenever `clearable` is set and `cat-search-bar` always sets it. Chrome already dropped the native one because Bulma's control mixin sets `appearance: none` on `.input` — verified that layout is byte-identical between `type="text"` and `type="search"` there — but Safari keeps it unless the pseudo-element is suppressed explicitly, which would have shown two clear buttons in the same field.

## Tests and docs

New `safelink.test.ts` and `theme-toggle.test.ts` (neither component had tests), covering the naming, the live region in all three outcomes, and the pressed state. `cat-theme-toggle`'s playground page gains the `demo-a11y` section it lacked, which also takes one component off the list in #64.

Playground: `demo-a11y` now underlines links in its intro paragraph, not just in the reference list. #70 fixed the list; the intro needed it for the same reason and only surfaced once a page put enough prose around the pattern link for axe to treat it as a text block (measured 1.13:1 against the surrounding text).
