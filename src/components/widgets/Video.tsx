"use client";

import { useEffect, useRef } from "react";

interface VideoProps {
  /** Video file URL (self-hosted on R2, e.g. an .mp4/.webm). */
  src?: string;
  /** Optional caption shown under the player. */
  caption?: string;
  /** Optional poster image shown before playback. */
  poster?: string;
  /**
   * Escape hatch for long clips that need scrubbing. Off by default: a demo
   * clip should read as a moving picture, not a video player — exactly like
   * the clips inside the carousel.
   */
  controls?: boolean;
}

// Self-hosted clip used inside posts via the `widget:video` fence. By default
// it behaves like a GIF, and like the carousel's clips: muted, looping, no
// player chrome, non-interactive, and playing only while it is on screen.
// Browsers only allow muted autoplay, so there is no sound and nothing to
// unmute — pass `controls: true` in the fence when a clip genuinely needs a
// real player to pause or scrub. Respects prefers-reduced-motion by staying on
// the poster frame. preload="metadata" keeps bandwidth low until it is near
// the viewport.
export default function Video({
  src,
  caption,
  poster,
  controls = false,
}: VideoProps) {
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
          } else if (!el.paused) {
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
      <video
        ref={ref}
        muted
        loop
        playsInline
        controls={controls || undefined}
        disablePictureInPicture
        controlsList="nodownload noplaybackrate noremoteplayback"
        preload="metadata"
        poster={poster || undefined}
        tabIndex={controls ? undefined : -1}
        aria-hidden={!controls && !caption ? true : undefined}
        // A default clip is a moving picture, not a control surface: swallow
        // pointer events so there is nothing to click, right-click or long-press.
        style={controls ? undefined : { pointerEvents: "none" }}
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
