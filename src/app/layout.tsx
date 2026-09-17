import { SITE_THEME_INIT } from "@/components/layout/theme";
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

import ClientFileExplorer from "@/components/layout/ClientFileExplorer";
import SiteAnalytics from "@/components/providers/SiteAnalytics";
import { getGlobalMetadata } from "@/lib/global";

// Two faces, because Google uses two. Google Sans Flex is the display face and
// Google Sans Text is the reading face, which is the split m3.material.io's own
// type scale encodes: display/headline/title-large resolve to Google Sans, and
// body/label/title-medium/title-small resolve to Google Sans Text.
//
// Both are loaded via <link> in <head> because next/font's compiled list does
// not carry either one yet. globals.css maps them to --font-inter and
// --font-text, so every existing CSS reference keeps working.
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
          href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,1..1000&family=Google+Sans+Text:wght@400;500;700&display=swap"
        />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground font-sans">
        {/* Before first paint, so a reader who chose dark never sees a white
            frame first. The literal is fixed and takes no input. */}
        <script dangerouslySetInnerHTML={{ __html: SITE_THEME_INIT }} />
        <SiteAnalytics>
          <ClientFileExplorer>{children}</ClientFileExplorer>
        </SiteAnalytics>
      </body>
    </html>
  );
}
