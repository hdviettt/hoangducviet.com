import AdminNav from "@/components/admin/AdminNav";
import AdminShellClient from "@/components/admin/AdminShellClient";
import ThemeProvider, {
  THEME_INIT_SCRIPT,
} from "@/components/admin/ThemeProvider";
import { ToastProvider } from "@/components/admin/Toast";
import { db } from "@/db";
import { posts, series } from "@/db/schema";
import { desc } from "drizzle-orm";

export const metadata = {
  title: "Admin",
};

// The nav lists every post and collection, so the shell needs them on every
// admin route. Two indexed reads of a table with tens of rows, fetched here
// rather than in the client so the panel never renders a loading state.
async function getNavData() {
  try {
    const [p, s] = await Promise.all([
      db
        .select({ slug: posts.slug, title: posts.title, status: posts.status })
        .from(posts)
        .orderBy(desc(posts.dateUpdated), desc(posts.dateCreated)),
      db
        .select({ slug: series.slug, title: series.title })
        .from(series)
        .orderBy(desc(series.dateCreated)),
    ]);
    return { navPosts: p, navSeries: s };
  } catch {
    // Build-time prerender can run without a reachable database.
    return { navPosts: [], navSeries: [] };
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { navPosts, navSeries } = await getNavData();

  return (
    <>
      {/* Applies the stored theme before first paint. Without it, every admin
          navigation flashes the light palette for one frame. The injected
          string is a fixed literal with no input in it. */}
      <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      <ThemeProvider>
        <ToastProvider>
          <div className="flex h-screen overflow-hidden bg-md-background font-sans text-md-on-background">
            <AdminNav posts={navPosts} series={navSeries} />
            <AdminShellClient posts={navPosts} series={navSeries}>
              {children}
            </AdminShellClient>
          </div>
        </ToastProvider>
      </ThemeProvider>
    </>
  );
}
