import TechStack from "@/components/about/TechStack";
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
    experience?: import("@/db/schema").ExperienceCompany[];
    name?: string | null;
    description?: string | null;
    image?: string | null;
    aboutHtml?: string | null;
    headline?: string | null;
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
  const jsonLd = createAboutPageSchema({ jobTitle: profile?.headline });

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
        jobTitle={profile?.headline}
      />

      {/* Than bai, dung ong render cua bai viet. Khong con `mx-auto`: cot doc
          van rong 620px, nhung no bat dau o mep trai cua trang chu khong phai
          can giua, de ba khoi cua trang About cung mot mep. */}
      {hasBody && (
        <section className="work-breakout mt-14 md:mt-16">
          {/* The measure goes on an inner div, not on the breakout itself.
              `work-breakout` centres what it wraps -- margin-left:50% plus a
              -50% translate -- so putting a 620px max-width on the same
              element centred the column inside the 1188px row and started it
              at x=410 while the hero and the stack above it both started at
              126. The comment here used to claim the opposite. */}
          <div className="max-w-[38.75rem]">
            <div className="article-content">
              {/* The experience timeline is drawn from the database, not from
                the fence the author typed, so the page hands it down. See
                MarkdownContent's `widgetData`. */}
              <MarkdownContent
                content={body}
                widgetData={{
                  experience: { companies: profile?.experience ?? [] },
                }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Cai stack xuong cuoi trang.
          Truoc no nam ngay duoi phan gioi thieu, voi ly do la du lieu thi doc
          nhanh hon van xuoi nen cho di truoc. Nhung cai nguoi ta den trang
          About de doc la qua trinh lam viec, va mot bang cong nghe chen vao
          giua tieu su va dong thoi gian la thu duy nhat dung giua hai thu von
          lien mach. Nguoi doc muon xem Viet dung gi van cuon xuong duoc. */}
      <TechStack />
    </div>
  );
}
