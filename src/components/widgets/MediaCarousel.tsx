"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface CarouselItem {
  /** Image or video URL. */
  src?: string;
  /** Poster frame for videos. */
  poster?: string;
  /** Sentence under the slide. Travels with the slide, like deepmind.google. */
  caption?: string;
  /** Alt text; falls back to the caption. */
  alt?: string;
  /** Override the extension sniff. */
  type?: "image" | "video";
  /** `contain` letterboxes (default, safe for screenshots); `cover` crops. */
  fit?: "contain" | "cover";
}

interface MediaCarouselProps {
  items?: CarouselItem[];
  /** Every slide is normalised to this ratio so heights line up. */
  ratio?: string;
  /** Accessible name for the region. */
  label?: string;
  /**
   * Escape hatch for long clips. Off by default: demo loops behave like GIFs,
   * with no chrome on hover and nothing to pause or scrub.
   */
  controls?: boolean;
}

const VIDEO_EXT = /\.(mp4|webm|ogv|mov|m4v)(\?|#|$)/i;

const isVideo = (item: CarouselItem) =>
  item.type ? item.type === "video" : VIDEO_EXT.test(item.src || "");

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

// Full-bleed media carousel used inside posts via the `widget:carousel` fence.
//
// It is a native horizontal scroller with CSS scroll-snap, not a JS transform
// slider: touch momentum, trackpad swipe and keyboard scrolling all come for
// free, and every slide stays in the DOM as a real <figure> so crawlers and
// readers-with-JS-off still get the captions. JS only adds the two arrows and
// the scrollbar thumb, and gates video playback.
//
// Neighbouring slides are deliberately cut off by the viewport — that peek is
// the only affordance saying "there is more", so the slide width is capped
// below the bleed width rather than filling it.
export default function MediaCarousel({
  items,
  ratio = "16 / 9",
  label = "Media carousel",
  controls = false,
}: MediaCarouselProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const centeredRef = useRef<Set<HTMLVideoElement>>(new Set());
  const inViewRef = useRef(false);

  const [nav, setNav] = useState({
    progress: 1,
    atStart: true,
    atEnd: true,
    index: 0,
  });

  const list = Array.isArray(items) ? items.filter((i) => i?.src) : [];
  const count = list.length;

  // One slide + the gap: the distance the arrows travel.
  const stepSize = useCallback((el: HTMLDivElement) => {
    const slide = el.querySelector<HTMLElement>("[data-slide]");
    const gap = Number.parseFloat(getComputedStyle(el).columnGap) || 0;
    return slide ? slide.offsetWidth + gap : el.clientWidth;
  }, []);

  // The rail reads as a progress bar, not a scrollbar thumb: the fill is
  // anchored left and its width is how much of the strip you have seen —
  // (scrollLeft + clientWidth) / scrollWidth. That starts at the visible
  // fraction rather than at zero and reaches the full rail at the last slide.
  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const max = scrollWidth - clientWidth;
    const step = stepSize(el);
    setNav({
      progress: Math.min(
        1,
        (scrollLeft + clientWidth) / Math.max(scrollWidth, 1),
      ),
      atStart: scrollLeft <= 2,
      atEnd: scrollLeft >= max - 2,
      index: step > 0 ? Math.min(count - 1, Math.round(scrollLeft / step)) : 0,
    });
  }, [count, stepSize]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        measure();
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [measure]);

  // 100vw includes the scrollbar on Windows/Linux, which would push the bleed
  // ~15px wider than the visible page and skew the peek. clientWidth doesn't.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const apply = () => {
      el.style.setProperty(
        "--mc-vw",
        `${document.documentElement.clientWidth}px`,
      );
      measure();
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [measure]);

  // Videos play only while they are BOTH the centred slide and on screen.
  // Two observers are needed: one with the track as root can tell which slide
  // is centred but never reports the carousel scrolling out of the page.
  // The effect reads the <video> elements straight off the DOM, so it has to
  // re-run when the slide count changes even though `count` is never read here.
  // biome-ignore lint/correctness/useExhaustiveDependencies: DOM-query effect
  useEffect(() => {
    const track = trackRef.current;
    const root = rootRef.current;
    if (!track || !root) return;
    const videos = Array.from(track.querySelectorAll("video"));
    for (const v of videos) v.muted = true;
    if (!videos.length || prefersReducedMotion()) return;

    const sync = () => {
      for (const v of videos) {
        if (inViewRef.current && centeredRef.current.has(v)) {
          v.play().catch(() => {
            /* autoplay may still be blocked — leave it paused */
          });
        } else if (!v.paused) {
          v.pause();
        }
      }
    };

    const centred = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) centeredRef.current.add(v);
          else centeredRef.current.delete(v);
        }
        sync();
      },
      { root: track, threshold: 0.8 },
    );
    for (const v of videos) centred.observe(v);

    const onPage = new IntersectionObserver(
      (entries) => {
        inViewRef.current = entries.some((e) => e.isIntersecting);
        sync();
      },
      { threshold: 0.15 },
    );
    onPage.observe(root);

    return () => {
      centred.disconnect();
      onPage.disconnect();
      centeredRef.current.clear();
    };
  }, [count]);

  const go = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir * stepSize(el),
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  // A fence whose JSON failed to parse arrives with no `items` at all. Say so
  // instead of rendering nothing — silently swallowing a slide deck is the
  // worst outcome for an author proofreading a draft. An items array that is
  // simply empty is a deliberate state, so that one stays quiet.
  if (!Array.isArray(items)) {
    return (
      <p className="my-6 rounded-lg border border-md-error/50 px-4 py-3 text-sm text-md-error">
        Carousel: expected a JSON array of slides, or an object with an{" "}
        <code>items</code> array. Check the fence body.
      </p>
    );
  }

  if (!count) return null;

  return (
    <section
      ref={rootRef}
      className="media-carousel"
      aria-roledescription="carousel"
      aria-label={label}
      style={{ "--mc-ratio": ratio } as React.CSSProperties}
    >
      <div
        ref={trackRef}
        className="media-carousel__track"
        // Focusable so keyboard users can scroll the region with arrow keys.
        // biome-ignore lint/a11y/noNoninteractiveTabindex: scroll container
        tabIndex={0}
        aria-label={`${label}: ${count} items, scrollable`}
      >
        {list.map((item, i) => (
          <figure
            key={`${item.src}-${i}`}
            data-slide=""
            className="media-carousel__slide"
          >
            <div
              className="media-carousel__frame"
              data-fit={item.fit === "cover" ? "cover" : "contain"}
            >
              {isVideo(item) ? (
                // No controls by default: a demo clip should read as a moving
                // picture, not a video player. Nothing appears on hover, there
                // is nothing to pause or scrub, and pointer events fall through
                // to the track so the clip can still be swiped.
                <video
                  muted
                  loop
                  playsInline
                  controls={controls || undefined}
                  disablePictureInPicture
                  controlsList="nodownload noplaybackrate noremoteplayback"
                  preload={i < 2 ? "metadata" : "none"}
                  poster={item.poster || undefined}
                  tabIndex={-1}
                  aria-hidden={item.caption ? undefined : true}
                >
                  <source src={item.src} />
                </video>
              ) : (
                <img
                  src={item.src}
                  alt={item.alt ?? item.caption ?? ""}
                  loading={i < 2 ? "eager" : "lazy"}
                  decoding="async"
                />
              )}
            </div>
            {item.caption && (
              <figcaption className="media-carousel__caption">
                {item.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      {count > 1 && (
        <div className="media-carousel__controls">
          <button
            type="button"
            className="media-carousel__btn"
            onClick={() => go(-1)}
            disabled={nav.atStart}
            aria-label="Previous slide"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 5 8 12l7 7" />
            </svg>
          </button>
          <button
            type="button"
            className="media-carousel__btn"
            onClick={() => go(1)}
            disabled={nav.atEnd}
            aria-label="Next slide"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m9 5 7 7-7 7" />
            </svg>
          </button>
          <div className="media-carousel__rail" aria-hidden="true">
            <span
              className="media-carousel__progress"
              style={{ width: `${nav.progress * 100}%` }}
            />
          </div>
          <p className="sr-only" aria-live="polite">
            Slide {nav.index + 1} of {count}
          </p>
        </div>
      )}
    </section>
  );
}
