---
"@interline-io/catenary": minor
---

`cat-dropdown`'s menu reads as a panel opened from its trigger. It has a 1px border and a stronger shadow, and in the dark scheme it is lifted 4% above the page instead of matching it exactly. Items sit inset with rounded highlights, and the menu fades in from the trigger's side (not under `prefers-reduced-motion`). The gap to the trigger is Bulma's `--bulma-dropdown-content-offset` (4px) on whichever side the menu lands, where it had been 8px. The menu is at least as wide as its trigger.

The surface is set through Bulma's `--bulma-dropdown-*` tokens on `.cat-dropdown`, which now take precedence over values an app set for Bulma's `.dropdown`, whether through Sass or CSS. Three custom properties restyle it instead, and can be set anywhere, `:root` included: `--cat-dropdown-lift` (default `4%`; `0%` turns the lift off), `--cat-dropdown-border-color` (default `--bulma-border`) and `--cat-dropdown-shadow` (a `filter` value; `none` for a flat menu).

While the menu is open, the default trigger and `cat-split-button`'s caret take Bulma's `is-active`, and a caret icon (`menu-down`, `chevron-up` and similar) turns over. A custom `#trigger` can do the same with the slot's `isActive`.

`cat-split-button` places and sizes its menu against the whole button group, not the caret half.

The menu is named by its trigger through `aria-labelledby`, so a `selectable` listbox is no longer unnamed. A custom button trigger names the menu through its own `id`. A form-field trigger names it by its label, because an `aria-labelledby` pointing at an input would announce the input's value.

Inside the menu, `--bulma-text-weak` is raised in the dark scheme to keep 4.5:1 on the lifted surface.
