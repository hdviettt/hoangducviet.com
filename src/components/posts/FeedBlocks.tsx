import FeedRow from "@/components/posts/FeedRow";
import type { FeedItem } from "@/lib/posts";

// The list, shared by / and /posts.
//
// The rows carry no rules now, so this is where the separating happens: 48px
// between items. That number is the whole treatment, and it is measured rather
// than chosen.
//
// A series part's pitch is 28px. Proximity only groups nine parts under their
// series title if the space between feed items is clearly larger than the space
// between parts, and "clearly" is about 2:1. At the 40px this started as, the
// ratio was 1.4 and the grouping was carried almost entirely by the indent and
// the size step, with proximity contributing little. 48 against 28 is 1.7,
// which is where it stops being decorative.
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
    <div className="flex flex-col gap-12">
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
