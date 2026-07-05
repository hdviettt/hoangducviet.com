import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', '"Google Sans"', "system-ui", "sans-serif"],
        mono: ['var(--font-mono)', '"Roboto Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        // ----- Shadcn aliases (kept so existing utilities keep working) -----
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        // ----- M3 semantic color roles (canonical) -----
        "md-primary": "hsl(var(--md-sys-color-primary))",
        "md-on-primary": "hsl(var(--md-sys-color-on-primary))",
        "md-primary-container": "hsl(var(--md-sys-color-primary-container))",
        "md-on-primary-container": "hsl(var(--md-sys-color-on-primary-container))",
        "md-secondary": "hsl(var(--md-sys-color-secondary))",
        "md-on-secondary": "hsl(var(--md-sys-color-on-secondary))",
        "md-secondary-container": "hsl(var(--md-sys-color-secondary-container))",
        "md-on-secondary-container": "hsl(var(--md-sys-color-on-secondary-container))",
        "md-tertiary": "hsl(var(--md-sys-color-tertiary))",
        "md-on-tertiary": "hsl(var(--md-sys-color-on-tertiary))",
        "md-tertiary-container": "hsl(var(--md-sys-color-tertiary-container))",
        "md-on-tertiary-container": "hsl(var(--md-sys-color-on-tertiary-container))",
        "md-error": "hsl(var(--md-sys-color-error))",
        "md-on-error": "hsl(var(--md-sys-color-on-error))",
        "md-background": "hsl(var(--md-sys-color-background))",
        "md-on-background": "hsl(var(--md-sys-color-on-background))",
        "md-surface": "hsl(var(--md-sys-color-surface))",
        "md-on-surface": "hsl(var(--md-sys-color-on-surface))",
        "md-surface-variant": "hsl(var(--md-sys-color-surface-variant))",
        "md-on-surface-variant": "hsl(var(--md-sys-color-on-surface-variant))",
        "md-surface-container-lowest": "hsl(var(--md-sys-color-surface-container-lowest))",
        "md-surface-container-low": "hsl(var(--md-sys-color-surface-container-low))",
        "md-surface-container": "hsl(var(--md-sys-color-surface-container))",
        "md-surface-container-high": "hsl(var(--md-sys-color-surface-container-high))",
        "md-surface-container-highest": "hsl(var(--md-sys-color-surface-container-highest))",
        "md-outline": "hsl(var(--md-sys-color-outline))",
        "md-outline-variant": "hsl(var(--md-sys-color-outline-variant))",
      },
      borderRadius: {
        // ----- M3 shape scale -----
        none: "var(--md-sys-shape-corner-none)",
        xs: "var(--md-sys-shape-corner-extra-small)",      // 4px
        sm: "var(--md-sys-shape-corner-small)",            // 8px — button
        md: "var(--md-sys-shape-corner-medium)",           // 12px — card (default)
        lg: "var(--md-sys-shape-corner-medium)",           // alias kept for shadcn
        xl: "var(--md-sys-shape-corner-large)",            // 16px
        "2xl": "var(--md-sys-shape-corner-extra-large)",   // 28px — dialog
        "3xl": "var(--md-sys-shape-corner-extra-large)",
        full: "var(--md-sys-shape-corner-full)",
      },
      boxShadow: {
        "md-1": "var(--md-sys-elevation-level1)",
        "md-2": "var(--md-sys-elevation-level2)",
        "md-3": "var(--md-sys-elevation-level3)",
        "md-4": "var(--md-sys-elevation-level4)",
        "md-5": "var(--md-sys-elevation-level5)",
      },
      transitionTimingFunction: {
        "md-emphasized": "var(--md-sys-motion-easing-emphasized)",
        "md-emphasized-decelerate": "var(--md-sys-motion-easing-emphasized-decelerate)",
        "md-emphasized-accelerate": "var(--md-sys-motion-easing-emphasized-accelerate)",
        "md-standard": "var(--md-sys-motion-easing-standard)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
export default config;
