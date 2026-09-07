import AboutBody from "@/components/about/AboutBody";
import MarkdownContent from "@/components/content/MarkdownContent";
import ProfileHero from "@/components/layout/ProfileHero";
import type { ProjectLogo } from "@/db/schema";
import { IDENTITY } from "@/lib/identity";
import { createAboutPageSchema } from "@/lib/jsonld";
import { profileImages } from "@/lib/og";
import { getProfile } from "@/lib/profile";
import { getProjects } from "@/lib/projects";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://hoangducviet.com";
  const title = `About - ${IDENTITY.name}`;
  // Same portrait the homepage shares with. A page about a person that shares
  // with no picture is the one card where the picture is the whole point.
  let images: ReturnType<typeof profileImages> = [];
  try {
    const profileData = await getProfile();
    images = profileImages(profileData?.[0]?.image, baseUrl, IDENTITY.name);
  } catch {
    // Metadata must not take the page down when the DB is unreachable.
  }
  return {
    title,
    description: IDENTITY.description,
    alternates: { canonical: "/about" },
    openGraph: {
      title,
      description: IDENTITY.description,
      url: `${baseUrl}/about`,
      siteName: IDENTITY.name,
      type: "profile",
      firstName: IDENTITY.givenName,
      lastName: IDENTITY.familyName,
      username: IDENTITY.username,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: IDENTITY.description,
      images: images.map((i) => i.url),
    },
  };
}

export default async function AboutPage() {
  let profile: {
    name?: string | null;
    description?: string | null;
    image?: string | null;
    aboutHtml?: string | null;
  } | null = null;
  try {
    const rows = await getProfile();
    profile = rows[0] ?? null;
  } catch {
    profile = null;
  }

  // Bo cong cu khong go tay o day: no duoc gom tu chinh stack cua cac trang
  // du an, xep theo so du an dung no. Them mot du an la muc nay tu doi — con
  // mot danh sach ky nang go tay thi bat dau cu tu ngay dang len.
  let toolkit: { models: ProjectLogo[]; stack: ProjectLogo[] } = {
    models: [],
    stack: [],
  };
  try {
    const all = await getProjects();
    const tally = (rows: ProjectLogo[][]) => {
      const seen = new Map<string, { item: ProjectLogo; n: number }>();
      for (const row of rows) {
        for (const it of row) {
          const key = it.name.toLowerCase();
          const hit = seen.get(key);
          if (hit) hit.n += 1;
          else seen.set(key, { item: it, n: 1 });
        }
      }
      return [...seen.values()]
        .sort((a, b) => b.n - a.n || a.item.name.localeCompare(b.item.name))
        .map((v) => v.item);
    };
    toolkit = {
      models: tally(all.map((p) => p.models)),
      stack: tally(all.map((p) => p.stack.flatMap((g) => g.items))),
    };
  } catch {
    // Khong co CSDL thi trang van len, chi thieu muc Toolkit.
  }

  // Than trang About giong het than mot bai viet: markdown trong CSDL, sua o
  // /admin -> Settings -> Body, render qua dung MarkdownContent va dung lop
  // .article-content. Nghia la moi thu dung duoc trong bai viet cung dung duoc
  // o day — tieu de, danh sach, bang, khoi ```render```, va widget
  // ```widget:career``` de dat bieu do su nghiep vao bat cu cho nao.
  //
  // `lib/about.ts` o lai lam ban du phong: xoa sach o Body thi no quay lai.
  const body = (profile?.aboutHtml ?? "").trim();
  const hasBody = body.replace(/<[^>]*>/g, "").trim().length > 0;
  const jsonLd = createAboutPageSchema();

  return (
    <div className="pb-16 md:pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Same identity block as the homepage — the About page reads as a
          seamless expansion of the homepage intro. */}
      <ProfileHero
        name={profile?.name}
        description={profile?.description}
        imageUrl={profile?.image ?? null}
      />

      {/* Than bai, dung ong render cua bai viet. */}
      {hasBody && (
        <section className="mx-auto mt-14 max-w-[720px] px-0 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-500 fill-mode-backwards md:mt-16">
          <div className="article-content">
            <MarkdownContent content={body} />
          </div>
        </section>
      )}

      {/* Cau chuyen, bang chung, dieu dang tim, roi moi den ho so. */}
      <AboutBody toolkit={toolkit} hasBody={hasBody} />
    </div>
  );
}
