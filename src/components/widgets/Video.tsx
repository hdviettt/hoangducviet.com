"use client";

interface VideoProps {
  /** Video file URL (self-hosted on R2, e.g. an .mp4/.webm). */
  src?: string;
  /** Optional caption shown under the player. */
  caption?: string;
  /** Optional poster image shown before playback. */
  poster?: string;
}

// Self-hosted video player used inside posts via the `widget:video` fence.
// preload="metadata" keeps bandwidth low — only the first frame + duration
// load until the reader hits play. w-full/h-auto + max-h respects the video's
// natural aspect ratio (portrait clips won't get cropped or blow up the page).
export default function Video({ src, caption, poster }: VideoProps) {
  if (!src) return null;

  return (
    <figure className="my-6 not-prose">
      {/* biome-ignore lint/a11y/useMediaCaption: author-supplied clips have no track file */}
      <video
        controls
        preload="metadata"
        playsInline
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
