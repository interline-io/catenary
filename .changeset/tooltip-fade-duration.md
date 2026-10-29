---
"@interline-io/catenary": minor
---

`cat-tooltip` takes its fade's length from a `--cat-tooltip-fade-duration` CSS custom property, `0.2s` by default. Set it to `0s` on `:root` to turn the fade off for every tooltip in an app, without passing `:animated="false"` to each one. A tooltip fades as before when nothing sets the property.
