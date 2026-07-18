import { Icon } from "@/components/ui/Icon";
import { IDENTITY, SEONGON_EXPERT_URL, SOCIAL_PROFILES } from "@/lib/identity";
// Brand marks aren't in Material Symbols — keep lucide for these four only.
import { Facebook, Github, Instagram, Linkedin } from "lucide-react";
import Image from "next/image";

// lucide brand marks keyed by the identity.ts social labels (UI layer only).
const SOCIAL_ICONS = {
  GitHub: Github,
  Facebook,
  Instagram,
  LinkedIn: Linkedin,
} as const;

interface ProfileHeroProps {
  name?: string | null;
  description?: string | null; // HTML bio
  imageUrl?: string | null;
}

// The identity block at the top of BOTH the homepage and the About page, so
// moving between them reads as one continuous surface — the About page simply
// expands below it.
export default function ProfileHero({
  name,
  description,
  imageUrl,
}: ProfileHeroProps) {
  return (
    <section className="pt-10 sm:pt-12 md:pt-16 pb-10 md:pb-14">
      <div>
        {/* Identity — photo sits beside the name instead of stacking a full
            screen height; bio stays a tight measure underneath. */}
        <div className="max-w-[640px]">
          <div className="flex items-center gap-5 sm:gap-7 mb-6 animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-backwards">
            {imageUrl && (
              <Image
                src={imageUrl}
                alt={name || "Profile"}
                width={320}
                height={320}
                className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-cover rounded-full ring-1 ring-md-outline-variant shrink-0"
                priority
              />
            )}
            <div className="min-w-0">
              {name && (
                <h1 className="text-[34px] leading-10 sm:text-[42px] sm:leading-[48px] md:text-[48px] md:leading-[54px] font-normal tracking-tight text-md-on-surface mb-3">
                  {name}
                </h1>
              )}
              <a
                href={SEONGON_EXPERT_URL}
                target="_blank"
                rel="noopener noreferrer"
                title="View my profile at SEONGON"
                className="group inline-flex items-center gap-2 rounded-full border border-md-outline-variant bg-md-surface-container-low py-1.5 pl-2 pr-3.5 hover:border-md-primary/40 hover:bg-md-surface-container transition-colors duration-200 ease-md-standard"
              >
                <Image
                  src="/seongon-mark.png"
                  alt="SEONGON logo"
                  width={1276}
                  height={1252}
                  className="w-5 h-5 object-contain"
                />
                <span className="md-label-large text-md-on-surface">
                  {IDENTITY.jobTitle}{" "}
                  <span className="text-md-on-surface-variant">at</span> SEONGON
                </span>
              </a>
            </div>
          </div>

          {description &&
            description.replace(/<[^>]*>/g, "").trim().length > 0 && (
              <div
                className="text-md-on-surface [&_a]:text-primary [&_a]:no-underline [&_a:hover]:underline [&_p]:text-lg [&_p]:leading-7 [&_p]:mb-4 [&_p:last-child]:mb-0 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-150 fill-mode-backwards"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            )}

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-250 fill-mode-backwards">
            {SOCIAL_PROFILES.map(({ href, label }) => {
              // href/label come from identity.ts so the visible links and the
              // JSON-LD sameAs stay in lockstep; only the icon lives in the UI.
              const Brand = SOCIAL_ICONS[label];
              return (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-md-on-surface-variant hover:text-primary transition-colors duration-200 ease-md-standard"
                  aria-label={label}
                >
                  <Brand className="w-5 h-5" />
                </a>
              );
            })}
            <span className="w-px h-4 bg-md-outline-variant" />
            <a
              href={`mailto:${IDENTITY.email}`}
              className="inline-flex items-center gap-1.5 md-body-medium text-md-on-surface-variant hover:text-primary transition-colors duration-200 ease-md-standard"
            >
              <Icon name="mail" size={18} />
              <span>{IDENTITY.email}</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
