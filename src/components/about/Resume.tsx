import { Icon } from "@/components/ui/Icon";
import { SOCIAL_PROFILES } from "@/lib/identity";
import { EXPERIENCE } from "@/lib/resume";
import Image from "next/image";
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

// Experience — the "proof" half of the About page. Server-rendered (good for
// crawlers); tenure durations are computed live so they never go stale.
export default function Resume() {
  const now = new Date();

  return (
    // Cung 560px va cung mx-auto voi khoi tieu su ngay tren. Thieu mx-auto thi
    // phan Experience tut ve mep trai trong khi ca nua trang tren can giua —
    // do o 1440px: tieu su bat dau tu 441, Experience tu 198.
    <div className="mx-auto max-w-[560px] mt-16 md:mt-20">
      <section className="animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-backwards">
        <SectionLabel>Experience</SectionLabel>
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
                        <li key={role.title} className="relative pl-6">
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
      </section>
    </div>
  );
}
