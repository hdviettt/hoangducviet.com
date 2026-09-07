"use client";

import { EDUCATION, EXPERIENCE, roleId } from "@/lib/resume";
import { useEffect, useRef, useState } from "react";

// Hinh dang cua ca su nghiep, ve theo dung ty le thoi gian.
//
// Mot ban CV giay liet ke cac vai tro thanh mot danh sach: doc xong van khong
// biet cai nao dai bao lau, va tuyet doi khong thay duoc dieu quan trong nhat
// — toan bo phan viec nay nam gon BEN TRONG bon nam dai hoc. Hai thanh chong
// len nhau noi dieu do ma khong can mot cau nao.
//
// Moi con so o day tinh tu chinh du lieu trong resume.ts. Khong co mot toa do
// nao go tay, nen doi ngay thang trong CV la bieu do tu dich theo.

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Thang tinh tu nam 0, de tru hai moc ra so thang. */
function abs(ym: string): number {
  const [y, m] = ym.split("-").map(Number);
  return y * 12 + (m - 1);
}

const MAX_W = 880;
const H = 226;
const PAD = 2;

export default function CareerShape() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  // Mot don vi cua viewBox = mot pixel tren man hinh. Neu de he toa do co
  // dinh 880 roi cho SVG co gian, chu 12.5 don vi rot xuong con 5px tren dien
  // thoai. Do lai be ngang that va ve theo no thi co chu luon dung bang so da
  // dat, tren moi khung.
  const [W, setW] = useState(MAX_W);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width);
      if (w > 0) setW(Math.min(MAX_W, Math.max(300, w)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Ai tat hieu ung thi ve thang ket qua cuoi, khong doi cuon toi.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const uni = EDUCATION.find((e) => e.span);
  const company = EXPERIENCE[0];
  if (!uni?.span || !company) return null;

  // Truc thoi gian: tu ngay nhap hoc toi ngay tot nghiep du kien.
  const t0 = abs(uni.span.from);
  const t1 = abs(uni.span.to);
  const total = t1 - t0;
  const x = (ym: string) => PAD + ((abs(ym) - t0) / total) * (W - 2 * PAD);

  // Cac vai tro xep tu cu den moi, dung chieu doc cua truc.
  const roles = [...company.roles].reverse();
  const jobFrom = roles[0].start;
  const jobTo = roles[roles.length - 1].end;

  const now = new Date();
  const nowYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const nowX = Math.min(x(nowYm), W - PAD);

  // Vach nam: moi thang 1 nam trong khoang.
  const years: number[] = [];
  for (
    let y = Number(uni.span.from.slice(0, 4)) + 1;
    y <= Number(uni.span.to.slice(0, 4));
    y++
  ) {
    years.push(y);
  }

  const eduY = 60;
  const jobY = 132;
  const barH = 42;

  const grow = (delay: number) => ({
    transform: shown ? "scaleX(1)" : "scaleX(0)",
    transformOrigin: "left" as const,
    transformBox: "fill-box" as const,
    transition: "transform 900ms cubic-bezier(.2,.75,.25,1)",
    transitionDelay: `${delay}ms`,
  });

  return (
    <div ref={ref} className="mt-8">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        className="h-auto w-full"
        role="img"
        aria-label={`Timeline: ${uni.school} from ${uni.start} to ${uni.end}, with ${roles.length} roles at ${company.company} between ${jobFrom} and ${jobTo}, all inside those university years.`}
      >
        {/* Vach nam */}
        <g className="text-md-outline-variant">
          {years.map((y) => (
            <line
              key={y}
              x1={x(`${y}-01`)}
              x2={x(`${y}-01`)}
              y1={22}
              y2={H - 30}
              stroke="currentColor"
              strokeWidth={1}
            />
          ))}
        </g>
        <g className="text-md-on-surface-variant" fill="currentColor">
          {years.map((y) => (
            <text
              key={y}
              x={x(`${y}-01`) + 6}
              y={16}
              fontSize={12.5}
              opacity={0.75}
              className="tabular-nums"
            >
              {y}
            </text>
          ))}
        </g>

        {/* Dai hoc: mot thanh keo suot, vi no keo suot that */}
        <g className="text-md-on-surface-variant" fill="currentColor">
          <text x={PAD} y={eduY - 10} fontSize={12.5} opacity={0.9}>
            {W < 560 ? uni.school : `${uni.school} · ${uni.qualification}`}
          </text>
        </g>
        <g className="text-primary">
          <rect
            x={x(uni.span.from)}
            y={eduY}
            width={x(uni.span.to) - x(uni.span.from)}
            height={barH}
            rx={8}
            fill="currentColor"
            fillOpacity={0.09}
            stroke="currentColor"
            strokeOpacity={0.45}
            strokeWidth={1.5}
            style={grow(0)}
          />
        </g>

        {/* Cong viec: nam gon ben trong khoang tren */}
        <g className="text-md-on-surface-variant" fill="currentColor">
          <text x={x(jobFrom)} y={jobY - 10} fontSize={12.5} opacity={0.9}>
            {company.company} · {roles.length} roles
          </text>
        </g>
        <g className="text-primary">
          {roles.map((role, i) => {
            // Hai vai tro lien nhau dung chung mot thang (LinkedIn tinh ca
            // hai dau mut), nen neu cong them mot thang cho moi thanh thi
            // thanh truoc de len thanh sau. Hai lop mo chong nhau tao ra mot
            // vach dam gia — trong o day la sau vai tro chu khong phai nam.
            const next = roles[i + 1];
            const rx0 = x(role.start);
            const rx1 = next
              ? x(next.start)
              : role.end
                ? x(role.end) + (W - 2 * PAD) / total
                : nowX;
            const last = i === roles.length - 1;
            const w = Math.max(4, rx1 - rx0 - 2);
            return (
              <a
                key={role.title}
                href={`#${roleId(role.title)}`}
                className="cursor-pointer [&_rect]:transition-opacity hover:[&_rect]:opacity-75"
              >
                <g style={grow(160 + i * 90)}>
                  {/* Ten vai tro nam trong `title` de tro chuot doc duoc, va de
                    trinh doc man hinh khong chi thay mot o mau. */}
                  <title>{`${role.title} — ${role.start} to ${role.end ?? "now"}`}</title>
                  <rect
                    x={rx0 + 1}
                    y={jobY}
                    width={w}
                    height={barH}
                    rx={5}
                    fill="currentColor"
                    // Vai tro moi nhat dai nhat va nang nhat: to dam. Bon vai
                    // tro truoc no nhat dan ve phia qua khu, nhung phai cach
                    // nhau du de dem duoc la nam cai.
                    fillOpacity={last ? 1 : 0.16 + i * 0.1}
                    stroke="currentColor"
                    strokeOpacity={last ? 0 : 0.35}
                    strokeWidth={1}
                  />
                  {last && w > 96 && (
                    <text
                      x={rx0 + 13}
                      y={jobY + barH / 2 + 5}
                      fontSize={12.5}
                      fontWeight={500}
                      className="fill-md-surface"
                    >
                      {role.title.replace("Artificial Intelligence", "AI")}
                    </text>
                  )}
                </g>
              </a>
            );
          })}
        </g>

        {/* Hom nay */}
        <g className="text-md-on-surface-variant">
          <line
            x1={nowX}
            x2={nowX}
            y1={22}
            y2={H - 30}
            stroke="currentColor"
            strokeWidth={1.25}
            strokeDasharray="4 5"
            opacity={0.7}
          />
          <text
            x={nowX - 6}
            y={H - 16}
            fontSize={12.5}
            fill="currentColor"
            opacity={0.8}
            textAnchor="end"
          >
            {MONTHS[now.getMonth()]} {now.getFullYear()}
          </text>
        </g>
      </svg>

      <p className="mx-auto mt-5 max-w-[560px] md-body-medium text-md-on-surface-variant">
        Five roles in two years, ending in the one that ran longest. All of it
        inside a degree that is not finished yet — the dotted line is today, not
        graduation.
      </p>
    </div>
  );
}
