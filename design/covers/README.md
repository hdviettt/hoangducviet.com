# Cover Design System v3 — "SEONGON Flow"

Hệ thumbnail/cover cho mọi bài viết: độ mềm/fluid của Google/DeepMind hòa với
nhận diện SEONGON (nguồn: `Downloads/seongon-assets`, bản 22 Jun). Việt không bao giờ phải tự thiết kế — đưa
slug + một câu tóm ý bài, Claude sinh cover theo hệ này bằng
`design/covers/generate.py`.

(v1 "Technical Blueprint" và v2 "Fluid Gradient" thuần Google đã bị thay thế —
xem git history.)

## Ngôn ngữ

Mỗi cover là một **tác phẩm gradient trừu tượng** gợi ý tưởng của bài, không
minh họa kỹ thuật, không chữ nghĩa, không stock/AI-art. Ba lớp cố định:

1. **Nền gradient sáng** — hai tông pastel cùng họ, chéo nhẹ.
2. **Blob màu mờ** — 2-3 hình tròn lớn qua Gaussian blur (stdDev ~55), trôi rất chậm.
3. **Một khối focal sắc nét** — orb thủy tinh / khối glass trắng mờ / spark 4 cánh
   kiểu Gemini / capsule. MỘT ý mỗi cover, không nhồi.

### Palette — brand SEONGON

- **Prosperous Blue** `#004aef` · **Future Green** `#07ef9c` — gradient
  blue→green (`url(#brand)`) là chữ ký, dùng cho khối focal chính.
- **Transform Cyan** `#0fd6f7` · **Breakthrough Yellow** `#ffce00` — CHỈ làm
  accent (spark, chấm, mảnh nhỏ), không bao giờ làm nền lớn.
- Tints của 4 màu trên (khai báo trong `TINTS`) dùng cho blob mờ và nền.
- KHÔNG dùng màu ngoài họ brand (không đỏ, tím, hồng — trừ tint pha từ brand).

### Chữ ký hình khối: ECHO OUTLINES

Kế thừa keyvisual "AI-FIRST": khối focal đổ gradient brand, phía sau là 2-4
lớp outline cùng hình dáng trượt chéo xuống-trái, opacity nhạt dần
(`echo_rrect`, `echo_circle` trong generate.py). Đây là dấu vân tay của hệ —
mọi cover có ít nhất một khối mang echo.

### Series treatment

Mọi part trong một series dùng chung MỘT motif định danh (với Mini Search Engine:
orb + orbit + spark) và xoay vòng 8 họ màu theo số part, kèm **numeral lớn mờ**
(01-08) góc trái. Đứng cạnh nhau trên series showcase, cả dải đọc như một bộ
sưu tập cầu vồng. Cover của cả series (`series-<slug>.svg`) = motif định danh
với đủ 8 chấm màu.

### Animation (SVG + CSS, chạy trong thẻ `<img>`)

Ambient, chậm, không giật: `drift` (blob trôi 18-24s alternate), `float`
(focal nhấp nhô 12s), `spin` (orbit quay 60s), `sparkle` (spark thở 6s).
Luôn có `prefers-reduced-motion` guard. KHÔNG: nhấp nháy nhanh, đổi màu nền.

### Khung kỹ thuật

- Canvas 1200×630 (OG ratio). Feed row crop vuông giữa bằng `object-cover`
  → khối focal đặt lệch phải/giữa, tránh dồn hết ra rìa.
- File tại `public/covers/<slug>.svg`, sống trong git, không cần R2.
- Set `posts.thumbnail = "/covers/<slug>.svg"` bằng
  `railway run --service database node scripts/set-post-thumbnail.cjs <slug> <url>`
  (nhớ `MSYS_NO_PATHCONV=1` trên Git Bash).

## Quy trình

1. Việt đưa: slug + một câu tóm ý (hoặc chỉ cần bảo "làm cover cho bài mới").
2. Claude chọn họ màu + motif, thêm entry vào `COVERS` trong `generate.py`, chạy
   generator, render preview trình duyệt trong chat.
3. Việt duyệt/veto. Duyệt → commit + set thumbnail.

## Nguyên tắc chất lượng

- Một cover = một ý, đọc được ở cỡ 144px.
- Focal sắc nét nằm trên blob mờ — luôn có tương phản giữa "nét" và "sương".
- Test cả light lẫn dark mode của feed (nền cover tự sáng nên nổi trên dark).
- Motif mới cho chủ đề mới thì thêm helper vào generate.py, đừng one-off ngoài hệ.
