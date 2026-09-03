import { ELabel, Head, Ic, Node, I } from "@/components/work/WorkDiagramKit";

// SEO content publishing (blog slug cms-publishing-pipeline). The whole point is
// WHERE the model runs, so the diagram is two lanes with a hard line between:
// a TEACH lane that runs once per site (the only model call in the system) and a
// RUN lane that runs every article with zero model calls. Rules learned above
// flow down into the run lane. The human is thin: submit a finished Doc, press
// publish at the end. Verified against seongon agent-seo-posting-railway: one
// Claude Sonnet call at onboarding reads a before/after pair and proposes rules;
// per article the ~280-line job scrapes the Doc's published /pub HTML, applies
// per-site patterns, renames and resizes images, and creates a WordPress draft.

export default function CmsPipelineDiagram() {
  return (
    <svg viewBox="0 0 1360 580" className="work-diagram" role="img" aria-label="SEO content publishing as two lanes: a teach lane that runs once per site, where one Claude Sonnet call learns the site's formatting rules into a per-site store; and a run lane that runs every article with no model, scraping a Google Doc's published HTML, applying the learned rules, handling images, and creating a WordPress draft.">
      <rect className="wd-bg" x="0.5" y="0.5" width="1359" height="579" rx="28" />

      <text className="wd-band-t" x="40" y="52">Turn a finished Google Doc into a clean WordPress draft</text>
      <text className="wd-note" x="40" y="72">the model runs once per site; every article after that is pure code</text>

      {/* ===== Lane A: TEACH -- runs once per site, the only model in the system ===== */}
      <text className="wd-band-t" x="40" y="190">Teach</text>
      <text className="wd-note" x="40" y="208">once per site</text>

      <text className="wd-band-n" x="520" y="140" textAnchor="middle">the only model call in the whole system &#183; ~4k tokens, no retries</text>
      <Node x={200} y={150} w={180} icon={I.doc} title="Sample pair" sub="before / after" variant="neutral" />
      <Node x={430} y={150} w={180} logo="claude" title="Learn rules" sub="one Sonnet call" variant="hub" />
      <Node x={660} y={150} w={180} logo="postgres" title="Rule store" sub="per site" variant="neutral" />
      <path className="wd-edge" d="M380 195 H430" fill="none" /><Head x={430} y={195} dir="right" />
      <path className="wd-edge" d="M610 195 H660" fill="none" /><Head x={660} y={195} dir="right" />

      {/* ===== The hard line ===== */}
      <path className="wd-edge dash" d="M200 285 H1320" fill="none" opacity={0.7} />
      <rect className="wd-pill" x="516" y="275" width="328" height="20" rx="10" />
      <text className="wd-pill-t" x="680" y="289" textAnchor="middle">every article below runs with no model at all</text>

      {/* ===== Lane B: RUN -- every article, zero model calls ===== */}
      <text className="wd-band-t" x="40" y="405">Run</text>
      <text className="wd-note" x="40" y="423">every article</text>

      <text className="wd-note" x="200" y="352">you submit a finished Doc</text>
      <Node x={200} y={360} w={180} icon={I.doc} title="Google Doc" sub="published /pub HTML" variant="neutral" />
      <Node x={430} y={360} w={180} icon={I.gear} title="Apply rules" sub="per-site patterns" variant="neutral" />
      <Node x={660} y={360} w={180} icon={I.upload} title="Images" sub="rename &#183; resize" variant="neutral" />
      <Node x={890} y={360} w={210} logo="wordpress" title="WordPress" sub="a clean draft" variant="neutral" />
      <path className="wd-edge" d="M380 405 H430" fill="none" /><Head x={430} y={405} dir="right" />
      <path className="wd-edge" d="M610 405 H660" fill="none" /><Head x={660} y={405} dir="right" />
      <path className="wd-edge" d="M840 405 H890" fill="none" /><Head x={890} y={405} dir="right" />
      <path className="wd-edge" d="M1100 405 H1170" fill="none" /><Head x={1170} y={405} dir="right" />
      <text className="wd-note" x="1180" y="401">you review,</text>
      <text className="wd-note" x="1180" y="416">then publish</text>

      {/* Learned rules flow down from the teach lane into the run lane */}
      <path className="wd-edge dash" d="M750 240 V335 H520 V360" fill="none" />
      <Head x={520} y={360} dir="down" />
      <ELabel x={635} y={335} text="learned rules" />

      <text className="wd-note" x="40" y="540">the target site is a required argument and &#8220;draft&#8221; is a code literal; no prompt can talk it into auto-publishing the wrong site</text>
    </svg>
  );
}
