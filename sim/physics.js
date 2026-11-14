// ซิมูเลเตอร์ฟิสิกส์: ปรับค่าแล้วดูวัตถุเคลื่อนที่/อุปกรณ์เปลี่ยนตามสมการจริง
(function () {
  const { f, txt, arrow, line, rect, circ } = SU;
  const reg = (name, cfg) => { SIMS[name] = { mount: host => SU.sim(host, cfg) }; };
  const G = 10;

  /* 1) จลนศาสตร์ */
  reg('kinematics', {
    label: 'จลนศาสตร์: รถเคลื่อนที่ด้วยความเร่งคงที่', h: 250, animate: true, duration: 6, loop: true,
    goal: 'ตั้ง a = 0 แล้วดูกราฟ v–t เป็นเส้นราบ จากนั้นลอง a ติดลบเพื่อดูการชะลอและกลับทิศ — พื้นที่ใต้กราฟคือระยะการกระจัด',
    controls: [{ id: 'u', label: 'ความเร็วต้น u', min: -10, max: 20, step: 1, v: 0, unit: 'm/s', reset: true }, { id: 'a', label: 'ความเร่ง a', min: -5, max: 5, step: 0.5, v: 2, unit: 'm/s²', dec: 1, reset: true }],
    draw(g, W, H, S, t, C) {
      const pos = x => S.u * x + .5 * S.a * x * x, vel = x => S.u + S.a * x;
      let mn = 0, mx = 0, vm = 5; for (let i = 0; i <= 60; i++) { const p = pos(i / 10); mn = Math.min(mn, p); mx = Math.max(mx, p); vm = Math.max(vm, Math.abs(vel(i / 10))); }
      const span = Math.max(10, mx - mn), x0 = 22, tw = W - 44, X = p => x0 + (p - mn) / span * tw, cx = X(pos(t)), v = vel(t);
      line(g, x0, 56, x0 + tw, 56, C.mute, 2); line(g, X(0), 50, X(0), 62, C.mute, 2); txt(g, '0', X(0), 76, C.mute, 11, 'center');
      rect(g, cx - 15, 36, 30, 16, C.pri); circ(g, cx - 8, 56, 4.5, C.ink); circ(g, cx + 8, 56, 4.5, C.ink);
      if (Math.abs(v) > .1) arrow(g, cx, 28, cx + Math.max(-70, Math.min(70, v * 4)), 28, C.ok, 2.5);
      txt(g, 'v', cx + (v >= 0 ? 4 : -4), 22, C.ok, 11, v >= 0 ? 'left' : 'right');
      // กราฟ v–t
      const gx = 40, gy = 100, gw = W - 60, gh = H - 125, zy = gy + gh / 2, TX = x => gx + x / 6 * gw, VY = y => zy - y / vm * (gh / 2);
      line(g, gx, gy, gx, gy + gh, C.mute, 1); line(g, gx, zy, gx + gw, zy, C.mute, 1);
      txt(g, 'v (m/s)', gx - 4, gy - 4, C.mute, 11, 'left'); txt(g, 't (s)', gx + gw, zy + 14, C.mute, 11, 'right');
      g.fillStyle = C.pri + '33'; g.beginPath(); g.moveTo(TX(0), zy); for (let i = 0; i <= 60 && i / 10 <= t + 1e-9; i++) g.lineTo(TX(i / 10), VY(vel(i / 10))); g.lineTo(TX(t), VY(vel(t))); g.lineTo(TX(t), zy); g.closePath(); g.fill();
      g.strokeStyle = C.pri; g.lineWidth = 2.5; g.beginPath(); g.moveTo(TX(0), VY(vel(0))); g.lineTo(TX(6), VY(vel(6))); g.stroke();
      circ(g, TX(t), VY(v), 5, C.warn, C.ink); txt(g, f(vm), gx - 4, gy + 8, C.mute, 10, 'right'); txt(g, f(-vm), gx - 4, gy + gh, C.mute, 10, 'right');
    },
    out: (S, t) => `<b>t = ${f(t)} s</b><br>v = u + at = ${f(S.u + S.a * t)} m/s<br>s = ut + ½at² = ${f(S.u * t + .5 * S.a * t * t)} m`,
  });

  /* 2) โพรเจกไทล์ */
  reg('projectile', {
    label: 'การเคลื่อนที่แบบโพรเจกไทล์', h: 250, animate: true, loop: true, duration: S => Math.max(1, 2 * S.v * Math.sin(S.th * Math.PI / 180) / S.g),
    goal: 'ตั้งความเร็วต้นคงที่ แล้วลองมุม 30° กับ 60° — พิสัยเท่ากัน! จากนั้นลองมุมใดจึงได้พิสัยไกลสุด',
    controls: [{ id: 'v', label: 'ความเร็วต้น v₀', min: 5, max: 30, step: 1, v: 20, unit: 'm/s', reset: true }, { id: 'th', label: 'มุมขว้าง θ', min: 10, max: 80, step: 1, v: 45, unit: '°', reset: true }, { id: 'g', label: 'ความเร่งโน้มถ่วง g', min: 4, max: 20, step: .5, v: 10, unit: 'm/s²', dec: 1, reset: true }],
    draw(g, W, H, S, t, C) {
      const a = S.th * Math.PI / 180, vx = S.v * Math.cos(a), vy = S.v * Math.sin(a), R = S.v * S.v * Math.sin(2 * a) / S.g, Hm = vy * vy / (2 * S.g), Tf = 2 * vy / S.g;
      const sc = Math.min((W - 50) / Math.max(R, 1), (H - 60) / Math.max(Hm, 1)), ox = 25, oy = H - 28, P = tt => [ox + vx * tt * sc, oy - (vy * tt - .5 * S.g * tt * tt) * sc];
      line(g, 10, oy, W - 10, oy, C.mute, 2);
      g.strokeStyle = C.mute; g.setLineDash([4, 4]); g.lineWidth = 1.5; g.beginPath(); for (let i = 0; i <= 60; i++) { const p = P(Tf * i / 60); i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); } g.stroke(); g.setLineDash([]);
      line(g, ox + R * sc, oy - 6, ox + R * sc, oy + 6, C.bad, 2); txt(g, 'R', ox + R * sc, oy + 20, C.bad, 12, 'center');
      line(g, ox + R * sc / 2, oy, ox + R * sc / 2, oy - Hm * sc, C.ok, 1.5, [3, 3]); txt(g, 'H', ox + R * sc / 2 + 6, oy - Hm * sc / 2, C.ok, 12);
      const tt = Math.min(t, Tf), p = P(tt); circ(g, p[0], p[1], 7, C.pri, C.ink);
      arrow(g, p[0], p[1], p[0] + vx * 2.2, p[1], C.ok, 2); const vyn = vy - S.g * tt; arrow(g, p[0], p[1], p[0], p[1] - vyn * 2.2, C.warn, 2);
      line(g, ox, oy, ox + 28 * Math.cos(a), oy - 28 * Math.sin(a), C.ink, 2); txt(g, S.th + '°', ox + 34, oy - 6, C.ink, 11);
    },
    out: S => { const a = S.th * Math.PI / 180; return `R = v₀² sin2θ / g = <b>${f(S.v * S.v * Math.sin(2 * a) / S.g)} m</b><br>H = v₀² sin²θ / 2g = <b>${f(Math.pow(S.v * Math.sin(a), 2) / (2 * S.g))} m</b><br>เวลาลอย = 2v₀ sinθ / g = <b>${f(2 * S.v * Math.sin(a) / S.g)} s</b>`; },
  });

  /* 3) แรง กฎของนิวตัน และเสียดทาน */
  reg('newton', {
    label: 'แรงลัพธ์ ความเสียดทาน และความเร่ง', h: 220, animate: true, duration: 5, loop: true,
    goal: 'เพิ่มแรง F ทีละน้อยจนกล่องเริ่มเคลื่อนที่ (F > μmg) แล้วลองเพิ่มมวล m ดูว่าความเร่งเปลี่ยนอย่างไร',
    controls: [{ id: 'F', label: 'แรงดึง F', min: 0, max: 100, step: 1, v: 40, unit: 'N', reset: true }, { id: 'm', label: 'มวล m', min: 1, max: 20, step: 1, v: 5, unit: 'kg', reset: true }, { id: 'mu', label: 'สัมประสิทธิ์เสียดทาน μ', min: 0, max: .8, step: .05, v: .2, reset: true, dec: 2 }],
    draw(g, W, H, S, t, C) {
      const fr = S.mu * S.m * G, net = Math.max(0, S.F - fr), a = net / S.m, s = .5 * a * t * t, v = a * t, gy = 150;
      line(g, 0, gy, W, gy, C.mute, 3); for (let x = -((s * 14) % 40); x < W; x += 40) line(g, x, gy, x - 6, gy + 12, C.line, 2);
      const bx = W / 2 - 30, bw = 60 + S.m, bh = 40 + S.m * .8; rect(g, bx, gy - bh, bw, bh, C.pri2, C.pri); txt(g, S.m + ' kg', bx + bw / 2, gy - bh / 2 + 4, C.ink, 12, 'center');
      const cy = gy - bh / 2; arrow(g, bx + bw, cy, bx + bw + 8 + S.F * .9, cy, C.ok, 3); txt(g, 'F=' + S.F, bx + bw + 8 + S.F * .9, cy - 8, C.ok, 11, 'right');
      if (fr > .5) { arrow(g, bx, cy + 12, bx - Math.min(fr * .9, bx - 6), cy + 12, C.bad, 3); txt(g, 'f=' + f(fr), bx - 6, cy + 28, C.bad, 11, 'right'); }
      arrow(g, bx + bw / 2, gy - bh, bx + bw / 2, gy - bh - 28, C.warn, 2); txt(g, 'N', bx + bw / 2 + 6, gy - bh - 18, C.warn, 11);
      arrow(g, bx + bw / 2, gy, bx + bw / 2, gy + 26, C.mute, 2); txt(g, 'W', bx + bw / 2 + 6, gy + 24, C.mute, 11);
      txt(g, net > 0 ? 'เคลื่อนที่' : 'ยังนิ่ง (F ≤ f)', 10, 20, net > 0 ? C.ok : C.bad, 13); if (net > 0) arrow(g, W - 80, 20, W - 80 + Math.min(70, v * 3), 20, C.ok, 2);
    },
    out: (S, t) => { const fr = S.mu * S.m * G, net = Math.max(0, S.F - fr); return `f = μmg = ${f(fr)} N · ΣF = F − f = <b>${f(net)} N</b><br>a = ΣF / m = <b>${f(net / S.m, 2)} m/s²</b> · v ตอนนี้ = ${f(net / S.m * t)} m/s`; },
  });

  /* 4) คาน/โมเมนต์ */
  reg('lever', {
    label: 'คานและโมเมนต์ของแรง', h: 230,
    goal: 'ปรับมวลและระยะให้คานสมดุลในแนวระดับ — ผลคูณ m × d ของสองข้างต้องเท่ากัน',
    controls: [{ id: 'm1', label: 'มวลซ้าย m₁', min: 1, max: 10, step: 1, v: 4, unit: 'kg' }, { id: 'd1', label: 'ระยะซ้าย d₁', min: .5, max: 3, step: .1, v: 2, unit: 'm', dec: 1 }, { id: 'm2', label: 'มวลขวา m₂', min: 1, max: 10, step: 1, v: 8, unit: 'kg' }, { id: 'd2', label: 'ระยะขวา d₂', min: .5, max: 3, step: .1, v: 1, unit: 'm', dec: 1 }],
    draw(g, W, H, S, t, C) {
      const M1 = S.m1 * G * S.d1, M2 = S.m2 * G * S.d2, ang = Math.max(-.35, Math.min(.35, (M2 - M1) / 150)), px = W / 2, py = 110, sc = (W - 70) / 6;
      g.fillStyle = C.mute; g.beginPath(); g.moveTo(px, py + 4); g.lineTo(px - 16, py + 60); g.lineTo(px + 16, py + 60); g.closePath(); g.fill();
      g.save(); g.translate(px, py); g.rotate(ang);
      rect(g, -3 * sc, -5, 6 * sc, 10, C.pri2, C.pri);
      for (let i = -3; i <= 3; i++) line(g, i * sc, -5, i * sc, 0, C.mute, 1);
      const hang = (x, m, col) => { const s = 14 + m * 2.2; line(g, x, 5, x, 28, C.ink, 1.5); rect(g, x - s / 2, 28, s, s, col, C.ink); txt(g, m + ' kg', x, 28 + s / 2 + 4, '#fff', 11, 'center'); };
      hang(-S.d1 * sc, S.m1, C.pri); hang(S.d2 * sc, S.m2, C.warn); g.restore(); circ(g, px, py, 5, C.ink);
      txt(g, 'M₁ = ' + f(M1, 0), 12, 22, C.pri, 12); txt(g, 'M₂ = ' + f(M2, 0), W - 12, 22, C.warn, 12, 'right');
    },
    out: S => { const M1 = S.m1 * G * S.d1, M2 = S.m2 * G * S.d2, d = Math.abs(M1 - M2) < .5; return `M₁ = m₁gd₁ = ${f(M1, 0)} N·m · M₂ = m₂gd₂ = ${f(M2, 0)} N·m<br><b>${d ? '✅ สมดุล (ΣM = 0)' : M2 > M1 ? 'ด้านขวาหนักกว่า → คานเอียงลงขวา' : 'ด้านซ้ายหนักกว่า → คานเอียงลงซ้าย'}</b>`; },
  });

  /* 5) เฟือง */
  reg('gears', {
    label: 'เฟืองต่อกัน: อัตราทดและทิศทาง', h: 220, animate: true,
    goal: 'เพิ่มจำนวนฟันของเฟือง B แล้วดูว่า B หมุนช้าลง — ลองเปลี่ยน C ดูว่าเฟืองกลาง B มีผลต่อความเร็วของ C หรือไม่',
    controls: [{ id: 'nA', label: 'ฟัน A', min: 8, max: 40, step: 1, v: 12, unit: 'ฟัน' }, { id: 'nB', label: 'ฟัน B (เฟืองกลาง)', min: 8, max: 40, step: 1, v: 24, unit: 'ฟัน' }, { id: 'nC', label: 'ฟัน C', min: 8, max: 40, step: 1, v: 16, unit: 'ฟัน' }, { id: 'rpm', label: 'รอบของ A', min: 10, max: 120, step: 5, v: 40, unit: 'rpm' }],
    draw(g, W, H, S, t, C) {
      const k = Math.min(3.4, (W - 30) / (2 * (S.nA + S.nB + S.nC))), rA = S.nA * k, rB = S.nB * k, rC = S.nC * k, cy = H / 2, xA = 15 + rA, xB = xA + rA + rB, xC = xB + rB + rC;
      const wA = S.rpm / 60 * 2 * Math.PI, thA = wA * t, thB = -thA * S.nA / S.nB, thC = -thB * S.nB / S.nC;
      const gear = (x, r, n, th, col, lab) => {
        g.fillStyle = col; g.strokeStyle = C.ink; g.lineWidth = 1.5; g.beginPath();
        for (let i = 0; i < n * 2; i++) { const a0 = th + i * Math.PI / n, rr = i % 2 ? r - 4 : r + 3; g.lineTo(x + rr * Math.cos(a0), cy + rr * Math.sin(a0)); g.lineTo(x + rr * Math.cos(a0 + Math.PI / n * .9), cy + rr * Math.sin(a0 + Math.PI / n * .9)); }
        g.closePath(); g.fill(); g.stroke(); line(g, x, cy, x + (r - 6) * Math.cos(th), cy + (r - 6) * Math.sin(th), C.bad, 3); circ(g, x, cy, 3, C.ink); txt(g, lab, x, cy + r + 18 > H - 4 ? cy - r - 8 : cy + r + 18, C.ink, 12, 'center');
      };
      gear(xA, rA, S.nA, thA, C.pri2, 'A'); gear(xB, rB, S.nB, thB, C.pri2, 'B'); gear(xC, rC, S.nC, thC, C.pri2, 'C');
    },
    out: S => { const rB = S.rpm * S.nA / S.nB, rC = S.rpm * S.nA / S.nC; return `A: ${S.rpm} rpm ↻ (ตามเข็ม)<br>B: n = ${S.rpm}×${S.nA}/${S.nB} = <b>${f(rB)} rpm ↺</b> (ทวนเข็ม)<br>C: n = ${S.rpm}×${S.nA}/${S.nC} = <b>${f(rC)} rpm ↻</b> — เฟืองกลาง B เปลี่ยนทิศ แต่ไม่เปลี่ยนอัตราทดรวม`; },
  });

  /* 6) รอก */
  reg('pulley', {
    label: 'ระบบรอก: ผ่อนแรงแต่ต้องดึงเชือกไกลขึ้น', h: 270, animate: true, duration: 6, loop: true,
    goal: 'เพิ่มจำนวนเส้นเชือกที่รับน้ำหนัก แล้วดูว่าแรงที่ใช้ลดลง แต่ระยะที่ต้องดึงเชือกยาวขึ้นเท่าไร',
    controls: [{ id: 'n', label: 'จำนวนเส้นเชือกรับน้ำหนัก n', min: 1, max: 6, step: 1, v: 3, reset: true }, { id: 'W', label: 'น้ำหนักวัตถุ W', min: 60, max: 600, step: 30, v: 300, unit: 'N', reset: true }],
    draw(g, W, H, S, t, C) {
      const pull = .6 * t, rise = pull / S.n, top = 24, y0 = 190, sc = 40, by = y0 - rise * sc, cx = W / 2 - 40, sp = 22, x0 = cx - (S.n - 1) * sp / 2;
      rect(g, cx - 90, top - 12, 180 + 70, 12, C.mute);
      for (let i = 0; i < S.n; i++) { const x = x0 + i * sp; line(g, x, top, x, by, C.bad, 2.5); }
      rect(g, x0 - 12, by, (S.n - 1) * sp + 24, 14, C.pri2, C.pri); const mx = (x0 + x0 + (S.n - 1) * sp) / 2;
      line(g, mx, by + 14, mx, by + 30, C.ink, 2); rect(g, mx - 24, by + 30, 48, 30, C.warn, C.ink); txt(g, S.W + ' N', mx, by + 50, '#000', 12, 'center');
      const px = x0 + (S.n - 1) * sp + 40; line(g, x0 + (S.n - 1) * sp, top, px, top + 8, C.bad, 2.5); const hy = top + 8 + 34 + pull * sc; line(g, px, top + 8, px, hy, C.bad, 2.5);
      arrow(g, px, hy, px, hy + 34, C.ok, 3); txt(g, 'F = ' + f(S.W / S.n, 0) + ' N', px - 8, hy + 40, C.ok, 12, 'right');
      line(g, 12, y0 + 40, 12, y0 - 140, C.line, 1); txt(g, 'สูงขึ้น ' + f(rise, 2) + ' m', 20, y0 + 56, C.ink, 12); txt(g, 'ดึงเชือก ' + f(pull, 2) + ' m', W - 12, H - 10, C.ok, 12, 'right');
    },
    out: (S, t) => { const pull = .6 * t, rise = pull / S.n; return `F = W / n = ${S.W}/${S.n} = <b>${f(S.W / S.n)} N</b> · ดึงเชือก ${f(pull, 2)} m → วัตถุสูงขึ้น ${f(rise, 2)} m<br>งานที่ออกแรง F × ระยะดึง = ${f(S.W / S.n * pull)} J = W × h = ${f(S.W * rise)} J (งานเท่าเดิม)`; },
  });

  /* 7) วงจรไฟฟ้า */
  reg('circuit', {
    label: 'วงจรไฟฟ้าอนุกรมและขนาน', h: 230, animate: true,
    goal: 'สลับระหว่างอนุกรมกับขนาน แล้วสังเกตว่าหลอดใดสว่างกว่า และกระแสรวมเปลี่ยนอย่างไร',
    controls: [{ id: 'mode', label: 'การต่อ', min: 0, max: 1, step: 1, v: 0, opts: ['อนุกรม', 'ขนาน'] }, { id: 'V', label: 'แรงดันแบตเตอรี่ V', min: 3, max: 24, step: 1.5, v: 12, unit: 'V', dec: 1 }, { id: 'R1', label: 'R₁', min: 2, max: 40, step: 1, v: 10, unit: 'Ω' }, { id: 'R2', label: 'R₂', min: 2, max: 40, step: 1, v: 20, unit: 'Ω' }],
    draw(g, W, H, S, t, C) {
      const par = S.mode === 1, I1 = par ? S.V / S.R1 : S.V / (S.R1 + S.R2), I2 = par ? S.V / S.R2 : I1, P1 = I1 * I1 * S.R1, P2 = I2 * I2 * S.R2, L = 30, Rr = W - 30, T = 52, B = H - 48, glow = p => Math.min(1, p / 30);
      const wire = (pts) => { g.strokeStyle = C.mute; g.lineWidth = 2.5; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); };
      const res = (x, y, lab, p, vert) => { g.save(); g.translate(x, y); if (vert) g.rotate(Math.PI / 2); rect(g, -24, -11, 48, 22, C.card, C.ink); g.restore(); circ(g, x, y - (vert ? 0 : 26), 9, `rgba(255,190,0,${.15 + .85 * glow(p)})`, C.warn, 2); txt(g, lab, x, y + (vert ? 4 : 4), C.ink, 11, 'center'); };
      const dots = (pts, I) => { let len = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); len += d; } const sp = Math.min(160, I * 40), n = Math.max(4, Math.round(len / 28)); for (let k = 0; k < n; k++) { let d = ((k / n) * len + t * sp) % len, i = 0; while (d > seg[i]) { d -= seg[i]; i++; } const r = d / seg[i]; circ(g, pts[i][0] + (pts[i + 1][0] - pts[i][0]) * r, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * r, 3, C.pri); } };
      if (!par) {
        const loop = [[L, T], [Rr, T], [Rr, B], [L, B], [L, T]]; wire(loop); res((L + Rr) / 3 + 10, T, 'R₁ ' + S.R1, P1); res((L + Rr) * 2 / 3 - 10, T, 'R₂ ' + S.R2, P2); dots(loop, I1);
      } else {
        const a = W * .38, b = W * .62, c = W * .86; wire([[L, T], [c, T]]); wire([[L, B], [c, B]]); wire([[L, T], [L, B]]);
        wire([[b, T], [b, B]]); wire([[c, T], [c, B]]); res(b, (T + B) / 2, S.R1, P1, true); res(c, (T + B) / 2, S.R2, P2, true);
        dots([[L, T], [b, T], [b, B], [L, B], [L, T]], I1); dots([[L, T], [c, T], [c, B], [L, B], [L, T]], I2);
      }
      rect(g, L - 6, (T + B) / 2 - 16, 12, 32, C.card, C.ink); txt(g, '+', L + 12, (T + B) / 2 - 2, C.bad, 14); txt(g, S.V + 'V', L - 10, (T + B) / 2 + 40, C.ink, 11, 'center');
    },
    out: S => { const par = S.mode === 1, Rt = par ? S.R1 * S.R2 / (S.R1 + S.R2) : S.R1 + S.R2, It = S.V / Rt; return par ? `ขนาน: R = R₁R₂/(R₁+R₂) = <b>${f(Rt)} Ω</b> · I รวม = V/R = <b>${f(It, 2)} A</b><br>I₁ = V/R₁ = ${f(S.V / S.R1, 2)} A · I₂ = V/R₂ = ${f(S.V / S.R2, 2)} A · P₁ = ${f(S.V * S.V / S.R1)} W · P₂ = ${f(S.V * S.V / S.R2)} W (แรงดันเท่ากัน R น้อยสว่างกว่า)` : `อนุกรม: R = R₁ + R₂ = <b>${f(Rt)} Ω</b> · I = V/R = <b>${f(It, 2)} A</b> (เท่ากันทุกจุด)<br>V₁ = IR₁ = ${f(It * S.R1)} V · V₂ = IR₂ = ${f(It * S.R2)} V · P₁ = ${f(It * It * S.R1)} W · P₂ = ${f(It * It * S.R2)} W (กระแสเท่ากัน R มากสว่างกว่า)`; },
  });

  /* 8) ความดันในของเหลว */
  reg('pressure', {
    label: 'ความดันในของเหลว P = ρgh', h: 240,
    goal: 'เลื่อนความลึกให้ลึกขึ้นสองเท่า ความดันเพิ่มเท่าไร? แล้วลองเปลี่ยนเป็นของเหลวที่หนาแน่นกว่าน้ำ',
    controls: [{ id: 'h', label: 'ความลึก h', min: 0, max: 20, step: 1, v: 10, unit: 'm' }, { id: 'rho', label: 'ความหนาแน่น ρ', min: 700, max: 1500, step: 50, v: 1000, unit: 'kg/m³' }],
    draw(g, W, H, S, t, C) {
      const x0 = 30, x1 = W - 120, top = 30, bot = H - 20, y = top + (S.h / 20) * (bot - top);
      const gr = g.createLinearGradient(0, top, 0, bot); gr.addColorStop(0, 'rgba(80,140,255,.15)'); gr.addColorStop(1, 'rgba(30,60,200,.65)'); g.fillStyle = gr; g.fillRect(x0, top, x1 - x0, bot - top);
      g.strokeStyle = C.ink; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, top - 10); g.lineTo(x0, bot); g.lineTo(x1, bot); g.lineTo(x1, top - 10); g.stroke(); line(g, x0, top, x1, top, C.pri, 2);
      for (let d = 0; d <= 20; d += 5) { const yy = top + d / 20 * (bot - top); line(g, x0 - 6, yy, x0, yy, C.ink, 1.5); txt(g, d + ' m', x0 - 8, yy + 4, C.mute, 10, 'right'); }
      const P = S.rho * G * S.h, cx = (x0 + x1) / 2; circ(g, cx, y, 7, C.warn, C.ink);
      [[-1, 0], [1, 0], [0, 1], [-.7, .7], [.7, .7]].forEach(d => arrow(g, cx + d[0] * 9, y + d[1] * 9, cx + d[0] * (9 + 10 + P / 8000), y + d[1] * (9 + 10 + P / 8000), C.bad, 2));
      line(g, cx, top, cx, y, C.ink, 1, [3, 3]); txt(g, 'h = ' + S.h + ' m', cx + 12, (top + y) / 2, C.ink, 12);
      rect(g, x1 + 14, top, 90, 60, C.card, C.ink); txt(g, 'ความดันเกจ', x1 + 59, top + 18, C.mute, 11, 'center'); txt(g, f(P / 1000, 0) + ' kPa', x1 + 59, top + 42, C.ink, 16, 'center');
    },
    out: S => `P<sub>เกจ</sub> = ρgh = ${S.rho}×10×${S.h} = <b>${(S.rho * G * S.h).toLocaleString()} Pa</b><br>ความดันสัมบูรณ์ = P₀ + ρgh = 1.01×10⁵ + ${(S.rho * G * S.h).toLocaleString()} ≈ ${(101000 + S.rho * G * S.h).toLocaleString()} Pa`,
  });

  /* 9) แรงลอยตัว */
  reg('buoyancy', {
    label: 'แรงลอยตัว: ลอยหรือจม', h: 230, animate: true,
    goal: 'ตั้งความหนาแน่นวัตถุให้น้อยกว่าของเหลว แล้วดูสัดส่วนที่จมน้ำ — ถ้ามากกว่าจะจมทั้งก้อน',
    controls: [{ id: 'ro', label: 'ความหนาแน่นวัตถุ ρ₀', min: 200, max: 2500, step: 50, v: 600, unit: 'kg/m³' }, { id: 'rf', label: 'ความหนาแน่นของเหลว ρ<sub>f</sub>', min: 800, max: 1400, step: 50, v: 1000, unit: 'kg/m³' }],
    draw(g, W, H, S, t, C) {
      const wl = 90, bot = H - 14, x0 = 40, x1 = W - 120, frac = Math.min(1, S.ro / S.rf), sink = S.ro > S.rf, s = 64, bob = Math.sin(t * 2.2) * 2 * (sink ? 0 : 1);
      g.fillStyle = 'rgba(60,120,255,.35)'; g.fillRect(x0, wl, x1 - x0, bot - wl); g.strokeStyle = C.ink; g.lineWidth = 2; g.strokeRect(x0, 40, x1 - x0, bot - 40);
      const cx = (x0 + x1) / 2 - s / 2, by = sink ? bot - s : wl - s * (1 - frac) + bob; rect(g, cx, by, s, s, sink ? C.bad + 'cc' : C.warn + 'dd', C.ink); txt(g, f(S.ro, 0), cx + s / 2, by + s / 2 + 4, '#000', 11, 'center');
      line(g, x0, wl, x1, wl, C.pri, 2); const W_ = S.ro / 20, B = (sink ? 1 : frac) * S.rf / 20;
      arrow(g, cx + s / 2, by + s / 2, cx + s / 2, by + s / 2 + W_, C.bad, 3); txt(g, 'W', cx + s / 2 + 8, by + s / 2 + W_, C.bad, 11);
      arrow(g, cx + s / 2 + 18, by + s / 2, cx + s / 2 + 18, by + s / 2 - Math.min(B, 80), C.ok, 3); txt(g, 'B', cx + s / 2 + 26, by + s / 2 - Math.min(B, 80), C.ok, 11);
      txt(g, sink ? 'จม' : frac > .999 ? 'ลอยปริ่ม' : 'ลอย', x1 + 16, 70, sink ? C.bad : C.ok, 18); txt(g, sink ? '' : 'จม ' + f(frac * 100, 0) + '%', x1 + 16, 94, C.ink, 13);
    },
    out: S => S.ro > S.rf ? `ρ₀ (${S.ro}) > ρ<sub>f</sub> (${S.rf}) → แรงลอยตัวสูงสุด ${f(S.rf / S.ro * 100, 0)}% ของน้ำหนัก ไม่พอพยุง → <b>จม</b>` : `ลอยนิ่ง: B = W → ρ<sub>f</sub>V<sub>จม</sub>g = ρ₀Vg<br>สัดส่วนปริมาตรที่จม = ρ₀/ρ<sub>f</sub> = ${S.ro}/${S.rf} = <b>${f(S.ro / S.rf * 100, 0)}%</b>`,
  });

  /* 10) คลื่น */
  reg('wave', {
    label: 'คลื่น: ความถี่ ความยาวคลื่น และอัตราเร็ว', h: 220, animate: true,
    goal: 'เพิ่มความถี่แล้วดูยอดคลื่นเคลื่อนที่เร็วขึ้น — ถ้าเพิ่ม λ ด้วย อัตราเร็ว v = fλ จะเปลี่ยนเท่าใด',
    controls: [{ id: 'fr', label: 'ความถี่ f', min: .5, max: 4, step: .5, v: 1, unit: 'Hz', dec: 1 }, { id: 'lam', label: 'ความยาวคลื่น λ', min: .5, max: 4, step: .25, v: 2, unit: 'm', dec: 2 }, { id: 'A', label: 'แอมพลิจูด A', min: .2, max: 1, step: .1, v: .6, unit: 'm', dec: 1 }],
    draw(g, W, H, S, t, C) {
      const mid = 105, sx = (W - 40) / 8, sy = 70; line(g, 20, mid, W - 20, mid, C.line, 1.5);
      g.strokeStyle = C.pri; g.lineWidth = 3; g.beginPath(); for (let px = 0; px <= W - 40; px += 2) { const x = px / sx, y = S.A * Math.sin(2 * Math.PI * (x / S.lam - S.fr * t)); px ? g.lineTo(20 + px, mid - y * sy) : g.moveTo(20 + px, mid - y * sy); } g.stroke();
      const yd = S.A * Math.sin(2 * Math.PI * (-S.fr * t)); circ(g, 20, mid - yd * sy, 6, C.warn, C.ink);
      // λ
      let xc = ((.25 + S.fr * t) % 1) * S.lam; line(g, 20 + xc * sx, mid + 70, 20 + (xc + S.lam) * sx, mid + 70, C.bad, 2); arrow(g, 20 + xc * sx, mid + 70, 20 + (xc + S.lam) * sx, mid + 70, C.bad, 1);
      txt(g, 'λ', 20 + (xc + S.lam / 2) * sx, mid + 88, C.bad, 14, 'center'); line(g, W - 24, mid, W - 24, mid - S.A * sy, C.ok, 2); txt(g, 'A', W - 30, mid - S.A * sy / 2, C.ok, 12, 'right');
    },
    out: S => `v = fλ = ${S.fr} × ${S.lam} = <b>${f(S.fr * S.lam, 2)} m/s</b> · T = 1/f = ${f(1 / S.fr, 2)} s<br>ในหนึ่งคาบ คลื่นเคลื่อนที่ไป 1 ความยาวคลื่น (จุดสีเหลืองสั่นขึ้นลงที่เดิม)`,
  });

  /* 11) พลังงานกล: ลูกตุ้ม */
  const pend = { th: 0, om: 0, tl: 0, k: '' };
  reg('energy', {
    label: 'พลังงานกลของลูกตุ้ม', h: 250, animate: true,
    goal: 'ดูแท่งพลังงานศักย์ (Ep) กับพลังงานจลน์ (Ek) สลับกัน แต่ผลรวมคงที่ — ที่จุดต่ำสุด Ek สูงสุด',
    controls: [{ id: 'L', label: 'ความยาวเชือก L', min: .5, max: 2, step: .1, v: 1, unit: 'm', dec: 1, reset: true }, { id: 'th0', label: 'มุมปล่อย θ₀', min: 10, max: 80, step: 5, v: 50, unit: '°', reset: true }],
    draw(g, W, H, S, t, C) {
      const key = S.L + '/' + S.th0; if (pend.k !== key || t < pend.tl) { pend.k = key; pend.th = S.th0 * Math.PI / 180; pend.om = 0; pend.tl = 0; }
      for (let tt = pend.tl; tt < t; tt += .002) { const al = -G / S.L * Math.sin(pend.th); pend.om += al * .002; pend.th += pend.om * .002; } pend.tl = t;
      const px = W * .36, py = 24, sc = 85 / 2, bx = px + S.L * sc * Math.sin(pend.th), by = py + S.L * sc * Math.cos(pend.th);
      line(g, px - 40, py, px + 40, py, C.ink, 3); line(g, px, py, bx, by, C.mute, 2); circ(g, bx, by, 12, C.pri, C.ink);
      const h = S.L * (1 - Math.cos(pend.th)), h0 = S.L * (1 - Math.cos(S.th0 * Math.PI / 180)), v2 = Math.max(0, 2 * G * (h0 - h)), Ep = G * h, Ek = .5 * v2, Et = G * h0, bxx = W * .68, bw = 34, base = H - 30, scl = 150 / Math.max(Et, .1);
      line(g, bxx - 10, base, bxx + 160, base, C.mute, 1.5);
      [['Ep', Ep, C.warn], ['Ek', Ek, C.ok], ['รวม', Ep + Ek, C.pri]].forEach(([l, v, col], i) => { const x = bxx + i * 50; rect(g, x, base - v * scl, bw, v * scl, col); txt(g, l, x + bw / 2, base + 14, C.ink, 11, 'center'); });
      line(g, bxx - 10, base - Et * scl, bxx + 160, base - Et * scl, C.pri, 1, [4, 3]); txt(g, f(h, 2) + ' m', bx + 16, by, C.mute, 10);
      S._v = Math.sqrt(v2); S._h = h; S._Et = Et;
    },
    out: S => `ความสูงเหนือจุดต่ำสุด h = L(1 − cosθ) = ${f(S._h || 0, 2)} m · v = ${f(S._v || 0, 2)} m/s<br>พลังงานรวม (ต่อมวล 1 kg) = gh₀ = <b>${f(S._Et || 0, 2)} J</b> คงที่ · v สูงสุด = √(2gh₀) = ${f(Math.sqrt(2 * (S._Et || 0)), 2)} m/s`,
  });

  /* 12) ความร้อนและการเปลี่ยนสถานะ */
  reg('heat', {
    label: 'การให้ความร้อนแก่น้ำแข็งจนเป็นไอ', h: 250, animate: true, duration: 12, loop: false,
    goal: 'สังเกตกราฟที่ราบสองช่วง (ละลาย และเดือด) — อุณหภูมิไม่เพิ่ม แต่พลังงานยังถูกใช้ ลองเพิ่มมวลดูว่าช่วงราบยาวขึ้นอย่างไร',
    controls: [{ id: 'm', label: 'มวล m', min: .1, max: 1, step: .1, v: .2, unit: 'kg', dec: 1, reset: true }, { id: 'P', label: 'กำลังฮีตเตอร์ P', min: 200, max: 3000, step: 100, v: 1000, unit: 'W', reset: true }],
    draw(g, W, H, S, t, C) {
      const q = [S.m * 2100 * 20, S.m * 334000, S.m * 4200 * 100, S.m * 2256000, S.m * 2000 * 20], tt = q.map(x => x / S.P), Tt = tt.reduce((a, b) => a + b, 0), clock = t / 12 * Tt;
      const gx = 44, gy = 20, gw = W - 64, gh = H - 56, X = s => gx + s / Tt * gw, Y = T => gy + gh - (T + 20) / 140 * gh;
      line(g, gx, gy, gx, gy + gh, C.mute, 1); line(g, gx, gy + gh, gx + gw, gy + gh, C.mute, 1); txt(g, 'T (°C)', gx - 4, gy - 6, C.mute, 11, 'left'); txt(g, 'เวลา', gx + gw, gy + gh + 28, C.mute, 11, 'right');
      [-20, 0, 100, 120].forEach(T => { line(g, gx - 4, Y(T), gx, Y(T), C.mute, 1); txt(g, T + '', gx - 8, Y(T) + 4, C.mute, 10, 'right'); line(g, gx, Y(T), gx + gw, Y(T), C.line, 1, [3, 4]); });
      const pts = [[0, -20]]; let cum = 0, T = -20; const temps = [[-20, 0], [0, 0], [0, 100], [100, 100], [100, 120]]; temps.forEach((p, i) => { cum += tt[i]; pts.push([cum, p[1]]); });
      g.strokeStyle = C.pri; g.lineWidth = 3; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(X(p[0]), Y(p[1])) : g.moveTo(X(p[0]), Y(p[1]))); g.stroke();
      let cT = 120, label = 'ไอน้ำ', c2 = 0; for (let i = 0; i < 5; i++) { if (clock <= c2 + tt[i]) { const r = (clock - c2) / tt[i]; cT = temps[i][0] + (temps[i][1] - temps[i][0]) * r; label = ['น้ำแข็งร้อนขึ้น', 'ละลาย (0 °C)', 'น้ำร้อนขึ้น', 'เดือด (100 °C)', 'ไอน้ำร้อนขึ้น'][i]; break; } c2 += tt[i]; }
      circ(g, X(Math.min(clock, Tt)), Y(cT), 6, C.warn, C.ink); txt(g, label + ' ' + f(cT, 0) + ' °C', X(Math.min(clock, Tt)) + (X(clock) > W * .6 ? -10 : 10), Y(cT) - 10, C.ink, 12, X(clock) > W * .6 ? 'right' : 'left');
      S._q = q; S._Q = Math.min(clock, Tt) * S.P;
    },
    out: S => { const q = S._q || [0, 0, 0, 0, 0]; return `Q = mcΔT (ช่วงที่อุณหภูมิเปลี่ยน) · Q = mL (ช่วงราบ)<br>ละลาย: Q = ${S.m}×334,000 = <b>${Math.round(q[1]).toLocaleString()} J</b> · เดือด: Q = ${S.m}×2,256,000 = <b>${Math.round(q[3]).toLocaleString()} J</b><br>พลังงานที่ให้ไปแล้ว ≈ ${Math.round(S._Q || 0).toLocaleString()} J`; },
  });
})();
