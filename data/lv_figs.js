// ชุดเครื่องมือวาดรูปบนกระดานสำหรับตัวอย่างระดับ "ข้อสอบจริง" และ "สอวน" (และระดับอื่นที่ยังไม่มีรูป)
// ใช้: LF('รหัสบท', 'exam'|'olym'|'class', ลำดับข้อ, กว้าง, สูง, H => [กลุ่มที่ 0 (ตั้งต้น), กลุ่มที่ 1, …])
// กลุ่มที่ i จะปรากฏเมื่อครูสอนถึงขั้นที่ i (ขั้นที่ 0 = อ่านโจทย์) ตัวหนังสือทุกช่องปรับขนาดให้พอดีความกว้างที่กำหนดเสมอ
const LFIGS = {};
function LF(id, k, i, w, h, fn) { LFIGS[id + '|' + k + '|' + i] = { w, h, fn }; }
const CV = { ink: 'var(--ink)', pri: 'var(--pri)', ok: 'var(--ok)', bad: 'var(--bad)', warn: 'var(--warn)', mute: 'var(--mute)', card: 'var(--card)' };

// ป้องกันตัวอักษร < > & ในข้อความถูกตีความเป็นแท็กของ SVG
const xesc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// ความกว้างโดยประมาณของข้อความ (หน่วยเป็นพิกเซลที่ขนาดตัวอักษร sz) — วรรณยุกต์/สระบน-ล่างกว้าง 0
function twid(s, sz) {
  s = String(s).replace(/_\{([^}]*)\}/g, '$1').replace(/_([A-Za-z0-9]+)/g, '$1');
  let w = 0;
  for (const ch of s) {
    const c = ch.charCodeAt(0);
    if (c === 0x0E31 || (c >= 0x0E34 && c <= 0x0E3A) || (c >= 0x0E47 && c <= 0x0E4E)) continue;
    w += c >= 0x0E00 && c <= 0x0E7F ? 0.56 : ch === ' ' ? 0.3 : /[A-Z]/.test(ch) ? 0.68 : /[0-9]/.test(ch) ? 0.58 : /[a-z]/.test(ch) ? 0.56 : /[ilIjt.,:;'|!()]/.test(ch) ? 0.32 : 0.62;
  }
  return w * sz * 1.1; // เผื่อฟอนต์บนกระดานกว้างกว่าค่าประมาณ ~10% (ตรวจกับตัวตรวจอัตโนมัติแล้ว)
}

function figKit(S) {
  const { ln, ar, ar2, tx, sb, fl, pa, ci, range } = S, D = '@@D@@';
  const sc = (a, b, p, q) => v => p + (v - a) * (q - p) / (b - a);
  // ข้อความที่ย่อขนาดอัตโนมัติให้ไม่เกินความกว้าง maxW
  const T = (x, y, s, c = 'ink', a = 'middle', sz = 13, wt = 700, maxW) => {
    if (maxW) { const w = twid(s, sz); if (w > maxW) sz = Math.max(8.5, +(sz * maxW / w).toFixed(1)); }
    return tx(x, y, xesc(s), c, a, sz, wt);
  };
  const R = (x, y, w, h, o = {}) => `<rect class="fi" x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx == null ? 3 : o.rx}" style="fill:${o.f ? CV[o.f] : 'none'};fill-opacity:${o.f ? (o.fo == null ? 0.18 : o.fo) : 0};stroke:${o.c === 'none' ? 'none' : CV[o.c || 'ink']};stroke-width:${o.sw == null ? 2 : o.sw};${o.d ? `stroke-dasharray:${o.d};` : ''}animation-delay:${D}s"/>`;
  const O = (x, y, r, o = {}) => `<circle class="fi" cx="${x}" cy="${y}" r="${r}" style="fill:${o.f ? CV[o.f] : 'none'};fill-opacity:${o.f ? (o.fo == null ? 0.18 : o.fo) : 0};stroke:${o.c === 'none' ? 'none' : CV[o.c || 'ink']};stroke-width:${o.sw == null ? 2 : o.sw};${o.d ? `stroke-dasharray:${o.d};` : ''}animation-delay:${D}s"/>`;
  const PG = (pts, o = {}) => `<path class="fi" d="M${pts.map(p => p.join(',')).join(' L')}z" style="fill:${o.f ? CV[o.f] : 'none'};fill-opacity:${o.f ? (o.fo == null ? 0.18 : o.fo) : 0};stroke:${o.c === 'none' ? 'none' : CV[o.c || 'ink']};stroke-width:${o.sw == null ? 2 : o.sw};stroke-linejoin:round;${o.d ? `stroke-dasharray:${o.d};` : ''}animation-delay:${D}s"/>`;
  const PL = (pts, c = 'ink', w = 2.5, dash) => pa('M' + pts.map(p => p.join(',')).join(' L'), c, w, dash);
  // ป้ายข้อความในกรอบ ขนาดกรอบพอดีกับข้อความ
  const chip = (x, y, s, c = 'pri', sz = 13, o = {}) => { const w = Math.min(o.maxW || 400, twid(s, sz) + 14), z = o.maxW && twid(s, sz) + 14 > o.maxW ? sz * (o.maxW - 14) / twid(s, sz) : sz; return R(x - w / 2, y - sz / 2 - 5, w, sz + 10, { c, f: 'card', fo: 0.95, sw: 1.6, rx: 7 }) + tx(x, y + z * 0.36, xesc(s), c, 'middle', +z.toFixed(1), 700); };
  // เส้นบอกขนาด (ลูกศรสองหัว) + ป้าย; side: ตำแหน่งป้ายห่างจากเส้น (px)
  const dim = (x1, y1, x2, y2, label, side = 14, c = 'mute', sz = 12.5) => {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, vert = Math.abs(x2 - x1) < Math.abs(y2 - y1);
    return ar2(x1, y1, x2, y2, c, 1.8) + (vert ? T(mx + side, my + 4, label, c, side < 0 ? 'end' : 'start', sz, 700) : T(mx, my + side + (side > 0 ? 8 : 0), label, c, 'middle', sz, 700));
  };
  const ax = (x0, y0, x1, y1, xl, yl, c = 'ink') => ar(x0, y0, x1, y0, c, 2) + ar(x0, y0, x0, y1, c, 2) + (xl ? T(x1, y0 + 15, xl, 'mute', 'end', 12, 600) : '') + (yl ? T(x0 + 6, y1 - 3, yl, 'mute', 'start', 12, 600) : '');
  // เส้นโค้งจากฟังก์ชัน f บนช่วง [a,b] แปลงพิกัดด้วย X,Y
  const FX = (f, a, b, X, Y, c = 'pri', w = 3, n = 80, dash) => { let d = '', pen = false; for (let i = 0; i <= n; i++) { const x = a + (b - a) * i / n, y = f(x); if (!isFinite(y)) { pen = false; continue; } d += (pen ? 'L' : 'M') + X(x).toFixed(1) + ',' + Y(y).toFixed(1); pen = true; } return pa(d, c, w, dash); };
  const dot = (x, y, c = 'warn', r = 5) => ci(x, y, r, c);
  // ตารางข้อมูล: rows[0] เป็นหัวตาราง; cw = ความกว้างคอลัมน์; hl = [[แถว,คอลัมน์],…] เน้นช่อง
  const tbl = (x, y, cw, rh, rows, o = {}) => {
    // o.skip / o.upto: วาดเฉพาะแถว [skip, upto) เพื่อให้ขั้นถัดไปเติมเฉพาะแถวใหม่ ไม่วาดซ้ำทับของเดิม
    const hl = o.hl || [], W = cw.reduce((a, b) => a + b, 0); let out = '';
    rows.forEach((r, ri) => {
      if (ri < (o.skip || 0) || ri >= (o.upto == null ? 999 : o.upto)) return;
      let xx = x, yy = y + ri * rh;
      r.forEach((cell, ci2) => {
        const on = hl.some(h => h[0] === ri && h[1] === ci2), head = ri === 0 && !o.nohead;
        out += R(xx, yy, cw[ci2], rh, { c: on ? 'ok' : 'mute', f: on ? 'ok' : head ? 'pri' : null, fo: on ? 0.3 : 0.22, sw: on ? 2.2 : 1.2, rx: 0 });
        out += T(xx + cw[ci2] / 2, yy + rh / 2 + 4.5, String(cell), on ? 'ok' : head ? 'pri' : 'ink', 'middle', o.sz || 13, head || on ? 700 : 600, cw[ci2] - 6);
        xx += cw[ci2];
      }); yy += rh;
    });
    return out;
  };
  // ตัวต้านทานแบบซิกแซก (แนวนอน/แนวตั้ง) ระหว่างสองจุด
  const res = (x1, y1, x2, y2, c = 'ink') => {
    const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, nx = -uy, ny = ux, a = L * 0.2, b = L * 0.8, n = 6, amp = 7;
    let d = `M${x1},${y1} L${x1 + ux * a},${y1 + uy * a}`;
    for (let i = 0; i < n; i++) { const t = a + (b - a) * (i + 0.5) / n, s = i % 2 ? 1 : -1; d += ` L${(x1 + ux * t + nx * amp * s).toFixed(1)},${(y1 + uy * t + ny * amp * s).toFixed(1)}`; }
    d += ` L${x1 + ux * b},${y1 + uy * b} L${x2},${y2}`;
    return pa(d, c, 2.5);
  };
  // แบตเตอรี่ (ขีดยาว = ขั้วบวก) จุดกึ่งกลาง (x,y); vert = วางตามแนวตั้ง
  const bat = (x, y, vert, c = 'warn') => vert
    ? ln(x - 12, y - 4, x + 12, y - 4, c, 3) + ln(x - 7, y + 4, x + 7, y + 4, c, 3) + T(x + 16, y - 6, '+', c, 'start', 12)
    : ln(x - 4, y - 12, x - 4, y + 12, c, 3) + ln(x + 4, y - 7, x + 4, y + 7, c, 3) + T(x - 9, y - 14, '+', c, 'end', 12);
  // หลอดไฟ
  const lamp = (x, y, r = 12, c = 'warn') => O(x, y, r, { c, f: c, fo: 0.2, sw: 2 }) + ln(x - r * 0.7, y - r * 0.7, x + r * 0.7, y + r * 0.7, c, 2) + ln(x - r * 0.7, y + r * 0.7, x + r * 0.7, y - r * 0.7, c, 2);
  // กล่องวัตถุพร้อมป้ายกลางกล่อง
  const box = (x, y, w, h, s, c = 'pri', sz = 13) => R(x, y, w, h, { c, f: c, fo: 0.16, sw: 2.2 }) + T(x + w / 2, y + h / 2 + 4.5, s, c, 'middle', sz, 700, w - 6);
  // ตำแหน่งบนวงกลม
  const pol = (cx, cy, r, deg) => [cx + r * Math.cos(deg * Math.PI / 180), cy - r * Math.sin(deg * Math.PI / 180)];
  // เฟือง: วงกลมมีฟันเป็นเส้นสั้นรอบวง
  const gear = (cx, cy, r, n, label, c = 'pri', rot = 0) => { let t = ''; for (let i = 0; i < n; i++) { const a = rot + i * 360 / n, p = pol(cx, cy, r, a), q = pol(cx, cy, r + 5, a); t += `<line class="fi" x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}" style="stroke:${CV[c]};stroke-width:${Math.max(2, 5 * 6.28 * r / n / 4).toFixed(1)};animation-delay:${D}s"/>`; } return O(cx, cy, r, { c, f: c, fo: 0.14, sw: 2.2 }) + t + ci(cx, cy, 3, c) + (label ? T(cx, cy + r * 0.45 + 5, label, c, 'middle', 12.5, 700, r * 1.5) : ''); };
  // มุม: โค้งเล็ก ๆ ที่จุด (x,y) ตั้งแต่มุม a1 ถึง a2 (องศา แบบคณิต) ป้ายอยู่ที่รัศมี r+9
  const ang = (x, y, r, a1, a2, label, c = 'ink', sz = 12.5) => { const p = pol(x, y, r, a1), q = pol(x, y, r, a2), m = pol(x, y, r + 11, (a1 + a2) / 2); return pa(`M${p[0].toFixed(1)},${p[1].toFixed(1)} A${r},${r} 0 0 ${a2 > a1 ? 0 : 1} ${q[0].toFixed(1)},${q[1].toFixed(1)}`, c, 2) + (label ? T(m[0], m[1] + 4, label, c, 'middle', sz, 700) : ''); };
  // จุดสังเกตพร้อมป้าย
  const pt = (x, y, label, c = 'ok', dx = 8, dy = -8, a = 'start') => ci(x, y, 5, c) + T(x + dx, y + dy, label, c, a, 13, 700);
  // เส้นประ (ช่วยอ่านค่าในกราฟ)
  const gd = (x1, y1, x2, y2, c = 'mute') => ln(x1, y1, x2, y2, c, 1.4, '4 4');
  // ลูกศรแรงจากจุด (x,y) ทิศ deg ยาว L พร้อมป้ายปลายลูกศร
  const F = (x, y, deg, L, label, c = 'pri', w = 3.2) => { const q = pol(x, y, L, deg), m = pol(x, y, L + 13, deg); const a = Math.cos(deg * Math.PI / 180) > 0.3 ? 'start' : Math.cos(deg * Math.PI / 180) < -0.3 ? 'end' : 'middle'; return ar(x, y, q[0], q[1], c, w) + T(m[0], m[1] + 5, label, c, a, 13, 700); };
  // หมุนกลุ่มรูปรอบจุด (x,y) ไป deg องศา (ตามเข็มนาฬิกาเป็นบวก แบบ SVG) — ใช้วาดวัตถุบนพื้นเอียง
  const rot = (x, y, deg, inner) => `<g transform="translate(${x} ${y}) rotate(${deg})">${inner}</g>`;
  // สปริง (ขดลวด) แนวนอนจาก x1 ถึง x2 ที่ความสูง y
  const spr = (x1, y, x2, c = 'ink', n = 8, amp = 9) => { const L = x2 - x1, a = L * 0.12; let d = `M${x1},${y} L${x1 + a},${y}`; for (let i = 0; i < n; i++) d += ` L${(x1 + a + (L - 2 * a) * (i + 0.5) / n).toFixed(1)},${y + (i % 2 ? amp : -amp)}`; return pa(d + ` L${x2 - a},${y} L${x2},${y}`, c, 2.4); };
  // ตัวหนังสือสัญลักษณ์สนามแม่เหล็ก: ⊙ ออกจากกระดาน / × เข้าหากระดาน
  const bfield = (x0, y0, nx, ny, dx, dy, into = true, c = 'mute') => { let t = ''; for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) t += tx(x0 + i * dx, y0 + j * dy, into ? '×' : '•', c, 'middle', 15, 600); return t; };
  // การ์ดสี่เหลี่ยมมีข้อความหลายบรรทัดกึ่งกลาง (บรรทัดแรกหนา) ตัวอักษรย่อให้พอดีความกว้างอัตโนมัติ
  const card = (x, y, w, h, lines, c = 'pri', sz = 12.5) => {
    const n = lines.length, lh = sz + 5, y0 = y + h / 2 - (n - 1) * lh / 2 + sz * 0.36;
    return R(x, y, w, h, { c, f: c, fo: 0.14, sw: 2, rx: 8 }) + lines.map((s, i) => T(x + w / 2, y0 + i * lh, s, i ? 'ink' : c, 'middle', i ? sz - 1 : sz, i ? 600 : 700, w - 10)).join('');
  };
  // เส้นพันธะเคมี order = 1,2,3 (เส้นคู่/สามขนานกัน) จากจุดหนึ่งไปอีกจุดหนึ่ง สั้นลงที่ปลายทั้งสองข้างเพื่อเว้นที่ให้สัญลักษณ์อะตอม
  const bond = (x1, y1, x2, y2, order = 1, c = 'ink', cut = 11, w = 2.4) => {
    const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, a = [x1 + ux * cut, y1 + uy * cut], b = [x2 - ux * cut, y2 - uy * cut], nx = -uy * 2.8, ny = ux * 2.8;
    const off = order === 1 ? [0] : order === 2 ? [-1, 1] : [-2, 0, 2];
    return off.map(k => ln((a[0] + nx * k).toFixed(1), (a[1] + ny * k).toFixed(1), (b[0] + nx * k).toFixed(1), (b[1] + ny * k).toFixed(1), c, w)).join('');
  };
  // กล่องคำตอบสั้น ๆ มุมภาพ
  const note = (x, y, lines, c = 'ok', sz = 13, a = 'start', lh = 17, maxW) => lines.map((s, i) => T(x, y + i * lh, s, Array.isArray(c) ? c[i] || c[0] : c, a, sz, 700, maxW)).join('');
  return { ...S, card, bond, rot, spr, bfield, sc, T, R, O, PG, PL, chip, dim, ax, FX, dot, tbl, res, bat, lamp, box, pol, gear, ang, pt, gd, F, note, twid };
}

// ใส่รูปที่ลงทะเบียนไว้ให้กระดานของแต่ละบท (เรียกจาก applyLevels หลังสร้างสไลด์ exlv แล้ว)
function applyFigs(chId, lv) {
  LV_KEYS.forEach(k => (lv[k] || []).forEach((b, i) => {
    const f = LFIGS[chId + '|' + k + '|' + i]; if (!f || b.fig) return;
    lv[k][i] = Object.assign({}, b, { fig: S => f.fn(figKit(S)), fw: f.w, fh: f.h });
  }));
}
