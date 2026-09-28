// Vite's `?raw` suffix imports a file's source as a string. Tests use it to
// compile a component's <style> block; the library itself never does.
declare module '*?raw' {
  const source: string
  export default source
}
