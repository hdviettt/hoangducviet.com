"use client";

import { Icon } from "@/components/ui/Icon";
import { CERTIFICATIONS, EDUCATION, EXPERIENCE, roleId } from "@/lib/resume";
import Image from "next/image";
import Link from "next/link";

// Khoi ho so: kinh nghiem, hoc van, chung chi.
//
// Truoc day khoi nay duoc dong cung vao trang About, nen xoa sach o Body tren
// CMS thi trang van gan nhu khong doi. Gio no la mot widget: chi hien khi
// duoc dat vao bai bang ```widget:record```.
//
// Ly do van doc du lieu tu `lib/resume.ts` chu khong phai tu CMS: moi do dai
// thoi gian o day duoc tinh lai theo dong ho that ("1 yr 1 mo" tu doi khi sang
// thang). Chep chung thanh chu la mat tinh nang do va bat dau cu tu ngay dang.

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

// Dem thang bao gom ca hai dau, giong cach LinkedIn tinh tham nien.
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

export default function Record() {
  const now = new Date();
  const issuers = [...new Set(CERTIFICATIONS.map((c) => c.issuer))];

  return (
    <div className="about-record my-10">
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
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-md-outline-variant bg-md-surface-container-low">
                  <Image
                    src={company.logo}
                    alt={`${company.company} logo`}
                    width={44}
                    height={44}
                    className="h-6 w-6 object-contain"
                  />
                </span>
              </a>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <a
                    href={company.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="md-title-medium text-md-on-surface transition-colors hover:text-primary"
                  >
                    {company.company}
                  </a>
                  <span className="md-body-small tabular-nums text-md-on-surface-variant">
                    · {companyDuration}
                  </span>
                </div>
                {company.location && (
                  <p className="md-body-small text-md-on-surface-variant">
                    {company.location}
                  </p>
                )}

                <ol className="mt-5 ml-1 space-y-6 border-l border-md-outline-variant">
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
                        <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-md-outline bg-md-surface" />
                        <h3 className="md-body-large font-medium leading-snug text-md-on-surface">
                          {role.title}
                        </h3>
                        <p className="md-body-small tabular-nums text-md-on-surface-variant">
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
              <h3 className="md-body-large font-medium leading-snug text-md-on-surface">
                {e.url ? (
                  <a
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-primary"
                  >
                    {e.school}
                  </a>
                ) : (
                  e.school
                )}
              </h3>
              <span className="shrink-0 md-body-small tabular-nums text-md-on-surface-variant">
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

      {CERTIFICATIONS.length > 0 && (
        <p className="mt-12 md-body-medium text-md-on-surface-variant">
          Certified by {issuers.join(", ")}. Credential IDs are on the CV.
        </p>
      )}
    </div>
  );
}
