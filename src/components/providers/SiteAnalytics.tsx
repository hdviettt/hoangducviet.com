"use client";

import { PostHogProvider } from "@/components/providers/PostHogProvider";
import { GoogleAnalytics } from "@next/third-parties/google";
import { usePathname } from "next/navigation";

/**
 * Analytics for the public site only.
 *
 * Both trackers used to sit in the root layout, which wraps `/admin` as well.
 * A single load of the post editor fired two GA beacons carrying
 * `dl=/admin/posts/<slug>/edit`, so every writing session was counted as site
 * traffic and every admin URL, slugs included, went to Google. It also put two
 * third-party scripts in the load path of the editor.
 *
 * The check is on the path rather than on a build flag because the admin is
 * part of the same app and the same deployment.
 */
export default function SiteAnalytics({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <GoogleAnalytics gaId="G-GGK8FWGCPX" />
      <PostHogProvider>{children}</PostHogProvider>
    </>
  );
}
