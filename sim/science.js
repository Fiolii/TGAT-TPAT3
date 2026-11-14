// ซิมูเลเตอร์เคมี/ชีววิทยา
(function () {
  const { f, txt, arrow, line, rect, circ } = SU;
  const reg = (name, cfg) => { SIMS[name] = { mount: host => SU.sim(host, cfg) }; };

  reg('ph', {
    label: 'ค่า pH และความเข้มข้นไอออน', h: 230,
    goal: 'เลื่อน pH จาก 7 ไป 3 แล้วดู [H⁺] เพิ่มขึ้นกี่เท่า (ทุก 1 หน่วย pH = 10 เท่า) — สังเกตว่า [H⁺]×[OH⁻] คงที่เสมอ',
    controls: [{ id: 'ph', label: 'pH', min: 0, max: 14, step: .1, v: 3, dec: 1 }],
    draw(g, W, H, S, t, C) {
      const hue = 0 + S.ph / 14 * 240, col = `hsl(${hue},80%,55%)`;
      // บีกเกอร์
      g.strokeStyle = C.ink; g.lineWidth = 2.5; g.beginPath(); g.moveTo(30, 30); g.lineTo(30, 190); g.lineTo(130, 190); g.lineTo(130, 30); g.stroke(); g.fillStyle = col; g.globalAlpha = .75; g.fillRect(31, 80, 98, 109); g.globalAlpha = 1;
      for (let i = 0; i < 18; i++) { const x = 40 + (i * 37) % 80, y = 92 + (i * 53) % 90; txt(g, S.ph < 7 ? 'H⁺' : S.ph > 7 ? 'OH⁻' : '·', x, y, '#fff', 11, 'center'); }
      // แถบ pH
      const bx = 160, bw = W - bx - 12; for (let i = 0; i < bw; i++) { g.fillStyle = `hsl(${i / bw * 240},80%,55%)`; g.fillRect(bx + i, 40, 1.5, 22); } for (let p = 0; p <= 14; p += 2) { txt(g, p + '', bx + p / 14 * bw, 78, C.mute, 10, 'center'); }
      g.fillStyle = C.ink; g.beginPath(); const mx = bx + S.ph / 14 * bw; g.moveTo(mx, 66); g.lineTo(mx - 6, 78 + 8); g.lineTo(mx + 6, 78 + 8); g.closePath(); g.fill(); txt(g, 'กรด', bx, 32, C.bad, 12); txt(g, 'เบส', bx + bw, 32, C.pri, 12, 'right');
      // แท่งกราฟ log
      const base = 210, sc = 100 / 14; [['[H⁺]', -S.ph, C.bad], ['[OH⁻]', S.ph - 14, C.pri]].forEach(([l, e, c], i) => { const h = (14 + e) * sc * .9, x = bx + 20 + i * 90; rect(g, x, base - h, 50, h, c); txt(g, l, x + 25, base + 14, C.ink, 12, 'center'); txt(g, '10^' + f(e, 1), x + 25, base - h - 5, C.ink, 11, 'center'); });
      txt(g, 'ความสูงแท่ง ∝ เลขชี้กำลัง', bx, 112, C.mute, 10);
    },
    out: S => `pH = ${f(S.ph, 1)} → [H⁺] = 10<sup>−${f(S.ph, 1)}</sup> = <b>${(Math.pow(10, -S.ph)).toExponential(1)}</b> mol/L · pOH = ${f(14 - S.ph, 1)} → [OH⁻] = <b>${(Math.pow(10, S.ph - 14)).toExponential(1)}</b><br>${S.ph < 6.95 ? '<b>เป็นกรด</b> ([H⁺] > [OH⁻])' : S.ph > 7.05 ? '<b>เป็นเบส</b> ([OH⁻] > [H⁺])' : '<b>เป็นกลาง</b>'} · [H⁺][OH⁻] = 10⁻¹⁴ (ที่ 25 °C)`,
  });

  reg('conc', {
    label: 'ความเข้มข้นและการเจือจาง', h: 230,
    goal: 'คงจำนวนโมลไว้แล้วเติมน้ำ — ความเข้มข้นลดลงแต่จำนวนอนุภาคตัวละลายเท่าเดิม (M₁V₁ = M₂V₂)',
    controls: [{ id: 'n', label: 'จำนวนโมลตัวละลาย n', min: .1, max: 2, step: .1, v: .5, unit: 'mol', dec: 1 }, { id: 'V', label: 'ปริมาตรสารละลายเริ่มต้น V₁', min: .1, max: 1, step: .1, v: .5, unit: 'L', dec: 1 }, { id: 'W', label: 'น้ำที่เติม', min: 0, max: 2, step: .1, v: 0, unit: 'L', dec: 1 }],
    draw(g, W, H, S, t, C) {
      const tot = S.V + S.W, M = S.n / tot, bx = 40, bw = 130, top = 20, bot = H - 20, lvl = bot - (tot / 3) * (bot - top);
      g.fillStyle = `rgba(80,150,255,${.15 + Math.min(.6, M / 5)})`; g.fillRect(bx + 1, lvl, bw - 2, bot - lvl); g.strokeStyle = C.ink; g.lineWidth = 2.5; g.beginPath(); g.moveTo(bx, top); g.lineTo(bx, bot); g.lineTo(bx + bw, bot); g.lineTo(bx + bw, top); g.stroke();
      const N = Math.round(S.n * 40); let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
      for (let i = 0; i < N; i++) { const x = bx + 8 + rnd() * (bw - 16), y = lvl + 6 + rnd() * Math.max(4, bot - lvl - 12); circ(g, x, y, 3.2, C.warn, C.ink, 1); }
      const gx = bx + bw + 30; txt(g, 'M = n / V', gx, 40, C.mute, 12); txt(g, f(M, 2) + ' mol/L', gx, 70, C.pri, 24); txt(g, 'อนุภาค = ' + f(S.n, 1) + ' mol (คงที่)', gx, 100, C.ink, 12);
      if (S.W > 0) txt(g, 'M₁ = ' + f(S.n / S.V, 2) + ' → M₂ = ' + f(M, 2), gx, 130, C.bad, 12);
    },
    out: S => { const M1 = S.n / S.V, M2 = S.n / (S.V + S.W); return `M₁ = n/V₁ = ${S.n}/${S.V} = <b>${f(M1, 2)} mol/L</b><br>หลังเติมน้ำ ${f(S.W, 1)} L: M₂ = n/(V₁+V<sub>น้ำ</sub>) = <b>${f(M2, 2)} mol/L</b><br>ตรวจ: M₁V₁ = ${f(M1 * S.V, 2)} = M₂V₂ = ${f(M2 * (S.V + S.W), 2)} mol ✓`; },
  });

  const BASE = { A: '#e5484d', T: '#3e63dd', G: '#30a46c', C: '#f5a524', U: '#8e4ec6' };
  const TMP = 'TACGGCATT', MR = 'AUGCCGUAA', CODON = { AUG: 'เมไทโอนีน (Met) เริ่มต้น', CCG: 'โพรลีน (Pro)', UAA: 'หยุด (Stop)' };
  reg('dna', {
    label: 'DNA → mRNA → โปรตีน', h: 250,
    goal: 'เลื่อนจากซ้ายไปขวาทีละขั้น: DNA แยกสาย → สร้าง mRNA ทีละเบส (A จับ U, T จับ A, C จับ G) → อ่านเป็นโคดอน 3 ตัว → ได้กรดอะมิโน',
    controls: [{ id: 'p', label: 'ขั้นตอน', min: 0, max: 12, step: 1, v: 0, fmt: v => ['DNA คู่สาย', 'สายแยกจากกัน', ...Array.from({ length: 9 }, (_, i) => 'ถอดรหัสเบสที่ ' + (i + 1)), 'จัดเป็นโคดอน', 'แปลรหัส → กรดอะมิโน'][v] }],
    draw(g, W, H, S, t, C) {
      const n = 9, step = Math.min(34, (W - 50) / n), x0 = (W - step * (n - 1)) / 2, cod = TMP.replace(/./g, c => ({ T: 'A', A: 'T', C: 'G', G: 'C' }[c])), p = S.p;
      const yT = 120, yC = p >= 1 ? 52 : 90;
      txt(g, 'สายแม่แบบ 3′ … 5′', 12, yT + 36, C.mute, 11); if (p < 1) txt(g, 'สายรหัส (คู่สม)', 12, yC - 14, C.mute, 11);
      for (let i = 0; i < n; i++) {
        const x = x0 + i * step; circ(g, x, yT, 12, BASE[TMP[i]]); txt(g, TMP[i], x, yT + 4, '#fff', 12, 'center');
        if (p < 1) line(g, x, yC + 12, x, yT - 12, C.mute, 2); circ(g, x, yC, 12, BASE[cod[i]]); txt(g, cod[i], x, yC + 4, '#fff', 12, 'center');
        if (p >= 2 && i < Math.min(n, p - 1)) { const y = 175; circ(g, x, y, 12, BASE[MR[i]]); txt(g, MR[i], x, y + 4, '#fff', 12, 'center'); line(g, x, yT + 12, x, y - 12, C.line, 1.5, [2, 3]); }
      }
      if (p >= 2) txt(g, 'mRNA 5′ … 3′', 12, 205, C.pri, 11);
      if (p >= 11) { for (let k = 0; k < 3; k++) { const xa = x0 + k * 3 * step - 14, xb = x0 + (k * 3 + 2) * step + 14; g.strokeStyle = C.pri; g.lineWidth = 2; g.strokeRect(xa, 158, xb - xa, 34); if (p >= 12) { rect(g, xa, 212, xb - xa, 26, C.pri2, C.pri); txt(g, ['Met', 'Pro', 'Stop'][k], (xa + xb) / 2, 230, C.ink, 12, 'center'); } } }
    },
    out: S => { const p = S.p; if (p === 0) return 'DNA เป็นเกลียวคู่: A จับ T, C จับ G (สายหนึ่งเป็น <b>สายแม่แบบ</b>)'; if (p === 1) return 'เอนไซม์ RNA polymerase ทำให้สายแยกออกจากกัน'; if (p <= 10) { const k = p - 1; return `สร้าง mRNA เบสที่ ${k}: ${TMP[k - 1]} (แม่แบบ) จับกับ <b>${MR[k - 1]}</b> (A→U, T→A, C→G, G→C) · ลำดับตอนนี้ = ${MR.slice(0, k)}`; } if (p === 11) return `mRNA = AUG CCG UAA — อ่านทีละ 3 เบส (โคดอน)`; return `AUG → ${CODON.AUG} · CCG → ${CODON.CCG} · UAA → ${CODON.UAA}`; },
  });

  reg('osmosis', {
    label: 'ออสโมซิสของเซลล์', h: 240, animate: true,
    goal: 'ตั้งความเข้มข้นภายนอกต่ำกว่า 1.0 (น้ำกลั่น) แล้วดูเซลล์สัตว์บวมจนแตก แต่เซลล์พืชเต่ง — จากนั้นตั้งสูงกว่า 1.0 ดูพลาสโมไลซิส',
    controls: [{ id: 'kind', label: 'ชนิดเซลล์', min: 0, max: 1, step: 1, v: 1, opts: ['เซลล์สัตว์', 'เซลล์พืช'] }, { id: 'c', label: 'ความเข้มข้นสารละลายภายนอก (ภายในเซลล์ = 1.0)', min: 0, max: 2, step: .1, v: .2, dec: 1 }],
    draw(g, W, H, S, t, C) {
      const cx = W / 2 - 40, cy = 120, c = S.c, flow = 1 - c, plant = S.kind === 1;
      g.fillStyle = `rgba(80,150,255,${.12 + Math.min(.4, c * .2)})`; g.fillRect(0, 0, W, H);
      let r = 50; if (plant) r = 50 + 8 * Math.max(0, Math.min(1, flow)) - (c > 1 ? (c - 1) * 22 : 0); else r = 50 + 28 * flow; const burst = !plant && c < .3;
      if (plant) { g.strokeStyle = C.ok; g.lineWidth = 6; g.strokeRect(cx - 62, cy - 62, 124, 124); }
      if (burst) { for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 + t, d = 80 + 20 * Math.sin(t * 3 + i); circ(g, cx + d * Math.cos(a), cy + d * Math.sin(a), 6, C.bad); } txt(g, 'เซลล์แตก!', cx, cy + 4, C.bad, 16, 'center'); }
      else { g.fillStyle = C.warn + '66'; g.strokeStyle = C.ink; g.lineWidth = 2.5; if (plant) { g.fillRect(cx - r, cy - r, 2 * r, 2 * r); g.strokeRect(cx - r, cy - r, 2 * r, 2 * r); } else { circ(g, cx, cy, r, C.warn + '66', C.ink, 2.5); } txt(g, 'เซลล์', cx, cy + 4, C.ink, 13, 'center'); }
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, d = 95 + ((t * 40 + i * 20) % 30), dir = flow >= 0 ? -1 : 1; const ph = (t * .8 + i / 6) % 1, rr = 120 - ph * 70 * (flow >= 0 ? 1 : -1) - (flow < 0 ? -70 : 0); if (Math.abs(flow) > .05) { const x1 = cx + (flow >= 0 ? 118 - ph * 70 : 50 + ph * 70) * Math.cos(a), y1 = cy + (flow >= 0 ? 118 - ph * 70 : 50 + ph * 70) * Math.sin(a); circ(g, x1, y1, 3.5, C.pri); } }
      txt(g, c < .95 ? 'น้ำเข้าเซลล์' : c > 1.05 ? 'น้ำออกจากเซลล์' : 'สมดุล', W - 12, 30, c < .95 ? C.pri : c > 1.05 ? C.bad : C.ok, 14, 'right');
    },
    out: S => { const c = S.c, plant = S.kind === 1; return `ภายนอก ${f(c, 1)} เทียบภายใน 1.0 → ${c < .95 ? '<b>ไฮโปโทนิก</b> (เจือจางกว่า): น้ำออสโมซิสเข้าเซลล์' : c > 1.05 ? '<b>ไฮเปอร์โทนิก</b> (เข้มข้นกว่า): น้ำออกจากเซลล์' : '<b>ไอโซโทนิก</b>: น้ำเข้า-ออกเท่ากัน'}<br>${plant ? (c < .95 ? 'เซลล์พืช: เต่ง (turgid) ผนังเซลล์กันไม่ให้แตก' : c > 1.05 ? 'เซลล์พืช: พลาสโมไลซิส — ไซโทพลาซึมหดตัวแยกจากผนัง' : 'เซลล์พืช: ปกติ') : (c < .3 ? 'เซลล์สัตว์ไม่มีผนังเซลล์ → บวมจนแตก (lysis)' : c < .95 ? 'เซลล์สัตว์: บวม' : c > 1.05 ? 'เซลล์สัตว์: เหี่ยว (crenation)' : 'เซลล์สัตว์: ปกติ')}`; },
  });
})();
