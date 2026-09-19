// Nhung su kien co ich khi la DU LIEU chu khong phai chu.
//
// EXPERIENCE da quay lai theo yeu cau cua Viet. Can noi ro mot diem de khong ai
// hieu nham lan nua: day KHONG phai du lieu dong bo tu LinkedIn. Chua bao gio
// co sync. Day la du lieu tinh, go tay, va muon doi thi sua o file nay roi
// deploy. LinkedIn khong mo API doc profile cua chinh minh neu khong co quyen
// partner, nen mot "sync" that su khong lam duoc bang mot lan chinh sua.
//
// Cai ma trang lam duoc con to giay thi khong: moi con so thoi gian o day deu
// duoc tinh lai theo dong ho that luc render, nen khong bao gio cu.
//
//   EXPERIENCE      widget `experience` ve thanh dong thoi gian.
//   CERTIFICATIONS  jsonld.ts phat thanh Person -> hasCredential. Viet thanh
//                   chu trong bai thi du lieu co cau truc do bien mat. Widget
//                   `credentials` cung doc tu day.
//   EDUCATION       jsonld.ts phat thanh Person -> alumniOf. Khong hien tren
//                   trang nua.
//
// Khong co gi o day tu dong hien ra. Trang About chi ve nhung gi o Body tren
// CMS, cong widget nao duoc dat vao.

// Fed to the About-page JSON-LD (Person → hasCredential), and rendered by the
// `credentials` widget. Kept in the CV's order.
export interface Certification {
  name: string;
  issuer: string;
  // Khong phai chung chi nao cung co ngay/ma tra cuu — hai cai cuoi trong CV
  // khong co, va bat buoc chung thi phai bia ra.
  date?: string;
  credentialId?: string;
  // Trang tra cuu cua don vi cap, neu co. Co `url` thi ten chung chi thanh
  // duong dan bam duoc — mot chung chi kiem duoc khac han mot chung chi chi
  // duoc ke ra. Chua chung chi nao dien; khong tu doan URL.
  url?: string;
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

// Chi dung cho JSON-LD (Person → alumniOf). Khong hien tren trang.
export interface School {
  school: string;
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

export const CV_URL = "/hoang-duc-viet-cv.pdf";

export interface Highlight {
  text: string;
  proof?: { label: string; slug: string };
}

export interface Role {
  title: string;
  // Optional, because LinkedIn does not always carry one: the Agentic AI
  // Leader role has no employment type on the profile, and inventing
  // "Full-time" to fill the field would be inventing a fact.
  type?: string; // Full-time / Internship / Apprenticeship
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

// Transcribed from the LinkedIn profile itself, September 2026. The wording of
// the highlights is Viet's own from that profile, not a paraphrase of it.
//
// The version that was restored from git first had five roles and was wrong on
// four of them: an "Artificial Intelligence Leader" starting Aug 2025 (it is
// Agentic AI Leader, from May), plus an "AI Software Developer" and a "Startup
// Operations" apprenticeship that do not exist, and an intern role three months
// too short. That is what an old hand-typed copy decays into, and it is the
// argument for checking this against the profile whenever it changes.
//
// The four durations this produces match what LinkedIn prints, which is the
// cheapest available check that the dates were read correctly: 1 yr 4 mos,
// 6 mos, 6 mos, and 2 yrs 2 mos for the company.
export const EXPERIENCE: Company[] = [
  {
    company: "SEONGON",
    url: "https://seongon.com",
    // The official gradient mark. seongon.com itself only ships a 1920x278
    // wordmark set at 10% opacity as a background flourish, which is not a
    // thing you can put in a 24px square.
    logo: "/seongon-mark.png",
    location: "Hanoi, Vietnam · On-site",
    roles: [
      {
        // No employment type on this one: the profile does not give it one.
        title: "Agentic AI Leader",
        start: "2025-05",
        end: "2026-08",
        highlights: [
          {
            text: "Founded and led an AI team of 5 to deliver AI systems that transformed how the company does search marketing workloads.",
          },
          {
            text: "Built a Human-Agent collaboration platform serving 120 people, with over 20 AI solutions spanning AI Agents, LLM Workflows, and several Machine Learning workflows.",
            proof: { label: "The platform", slug: "agentic-ai-platform" },
          },
          {
            text: "Designed and implemented the platform's AI system standards: Nonhuman Identity, Observability, Evaluation, Human-in-the-loop (HITL), Feedback-as-a-feature, and Cost tracking.",
          },
          {
            text: "Delivered a 2x time reduction across the SEO production chain, with tasks like internal linking and content-outline generation taking up to 5 times less time than before, at the same quality as senior staff.",
            proof: { label: "The writing agent", slug: "content-seo-ai" },
          },
          {
            text: "Trained 80% of the company to use agentic AI (Claude Code), with more than 50 measurable outcomes after training.",
          },
        ],
      },
      {
        title: "CEO Operations Assistant",
        type: "Full-time",
        start: "2024-12",
        end: "2025-05",
        highlights: [
          {
            text: "Leveling up the company's operational quality with process optimization and application of AI and Automations (Larksuite, n8n).",
          },
          {
            text: "Assisting the CEO in managing the operational processes throughout the company.",
          },
        ],
      },
      {
        title: "Operation Intern",
        type: "Internship",
        start: "2024-07",
        end: "2024-12",
      },
    ],
  },
];
