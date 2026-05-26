"use client";

import { Icon } from "@/components/ui/Icon";
import { useState } from "react";

interface LikeButtonProps {
  slug: string;
  initialLiked: boolean;
  initialCount: number;
}

export function LikeButton({
  slug,
  initialLiked,
  initialCount,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    if (isPending) return;

    const previousLiked = liked;
    const previousCount = count;
    const nextLiked = !liked;
    const nextCount = nextLiked ? count + 1 : Math.max(count - 1, 0);

    setLiked(nextLiked);
    setCount(nextCount);
    setIsPending(true);

    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(slug)}/like`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as { liked: boolean; count: number };
      setLiked(data.liked);
      setCount(data.count);
    } catch {
      setLiked(previousLiked);
      setCount(previousCount);
    } finally {
      setIsPending(false);
    }
  }

  const caption =
    count === 0 && !liked
      ? "Be the first to like this"
      : `${count.toLocaleString()} ${count === 1 ? "like" : "likes"}`;

  return (
    <div className="flex flex-col items-center gap-5">
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={liked}
        aria-label={liked ? "Unlike this post" : "Like this post"}
        disabled={isPending}
        className={`group flex size-12 items-center justify-center rounded-full border border-primary text-primary transition-all duration-200 hover:ring-4 hover:ring-primary/15 active:scale-95 ${
          liked ? "ring-4 ring-primary/10" : ""
        } ${isPending ? "opacity-70" : ""}`}
      >
        <Icon name="thumb_up" size={20} filled={liked} />
      </button>
      <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground/70">
        <span className="block w-12 border-t border-muted-foreground/20" />
        <span>{caption}</span>
        <span className="block w-12 border-t border-muted-foreground/20" />
      </div>
    </div>
  );
}
