// A drawing cannot read the page it sits in.
//
// Every figure on this site is one ink at many opacities, and the measurements
// say no single ink survives both grounds: #004AEF is 6.51:1 on white and
// 2.62:1 on #121212, while #8FB2FF is 8.90:1 on #121212 and 2.10:1 on white.
// So each is baked twice and the page shows the one that belongs, which is why
// `darkTwin` exists rather than a filter or a media query inside the SVG.
//
// A `prefers-color-scheme` branch inside the file was the old approach and it
// was removed for the reason it fails: an <img> answers the reader's OS while
// the page answers the reader's choice, so the two come apart the moment
// anyone uses the toggle.
//
// Only the generated sets have twins. An uploaded screenshot has one bake and
// gets `null`, and the caller then renders it as it always did.
const TWINNED = [
  /^\/work\/fld-[a-z0-9-]+\.svg$/,
  /^\/figures\/[a-z0-9-]+\.svg$/,
];

export function darkTwin(src: string | null | undefined): string | null {
  if (!src) return null;
  if (src.endsWith("-dark.svg")) return null;
  if (!TWINNED.some((re) => re.test(src))) return null;
  return `${src.slice(0, -".svg".length)}-dark.svg`;
}
