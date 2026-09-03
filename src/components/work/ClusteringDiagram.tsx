import { Head, Ic, Node, I, NW } from "@/components/work/WorkDiagramKit";

// Keyword clustering (blog slug keyword-clustering) is a BATCH JOB, not a product
// with a surface: a file of Vietnamese keywords goes in, an ML conveyor runs
// unattended, a CSV of named clusters comes out. So the diagram is a left-to-right
// pipeline (deliberately wide and short, a conveyor), not a you/system split.
// The thesis is carried by colour, not a fake chat: the grouping is classical ML
// (HDBSCAN is the hub); a model is used only to name (Embed and Label are the two
// accent steps, the only model calls). Verified against seongon agent-platform's
// keyword_clustering connector: underthesea -> voyage-3-large (1,024-d) -> UMAP
// -> HDBSCAN -> GPT-4o-mini labels -> CSV, capped near 2,000 keywords.

const W = 150; // tile width
const SY = 208; // stage top
const MY = 253; // rail mid-line (where the flow runs)
const FY = 193; // file-card top
const FH = 120; // file-card height

const X0 = 40, X1 = 220, X2 = 408, X3 = 596, X4 = 784, X5 = 972, X6 = 1160;
const R = (x: number) => x + W;
const C = (x: number) => x + W / 2;

export default function ClusteringDiagram() {
  return (
    <svg viewBox="0 0 1360 480" className="work-diagram" role="img" aria-label="Keyword clustering as a batch pipeline: a file of Vietnamese keywords in, then segment with underthesea, embed with voyage-3-large, reduce with UMAP, cluster by density with HDBSCAN, and label with a cheap model, out to a CSV. Classical ML does the grouping; a model is used only to name clusters.">
      <rect className="wd-bg" x="0.5" y="0.5" width="1359" height="479" rx="28" />

      {/* Eyebrow: name what this is, so nobody reads it as an app */}
      <text className="wd-band-t" x="40" y="52">A batch job: a list of keywords in, named clusters out</text>
      <text className="wd-note" x="40" y="72">no chat and no live surface: you queue the run and collect the files</text>

      {/* What each step is, labelled on the step itself. No blanket claim:
          Embed and Label ARE the two model calls; the grouping is not one. */}
      <text className="wd-band-n" x={C(X2)} y="182" textAnchor="middle">a model call</text>
      <text className="wd-lab" x={C(X4)} y="180" textAnchor="middle">grouped by density &#183; no model</text>
      <text className="wd-band-n" x={C(X5)} y="182" textAnchor="middle">a model call</text>
      <path className="wd-edge" d={`M${C(X2)} 187 V205`} fill="none" opacity={0.45} />
      <path className="wd-edge" d={`M${C(X4)} 186 V205`} fill="none" opacity={0.55} />
      <path className="wd-edge" d={`M${C(X5)} 187 V205`} fill="none" opacity={0.45} />

      {/* The pipeline rail: a quiet zone that unifies the stages as one conveyor */}
      <rect className="wd-zone" x="198" y="196" width="946" height="118" rx="20" />

      {/* keywords.csv -- the input file (data, not a person) */}
      <rect className="wd-input" x={X0} y={FY} width={W} height={FH} rx={13} />
      <Ic x={X0 + 16} y={FY + 14} icon={I.doc} s={0.78} />
      <text className="wd-title" x={X0 + 46} y={FY + 26}>Keywords</text>
      <text className="wd-cite" x={X0 + 46} y={FY + 40}>1,240 rows</text>
      <text className="wd-mono-k" x={X0 + 18} y={FY + 66}>seo onpage</text>
      <text className="wd-mono-k" x={X0 + 18} y={FY + 84}>qu&#7843;ng c&#225;o fb</text>
      <text className="wd-mono-k" x={X0 + 18} y={FY + 102}>backlink b&#225;o</text>

      {/* Five stages of the conveyor. Neutral = deterministic; accent = a model
          call; hub = the classical method that actually does the grouping. */}
      <Node x={X1} y={SY} w={W} icon={I.code} title="Segment" sub="underthesea" variant="neutral" />
      <Node x={X2} y={SY} w={W} icon={I.embed} title="Embed" sub="voyage-3-large" variant="accent" />
      <Node x={X3} y={SY} w={W} icon={I.reduce} title="Reduce" sub="UMAP" variant="neutral" />
      <Node x={X4} y={SY} w={W} icon={I.cluster} title="Cluster" sub="HDBSCAN" variant="hub" />
      <Node x={X5} y={SY} w={W} icon={I.tag} title="Label" sub="GPT-4o-mini" variant="accent" />

      {/* clusters.csv -- the output file */}
      <rect className="wd-input" x={X6} y={FY} width={W} height={FH} rx={13} />
      <Ic x={X6 + 16} y={FY + 14} icon={I.grid} s={0.78} />
      <text className="wd-title" x={X6 + 46} y={FY + 26}>Clusters</text>
      <text className="wd-cite" x={X6 + 46} y={FY + 40}>95 named</text>
      <text className="wd-mono-k" x={X6 + 18} y={FY + 66}>onpage &#8594; SEO</text>
      <text className="wd-mono-k" x={X6 + 18} y={FY + 84}>ads &#8594; Paid</text>
      <text className="wd-mono-k" x={X6 + 18} y={FY + 102}>b&#225;o &#8594; Off-page</text>

      {/* Flow along the rail */}
      <path className="wd-edge" d={`M${R(X0)} ${MY} H${X1}`} fill="none" /><Head x={X1} y={MY} dir="right" />
      <path className="wd-edge" d={`M${R(X1)} ${MY} H${X2}`} fill="none" /><Head x={X2} y={MY} dir="right" />
      <path className="wd-edge" d={`M${R(X2)} ${MY} H${X3}`} fill="none" /><Head x={X3} y={MY} dir="right" />
      <path className="wd-edge" d={`M${R(X3)} ${MY} H${X4}`} fill="none" /><Head x={X4} y={MY} dir="right" />
      <path className="wd-edge" d={`M${R(X4)} ${MY} H${X5}`} fill="none" /><Head x={X5} y={MY} dir="right" />
      <path className="wd-edge" d={`M${R(X5)} ${MY} H${X6}`} fill="none" /><Head x={X6} y={MY} dir="right" />

      {/* Data track: the payload's shape changing as it flows down the pipeline */}
      <path className="wd-edge dash" d={`M${C(X1)} 332 H${C(X5)}`} fill="none" opacity={0.6} />
      {[[C(X1), "tokens"], [C(X2), "1,024-d"], [C(X3), "~30-d"], [C(X4), "groups"], [C(X5), "+ names"]].map(
        ([cx, t], i) => (
          <g key={i}>
            <circle cx={cx as number} cy={332} r={2.4} fill="var(--wd-line)" />
            <text className="wd-band-n" x={cx as number} y={352} textAnchor="middle">{t}</text>
          </g>
        ),
      )}

      <text className="wd-note" x="40" y="440">Vietnamese-first &#183; deterministic and reproducible run to run &#183; outliers kept as &#8220;unclassified&#8221; &#183; capped near 2,000 keywords</text>
    </svg>
  );
}
