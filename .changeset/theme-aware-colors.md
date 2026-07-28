---
"@interline-io/catenary": patch
---

Fix dark-mode contrast failures by taking colors from Bulma's runtime theme tokens instead of compile-time SCSS variables.

Bulma 1.x switches light/dark by reassigning CSS custom properties. SCSS variables resolve at build time, so anything colored from them kept its light-theme value on a dark background. Measured with axe-core against the playground with `data-theme="dark"`:

- **`cat-tabs`: 45 color-contrast violations, now 0.** Inactive tab labels were `#404654` on `#14161a` — **1.91:1**, effectively unreadable. Active labels were at 3.51:1.
- **`cat-loading`: the scrim was `rgba($white, 0.8)`** — a white veil over dark content. It is now built from the scheme's own HSL parts, so it dims rather than flashes.
- **`cat-table`: the sortable-header hover** painted a near-white block.
- **`cat-dropdown-item`** dividers and **`cat-slider-tick`** labels used fixed greys.
- **`cat-datepicker`: the calendar grid was white on a dark page.** Its day cells were painted with `var(--bulma-white)` and `var(--bulma-grey-*)`, which are palette constants rather than theme tokens — the same value in both schemes — while the day numbers used `var(--bulma-text)`, which does adapt. The result was light-grey text on white: **1.9:1**, now 8.43:1.
- **`cat-card`** dropped a `#fafafa` hex fallback, which the amended rule prohibits.

Focus rings across `cat-button`, `cat-card`, `cat-collapse`, `cat-datepicker`, `cat-dropdown-item`, `cat-input`, `cat-safelink`, `cat-slider-tick`, `cat-steps`, `cat-step-item`, `cat-table` and `cat-tabs` moved to `var(--bulma-link-on-scheme)`. They were not failing — a focus indicator is judged against WCAG 1.4.11's 3:1, which they met — but they were the wrong blue in dark mode.

## Visible change worth knowing about

Text and indicators tinted by a variant now use Bulma's `-on-scheme` tokens, which are the ones that actually adapt: `--bulma-link` resolves to the same value in both schemes, while `--bulma-link-on-scheme` shifts for the background it sits on.

A side effect is that these components now follow **your** palette. Previously the compiled SCSS default won regardless of what an app configured, so an app overriding `$link` saw Bulma's stock blue in its tabs and focus rings anyway. Those now render in the configured color. If your app overrides Bulma colors, expect tabs, focus rings and slider tick labels to change appearance — to the color you asked for.

`var(--bulma-white)` is left in place where it is correct: the checkbox tick and the switch knob sit on a variant-colored fill, and `cat-slider`'s value bubble is always dark. Those are theme-independent surfaces, unlike the calendar grid.

Colors that are deliberately theme-independent were left alone: `cat-tooltip`'s bubble is always dark, so white text on it is correct in both schemes, and it now says so in a comment.

`.claude/CLAUDE.md` has been amended to match — runtime tokens for color, SCSS variables for sizing, spacing, radii and breakpoints, and never a hex fallback.
