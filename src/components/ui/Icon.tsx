import type { CSSProperties, HTMLAttributes } from "react";

type IconProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  name: string;
  size?: number;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  filled?: boolean;
  grade?: number;
};

export function Icon({
  name,
  size = 20,
  weight = 400,
  filled = false,
  grade = 0,
  className,
  style,
  ...rest
}: IconProps) {
  const mergedStyle: CSSProperties = {
    fontSize: size,
    fontVariationSettings: `"FILL" ${filled ? 1 : 0}, "wght" ${weight}, "GRAD" ${grade}, "opsz" ${size}`,
    ...style,
  };
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-rounded${className ? ` ${className}` : ""}`}
      style={mergedStyle}
      {...rest}
    >
      {name}
    </span>
  );
}
