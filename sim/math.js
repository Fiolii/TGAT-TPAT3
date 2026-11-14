// ซิมูเลเตอร์คณิตศาสตร์: ปรับตัวแปรแล้วกราฟ/ค่าที่คำนวณเปลี่ยนทันที
(function () {
  const { f, txt, arrow, line, rect, circ } = SU;
  const reg = (name, cfg) => { SIMS[name] = { mount: host => SU.sim(host, cfg) }; };
  function plot(g, W, H, C, xr, yr, xt) { // คืนฟังก์ชันแปลงพิกัด + วาดแกน/ตาราง
    const m = { l: 28, r: 10, t: 10, b: 20 }, X = x => m.l + (x - xr[0]) / (xr[1] - xr[0]) * (W - m.l - m.r), Y = y => H - m.b - (y - yr[0]) / (yr[1] - yr[0]) * (H - m.t - m.b);
    for (let x = Math.ceil(xr[0]); x <= xr[1]; x += xt || 1) line(g, X(x), m.t, X(x), H - m.b, x === 0 ? C.mute : C.line, x === 0 ? 1.5 : 1);
    for (let y = Math.ceil(yr[0] / 2) * 2; y <= yr[1]; y += 2) line(g, m.l, Y(y), W - m.r, Y(y), y === 0 ? C.mute : C.line, y === 0 ? 1.5 : 1);
    return { X, Y };
  }

  reg('parabola', {
    label: 'กราฟพาราโบลา y = ax² + bx + c', h: 250,
    goal: 'เปลี่ยน a ให้เป็นลบแล้วดูกราฟคว่ำ (มีค่าสูงสุด) · เปลี่ยน c ดูว่ากราฟเลื่อนขึ้นลงอย่างไร · หาค่า b ที่ทำให้รากซ้ำ (Δ = 0)',
    controls: [{ id: 'a', label: 'a', min: -3, max: 3, step: .25, v: 1, dec: 2 }, { id: 'b', label: 'b', min: -8, max: 8, step: .5, v: -4, dec: 1 }, { id: 'c', label: 'c', min: -8, max: 8, step: .5, v: 3, dec: 1 }],
    draw(g, W, H, S, t, C) {
      const { X, Y } = plot(g, W, H, C, [-6, 6], [-10, 10]); const y = x => S.a * x * x + S.b * x + S.c;
      g.strokeStyle = C.pri; g.lineWidth = 3; g.beginPath(); let st = false; for (let px = -6; px <= 6.001; px += .05) { const yy = y(px); if (yy < -12 || yy > 12) { st = false; continue; } st ? g.lineTo(X(px), Y(yy)) : g.moveTo(X(px), Y(yy)); st = true; } g.stroke();
      circ(g, X(0), Y(S.c), 5, C.warn, C.ink); txt(g, 'c', X(0) + 8, Y(S.c) - 6, C.warn, 11);
      if (S.a !== 0) { const vx = -S.b / (2 * S.a), vy = y(vx), D = S.b * S.b - 4 * S.a * S.c; if (Math.abs(vy) < 12 && Math.abs(vx) < 6.2) { circ(g, X(vx), Y(vy), 6, C.bad, C.ink); txt(g, 'จุดยอด', X(vx) + 8, Y(vy) - 8, C.bad, 11); } if (D >= 0) [(-S.b + Math.sqrt(D)) / (2 * S.a), (-S.b - Math.sqrt(D)) / (2 * S.a)].forEach(r => circ(g, X(r), Y(0), 5, C.ok, C.ink)); }
    },
    out: S => { if (S.a === 0) return `a = 0 → เป็นเส้นตรง y = ${S.b}x + ${S.c}`; const vx = -S.b / (2 * S.a), vy = S.a * vx * vx + S.b * vx + S.c, D = S.b * S.b - 4 * S.a * S.c; return `จุดยอด x = −b/2a = <b>${f(vx, 2)}</b> → ${S.a > 0 ? 'ค่าต่ำสุด' : 'ค่าสูงสุด'} y = <b>${f(vy, 2)}</b><br>Δ = b² − 4ac = ${f(D, 2)} → ${D > 0 ? 'มีรากจริง 2 ค่า: ' + f((-S.b + Math.sqrt(D)) / (2 * S.a), 2) + ', ' + f((-S.b - Math.sqrt(D)) / (2 * S.a), 2) : D === 0 ? 'รากซ้ำ x = ' + f(vx, 2) : 'ไม่มีรากจริง (กราฟไม่ตัดแกน x)'}`; },
  });

  reg('unitcircle', {
    label: 'วงกลมหนึ่งหน่วยและกราฟไซน์', h: 250, animate: true, duration: 8, loop: true,
    goal: 'ลากมุมให้ผ่านทั้ง 4 จตุภาค แล้วดูเครื่องหมายของ sin และ cos — ลองหาสองมุมที่ sin เท่ากัน (θ และ 180°−θ)',
    controls: [{ id: 'th', label: 'มุม θ (กด ↺ เพื่อให้หมุนเอง)', min: 0, max: 360, step: 5, v: 45, unit: '°', manual: true }],
    draw(g, W, H, S, t, C) {
      const th = ((S.th + (S._auto ? t * 45 : 0)) % 360) * Math.PI / 180, cx = 90, cy = H / 2, r = 70;
      circ(g, cx, cy, r, null, C.mute, 2); line(g, cx - r - 10, cy, cx + r + 10, cy, C.mute, 1); line(g, cx, cy - r - 10, cx, cy + r + 10, C.mute, 1);
      const px = cx + r * Math.cos(th), py = cy - r * Math.sin(th);
      g.fillStyle = C.pri + '22'; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, 20, 0, -th, true); g.closePath(); g.fill();
      line(g, cx, cy, px, py, C.pri, 3); line(g, px, py, px, cy, C.ok, 3); line(g, cx, cy, px, cy, C.bad, 3); circ(g, px, py, 6, C.warn, C.ink);
      txt(g, 'sin', px + 6, (py + cy) / 2, C.ok, 11); txt(g, 'cos', (px + cx) / 2, cy + 14, C.bad, 11, 'center');
      const gx = 190, gw = W - gx - 10; line(g, gx, cy, gx + gw, cy, C.mute, 1); line(g, gx, cy - r, gx, cy + r, C.mute, 1);
      g.strokeStyle = C.ok; g.lineWidth = 2.5; g.beginPath(); for (let i = 0; i <= 360; i += 4) { const x = gx + i / 360 * gw, y = cy - r * Math.sin(i * Math.PI / 180); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
      line(g, px, py, gx + th / (2 * Math.PI) * gw, py, C.line, 1, [3, 3]); circ(g, gx + th / (2 * Math.PI) * gw, py, 5, C.warn, C.ink); txt(g, '360°', gx + gw, cy + 14, C.mute, 10, 'right'); txt(g, '90°', gx + gw / 4, cy + 14, C.mute, 10, 'center'); txt(g, '180°', gx + gw / 2, cy + 14, C.mute, 10, 'center');
      S._cur = th * 180 / Math.PI;
    },
    out: S => { const d = S._cur == null ? S.th : S._cur, th = d * Math.PI / 180, q = d < 90 ? 1 : d < 180 ? 2 : d < 270 ? 3 : 4; return `θ = <b>${f(d, 0)}°</b> (จตุภาคที่ ${q}) · cos θ = <b>${f(Math.cos(th), 3)}</b> (${Math.cos(th) >= 0 ? '+' : '−'}) · sin θ = <b>${f(Math.sin(th), 3)}</b> (${Math.sin(th) >= 0 ? '+' : '−'})<br>sin²θ + cos²θ = ${f(Math.sin(th) ** 2 + Math.cos(th) ** 2, 3)} · tan θ = ${Math.abs(Math.cos(th)) < .01 ? 'ไม่นิยาม' : f(Math.tan(th), 3)}`; },
  });
  // ให้ตัวเลื่อนมุมควบคุมได้ปกติ: เล่นอัตโนมัติเฉพาะเมื่อกด ↺
  const uc = SIMS.unitcircle.mount; SIMS.unitcircle.mount = host => { const h = uc(host); host.querySelectorAll('.simbtns button').forEach((b, i) => { if (i === 0) { b.textContent = '▶ หมุนเอง'; b.onclick = () => { h.S._auto = !h.S._auto; b.textContent = h.S._auto ? '⏸ หยุดหมุน' : '▶ หมุนเอง'; }; } }); return h; };

  const FN = [{ n: 'x²', f: x => x * x, d: x => 2 * x }, { n: 'x³ − 3x', f: x => x * x * x - 3 * x, d: x => 3 * x * x - 3 }, { n: 'sin x', f: x => 2 * Math.sin(x), d: x => 2 * Math.cos(x) }];
  reg('derivative', {
    label: 'อนุพันธ์คือความชันของเส้นสัมผัส', h: 250,
    goal: 'เลื่อน x₀ ไปที่จุดสูงสุด/ต่ำสุดของ x³ − 3x แล้วดูว่าความชันเท่ากับ 0 — จากนั้นดูว่าก่อนและหลังจุดนั้นความชันเปลี่ยนเครื่องหมายอย่างไร',
    controls: [{ id: 'fn', label: 'ฟังก์ชัน', min: 0, max: 2, step: 1, v: 1, opts: ['f(x) = x²', 'f(x) = x³ − 3x', 'f(x) = 2 sin x'] }, { id: 'x0', label: 'จุด x₀', min: -3, max: 3, step: .05, v: -1.5, dec: 2 }],
    draw(g, W, H, S, t, C) {
      const F = FN[S.fn], { X, Y } = plot(g, W, H, C, [-3.5, 3.5], [-6, 6]);
      g.strokeStyle = C.pri; g.lineWidth = 3; g.beginPath(); let st = false; for (let px = -3.5; px <= 3.5; px += .03) { const yy = F.f(px); if (Math.abs(yy) > 7) { st = false; continue; } st ? g.lineTo(X(px), Y(yy)) : g.moveTo(X(px), Y(yy)); st = true; } g.stroke();
      const y0 = F.f(S.x0), m = F.d(S.x0); g.strokeStyle = C.bad; g.lineWidth = 2.5; g.beginPath(); g.moveTo(X(S.x0 - 2), Y(y0 - 2 * m)); g.lineTo(X(S.x0 + 2), Y(y0 + 2 * m)); g.stroke(); circ(g, X(S.x0), Y(y0), 6, C.warn, C.ink);
      if (Math.abs(m) < .06) txt(g, 'ความชัน = 0 (จุดวิกฤต)', X(S.x0) + 10, Y(y0) - 12, C.ok, 12);
    },
    out: S => { const F = FN[S.fn], m = F.d(S.x0); return `f(x₀) = ${f(F.f(S.x0), 2)} · ความชันเส้นสัมผัส f′(x₀) = <b>${f(m, 2)}</b><br>${Math.abs(m) < .06 ? '<b>f′ = 0 → จุดวิกฤต (สูงสุด/ต่ำสุด/จุดเปลี่ยน)</b>' : m > 0 ? 'f′ > 0 → ฟังก์ชันกำลังเพิ่มขึ้น' : 'f′ < 0 → ฟังก์ชันกำลังลดลง'}<br>f′(x) = ${['2x', '3x² − 3', '2 cos x'][S.fn]}`; },
  });

  reg('percent', {
    label: 'เพิ่มแล้วลดเปอร์เซ็นต์เท่ากัน ไม่เท่าเดิม', h: 210,
    goal: 'ตั้ง p = 20% แล้วดูว่าเพิ่ม 20% ตามด้วยลด 20% เหลือเท่าใด — แล้วลองคิดสูตรลัดจากแท่งกราฟ',
    controls: [{ id: 'p', label: 'เปอร์เซ็นต์ p', min: 5, max: 60, step: 5, v: 20, unit: '%' }],
    draw(g, W, H, S, t, C) {
      const a = 100, b = 100 * (1 + S.p / 100), c = b * (1 - S.p / 100), mx = 170, base = H - 32, bw = (W - 60) / 3 - 16;
      [[a, 'เริ่มต้น', C.mute], [b, 'เพิ่ม ' + S.p + '%', C.ok], [c, 'ลด ' + S.p + '%', c < a ? C.bad : C.pri]].forEach(([v, l, col], i) => { const x = 24 + i * (bw + 24), h = v / mx * (H - 70); rect(g, x, base - h, bw, h, col); txt(g, f(v, 1), x + bw / 2, base - h - 6, C.ink, 13, 'center'); txt(g, l, x + bw / 2, base + 16, C.ink, 12, 'center'); });
      line(g, 14, base - 100 / mx * (H - 70), W - 14, base - 100 / mx * (H - 70), C.mute, 1, [4, 3]);
    },
    out: S => `100 × (1 + ${S.p / 100}) × (1 − ${S.p / 100}) = 100 × (1 − ${f((S.p / 100) ** 2, 4)}) = <b>${f(100 * (1 - (S.p / 100) ** 2), 1)}</b> → ลดลง <b>${f(S.p * S.p / 100, 1)}%</b> (= p²/100)`,
  });

  reg('sequence', {
    label: 'ลำดับเลขคณิตและเรขาคณิต', h: 220,
    goal: 'เปรียบเทียบการเติบโต: ลำดับเรขาคณิต (คูณ r) โตเร็วกว่าเลขคณิต (บวก d) มากเมื่อพจน์เยอะ — ลองให้ |r| < 1 ดูผลบวกอนันต์',
    controls: [{ id: 'mode', label: 'ชนิด', min: 0, max: 1, step: 1, v: 0, opts: ['เลขคณิต (บวก d)', 'เรขาคณิต (คูณ r)'] }, { id: 'a1', label: 'พจน์แรก a₁', min: 1, max: 10, step: 1, v: 3 }, { id: 'k', label: 'ค่า d หรือ r', min: -2, max: 5, step: .5, v: 2, dec: 1 }, { id: 'n', label: 'จำนวนพจน์ n', min: 3, max: 10, step: 1, v: 6 }],
    draw(g, W, H, S, t, C) {
      const geo = S.mode === 1, terms = []; for (let i = 0; i < S.n; i++) terms.push(geo ? S.a1 * Math.pow(S.k, i) : S.a1 + i * S.k);
      const mx = Math.max(1, ...terms.map(Math.abs)), mn = Math.min(0, ...terms), rg = Math.max(...terms, 0) - mn, base = H - 28 - ((0 - mn) / rg) * (H - 60) * 0, zero = H - 34 - (-mn) / rg * (H - 70), bw = (W - 30) / S.n - 8;
      line(g, 10, zero, W - 10, zero, C.mute, 1.5);
      terms.forEach((v, i) => { const h = v / rg * (H - 70), x = 18 + i * (bw + 8); rect(g, x, h >= 0 ? zero - h : zero, bw, Math.abs(h), geo ? C.warn : C.pri); txt(g, f(v, 1), x + bw / 2, h >= 0 ? zero - h - 5 : zero + Math.abs(h) + 12, C.ink, 11, 'center'); txt(g, 'a' + (i + 1), x + bw / 2, H - 8, C.mute, 10, 'center'); });
    },
    out: S => { const geo = S.mode === 1; const an = geo ? S.a1 * Math.pow(S.k, S.n - 1) : S.a1 + (S.n - 1) * S.k; const Sn = geo ? (S.k === 1 ? S.a1 * S.n : S.a1 * (Math.pow(S.k, S.n) - 1) / (S.k - 1)) : S.n * (S.a1 + an) / 2; return `${geo ? 'aₙ = a₁rⁿ⁻¹' : 'aₙ = a₁ + (n−1)d'} → a${S.n} = <b>${f(an, 2)}</b><br>${geo ? 'Sₙ = a₁(rⁿ−1)/(r−1)' : 'Sₙ = n(a₁+aₙ)/2'} = <b>${f(Sn, 2)}</b>${geo && Math.abs(S.k) < 1 ? '<br>|r| < 1 → ผลบวกอนันต์ = a₁/(1−r) = <b>' + f(S.a1 / (1 - S.k), 2) + '</b>' : ''}`; },
  });
})();
