// A `widget:carousel` fence is a rendering instruction, not prose. Agents
// reading /posts/<slug>.md should get the slides as ordinary markdown images
// with their captions rather than a JSON blob to reverse-engineer. Malformed
// fences are left byte-for-byte as authored, so this can never lose content.

const CAROUSEL_FENCE = /^```widget:carousel[ \t]*\n([\s\S]*?)\n```[ \t]*$/gm;

interface CarouselEntry {
  src?: unknown;
  alt?: unknown;
  caption?: unknown;
}

export function expandWidgetFences(markdown: string): string {
  return markdown.replace(CAROUSEL_FENCE, (whole, body: string) => {
    try {
      const parsed = JSON.parse(body);
      const items: unknown = Array.isArray(parsed) ? parsed : parsed?.items;
      if (!Array.isArray(items)) return whole;

      const lines = items
        .filter(
          (i): i is CarouselEntry =>
            !!i && typeof (i as CarouselEntry).src === "string" && !!i.src,
        )
        .map((i) => {
          const text = String(i.alt ?? i.caption ?? "").replace(/[[\]]/g, "");
          return `![${text}](${String(i.src)})`;
        });

      return lines.length ? lines.join("\n\n") : whole;
    } catch {
      return whole;
    }
  });
}
