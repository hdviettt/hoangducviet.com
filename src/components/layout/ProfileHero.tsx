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
    <section className="pt-10 sm:pt-14 md:pt-20 pb-12 md:pb-16">
      <div className="max-w-[560px]">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={name || "Profile"}
            width={320}
            height={320}
            className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 object-cover rounded-full mb-6 md:mb-8 ring-1 ring-md-outline-variant animate-in fade-in zoom-in-95 duration-500 fill-mode-backwards"
            priority
          />
        )}
        {name && (
          <h1 className="text-4xl sm:text-5xl md:text-[48px] md:leading-[56px] font-normal tracking-tight text-md-on-surface mb-3 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100 fill-mode-backwards">
            {name}
          </h1>
        )}
        <a
          href={SEONGON_EXPERT_URL}
          target="_blank"
          rel="noopener noreferrer"
          title="View my profile at SEONGON"
          className="group inline-flex items-center gap-2 rounded-full border border-md-outline-variant bg-md-surface-container-low py-1.5 pl-2 pr-3.5 mb-6 hover:border-md-primary/40 hover:bg-md-surface-container transition-colors duration-200 ease-md-standard animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150 fill-mode-backwards"
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
        {description && description.replace(/<[^>]*>/g, "").trim().length > 0 && (
          <div
            className="text-md-on-surface [&_a]:text-primary [&_a]:no-underline [&_a:hover]:underline [&_p]:text-lg [&_p]:leading-7 [&_p]:mb-4 [&_p:last-child]:mb-0 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-200 fill-mode-backwards"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}
        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300 fill-mode-backwards">
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
    </section>
  );
}
