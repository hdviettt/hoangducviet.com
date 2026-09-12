import { Icon } from "@/components/ui/Icon";
import { IDENTITY, SOCIAL_PROFILES } from "@/lib/identity";
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
    <section className="work-breakout pt-12 pb-8 sm:pt-14 md:pb-10 md:pt-16">
      <div className="site-grid items-start">
        {/* Identity, on the page's own grid rather than centred in the middle
            of it. Centred, this block invented two left edges nothing else
            used — the section wrapper and the text inside it — and it was the
            only thing on the homepage that did not line up with anything.
            Photo and name take the first column, the bio and contacts the
            other two, which is the same shape every band below it uses. */}
        <div className="col-1">
          <div className="flex flex-col items-start gap-4 sm:gap-5 animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-backwards">
            {imageUrl && (
              <Image
                src={imageUrl}
                alt={name || "Profile"}
                width={320}
                height={320}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-cover rounded-full ring-1 ring-md-outline-variant shrink-0"
                priority
              />
            )}
            <div className="min-w-0">
              {name && (
                <h1 className="text-[1.4375rem] leading-8 sm:text-[1.75rem] sm:leading-9 md:text-[2rem] md:leading-[1.17] font-normal tracking-tight text-md-on-surface">
                  {name}
                </h1>
              )}
            </div>
          </div>
        </div>

        <div className="col-2">
          {description &&
            description.replace(/<[^>]*>/g, "").trim().length > 0 && (
              <div
                className="text-md-on-surface-variant [&_a]:text-primary [&_a]:no-underline [&_a:hover]:underline [&_p]:text-[0.9375rem] [&_p]:leading-7 [&_p]:mb-3 [&_p:last-child]:mb-0 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-150 fill-mode-backwards"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            )}

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200 fill-mode-backwards">
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
            {/* Gach ngan cach chi co nghia khi email nam cung dong voi day
                icon. Tren mobile email xuong dong, nen no thanh mot vach dung
                lo lung o cuoi hang icon. */}
            <span className="hidden h-4 w-px bg-md-outline-variant sm:block" />
            <a
              href={`mailto:${IDENTITY.email}`}
              className="inline-flex items-center gap-1.5 text-[0.8125rem] leading-5 text-md-on-surface-variant hover:text-primary transition-colors duration-200 ease-md-standard"
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
