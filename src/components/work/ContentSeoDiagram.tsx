import { ELabel, Head, Node, I } from "@/components/work/WorkDiagramKit";

// AI content writing for SEO (blog slug content-seo-ai). Following the blog's own
// framing, this is an AGENT LOOP: the model writes, a deterministic review checks
// it against the SEONGON checklist, and it loops until it passes. Knowledge is
// loaded WHOLE (skills + a synced store), never RAG-scored, so no checklist item
// is dropped. The write step is model-portable (Claude, Qwen or Grok). The human
// is thin: a brief in, a publishable draft to ship. Colour language matches the
// rest of the set: grey = deterministic/data, one full-blue hub = the hero (the
// model that writes). Review is grey because it is a deterministic check, not a
// model. The loop is the centrepiece, spread across the full frame.

export default function ContentSeoDiagram() {
  return (
    <svg viewBox="0 0 1360 520" className="work-diagram" role="img" aria-label="AI content writing for SEO as an agent loop: a brief goes in, the model writes (portable across Claude, Qwen or Grok), a deterministic review checks it against the checklist, and it loops until it passes; skills and a synced knowledge store are loaded whole and feed the write step; a publishable draft comes out for the editor to ship.">
      <rect className="wd-bg" x="0.5" y="0.5" width="1359" height="519" rx="28" />

      <text className="wd-band-t" x="40" y="52">Get a model to write an SEO article an editor would actually publish</text>
      <text className="wd-note" x="40" y="72">skills load whole: no checklist item is ever scored away</text>

      {/* Knowledge, loaded whole, merges into a single context feed for the write */}
      <Node x={225} y={138} w={190} h={80} icon={I.folder} title="Skills" sub="loaded whole" variant="neutral" />
      <Node x={435} y={138} w={190} h={80} logo="supabase" title="Knowledge" sub="synced context" variant="neutral" />
      <path className="wd-edge dash" d="M320 218 V250 H530 V218" fill="none" />
      <path className="wd-edge dash" d="M425 250 V310" fill="none" /><Head x={425} y={310} dir="down" />
      <ELabel x={425} y={280} text="context" />

      {/* The loop: write, review, and loop until it passes */}
      <Node x={40} y={310} w={170} icon={I.doc} title="Brief" sub="outline &#183; keyword &#183; brand" variant="neutral" />
      <Node x={330} y={310} w={190} icon={I.pen} title="Write" sub="Claude &#183; Qwen &#183; Grok" variant="hub" />
      <Node x={620} y={310} w={190} icon={I.check} title="Review" sub="against the checklist" variant="neutral" />
      <Node x={910} y={310} w={190} icon={I.doc} title="Draft" sub="publishable &#183; 92/100" variant="neutral" />

      <path className="wd-edge" d="M210 355 H330" fill="none" /><Head x={330} y={355} dir="right" />
      <path className="wd-edge" d="M520 355 H620" fill="none" /><Head x={620} y={355} dir="right" />
      <ELabel x={570} y={355} text="a draft" />
      <path className="wd-edge" d="M810 355 H910" fill="none" /><Head x={910} y={355} dir="right" />
      <ELabel x={860} y={355} text="passes" />

      {/* loop back: review to write, until it passes */}
      <path className="wd-loop" d="M715 400 V445 H425 V400" fill="none" /><Head x={425} y={400} dir="up" cls="wd-loop" />
      <ELabel x={570} y={445} text="until it passes" />

      <text className="wd-note" x="1130" y="350">the editor</text>
      <text className="wd-note" x="1130" y="365">ships it</text>

      <text className="wd-note" x="40" y="480">the checklists were rewritten for a reader that takes every line literally: the most thorough process audit you will ever get</text>
    </svg>
  );
}
