import FeedRow from "@/components/posts/FeedRow";
import type { FeedItem } from "@/lib/posts";

// scale.com/blog "MORE POSTS" list: one uninterrupted single-column list of
// hairline rows, shared by / and /posts. Every item — standalone post or
// series — is one Scale-style row; a series row links to its own page (where
// the parts are listed) instead of expanding inline.
export default function FeedBlocks({
  items,
  viewCounts,
}: {
  items: FeedItem[];
  viewCounts: Record<string, number>;
}) {
  return (
    <div className="border-t border-md-outline-variant">
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
