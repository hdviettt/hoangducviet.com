"use client";

import { Icon } from "@/components/ui/Icon";
import { CERTIFICATIONS, CV_URL } from "@/lib/resume";

// Khoi giay to: mot nut tai CV, va cac chung chi.
//
// Thay cho widget `record` cu — cai do dung nguyen ban kinh nghiem chep tu
// LinkedIn. Phan cau chuyen gio Viet tu viet tren CMS; o day chi con nhung thu
// co ich khi la DU LIEU chu khong phai chu:
//
//   * `jsonld.ts` doc CERTIFICATIONS de phat Person -> hasCredential. Viet
//     thanh chu trong bai thi du lieu co cau truc do bien mat.
//   * Ma tra cuu di kem tung chung chi. Mot chung chi khong kem ma thi khong
//     ai kiem duoc; co ma thi no thanh thu doi chieu duoc, khong phai loi khai.
//
// `url` la tuy chon va hien chua chung chi nao co. Khi nao co trang tra cuu
// that thi dien vao `lib/resume.ts`, ten chung chi se thanh duong dan. Khong
// tu doan URL tra cuu cua Google hay Anthropic o day.

export default function Credentials() {
  return (
    <div className="about-credentials my-10 rounded-xl border border-md-outline-variant p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="md-label-large uppercase tracking-widest text-md-on-surface-variant">
          Credentials
        </h3>
        <a
          href={CV_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="md-btn md-btn-outlined md-btn-pill md-btn-sm no-underline"
        >
          <Icon name="picture_as_pdf" size={18} aria-hidden="true" />
          Download CV
        </a>
      </div>

      <ul className="mt-6 space-y-4">
        {CERTIFICATIONS.map((c) => (
          <li
            key={c.name}
            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-md-outline-variant pt-4 first:border-t-0 first:pt-0"
          >
            <div className="min-w-0">
              <span className="md-body-large leading-snug text-md-on-surface">
                {c.url ? (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-underline transition-colors hover:text-primary"
                  >
                    {c.name}
                  </a>
                ) : (
                  c.name
                )}
              </span>
              {c.credentialId && (
                <p className="mt-0.5 font-mono text-[12px] leading-4 text-md-on-surface-variant">
                  {c.credentialId}
                </p>
              )}
            </div>
            <span className="shrink-0 md-body-small text-md-on-surface-variant">
              {c.issuer}
              {c.date ? ` · ${c.date}` : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
