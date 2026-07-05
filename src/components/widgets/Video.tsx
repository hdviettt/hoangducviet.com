"use client";

import { useEffect, useRef } from "react";

interface VideoProps {
  /** Video file URL (self-hosted on R2, e.g. an .mp4/.webm). */
  src?: string;
  /** Optional caption shown under the player. */
  caption?: string;
  /** Optional poster image shown before playback. */
  poster?: string;
}

// Self-hosted video player used inside posts via the `widget:video` fence.
// Autoplays (muted) once it scrolls into view and pauses when it leaves —
// browsers only allow autoplay while muted, so the reader taps the volume
// control to hear it. Respects prefers-reduced-motion. preload="metadata"
// keeps bandwidth low until the clip is near the viewport.
export default function Video({ src, caption, poster }: VideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Muted is required for autoplay; set it on the element too (React's
    // `muted` attribute doesn't always stick).
    el.muted = true;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.play().catch(() => {
              /* autoplay may be blocked — ignore */
            });
          } else {
            el.pause();
          }
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!src) return null;

  return (
    <figure className="my-6 not-prose">
      {/* biome-ignore lint/a11y/useMediaCaption: author-supplied clips have no track file */}
      <video
        ref={ref}
        controls
        muted
        playsInline
        preload="metadata"
        poster={poster || undefined}
        className="w-full h-auto max-h-[75vh] rounded-lg bg-black"
      >
        <source src={src} />
        Your browser does not support the video tag.
      </video>
      {caption && (
        <figcaption
          className="text-center text-sm mt-3"
          style={{ color: "var(--article-text)" }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
