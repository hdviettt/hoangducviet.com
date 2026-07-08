import { Icon } from "@/components/ui/Icon";
import { IDENTITY, SOCIAL_PROFILES } from "@/lib/identity";
import { CERTIFICATIONS, EXPERIENCE } from "@/lib/resume";
import Image from "next/image";
import type { ReactNode } from "react";

const LINKEDIN =
  SOCIAL_PROFILES.find((p) => p.label === "LinkedIn")?.href ??
  "https://www.linkedin.com/in/hdviet/";

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="md-label-large uppercase tracking-widest text-md-on-surface-variant mb-7">
      {children}
    </h2>
  );
}

// Experience + certifications + focus — the "proof" half of the About page.
// Static, server-rendered (good for crawlers), fed from src/lib/resume.ts.
export default function Resume() {
  return (
    <div className="max-w-[640px] mt-16 md:mt-20 space-y-16 md:space-y-20">
      {/* Experience */}
      <section className="animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-backwards">
        <SectionLabel>Experience</SectionLabel>
        <div className="space-y-12">
          {EXPERIENCE.map((company) => (
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
                    · {company.duration}
                  </span>
                </div>
                {company.location && (
                  <p className="md-body-small text-md-on-surface-variant">
                    {company.location}
                  </p>
                )}

                <ol className="mt-5 ml-1 border-l border-md-outline-variant space-y-6">
                  {company.roles.map((role) => (
                    <li key={role.title} className="relative pl-6">
                      <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-md-surface border-2 border-md-outline" />
                      <h3 className="md-body-large font-medium text-md-on-surface leading-snug">
                        {role.title}
                      </h3>
                      <p className="md-body-small text-md-on-surface-variant tabular-nums">
                        {role.type} · {role.period}
                        {role.length ? ` · ${role.length}` : ""}
                      </p>
                      {role.note && (
                        <p className="mt-1.5 md-body-medium text-md-on-surface-variant">
                          {role.note}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
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

      {/* Certifications */}
      <section className="animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-backwards">
        <SectionLabel>Certifications</SectionLabel>
        <div className="grid gap-3 sm:grid-cols-2">
          {CERTIFICATIONS.map((c) => (
            <div
              key={c.name}
              className="rounded-xl border border-md-outline-variant bg-md-surface-container-low p-4 transition-colors hover:border-md-outline"
            >
              <h3 className="md-title-small text-md-on-surface leading-snug">
                {c.name}
              </h3>
              <p className="mt-1 md-body-small text-md-on-surface-variant">
                {c.issuer} · {c.date}
              </p>
              {c.credentialId && (
                <p className="mt-2 md-label-small text-md-on-surface-variant/70">
                  ID: {c.credentialId}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Focus */}
      <section className="animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-backwards">
        <SectionLabel>Focus</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {IDENTITY.knowsAbout.map((topic) => (
            <span
              key={topic}
              className="rounded-full border border-md-outline-variant bg-md-surface-container-low px-3.5 py-1.5 md-label-medium text-md-on-surface-variant"
            >
              {topic}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
