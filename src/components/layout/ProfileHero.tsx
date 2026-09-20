import { Icon } from "@/components/ui/Icon";
import { IDENTITY, SOCIAL_PROFILES } from "@/lib/identity";
// Brand marks aren't in Material Symbols — keep lucide for these four only.
import { Facebook, Github, Instagram, Linkedin } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

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
  /**
   * The role line under the name, from the CMS (`profile.headline`).
   *
   * Falls back to IDENTITY.jobTitle, which is also what the entity graph
   * emits, so an empty field shows the same words as before rather than a
   * gap. A " / " in the string still splits into two halves.
   */
  jobTitle?: string | null;
  /**
   * Optional second column, beside the identity stack rather than under it.
   *
   * The homepage puts a condensed career timeline here. The comment below
   * argues against two columns and it is still right about the thing it was
   * arguing against — splitting the identity block itself, which pushed the
   * name below the bio. This is a different split: the identity stack stays
   * whole on the left and something unrelated sits next to it, which is only
   * possible at all because that stack is capped at 36rem and the row is
   * 1188.
   */
  aside?: ReactNode;
}

// The identity block at the top of BOTH the homepage and the About page, so
// moving between them reads as one continuous surface — the About page simply
// expands below it.
export default function ProfileHero({
  name,
  description,
  imageUrl,
  jobTitle,
  aside,
}: ProfileHeroProps) {
  // "Agentic AI Leader / Engineer" -> the two halves either side of the slash,
  // so the separator can be set quieter than the words it separates without
  // the string being written twice.
  const jobTitleParts = (jobTitle?.trim() || IDENTITY.jobTitle).split(" / ");

  return (
    <section className="work-breakout pt-12 pb-8 sm:pt-14 md:pb-10 md:pt-16">
      <div
        className={
          aside
            ? "grid items-start gap-10 lg:grid-cols-[minmax(0,36rem)_minmax(0,1fr)] lg:gap-16"
            : "max-w-[36rem]"
        }
      >
        {/* One left-aligned stack, not two columns.
            Split across the grid, the photo pushed the name 132px below the
            first line of the bio — so the most important words in the block
            sat under the least important, and the eye had nowhere to enter.
            The bio also ran 859px, which is 110 characters a line, on a site
            whose article measure was just brought down to 75.
            It is also one two-column relationship fewer at the top of a page
            that already has two more underneath, each splitting on different
            things. */}
        <div>
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
              {/* The role, in the name's ink and the name's weight, one size
                  step below it.

                  What was here separated the role from the bio with weight
                  alone: 500 against 400, at 15.3px against 13.5px, in the same
                  grey. Two tiers 1.8px and zero contrast apart do not read as
                  two tiers, so the role came out looking like a bolded first
                  line of the bio. Worse, 500 against the name's 400 put the
                  heavier stroke on the less important line.

                  Colour separates the role from the bio now, and size
                  separates it from the name, so weight is free to stay at 400
                  everywhere and nothing is inverted. The slash drops to the
                  bio's grey: quieter than the two halves it joins, without
                  disappearing the way the outline colour did. */}
              <p className="mt-1.5 text-[1.0625rem] leading-6 tracking-[-0.02em] text-md-on-surface sm:mt-2 md:text-[1.2rem] md:leading-7">
                {jobTitleParts[0]}
                {/* Only when there are two halves. A title typed without a
                    slash used to render the separator and then nothing after
                    it. */}
                {jobTitleParts.length > 1 && (
                  <>
                    <span className="mx-[0.28em] text-md-on-surface-variant">
                      /
                    </span>
                    {jobTitleParts.slice(1).join(" / ")}
                  </>
                )}
              </p>
            </div>
          </div>
          {description &&
            description.replace(/<[^>]*>/g, "").trim().length > 0 && (
              <div
                className="text-md-on-surface-variant [&_a]:text-primary [&_a]:no-underline [&_a:hover]:underline mt-5 [&_p]:text-[0.9375rem] [&_p]:leading-7 [&_p]:mb-3 [&_p:last-child]:mb-0 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-150 fill-mode-backwards"
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

        {/* Below lg this lands under the identity stack rather than beside it:
            at 1024 the two columns would be about 470px each, and the bio
            would be down to 60 characters a line.

            The offset lines the column up with the name rather than with the
            photo. Level with the photo it started against a 112px circle and
            the first thing in it, a company row, had nothing to be level with
            — the two columns began at the same y and agreed on nothing. The
            name is the line it should answer.

            8.25rem is the photo plus the gap above the name: md:h-28 is 7rem
            and the stack's sm:gap-5 is 1.25rem. In rem, so it tracks the root
            scale. Only when there is a photo to clear. */}
        {aside && (
          <div className={`min-w-0 ${imageUrl ? "lg:mt-[8.25rem]" : ""}`}>
            {aside}
          </div>
        )}
      </div>
    </section>
  );
}
