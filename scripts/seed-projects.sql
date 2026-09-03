-- Registers Projects as first-class showcase content (runs after 02-data seeds
-- posts/series). Authoritative: wipes and rebuilds the list. Structure: two
-- top-level works (the search engine, and the agentic platform) with five
-- standalone child pieces hanging off the platform. Every project carries a
-- metrics band and a long-form narrative mined from its backing writing.
-- No em-dashes. Canonical seed for the 7 real projects (local Docker DB via
-- docker/initdb, and prod via scripts/seed-projects.cjs). Wipe-and-rebuild:
-- run it deliberately for (re)seeding; it replaces project rows.

DELETE FROM project_posts;
DELETE FROM projects;

-- Top-level 1: Mini search engine ---------------------------------------------
INSERT INTO projects (slug, title, tagline, description, content, features, stack, models, media, metrics, status, build_status, featured, sort_order, parent_slug, repo_url, live_url) VALUES (
  'mini-search-engine',
  'A mini search engine built from scratch',
  'A working search engine built from scratch. The code behind the 10-part series.',
  $d$Search is the black box everyone in SEO works against and almost nobody has opened. So I built a working engine end to end, scoped to football to keep the corpus small: crawler, inverted index, BM25 and PageRank, a neural reranker, and a conversational mode that answers from my own index instead of Google's.$d$,
  $c$<h2>Why build the whole thing</h2>
<p>Search is the black box everyone in SEO works against and almost nobody has opened. I wanted to stop guessing, so I built a working engine end to end, scoped to football so the corpus stayed small enough to reason about. It crawls the open web, indexes it, ranks it, reranks it with a neural model, and answers questions from its own index. Every layer of a real engine, in miniature.</p>
<h2>The pipeline</h2>
<p>A polite crawler traverses Wikipedia and OneFootball breadth-first, respecting robots.txt and waiting 1.5 seconds between hits, with the queue persisted in Postgres so the job is resumable. Parsed pages are tokenized and folded into an inverted index of 145,736 unique terms across three Postgres tables. Ranking runs in two passes: BM25F for relevance, where a title match counts four times a body match, blended with PageRank for authority, then a BERT cross-encoder reranks the top hits by reading query and document together.</p>
<p>On top of retrieval sit two features that mirror what Google shipped. AI Overviews is a RAG path that fans a query into sub-questions, retrieves with Voyage embeddings, and writes a cited answer. AI Mode is a stateful chat that runs a custom web_search tool against my own index instead of the live web.</p>
<h2>The reckoning</h2>
<p>For eight parts I judged each stage the way most side projects are judged: I typed a query I cared about and looked at the first few results. That is a demo, not a measurement. So I sat down with 50 hand-labelled queries and an nDCG and MRR harness, and it immediately found structural bugs the football queries had hidden. BM25 was admitting a document on any single matched term, so "kubernetes ingress controller annotations" returned 1,429 results answered entirely by the word "controller". A stopword-and-stemmer combination that was correct for prose was quietly destroying two-word proper nouns, collapsing "Serie A" into the common word "series". My own latency comment was wrong by eight times.</p>
<p>The measured verdict: nDCG@10 of 0.74, MRR of 0.63. Turning the cross-encoder off drops nDCG by 23 percent and MRR by 46 percent, which is the number that justifies the whole reranking stage.</p>
<h2>The experiment that lost</h2>
<p>I then tried to replace the pretrained reranker with a cross-encoder trained from scratch: a hand-written BPE tokenizer, attention implemented and tested against PyTorch to 1e-5, 7.36 million parameters trained on 676,190 pairs. It lost, and the honest reason is the useful one. Cross-encoder reranking is mostly a knowledge problem, not a structure problem, and knowledge like "guardian means theguardian.com" arrives in pretraining or not at all. The failure was not the code. The failure was picking the task.</p>$c$,
  $j$[{"name":"Polite BFS crawler","desc":"Crawls Wikipedia and OneFootball, obeys robots.txt, waits 1.5s per domain, and persists its queue in Postgres so it resumes."},{"name":"Inverted index over Postgres","desc":"145,736 unique terms across three tables, turning per-document scans into O(1) term lookups."},{"name":"BM25F ranking","desc":"Textbook BM25 (k1 1.2, b 0.75) plus field weighting that counts a title match four times a body match."},{"name":"PageRank with dangling redistribution","desc":"Link authority over the crawled graph (damping 0.85) with a dead-end term so rank is conserved in a bounded crawl."},{"name":"Neural reranking","desc":"A BERT cross-encoder (ms-marco MiniLM) rereads query and document together and lifts nDCG by 23 percent."},{"name":"AI Overviews via RAG","desc":"Fans a query into sub-questions, retrieves with Voyage embeddings, and writes an answer cited back to each source."},{"name":"In-results AI Mode","desc":"A stateful chat with a custom web_search tool that queries my own index, not the live web."},{"name":"Honest evaluation harness","desc":"50 hand-labelled queries scored by nDCG and MRR, which found structural bugs the demos had hidden."}]$j$::jsonb,
  $j$[{"group":"Frontend","items":[{"name":"Next.js","mark":"nextjs"},{"name":"React Flow","mark":"react"}]},{"group":"Backend","items":[{"name":"FastAPI"},{"name":"ONNX Runtime"}]},{"group":"Database","items":[{"name":"PostgreSQL + pgvector","mark":"postgres"}]}]$j$::jsonb,
  $j$[{"name":"Groq Llama 3.3 70B"},{"name":"ms-marco MiniLM cross-encoder"},{"name":"Voyage embeddings"}]$j$::jsonb,
  $j$[{"type":"image","src":"/work/mse-pipeline.png","caption":"Live query pipeline (Explore mode)"},{"type":"image","src":"/work/mse-search.png","caption":"AI Overview with cited sources"}]$j$::jsonb,
  $j$[{"value":"0.74","label":"nDCG@10 over 50 labelled queries"},{"value":"145,736","label":"unique terms indexed"},{"value":"+23%","label":"nDCG lift from neural reranking"},{"value":"10","label":"parts, crawler to AI mode"}]$j$::jsonb,
  'published', 'live', true, 1, NULL,
  'https://github.com/hdviettt/mini-search-engine', 'https://search.hoangducviet.work'
);

-- Top-level 2: Agentic AI platform (the parent) -------------------------------
INSERT INTO projects (slug, title, tagline, description, content, features, stack, models, media, metrics, status, build_status, featured, sort_order, parent_slug) VALUES (
  'agentic-ai-platform',
  'An AI platform for a whole company, led end to end',
  'The internal AI platform behind a family of agents serving 117 people.',
  $d$The internal AI platform I led for a 117-person company: one runtime, one credential store, one run history, and one eval gate under a family of agents, built around refined human procedures so most of it runs with no model at all. Each agent below is a standalone piece of work in its own right.$d$,
  $c$<h2>The year that did not compound</h2>
<p>My first year running AI at a 117-person agency, three of us built about ten standalone tools. Each one worked. Together they were an App Store of disconnected apps: separate logins, separate code, separate failures, and a cost and headcount line that went up instead of down. Three engineers building ten tools is the standalone play. The integration play is fifty people building their own on shared rails. That reframing is the platform.</p>
<h2>Procedures, not prompts</h2>
<p>The platform is built around refined human procedures, not clever prompts. A company accumulating procedures is compounding; a company accumulating prompts is renting. Every agent starts from a written procedure: the steps, what good output looks like, and the single point where a human has to reason. That procedure becomes a skill, a tool is a crude connector to one outside system, and an agent is a thin adapter that lets a model reach the two. It is the same vocabulary as the Claude Agent SDK, so I did not have to invent one.</p>
<h2>The filesystem is the registry</h2>
<p>There is no AgentFactory and no YAML-to-container pipeline. An agent is one Markdown file whose frontmatter is the whole contract: model, max turns, tools, and the UI metadata. The newest agent needed one Markdown file, one skill folder, and zero changes to the core. Credentials never meet the model: client secrets are encrypted at rest, decrypted only inside the orchestrator, and handed to subprocesses as environment variables, so an agent cannot leak what it never sees. Every run is written down, and nothing reaches staff until it passes five of five gold cases.</p>
<h2>Encodings are disposable</h2>
<p>The durable asset is the procedure; its encoding is not. An agent that starts as a conversation loading skills often turns out, in production, to need a model in exactly one step and only once per client. Everything else is mechanical, so it collapses into deterministic code in about a week without the know-how changing at all. Of 103 parts in the current repo, 52 never involve a model. Some agents became pipelines, one became a button, a few stayed conversational. Nineteen agents in, on one runtime, it holds.</p>
<h2>The most expensive miss</h2>
<p>The honest retrospective is that the missing piece was never a tool or a doc. It was people: middle managers who understand AI well enough to run strategy at department level. That was the most expensive miss of the year, and it is a leadership problem, not an engineering one.</p>$c$,
  $j$[{"name":"Filesystem as registry","desc":"An agent is one Markdown file and a skill is a folder; the newest agent needed zero changes to the core."},{"name":"Procedures over prompts","desc":"Every agent starts from a written human procedure, the durable asset, not a clever prompt."},{"name":"Credentials never meet the model","desc":"Client secrets are encrypted at rest and decrypted only in the orchestrator, so an agent cannot leak what it never sees."},{"name":"Every run written down","desc":"Input, steps, tokens, cost, and the encoding that produced it, for all 19 agents on one runtime."},{"name":"Eval gate before production","desc":"An agent ships only when it passes five of five gold cases, replayed before release."},{"name":"Model-free by default","desc":"Of 103 parts in the repo, 52 never involve a model; procedures collapse from conversation into deterministic code."},{"name":"Additive-only migrations","desc":"One runtime for many agents means migrations are additive by rule, so old code survives a new schema mid-rollout."}]$j$::jsonb,
  $j$[{"group":"Backend","items":[{"name":"Claude Agent SDK","mark":"claude"},{"name":"MCP"},{"name":"FastAPI"}]},{"group":"Database","items":[{"name":"PostgreSQL","mark":"postgres"}]}]$j$::jsonb,
  $j$[{"name":"Claude","mark":"claude"},{"name":"Gemini","mark":"gemini"},{"name":"GPT-4o-mini","mark":"gpt"},{"name":"Voyage embeddings"}]$j$::jsonb,
  $j$[]$j$::jsonb,
  $j$[{"value":"19","label":"agents live on one runtime"},{"value":"52 / 103","label":"parts run with no model at all"},{"value":"63","label":"composable skills"},{"value":"117","label":"people the platform serves"}]$j$::jsonb,
  'published', 'live', true, 2, NULL
);

-- Child: SEO content publishing -----------------------------------------------
INSERT INTO projects (slug, title, tagline, description, content, features, stack, models, media, metrics, status, build_status, featured, sort_order, parent_slug) VALUES (
  'cms-publishing-pipeline',
  'SEO content publishing',
  'Turns finished SEO drafts in Google Docs into WordPress posts, deterministically.',
  $d$A CMS-adaptable pipeline that takes an approved SEO article out of Google Docs and lands it as a clean WordPress draft. The model runs once per site at onboarding; every article after that is pure code.$d$,
  $c$<h2>The problem was never one site</h2>
<p>Turning a finished SEO article into a formatted CMS post is a slow afternoon: a 30-page Google Doc, roughly 20 images, about 150 manual clicks, two to three hours. One site you could script once. The real problem is dozens of clients, each with its own house markup, which is what kept a person in the loop for years.</p>
<h2>One model call, at the right moment</h2>
<p>The design decision that matters is where the model runs. Variance here is per-website, not per-article, so the model runs exactly once per site at onboarding: it reads a before-and-after pair, the raw doc and one article already published the way the client likes it, and proposes the transform rules. That is one Sonnet call, about 4k tokens, no retries. Per article, forever, there are zero model calls. A per-article design would have made the same judgment call around 400 times for a single site and let the same doc drift run to run, and in SEO that drift surfaces months later as an unexplained crawl diff.</p>
<h2>Code wins where code has something to read</h2>
<p>Deterministic detectors post-process the model's rules, and they do not treat every layer the same. Paragraphs are structurally regular, so code overrules the model. Wrappers and tables carry novel intent, so the model's version is kept and extended. When the sample has no structure to read for a layer, the detector stands down rather than inventing a rule. The rules freeze into a per-site pattern store, and the publish job that runs them is 280 lines and six steps: read the doc, apply patterns, rename and resize images by SEO scheme, upload, rewire URLs, create a draft. A person always presses publish. The guarantee that it never auto-publishes or guesses the wrong site is not a prompt instruction; the site is a required argument and the draft status is a code literal. A guardrail written in a prompt is a request. A guardrail written in code is a fact.</p>$c$,
  $j$[{"name":"Model at onboarding only","desc":"One Sonnet call per website proposes the transform rules; per-article publishing makes zero model calls."},{"name":"Layer-aware detectors","desc":"Code overrules the model on regular layers like paragraphs, and defers on novel ones like wrappers and tables."},{"name":"SEO image renaming","desc":"Filenames are built from the keyword, section, and nearest heading; images resize to 800px at JPEG q92."},{"name":"All-or-nothing upload","desc":"If every image fails to reach the media library the run stops before creating a half-illustrated draft."},{"name":"Code-level guardrails","desc":"The target site is a required argument and draft status is a code literal, so no prompt can talk it into auto-publishing."}]$j$::jsonb,
  $j$[{"group":"Backend","items":[{"name":"Python"},{"name":"Google Doc (/pub)"},{"name":"WordPress REST"}]},{"group":"Data","items":[{"name":"Postgres pattern store","mark":"postgres"}]}]$j$::jsonb,
  $j$[{"name":"Claude Sonnet","mark":"claude"}]$j$::jsonb,
  $j$[]$j$::jsonb,
  $j$[{"value":"1 / 0","label":"model calls per site / per article"},{"value":"~2 min","label":"per article, from about 150"},{"value":"280","label":"line deterministic publish job"},{"value":"6","label":"steps, zero model calls"}]$j$::jsonb,
  'published', 'live', false, 3, 'agentic-ai-platform'
);

-- Child: AI content writing for SEO -------------------------------------------
INSERT INTO projects (slug, title, tagline, description, content, features, stack, models, media, metrics, status, build_status, featured, sort_order, parent_slug) VALUES (
  'content-seo-ai',
  'AI content writing for SEO',
  'Getting a model to write SEO articles a human editor would actually publish.',
  $d$Fluency was never the problem; a model could draft a thousand words in one call from day one. Hitting an expert's quality and every line of a publishing checklist took four architectures over eighteen months. It is used daily by the content team now.$d$,
  $c$<h2>Fluency was never the problem</h2>
<p>A model could write a fluent thousand-word article in one call from day one. Hitting an expert's quality, the SEO guidance, and every line of a publishing checklist took a year and a half and four separate architectures. The whole history is one problem stated four ways: a checklist needs 100 percent of the guidance in front of the model, and most approaches deliver less.</p>
<h2>Four rebuilds</h2>
<p>The first version was an evaluator-optimizer loop on n8n, a writer and a reviewer fed the internal SEO docs through a contextual RAG store. It failed by design: RAG is a ranking mechanism that keeps a top-k and drops the rest, and a checklist has no most-relevant item. The second version put voice into the weights with a QLoRA fine-tune on 528 Vietnamese travel articles. It finally nailed the register, but two of three fine-tunes came back unable to write a fluent sentence, and the one that worked was frozen to a single model at one moment while frontier models kept improving from a system prompt alone.</p>
<p>The third version inverted the first: the model holds the control flow and loops toward a goal, and procedures become skills, versioned files loaded whole or not at all, so no checklist item is ever scored away. The current version is an app-agent hybrid. Article state, which articles exist and who owns each stage, lives in an app; the writing, which resists standardization, stays a conversation in a side rail.</p>
<h2>The audit no one asked for</h2>
<p>The subtler failure came after the architecture settled. The checklists had been written for people, who silently fill in tolerances the document never states: this limit is soft, that one is hard, these two rules conflict and here is which wins. The agent had the rules and not the tolerances, so it looped, cutting a real section to hit 999 words and then restoring it. The fix was not a better model. It was rewriting the documents for a reader that takes every line literally. Handing your procedure to something that cannot shrug is the most thorough process audit you will ever get.</p>$c$,
  $j$[{"name":"Skills over retrieval","desc":"Each procedure is a versioned file loaded whole or not at all, so no checklist item is ever scored away."},{"name":"Contextual RAG store","desc":"An early Supabase vector store hash-synced to a Google Drive folder, embedded with text-embedding-3-large."},{"name":"QLoRA fine-tune","desc":"A 4-bit fine-tune on 528 Vietnamese travel articles that finally captured house voice."},{"name":"Model-portable harness","desc":"Refactored onto the Vercel AI SDK so the model stays a choice; it runs 5 to 8x cheaper on Qwen than Claude."},{"name":"App-agent hybrid","desc":"Article state lives in an app; the writing stays a conversation in a side rail beside it."},{"name":"Agent-readable procedures","desc":"Checklists rewritten to spell out soft limits and resolve contradictions people had filled in by instinct."}]$j$::jsonb,
  $j$[{"group":"Orchestration","items":[{"name":"Vercel AI SDK","mark":"vercel"},{"name":"n8n"}]},{"group":"Data","items":[{"name":"Supabase"},{"name":"text-embedding-3-large"}]},{"group":"Fine-tune","items":[{"name":"QLoRA"},{"name":"Unsloth"}]}]$j$::jsonb,
  $j$[{"name":"Claude","mark":"claude"},{"name":"Qwen"},{"name":"Grok"}]$j$::jsonb,
  $j$[]$j$::jsonb,
  $j$[{"value":"4","label":"architectures over 18 months"},{"value":"528","label":"Vietnamese fine-tune examples"},{"value":"5-8x","label":"cheaper per article on Qwen vs Claude"},{"value":"daily","label":"use by the content team"}]$j$::jsonb,
  'published', 'live', false, 4, 'agentic-ai-platform'
);

-- Child: Keyword clustering ---------------------------------------------------
INSERT INTO projects (slug, title, tagline, description, content, features, stack, models, media, metrics, status, build_status, featured, sort_order, parent_slug) VALUES (
  'keyword-clustering',
  'Keyword clustering',
  'Clusters thousands of SEO keywords into a content strategy.',
  $d$An ML pipeline that turns a couple thousand raw Vietnamese keywords into a clean content strategy by clustering on meaning, with a cheap model used only at the end to name each cluster. One reliable tool anyone on the team can run.$d$,
  $c$<h2>Using an LLM to cluster keywords is usually a bad idea</h2>
<p>Before this, people pasted keywords into ChatGPT or Gemini and asked for clusters. That cannot handle the token load of thousands of keywords, and it will not cluster them consistently or reproducibly without hallucinating. I wanted one solution the whole team could rely on across different keyword sets, regardless of who was running it.</p>
<h2>Classical ML, model only at the end</h2>
<p>The pipeline is mostly not a model. Vietnamese text is tokenized with underthesea so real words survive before anything is embedded. Keywords become vectors with voyage-3-large, then UMAP compresses 1,024 dimensions down to about 30, because at full width almost every point is equidistant and distance stops meaning anything. HDBSCAN finds the natural groups by density, with the controls surfaced as a plain granularity level and an optional refine pass rather than raw algorithm parameters. Outliers are reassigned by k-nearest-neighbour voting, oversized clusters split by recursive bisection, and a keyword only moves cluster if it clears a +0.05 improvement threshold. Only at the very end does a cheap model read a few keywords from each cluster and write its label.</p>
<h2>Control without the algorithm</h2>
<p>Hard-coding parameters draws a complaint on every new list, so the real controls, granularity and the cluster-size limits, are exposed but hidden behind plain-language presets. Results ship as a CSV, one row per keyword with its named cluster. The technical choices prioritize accuracy for Vietnamese specifically, while staying fast.</p>$c$,
  $j$[{"name":"Vietnamese-first tokenization","desc":"underthesea segments Vietnamese keywords into real words before anything is embedded."},{"name":"Dimensionality reduction","desc":"UMAP compresses 1,024 embedding dimensions to about 30, so density clustering can find real structure."},{"name":"Density clustering, tuned","desc":"HDBSCAN groups by density, surfaced as a plain granularity level and an optional refine pass rather than raw parameters."},{"name":"Smart outlier handling","desc":"k-nearest-neighbour voting separates genuinely unique keywords from ones that just missed a cluster."},{"name":"Large-cluster splitting","desc":"Recursive bisection breaks an overly broad cluster into meaningful subtopics."},{"name":"Conservative refinement","desc":"A keyword only moves cluster when it clears a +0.05 improvement threshold, avoiding churn."},{"name":"Presets over parameters","desc":"Real controls hidden behind plain-language presets; results export as a CSV, one row per keyword and its cluster."}]$j$::jsonb,
  $j$[{"group":"ML","items":[{"name":"underthesea"},{"name":"UMAP"},{"name":"HDBSCAN"}]},{"group":"Output","items":[{"name":"CSV"}]}]$j$::jsonb,
  $j$[{"name":"voyage-3-large"},{"name":"GPT-4o-mini","mark":"gpt"}]$j$::jsonb,
  $j$[]$j$::jsonb,
  $j$[{"value":"1,024 to 30","label":"dimensions, UMAP before clustering"},{"value":"8","label":"step ML pipeline"},{"value":"2,000","label":"keywords per run, capped"},{"value":"+0.05","label":"threshold to move a keyword"}]$j$::jsonb,
  'published', 'live', false, 5, 'agentic-ai-platform'
);

-- Child: SEO quoting agent ----------------------------------------------------
INSERT INTO projects (slug, title, tagline, description, content, features, stack, models, media, metrics, status, build_status, featured, sort_order, parent_slug) VALUES (
  'seo-quoting-agent',
  'SEO quoting agent',
  'A deterministic pricing pipeline that stopped the model from inventing quotes.',
  $d$An agent that prices SEO work against whoever is actually ranking. Rebuilt app-first as a nine-step pipeline with the model caged to two tightly bounded calls, where most of the effort went into making the machine fail where a human can see it.$d$,
  $c$<h2>Pricing work a senior person used to eyeball</h2>
<p>Quoting SEO production means deciding how many articles a site needs, how much off-page work, and how long to move it against whoever is actually ranking. A senior person used to eyeball it: slow, inconsistent between people, and impossible to check afterward. The chat version was fired and rebuilt app-first as a deterministic nine-step pipeline with the model caged to two tightly bounded calls.</p>
<h2>Seven steps of script, two caged calls</h2>
<p>State moves out of the chat into one Postgres table, one row per step, so a half-finished quote resumes from the last row that landed. Seven of the nine steps are plain script: numbers in, numbers out, with no model within reach of them. Two steps get a caged model call. One picks the real competitors off a search page, because telling a rival from a hospital or a news portal that happens to rank needs world knowledge; it may only remove names from the handed list, never add one, checked once inside the function and once at the caller. The other picks the backlink authority mix, the ratio of press to guest-post links, clamped to a fixed set of tiers so the model chooses within a range and never a free number.</p>
<h2>Making a machine that cannot crash fail loudly</h2>
<p>Most of a year went not into the cage but into the machinery that makes the pipeline fail where a human can see it. A deterministic step that fails does not crash; it returns the empty version of what it owed, a zero or an empty list, and the next step cannot tell "there is no data" from "the data is zero", so it produces a clean, wrong number. A wrong quote that looks identical to a right one, all green, is worse than a crash, because nobody goes looking. The fix is a second contract pointed at the code, not the model: the gate tests presence, not truthiness, so an empty payload blows up instead of blending in; every rule ships with a dirty input that must fail and a clean one that must stay quiet; and judgment handed back to the model comes back clamped, falling to the route default and logging why. About a third of the codebase exists only to stop the rest from lying.</p>$c$,
  $j$[{"name":"State in Postgres, not chat","desc":"Every number lives in one table, one row per step, so a run resumes after closing the laptop mid-quote."},{"name":"Nine-step pipeline","desc":"Seven steps are deterministic script; two are allowed a caged model call."},{"name":"Two caged model calls","desc":"One removes non-rival domains from the competitor list (never adds, checked twice); the other picks the backlink authority mix, clamped to a fixed set of tiers."},{"name":"One fail-loud step","desc":"Fetching live rankings is the only step allowed to fail the run, because with no data there is no quote."},{"name":"Invariant gate on presence","desc":"The gate fires on a missing step, not a falsy value, so an empty payload blows up instead of passing."},{"name":"Clamped judgment","desc":"The model picks a route and parameters only inside a range; step outside and code takes the default and logs why."}]$j$::jsonb,
  $j$[{"group":"Backend","items":[{"name":"Python"},{"name":"PostgreSQL","mark":"postgres"}]},{"group":"Frontend","items":[{"name":"Workbench app"}]}]$j$::jsonb,
  $j$[{"name":"Claude Haiku 4.5","mark":"claude"}]$j$::jsonb,
  $j$[]$j$::jsonb,
  $j$[{"value":"9 / 2","label":"steps total / with a model call"},{"value":"7","label":"deterministic steps, numbers in and out"},{"value":"~1/3","label":"of the code is guardrails"},{"value":"2","label":"places the caged call is checked"}]$j$::jsonb,
  'published', 'wip', false, 6, 'agentic-ai-platform'
);

-- Child: Presentation agent (keeps its rich bespoke deep-dive) -----------------
INSERT INTO projects (slug, title, tagline, description, content, features, stack, models, media, metrics, status, build_status, featured, sort_order, parent_slug) VALUES (
  'agentic-presentation-system',
  'Presentation agent',
  'Turns a one-line brief and a few files into a real, editable B2B deck.',
  $d$One brief and a few data files become a real, editable B2B deck. The model never places a pixel, never holds a chart's raw numbers, and never grades its own work: it writes the argument, a coded engine draws every slide.$d$,
  $c$<h2>Why AI is bad at presentations</h2>
<p>Consumer deck tools solve the look of a slide but not its argument or its data. Raw models commit the one error that survives every check, a wrong number copied perfectly off the wrong row, and they argue in prose when a slide argues in structure. The system fixes this by taking capability away from the model rather than instructing it. The model never places a pixel, never holds a chart's raw numbers, and never grades its own work. The safest way to make an AI behave is not a better prompt, it is a narrower contract.</p>
<h2>Argument first, then pixels</h2>
<p>A deck is written as an approvable outline before any slide exists: a flat list of cards, one per slide, each title stating a conclusion rather than a topic. Numbers are confirmed against the source files at build time, which moved the rate at which slides actually draw their data from about one in ten to about seven in ten. Approval freezes the shape by card id. Then a slide is built as a pure function with no model call, assembled from around thirty prebuilt blocks chosen through 17 named archetypes, a mapping read from what real deck-builders reached for across 644 planned slides. The model only ever describes structure: a tree of containers on a 12-column grid, colours by role, sizes by step. It never emits a coordinate or a hex code, which makes a whole category of ugly unspellable rather than forbidden.</p>
<h2>A coded engine draws every pixel</h2>
<p>One layout engine turns that structure into pixels: it measures real glyph shapes from the font file with identical code on server and browser, snaps chart axes to round numbers, and uses five fixed colourblind-safe series colours. A deterministic linter is the only judge, checking sixteen geometry and contrast rules plus three blunt meaning rules on the finished slide. A separate data analyst agent, the one agent allowed to touch raw data, runs Python in a throwaway sandbox and returns findings bound to specific cells, never raw tables through the model. Specialists like an SEO strategist advise once, before the shape locks, and cannot write to the deck.</p>
<h2>An editable result, from one source of truth</h2>
<p>The same layout function feeds two render paths, interactive HTML for the editor and static SVG for thumbnails, image export, and the PowerPoint file, so what you edit and what you present cannot drift. The hard part was making an AI slide behave like a hand-designed one a person can own: the model is never given coordinates, but dragging needs them, so the first drag freezes every element into a free layer at exactly its painted position and nothing reflows again. This replaced a 693-line prompt whose rules the model used to police itself. Across 65 production runs, the median deck took under two minutes; the largest was 37 slides against a 33-tab workbook.</p>$c$,
  $j$[{"name":"Structure-only contract","desc":"The model describes a tree of containers on a 12-column grid and never emits a coordinate or a hex code."},{"name":"Deterministic layout engine","desc":"One engine computes every pixel, snaps chart axes to round numbers, and uses five colourblind-safe series colours."},{"name":"Deterministic linter as judge","desc":"Sixteen geometry and contrast rules plus three meaning rules on the finished slide; the model never grades itself."},{"name":"Claim-shaped block library","desc":"Slides assemble from about thirty prebuilt blocks via 17 archetypes, read from 644 real planned slides."},{"name":"Approvable dynamic outline","desc":"The argument is an editable card list before any slide exists, with per-card ids so a regenerate only redraws what changed."},{"name":"Figure binding, never retyping","desc":"Chart numbers bind to spreadsheet cells at build time and never pass through the model."},{"name":"Data analyst in a sandbox","desc":"One agent runs Python (pandas, polars, openpyxl, pdfplumber) in a throwaway sandbox and returns findings, not tables."},{"name":"Real editor with a freeze","desc":"The static slide opens in a browser editor; the first drag freezes it so nothing reflows under your hands."}]$j$::jsonb,
  $j$[{"group":"Runtime","items":[{"name":"Vercel AI SDK","mark":"vercel"},{"name":"AI Gateway","letter":"Ai"}]},{"group":"Render","items":[{"name":"zod","mark":"zod"},{"name":"fontkit","letter":"Fk"},{"name":"resvg","letter":"Rs"},{"name":"pptxgenjs","letter":"Px"}]},{"group":"Data","items":[{"name":"Postgres","mark":"postgres"},{"name":"PGlite","mark":"pglite"},{"name":"Cloudflare R2","mark":"r2"}]},{"group":"Services","items":[{"name":"E2B","mark":"e2b"},{"name":"Tavily","mark":"tavily"},{"name":"DataForSEO","mark":"dataforseo"}]}]$j$::jsonb,
  $j$[{"name":"Claude","mark":"claude"},{"name":"GPT","mark":"gpt"},{"name":"Gemini","mark":"gemini"},{"name":"DeepSeek","mark":"deepseek"}]$j$::jsonb,
  $j$[]$j$::jsonb,
  $j$[{"value":"693","label":"line prompt the type system retired"},{"value":"644","label":"real slides analyzed to design blocks"},{"value":"7 in 10","label":"slides draw real data, up from 1 in 10"},{"value":"< 2 min","label":"median run across 65 decks"}]$j$::jsonb,
  'published', 'live', false, 7, 'agentic-ai-platform'
);

-- Backing writing (guarded against missing posts) -----------------------------
INSERT INTO project_posts (project_slug, post_slug)
  SELECT 'mini-search-engine', post_slug FROM series_posts WHERE series_slug = 'building-a-mini-search-engine'
  ON CONFLICT DO NOTHING;
INSERT INTO project_posts (project_slug, post_slug)
  SELECT 'mini-search-engine', 'i-tried-to-train-a-cross-encoder-from-scratch'
  WHERE EXISTS (SELECT 1 FROM posts WHERE slug = 'i-tried-to-train-a-cross-encoder-from-scratch')
  ON CONFLICT DO NOTHING;

INSERT INTO project_posts (project_slug, post_slug)
  SELECT 'agentic-ai-platform', slug FROM posts
  WHERE slug IN ('an-agent-platform-for-seongon-built-around-human-procedures', 'why-our-ai-team-failed')
  ON CONFLICT DO NOTHING;

INSERT INTO project_posts (project_slug, post_slug)
  SELECT 'cms-publishing-pipeline', 'a-cms-adaptable-llm-pipeline-for-seo-compliant-content-publishing'
  WHERE EXISTS (SELECT 1 FROM posts WHERE slug = 'a-cms-adaptable-llm-pipeline-for-seo-compliant-content-publishing')
  ON CONFLICT DO NOTHING;

INSERT INTO project_posts (project_slug, post_slug)
  SELECT 'content-seo-ai', 'a-brief-history-of-seo-content-writing-with-ai'
  WHERE EXISTS (SELECT 1 FROM posts WHERE slug = 'a-brief-history-of-seo-content-writing-with-ai')
  ON CONFLICT DO NOTHING;

INSERT INTO project_posts (project_slug, post_slug)
  SELECT 'keyword-clustering', 'an-ml-and-llm-pipeline-for-keyword-clustering-in-seo'
  WHERE EXISTS (SELECT 1 FROM posts WHERE slug = 'an-ml-and-llm-pipeline-for-keyword-clustering-in-seo')
  ON CONFLICT DO NOTHING;

INSERT INTO project_posts (project_slug, post_slug)
  SELECT 'seo-quoting-agent', 'a-wrong-quote-that-looks-like-a-right-one'
  WHERE EXISTS (SELECT 1 FROM posts WHERE slug = 'a-wrong-quote-that-looks-like-a-right-one')
  ON CONFLICT DO NOTHING;

INSERT INTO project_posts (project_slug, post_slug)
  SELECT 'agentic-presentation-system', post_slug FROM series_posts WHERE series_slug = 'an-agentic-system-for-creating-presentations'
  ON CONFLICT DO NOTHING;

-- Flagship structure (authoritative; overrides the per-INSERT featured/sort/parent
-- above so a re-seed reproduces the live homepage): three top-level featured
-- works, then the rest as children hanging off the platform.
UPDATE projects SET parent_slug = NULL,                  featured = true,  sort_order = 1 WHERE slug = 'mini-search-engine';
UPDATE projects SET parent_slug = NULL,                  featured = true,  sort_order = 2 WHERE slug = 'agentic-ai-platform';
UPDATE projects SET parent_slug = NULL,                  featured = true,  sort_order = 3 WHERE slug = 'agentic-presentation-system';
UPDATE projects SET parent_slug = 'agentic-ai-platform', featured = false, sort_order = 4 WHERE slug = 'cms-publishing-pipeline';
UPDATE projects SET parent_slug = 'agentic-ai-platform', featured = false, sort_order = 5 WHERE slug = 'content-seo-ai';
UPDATE projects SET parent_slug = 'agentic-ai-platform', featured = false, sort_order = 6 WHERE slug = 'keyword-clustering';
UPDATE projects SET parent_slug = 'agentic-ai-platform', featured = false, sort_order = 7 WHERE slug = 'seo-quoting-agent';
