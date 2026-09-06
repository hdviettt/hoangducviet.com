import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

import ClientFileExplorer from "@/components/layout/ClientFileExplorer";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} overflow-x-hidden`}>
      <head>
        <meta name="color-scheme" content="light" />
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
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground font-sans">
        <GoogleAnalytics gaId="G-GGK8FWGCPX" />
        <PostHogProvider>
          <ClientFileExplorer>{children}</ClientFileExplorer>
        </PostHogProvider>
      </body>
    </html>
  );
}
