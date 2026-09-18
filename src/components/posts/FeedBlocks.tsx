import FeedRow from "@/components/posts/FeedRow";
import type { FeedItem } from "@/lib/posts";

// The list, shared by / and /posts.
//
// Spacing is its own, not the project list's, because the two lists are made of
// different material. See `.feed-list` in globals.css for the measurement.
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
    <div className="feed-list flex flex-col">
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
