import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

import ClientFileExplorer from "@/components/layout/ClientFileExplorer";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import { getGlobalMetadata } from "@/lib/global";

// Google Sans Flex — the variable font Google ships on deepmind.google (public
// on Google Fonts since 2025; opsz 6..144 covers both display and text cuts).
// Loaded via <link> in <head> because next/font's compiled list doesn't carry
// it yet. globals.css defines --font-inter with this family first, so every
// existing CSS reference keeps working.
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--font-mono",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const global = await getGlobalMetadata();
  const siteTitle =
    global && global.length > 0 ? global[0].title : "Hoang Duc Viet";
  const siteTagline =
    global && global.length > 0
      ? global[0].tagline
      : "Hoang Duc Viet's personal blog";
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://hoangducviet.com";
  return {
    metadataBase: new URL(baseUrl),
    title: siteTitle,
    description: siteTagline,
    alternates: {},
  };
}

// Runs before hydration so the first paint is already the right theme.
// A stored choice always wins; with no choice we follow the operating system,
// which is what a visitor arriving in dark mode expects to see.
const themeScript = `
  (function() {
    try {
      var stored = localStorage.getItem('theme');
      var dark = stored
        ? stored === 'dark'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (dark) document.documentElement.classList.add('dark');
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} overflow-x-hidden`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://us.i.posthog.com" />
        <link rel="preconnect" href="https://us-assets.i.posthog.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground font-sans">
        <GoogleAnalytics gaId="G-GGK8FWGCPX" />
        <ThemeProvider>
          <PostHogProvider>
            <ClientFileExplorer>{children}</ClientFileExplorer>
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
