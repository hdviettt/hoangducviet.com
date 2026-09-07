import MarkdownContent from "@/components/content/MarkdownContent";
import ProfileHero from "@/components/layout/ProfileHero";
import { IDENTITY } from "@/lib/identity";
import { createAboutPageSchema } from "@/lib/jsonld";
import { profileImages } from "@/lib/og";
import { getProfile } from "@/lib/profile";
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

  // Than trang About giong het than mot bai viet: markdown trong CSDL, sua o
  // /admin -> Settings -> Body, render qua dung MarkdownContent va dung lop
  // .article-content. Nghia la moi thu dung duoc trong bai viet cung dung duoc
  // o day — tieu de, danh sach, bang, khoi ```render```, va widget
  // ```widget:career``` de dat bieu do su nghiep vao bat cu cho nao.
  //
  // KHONG co ban du phong trong code. O Body rong thi trang khong co than bai,
  // dung nhu vay. Truoc day o day co mot ban hardcode nhay vao thay the, nen
  // xoa noi dung tren CMS ma trang gan nhu khong doi — dung cai Viet phat hien
  // va yeu cau go.
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
    </div>
  );
}
