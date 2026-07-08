// Professional history shown on the About page. Static on purpose — it changes
// rarely and doesn't belong in the post DB. Transcribed from the LinkedIn
// profile (linkedin.com/in/hdviet). Edit here to update.

export interface Role {
  title: string;
  type: string; // Full-time / Internship / Apprenticeship
  period: string; // "Aug 2025 — Present"
  length?: string; // "1 yr"
  note?: string;
}

export interface Company {
  company: string;
  url: string;
  logo: string; // path under /public
  duration: string; // total tenure, e.g. "2 yrs 1 mo"
  location?: string;
  roles: Role[]; // newest first
}

export const EXPERIENCE: Company[] = [
  {
    company: "SEONGON",
    url: "https://seongon.com",
    logo: "/seongon-mark.png",
    duration: "2 yrs 1 mo",
    location: "Vietnam · On-site",
    roles: [
      {
        title: "Artificial Intelligence Leader",
        type: "Full-time",
        period: "Aug 2025 — Present",
        length: "1 yr",
      },
      {
        title: "AI Software Developer",
        type: "Full-time",
        period: "May 2025 — Aug 2025",
        length: "4 mos",
      },
      {
        title: "CEO Operations Assistant",
        type: "Full-time",
        period: "Dec 2024 — May 2025",
        length: "6 mos",
        note: "Raised the company's operational quality through process optimization and applied AI & automation (Larksuite, n8n).",
      },
      {
        title: "Startup Operations",
        type: "Apprenticeship",
        period: "Sep 2024 — Dec 2024",
        length: "4 mos",
      },
      {
        title: "Startup Idea Creator Intern",
        type: "Internship",
        period: "Jul 2024 — Sep 2024",
        length: "3 mos",
      },
    ],
  },
];

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
}

export const CERTIFICATIONS: Certification[] = [
  {
    name: "Claude Code in Action",
    issuer: "Anthropic",
    date: "Mar 2026",
    credentialId: "59iufpg28ew3",
  },
  {
    name: "Generative AI Leader",
    issuer: "Google",
    date: "Feb 2026",
    credentialId: "09MYMWG33XSW",
  },
  {
    name: "Google AI",
    issuer: "Google",
    date: "Feb 2026",
    credentialId: "V8RFXM0W2P2V",
  },
  {
    name: "Google AI Essentials",
    issuer: "Google",
    date: "Oct 2024",
    credentialId: "5O5QANPBFNVI",
  },
];
