---
"@interline-io/catenary": patch
---

Fix `cat-tabs` rendering no tab-bar rule and no active-tab underline, and center labels under `expanded`.

`cat-tabs` renders its tablist as `div[role="tablist"]` rather than Bulma's `ul`, so `.tabs ul` never matches and every rule Bulma puts there has to be restated. Two were missing, and they turned out to be the same defect:

- **The tab bar had no rule of its own.** Nothing drew it.
- **Each tab's own bottom border was painted but clipped.** `.cat-tab` keeps Bulma's `margin-bottom: -1px`, which exists to overlap the bar's line. With no line to overlap, the tablist resolved 1px shorter than its buttons and `.tabs` — `overflow: hidden` in Bulma 1.0.4 — clipped every tab's border. Measured before the fix: tabs 41px, tablist 41px, tab 42px, tab `border-bottom-width` 1px.

Giving `.cat-tablist` what Bulma gives `.tabs ul` restores both in one change. Neither was a recent regression — `tabs.vue` was byte-identical from 0.5.0 to 0.10.0.

Separately, `.cat-tab` was missing the `justify-content: center` that Bulma's `.tabs a` carries, so `expanded` grew the tabs but left their labels left-aligned.

## Visible changes

- **Default tabs** gain the full-width rule and the active-tab underline they should always have had.
- **`is-boxed` changes appearance**, in the right direction: it sets `border-bottom-color: transparent` on the active tab precisely so the bar's line shows through the gap, and that line did not previously exist.
- **`expanded` tabs** center their labels.
- **`is-vertical`** gains the continuous right-hand rail its active-tab styling already implied, and does not draw a bottom one. Bulma has no vertical tabs to mirror, so this applies the same reasoning to the axis the orientation uses.
- **`is-toggle`** is unchanged: it explicitly suppresses the tablist border, as Bulma does on `.tabs.is-toggle ul`.

## Tokens

Values now come from the `--bulma-tabs-*` custom properties (`--bulma-tabs-border-bottom-color`, `--bulma-tabs-link-active-color`, `--bulma-tabs-link-padding` and friends) rather than hardcoded equivalents, so a consumer overriding them on `.tabs` gets what they asked for. The resolved colors are unchanged from the previous release, and both themes measure clean under axe-core.
