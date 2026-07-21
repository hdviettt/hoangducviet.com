/**
 * Social platforms do not render SVG in og:image. Facebook, LinkedIn and X all
 * drop the card image entirely, so a post whose cover is an SVG shares with no
 * picture at all. Covers stay SVG on the site (they are animated and sharp at
 * any size); a PNG twin is rendered into /og/ by scripts/render-og.cjs and used
 * for sharing only.
 */
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

/** Map a stored thumbnail to the image social crawlers can actually use. */
export function socialImagePath(thumbnail?: string | null): string | null {
  if (!thumbnail) return null;
  const clean = thumbnail.split("?")[0];
  if (clean.startsWith("http")) return clean;
  if (clean.startsWith("/covers/") && clean.endsWith(".svg")) {
    return `/og/${clean.slice("/covers/".length, -".svg".length)}.png`;
  }
  // Uploaded raster thumbnails are already shareable.
  return clean.endsWith(".svg") ? null : clean;
}

/** Absolute og:image entry, or an empty list when there is nothing shareable. */
export function socialImages(
  thumbnail: string | null | undefined,
  baseUrl: string,
  alt: string,
) {
  const path = socialImagePath(thumbnail);
  if (!path) return [];
  const url = path.startsWith("http") ? path : `${baseUrl}${path}`;
  return [{ url, width: OG_WIDTH, height: OG_HEIGHT, alt }];
}
