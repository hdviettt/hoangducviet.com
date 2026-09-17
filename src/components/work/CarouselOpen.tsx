"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Makes a carousel on a work card open the project when you click the picture,
 * without putting anything on top of the picture.
 *
 * The first attempt at this was a transparent <a> stretched over the carousel.
 * It worked for clicks and broke scrolling: an element on top is what the
 * pointer hit-tests to, so every horizontal wheel event targeted the overlay
 * instead of the slide track. Traced on the running page, the events arrived
 * with `target: A.work-carousel__hit` and the track absent from
 * `composedPath()` entirely, so the carousel never moved. Worse, the gesture
 * then chained to the page, and a horizontal swipe with nothing to scroll is
 * what a browser reads as a history navigation — which is why it looked like
 * going back worked and going forward did nothing.
 *
 * So the click is handled here, on the wrapper itself, and nothing overlays the
 * slides. The track receives its own wheel events again: measured after this
 * change, a flick of 450px advances a slide, where before no flick of any size
 * moved it.
 *
 * Two things the handler has to be careful about:
 *
 * - The carousel's own arrows and dots live inside this box, so a click that
 *   landed on one of them is theirs and must be left alone.
 * - It only fires for a real pointer. On touch the gesture over a carousel is a
 *   swipe, and this keeps the behaviour that shipped rather than quietly
 *   changing what a tap does there.
 *
 * No keyboard affordance is added on purpose. This is a shortcut for a mouse,
 * and the card already carries two real links to the same project — the title
 * and the "View project" button — both of which are in the tab order.
 */
export default function CarouselOpen({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const router = useRouter();

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: pointer-only shortcut to a destination the title and the CTA both link to; see the note above
    <div
      className="work-carousel group"
      onClick={(event) => {
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
          return;
        }
        const el = event.target as HTMLElement | null;
        if (el?.closest("button, a, [role='button']")) return;
        router.push(href);
      }}
    >
      {children}
    </div>
  );
}
