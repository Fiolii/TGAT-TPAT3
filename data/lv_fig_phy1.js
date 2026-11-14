// รูปบนกระดาน ฟิสิกส์ กลศาสตร์ (บท 1.1–1.7) ระดับข้อสอบจริง / สอวน
// ตัวเลขในรูปคำนวณจากโจทย์ของแต่ละข้อ — ตรวจเฉลยตรงกับกระดานแล้ว

LF('phy-1-1', 'exam', 0, 420, 250, H => { const { T, ln, ar, dim, gd, dot, note } = H, yG = 222, yT = 22, yB = 151;
  return [
    ln(40, yG, 200, yG, 'ink', 3) + T(120, yG + 16, 'พื้น', 'mute', 'middle', 12, 600) + gd(120, yT, 120, yG) + dot(120, yT, 'ink', 7) + T(134, yT + 4, 'ปล่อย  u = 0', 'ink', 'start', 13, 700, 150),
    dot(120, yB, 'warn', 6) + T(134, yB + 4, 'จุด B: อีก 1 s ถึงพื้น', 'warn', 'start', 13, 700, 160) + dim(80, yB, 80, yG, '45 m', -8, 'warn'),
    dim(215, yT, 215, yG, 'H = ?', 8, 'pri'),
    note(250, 70, ['ตกทั้งหมด t = 5 s', 'H = ½gt² = 125 m', 'v = gt = 50 m/s'], 'ok', 13, 'start', 19, 160) + ar(120, yG - 40, 120, yG - 4, 'ok', 3.2)
  ]; });

LF('phy-1-1', 'olym', 0, 420, 260, H => { const { T, ln, ar, ar2, dim, dot, note, pa } = H, xu = 110, xd = 190, yAp = 38, yB = 56, yA = 200;
  return [
    pa(`M${xu},${yA} L${xu},${yAp + 6} Q${(xu + xd) / 2},${yAp - 14} ${xd},${yAp + 6} L${xd},${yA}`, 'mute', 2.2, '6 4') + ar(xu, yA - 30, xu, yA - 80, 'pri', 3) + ar(xd, yA - 80, xd, yA - 30, 'warn', 3) + T(150, yAp - 10, 'จุดสูงสุด', 'mute', 'middle', 12, 600) + T(xu - 8, yA - 55, 'ขึ้น', 'pri', 'end', 12, 600) + T(xd + 8, yA - 55, 'ลง', 'warn', 'start', 12, 600),
    ln(70, yB, 215, yB, 'mute', 1.6, '4 4') + ar2(xu, yB, xd, yB, 'warn', 2) + T(150, yB - 6, '2.0 s', 'warn', 'middle', 13) + dot(xu, yB, 'warn', 4.5) + dot(xd, yB, 'warn', 4.5) + T(64, yB + 4, 'B', 'warn', 'end', 14),
    ln(70, yA, 215, yA, 'mute', 1.6, '4 4') + ar2(xu, yA, xd, yA, 'ok', 2) + T(150, yA - 6, '6.0 s', 'ok', 'middle', 13) + dot(xu, yA, 'ok', 4.5) + dot(xd, yA, 'ok', 4.5) + T(64, yA + 4, 'A', 'ok', 'end', 14),
    dim(240, yAp, 240, yB, '5 m', 8, 'warn') + dim(240, yB, 240, yA, '40 m', 8, 'ok'),
    note(24, 232, ['B ห่างจุดสูงสุด 1 s , A ห่างจุดสูงสุด 3 s  →  ลึกลงมา 5 m และ 45 m', 'AB = 45 − 5 = 40 m ;  v_A = g·3 = 30 m/s'], ['mute', 'ok'], 12.5, 'start', 20, 380)
  ]; });

LF('phy-1-2', 'exam', 0, 420, 272, H => { const { T, ln, ar, ar2, box, F, gd, chip, pol } = H, cx = 190, cy = 112;
  const fx = pol(cx, cy, 80, 37), fy = pol(cx, cy, 60, 90);
  return [
    ln(50, cy + 28, 370, cy + 28, 'ink', 3) + box(cx - 40, cy - 28, 80, 56, 'm = 20 kg', 'pri') + F(cx, cy, 37, 96, 'F = 100 N', 'warn'),
    F(cx, cy, -90, 62, 'W = 200 N', 'bad') + F(cx, cy, 90, 56, 'N', 'ok'),
    ln(cx, cy, cx + 77, cy, 'ok', 1.8, '4 4') + ln(cx + 77, cy, cx + 77, cy - 58, 'bad', 1.8, '4 4') + T(cx + 46, cy + 17, 'F cosθ = 80', 'ok', 'start', 11.5, 700, 90) + T(cx + 84, cy - 28, 'F sinθ = 60', 'bad', 'start', 11.5, 700, 90),
    F(cx, cy, 180, 55, 'f', 'warn') + chip(210, 224, 'N = mg − F sinθ = 200 − 60 = 140 N', 'ok', 13, { maxW: 400 }),
    chip(210, 254, 'f = μN = 28 N  →  a = (80 − 28)/20 = 2.6 m/s²', 'pri', 13, { maxW: 400 })
  ]; });

LF('phy-1-2', 'olym', 0, 420, 262, H => { const { T, ln, ar, box, chip, note } = H, yG = 148;
  return [
    ln(40, yG, 380, yG, 'ink', 3) + box(150, yG - 48, 110, 48, 'B  4 kg', 'pri') + box(170, yG - 90, 70, 42, 'A  2 kg', 'warn') + ar(262, yG - 24, 345, yG - 24, 'ok', 3.5) + T(348, yG - 20, 'F', 'ok', 'start', 15),
    ar(205, yG - 66, 238, yG - 66, 'bad', 2.6) + T(264, yG - 74, 'f_AB บน A', 'bad', 'start', 12, 700, 90) + ar(205, yG - 24 + 12, 160, yG - 12, 'bad', 2.4) + T(100, yG - 28, 'f บน B', 'bad', 'end', 12, 700, 54),
    ar(240, yG + 22, 150, yG + 22, 'mute', 2.4) + T(195, yG + 38, 'f_โต๊ะ = 0.1·60 = 6 N', 'mute', 'middle', 12, 700, 190),
    chip(210, 205, '(ก)  A ไม่ไถล: a ≤ μg = 5  →  F_max = 6·5 + 6 = 36 N', 'ok', 12.5, { maxW: 404 }),
    chip(210, 238, '(ข)  F = 48 N > 36 N : a_A = 5 , a_B = (48 − 6 − 10)/4 = 8 m/s²', 'pri', 12.5, { maxW: 404 })
  ]; });

LF('phy-1-3', 'exam', 0, 420, 266, H => { const { T, ln, ar, ar2, dim, F, dot, chip, gd } = H, wx = 60, yG = 205, bx = 180, ty = 45;
  const px = 100, py = yG - (bx - px) / 120 * 160;
  return [
    ln(wx, 20, wx, yG, 'ink', 4) + ln(wx - 6, yG, 380, yG, 'ink', 3) + ln(bx, yG, wx, ty, 'pri', 5) + T(wx - 8, 18, 'ผนังลื่น', 'mute', 'end', 11.5, 600, 50) + dim(wx, yG + 18, bx, yG + 18, '3 m', 8, 'mute') + dim(wx - 24, ty, wx - 24, yG, '4 m', -6, 'mute'),
    ar(120, 125, 120, 163, 'bad', 3.2) + T(112, 152, '200 N', 'bad', 'end', 12.5, 700, 44) + dot(120, 125, 'bad', 4.5) + ar(px, py, px, py + 38, 'warn', 3.2) + T(px - 8, py + 30, '600 N', 'warn', 'end', 12.5, 700, 56) + dot(px, py, 'warn', 5) + dim(px, yG + 40, bx, yG + 40, '2 m', 8, 'warn') + gd(px, py + 40, px, yG + 40, 'warn'),
    F(wx, ty, 0, 60, 'N_w', 'ok') + ar(bx, yG, bx, yG - 56, 'ok', 3.2) + T(bx + 8, yG - 28, 'N_f = 800 N', 'ok', 'start', 12.5, 700, 110),
    F(bx, yG, 180, 56, 'f', 'bad') + chip(300, 78, 'โมเมนต์รอบปลายล่าง', 'mute', 12, { maxW: 220 }) + chip(300, 103, 'N_w·4 = 200·1.5 + 600·2', 'ok', 12, { maxW: 220 }),
    chip(300, 128, 'N_w = f = 375 N', 'ok', 13, { maxW: 220 }) + chip(300, 153, 'μ_s ≥ 375/800 ≈ 0.47', 'pri', 13, { maxW: 220 })
  ]; });

LF('phy-1-3', 'olym', 0, 420, 250, H => { const { T, ln, rot, R, dot, gd, ang, chip } = H, th = 21.8, x0 = 50, y0 = 220, x1 = 370, y1 = y0 - 320 * 0.4;
  const bxw = 200, byw = y0 - (bxw - x0) * 0.4, cgx = 181.4;
  return [
    ln(x0, y0, x1, y0, 'ink', 3) + ln(x0, y0, x1, y1, 'ink', 3) + ang(x0, y0, 46, 0, th, 'θ', 'ink', 13) + rot(bxw, byw, -th, R(-20, -100, 40, 100, { c: 'pri', f: 'pri', fo: 0.16, sw: 2.4 }) + dot(0, -50, 'warn', 4.5)),
    T(cgx - 8, 100, 'จุดศูนย์กลางมวล', 'warn', 'end', 12, 700, 110) + gd(cgx, 114, cgx, y0, 'warn') + T(cgx, y0 + 14, 'แนวของ mg ตกที่ขอบล่าง', 'warn', 'middle', 11.5, 700, 150),
    chip(300, 40, 'ล้ม: tanθ = b/h = 0.4 → 21.8°', 'ok', 12.5, { maxW: 232 }),
    chip(300, 70, 'ลื่น: tanθ = μ = 0.6 → 31°', 'mute', 12.5, { maxW: 232 }),
    chip(300, 100, '21.8° < 31°  →  ล้มก่อนลื่น', 'bad', 13, { maxW: 232 })
  ]; });

LF('phy-1-4', 'exam', 0, 420, 270, H => { const { T, ln, rot, R, F, chip, ang } = H, x0 = 40, y0 = 205, x1 = 380, y1 = 85, th = Math.atan2(y0 - y1, x1 - x0) * 180 / Math.PI;
  const sx = 190, sy = y0 - (sx - x0) * (y0 - y1) / (x1 - x0), cx = sx - 0.332 * 15 * 0.97, cy = sy - 14;
  return [
    ln(x0, y0, x1, y0, 'ink', 3) + ln(x0, y0, x1, y1, 'ink', 3) + rot(sx, sy, -th, R(-40, -28, 80, 28, { c: 'pri', f: 'pri', fo: 0.18, sw: 2.2 }) + T(0, -9, 'รถ 1,000 kg', 'pri', 'middle', 11.5, 700, 72)) + T(56, 88, 'sinθ = 0.1', 'ink', 'start', 12.5, 700, 90) + T(56, 106, 'v = 15 m/s คงที่', 'mute', 'start', 12, 700, 110),
    F(cx, cy, 180 + th, 38, 'ต้าน 600 N', 'bad') + F(cx - 4, cy + 26, 180 + th, 38, 'mg sinθ = 1000 N', 'warn'),
    F(cx, cy, th, 110, 'F', 'ok'),
    chip(210, 226, 'v คงที่  →  F = 600 + 1000 = 1600 N', 'ok', 13, { maxW: 400 }) + chip(210, 254, 'P = Fv = 24 kW ;  ถนนราบ v = P/600 = 40 m/s', 'pri', 13, { maxW: 400 })
  ]; });

LF('phy-1-4', 'olym', 0, 420, 272, H => { const { T, ln, ar, O, pa, dot, dim, F, chip } = H, cx = 270, cy = 122, R0 = 66, yG = cy + R0;
  return [
    ln(40, yG, 400, yG, 'ink', 3) + pa(`M44,30 Q120,140 170,${yG} L${cx},${yG}`, 'pri', 3) + O(cx, cy, R0, { c: 'ink', sw: 2.4 }) + dot(44, 30, 'warn', 7) + dim(26, 30, 26, yG, 'h', -4, 'mute') + T(52, 22, 'ปล่อยจากหยุดนิ่ง', 'warn', 'start', 12, 700, 120),
    ln(cx, cy, cx, cy - R0, 'mute', 1.6) + T(cx + 6, cy - 28, 'R', 'mute', 'start', 13) + dot(cx, cy - R0, 'ok', 5),
    F(cx - 14, cy - R0 + 4, -90, 34, 'mg', 'bad') + F(cx + 14, cy - R0 + 4, -90, 34, 'N', 'ok'),
    F(cx, yG - 3, 90, 44, 'N', 'ok'),
    chip(210, 224, '(ก) จุดสูงสุด: mg = mv²/R  →  h_min = 2.5R', 'ok', 12.5, { maxW: 404 }),
    chip(210, 250, '(ข) h = 3R : N_บน = mg ,  N_ล่าง = 7mg', 'pri', 12.5, { maxW: 404 })
  ]; });

LF('phy-1-5', 'exam', 0, 420, 258, H => { const { T, ln, ar, R, dot, dim, chip, pa } = H, px = 210, py = 22, L = 130, bx = px, by = py + L, h = 30, bx2 = px + Math.sqrt(L * L - (L - h) * (L - h)), by2 = by - h;
  return [
    ln(120, py, 300, py, 'ink', 4) + ln(px, py, bx, by - 14, 'ink', 2) + R(bx - 24, by - 14, 48, 28, { c: 'pri', f: 'pri', fo: 0.2 }) + T(bx, by + 5, 'M = 1.98 kg', 'pri', 'middle', 11, 700, 44) + ar(60, by, 180, by, 'warn', 3.5) + dot(100, by, 'warn', 6) + T(70, by - 12, 'm = 20 g', 'warn', 'start', 12, 700, 70) + T(70, by + 22, 'v = ?', 'warn', 'start', 13),
    ar(bx + 26, by, bx + 66, by, 'ok', 3) + T(bx + 30, by + 22, 'V (ชนแล้วติดกัน)', 'ok', 'start', 12, 700, 130),
    ln(px, py, bx2, by2 - 14, 'mute', 1.6, '5 4') + R(bx2 - 24, by2 - 14, 48, 28, { c: 'mute', sw: 1.6, d: '5 4' }) + dim(bx2 + 36, by2, bx2 + 36, by, 'h = 0.20 m', 6, 'ok'),
    chip(210, 205, 'V = √(2gh) = 2 m/s ;  (m+M)V = mv  →  v = 200 m/s', 'ok', 12.5, { maxW: 404 }),
    chip(210, 236, 'พลังงานสูญเสีย = 400 − 4 = 396 J', 'bad', 13, { maxW: 404 })
  ]; });

LF('phy-1-5', 'olym', 0, 420, 270, H => { const { T, ln, ar, O, dot, dim, pa, note } = H, yG = 232, c1 = 100, c2 = 240, c3 = 362;
  return [
    ln(40, yG, 400, yG, 'ink', 3) + T(c1, 18, 'ก่อนปล่อย', 'mute', 'middle', 12.5, 700, 90) + T(c2, 18, 'ถึงพื้น', 'mute', 'middle', 12.5, 700, 90) + T(c3, 18, 'หลังชนกัน', 'mute', 'middle', 12.5, 700, 90)
      + O(c1, 108, 22, { c: 'pri', f: 'pri', fo: 0.2 }) + T(c1, 113, '3m', 'pri', 'middle', 13) + O(c1, 75, 12, { c: 'warn', f: 'warn', fo: 0.3 }) + T(c1, 79, 'm', 'warn', 'middle', 11) + dim(34, 130, 34, yG, '1.25 m', 6, 'mute'),
    O(c2, 210, 22, { c: 'pri', f: 'pri', fo: 0.2 }) + O(c2, 176, 12, { c: 'warn', f: 'warn', fo: 0.3 }) + ar(c2 - 36, 214, c2 - 36, 176, 'pri', 3.2) + T(c2 - 40, 196, '5', 'pri', 'end', 13) + ar(c2 + 36, 150, c2 + 36, 190, 'warn', 3.2) + T(c2 + 42, 172, '5 m/s', 'warn', 'start', 12, 700, 60),
    O(c3, 210, 22, { c: 'pri', f: 'pri', fo: 0.2 }) + T(c3, 215, 'v = 0', 'pri', 'middle', 11.5, 700, 40) + O(c3, 176, 12, { c: 'warn', f: 'warn', fo: 0.3 }) + ar(c3, 160, c3, 112, 'warn', 3.4) + T(c3 + 10, 138, '10 m/s', 'warn', 'start', 12.5, 700, 56),
    O(c3, 52, 12, { c: 'warn', sw: 1.6, d: '4 3' }) + dim(c3 - 34, 52, c3 - 34, 176, 'h = 5 m', -4, 'ok'),
    note(24, 258, ['ชนยืดหยุ่น: v₁′ = 0 , v₂′ = 10 m/s  →  h = v²/2g = 5 m'], 'ok', 12.5, 'start', 17, 372)
  ]; });

LF('phy-1-6', 'exam', 0, 420, 266, H => { const { T, ln, dot, F, ang, chip, dim, ar } = H, px = 210, py = 24, L = 130, bx = px + L * 0.6, by = py + L * 0.8;
  return [
    ln(130, py, 290, py, 'ink', 4) + ln(px, py, px, by, 'mute', 1.6, '4 4') + `<ellipse class="fi" cx="${px}" cy="${by}" rx="${L * 0.6}" ry="14" style="fill:none;stroke:var(--mute);stroke-width:1.8;stroke-dasharray:5 4;animation-delay:@@D@@s"/>` + ln(px, py, bx, by, 'ink', 2.6) + dot(bx, by, 'pri', 9) + ang(px, py, 34, -90, -53, '37°', 'ink', 12) + dim(px, by + 44, bx, by + 44, 'r = 0.6 m', 9, 'mute', 12),
    F(bx, by, 127, 46, 'T', 'pri') + ar(bx, by, bx, by + 32, 'bad', 3.2) + T(bx + 10, by + 30, 'mg = 5 N', 'bad', 'start', 12.5, 700, 70),
    F(bx, by, 180, 62, 'ΣF', 'ok'),
    chip(210, 218, 'T cos37° = mg  →  T = 5/0.8 = 6.25 N', 'pri', 13, { maxW: 400 }),
    chip(210, 248, 'tan37° = v²/(rg)  →  v = 2.12 m/s ;  คาบ = 2πr/v ≈ 1.78 s', 'ok', 12.5, { maxW: 404 })
  ]; });

LF('phy-1-6', 'olym', 0, 420, 264, H => { const { T, ln, ar, O, dot, dim, F, note, pa } = H, cx = 110, cy = 112, Re = 36;
  return [
    O(cx, cy, Re, { c: 'ok', f: 'ok', fo: 0.3 }) + T(cx, cy + 4, 'โลก', 'ok', 'middle', 12) + O(cx, cy, Re * 2, { c: 'mute', sw: 1.8, d: '6 4' }) + dot(cx + Re * 2, cy, 'warn', 7) + T(cx + Re * 2 + 4, cy - 12, 'ดาวเทียม', 'warn', 'start', 11.5, 700, 56),
    dim(cx, cy + 96, cx + Re, cy + 96, 'R', 10, 'mute') + dim(cx, cy + 122, cx + Re * 2, cy + 122, 'r = 2R', 10, 'ok'),
    ar(cx + Re * 2, cy, cx + Re + 8, cy, 'bad', 3) + T(cx + Re * 1.5, cy - 10, 'a_c', 'bad', 'middle', 12.5) + F(cx + Re * 2, cy, 90, 46, 'v', 'pri'),
    note(236, 54, ['a_c = g/4 = 2.5 m/s²', 'v = √(gR/2) ≈ 5.7 km/s', 'T = 2πr/v ≈ 1.4×10⁴ s', 'หรือ ≈ 3.9 ชั่วโมง'], ['bad', 'pri', 'ok', 'ok'], 12.5, 'start', 26, 176)
  ]; });

LF('phy-1-7', 'exam', 0, 420, 250, H => { const { T, ln, dot, note, pa } = H, y0 = 28, cs = [70, 210, 350], Ls = [96, 96, 16];
  const pend = (cx, L) => { const bx = cx + L * 0.34, by = y0 + L * 0.94; return ln(cx - 34, y0, cx + 34, y0, 'ink', 4) + ln(cx, y0, bx, by, 'ink', 2.2) + ln(cx, y0, cx, y0 + L, 'mute', 1.4, '4 4') + dot(bx, by, 'pri', 9); };
  return [
    pend(cs[0], Ls[0]) + note(cs[0], 160, ['โลก  g = 10', 'L = 1.0 m', 'T = 2π√(L/g) ≈ 2.0 s'], ['ink', 'mute', 'pri'], 12, 'middle', 18, 132),
    pend(cs[1], Ls[1]) + note(cs[1], 160, ['ดวงจันทร์  g/6', 'L = 1.0 m', 'T ≈ 4.9 s  (×√6 ≈ 2.45)'], ['ink', 'mute', 'bad'], 12, 'middle', 18, 132),
    pend(cs[2], Ls[2]) + note(cs[2], 160, ['ดวงจันทร์  g/6', 'L′ = L/6 ≈ 0.17 m', 'T′ ≈ 2.0 s  เท่าโลก'], ['ink', 'mute', 'ok'], 12, 'middle', 18, 132)
  ]; });

LF('phy-1-7', 'olym', 0, 420, 262, H => { const { T, ln, spr, box, ar, dim, note, gd } = H, y = 80, xe = 235;
  return [
    ln(24, 40, 24, 124, 'ink', 4) + ln(24, 124, 396, 124, 'ink', 2.5) + spr(24, y, 112, 'pri') + spr(112, y, 190, 'warn') + box(190, y - 28, 90, 52, '0.30 kg', 'ink', 13) + T(68, y - 16, 'k₁ = 200', 'pri', 'middle', 12, 700, 70) + T(151, y - 16, 'k₂ = 300', 'warn', 'middle', 12, 700, 70),
    gd(xe, 40, xe, 146, 'mute') + dim(xe, 154, xe + 56, 154, 'A = 5.0 cm', 12, 'ok') + T(xe, 36, 'สมดุล', 'mute', 'middle', 11.5, 700),
    note(24, 190, ['อนุกรม: k = k₁k₂/(k₁+k₂) = 120 N/m', 'ω = √(k/m) = 20 rad/s ,  T = 2π/ω ≈ 0.31 s'], ['pri', 'ok'], 12.5, 'start', 18, 372),
    note(24, 232, ['v_max = Aω = 1.0 m/s ;  ที่ x = 3 cm : v = 0.80 m/s'], 'ok', 12.5, 'start', 18, 372),
    note(24, 252, ['สมดุล → A/2 : sin ωt = ½  →  t = π/(6ω) ≈ 0.026 s'], 'bad', 12.5, 'start', 18, 372)
  ]; });
