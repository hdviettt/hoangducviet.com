import { Chips } from "@/components/work/StackChips";
import type {
  ProjectFeature,
  ProjectLogo,
  ProjectStackGroup,
} from "@/db/schema";
import type { ReactNode } from "react";

// The "reference" block of a project deep-dive: what it does (features) and
// what it is built with (grouped tech). Kept separate from the narrative so the
// story reads first and the spec sits below it.

function SubHead({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-5 text-[12.5px] font-medium uppercase tracking-[0.08em] text-md-on-surface-variant">
      {children}
    </h3>
  );
}

function Features({ features }: { features: ProjectFeature[] }) {
  return (
    <dl className="space-y-5">
      {features.map((f) => (
        <div key={f.name} className="flex gap-3">
          <span
            className="mt-[8px] h-[7px] w-[7px] shrink-0 rounded-[2px] bg-primary"
            aria-hidden="true"
          />
          <div>
            <dt className="text-[14.5px] font-medium leading-snug text-md-on-surface">
              {f.name}
            </dt>
            <dd className="mt-1 text-[13.5px] leading-[1.5] text-md-on-surface-variant">
              {f.desc}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  );
}

function StackGroupBlock({
  label,
  items,
}: {
  label: string;
  items: ProjectLogo[];
}) {
  return (
    <div>
      <div className="mb-2 text-[11.5px] text-md-on-surface-variant opacity-80">
        {label}
      </div>
      <Chips items={items} />
    </div>
  );
}

export default function ProjectReference({
  features,
  stack,
  models,
}: {
  features: ProjectFeature[];
  stack: ProjectStackGroup[];
  models: ProjectLogo[];
}) {
  const hasStack = models.length > 0 || stack.length > 0;
  if (features.length === 0 && !hasStack) return null;
  return (
    <div className="grid gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
      {features.length > 0 && (
        <div>
          <SubHead>What it does</SubHead>
          <Features features={features} />
        </div>
      )}
      {hasStack && (
        <div>
          <SubHead>Built with</SubHead>
          <div className="flex flex-col gap-4">
            {models.length > 0 && (
              <StackGroupBlock label="Models" items={models} />
            )}
            {stack.map((g) => (
              <StackGroupBlock key={g.group} label={g.group} items={g.items} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
