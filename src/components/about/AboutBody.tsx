import CareerShape from "@/components/about/CareerShape";
import { Icon } from "@/components/ui/Icon";
import { KitDots } from "@/components/work/StackChips";
import type { ProjectLogo } from "@/db/schema";
import {
  CERTS_LINE,
  CLAIMS,
  FILTERS,
  LOOKING_FOR_LEAD,
  STORY,
} from "@/lib/about";
import { SOCIAL_PROFILES } from "@/lib/identity";
import {
  CERTIFICATIONS,
  CV_URL,
  EDUCATION,
  EXPERIENCE,
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

/** Cot chu hep, dung cho phan ho so. */
function Column({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-[560px]">{children}</div>;
}

// Trang About, viet nhu mot LAP LUAN chu khong phai mot ban kiem ke.
//
// Ban truoc chay theo dung thu tu cua LinkedIn: bang so, kinh nghiem, tui cong
// cu, hoc van, chung chi. Doc het thi biet nguoi nay da lam gi, nhung khong
// biet vi sao nen tin, va khong biet ho dang di dau — trong khi bang chung cho
// ca hai deu nam san tren chinh site nay.
//
// Thu tu moi bam theo dung cach Viet viet bai: neu y -> dan chung -> he qua.
//   1. Cau chuyen — ba doan, va doan giua la cau lam doi nghia ca trang.
//   2. Bieu do su nghiep — duoc keo len lam neo thi giac, vi chinh no chung
//      minh cau do.
//   3. Ba cau khang dinh, moi cau kem duong dan sang trang chung minh no.
//   4. Dieu dang tim, viet cho nguoi doc dang can quyet dinh co lien he khong.
//   5. Ho so — van con, nhung xuong cuoi, vi no la phan it thuyet phuc nhat.
export default function AboutBody({
  toolkit,
}: {
  toolkit?: { models: ProjectLogo[]; stack: ProjectLogo[] };
}) {
  const now = new Date();

  return (
    <div className="mx-auto max-w-[880px] mt-14 md:mt-16">
      {/* ---------------------------------------------------------- 1. story */}
      <section className="mx-auto max-w-[620px] animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-backwards">
        {STORY.map((p, i) => (
          <p
            key={p.slice(0, 40)}
            className={
              i === 1
                ? "mt-6 text-[19px] leading-[31px] font-medium text-md-on-surface"
                : "mt-6 first:mt-0 text-[17px] leading-[29px] text-md-on-surface-variant"
            }
          >
            {p}
          </p>
        ))}
      </section>

      {/* ------------------------------------------------- 2. career shape */}
      {/* Doan thu hai o tren noi "moi vai tro nam trong thanh dai hoc"; day la
          cho chung minh no. Truoc kia bieu do nay bi ket giua bang so va danh
          sach kinh nghiem, mo nhat va cao 20px. */}
      <section className="mt-12 md:mt-14">
        <CareerShape />
      </section>

      {/* --------------------------------------------------------- 3. claims */}
      <section className="mt-16 border-t border-md-outline-variant pt-12 md:mt-20">
        <div className="grid gap-x-10 gap-y-12 md:grid-cols-3">
          {CLAIMS.map((c) => (
            <div key={c.claim}>
              <h3 className="text-[19px] leading-[27px] font-medium tracking-[-0.01em] text-md-on-surface">
                {c.claim}
              </h3>
              <p className="mt-3 text-[14.5px] leading-[23px] text-md-on-surface-variant">
                {c.body}
              </p>
              <ul className="mt-4 space-y-1">
                {c.figures.map((f) => (
                  <li
                    key={f}
                    className="text-[13px] leading-[20px] text-md-on-surface tabular-nums"
                  >
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={c.proof.href}
                className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-primary no-underline hover:underline"
              >
                {c.proof.label}
                <Icon name="arrow_forward" size={15} aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------- 4. looking for */}
      <section className="mt-16 border-t border-md-outline-variant pt-12 md:mt-20">
        <SectionLabel>What I am looking for</SectionLabel>
        <p className="max-w-[620px] text-[19px] leading-[31px] text-md-on-surface">
          {LOOKING_FOR_LEAD}
        </p>
        <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {FILTERS.map((f) => (
            <div key={f.title}>
              <dt className="text-[15px] font-medium leading-[22px] text-md-on-surface">
                {f.title}
              </dt>
              <dd className="mt-1.5 text-[14.5px] leading-[23px] text-md-on-surface-variant">
                {f.body}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a
            href={CV_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="md-btn md-btn-outlined md-btn-pill no-underline"
          >
            <Icon name="picture_as_pdf" size={20} aria-hidden="true" />
            Download CV
          </a>
          <a
            href={LINKEDIN}
            target="_blank"
            rel="noopener noreferrer"
            className="md-btn md-btn-text md-btn-pill no-underline"
          >
            LinkedIn
            <Icon name="open_in_new" size={16} aria-hidden="true" />
          </a>
        </div>
      </section>

      {/* --------------------------------------------------------- 5. record */}
      <section className="mt-16 border-t border-md-outline-variant pt-12 md:mt-20">
        <Column>
          <SectionLabel>The record</SectionLabel>

          <div className="space-y-12">
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

          <div className="mt-12 space-y-8">
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

          {/* Chung chi gom thanh mot dong. Ban truoc ket ca trang bang danh
              sach nam chung chi — ket bang credential la tu mau thuan voi mot
              trang ca doan tren deu dua vao so lieu cu the. */}
          {CERTIFICATIONS.length > 0 && (
            <p className="mt-12 md-body-medium text-md-on-surface-variant">
              {CERTS_LINE}
            </p>
          )}

          {toolkit &&
            (toolkit.models.length > 0 || toolkit.stack.length > 0) && (
              <div className="mt-12">
                <KitDots
                  models={toolkit.models}
                  stack={toolkit.stack}
                  maxModels={6}
                  maxStack={12}
                />
                <p className="mt-5 md-body-medium text-md-on-surface-variant">
                  Read off the project pages, ordered by how many of them use
                  it. Nothing here is a tool I have only read about.
                </p>
              </div>
            )}
        </Column>
      </section>
    </div>
  );
}
