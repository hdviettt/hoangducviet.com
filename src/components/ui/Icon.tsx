import { ICON_PATHS, ICON_VIEWBOX } from "@/components/ui/icon-paths";
import type { CSSProperties, SVGProps } from "react";

type IconProps = Omit<SVGProps<SVGSVGElement>, "children" | "name"> & {
  name: string;
  size?: number;
  filled?: boolean;
};

/**
 * One icon, drawn inline.
 *
 * This used to render a `<span class="material-symbols-rounded">arrow_forward</span>`
 * and let a webfont turn the word into a glyph. Everything about that is fine
 * until the font is slow or blocked, and then the page shows the word: real
 * visitors saw "View project arrow_forward" and "mail viethd2704@gmail.com".
 * A font is a dependency the first paint has to wait on; a path is not.
 *
 * An unknown name renders nothing rather than falling back to text, because
 * the whole point is that this component can never put a ligature on screen.
 * Every name used in the app is in `icon-paths.ts`; add there, not here.
 */
export function Icon({
  name,
  size = 20,
  filled = false,
  className,
  style,
  ...rest
}: IconProps) {
  const def = ICON_PATHS[name];
  if (!def) return null;

  const mergedStyle: CSSProperties = {
    // Icons sit in text: `1em`-ish sizing on the box and vertical centring by
    // the flex parent is what the font version got for free.
    flexShrink: 0,
    ...style,
  };

  return (
    <svg
      viewBox={ICON_VIEWBOX}
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={mergedStyle}
      {...rest}
    >
      <path d={filled && def.fill ? def.fill : def.d} />
    </svg>
  );
}
