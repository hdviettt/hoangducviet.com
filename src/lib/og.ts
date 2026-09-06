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
  // Project drawings are SVG for the same reason covers are, and share the
  // same twin rule: /work/<name>.svg -> /og/<name>.png, built by
  // scripts/make-og-work.py.
  if (clean.startsWith("/work/") && clean.endsWith(".svg")) {
    return `/og/${clean.slice("/work/".length, -".svg".length)}.png`;
  }
  // Uploaded raster thumbnails are already shareable.
  return clean.endsWith(".svg") ? null : clean;
}

/** Absolute og:image entry, or an empty list when there is nothing shareable.
 *
 * `slug` is the fallback: a post with no thumbnail at all still has a PNG
 * rendered at /og/<slug>.png by render-og.cjs, and without this it shared as a
 * blank card. That was true of one post on the live site — the picture existed
 * and nothing pointed at it. */
export function socialImages(
  thumbnail: string | null | undefined,
  baseUrl: string,
  alt: string,
  slug?: string,
) {
  const path = socialImagePath(thumbnail) ?? (slug ? `/og/${slug}.png` : null);
  if (!path) return [];
  const url = path.startsWith("http") ? path : `${baseUrl}${path}`;
  return [{ url, width: OG_WIDTH, height: OG_HEIGHT, alt }];
}

/** Card image for pages that have no artwork of their own — /about and the
 * writing archive — using the same portrait the homepage shares with.
 *
 * No width/height here: the portrait is not 1200x630 and declaring a size the
 * file does not have makes crawlers letterbox or crop it. */
export function profileImages(
  image: string | null | undefined,
  baseUrl: string,
  alt: string,
) {
  if (!image) return [];
  return [
    { url: image.startsWith("http") ? image : `${baseUrl}${image}`, alt },
  ];
}
