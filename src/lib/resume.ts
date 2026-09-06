// Professional history shown on the About page. Static on purpose — it changes
// rarely and doesn't belong in the post DB. Transcribed from LinkedIn
// (linkedin.com/in/hdviet). Durations are computed live from these start/end
// months in Resume.tsx, so "1 yr", "2 yrs 1 mo", "4 mos" stay current on their
// own — no manual editing when a month rolls over.

// Mot dong ket qua. `proof` la thu mot ban CV giay khong lam duoc: cau noi
// "toi da xay cai nay" nam ngay canh trang mo ta chinh cai do, bam vao doc
// duoc. Chi gan khi that su co trang chung minh — khong co thi de trong.
export interface Highlight {
  text: string;
  proof?: { label: string; slug: string };
}

export interface Role {
  title: string;
  type: string; // Full-time / Internship / Apprenticeship
  start: string; // "YYYY-MM"
  end?: string; // "YYYY-MM"; omit for a current (Present) role
  note?: string;
  // Ket qua cua vai tro, lay tu CV. Mot dong mot y — o day la cho duy nhat
  // tren site noi ve phan lanh dao: quy mo doi, muc tiet kiem thoi gian, so
  // nguoi da dao tao. Trang work noi ve co che, muc nay noi ve ket qua.
  highlights?: Highlight[];
}

export interface Company {
  company: string;
  url: string;
  logo: string; // path under /public
  location?: string;
  roles: Role[]; // newest first
}

export const EXPERIENCE: Company[] = [
  {
    company: "SEONGON",
    url: "https://seongon.com",
    logo: "/seongon-mark.png",
    location: "Hanoi, Vietnam · On-site",
    roles: [
      {
        title: "Artificial Intelligence Leader",
        type: "Full-time",
        start: "2025-08",
        end: "2026-08",
        highlights: [
          { text: "Founded the AI team and led five people." },
          {
            text: "Built the platform 120 people work on, with over twenty AI solutions running on it: agents, LLM workflows and machine learning.",
            proof: { label: "The platform", slug: "agentic-ai-platform" },
          },
          {
            text: "Wrote the standards every agent runs under: nonhuman identity, observability, evals, human-in-the-loop, feedback as a feature, cost tracking.",
          },
          {
            text: "Halved the time the SEO production chain takes. Internal linking and content outlines run up to five times faster, at the quality of senior staff.",
            proof: { label: "The writing agent", slug: "content-seo-ai" },
          },
          {
            text: "Trained 80% of the company to work with agentic AI, and more than fifty measurable outcomes came out of it.",
          },
        ],
      },
      {
        title: "AI Software Developer",
        type: "Full-time",
        start: "2025-05",
        end: "2025-08",
        note: "Built the first production AI systems for the SEO chain. The AI team formed around this work.",
      },
      {
        title: "CEO Operations Assistant",
        type: "Full-time",
        start: "2024-12",
        end: "2025-05",
        note: "Daily operations and quarterly planning with the CEO, plus the market research that shaped where the company put AI first. Promoted into the AI role from here.",
      },
      {
        title: "Startup Operations",
        type: "Apprenticeship",
        start: "2024-09",
        end: "2024-12",
      },
      {
        title: "Startup Idea Creator Intern",
        type: "Internship",
        start: "2024-07",
        end: "2024-09",
      },
    ],
  },
];

// Rendered on the About page and fed to the About-page JSON-LD
// (Person → hasCredential). Kept in the CV's order.
export interface Certification {
  name: string;
  issuer: string;
  // Khong phai chung chi nao cung co ngay/ma tra cuu — hai cai cuoi trong CV
  // khong co, va bat buoc chung thi phai bia ra.
  date?: string;
  credentialId?: string;
}

export const CERTIFICATIONS: Certification[] = [
  {
    name: "Generative AI Leader",
    issuer: "Google",
    date: "Feb 2026",
    credentialId: "09MYMWG33XSW",
  },
  {
    name: "Claude Code in Action",
    issuer: "Anthropic",
    date: "Mar 2026",
    credentialId: "59iufpg28ew3",
  },
  {
    name: "Google AI",
    issuer: "Google",
    date: "Feb 2026",
    credentialId: "V8RFXM0W2P2V",
  },
  {
    name: "Google Project Management Professional Certificate",
    issuer: "Coursera",
  },
  { name: "Data Analysis with Python", issuer: "freeCodeCamp" },
];

// Education. The site never said any of this, which hid the one fact that
// makes the rest of the page read differently: all of the work above was done
// while an undergraduate.
export interface School {
  school: string;
  // Moc thang that, chi bieu do dung. `start`/`end` la chuoi de doc
  // ("2027 (expected)") nen khong tinh toan duoc.
  span?: { from: string; to: string };
  url?: string;
  qualification: string;
  location?: string;
  start: string; // year
  end: string; // year, or "2027 (expected)"
  note?: string;
}

export const EDUCATION: School[] = [
  {
    school: "Foreign Trade University",
    span: { from: "2023-09", to: "2027-06" },
    url: "https://www.ftu.edu.vn/",
    qualification: "B.A., International Business",
    location: "Hanoi",
    start: "2023",
    end: "2027 (expected)",
  },
  {
    school:
      "High School for Gifted Students, Hanoi National University of Education",
    qualification: "English specialization",
    location: "Hanoi",
    start: "2020",
    end: "2023",
    note: "Two-time runner-up, HNUE Excellent Student Selection Exam in English.",
  },
];

// What the CV closes with, said in a way that means something. "Ambitious
// applications of AI in exciting niches" is a sentence any of ten thousand
// people could have written; naming what the domain has to contain is not.
// Nhung con so trong CV, dat thanh mot bang o dau trang. Tat ca deu lay
// nguyen tu CV — khong suy ra, khong lam tron len.
export interface Stat {
  value: string;
  label: string;
}

export const STATS: Stat[] = [
  { value: "120", label: "people use the platform I built, across 30 teams" },
  { value: "20+", label: "AI solutions running on it in production" },
  { value: "5", label: "people in the AI team I founded and led" },
  { value: "80%", label: "of the company trained to work with agentic AI" },
];

export const LOOKING_FOR =
  "Now looking for a domain with enough mechanism to take apart, where AI is the spearhead and the business outcome is the point.";

export const CV_URL = "/hoang-duc-viet-cv.pdf";

// Mot vai tro co mot dinh danh duy nhat, dung o ca hai cho: o vuong tren bieu
// do va muc tuong ung trong danh sach ben duoi. Bam vao thanh la nhay xuong
// dung vai tro do — bieu do tro thanh muc luc chu khong phai hinh trang tri.
export function roleId(title: string): string {
  return `role-${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}
