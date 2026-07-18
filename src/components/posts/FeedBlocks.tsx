import FeedRow from "@/components/posts/FeedRow";
import SeriesShowcase from "@/components/posts/SeriesShowcase";
import type { FeedItem } from "@/lib/posts";

// One chronological feed, two treatments (shared by / and /posts):
// consecutive posts flow into a two-column row grid; a series interrupts the
// stream with its full-width sticky-rail showcase, in its date position.
// Regular posts don't get featured/sticky treatment — only series do.
type Block =
  | { kind: "posts"; items: Extract<FeedItem, { kind: "post" }>[] }
  | { kind: "series"; item: Extract<FeedItem, { kind: "series" }> };

function toBlocks(items: FeedItem[]): Block[] {
  const blocks: Block[] = [];
  for (const item of items) {
    if (item.kind === "series") {
      blocks.push({ kind: "series", item });
    } else {
      const last = blocks[blocks.length - 1];
      if (last?.kind === "posts") last.items.push(item);
      else blocks.push({ kind: "posts", items: [item] });
    }
  }
  return blocks;
}

export default function FeedBlocks({
  items,
  viewCounts,
}: {
  items: FeedItem[];
  viewCounts: Record<string, number>;
}) {
  const blocks = toBlocks(items);

  return (
    <div>
      {blocks.map((block, i) =>
        block.kind === "series" ? (
          <SeriesShowcase
            key={`series-${block.item.series.slug}`}
            item={block.item}
            viewCounts={viewCounts}
          />
        ) : (
          <div
            key={`posts-${i}`}
            className={`grid md:grid-cols-2 gap-x-16 xl:gap-x-20 [&>a]:border-md-outline-variant [&>a:not(:first-child)]:border-t md:[&>a:nth-child(2)]:border-t-0 ${
              i > 0 ? "mt-16 md:mt-24" : ""
            }`}
          >
            {block.items.map((item) => (
              <FeedRow
                key={item.post.slug}
                item={item}
                views={viewCounts[item.post.slug ?? ""] ?? 0}
              />
            ))}
          </div>
        ),
      )}
    </div>
  );
}
