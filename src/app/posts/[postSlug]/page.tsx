import type { Metadata } from "next";
import Link from "next/link";
import { getGlobalMetadata } from "@/lib/global";
import { getAdjacentPosts, getPostBySlug } from "@/lib/posts";
import MarkdownContent from "@/components/MarkdownContent";

interface PostParams {
  params: { postSlug: string };
}

export async function generateMetadata({
  params,
}: PostParams): Promise<Metadata> {
  try {
    const post = await getPostBySlug(params.postSlug);
    const globalData = await getGlobalMetadata();
    const siteTitle =
      globalData && globalData.length > 0 ? globalData[0].title : "Blog";
    return {
      title: `${post.title} | ${siteTitle}`,
      description: post.description || "",
      openGraph: {
        title: post.title,
        description: post.description || "",
        type: "article",
        images: post.thumbnail ? [{ url: post.thumbnail }] : [],
      },
    };
  } catch {
    return { title: "Post" };
  }
}

export default async function PostPage({ params }: PostParams) {
  let data: any = null;
  let adjacentPosts = { previous: null as any, next: null as any };

  try {
    [data, adjacentPosts] = await Promise.all([
      getPostBySlug(params.postSlug),
      getAdjacentPosts(params.postSlug),
    ]);
  } catch (error) {
    console.error("Error fetching post:", error);
  }

  if (!data) {
    return <p className="text-neutral-500">Post not found</p>;
  }

  return (
    <article>
      <Link
        href="/"
        className="text-sm text-neutral-400 hover:text-neutral-600 mb-8 inline-block"
      >
        ← back
      </Link>

      <header className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">{data.title}</h1>
        <time className="text-sm text-neutral-400" dateTime={data.date_created ?? ""}>
          {data.date_created &&
            new Date(data.date_created).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
        </time>
      </header>

      {data.content && (
        <div className="prose-blog">
          <MarkdownContent content={data.content} />
        </div>
      )}

      {/* Prev / Next */}
      {(adjacentPosts.previous || adjacentPosts.next) && (
        <nav className="mt-12 pt-8 border-t border-neutral-200 flex justify-between text-sm">
          {adjacentPosts.previous ? (
            <Link
              href={`/posts/${adjacentPosts.previous.slug}`}
              className="text-blue-600 hover:underline"
            >
              ← {adjacentPosts.previous.title}
            </Link>
          ) : (
            <span />
          )}
          {adjacentPosts.next ? (
            <Link
              href={`/posts/${adjacentPosts.next.slug}`}
              className="text-blue-600 hover:underline"
            >
              {adjacentPosts.next.title} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </article>
  );
}
