"use client";

import { useEffect, useRef } from "react";

/**
 * A looping clip in the featured-work slot.
 *
 * `autoplay` on a <video> is not something CSS can take back, so the two rules
 * that make an autoplaying loop acceptable have to live in JS:
 *
 *  - `prefers-reduced-motion` means it never starts. The element stays on its
 *    first frame, which is why `preload` is metadata rather than none.
 *  - A clip that is off screen is a clip nobody is watching, so it pauses.
 *    Three featured blocks each looping a video for the whole session is a
 *    fan spinning for nothing.
 *
 * Same two rules `MediaCarousel` follows; this is the single-frame version of
 * them, because the carousel breaks out full-bleed and cannot live in a grid
 * cell.
 */
export default function FeaturedClip({
  src,
  label,
  className,
}: {
  src: string;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      v.pause();
      return;
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          void v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      aria-label={label}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      className={className}
    />
  );
}
