// ตัวสร้างภาพ SVG + คำนวณเฉลยด้วยโค้ด (ไม่วาดมือ) สำหรับโจทย์มิติสัมพันธ์/เชิงกล
// ทุกฟังก์ชันรับ seed แบบกำหนดตายตัว เพื่อให้โจทย์เดิมออกมาเหมือนเดิมทุกครั้ง
const FIG = (function () {
  const C = { t: '#e3e8ff', l: '#aab7ff', r: '#7e8ff0', ink: '#2b3170', hi: '#ffb020', fill1: '#c8cdf5', fill2: '#4f46e5' };
  const fx = n => Math.round(n * 10) / 10;
  const hash = s => { let h = 2166136261; for (const c of String(s)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
  function rnd(seed) { let a = hash(seed); return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const pick = (r, a) => a[Math.floor(r() * a.length)];
  const shuffle = (r, a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; };
  const svg = (vb, inner, label, cls) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" class="${cls || 'fig'}" role="img" aria-label="${label}">${inner}</svg>`;
  const key = o => JSON.stringify(o);

  /* ---------- กองบล็อก (isometric) ---------- */
  function iso(cubes, o) {
    o = o || {}; const s = o.s || 20, v = s * 0.85, P = (x, y, z) => [(x - y) * s, (x + y) * s / 2 - z * v];
    const xs = [], ys = []; let out = '';
    const poly = (pts, fill) => { pts.forEach(p => { xs.push(p[0]); ys.push(p[1]); }); return `<polygon points="${pts.map(p => fx(p[0]) + ',' + fx(p[1])).join(' ')}" fill="${fill}" stroke="${C.ink}" stroke-width="1" stroke-linejoin="round"/>`; };
    cubes.slice().sort((a, b) => (a[0] + a[1] + a[2]) - (b[0] + b[1] + b[2])).forEach(([x, y, z]) => {
      out += poly([P(x, y, z + 1), P(x + 1, y, z + 1), P(x + 1, y + 1, z + 1), P(x, y + 1, z + 1)], C.t);
      out += poly([P(x, y + 1, z), P(x + 1, y + 1, z), P(x + 1, y + 1, z + 1), P(x, y + 1, z + 1)], C.l);
      out += poly([P(x + 1, y, z), P(x + 1, y + 1, z), P(x + 1, y + 1, z + 1), P(x + 1, y, z + 1)], C.r);
    });
    const x0 = Math.min(...xs) - 6, x1 = Math.max(...xs) + 6, y0 = Math.min(...ys) - 6, y1 = Math.max(...ys) + (o.labels ? 26 : 6);
    if (o.labels) out += `<text x="${fx(x0 + 8)}" y="${fx(y1 - 6)}" font-size="14" font-weight="700" fill="currentColor">ก ↗</text><text x="${fx(x1 - 8)}" y="${fx(y1 - 6)}" text-anchor="end" font-size="14" font-weight="700" fill="currentColor">↖ ข</text>`;
    return svg(`${fx(x0)} ${fx(y0)} ${fx(x1 - x0)} ${fx(y1 - y0)}`, out, o.label || 'ภาพกองบล็อกแบบไอโซเมตริก', o.cls);
  }
  const heightsToCubes = H => { const c = []; H.forEach((row, y) => row.forEach((h, x) => { for (let z = 0; z < h; z++) c.push([x, y, z]); })); return c; };
  const frontView = H => { const w = H[0].length, r = []; for (let x = 0; x < w; x++) r.push(Math.max(...H.map(row => row[x]))); return r; };   // มองจาก ก (ด้าน +y) ซ้าย→ขวา = x เพิ่ม
  const rightView = H => H.map(row => Math.max(...row)).reverse();                                                                          // มองจาก ข (ด้าน +x) ซ้าย→ขวา = y ลด
  function elev(h, o) {
    o = o || {}; const u = 14, mh = o.maxH || Math.max(3, ...h), W = h.length; let out = '';
    h.forEach((n, i) => { for (let j = 0; j < n; j++) out += `<rect x="${4 + i * u}" y="${4 + (mh - 1 - j) * u}" width="${u}" height="${u}" fill="${C.l}" stroke="${C.ink}"/>`; });
    out += `<line x1="2" x2="${W * u + 6}" y1="${4 + mh * u}" y2="${4 + mh * u}" stroke="currentColor" stroke-width="1.5"/>`;
    return svg(`0 0 ${W * u + 8} ${mh * u + 8}`, out, o.label || 'ภาพด้านหน้า (แสดงจำนวนชั้นของแต่ละคอลัมน์)', o.cls || 'ofig');
  }
  function top(H, o) {
    o = o || {}; const u = 18, h = H.length, w = H[0].length; let out = '';
    H.forEach((row, y) => row.forEach((n, x) => { if (n > 0) { out += `<rect x="${4 + x * u}" y="${4 + y * u}" width="${u}" height="${u}" fill="${C.t}" stroke="${C.ink}"/>`; if (o.nums) out += `<text x="${4 + x * u + u / 2}" y="${4 + y * u + u / 2 + 5}" text-anchor="middle" font-size="13" font-weight="700" fill="${C.ink}">${n}</text>`; } }));
    out += `<text x="${4 + w * u / 2}" y="${h * u + 18}" text-anchor="middle" font-size="10" fill="currentColor">↓ ด้านหน้า (ก)</text>`;
    return svg(`0 0 ${w * u + 8} ${h * u + 24}`, out, o.label || 'แผนผังมองจากด้านบน', o.cls || 'ofig');
  }
  function randomStack(r, n, maxH, minCells) {
    for (; ;) {
      const H = []; for (let y = 0; y < n; y++) { H.push([]); for (let x = 0; x < n; x++) H[y].push(r() < 0.3 ? 0 : 1 + Math.floor(r() * maxH)); }
      const cells = H.flat().filter(v => v > 0).length;
      if (cells >= minCells && Math.max(...H.flat()) >= maxH && key(frontView(H)) !== key(rightView(H)) && frontView(H).every(v => v > 0) && rightView(H).every(v => v > 0)) return H;
    }
  }
  // จำนวนบล็อกน้อยสุด/มากสุดที่สอดคล้องกับภาพบน + ภาพหน้า + ภาพข้าง — คำนวณโดยค้นหาทุกกรณี
  function blockRange(cells, F, S) {
    const n = cells.length, idx = []; for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (cells[y][x]) idx.push([x, y]);
    let mn = Infinity, mx = -Infinity; const cur = [];
    const rec = i => {
      if (i === idx.length) {
        const f = Array(n).fill(0), s = Array(n).fill(0); idx.forEach(([x, y], k) => { f[x] = Math.max(f[x], cur[k]); s[y] = Math.max(s[y], cur[k]); });
        if (f.every((v, x) => v === F[x]) && s.every((v, y) => v === S[y])) { const t = cur.reduce((a, b) => a + b, 0); mn = Math.min(mn, t); mx = Math.max(mx, t); }
        return;
      }
      const [x, y] = idx[i]; for (let h = 1; h <= Math.min(F[x], S[y]); h++) { cur[i] = h; rec(i + 1); }
    };
    rec(0); return [mn, mx];
  }
  const exposedFaces = H => { let t = 0; const g = (y, x) => (H[y] && H[y][x]) || 0; H.forEach((row, y) => row.forEach((h, x) => { if (!h) return; t += 2; [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dy, dx]) => { t += Math.max(0, h - g(y + dy, x + dx)); }); })); return t; };

  /* ---------- พับ-เจาะกระดาษ ---------- */
  const FOLDS = {
    VH: { s: [[[.5, 0], [1, 0], [1, 1], [.5, 1]], [[.5, 0], [1, 0], [1, .5], [.5, .5]]], line: [[[.5, 0], [.5, 1]], [[.5, .5], [1, .5]]], un: [p => [1 - p[0], p[1]], p => [p[0], 1 - p[1]]], holes: [[.75, .25], [.62, .38], [.85, .2], [.7, .12]] },
    HV: { s: [[[0, 0], [1, 0], [1, .5], [0, .5]], [[.5, 0], [1, 0], [1, .5], [.5, .5]]], line: [[[0, .5], [1, .5]], [[.5, 0], [.5, .5]]], un: [p => [p[0], 1 - p[1]], p => [1 - p[0], p[1]]], holes: [[.75, .25], [.62, .38], [.9, .15], [.6, .1]] },
    VV: { s: [[[.5, 0], [1, 0], [1, 1], [.5, 1]], [[.75, 0], [1, 0], [1, 1], [.75, 1]]], line: [[[.5, 0], [.5, 1]], [[.75, 0], [.75, 1]]], un: [p => [1 - p[0], p[1]], p => [1.5 - p[0], p[1]]], holes: [[.87, .3], [.82, .7], [.92, .5]] },
    D: { s: [[[0, 0], [1, 0], [1, 1]]], line: [[[0, 0], [1, 1]]], un: [p => [p[1], p[0]]], holes: [[.8, .3], [.6, .2], [.9, .6]] },
    DA: { s: [[[0, 0], [1, 0], [1, 1]], [[1, 0], [1, 1], [.5, .5]]], line: [[[0, 0], [1, 1]], [[1, 0], [.5, .5]]], un: [p => [p[1], p[0]], p => [1 - p[1], 1 - p[0]]], holes: [[.85, .45], [.8, .3], [.9, .7]] },
  };
  function unfold(kind, hole) {
    let pts = [hole]; const un = FOLDS[kind].un;
    for (let i = un.length - 1; i >= 0; i--) { const next = []; pts.forEach(p => { next.push(p, un[i](p)); }); pts = next; }
    const seen = {}, res = []; pts.forEach(p => { const k = fx(p[0] * 100) + ',' + fx(p[1] * 100); if (!seen[k]) { seen[k] = 1; res.push([Math.round(p[0] * 1000) / 1000, Math.round(p[1] * 1000) / 1000]); } });
    return res;
  }
  function paperPanel(poly, line, hole, x, text) {
    const S = 84, X = p => 8 + p[0] * S, Y = p => 8 + p[1] * S;
    let o = `<polygon points="${poly.map(p => fx(X(p)) + ',' + fx(Y(p))).join(' ')}" fill="${C.t}" stroke="${C.ink}" stroke-width="1.5"/>`;
    if (line) o += `<line x1="${fx(X(line[0]))}" y1="${fx(Y(line[0]))}" x2="${fx(X(line[1]))}" y2="${fx(Y(line[1]))}" stroke="#d6336c" stroke-width="1.6" stroke-dasharray="5 3"/>`;
    if (hole) o += `<circle cx="${fx(X(hole))}" cy="${fx(Y(hole))}" r="5" fill="#fff" stroke="${C.ink}" stroke-width="1.5"/>`;
    return `<g transform="translate(${x},0)">${o}<text x="50" y="106" text-anchor="middle" font-size="10" fill="currentColor">${text}</text></g>`;
  }
  function foldFig(kind, hole) {
    const f = FOLDS[kind]; let out = '', x = 0;
    out += paperPanel([[0, 0], [1, 0], [1, 1], [0, 1]], f.line[0], null, x, 'กระดาษเดิม'); x += 100;
    for (let i = 0; i < f.s.length; i++) { const last = i === f.s.length - 1; out += paperPanel(f.s[i], f.line[i + 1] || null, last ? hole : null, x, last ? 'เจาะรูตามภาพ' : 'พับครั้งที่ ' + (i + 1)); x += 100; }
    return svg(`0 0 ${x} 112`, out, 'ลำดับการพับกระดาษและตำแหน่งที่เจาะรู');
  }
  function paperOpt(holes) {
    const S = 84; let out = `<rect x="8" y="8" width="${S}" height="${S}" fill="${C.t}" stroke="${C.ink}" stroke-width="1.5"/>`;
    holes.forEach(p => out += `<circle cx="${fx(8 + p[0] * S)}" cy="${fx(8 + p[1] * S)}" r="4.5" fill="#fff" stroke="${C.ink}" stroke-width="1.4"/>`);
    return svg('0 0 100 100', out, 'กระดาษที่คลี่ออก', 'ofig');
  }

  /* ---------- แผ่นคลี่ลูกบาศก์ (ลวดลายบนหน้า ไม่ใช่แต้มลูกเต๋า) ---------- */
  const GLY = {
    0: (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.ink}"/>`,
    1: (cx, cy, r) => `<rect x="${cx - r}" y="${cy - r}" width="${2 * r}" height="${2 * r}" fill="${C.ink}"/>`,
    2: (cx, cy, r) => `<path d="M${cx - r} ${cy}H${cx + r}M${cx} ${cy - r}V${cy + r}" stroke="${C.ink}" stroke-width="${r * .7}" fill="none"/>`,
    3: (cx, cy, r) => `<polygon points="${cx},${cy - r * 1.25} ${cx + r * 1.25},${cy} ${cx},${cy + r * 1.25} ${cx - r * 1.25},${cy}" fill="${C.ink}"/>`,
    4: (cx, cy, r) => `<path d="M${cx - r} ${cy - r}L${cx + r} ${cy + r}M${cx + r} ${cy - r}L${cx - r} ${cy + r}" stroke="${C.ink}" stroke-width="${r * .7}" fill="none"/>`,
    5: (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.ink}" stroke-width="${r * .5}"/>`,
  };
  const glyph = (g, cx, cy, r) => GLY[g](cx, cy, r);
  const DIRS = { E: [1, 0], W: [-1, 0], N: [0, -1], S: [0, 1] };
  function roll(st, d) { // st=[top,bottom,north,south,east,west]
    const [t, b, n, s, e, w] = st;
    if (d === 'E') return [w, e, n, s, t, b];
    if (d === 'W') return [e, w, n, s, b, t];
    if (d === 'N') return [s, n, t, b, e, w];
    return [n, s, b, t, e, w];
  }
  // พับแผ่นคลี่ (รายการช่อง [x,y]) → แผนที่ ช่อง→รหัสหน้า (0..5) หรือ null ถ้าพับไม่ได้ (หน้าซ้อนกัน)
  function foldNet(cells) {
    const has = {}; cells.forEach(c => has[c[0] + ',' + c[1]] = 1);
    const face = {}, seen = {}, used = new Set(); let ok = true;
    const go = (c, st) => {
      const k = c[0] + ',' + c[1]; if (seen[k]) return; seen[k] = 1;
      const bottom = st[1]; if (used.has(bottom)) { ok = false; return; } used.add(bottom); face[k] = bottom;
      for (const d in DIRS) { const nc = [c[0] + DIRS[d][0], c[1] + DIRS[d][1]]; if (has[nc[0] + ',' + nc[1]] && !seen[nc[0] + ',' + nc[1]]) go(nc, roll(st, d)); }
    };
    go(cells[0], [0, 1, 2, 3, 4, 5]);
    return ok && used.size === 6 ? face : null;
  }
  const OPP = { 0: 1, 1: 0, 2: 3, 3: 2, 4: 5, 5: 4 };
  const AXIS = { 0: [0, 0, 1], 1: [0, 0, -1], 2: [0, 1, 0], 3: [0, -1, 0], 4: [1, 0, 0], 5: [-1, 0, 0] };
  const idOfAxis = v => { for (const k in AXIS) if (AXIS[k][0] === v[0] && AXIS[k][1] === v[1] && AXIS[k][2] === v[2]) return +k; };
  // สามหน้าที่มาบรรจบมุม เรียงทวนเข็มเมื่อมองจากภายนอก (ระบบพิกัดมือขวา x ออก, y เหนือ, z บน)
  function corners() {
    const res = []; [1, -1].forEach(sx => [1, -1].forEach(sy => [1, -1].forEach(sz => {
      const a = idOfAxis([sx, 0, 0]), b = idOfAxis([0, sy, 0]), c = idOfAxis([0, 0, sz]);
      // กลิ้งลูกเต๋า "ใต้" แผ่นคลี่ (ลวดลายอยู่ด้านนอก) ได้ภาพสะท้อนของการกลิ้งบนแผ่น จึงกลับลำดับเป็นทวนเข็มตามที่ตรวจกับตัวอย่างแผ่นรูปกากบาท
      res.push(sx * sy * sz > 0 ? [a, c, b] : [a, b, c]);
    }))); return res;
  }
  function netSvg(cells, sym, o) {
    o = o || {}; const u = 24, xs = cells.map(c => c[0]), ys = cells.map(c => c[1]), x0 = Math.min(...xs), y0 = Math.min(...ys), W = Math.max(...xs) - x0 + 1, H = Math.max(...ys) - y0 + 1; let out = '';
    cells.forEach(c => { const x = 4 + (c[0] - x0) * u, y = 4 + (c[1] - y0) * u; out += `<rect x="${x}" y="${y}" width="${u}" height="${u}" fill="${C.t}" stroke="${C.ink}" stroke-width="1.2"/>`; if (sym) out += glyph(sym[c[0] + ',' + c[1]], x + u / 2, y + u / 2, 6); if (o.hl === c[0] + ',' + c[1]) out += `<rect x="${x + 1.5}" y="${y + 1.5}" width="${u - 3}" height="${u - 3}" fill="none" stroke="#ff8a00" stroke-width="3"/>`; });
    return svg(`0 0 ${W * u + 8} ${H * u + 8}`, out, o.label || 'แผ่นคลี่', o.cls || 'ofig');
  }
  function cornerSvg(a, b, c) { // a=ด้านบน, b=ซ้าย, c=ขวา (รหัสลวดลาย)
    const s = 34, v = s * 0.85, P = (x, y, z) => [(x - y) * s, (x + y) * s / 2 - z * v];
    const face = (org, e1, e2, fill, g) => {
      const u = [e1[0] - org[0], e1[1] - org[1]], w = [e2[0] - org[0], e2[1] - org[1]], p = (m, n) => [org[0] + u[0] * m + w[0] * n, org[1] + u[1] * m + w[1] * n];
      const pts = [p(0, 0), p(1, 0), p(1, 1), p(0, 1)];
      return `<polygon points="${pts.map(q => fx(q[0]) + ',' + fx(q[1])).join(' ')}" fill="${fill}" stroke="${C.ink}" stroke-width="1.2"/><g transform="matrix(${[u[0], u[1], w[0], w[1], org[0], org[1]].map(n => Math.round(n * 100) / 100).join(' ')})">${glyph(g, .5, .5, .2)}</g>`;
    };
    const top_ = face(P(0, 0, 1), P(1, 0, 1), P(0, 1, 1), C.t, a), left = face(P(0, 1, 0), P(1, 1, 0), P(0, 1, 1), C.l, b), right = face(P(1, 0, 0), P(1, 1, 0), P(1, 0, 1), C.r, c);
    return svg(`${-s - 6} ${fx(-v - 8)} ${2 * s + 12} ${fx(s + v + 16)}`, left + right + top_, 'ลูกบาศก์มองเห็นสามด้าน', 'ofig');
  }
  function randomHexomino(r) {
    const cells = [[0, 0]]; const has = c => cells.some(q => q[0] === c[0] && q[1] === c[1]);
    while (cells.length < 6) { const b = pick(r, cells), d = pick(r, Object.values(DIRS)), c = [b[0] + d[0], b[1] + d[1]]; if (!has(c)) cells.push(c); }
    return cells;
  }

  /* ---------- หมุน/สะท้อนรูปร่าง ---------- */
  const PENT = { F: [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]], L: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3]], N: [[0, 0], [0, 1], [1, 1], [1, 2], [1, 3]], P: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]], Y: [[1, 0], [0, 1], [1, 1], [1, 2], [1, 3]], Z: [[0, 0], [1, 0], [1, 1], [1, 2], [2, 2]] };
  const norm2 = c => { const mx = Math.min(...c.map(p => p[0])), my = Math.min(...c.map(p => p[1])); return c.map(p => [p[0] - mx, p[1] - my]).sort((a, b) => a[0] - b[0] || a[1] - b[1]); };
  const rot2 = (c, k) => { let q = c; for (let i = 0; i < k; i++) q = q.map(p => [-p[1], p[0]]); return norm2(q); };
  const mir2 = c => norm2(c.map(p => [-p[0], p[1]]));
  function cellsSvg(c) { const u = 13, w = Math.max(...c.map(p => p[0])) + 1, h = Math.max(...c.map(p => p[1])) + 1, S = 4; const out = c.map(p => `<rect x="${p[0] * u}" y="${p[1] * u}" width="${u}" height="${u}" fill="${C.l}" stroke="${C.ink}"/>`).join(''); return svg(`0 0 ${4 * u + 2 * S} ${4 * u + 2 * S}`, `<g transform="translate(${S + (4 - w) * u / 2},${S + (4 - h) * u / 2})">${out}</g>`, 'รูปร่างจากช่องสี่เหลี่ยม', 'ofig'); }
  const ROTS = (() => {
    const mul = (a, b) => a.map(r => [0, 1, 2].map(j => r[0] * b[0][j] + r[1] * b[1][j] + r[2] * b[2][j]));
    const Rx = [[1, 0, 0], [0, 0, -1], [0, 1, 0]], Ry = [[0, 0, 1], [0, 1, 0], [-1, 0, 0]], Rz = [[0, -1, 0], [1, 0, 0], [0, 0, 1]];
    const all = {}, q = [[[1, 0, 0], [0, 1, 0], [0, 0, 1]]]; all[key(q[0])] = q[0];
    while (q.length) { const m = q.pop();[Rx, Ry, Rz].forEach(g => { const n = mul(g, m), k = key(n); if (!all[k]) { all[k] = n; q.push(n); } }); }
    return Object.values(all);
  })();
  const applyM = (m, p) => [0, 1, 2].map(i => m[i][0] * p[0] + m[i][1] * p[1] + m[i][2] * p[2]);
  const norm3 = c => { const mn = [0, 1, 2].map(i => Math.min(...c.map(p => p[i]))); return c.map(p => p.map((v, i) => v - mn[i])).sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]); };
  const rot3 = (c, m) => norm3(c.map(p => applyM(m, p)));
  const mir3 = c => norm3(c.map(p => [-p[0], p[1], p[2]]));
  const canon3 = c => ROTS.map(m => key(rot3(c, m))).sort()[0];
  function randomPolycube(r, n) {
    for (; ;) {
      const c = [[0, 0, 0]]; const has = q => c.some(p => p[0] === q[0] && p[1] === q[1] && p[2] === q[2]);
      while (c.length < n) { const b = pick(r, c), d = pick(r, [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]), q = [b[0] + d[0], b[1] + d[1], b[2] + d[2]]; if (!has(q)) c.push(q); }
      const base = norm3(c), spread = [0, 1, 2].every(i => new Set(base.map(p => p[i])).size >= 2);
      if (spread && canon3(mir3(base)) !== canon3(base)) return base;
    }
  }

  /* ---------- เมทริกซ์ลวดลาย 3×3 ---------- */
  function cellGlyph(a, ox, oy) { // a={shape:0..2,count:1..3,fill:0..2}
    const fills = ['#fff', C.fill1, C.fill2]; let out = ''; const n = a.count, gap = 11, x0 = ox + 20 - (n - 1) * gap / 2;
    for (let i = 0; i < n; i++) {
      const cx = x0 + i * gap, cy = oy + 20, r = n === 3 ? 4 : n === 2 ? 4.6 : 6.5, f = fills[a.fill];
      out += a.shape === 0 ? `<circle cx="${fx(cx)}" cy="${cy}" r="${r}" fill="${f}" stroke="${C.ink}" stroke-width="1.2"/>` : a.shape === 1 ? `<rect x="${fx(cx - r)}" y="${cy - r}" width="${2 * r}" height="${2 * r}" fill="${f}" stroke="${C.ink}" stroke-width="1.2"/>` : `<polygon points="${fx(cx)},${cy - r - 1} ${fx(cx + r + 1)},${cy + r} ${fx(cx - r - 1)},${cy + r}" fill="${f}" stroke="${C.ink}" stroke-width="1.2"/>`;
    }
    return out;
  }
  function matrixSvg(g) {
    let out = ''; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      out += `<rect x="${4 + j * 42}" y="${4 + i * 42}" width="42" height="42" fill="#fff" stroke="${C.ink}" stroke-opacity=".5"/>`;
      out += g[i][j] ? cellGlyph(g[i][j], 4 + j * 42 + 1, 4 + i * 42 + 1) : `<text x="${4 + j * 42 + 21}" y="${4 + i * 42 + 30}" text-anchor="middle" font-size="24" font-weight="700" fill="#d6336c">?</text>`;
    }
    return svg('0 0 134 134', out, 'เมทริกซ์ลวดลาย 3×3 ช่องสุดท้ายหายไป');
  }
  const cellOpt = a => svg('0 0 44 44', `<rect x="1" y="1" width="42" height="42" fill="#fff" stroke="${C.ink}" stroke-opacity=".5"/>` + cellGlyph(a, 1, 1), 'ลวดลายตัวเลือก', 'ofig');

  /* ---------- เฟือง สายพาน รอก ---------- */
  function gearCirc(cx, cy, N, label, o) {
    o = o || {}; const r = N * 1.7, circ = 2 * Math.PI * r;
    return `<circle cx="${fx(cx)}" cy="${cy}" r="${fx(r)}" fill="${o.fill || C.t}" stroke="${C.ink}" stroke-width="5" stroke-dasharray="${fx(circ / (2 * N))}"/><circle cx="${fx(cx)}" cy="${cy}" r="${fx(r - 3)}" fill="${o.fill || C.t}" stroke="${C.ink}" stroke-width="1.2"/><circle cx="${fx(cx)}" cy="${cy}" r="2.5" fill="${C.ink}"/><text x="${fx(cx)}" y="${fx(cy + Math.min(r * 0.55, 20) + 3)}" text-anchor="middle" font-size="10" fill="${C.ink}">${label}</text>${o.arrow ? `<text x="${fx(cx)}" y="${cy - 4}" text-anchor="middle" font-size="13" font-weight="700" fill="#d6336c">${o.arrow}</text>` : ''}`;
  }
  // teeth[] เรียงซ้าย→ขวา; coax[i]=true คือเฟืองตัวที่ i อยู่บนแกนเดียวกับตัวที่ i-1 (ไม่ขบกัน)
  function gearTrainSvg(teeth, labels, coax, drive) {
    let prevX = 0, prevN = 0; const centers = [];
    teeth.forEach((N, i) => { const r = N * 1.7; let x; if (i === 0) x = r; else if (coax[i]) x = prevX; else x = prevX + prevN * 1.7 + r; centers.push([x, r]); prevX = x; prevN = N; });
    const maxR = Math.max(...teeth) * 1.7, W = Math.max(...centers.map(c => c[0] + c[1])) + 8, cy = maxR + 6;
    let out = ''; teeth.map((_, i) => i).sort((a, b) => teeth[b] - teeth[a]).forEach(i => { out += gearCirc(centers[i][0] + 4, cy, teeth[i], labels[i], { arrow: i === 0 ? drive : '', fill: coax[i] ? '#f4d9ff' : C.t }); });
    return svg(`0 0 ${fx(W + 8)} ${fx(cy * 2 + 12)}`, out, 'ชุดเฟืองต่อกัน');
  }
  function pulleyBeltSvg(r1, r2, crossed, lab1, lab2) {
    const d = 120, c1 = [r1 + 8, Math.max(r1, r2) + 8], c2 = [r1 + 8 + d, c1[1]]; let belt = '';
    const sp = crossed ? (r1 + r2) / d : (r1 - r2) / d, cp = Math.sqrt(1 - sp * sp), n1 = [sp, -cp], n2 = [sp, cp];
    const pts = k => crossed ? [[c1[0] + r1 * k[0], c1[1] + r1 * k[1]], [c2[0] - r2 * k[0], c2[1] - r2 * k[1]]] : [[c1[0] + r1 * k[0], c1[1] + r1 * k[1]], [c2[0] + r2 * k[0], c2[1] + r2 * k[1]]];
    [n1, n2].forEach(k => { const p = pts(k); belt += `<line x1="${fx(p[0][0])}" y1="${fx(p[0][1])}" x2="${fx(p[1][0])}" y2="${fx(p[1][1])}" stroke="#d6336c" stroke-width="2"/>`; });
    const out = belt + [[c1, r1, lab1], [c2, r2, lab2]].map(([c, r, l]) => `<circle cx="${fx(c[0])}" cy="${fx(c[1])}" r="${r}" fill="${C.t}" stroke="${C.ink}" stroke-width="2"/><circle cx="${fx(c[0])}" cy="${fx(c[1])}" r="2.5" fill="${C.ink}"/><text x="${fx(c[0])}" y="${fx(c[1] + 16)}" text-anchor="middle" font-size="11" fill="${C.ink}">${l}</text>`).join('');
    return svg(`0 0 ${fx(r1 + r2 + d + 16)} ${Math.max(r1, r2) * 2 + 16}`, out, crossed ? 'ล้อสายพานแบบไขว้' : 'ล้อสายพานแบบเปิด');
  }
  function blockTackleSvg(n, load) {
    const w = 40 + n * 26, xs = []; for (let i = 0; i < n; i++) xs.push(18 + i * 26);
    const top = 14, bot = 98, mid = (xs[0] + xs[n - 1]) / 2; let out = `<rect x="6" y="6" width="${w}" height="8" fill="${C.ink}"/>`;
    xs.forEach(x => { out += `<line x1="${x}" y1="${top}" x2="${x}" y2="${bot}" stroke="#d6336c" stroke-width="2"/>`; });
    out += `<rect x="${xs[0] - 10}" y="${bot}" width="${xs[n - 1] - xs[0] + 20}" height="14" rx="3" fill="${C.l}" stroke="${C.ink}"/><line x1="${mid}" y1="${bot + 14}" x2="${mid}" y2="${bot + 24}" stroke="${C.ink}" stroke-width="2"/><rect x="${mid - 18}" y="${bot + 24}" width="36" height="22" fill="${C.r}" stroke="${C.ink}"/><text x="${mid}" y="${bot + 39}" text-anchor="middle" font-size="11" fill="#fff">${load} N</text>`;
    const px = xs[n - 1] + 26; out += `<line x1="${xs[n - 1]}" y1="${top}" x2="${px}" y2="${top + 6}" stroke="#d6336c" stroke-width="2"/><line x1="${px}" y1="${top + 6}" x2="${px}" y2="${top + 62}" stroke="#d6336c" stroke-width="2"/><text x="${px}" y="${top + 78}" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor">F ↓</text>`;
    return svg(`0 0 ${w + 30} 156`, out, 'ระบบรอกที่มีเชือกหลายเส้นรับน้ำหนัก');
  }
  return { C, rnd, pick, shuffle, hash, key, fx, svg, iso, heightsToCubes, frontView, rightView, elev, top, randomStack, blockRange, exposedFaces, FOLDS, unfold, foldFig, paperOpt, GLY, glyph, foldNet, OPP, corners, netSvg, cornerSvg, randomHexomino, PENT, norm2, rot2, mir2, cellsSvg, ROTS, rot3, mir3, canon3, norm3, randomPolycube, matrixSvg, cellOpt, cellGlyph, gearTrainSvg, pulleyBeltSvg, blockTackleSvg };
})();
