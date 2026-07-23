import MarkdownContent from "@/components/content/MarkdownContent";
import type { Metadata } from "next";

// Private preview surface for the `widget:carousel` fence. Noindex — this is a
// workbench, not content. Delete the route once the widget is in a real post.
export const metadata: Metadata = {
  title: "Carousel lab",
  robots: { index: false, follow: false },
};

const DEMO = `
Everything below is rendered from real \`\`\`widget:carousel\`\`\` fences, so what
you see here is exactly what a post would get.

## Uniform assets (the good case)

When \`ratio\` matches the source, the media fills the frame edge to edge.
Neighbouring slides are cut off by the viewport on purpose — that peek is the
only thing telling you there is more to the right.

\`\`\`widget:carousel
{
  "ratio": "1200 / 630",
  "items": [
    { "src": "/og/an-agent-platform-on-the-claude-agent-sdk.png", "caption": "The platform post: three floors, one set of shared pillars." },
    { "src": "/og/agentic-keyword-clustering.png", "caption": "Keyword clustering, with the groups named by the model rather than numbered." },
    { "src": "/og/why-our-ai-team-failed.png", "caption": "A post-mortem cover: what we shipped versus what anyone adopted." },
    { "src": "/og/an-artifact-driven-ai-initiative-blueprint.png", "caption": "The blueprint that every initiative since has been measured against." },
    { "src": "/og/the-chinese-ai-wisdom.png", "caption": "Integration wisdom, borrowed from a tradition that had it first." },
    { "src": "/og/series-building-a-mini-search-engine.png", "caption": "The search-engine series, six parts from crawler to reranker." }
  ]
}
\`\`\`

## Mixed ratios — \`mat: "brand"\` (default)

These are the article diagrams, which are wider than 16:9. They letterbox
instead of cropping, because cropping a diagram destroys it. The leftover
canvas is a single-hue SEONGON sweep — enough to read as a surface rather than
a grey band, quiet enough not to argue with a diagram that already spends
blue, green and amber on meaning.

All three blocks below deliberately set \`ratio: "3 / 2"\` against 2.2:1
diagrams, so the canvas is big enough to judge. In a real post you would match
the ratio and see almost none of it.

\`\`\`widget:carousel
{
  "ratio": "3 / 2",
  "items": [
    { "src": "/figures/platform-primitives.svg", "caption": "Three primitives: an agent is a Markdown file, a skill is a folder, a connector is a contract." },
    { "src": "/figures/platform-ownership.svg", "caption": "Who owns what. Green is a person's call, blue is the platform's, amber is the model's." },
    { "src": "/figures/platform-request-sequence.svg", "caption": "One request, end to end, in the order it actually happens." },
    { "src": "/figures/platform-where-it-runs.svg", "caption": "Where each piece runs once it leaves a laptop." }
  ]
}
\`\`\`

## Same slides — \`mat: "ambient"\`

A blurred, scaled copy of the slide's own picture instead — the letterbox
becomes an out-of-focus continuation, so it can never clash. Barely shows
behind near-white diagrams like these; much stronger under colourful or
photographic slides.

\`\`\`widget:carousel
{
  "mat": "ambient",
  "ratio": "3 / 2",
  "items": [
    { "src": "/figures/platform-primitives.svg", "caption": "Three primitives: an agent is a Markdown file, a skill is a folder, a connector is a contract." },
    { "src": "/figures/platform-ownership.svg", "caption": "Who owns what. Green is a person's call, blue is the platform's, amber is the model's." },
    { "src": "/figures/platform-request-sequence.svg", "caption": "One request, end to end, in the order it actually happens." },
    { "src": "/figures/platform-where-it-runs.svg", "caption": "Where each piece runs once it leaves a laptop." }
  ]
}
\`\`\`

## Same slides — \`mat: "flat"\`

What it looked like before: a plain surface tint.

\`\`\`widget:carousel
{
  "mat": "flat",
  "ratio": "3 / 2",
  "items": [
    { "src": "/figures/platform-primitives.svg", "caption": "Three primitives: an agent is a Markdown file, a skill is a folder, a connector is a contract." },
    { "src": "/figures/platform-ownership.svg", "caption": "Who owns what. Green is a person's call, blue is the platform's, amber is the model's." },
    { "src": "/figures/platform-request-sequence.svg", "caption": "One request, end to end, in the order it actually happens." },
    { "src": "/figures/platform-where-it-runs.svg", "caption": "Where each piece runs once it leaves a laptop." }
  ]
}
\`\`\`

## Clips

Videos autoplay muted and loop, but only while a slide is BOTH centred and on
screen — so scrolling past the carousel stops every decoder.

\`\`\`widget:carousel
[
  { "src": "/_vidtest/clip1.mp4", "caption": "Clip one." },
  { "src": "/_vidtest/clip2.mp4", "caption": "Clip two." },
  { "src": "/_vidtest/clip3.mp4", "caption": "Clip three." }
]
\`\`\`

## A broken fence

Bad JSON says so rather than vanishing.

\`\`\`widget:carousel
[ { "src": "/og/inverted-index.png", "caption": "missing bracket"
\`\`\`

## A single item

With one slide the arrows and the rail disappear entirely — no dead controls.

\`\`\`widget:carousel
[
  { "src": "/og/inverted-index.png", "caption": "One slide, no chrome." }
]
\`\`\`

That is the whole surface area: a JSON array of \`{ src, caption }\`, with
optional \`alt\`, \`poster\`, \`fit\` and \`type\` per item.
`;

export default function CarouselLabPage() {
  return (
    <div className="px-5 sm:px-8 lg:px-14 xl:px-20 py-16 md:py-24">
      <div className="mx-auto max-w-[720px] min-w-0">
        <h1 className="md-headline-large mb-3 text-md-on-surface">
          Carousel lab
        </h1>
        <p className="md-body-medium mb-12 text-md-on-surface-variant">
          Preview surface for the media carousel widget. Not indexed, not
          linked.
        </p>
        <div className="article-content">
          <MarkdownContent content={DEMO} />
        </div>
      </div>
    </div>
  );
}
