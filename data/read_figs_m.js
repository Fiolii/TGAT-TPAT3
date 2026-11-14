// ภาพกระดานดำวิชาคณิตศาสตร์
(function () {
  const poly = pts => 'M' + pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' L') + 'z';
  const rect = (x, y, w, h) => poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]);
  const circ = (cx, cy, r) => `M${cx - r},${cy} A${r},${r} 0 1 1 ${cx + r},${cy} A${r},${r} 0 1 1 ${cx - r},${cy}`;
  const path = (n, f) => Array.from({ length: n + 1 }, (_, i) => f(i / n)).map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const axes = (S, ox, oy, xr, yu, yd) => S.ar(ox - (xr[0] || 0), oy, ox + xr[1], oy, 'ink', 2) + S.ar(ox, oy + (yd || 0), ox, oy - yu, 'ink', 2);

  Object.assign(BF, {
    venn: S => [
      S.fl(rect(40, 30, 360, 190), 'ink', .06) + S.pa(rect(40, 30, 360, 190), 'ink', 2) + S.tx(52, 48, 'U = 40', 'mute', 'start', 13) + S.fl(circ(165, 125, 70), 'pri', .3) + S.pa(circ(165, 125, 70), 'pri', 2.5) + S.fl(circ(255, 125, 60), 'warn', .3) + S.pa(circ(255, 125, 60), 'warn', 2.5) + S.tx(120, 62, 'A: คณิต 25', 'pri', 'middle', 13) + S.tx(300, 62, 'B: ฟิสิกส์ 18', 'warn', 'middle', 13),
      S.tx(70, 204, 'ไม่ชอบทั้งสอง 8', 'bad', 'start', 13),
      S.tx(220, 20, 'ชอบอย่างน้อย 1 วิชา = 40 − 8 = 32', 'ok', 'middle', 14),
      S.tx(210, 130, '11', 'ok', 'middle', 22) + S.tx(220, 242, 'n(A∩B) = 25 + 18 − 32 = 11', 'warn', 'middle', 15),
      S.tx(125, 130, '14', 'pri', 'middle', 20) + S.tx(285, 130, '7', 'warn', 'middle', 20) + S.tx(340, 204, 'ตรวจ: 14+11+7+8 = 40 ✓', 'ok', 'end', 13)
    ],

    truth: S => {
      const rows = [['T', 'T'], ['T', 'F'], ['F', 'T'], ['F', 'F']], y = i => 106 + i * 34, xs = { p: 50, q: 110, imp: 200, neg: 310, alt: 410 };
      const col = (x, vals, c) => vals.map((v, i) => S.tx(x, y(i), v, v === 'T' ? 'ok' : 'bad', 'middle', 18)).join('');
      return [
        S.ln(25, 78, 440, 78, 'ink', 2) + S.tx(xs.p, 68, 'p', 'pri', 'middle', 17) + S.tx(xs.q, 68, 'q', 'pri', 'middle', 17) + col(xs.p, rows.map(r => r[0])) + col(xs.q, rows.map(r => r[1])) + S.ln(80, 50, 80, 232, 'mute', 1.3, '4 4'),
        S.tx(xs.imp, 68, 'p → q', 'warn', 'middle', 17) + col(xs.imp, ['T', 'F', 'T', 'T']) + S.ln(150, 50, 150, 232, 'mute', 1.3, '4 4'),
        S.tx(xs.neg, 68, '~(p → q)', 'bad', 'middle', 17) + col(xs.neg, ['F', 'T', 'F', 'F']) + S.ln(255, 50, 255, 232, 'mute', 1.3, '4 4'),
        S.tx(xs.alt, 68, 'p ∧ ~q', 'ok', 'middle', 17) + col(xs.alt, ['F', 'T', 'F', 'F']) + S.pa(rect(270, 86, 170, 140), 'ok', 2.5, '6 4') + S.tx(220, 26, '2 คอลัมน์สุดท้ายเหมือนกันทุกแถว ⇒ ~(p→q) ≡ p ∧ ~q', 'ok', 'middle', 14)
      ];
    },

    signline: S => {
      const X = u => 190 + 50 * u, y = 130;
      return [
        S.ar(30, y, 420, y, 'ink', 2.5) + [-3, -2, -1, 0, 1, 2, 3, 4].map(u => S.ln(X(u), y - 4, X(u), y + 4, 'mute', 1.5) + S.tx(X(u), y + 20, String(u), 'mute', 'middle', 12)).join(''),
        S.tx(220, 26, '(x − 1)(x + 2) / (x − 3) ≥ 0', 'ink', 'middle', 16) + S.ln(X(-2), 60, X(-2), 100, 'warn', 1.6, '4 3') + S.ln(X(1), 60, X(1), 100, 'warn', 1.6, '4 3') + S.ln(X(3), 60, X(3), 100, 'bad', 1.6, '4 3') + S.tx(X(-2), 54, 'x = −2', 'warn', 'middle', 12) + S.tx(X(1), 54, 'x = 1', 'warn', 'middle', 12) + S.tx(X(3), 54, 'x = 3', 'bad', 'middle', 12),
        S.ci(X(-2), y, 7, 'warn') + S.ci(X(1), y, 7, 'warn') + S.pa(circ(X(3), y, 7), 'bad', 3) + S.tx(220, 176, '● ใส่จุดทึบ = รวม (ตัวเศษ = 0)   ○ จุดโปร่ง = ไม่รวม (ตัวส่วน = 0)', 'mute', 'middle', 12),
        S.tx((X(-3) + X(-2)) / 2, 104, '−', 'bad', 'middle', 22) + S.tx((X(-2) + X(1)) / 2, 104, '+', 'ok', 'middle', 22) + S.tx((X(1) + X(3)) / 2, 104, '−', 'bad', 'middle', 22) + S.tx((X(3) + X(4)) / 2, 104, '+', 'ok', 'middle', 22),
        S.ln(X(-2), y, X(1), y, 'ok', 6) + S.ln(X(3) + 8, y, 420, y, 'ok', 6) + S.tx(220, 220, 'คำตอบ: [−2, 1] ∪ (3, ∞)', 'ok', 'middle', 18)
      ];
    },

    compose: S => {
      const box = (x, y, t, c) => S.fl(rect(x, y, 96, 40), c, .3) + S.pa(rect(x, y, 96, 40), c, 2.5) + S.tx(x + 48, y + 26, t, c, 'middle', 14);
      return [
        S.tx(20, 40, '(f∘g)(2)', 'pri', 'start', 14) + box(150, 50, 'g(x) = x²', 'pri') + box(300, 50, 'f(x) = 2x + 3', 'warn') + S.tx(20, 160, '(g∘f)(2)', 'warn', 'start', 14) + box(150, 150, 'f(x) = 2x + 3', 'warn') + box(300, 150, 'g(x) = x²', 'pri'),
        S.tx(100, 76, '2', 'ink', 'middle', 18) + S.ar(112, 70, 148, 70, 'ink', 2) + S.ar(248, 70, 298, 70, 'ink', 2) + S.tx(272, 62, '4', 'ok', 'middle', 16) + S.ar(398, 70, 428, 70, 'ink', 2) + S.tx(425, 46, '11', 'ok', 'end', 17),
        S.tx(100, 176, '2', 'ink', 'middle', 18) + S.ar(112, 170, 148, 170, 'ink', 2) + S.ar(248, 170, 298, 170, 'ink', 2) + S.tx(272, 162, '7', 'ok', 'middle', 16) + S.ar(398, 170, 428, 170, 'ink', 2) + S.tx(425, 146, '49', 'ok', 'end', 17) + S.tx(220, 218, 'f∘g ≠ g∘f (สลับลำดับ ผลต่างกัน)', 'bad', 'middle', 13),
        S.tx(220, 242, 'f⁻¹: y = 2x + 3 → x = (y − 3)/2 → f⁻¹(x) = (x − 3)/2', 'warn', 'middle', 14)
      ];
    },

    expcurve: S => [
      axes(S, 50, 210, [0, 330], 170, 0) + S.pa(path(40, t => [50 + 300 * t, 210 - 10 * Math.pow(2, 4 * t)]), 'pri', 3.5) + [0, 1, 2, 3, 4].map(u => S.tx(50 + 75 * u, 228, String(u), 'mute', 'middle', 12)).join('') + S.tx(60, 30, 'y = 2ˣ', 'pri', 'start', 16),
      S.tx(250, 70, '2ˣ⁺¹ + 2ˣ = 24', 'ink', 'start', 14) + S.tx(250, 92, '2·2ˣ + 2ˣ = 3·2ˣ = 24', 'ink', 'start', 14),
      S.ln(50, 130, 350, 130, 'warn', 2.2, '6 4') + S.tx(354, 134, '2ˣ = 8', 'warn', 'start', 15) + S.tx(250, 116, '3·2ˣ = 24 → 2ˣ = 8', 'ink', 'start', 13).replace('250', '300'),
      S.ln(275, 130, 275, 210, 'ok', 2.2, '6 4') + S.ci(275, 130, 6, 'ok') + S.tx(275, 244, 'x = 3', 'ok', 'middle', 18)
    ],

    unitcirc: S => {
      const cx = 150, cy = 130, r = 90, px = cx - 72, py = cy - 54;
      return [
        S.ar(cx - 110, cy, cx + 110, cy, 'ink', 1.8) + S.ar(cx, cy + 105, cx, cy - 110, 'ink', 1.8) + S.pa(circ(cx, cy, r), 'mute', 2.5) + S.ci(px, py, 6, 'warn') + S.ln(cx, cy, px, py, 'warn', 3) + S.pa(`M${cx + 28},${cy} A28,28 0 0 0 ${cx - 22},${cy - 17}`, 'ink', 2) + S.tx(cx + 12, cy - 30, 'θ', 'ink', 'start', 15) + S.tx(px - 8, py - 6, 'P', 'warn', 'end', 14) + S.tx(cx + 114, cy + 4, 'x', 'mute', 'start', 12),
        S.ln(px, cy, px, py, 'bad', 3) + S.tx(px - 6, (cy + py) / 2 + 4, 'sinθ = 3/5', 'bad', 'end', 13) + S.ln(cx, cy + 14, px, cy + 14, 'pri', 3) + S.tx((cx + px) / 2, cy + 32, 'cosθ = ?', 'pri', 'middle', 13),
        S.tx(278, 46, 'จตุภาคที่ 2: cosθ < 0', 'ok', 'start', 13) + S.tx(278, 68, 'cosθ = −√(1 − 9/25) = −4/5', 'ok', 'start', 13),
        S.tx(278, 112, 'sin 2θ = 2 sinθ cosθ', 'ink', 'start', 15) + S.tx(278, 136, '= 2 (3/5)(−4/5)', 'ink', 'start', 15) + S.tx(278, 166, '= −24/25', 'warn', 'start', 20)
      ];
    },

    argand: S => {
      const ox = 110, oy = 140, u = 40;
      return [
        S.ar(20, oy, 430, oy, 'ink', 1.8) + S.ar(ox, 230, ox, 20, 'ink', 1.8) + S.tx(430, oy + 18, 'Re', 'mute', 'end', 12) + S.tx(ox + 8, 24, 'Im', 'mute', 'start', 12) + S.ci(ox + u, oy - u, 6, 'warn') + S.ln(ox, oy, ox + u, oy - u, 'warn', 3) + S.tx(ox + u + 8, oy - u - 6, '1 + i', 'warn', 'start', 15) + S.ln(ox + u, oy - u, ox + u, oy, 'mute', 1.3, '4 3') + S.ln(ox, oy, ox + u, oy, 'mute', 1.3, '4 3'),
        S.pa(`M${ox + 36},${oy} A36,36 0 0 0 ${ox + 25.5},${oy - 25.5}`, 'ink', 2) + S.tx(ox + 40, oy - 8, '45°', 'ink', 'start', 12) + S.tx(260, 60, '1 + i = √2 (cos 45° + i sin 45°)', 'ink', 'start', 14) + S.tx(260, 82, 'r = √2 , θ = 45°', 'warn', 'start', 14),
        S.pa(circ(ox, oy, 90), 'pri', 2, '6 4') + S.ar(ox + 90, oy - 4, ox + 90, oy - 12, 'pri', 2) + S.tx(260, 118, '(1 + i)⁸ : หมุน 8 × 45° = 360°', 'pri', 'start', 14) + S.tx(260, 138, 'รัศมีคูณ 8 ครั้ง: (√2)⁸', 'pri', 'start', 13),
        S.ar(ox, oy + 30, ox + 300, oy + 30, 'ok', 4) + S.tx(ox + 300, oy + 50, '16', 'ok', 'end', 22) + S.tx(260, 200, '= 16 (cos 360° + i sin 360°) = 16', 'ok', 'start', 14)
      ];
    },

    lines: S => {
      const ox = 80, oy = 190, k = 42, P = (x, y) => [ox + k * x, oy - k * y];
      return [
        axes(S, ox, oy, [0, 230], 170, 40) + S.tx(ox + 232, oy + 16, 'x', 'mute', 'end', 12) + S.tx(ox + 8, 22, 'y', 'mute', 'start', 12),
        S.ln(...P(0.5, 4), ...P(3, -1), 'pri', 3.5) + S.tx(...P(0.6, 4.1).map((v, i) => v + (i ? 0 : 6)), '2x + y = 5', 'pri', 'start', 13) + S.tx(300, 56, 'AX = B', 'ink', 'start', 16) + S.tx(300, 78, 'A = [2 1 ; 1 −1]', 'ink', 'start', 13),
        S.ln(...P(0, -0.9), ...P(4, 3), 'warn', 3.5) + S.tx(...P(3.1, 2.4).map((v, i) => v + (i ? 0 : 6)), 'x − y = 1', 'warn', 'start', 13) + S.tx(300, 110, 'det A = −2 − 1 = −3 ≠ 0', 'ink', 'start', 13),
        S.ci(...P(2, 1), 7, 'ok') + S.tx(...P(2, 1).map((v, i) => v + (i ? 24 : -8)), '(2, 1)', 'ok', 'end', 16) + S.tx(300, 150, 'X = A⁻¹B = [2 ; 1]', 'ok', 'start', 14) + S.tx(300, 176, 'x = 2 , y = 1', 'ok', 'start', 18)
      ];
    },

    seqbars: S => {
      const val = n => 4 * n - 3, bx = i => 36 + 32 * i, h = n => val(n) * 3.0, base = 205;
      const bars = hi => Array.from({ length: 12 }, (_, i) => i + 1).map(n => { const c = hi.includes(n) ? 'warn' : 'pri'; return S.fl(rect(bx(n - 1), base - h(n), 24, h(n)), c, hi.includes(n) ? .6 : .3) + S.pa(rect(bx(n - 1), base - h(n), 24, h(n)), c, 2); }).join('');
      return [
        S.ln(24, base, 424, base, 'ink', 2) + bars([]) + Array.from({ length: 12 }, (_, i) => S.tx(bx(i) + 12, 222, String(i + 1), 'mute', 'middle', 11)).join('') + S.tx(224, 20, 'ลำดับเลขคณิต: พจน์ที่ n (ข้างล่าง) และค่า (ความสูง)', 'mute', 'middle', 12),
        S.fl(rect(bx(4), base - h(5), 24, h(5)), 'warn', .6) + S.pa(rect(bx(4), base - h(5), 24, h(5)), 'warn', 3) + S.tx(bx(4) + 12, base - h(5) - 6, '17', 'warn', 'middle', 14) + S.fl(rect(bx(11), base - h(12), 24, h(12)), 'warn', .6) + S.pa(rect(bx(11), base - h(12), 24, h(12)), 'warn', 3) + S.tx(bx(11) + 12, base - h(12) - 6, '45', 'warn', 'middle', 14),
        S.ar2(bx(4) + 12, 44, bx(11) + 12, 44, 'ok', 2) + S.tx((bx(4) + bx(11)) / 2 + 12, 36, '7 ก้าว เพิ่มรวม 45 − 17 = 28 → d = 4', 'ok', 'middle', 12),
        S.fl(rect(bx(0), base - h(1), 24, h(1)), 'bad', .7) + S.pa(rect(bx(0), base - h(1), 24, h(1)), 'bad', 3) + S.tx(bx(0) + 12, base - h(1) - 6, 'a₁ = 1', 'bad', 'start', 12) + S.tx(70, 90, 'a₁ = 17 − 4×4 = 1', 'bad', 'start', 13),
        S.tx(70, 118, 'S₂₀ = (20/2)[2(1) + 19(4)]', 'ink', 'start', 14) + S.tx(70, 142, '= 10 × 78 = 780', 'ok', 'start', 18)
      ];
    },

    parab: S => {
      const ox = 150, oy = 125, k = 20, P = (x, y) => [ox + k * x, oy - k * y];
      return [
        axes(S, ox, oy, [100, 260], 105, 105) + S.tx(ox + 258, oy + 16, 'x', 'mute', 'end', 12) + S.tx(ox + 8, 20, 'y', 'mute', 'start', 12),
        S.pa(path(60, t => { const y = -5 + 10 * t; return P(y * y / 8, y); }), 'pri', 3.5) + S.tx(300, 50, 'y² = 8x', 'pri', 'start', 16),
        S.tx(300, 80, 'y² = 4ax → 4a = 8', 'ink', 'start', 14) + S.tx(300, 102, 'a = 2 (เปิดขวา)', 'warn', 'start', 15),
        S.ci(...P(2, 0), 7, 'ok') + S.tx(...P(2, 0).map((v, i) => v + (i ? 20 : 0)), 'โฟกัส (2, 0)', 'ok', 'middle', 13),
        S.ln(...P(-2, 5), ...P(-2, -5), 'bad', 2.5, '6 4') + S.tx(...P(-2, -5.2).map((v, i) => v + (i ? 8 : 0)), 'เส้นบังคับ x = −2', 'bad', 'middle', 12) + S.ci(...P(2, 4), 6, 'warn') + S.ln(...P(2, 4), ...P(2, 0), 'warn', 2.2) + S.ln(...P(2, 4), ...P(-2, 4), 'warn', 2.2) + S.tx(...P(2, 4).map((v, i) => v + (i ? -8 : 8)), 'P (2, 4)', 'warn', 'start', 12) + S.tx(300, 160, 'PF = PD = 4 ✓', 'warn', 'start', 14)
      ];
    },

    vec: S => [
      S.fl(poly([[110, 190], [200, 90], [290, 160]]), 'pri', .2) + S.ar(110, 190, 200, 90, 'pri', 3.5) + S.ar(110, 190, 290, 160, 'warn', 3.5) + S.tx(140, 126, 'OP = (1, 2, 2)', 'pri', 'end', 13) + S.tx(290, 184, 'OQ = (2, −1, 2)', 'warn', 'middle', 13) + S.ci(110, 190, 5, 'ink') + S.tx(98, 206, 'O', 'ink', 'end', 13),
      S.tx(310, 60, 'OP × OQ =', 'ink', 'start', 14) + S.tx(310, 84, '(6, 2, −5)', 'ok', 'start', 17),
      S.ar(210, 150, 210, 60, 'ok', 3.5) + S.tx(218, 70, 'ตั้งฉากกับระนาบ', 'ok', 'start', 12),
      S.tx(310, 124, 'พื้นที่ = ½ |OP × OQ|', 'ink', 'start', 14) + S.tx(310, 148, '= ½ √(36+4+25) = √65 / 2', 'ink', 'start', 13) + S.tx(310, 176, '≈ 4.03', 'warn', 'start', 20)
    ],

    dots: S => {
      const xs = [2, 4, 4, 4, 5, 5, 7, 9], X = v => 40 + 38 * v, cnt = {};
      const dot = (v, c) => { cnt[v] = (cnt[v] || 0) + 1; return S.ci(X(v), 160 - 22 * (cnt[v] - 1), 8, c); };
      return [
        S.ar(30, 180, 420, 180, 'ink', 2) + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => S.tx(X(v), 200, String(v), 'mute', 'middle', 12)).join('') + xs.map(v => dot(v, 'pri')).join(''),
        S.ln(X(5), 60, X(5), 180, 'warn', 2.5, '6 4') + S.tx(X(5), 52, 'x̄ = 40/8 = 5', 'warn', 'middle', 14),
        [-3, -1, -1, -1, 0, 0, 2, 4].map((d, i) => '').join('') + S.tx(X(2), 120, '−3', 'bad', 'middle', 13) + S.tx(X(4), 96, '−1', 'bad', 'middle', 13) + S.tx(X(7), 144, '+2', 'ok', 'middle', 13) + S.tx(X(9), 144, '+4', 'ok', 'middle', 13) + S.tx(X(5), 130, '0', 'mute', 'middle', 13),
        S.tx(220, 226, '(x − 5)²: 9+1+1+1+0+0+4+16 = 32', 'ink', 'middle', 14),
        S.tx(220, 28, 'σ² = 32/8 = 4 → σ = 2', 'ok', 'middle', 18)
      ];
    },

    bell: S => {
      const X = z => 220 + 60 * z, Y = z => 200 - 150 * Math.exp(-z * z / 2), curve = (a, b, n = 60) => path(n, t => { const z = a + (b - a) * t; return [X(z), Y(z)]; });
      return [
        S.ar(20, 200, 430, 200, 'ink', 2) + S.pa(curve(-3.3, 3.3, 80), 'pri', 3.5) + S.tx(X(0), 218, '70 (μ)', 'ink', 'middle', 14) + S.ln(X(0), 200, X(0), 50, 'mute', 1.3, '4 4'),
        S.ln(X(-1), 200, X(-1), Y(-1), 'warn', 2.2) + S.ln(X(1), 200, X(1), Y(1), 'warn', 2.2) + S.tx(X(-1), 218, '60', 'warn', 'middle', 14) + S.tx(X(1), 218, '80', 'warn', 'middle', 14) + S.tx(X(-1), 238, 'μ − σ', 'mute', 'middle', 11) + S.tx(X(1), 238, 'μ + σ', 'mute', 'middle', 11),
        S.fl(curve(-1, 1, 40) + ` L${X(1)},200 L${X(-1)},200 z`, 'ok', .4),
        S.tx(X(0), 150, '68%', 'ok', 'middle', 26) + S.tx(220, 30, 'ข้อมูลภายใน ±1σ ≈ 68%', 'ok', 'middle', 16)
      ];
    },

    slots: S => {
      const slot = (i, t, c = 'ink') => S.fl(rect(40 + 80 * i, 90, 60, 44), c, .2) + S.pa(rect(40 + 80 * i, 90, 60, 44), c, 2.5) + S.tx(70 + 80 * i, 120, t, c, 'middle', 18);
      return [
        [0, 1, 2, 3, 4].map(i => slot(i, '')).join('') + S.tx(220, 60, 'เรียง 5 คนเป็นแถว: 5! = 120 วิธี', 'ink', 'middle', 15),
        S.pa(rect(34, 82, 148, 60), 'warn', 3.5) + S.tx(70, 120, 'A', 'warn', 'middle', 18) + S.tx(150, 120, 'B', 'warn', 'middle', 18) + S.tx(240, 120, 'C', 'ink', 'middle', 18) + S.tx(320, 120, 'D', 'ink', 'middle', 18) + S.tx(400, 120, 'E', 'ink', 'middle', 18) + S.tx(108, 166, 'มัดเป็น 1 หน่วย', 'warn', 'middle', 12),
        S.tx(220, 200, 'ติดกัน = 4! × 2! = 24 × 2 = 48', 'bad', 'middle', 16),
        S.tx(220, 232, 'ไม่ติดกัน = 120 − 48 = 72', 'ok', 'middle', 20)
      ];
    },

    balls: S => {
      const ball = (i, c) => S.ci(60 + (i % 5) * 60, 80 + Math.floor(i / 5) * 56, 20, c);
      return [
        Array.from({ length: 10 }, (_, i) => ball(i, i < 4 ? 'bad' : 'pri')).join('') + S.tx(60, 40, 'แดง 4', 'bad', 'start', 14) + S.tx(180, 40, 'น้ำเงิน 6 (รวม 10 ลูก)', 'pri', 'start', 14),
        S.tx(220, 176, 'หยิบ 2 ลูกพร้อมกัน: n(S) = C(10,2) = 45', 'ink', 'middle', 15),
        S.tx(220, 202, 'แดง 2 ลูก C(4,2) = 6 · น้ำเงิน 2 ลูก C(6,2) = 15', 'ok', 'middle', 14),
        S.tx(220, 234, 'P = (6 + 15)/45 = 21/45 = 7/15', 'warn', 'middle', 20)
      ];
    },

    boxv: S => {
      const ox = 50, oy = 210, X = x => ox + 50 * x, V = x => x * (12 - 2 * x) * (12 - 2 * x), Y = v => oy - 1.1 * v;
      return [
        axes(S, ox, oy, [0, 340], 190, 0) + S.pa(path(60, t => [X(6 * t), Y(V(6 * t))]), 'pri', 3.5) + [0, 1, 2, 3, 4, 5, 6].map(x => S.tx(X(x), 228, String(x), 'mute', 'middle', 12)).join('') + S.tx(ox + 346, 226, 'x (cm)', 'mute', 'end', 12) + S.tx(ox + 8, 24, 'V (cm³)', 'mute', 'start', 12),
        S.tx(230, 70, 'V = x (12 − 2x)²', 'ink', 'start', 16),
        S.ln(X(2), oy, X(2), Y(128), 'warn', 2.2, '6 4') + S.tx(230, 96, 'V′ = (12−2x)(12−6x) = 0', 'warn', 'start', 14) + S.tx(230, 118, 'x = 2 (x = 6 ไม่ได้)', 'warn', 'start', 14),
        S.ci(X(2), Y(128), 7, 'ok') + S.tx(X(2) + 14, Y(128) - 8, 'V = 128 cm³ (สูงสุด)', 'ok', 'start', 15)
      ];
    }
  });
})();
