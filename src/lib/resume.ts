// Professional history shown on the About page. Static on purpose — it changes
// rarely and doesn't belong in the post DB. Transcribed from LinkedIn
// (linkedin.com/in/hdviet). Durations are computed live from these start/end
// months in Resume.tsx, so "1 yr", "2 yrs 1 mo", "4 mos" stay current on their
// own — no manual editing when a month rolls over.

export interface Role {
  title: string;
  type: string; // Full-time / Internship / Apprenticeship
  start: string; // "YYYY-MM"
  end?: string; // "YYYY-MM"; omit for a current (Present) role
  note?: string;
  // Ket qua cua vai tro, lay tu CV. Mot dong mot y — o day la cho duy nhat
  // tren site noi ve phan lanh dao: quy mo doi, muc tiet kiem thoi gian, so
  // nguoi da dao tao. Trang work noi ve co che, muc nay noi ve ket qua.
  highlights?: string[];
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
          "Founded and led an AI team of 5 delivering production AI systems.",
          "Built a human-agent collaboration platform serving 120 people, with over 20 AI solutions across agents, LLM workflows and machine learning.",
          "Set the platform's system standards: nonhuman identity, observability, evaluation, human-in-the-loop, feedback-as-a-feature, cost tracking.",
          "Delivered a 2x time reduction across the SEO production chain; internal linking and content-outline generation up to 5x faster, at the quality of senior staff.",
          "Trained 80% of the company on agentic AI (Claude Code), with more than 50 measurable outcomes after training.",
        ],
      },
      {
        title: "AI Software Developer",
        type: "Full-time",
        start: "2025-05",
        end: "2025-08",
        note: "Built the first production AI systems for the SEO chain; the AI team formed around this work.",
      },
      {
        title: "CEO Operations Assistant",
        type: "Full-time",
        start: "2024-12",
        end: "2025-05",
        note: "Worked with the CEO on daily operations and quarterly planning, ran market-intelligence work that shaped the company's AI moves, and raised operational quality through process optimization and automation (Larksuite, n8n). Promoted into the AI role from here.",
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

// What the CV closes with, and what the site never said. A visitor who likes
// the work needs to know whether you are reachable for it.
export const LOOKING_FOR =
  "Now looking for ambitious applications of AI in exciting niches.";

export const CV_URL = "/hoang-duc-viet-cv.pdf";
