// Nhung su kien co ich khi la DU LIEU chu khong phai chu.
//
// Truoc day file nay con giu ca bang kinh nghiem chep tay tu LinkedIn, va no
// duoc do thang ra trang About. Phan do da bo: cau chuyen gio Viet tu viet
// tren CMS. Con lai dung hai thu, va moi thu deu con o day vi mot ly do cu the:
//
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
