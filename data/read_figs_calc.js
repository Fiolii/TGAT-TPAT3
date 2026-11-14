// ภาพกระดานดำแคลคูลัส 4.2–4.7
(function () {
  const poly = pts => 'M' + pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' L') + 'z';
  const rect = (x, y, w, h) => poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]);
  const circ = (cx, cy, r) => `M${cx - r},${cy} A${r},${r} 0 1 1 ${cx + r},${cy} A${r},${r} 0 1 1 ${cx - r},${cy}`;
  const path = (n, f) => Array.from({ length: n + 1 }, (_, i) => f(i / n)).map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const axes = (S, ox, oy, xr, yu, yd = 0) => S.ar(ox, oy, ox + xr, oy, 'ink', 2) + S.ar(ox, oy + yd, ox, oy - yu, 'ink', 2);

  Object.assign(BF, {
    // ลิมิต (x²−4)/(x−2) (440×250)
    limhole: S => {
      const ox = 70, oy = 210, X = x => ox + 62 * x, Y = y => oy - 22 * y, hole = S.pa(circ(X(2), Y(4), 6), 'warn', 3);
      return [
        axes(S, ox, oy, 330, 190) + [1, 2, 3, 4, 5].map(u => S.tx(X(u), oy + 16, String(u), 'mute', 'middle', 11)).join('') + S.ln(X(0.3), Y(2.3), X(1.94), Y(3.94), 'pri', 3.5) + S.ln(X(2.06), Y(4.06), X(5), Y(7), 'pri', 3.5) + hole + S.tx(X(2) - 10, Y(4) - 12, '(2 , ?)', 'warn', 'end', 13) + S.tx(250, 40, 'f(x) = (x² − 4)/(x − 2)', 'pri', 'start', 15),
        S.tx(250, 70, 'แทน x = 2 → 0/0', 'bad', 'start', 14) + S.tx(250, 92, '(ยังไม่รู้ค่า ต้องจัดรูป)', 'mute', 'start', 12),
        S.tx(250, 122, '= (x−2)(x+2)/(x−2)', 'ink', 'start', 14) + S.tx(250, 144, '= x + 2   (x ≠ 2)', 'ok', 'start', 15),
        [1.2, 1.6, 1.9].map(x => S.ci(X(x), Y(x + 2), 4, 'ok')).join('') + [2.8, 2.4, 2.1].map(x => S.ci(X(x), Y(x + 2), 4, 'warn')).join('') + S.ar(X(1.5), Y(5.0), X(1.9), Y(4.3), 'ok', 2) + S.tx(X(1.2), Y(5.3), 'x → 2⁻', 'ok', 'middle', 13) + S.ar(X(3.3), Y(4.0), X(2.15), Y(4.2), 'warn', 2) + S.tx(X(3.4), Y(3.4), 'x → 2⁺', 'warn', 'start', 13),
        S.ln(ox, Y(4), X(2), Y(4), 'ok', 1.8, '5 4') + S.tx(ox - 6, Y(4) + 4, '4', 'ok', 'end', 15) + S.tx(250, 184, 'lim (x + 2) = 4', 'ok', 'start', 20)
      ];
    },

    // ความต่อเนื่อง: หาค่า k (440×250)
    contin: S => {
      const ox = 70, oy = 210, X = x => ox + 62 * x, Y = y => oy - 28 * y;
      return [
        axes(S, ox, oy, 330, 190) + [1, 2, 3, 4].map(u => S.tx(X(u), oy + 16, String(u), 'mute', 'middle', 11)).join('') + S.ln(X(0), Y(1), X(1.94), Y(2.94), 'pri', 3.5) + S.ln(X(2.06), Y(3.06), X(4.4), Y(5.4), 'pri', 3.5) + S.pa(circ(X(2), Y(3), 6), 'warn', 3) + S.tx(250, 40, 'f(x) = (x²−x−2)/(x−2) ; f(2) = k', 'pri', 'start', 14),
        S.tx(250, 70, 'x²−x−2 = (x−2)(x+1)', 'ink', 'start', 14) + S.tx(250, 92, 'f(x) = x + 1  (x ≠ 2)', 'ok', 'start', 15),
        S.ln(ox, Y(3), X(2), Y(3), 'ok', 1.8, '5 4') + S.ln(X(2), Y(3), X(2), oy, 'ok', 1.8, '5 4') + S.tx(ox - 6, Y(3) + 4, '3', 'ok', 'end', 15) + S.tx(250, 130, 'lim f(x) = 2 + 1 = 3', 'ok', 'start', 16),
        S.ci(X(2), Y(3), 8, 'warn') + S.tx(250, 170, 'ต้องมี f(2) = lim', 'ink', 'start', 14) + S.tx(250, 196, 'k = 3', 'warn', 'start', 22)
      ];
    },

    // ตำแหน่ง–ความเร็ว–ความเร่ง (440×250)
    stpos: S => {
      const ox = 50, oy = 215, X = t => ox + 78 * t, Y = s => oy - 38 * s, s = t => t * t * t - 6 * t * t + 9 * t;
      return [
        axes(S, ox, oy, 360, 190) + S.pa(path(70, u => [X(4.1 * u), Y(s(4.1 * u))]), 'pri', 3.5) + [1, 2, 3, 4].map(u => S.tx(X(u), oy + 16, String(u), 'mute', 'middle', 11)).join('') + S.tx(ox + 8, 24, 's (m)', 'mute', 'start', 12) + S.tx(X(4.1) + 6, oy + 16, 't (s)', 'mute', 'start', 12) + S.tx(300, 40, 's(t) = t³ − 6t² + 9t', 'pri', 'start', 14),
        S.tx(300, 70, 'v = s′ = 3t² − 12t + 9', 'warn', 'start', 14),
        S.tx(300, 96, 'a = v′ = 6t − 12', 'ok', 'start', 14),
        S.ln(X(0.55), Y(4), X(1.45), Y(4), 'bad', 3) + S.ln(X(2.55), Y(0), X(3.45), Y(0), 'bad', 3) + S.ci(X(1), Y(4), 6, 'bad') + S.ci(X(3), Y(0), 6, 'bad') + S.tx(X(1), Y(4) - 12, 't = 1 (v = 0)', 'bad', 'middle', 12) + S.tx(X(3), Y(0) - 34, 't = 3 (v = 0)', 'bad', 'middle', 12) + S.tx(300, 124, '3(t−1)(t−3) = 0', 'bad', 'start', 14),
        S.tx(300, 154, 't = 1 : a = −6 (หน่วง)', 'ok', 'start', 13) + S.tx(300, 176, 't = 3 : a = +6 (เร่ง)', 'ok', 'start', 13)
      ];
    },

    // รั้วล้อมที่ดินโดยมีกำแพง (440×250)
    fence: S => {
      const ox = 280, oy = 215, X = x => ox + 3.1 * x, Y = a => oy - 0.095 * a;
      return [
        S.ln(30, 50, 230, 50, 'ink', 6) + S.tx(130, 40, 'กำแพง (ไม่ต้องใช้รั้ว)', 'mute', 'middle', 12) + S.fl(rect(50, 50, 160, 110), 'pri', .15) + S.ln(50, 50, 50, 160, 'warn', 3.5) + S.ln(210, 50, 210, 160, 'warn', 3.5) + S.ln(50, 160, 210, 160, 'warn', 3.5) + S.tx(40, 110, 'x', 'warn', 'end', 16) + S.tx(220, 110, 'x', 'warn', 'start', 16) + S.tx(130, 182, '100 − 2x', 'warn', 'middle', 15),
        S.tx(130, 206, 'A = x (100 − 2x) = 100x − 2x²', 'ink', 'middle', 13),
        axes(S, ox, oy, 150, 150) + S.pa(path(60, t => [X(50 * t), Y(100 * 50 * t - 2 * 2500 * t * t)]), 'pri', 3.5) + S.tx(ox + 150, oy + 16, 'x', 'mute', 'end', 12) + S.tx(ox + 6, 56, 'A', 'mute', 'start', 12),
        S.ln(X(25), oy, X(25), Y(1250), 'ok', 2, '5 4') + S.ci(X(25), Y(1250), 7, 'ok') + S.tx(X(25), oy + 16, '25', 'ok', 'middle', 13) + S.tx(300, 40, 'A′ = 100 − 4x = 0', 'warn', 'start', 14),
        S.tx(X(25) + 12, Y(1250) - 8, 'A = 1 250 m²', 'ok', 'start', 16)
      ];
    },

    // ความเร่ง → ความเร็ว → ตำแหน่ง (440×250)
    accel: S => {
      const box = (x, y, w, h, c, t1, t2) => S.fl(rect(x, y, w, h), c, .22) + S.pa(rect(x, y, w, h), c, 2.5) + S.tx(x + w / 2, y + 28, t1, c, 'middle', 13) + S.tx(x + w / 2, y + 50, t2, 'ink', 'middle', 15);
      return [
        box(20, 40, 120, 70, 'pri', 'ความเร่ง', 'a = 6t − 12'),
        S.ar(142, 75, 168, 75, 'warn', 3) + S.tx(155, 60, '∫', 'warn', 'middle', 20) + box(170, 40, 150, 70, 'warn', 'ความเร็ว', 'v = 3t²−12t + C₁'),
        S.tx(245, 136, 'v(0) = 9 → C₁ = 9', 'bad', 'middle', 14) + S.tx(245, 156, 'v = 3t² − 12t + 9', 'warn', 'middle', 14),
        S.ar(322, 75, 348, 75, 'ok', 3) + S.tx(335, 60, '∫', 'ok', 'middle', 20) + box(350, 40, 160, 70, 'ok', 'ตำแหน่ง', 's = t³−6t²+9t + C₂'),
        S.tx(220, 196, 's(0) = 0 → C₂ = 0', 'bad', 'middle', 14) + S.tx(220, 222, 's(t) = t³ − 6t² + 9t', 'ok', 'middle', 18)
      ];
    },

    // พื้นที่ระหว่าง y = x กับ y = x² (440×250)
    areabtw: S => {
      const ox = 80, oy = 210, k = 140, X = x => ox + k * x, Y = y => oy - k * y;
      return [
        axes(S, ox, oy, 260, 180) + S.ln(X(0), Y(0), X(1.25), Y(1.25), 'pri', 3.5) + S.pa(path(50, t => [X(1.1 * t), Y((1.1 * t) * (1.1 * t))]), 'warn', 3.5) + S.tx(X(1.27), Y(1.27), 'y = x', 'pri', 'start', 14) + S.tx(X(1.12), Y(1.21) + 22, 'y = x²', 'warn', 'start', 14) + [1].map(u => S.tx(X(u), oy + 16, String(u), 'mute', 'middle', 11)).join(''),
        S.ci(X(0), Y(0), 6, 'ok') + S.ci(X(1), Y(1), 6, 'ok') + S.tx(300, 50, 'จุดตัด: x = x²', 'ink', 'start', 14) + S.tx(300, 72, 'x(x − 1) = 0 → x = 0 , 1', 'ok', 'start', 14),
        S.fl(path(40, t => [X(t), Y(t)]) + ' ' + path(40, t => [X(1 - t), Y((1 - t) * (1 - t))]).replace('M', 'L') + ' z', 'ok', .35) + S.tx(300, 102, 'ช่วง (0, 1): y = x อยู่บน', 'ok', 'start', 13),
        S.tx(300, 134, 'A = ∫₀¹ (x − x²) dx', 'ink', 'start', 15) + S.tx(300, 158, '= [x²/2 − x³/3]₀¹', 'ink', 'start', 14),
        S.tx(300, 188, '= 1/2 − 1/3 = 1/6', 'ok', 'start', 20)
      ];
    }
  });
})();
