// Noi dung cua trang About.
//
// `resume.ts` giu HO SO: chuc danh, moc thoi gian, truong, chung chi — nhung
// thu mot to CV giay cung co. File nay giu LAP LUAN: trang About noi gi, va
// bang chung cho tung cau nam o dau tren chinh site nay.
//
// Ly do tach ra: ban truoc cua trang About la mot to CV duoc sap chu dep —
// bang so, danh sach kinh nghiem, tui cong cu, hoc van, chung chi. Doc xong
// biet duoc da lam gi, khong biet duoc vi sao nen tin, va khong biet nguoi
// nay dang di dau. Ba thu do la ly do trang ton tai; chung phai la noi dung
// co cau truc, khong phai chu roi trong JSX.

export interface Claim {
  /** Cau khang dinh. Ngan, dut khoat, dung mot y. */
  claim: string;
  /** Co che dang sau cau do — phan giai thich, khong phai phan tu khen. */
  body: string;
  /** Cac con so chong lung cho cau tren. Lay nguyen tu CV, khong lam tron. */
  figures: string[];
  /** Trang tren chinh site nay chung minh cau tren. */
  proof: { label: string; href: string };
}

// Ba cau, khong phai bon con so.
//
// Ban truoc mo dau bang mot bang bon con so: "120 nguoi", "20+ giai phap",
// "5 nguoi", "80%". Con so khong tu noi duoc y nghia cua no, va khong ai kiem
// duoc. O day moi con so nam duoi mot cau khang dinh no chong lung, va canh
// mot duong dan sang dung cai trang mo ta chinh no. Do la thu mot to CV
// khong lam duoc.
export const CLAIMS: Claim[] = [
  {
    claim: "A platform, not a pile of tools.",
    body:
      "The load-bearing layer went in first: single sign-on, a data warehouse " +
      "reading the whole company, one shared theme. The twenty-odd solutions " +
      "on top were only cheap to build because that layer already existed.",
    figures: ["120 people", "30 teams", "20+ solutions in production"],
    proof: { label: "The platform", href: "/work/agentic-ai-platform" },
  },
  {
    claim: "The bottleneck was never the model.",
    body:
      "Most of what I shipped was standards and plumbing — nonhuman identity, " +
      "observability, evals, human-in-the-loop, cost tracking. The systems " +
      "that failed did not fail because the model was not clever enough.",
    figures: ["80% of the company trained", "50+ measurable outcomes"],
    proof: {
      label: "Why our AI team failed",
      href: "/posts/why-our-ai-team-failed",
    },
  },
  {
    claim: "Domain knowledge decides what correct means.",
    body:
      "So I built a search engine from scratch — crawler, inverted index, " +
      "BM25, PageRank, a BERT reranker — and wrote up every part. You cannot " +
      "point AI at search without knowing how ranking actually works.",
    figures: ["9 parts", "built, then written up"],
    proof: {
      label: "Building a mini search engine",
      href: "/series/building-a-mini-search-engine",
    },
  },
];

// Cau chuyen. Truoc day o trong `profile.about_html` va gia tri that su cua no
// la "<p></p>" — nen trang About chua bao gio co doan nao noi nguoi nay la ai.
// Dua vao code de no thuc su hien ra.
//
// Doan mo KHONG duoc nhac lai tieu su o hero ("Former AI Leader at an SEO
// agency... led a team to deliver production AI systems"). Doc lien hai cai do
// la nghe cung mot cau hai lan. Nen doan mo ke CUNG DUONG — vao lam thuc tap
// van hanh, di ra sau hai nam — thu ma tieu su khong noi, va cung la dung thu
// bieu do ngay ben duoi ve ra.
export const STORY: string[] = [
  "I joined an SEO agency as an operations intern and left two years later " +
    "having built the AI platform it now runs on: 120 people across 30 teams, " +
    "more than twenty agents, LLM workflows and machine-learning systems in " +
    "production. In between I founded its AI team and led five people.",
  "I am twenty, and I have not finished my degree.",
  "The useful thing I learned is that model quality was never the constraint. " +
    "The systems that failed did not fail because the model was not clever " +
    "enough. They failed on the parts nobody demos: who is accountable when an " +
    "agent publishes something wrong, how anyone notices it went wrong at all, " +
    "and what “correct” even means in a domain the model has never " +
    "worked in. That last one is domain knowledge, and no better model supplies it.",
];

export interface Filter {
  title: string;
  body: string;
}

// Bon bo loc quyet dinh, viet cho nguoi doc chu khong phai cho ban than.
// Muc nay thay cho mot dong nghieng duy nhat o ban truoc; no la muc huu ich
// nhat trang doi voi nguoi dang can quyet dinh co nen lien he hay khong.
export const LOOKING_FOR_LEAD =
  "I am not looking for another agent-building job. I am looking for a domain " +
  "with enough mechanism in it to take apart, where AI is the spearhead and " +
  "the business outcome is the point.";

export const FILTERS: Filter[] = [
  {
    title: "Mechanism over novelty",
    body:
      "Enough moving parts that understanding them is an advantage. I want to " +
      "take something apart, not wrap an API in a chat box.",
  },
  {
    title: "AI as the spearhead",
    body:
      "The deliverable is a business result. AI is how it arrives before the " +
      "incumbent can move, not the thing being sold.",
  },
  {
    title: "It has to compound",
    body:
      "Work that stacks on the SEO and marketing domain I already know, " +
      "rather than starting a new pile from zero.",
  },
  {
    title: "It has to move",
    body:
      "Short feedback loops. I have no patience for a five-year payoff that " +
      "teaches you nothing in the meantime.",
  },
];

// Chung chi gom lai thanh MOT dong, dat trong muc ho so.
//
// character.md: "Confidence without credentialism — specificity of numbers,
// not titles or affiliations." Ban truoc ket thuc trang bang mot danh sach nam
// chung chi, trong do hai cai cuoi la Coursera va freeCodeCamp. Ket bang do la
// tu mau thuan voi chinh dinh vi cua minh.
export const CERTS_LINE =
  "Certified by Google (Generative AI Leader, Google AI) and Anthropic " +
  "(Claude Code in Action). Credential IDs are on the CV.";
