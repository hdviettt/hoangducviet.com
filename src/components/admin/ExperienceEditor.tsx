"use client";

import MediaPicker from "@/components/admin/MediaPicker";
import type {
  ExperienceCompany,
  ExperienceHighlight,
  ExperienceRole,
} from "@/db/schema";

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
 */

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

function Reorder({
  onMove,
  first,
  last,
  label,
}: {
  onMove: (dir: -1 | 1) => void;
  first: boolean;
  last: boolean;
  label: string;
}) {
  return (
    <div className="flex shrink-0">
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
            <Reorder
              label="company"
              first={ci === 0}
              last={ci === value.length - 1}
              onMove={(d) => onChange(move(value, ci, ci + d))}
            />
            <input
              value={company.company}
              onChange={(e) => setCompany(ci, { company: e.target.value })}
              placeholder="Company"
              className="md-field-dense flex-1 font-medium"
            />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, i) => i !== ci))}
              className={delBtn}
              aria-label="Remove company"
            >
              &times;
            </button>
          </div>

          <div className="mb-3 grid gap-2 sm:grid-cols-2">
            <input
              value={company.url ?? ""}
              onChange={(e) =>
                setCompany(ci, { url: e.target.value || undefined })
              }
              placeholder="https://company.com"
              className="md-field-dense"
            />
            <input
              value={company.location ?? ""}
              onChange={(e) =>
                setCompany(ci, { location: e.target.value || undefined })
              }
              placeholder="Hanoi, Vietnam · On-site"
              className="md-field-dense"
            />
          </div>

          <div className="mb-4">
            <MediaPicker
              label="Company logo"
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
                  <Reorder
                    label="role"
                    first={ri === 0}
                    last={ri === company.roles.length - 1}
                    onMove={(d) =>
                      setRoles(ci, move(company.roles, ri, ri + d))
                    }
                  />
                  <input
                    value={role.title}
                    onChange={(e) => setRole(ci, ri, { title: e.target.value })}
                    placeholder="Job title"
                    className="md-field-dense flex-1 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setRoles(
                        ci,
                        company.roles.filter((_, i) => i !== ri),
                      )
                    }
                    className={delBtn}
                    aria-label="Remove role"
                  >
                    &times;
                  </button>
                </div>

                <div className="mb-2 grid gap-2 sm:grid-cols-3">
                  <input
                    value={role.type ?? ""}
                    onChange={(e) =>
                      setRole(ci, ri, { type: e.target.value || undefined })
                    }
                    placeholder="Full-time (optional)"
                    className="md-field-dense"
                  />
                  {/* Months, not dates. Every duration on the page is computed
                      from these, and a day would be precision the source does
                      not have. */}
                  <input
                    value={role.start}
                    onChange={(e) => setRole(ci, ri, { start: e.target.value })}
                    placeholder="2025-05"
                    pattern="\d{4}-\d{2}"
                    className="md-field-dense font-mono"
                  />
                  <input
                    value={role.end ?? ""}
                    onChange={(e) =>
                      setRole(ci, ri, { end: e.target.value || undefined })
                    }
                    placeholder="2026-08 or blank = Present"
                    className="md-field-dense font-mono"
                  />
                </div>

                <textarea
                  value={role.note ?? ""}
                  onChange={(e) =>
                    setRole(ci, ri, { note: e.target.value || undefined })
                  }
                  placeholder="A sentence about the role (optional)"
                  rows={2}
                  className="md-field-dense mb-2 w-full"
                />

                <div className="space-y-2">
                  {(role.highlights ?? []).map((h, hi) => {
                    const hs = role.highlights ?? [];
                    return (
                      <div
                        // biome-ignore lint/suspicious/noArrayIndexKey: positional and reorderable
                        key={hi}
                        className="flex items-start gap-2"
                      >
                        <Reorder
                          label="result"
                          first={hi === 0}
                          last={hi === hs.length - 1}
                          onMove={(d) =>
                            setHighlights(ci, ri, move(hs, hi, hi + d))
                          }
                        />
                        <div className="min-w-0 flex-1 space-y-2">
                          <textarea
                            value={h.text}
                            onChange={(e) =>
                              setHighlights(
                                ci,
                                ri,
                                hs.map((x, i) =>
                                  i === hi ? { ...x, text: e.target.value } : x,
                                ),
                              )
                            }
                            placeholder="One result, one line"
                            rows={2}
                            className="md-field-dense w-full"
                          />
                          {/* Proof turns a claim into a link. Both halves or
                              neither — a label with no slug links nowhere. */}
                          <div className="grid gap-2 sm:grid-cols-2">
                            <input
                              value={h.proof?.label ?? ""}
                              onChange={(e) =>
                                setHighlights(
                                  ci,
                                  ri,
                                  hs.map((x, i) =>
                                    i === hi
                                      ? {
                                          ...x,
                                          proof: e.target.value
                                            ? {
                                                label: e.target.value,
                                                slug: x.proof?.slug ?? "",
                                              }
                                            : undefined,
                                        }
                                      : x,
                                  ),
                                )
                              }
                              placeholder="Proof link text (optional)"
                              className="md-field-dense"
                            />
                            <input
                              value={h.proof?.slug ?? ""}
                              onChange={(e) =>
                                setHighlights(
                                  ci,
                                  ri,
                                  hs.map((x, i) =>
                                    i === hi
                                      ? {
                                          ...x,
                                          proof: {
                                            label: x.proof?.label ?? "",
                                            slug: e.target.value,
                                          },
                                        }
                                      : x,
                                  ),
                                )
                              }
                              placeholder="work-project-slug"
                              className="md-field-dense font-mono"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setHighlights(
                              ci,
                              ri,
                              hs.filter((_, i) => i !== hi),
                            )
                          }
                          className={delBtn}
                          aria-label="Remove result"
                        >
                          &times;
                        </button>
                      </div>
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
                    className="md-btn md-btn-text md-btn-sm"
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
