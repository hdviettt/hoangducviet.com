"use client";

import MediaPicker from "@/components/admin/MediaPicker";
import type {
  ExperienceCompany,
  ExperienceHighlight,
  ExperienceRole,
} from "@/db/schema";
import { Link2, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * The career timeline, editable.
 *
 * It used to be a constant in src/lib/resume.ts, which meant a deploy was the
 * only way to change a job title — so it was never changed, and when it was
 * finally checked against the real profile four of its five roles were wrong.
 * This exists so that cannot happen again.
 *
 * Three levels, because the data is three levels: a company holds roles, a
 * role holds result lines, and a result line can carry a link to the project
 * that proves it. Each level can be reordered, because order is content here —
 * the timeline draws roles newest-first and derives the company's total span
 * from the first and last of them.
 *
 * Layout rule, and the reason every button sits on the right: each field at
 * each level starts at the same x. The first version put the reorder arrows
 * before the title input, which pushed that one input 72px in while the row
 * beneath it stayed at the card edge. Three ragged left edges per card, and
 * nothing to scan down. Controls belong in one cluster at the end of the row;
 * content belongs on the margin.
 */

const KINDS = [
  ["work", "Work"],
  ["education", "School"],
] as const;

const btn =
  "shrink-0 h-8 w-8 inline-flex items-center justify-center rounded-lg text-md-on-surface-variant hover:bg-md-on-surface/[0.08] hover:text-md-on-surface disabled:opacity-25 disabled:hover:bg-transparent";
const delBtn =
  "shrink-0 h-8 w-8 inline-flex items-center justify-center rounded-lg text-md-on-surface-variant hover:bg-md-error/10 hover:text-md-error";

function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const next = arr.slice();
  const [it] = next.splice(from, 1);
  next.splice(to, 0, it);
  return next;
}

/**
 * A textarea that is as tall as its text.
 *
 * These hold result lines that run to three or four lines, and a fixed box
 * means scrolling inside a small window to read what you already wrote. The
 * height is set from scrollHeight on every change and once on mount, so an
 * existing entry opens at full height instead of hiding most of itself.
 */
function GrowTextarea({
  value,
  onChange,
  ...rest
}: {
  value: string;
  onChange: (v: string) => void;
} & Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange"
>) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-measure whenever the text changes
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Collapse first: without this the box can only ever grow, because
    // scrollHeight is never smaller than the current height.
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={1}
      {...rest}
    />
  );
}

/**
 * The buttons at the end of a row: move up, move down, anything this level
 * adds, then delete. One cluster, one order, at all three levels.
 */
function RowControls({
  onMove,
  first,
  last,
  label,
  onDelete,
  children,
}: {
  onMove: (dir: -1 | 1) => void;
  first: boolean;
  last: boolean;
  label: string;
  onDelete: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex shrink-0 items-center">
      <button
        type="button"
        onClick={() => onMove(-1)}
        disabled={first}
        className={btn}
        aria-label={`Move ${label} up`}
      >
        &uarr;
      </button>
      <button
        type="button"
        onClick={() => onMove(1)}
        disabled={last}
        className={btn}
        aria-label={`Move ${label} down`}
      >
        &darr;
      </button>
      {children}
      <button
        type="button"
        onClick={onDelete}
        className={delBtn}
        aria-label={`Remove ${label}`}
      >
        <Trash2 size={15} strokeWidth={1.75} />
      </button>
    </div>
  );
}

/**
 * One result line, and the optional link that turns it into evidence.
 *
 * The proof pair is collapsed, and its toggle is an icon in the control
 * cluster rather than a "+ proof link" button on a line of its own. Shown
 * always, the pair put two more inputs under every result: five results meant
 * fifteen fields, most of them empty. Given its own line, the button spent
 * seven rows of height to say nothing.
 *
 * Both halves or neither: a label with no slug links nowhere and a slug with
 * no label has nothing to click, so emptying both clears the pair rather than
 * storing half of one.
 */
function HighlightRow({
  highlight,
  onChange,
  onDelete,
  onMove,
  first,
  last,
}: {
  highlight: ExperienceHighlight;
  onChange: (h: ExperienceHighlight) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
  first: boolean;
  last: boolean;
}) {
  const [showProof, setShowProof] = useState(Boolean(highlight.proof));
  const label = highlight.proof?.label ?? "";
  const slug = highlight.proof?.slug ?? "";

  const setProof = (next: { label: string; slug: string }) =>
    onChange({
      ...highlight,
      proof: next.label || next.slug ? next : undefined,
    });

  return (
    <div className="flex items-start gap-2">
      <div className="min-w-0 flex-1 space-y-2">
        <GrowTextarea
          value={highlight.text}
          onChange={(v) => onChange({ ...highlight, text: v })}
          placeholder="One result, one line"
          className="md-field-dense"
        />
        {showProof && (
          <div className="flex items-center gap-2">
            <input
              value={label}
              onChange={(e) => setProof({ label: e.target.value, slug })}
              placeholder="Link text, e.g. The platform"
              className="md-field-dense min-w-0 flex-1"
            />
            <input
              value={slug}
              onChange={(e) => setProof({ label, slug: e.target.value })}
              placeholder="work-project-slug"
              className="md-field-dense min-w-0 flex-1 font-mono"
            />
          </div>
        )}
      </div>
      <RowControls
        label="result"
        first={first}
        last={last}
        onMove={onMove}
        onDelete={onDelete}
      >
        <button
          type="button"
          onClick={() => {
            // Closing it clears the pair, so a hidden field cannot keep
            // publishing a link the editor believes it removed.
            if (showProof) onChange({ ...highlight, proof: undefined });
            setShowProof(!showProof);
          }}
          className={`${btn} ${showProof ? "text-primary" : ""}`}
          aria-pressed={showProof}
          title={showProof ? "Remove proof link" : "Add a proof link"}
          aria-label={showProof ? "Remove proof link" : "Add a proof link"}
        >
          <Link2 size={15} strokeWidth={1.75} />
        </button>
      </RowControls>
    </div>
  );
}

export default function ExperienceEditor({
  value,
  onChange,
}: {
  value: ExperienceCompany[];
  onChange: (next: ExperienceCompany[]) => void;
}) {
  const setCompany = (ci: number, patch: Partial<ExperienceCompany>) =>
    onChange(value.map((c, i) => (i === ci ? { ...c, ...patch } : c)));

  const setRoles = (ci: number, roles: ExperienceRole[]) =>
    setCompany(ci, { roles });

  const setRole = (ci: number, ri: number, patch: Partial<ExperienceRole>) =>
    setRoles(
      ci,
      value[ci].roles.map((r, i) => (i === ri ? { ...r, ...patch } : r)),
    );

  const setHighlights = (
    ci: number,
    ri: number,
    highlights: ExperienceHighlight[],
  ) => setRole(ci, ri, { highlights });

  return (
    <div className="space-y-5">
      {value.map((company, ci) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: positional and reorderable; there is no stable id and the name is editable
          key={ci}
          className="rounded-2xl border border-md-outline-variant p-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <input
              value={company.company}
              onChange={(e) => setCompany(ci, { company: e.target.value })}
              placeholder="Company or school"
              className="md-field-dense min-w-0 flex-1 font-medium"
            />
            {/* Which track this row lands on in the About chart. Work is the
                default and is stored as nothing, so every row written before
                the field existed keeps its meaning. */}
            <div className="flex shrink-0 rounded-lg border border-md-outline-variant p-0.5">
              {KINDS.map(([kind, label]) => {
                const on = (company.kind ?? "work") === kind;
                return (
                  <button
                    key={kind}
                    type="button"
                    onClick={() =>
                      setCompany(ci, {
                        kind: kind === "work" ? undefined : kind,
                      })
                    }
                    aria-pressed={on}
                    className={`h-7 rounded-md px-2 text-[0.75rem] transition-colors ${
                      on
                        ? "bg-md-on-surface/[0.10] text-md-on-surface"
                        : "text-md-on-surface-variant hover:text-md-on-surface"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <RowControls
              label="company"
              first={ci === 0}
              last={ci === value.length - 1}
              onMove={(d) => onChange(move(value, ci, ci + d))}
              onDelete={() => onChange(value.filter((_, i) => i !== ci))}
            />
          </div>

          <div className="mb-3 grid gap-2 sm:grid-cols-2">
            <input
              value={company.url ?? ""}
              onChange={(e) =>
                setCompany(ci, { url: e.target.value || undefined })
              }
              placeholder="https://organisation.com"
              className="md-field-dense w-full"
            />
            <input
              value={company.location ?? ""}
              onChange={(e) =>
                setCompany(ci, { location: e.target.value || undefined })
              }
              placeholder="Hanoi, Vietnam · On-site"
              className="md-field-dense w-full"
            />
          </div>

          <div className="mb-4">
            <MediaPicker
              label="Logo"
              value={company.logo ?? ""}
              onChange={(v) => setCompany(ci, { logo: v || undefined })}
            />
          </div>

          {/* Roles. Newest first: the timeline draws them in this order and
              reads the company's total span off the first and last. */}
          <div className="space-y-3 border-t border-md-outline-variant pt-4">
            {company.roles.map((role, ri) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: positional and reorderable
                key={ri}
                className="rounded-xl bg-md-surface-container-low p-3"
              >
                <div className="mb-2 flex items-center gap-2">
                  <input
                    value={role.title}
                    onChange={(e) => setRole(ci, ri, { title: e.target.value })}
                    placeholder="Job title or degree"
                    className="md-field-dense min-w-0 flex-1 font-medium"
                  />
                  <RowControls
                    label="role"
                    first={ri === 0}
                    last={ri === company.roles.length - 1}
                    onMove={(d) =>
                      setRoles(ci, move(company.roles, ri, ri + d))
                    }
                    onDelete={() =>
                      setRoles(
                        ci,
                        company.roles.filter((_, i) => i !== ri),
                      )
                    }
                  />
                </div>

                <div className="mb-2 grid gap-2 sm:grid-cols-3">
                  <input
                    value={role.type ?? ""}
                    onChange={(e) =>
                      setRole(ci, ri, { type: e.target.value || undefined })
                    }
                    placeholder="Full-time (optional)"
                    className="md-field-dense w-full"
                  />
                  {/* Months, not dates. Every duration on the page is computed
                      from these, and a day would be precision the source does
                      not have. */}
                  <input
                    value={role.start}
                    onChange={(e) => setRole(ci, ri, { start: e.target.value })}
                    placeholder="2025-05"
                    pattern="\d{4}-\d{2}"
                    className="md-field-dense w-full font-mono"
                  />
                  <input
                    value={role.end ?? ""}
                    onChange={(e) =>
                      setRole(ci, ri, { end: e.target.value || undefined })
                    }
                    placeholder="2026-08 or blank = Present"
                    className="md-field-dense w-full font-mono"
                  />
                </div>

                <GrowTextarea
                  value={role.note ?? ""}
                  onChange={(v) => setRole(ci, ri, { note: v || undefined })}
                  placeholder="A sentence about the role (optional)"
                  className="md-field-dense mb-2"
                />

                <div className="space-y-2">
                  {(role.highlights ?? []).map((h, hi) => {
                    const hs = role.highlights ?? [];
                    return (
                      <HighlightRow
                        // biome-ignore lint/suspicious/noArrayIndexKey: positional and reorderable
                        key={hi}
                        highlight={h}
                        first={hi === 0}
                        last={hi === hs.length - 1}
                        onChange={(next) =>
                          setHighlights(
                            ci,
                            ri,
                            hs.map((x, i) => (i === hi ? next : x)),
                          )
                        }
                        onMove={(d) =>
                          setHighlights(ci, ri, move(hs, hi, hi + d))
                        }
                        onDelete={() =>
                          setHighlights(
                            ci,
                            ri,
                            hs.filter((_, i) => i !== hi),
                          )
                        }
                      />
                    );
                  })}
                  <button
                    type="button"
                    onClick={() =>
                      setHighlights(ci, ri, [
                        ...(role.highlights ?? []),
                        { text: "" },
                      ])
                    }
                    className="md-btn md-btn-text md-btn-sm -ml-2"
                  >
                    + result
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                setRoles(ci, [
                  ...company.roles,
                  { title: "", start: "", end: undefined },
                ])
              }
              className="md-btn md-btn-tonal md-btn-sm"
            >
              + role
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          onChange([...value, { company: "", roles: [], url: "", logo: "" }])
        }
        className="md-btn md-btn-tonal md-btn-sm"
      >
        + company
      </button>
    </div>
  );
}
