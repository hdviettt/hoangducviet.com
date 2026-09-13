"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A looping clip in the featured-work slot.
 *
 * The source is not attached until the clip is near the viewport, and playback
 * is driven entirely from JS. Both of those are deliberate, and each fixed a
 * measured problem:
 *
 *  - The element used to carry `autoplay`, which overrides `preload`: the
 *    browser began fetching the whole file the moment the element mounted, and
 *    the observer only paused it afterwards, once the bytes were in flight. A
 *    clip that was paused and off screen had still pulled 15.31 MB.
 *  - Even without `autoplay`, a `src` plus `preload="metadata"` means every
 *    clip on the page opens a request at load. Seven of those competed with the
 *    poster of the one clip actually on screen, which is what kept LCP at 4.6s
 *    on a slow connection. Holding `src` back until the observer fires makes an
 *    off-screen clip cost nothing at all.
 *
 * The poster carries the frame in the meantime, so the slot is never empty and
 * the box keeps its dimensions: the still is the clip's own first frame, so
 * there is no jump when playback starts.
 *
 * `prefers-reduced-motion` is handled by never arming at all. The reader keeps
 * the poster, which is the right picture, and the video is never fetched.
 *
 * Same rules `MediaCarousel` follows; this is the single-frame version of them,
 * because the carousel breaks out full-bleed and cannot live in a grid cell.
 */
export default function FeaturedClip({
  src,
  label,
  className,
  poster,
}: {
  src: string;
  label: string;
  className?: string;
  poster?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  // Once armed, the source is attached and stays attached: re-fetching on every
  // scroll past would cost more than it saves.
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;

    // Reduced motion keeps the poster and never fetches the clip.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setArmed(true);
        else v.pause();
      },
      // A margin so the file is arriving before the clip is actually looked at,
      // rather than stalling on its first frame the moment it appears.
      { threshold: 0, rootMargin: "300px 0px" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  // Play only once the source exists; calling play() in the same tick as the
  // state change would run before React has attached `src`.
  useEffect(() => {
    const v = ref.current;
    if (!v || !armed) return;
    void v.play().catch(() => {});
  }, [armed]);

  return (
    <video
      ref={ref}
      src={armed ? src : undefined}
      poster={poster}
      aria-label={label}
      muted
      loop
      playsInline
      preload="metadata"
      className={className}
    />
  );
}
