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
    location: "Vietnam · On-site",
    roles: [
      {
        title: "Artificial Intelligence Leader",
        type: "Full-time",
        start: "2025-08",
      },
      {
        title: "AI Software Developer",
        type: "Full-time",
        start: "2025-05",
        end: "2025-08",
      },
      {
        title: "CEO Operations Assistant",
        type: "Full-time",
        start: "2024-12",
        end: "2025-05",
        note: "Raised the company's operational quality through process optimization and applied AI & automation (Larksuite, n8n).",
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

// Kept for the About-page JSON-LD (Person → hasCredential). Not rendered on the
// page anymore, but still true and useful for entity/SEO. Add more here as needed.
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
