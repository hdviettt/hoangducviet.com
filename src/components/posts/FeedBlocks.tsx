import FeedRow from "@/components/posts/FeedRow";
import type { FeedItem } from "@/lib/posts";

// The list, shared by / and /posts: uniform hairline rows, with any multi-post
// series expanding inline. Capped to a reading measure so it reads dense.
export default function FeedBlocks({
  items,
  viewCounts,
}: {
  items: FeedItem[];
  viewCounts: Record<string, number>;
}) {
  return (
    <div className="max-w-[680px]">
      {items.map((item) => {
        const key =
          item.kind === "series"
            ? `series-${item.series.slug}`
            : `post-${item.post.slug}`;
        const slug =
          item.kind === "series" ? item.parts[0]?.slug : item.post.slug;
        return (
          <FeedRow key={key} item={item} views={viewCounts[slug ?? ""] ?? 0} />
        );
      })}
    </div>
  );
}
