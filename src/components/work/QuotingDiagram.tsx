import { ELabel, Head, Ic, Node, I } from "@/components/work/WorkDiagramKit";

// The SEO quoting agent (blog slug seo-quoting-agent) is a guarded, resumable
// STATE MACHINE, so the diagram is a 9-step spine over a persistent state rail,
// not a you/system split. The heroes are the guardrails: a fail-loud live step,
// two tightly caged model calls (Claude Haiku 4.5 - one removes non-rival domains,
// one clamps the backlink authority tier), and a presence gate that fires on a
// missing step rather than a falsy value. State lives per-step in Postgres, so a
// half-finished quote resumes from the last row that landed. Verified against
// seongon agent-platform-kts10. The human is thin: a request in, a quote to review.

export default function QuotingDiagram() {
  return (
    <svg viewBox="0 0 1360 600" className="work-diagram" role="img" aria-label="The SEO quoting agent as a resumable state machine: nine deterministic steps price an SEO project, with two tightly caged Claude Haiku calls, a fail-loud live-ranking step, and a presence gate that fires on a missing step. Every step writes one row to a Postgres state store, so a half-finished quote resumes from the last row that landed.">
      <rect className="wd-bg" x="0.5" y="0.5" width="1359" height="599" rx="28" />

      <text className="wd-band-t" x="40" y="52">Price an SEO project against whoever is actually ranking</text>
      <text className="wd-note" x="40" y="72">nine steps, two caged model calls: a machine built to fail where a human can see it</text>

      {/* ===== Steps 1-4: fetch and choose the real rivals ===== */}
      <text className="wd-band-n" x="340" y="147" textAnchor="middle">fail-loud step</text>
      <text className="wd-band-n" x="780" y="147" textAnchor="middle">removal-only &#183; output &#8838; input</text>

      <Node x={40} y={158} w={170} icon={I.receipt} title="Sales asks" sub="142 kw &#183; Top-5" variant="neutral" />
      <Node x={250} y={158} w={180} icon={I.download} title="Live SERP" sub="who really ranks" variant="neutral" />
      <Node x={470} y={158} w={180} icon={I.bars} title="Candidates" sub="deterministic" variant="neutral" />
      <Node x={690} y={158} w={180} icon={I.lock} title="Filter rivals" sub="caged &#183; Haiku" variant="accent" />
      <path className="wd-edge" d="M210 203 H250" fill="none" /><Head x={250} y={203} dir="right" />
      <path className="wd-edge" d="M430 203 H470" fill="none" /><Head x={470} y={203} dir="right" />
      <path className="wd-edge" d="M650 203 H690" fill="none" /><Head x={690} y={203} dir="right" />

      {/* rivals wrap down into sizing */}
      <path className="wd-edge" d="M780 248 V276 H340 V318" fill="none" /><Head x={340} y={318} dir="down" />
      <ELabel x={560} y={276} text="rivals" />

      {/* ===== Steps 5-9: size, price, and gate ===== */}
      <text className="wd-band-n" x="780" y="304" textAnchor="middle">a wrong quote can&#8217;t look right</text>

      <Node x={250} y={318} w={180} icon={I.bars} title="Sizing" sub="KPI &#183; backlinks" variant="neutral" />
      <Node x={470} y={318} w={180} icon={I.lock} title="Backlink tier" sub="clamped &#183; Haiku" variant="accent" />
      <Node x={690} y={318} w={180} icon={I.shield} title="Presence gate" sub="a step missing?" variant="hub" />
      <path className="wd-edge" d="M430 363 H470" fill="none" /><Head x={470} y={363} dir="right" />
      <path className="wd-edge" d="M650 363 H690" fill="none" /><Head x={690} y={363} dir="right" />
      <path className="wd-edge" d="M870 363 H930" fill="none" /><Head x={930} y={363} dir="right" />

      {/* priced quote out to the human */}
      <rect className="wd-card neutral" x={930} y={308} width={210} height={112} rx={14} />
      <Ic x={948} y={326} icon={I.receipt} s={0.8} />
      <text className="wd-title neutral" x={980} y={332} style={{ fill: "var(--wd-neutral-ink)" }}>Priced quote</text>
      {[["Top-5 KPI", "18 keywords"], ["Articles", "34"], ["Backlinks", "120"]].map(([k, v], i) => (
        <g key={i}>
          <text className="wd-real" x={950} y={360 + i * 20} style={{ fill: "var(--wd-neutral-ink)", opacity: 0.85 }}>{k}</text>
          <text className="wd-cite" x={1120} y={360 + i * 20} textAnchor="end">{v}</text>
        </g>
      ))}
      <text className="wd-note" x="1160" y="360">you review,</text>
      <text className="wd-note" x="1160" y="375">then send it</text>

      {/* ===== The state rail: every step writes one row; the quote is resumable ===== */}
      <rect x="40" y="452" width="1100" height="56" rx="16" style={{ fill: "var(--wd-neutral)", stroke: "var(--wd-zone-b)", strokeWidth: 1.2 }} />
      <Ic x={62} y={470} icon={I.db} s={0.82} />
      <text className="wd-title neutral" x={96} y={476} style={{ fill: "var(--wd-neutral-ink)" }}>Quote state</text>
      <text className="wd-band-n" x="218" y="480">Postgres &#183; one row per step &#183; a half-finished quote resumes from the last row that landed</text>

      <text className="wd-note" x="40" y="560">about a third of the code exists only to stop the rest from lying: the gate tests presence, not truthiness, so an empty payload blows up instead of blending in</text>
    </svg>
  );
}
