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
