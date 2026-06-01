// jsdom doesn't implement <canvas>. axe-core's icon-ligature precheck reaches
// for getContext even when the color-contrast rule is disabled, so stub it
// here to a no-op to silence jsdom's "Not implemented" warnings on every axe
// assertion.
if (typeof HTMLCanvasElement !== 'undefined') {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    value: () => null,
    writable: true,
    configurable: true
  })
}
