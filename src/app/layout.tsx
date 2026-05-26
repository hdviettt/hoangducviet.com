import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

import dynamic from "next/dynamic";
import ClientFileExplorer from "@/components/layout/ClientFileExplorer";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

const PostHogProvider = dynamic(
  () =>
    import("@/components/providers/PostHogProvider").then(
      (mod) => mod.PostHogProvider,
    ),
  { ssr: false },
);
import { getGlobalMetadata } from "@/lib/global";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

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
    process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com";
  return {
    metadataBase: new URL(baseUrl),
    title: siteTitle,
    description: siteTagline,
    icons: {
      icon: "/favicon.svg",
    },
    alternates: {},
  };
}

// Script to prevent theme flash - runs before React hydration
// Default is light mode, only switch to dark if explicitly stored
const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('theme');
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      }
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
      className={`${inter.variable} ${jetbrainsMono.variable} overflow-x-hidden`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://us.i.posthog.com" />
        <link rel="preconnect" href="https://us-assets.i.posthog.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground font-sans">
        <GoogleAnalytics gaId="G-HKSHVM8Z9G" />
        <ThemeProvider>
          <PostHogProvider>
            <ClientFileExplorer>{children}</ClientFileExplorer>
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
