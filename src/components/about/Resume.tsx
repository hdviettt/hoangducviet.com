import CareerShape from "@/components/about/CareerShape";
import { Icon } from "@/components/ui/Icon";
import { KitDots } from "@/components/work/StackChips";
import type { ProjectLogo } from "@/db/schema";
import { SOCIAL_PROFILES } from "@/lib/identity";
import {
  CERTIFICATIONS,
  CV_URL,
  EDUCATION,
  EXPERIENCE,
  LOOKING_FOR,
  STATS,
  roleId,
} from "@/lib/resume";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const LINKEDIN =
  SOCIAL_PROFILES.find((p) => p.label === "LinkedIn")?.href ??
  "https://www.linkedin.com/in/hdviet/";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function ym(s: string): { y: number; m: number } {
  const [y, m] = s.split("-").map(Number);
  return { y, m };
}

function fmtMonth(s: string): string {
  const { y, m } = ym(s);
  return `${MONTHS[m - 1]} ${y}`;
}

// Inclusive month count, matching how LinkedIn tallies tenure (both endpoint
// months count). `now` is passed in so the whole page shares one clock.
function monthsInclusive(
  start: string,
  end: string | undefined,
  now: Date,
): number {
  const s = ym(start);
  const e = end ? ym(end) : { y: now.getFullYear(), m: now.getMonth() + 1 };
  return (e.y - s.y) * 12 + (e.m - s.m) + 1;
}

function fmtDuration(months: number): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (y) parts.push(`${y} yr${y > 1 ? "s" : ""}`);
  if (m) parts.push(`${m} mo${m > 1 ? "s" : ""}`);
  return parts.join(" ") || "1 mo";
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="md-label-large uppercase tracking-widest text-md-on-surface-variant mb-7">
      {children}
    </h2>
  );
}

// Cot chu: cung 560px va cung tam voi tieu su phia tren. Cac khoi do hoa —
// bang so va bieu do thoi gian — duoc rong het 880px cua muc nay, vi chung la
// thu duy nhat tren trang can be ngang de doc duoc.
function Column({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-[560px]">{children}</div>;
}

// The About page as a live version of the CV, not a transcription of it.
//
// Ba thu ma to giay khong lam duoc, va la ly do trang nay ton tai:
//   1. Do dai thoi gian duoc VE ra theo ty le, nen doc duoc ngay ai o dau bao
//      lau — va thay duoc ca hai chong len nhau (CareerShape).
//   2. Mot cau tuyen bo co the bam vao de sang thang trang mo ta chinh cai no
//      noi toi (`proof` trong resume.ts).
//   3. Moi con so thoi gian tu tinh lai theo dong ho that, khong bao gio cu.
export default function Resume({
  toolkit,
}: {
  toolkit?: { models: ProjectLogo[]; stack: ProjectLogo[] };
}) {
  const now = new Date();

  return (
    <div className="mx-auto max-w-[880px] mt-16 md:mt-20">
      <Column>
        <section className="animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-backwards">
          <p className="text-[17px] leading-[28px] text-md-on-surface">
            {LOOKING_FOR}
          </p>
          <a
            href={CV_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="md-btn md-btn-outlined md-btn-pill mt-6 no-underline"
          >
            <Icon name="picture_as_pdf" size={20} aria-hidden="true" />
            Download CV
          </a>
        </section>
      </Column>

      {/* Bang so, dung dung ngon ngu cua bang so tren trang du an: con so to,
          nhan nho ben duoi. Hai trang noi ve cung mot cong viec thi phai trinh
          bay so lieu giong nhau. */}
      <section className="mt-14 border-t border-md-outline-variant pt-9 md:mt-16">
        <dl className="grid grid-cols-2 gap-x-8 gap-y-9 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label}>
              <dd className="text-[34px] font-normal leading-none tracking-[-0.02em] text-md-on-surface tabular-nums sm:text-[40px]">
                {s.value}
              </dd>
              <dt className="mt-3 text-[13.5px] leading-[1.45] text-md-on-surface-variant">
                {s.label}
              </dt>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-16 md:mt-20">
        <Column>
          <SectionLabel>Experience</SectionLabel>
        </Column>

        <CareerShape />

        <Column>
          <div className="mt-12 space-y-12">
            {EXPERIENCE.map((company) => {
              const earliest = company.roles[company.roles.length - 1].start;
              const latestEnd = company.roles[0].end;
              const companyDuration = fmtDuration(
                monthsInclusive(earliest, latestEnd, now),
              );
              return (
                <div key={company.company} className="flex gap-4">
                  <a
                    href={company.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0"
                    aria-label={company.company}
                  >
                    <span className="flex items-center justify-center w-11 h-11 rounded-xl border border-md-outline-variant bg-md-surface-container-low">
                      <Image
                        src={company.logo}
                        alt={`${company.company} logo`}
                        width={44}
                        height={44}
                        className="w-6 h-6 object-contain"
                      />
                    </span>
                  </a>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <a
                        href={company.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="md-title-medium text-md-on-surface hover:text-primary transition-colors"
                      >
                        {company.company}
                      </a>
                      <span className="md-body-small text-md-on-surface-variant tabular-nums">
                        · {companyDuration}
                      </span>
                    </div>
                    {company.location && (
                      <p className="md-body-small text-md-on-surface-variant">
                        {company.location}
                      </p>
                    )}

                    <ol className="mt-5 ml-1 border-l border-md-outline-variant space-y-6">
                      {company.roles.map((role) => {
                        const period = `${fmtMonth(role.start)} — ${
                          role.end ? fmtMonth(role.end) : "Present"
                        }`;
                        const length = fmtDuration(
                          monthsInclusive(role.start, role.end, now),
                        );
                        return (
                          <li
                            key={role.title}
                            id={roleId(role.title)}
                            className="relative scroll-mt-24 pl-6"
                          >
                            <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-md-surface border-2 border-md-outline" />
                            <h3 className="md-body-large font-medium text-md-on-surface leading-snug">
                              {role.title}
                            </h3>
                            <p className="md-body-small text-md-on-surface-variant tabular-nums">
                              {role.type} · {period} · {length}
                            </p>
                            {role.note && (
                              <p className="mt-1.5 md-body-medium text-md-on-surface-variant">
                                {role.note}
                              </p>
                            )}
                            {role.highlights && (
                              <ul className="mt-2.5 space-y-2">
                                {role.highlights.map((h) => (
                                  <li
                                    key={h.text}
                                    className="relative pl-4 md-body-medium text-md-on-surface-variant before:absolute before:left-0 before:top-[10px] before:h-1 before:w-1 before:rounded-full before:bg-md-outline"
                                  >
                                    {h.text}
                                    {h.proof && (
                                      // Cai mot to CV khong lam duoc: doc xong
                                      // cau nay thi mo duoc chinh thu no noi toi.
                                      <Link
                                        href={`/work/${h.proof.slug}`}
                                        className="ml-2 inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-md-outline-variant px-2.5 py-0.5 align-[1px] text-[12.5px] font-medium text-md-on-surface no-underline transition-colors hover:border-primary hover:text-primary"
                                      >
                                        {h.proof.label}
                                        <Icon
                                          name="arrow_forward"
                                          size={13}
                                          aria-hidden="true"
                                        />
                                      </Link>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                </div>
              );
            })}
          </div>

          <a
            href={LINKEDIN}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-1.5 md-label-large text-md-on-surface-variant hover:text-primary transition-colors"
          >
            Full experience on LinkedIn
            <Icon name="open_in_new" size={16} />
          </a>
        </Column>
      </section>

      <Column>
        {toolkit && (toolkit.models.length > 0 || toolkit.stack.length > 0) && (
          <section className="mt-16 md:mt-20">
            <SectionLabel>Toolkit</SectionLabel>
            <KitDots
              models={toolkit.models}
              stack={toolkit.stack}
              maxModels={9}
              maxStack={20}
            />
            <p className="mt-6 md-body-medium text-md-on-surface-variant">
              Read off the project pages, ordered by how many of them use it.
              Nothing here is a tool I have only read about.
            </p>
          </section>
        )}

        <section className="mt-16 md:mt-20">
          <SectionLabel>Education</SectionLabel>
          <div className="space-y-8">
            {EDUCATION.map((e) => (
              <div key={e.school}>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="md-body-large font-medium text-md-on-surface leading-snug">
                    {e.url ? (
                      <a
                        href={e.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                      >
                        {e.school}
                      </a>
                    ) : (
                      e.school
                    )}
                  </h3>
                  <span className="shrink-0 md-body-small text-md-on-surface-variant tabular-nums">
                    {e.start} — {e.end}
                  </span>
                </div>
                <p className="mt-1 md-body-medium text-md-on-surface-variant">
                  {e.qualification}
                  {e.location ? ` · ${e.location}` : ""}
                </p>
                {e.note && (
                  <p className="mt-1 md-body-medium text-md-on-surface-variant">
                    {e.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 md:mt-20">
          <SectionLabel>Certifications</SectionLabel>
          <ul className="space-y-5">
            {CERTIFICATIONS.map((c) => (
              <li
                key={c.name}
                className="flex items-baseline justify-between gap-4"
              >
                <div className="min-w-0">
                  <span className="md-body-large text-md-on-surface leading-snug">
                    {c.name}
                  </span>
                  {/* Ma tra cuu: mot chung chi khong kem ma thi khong ai kiem
                      duoc. CV in ra co ma nay, trang web thi truoc gio giau. */}
                  {c.credentialId && (
                    <p className="mt-0.5 font-mono text-[12px] leading-4 text-md-on-surface-variant">
                      {c.credentialId}
                    </p>
                  )}
                </div>
                <span className="shrink-0 md-body-small text-md-on-surface-variant">
                  {c.issuer}
                  {c.date ? ` · ${c.date}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </Column>
    </div>
  );
}
