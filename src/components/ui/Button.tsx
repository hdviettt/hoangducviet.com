import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "filled" | "tonal" | "outlined" | "text";
type Size = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  pill?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

const variantClass: Record<Variant, string> = {
  filled: "md-btn-filled",
  tonal: "md-btn-tonal",
  outlined: "md-btn-outlined",
  text: "md-btn-text",
};

const sizeClass: Record<Size, string> = {
  sm: "md-btn-sm",
  md: "",
  lg: "md-btn-lg",
};

export function Button({
  variant = "filled",
  size = "md",
  pill = false,
  leadingIcon,
  trailingIcon,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    "md-btn",
    variantClass[variant],
    sizeClass[size],
    pill ? "md-btn-pill" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button className={classes} {...rest}>
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  );
}
