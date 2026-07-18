# Cover Design System — hoangducviet.com

Hệ thumbnail/cover cho mọi bài viết. Mục tiêu: người đọc lướt feed nhận ra bài của
Việt trước khi đọc tên; Việt không bao giờ phải tự thiết kế — mô tả bài viết là đủ,
Claude sinh cover theo hệ này.

## Ngôn ngữ: "Technical Blueprint"

Mọi cover là một **bản vẽ kỹ thuật** của ý tưởng trong bài — không minh họa văn học,
không stock photo, không AI-art. Bài nói về pipeline thì vẽ schematic pipeline; bài
nói về cache miss thì vẽ timeline hai request. Show, don't tell.

### Khung cố định (mọi cover)

- **Canvas**: 1200×630 (tỉ lệ OG). Nội dung chính nằm trong safe-zone vuông trung tâm
  630×630 — feed rows crop vuông bằng `object-cover` nên rìa trái/phải có thể mất.
- **Nền**: navy `#0D2E6B` + lưới kép (40px mờ 8%, 200px mờ 16%) + vài dấu `+` ở giao điểm.
- **Nét vẽ**: trắng `#FFFFFF` 2-2.5px cho khối chính; xanh nhạt `#8AB4F8` 1.2-1.5px
  cho chi tiết phụ và dimension lines; vàng `#F9AB00` CHỈ cho một điểm nhấn duy nhất
  (threshold, LLM node, điểm miss...). Kỷ luật: tối đa 3 màu mực trên nền navy.
- **Chữ**: JetBrains Mono / monospace, UPPERCASE cho nhãn, 14-18px. Nhãn là spec
  thật ("ARTIFACT-01", "0 TOKENS/RUN"), không phải caption văn xuôi.
- **Title block** (con dấu nhận diện, góc phải-dưới, mọi cover đều có):
  khung 370×100, 3 hàng: `HOANGDUCVIET.COM` / `DOC. <mã bài>` + `SHEET NN` /
  `SCALE <easter egg>` + `REV. <chữ cái>`. Easter egg SCALE ăn theo nội dung bài
  (vd bài 55 agents → `SCALE 1:55`).

### Animation (SVG + CSS keyframes, chạy được trong thẻ `<img>`)

Chuẩn mực DeepMind: ambient, chậm, lặp vô hạn, không giật.

- **March**: đường dashed chảy (`stroke-dashoffset` loop 3-6s, linear) — dòng dữ liệu.
- **Pulse**: phần tử nhấn sáng tuần tự (`opacity` 0.4→1, mỗi nhịp 1.2s, stagger).
- **Draw**: nét vẽ tự hoàn thành một lần khi load (`stroke-dasharray` draw-in 1.5s)
  rồi giữ nguyên.
- KHÔNG: xoay, bounce, đổi màu nền, blink nhanh <0.8s.
- Luôn bọc trong `@media (prefers-reduced-motion: reduce) { * { animation: none } }`.

### Motif theo chủ đề (chọn khi sinh cover)

| Chủ đề bài | Motif schematic |
|---|---|
| Pipeline / agent vận hành | chuỗi hộp nối mũi tên, node LLM vàng, threshold dashed |
| Kiến trúc / blueprint / org | sơ đồ khối + dimension lines + nhãn ownership |
| Kinh tế token / đo đạc | timeline / bar đo bằng nét, con số monospace lớn |
| Search engine series | crawler/index/rank schematic, giữ số `#N` của series |
| Văn hóa / Trung Quốc / opinion | vẫn blueprint nhưng motif bản đồ/độ thị quan hệ |
| Failure / post-mortem | schematic có phần gạch đỏ `#D93025` REV bị đóng dấu |

## Quy trình làm việc

1. Việt (hoặc pipeline đăng bài) đưa: slug + 1 câu tóm ý bài.
2. Claude sinh SVG vào `public/covers/<slug>.svg` (tĩnh) — bài flagship thì thêm
   bản động cùng tên (animation nhúng trong chính file đó).
3. Preview render → Việt duyệt/veto trong chat.
4. Set `posts.thumbnail = "/covers/<slug>.svg"` (script `scripts/set-post-date.cjs`
   pattern — hoặc admin). File sống trong git, versioned, không cần R2.

## Nguyên tắc chất lượng

- Một cover = MỘT ý. Không nhồi cả bài vào hình.
- Mọi nhãn phải đúng sự thật trong bài (số, tên bước) — cover là spec, spec không bịa.
- Nhìn ở cỡ thumbnail 144px vẫn phải đọc được hình khối chính (test bằng cách thu nhỏ).
- Đồng bộ với hệ hình trong bài (visuals/ style A nền sáng): cover navy đậm là "bìa",
  hình trong bài nền sáng là "ruột" — cùng palette Google, hai vai khác nhau.
