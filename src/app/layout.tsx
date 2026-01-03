import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google'

import { getGlobalMetadata } from "@/lib/directus";
import ClientFileExplorer from "@/components/ClientFileExplorer";
import { PostHogProvider } from "@/components/PostHogProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--font-mono",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const global = await getGlobalMetadata();
  const siteTitle = global && global.length > 0 ? global[0].title : "Hoang Duc Viet";
  const siteTagline = global && global.length > 0 ? global[0].tagline : "Hoang Duc Viet's personal blog";
  return {
    title: siteTitle,
    description: siteTagline,
    icons: {
      icon: '/favicon.svg',
    },
  }
}

// Script to prevent theme flash - runs before React hydration
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
    <html lang="vi" className={`${inter.variable} ${jetbrainsMono.variable} overflow-x-hidden`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground font-sans">
        <GoogleAnalytics gaId="G-HKSHVM8Z9G" />
        <ThemeProvider>
          <PostHogProvider>
            <ClientFileExplorer>
              {children}
            </ClientFileExplorer>
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}