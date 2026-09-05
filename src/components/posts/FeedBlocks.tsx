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
    // Khong khoa 680px nua. O luoi chua no rong 780 (1044 - 200 rail - 64 gap),
    // nen cai khoa nay de thua dung 100px ben phai — tren /posts, noi khong con
    // gi khac de lap, do ra la ca trang lech 100px sang trai.
    <div>
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
