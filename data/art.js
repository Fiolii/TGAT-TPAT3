// หน้า "บทความ" สำหรับบทเรียน: ย่อหน้ายาว + กล่องสูตร (ตัวแปร/ความหมาย/หน่วย) + ภาพประกอบ SVG เคลื่อนไหวที่วาดเอง
// + ตัวอย่างแบบกระดานดำมีครูสอนทีละขั้น (board) + หน้าเตือนจุดตาย (danger)
// ชนิดสไลด์ { type:'read', h, blocks:[ {p}|{h}|{eq,name,vars,use}|{fig,cap}|{tbl}|{tip,warn} ] }
const artTxt = s => rt(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

// ขนาดตัวอักษรของสัญลักษณ์ในช่องตัวแปร (ช่องกว้าง 54px): ยิ่งยาวยิ่งเล็กลง ตัวห้อย/ตัวยกนับเป็นครึ่งตัว
function avWide(sym) { return avLen(sym) > 5.5; } // สัญลักษณ์ยาว (เช่น Δ = b² − 4ac) ใช้ช่องเต็มความกว้าง
function avFit(sym) { const n = avLen(sym); if (n > 5.5) return 17; return n <= 1.6 ? 24 : n <= 2.6 ? 20 : n <= 3.4 ? 16 : n <= 4.4 ? 13 : 11; }
function avLen(sym) {
  let n = 0; // นับจาก HTML ที่ rt() สร้างจริง: ข้อความปกติ 1 ต่อตัว, ใน <sub>/<sup> 0.55 ต่อตัว
  rt(sym).split(/(<(?:sub|sup)>.*?<\/(?:sub|sup)>)/).forEach(p => { const sm = /^<(?:sub|sup)>(.*)<\/(?:sub|sup)>$/.exec(p); n += (sm ? sm[1] : p).replace(/<[^>]*>|&[a-z#0-9]+;/g, 'x').length * (sm ? 0.55 : 1); });
  return n;
}
function readHtml(sl) {
  const out = sl.blocks.map(b => {
    if (b.p) return `<p class="ap">${artTxt(b.p)}</p>`;
    if (b.h) return `<h3 class="ah">${artTxt(b.h)}</h3>`;
    if (b.fig) return `<figure class="afig">${typeof b.fig === 'function' ? b.fig() : b.fig}${b.cap ? `<figcaption>🖼 ${artTxt(b.cap)}</figcaption>` : ''}</figure>`;
    if (b.bfig) return `<figure class="afig chalkfig"><div class="board mini"><div class="bdfig">${AF.boardSvg(b.bfig[0], 99, b.bfig[1], b.bfig[2])}</div></div>${b.cap ? `<figcaption>🖼 ${artTxt(b.cap)}</figcaption>` : ''}</figure>`;
    if (b.tip) return `<div class="atip ${b.warn ? 'warn' : ''}">${b.warn ? '⚠️ ' : '💡 '}${artTxt(b.tip)}</div>`;
    if (b.tbl) return `<div class="atbl"><table><tr>${b.tbl.head.map(h => `<th>${artTxt(h)}</th>`).join('')}</tr>${b.tbl.rows.map(r => `<tr>${r.map(c => `<td>${artTxt(c)}</td>`).join('')}</tr>`).join('')}</table></div>`;
    if (b.eq) return `<div class="aeq"><div class="aeqn">🧮 ${artTxt(b.name || 'สูตร')}</div><div class="aeqf">${rt(b.eq)}</div>
      ${b.vars ? `<div class="avgrid">${b.vars.map(v => `<div class="avc ${avWide(v[0]) ? 'wide' : ''}"><div class="avs"><span class="avsi" style="font-size:${avFit(v[0])}px">${rt(v[0])}</span></div><div class="avm">${artTxt(v[1])}</div><div class="avu">${v[2] === null ? '' : v[2] ? `<span class="vu">หน่วย ${rt(v[2])}</span>` : '<span class="vu none">ไม่มีหน่วย</span>'}</div></div>`).join('')}</div>` : ''}
      ${b.use ? `<div class="aequse">📌 ${artTxt(b.use)}</div>` : ''}</div>`;
    return '';
  }).join('');
  return `<h2>${rt(sl.h)}</h2>${sl.lead ? `<div class="rlead">${artTxt(sl.lead)}</div>` : ''}<div class="art">${out}</div>`;
}

/* ---------- ภาพประกอบ SVG ที่วาดเอง (สีตามธีม/โหมดมืดผ่าน CSS variables) มีแอนิเมชันวาดทีละส่วน ---------- */
const AF = (() => {
  const RM = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const col = { ink: 'var(--ink)', pri: 'var(--pri)', ok: 'var(--ok)', bad: 'var(--bad)', warn: 'var(--warn)', mute: 'var(--mute)' };
  const defs = '<defs>' + Object.keys(col).map(k => `<marker id="ah-${k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" style="fill:${col[k]}"/></marker>`).join('') + '</defs>';
  const D = '@@D@@'; // ตัวแทนค่าดีเลย์ — เติมตามลำดับการวาด
  const ln = (x1, y1, x2, y2, c = 'ink', w = 2, dash) => dash
    ? `<line class="fi" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:${col[c]};stroke-width:${w};stroke-dasharray:${dash};animation-delay:${D}s"/>`
    : `<line class="dr" pathLength="1" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:${col[c]};stroke-width:${w};animation-delay:${D}s"/>`;
  const ar = (x1, y1, x2, y2, c = 'pri', w = 3) => `<line class="fi" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:${col[c]};stroke-width:${w};animation-delay:${D}s" marker-end="url(#ah-${c})"/>`;
  const ar2 = (x1, y1, x2, y2, c = 'mute', w = 1.8) => `<line class="fi" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:${col[c]};stroke-width:${w};animation-delay:${D}s" marker-start="url(#ah-${c})" marker-end="url(#ah-${c})"/>`;
  const subs = s => s.replace(/_([a-z]+|[0-9]+|[A-Z]{1,2}|[฀-๿]+)/g, '<tspan dy="4" style="font-size:.72em">$1</tspan><tspan dy="-4">​</tspan>');
  const tx = (x, y, s, c = 'ink', a = 'middle', sz = 14, wt = 700) => `<text class="fi" x="${x}" y="${y}" text-anchor="${a}" style="fill:${col[c]};font-size:${sz}px;font-weight:${wt};animation-delay:${D}s">${subs(s)}</text>`;
  const sb = (b, s, after) => `${b}<tspan dy="4" style="font-size:.72em">${s}</tspan><tspan dy="-4">${after || '​'}</tspan>`;
  const fl = (d, c, op = .16) => `<path class="fi" d="${d}" style="fill:${col[c]};fill-opacity:${op};stroke:none;animation-delay:${D}s"/>`;
  const pa = (d, c = 'ink', w = 2.5, dash) => dash
    ? `<path class="fi" d="${d}" style="fill:none;stroke:${col[c]};stroke-width:${w};stroke-dasharray:${dash};animation-delay:${D}s"/>`
    : `<path class="dr" pathLength="1" d="${d}" style="fill:none;stroke:${col[c]};stroke-width:${w};animation-delay:${D}s"/>`;
  const ci = (x, y, r, c = 'pri') => `<circle class="fi" cx="${x}" cy="${y}" r="${r}" style="fill:${col[c]};animation-delay:${D}s"/>`;
  // ลูกบอลที่เคลื่อนที่ตามจุดที่คำนวณไว้ (ใช้ SMIL) — ปิดเมื่อผู้ใช้ตั้งค่าลดการเคลื่อนไหว
  const mover = (pts, dur, c = 'warn', r = 8, begin = 2.2) => RM ? '' :
    `<circle r="${r}" cx="${pts[0][0].toFixed(1)}" cy="${pts[0][1].toFixed(1)}" style="fill:${col[c]};stroke:var(--card);stroke-width:2">` +
    `<animate attributeName="cx" values="${pts.map(p => p[0].toFixed(1)).join(';')}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>` +
    `<animate attributeName="cy" values="${pts.map(p => p[1].toFixed(1)).join(';')}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/></circle>`;
  const spin = (cx, cy, x, y, dur, c = 'ok', r = 6) => RM ? '' :
    `<g><animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="-360 ${cx} ${cy}" dur="${dur}s" begin="2.2s" repeatCount="indefinite"/><circle cx="${x}" cy="${y}" r="${r}" style="fill:${col[c]};fill-opacity:.5"/></g>`;
  const range = (n, f) => Array.from({ length: n + 1 }, (_, i) => f(i / n));
  const svg = (w, h, inner, label) => { let n = 0; inner = inner.replace(/@@D@@/g, () => (Math.min(n++ * 0.13, 2.4)).toFixed(2)); return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">${defs}${inner}</svg>`; };

  // ภาพบนกระดานดำ: fig(S) คืนอาร์เรย์ "กลุ่มเส้น" ที่ทยอยวาดเพิ่มตามขั้นของครู (เฉพาะกลุ่มใหม่ล่าสุดที่มีแอนิเมชัน)
  const boardSvg = (fig, stage, w, h, label) => {
    const gs = fig({ ln, ar, ar2, tx, sb, fl, pa, ci, range }), st = Math.min(stage, gs.length - 1);
    let n = 0;
    const body = gs.slice(0, st + 1).map((g, i) => i < st ? g.replace(/class="(fi|dr)"/g, 'class="st"').replace(/@@D@@/g, '0') : g.replace(/@@D@@/g, () => (0.12 * n++).toFixed(2))).join('');
    return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${label || 'ภาพประกอบบนกระดาน'}">${defs}${body}</svg>`;
  };

  return {
    boardSvg,
    // กราฟ v–t ความเร่งคงที่: พื้นที่ = ut + ½at²
    vt: () => svg(440, 250,
      fl('M60,140 L340,140 L340,210 L60,210z', 'pri', .16) + fl('M60,140 L340,140 L340,60z', 'ok', .3) +
      ln(60, 140, 340, 140, 'mute', 1.5, '5 4') + ln(60, 60, 340, 60, 'mute', 1.5, '5 4') + ln(340, 60, 340, 210, 'mute', 1.5, '5 4') +
      ar(60, 210, 428, 210, 'ink', 2) + ar(60, 210, 60, 16, 'ink', 2) + ln(60, 140, 340, 60, 'pri', 4) +
      tx(50, 145, 'u', 'ink', 'end') + tx(50, 65, 'v', 'ink', 'end') + tx(340, 230, 't') +
      tx(70, 14, 'ความเร็ว (m/s)', 'mute', 'start', 12, 600) + tx(428, 232, 'เวลา (s)', 'mute', 'end', 12, 600) +
      tx(200, 188, 'ut', 'pri', 'middle', 18) + tx(285, 125, '½at²', 'ok', 'middle', 17) + tx(160, 96, 'ความชัน = a', 'pri', 'middle', 13) +
      mover(range(24, s => [60 + 280 * s, 140 - 80 * s]), 3.2, 'warn', 7),
      'กราฟความเร็วต่อเวลา พื้นที่ใต้เส้นคือการกระจัด'),

    // ขว้างขึ้นแนวดิ่ง
    throwUp: () => svg(440, 262,
      ln(40, 228, 410, 228, 'ink', 2.5) +
      ar(130, 216, 130, 56, 'pri', 3.5) + ar(300, 56, 300, 216, 'warn', 3.5) +
      pa('M130,56 Q215,20 300,56', 'mute', 2, '5 4') +
      ci(130, 222, 9, 'pri') + ci(215, 36, 9, 'ok') + ci(300, 222, 9, 'warn') +
      tx(114, 190, 'u = +25 m/s', 'pri', 'end', 13) + tx(114, 208, 'เริ่มขว้าง', 'mute', 'end', 12, 600) +
      tx(215, 16, 'จุดสูงสุด  v = 0', 'ok', 'middle', 14) +
      tx(316, 190, 'v = −25 m/s', 'warn', 'start', 13) + tx(316, 208, 'กลับถึงมือ', 'mute', 'start', 12, 600) +
      tx(142, 130, 'ขึ้น 2.5 s', 'pri', 'start', 13) + tx(288, 130, 'ลง 2.5 s', 'warn', 'end', 13) +
      ar(48, 52, 48, 112, 'bad', 3) + tx(48, 40, 'g', 'bad', 'middle', 15) + tx(48, 130, '10 m/s²', 'bad', 'middle', 12) + tx(48, 146, 'ลงตลอด', 'bad', 'middle', 12, 600) +
      ar2(215, 50, 215, 222, 'mute', 1.6) + tx(223, 140, 'H', 'mute', 'start', 15) +
      mover([...range(14, s => [130, 222 - 166 * (1 - (1 - s) * (1 - s))]), ...range(8, s => [130 + 170 * s, 56 - 36 * (1 - (2 * s - 1) * (2 * s - 1))]), ...range(14, s => [300, 56 + 166 * s * s])], 4, 'ok', 8),
      'ขว้างขึ้นแนวดิ่ง ขาขึ้นและขาลงสมมาตรกัน'),

    // พื้นเอียง + FBD
    incline: () => svg(440, 262,
      fl('M40,222 L360,222 L360,37z', 'mute', .12) + ln(40, 222, 360, 222, 'ink', 2.5) + pa('M40,222 L360,37', 'ink', 2.5) +
      '<g class="fi" style="animation-delay:.5s" transform="translate(205,129) rotate(-30)"><rect x="-34" y="-48" width="68" height="48" rx="3" style="fill:var(--card);stroke:var(--ink);stroke-width:2.5"/></g>' +
      ar(194, 105, 194, 190, 'bad', 3.2) + tx(207, 204, 'W = mg', 'bad', 'start', 14) +
      ar(194, 105, 151, 30, 'ok', 3.2) + tx(139, 22, 'N', 'ok', 'end', 15) +
      ar(194, 105, 245, 76, 'warn', 3.2) + tx(250, 70, 'f', 'warn', 'start', 15) +
      ar(194, 105, 168, 120, 'mute', 2) + ar(194, 105, 224, 157, 'mute', 2) +
      tx(146, 128, 'mg sinθ', 'mute', 'end', 12, 600) + tx(236, 168, 'mg cosθ', 'mute', 'start', 12, 600) +
      pa('M96,222 A56,56 0 0 0 89,196', 'ink', 2) + tx(112, 213, 'θ', 'ink', 'start', 15) +
      tx(340, 244, 'ทิศลงเอียง', 'mute', 'end', 12, 600),
      'แผนภาพแรงอิสระของวัตถุบนพื้นเอียง'),

    // กราฟ f–F เสียดทาน
    fric: () => svg(440, 250,
      ar(60, 210, 428, 210, 'ink', 2) + ar(60, 210, 60, 16, 'ink', 2) +
      ln(60, 210, 190, 80, 'pri', 4) + ln(190, 80, 190, 120, 'mute', 1.6, '4 4') + ln(190, 120, 400, 120, 'warn', 4) +
      ci(190, 80, 6, 'pri') + ci(190, 120, 6, 'warn') +
      ln(60, 80, 190, 80, 'mute', 1.3, '4 4') + ln(60, 120, 190, 120, 'mute', 1.3, '4 4') +
      tx(70, 14, 'แรงเสียดทาน f (N)', 'mute', 'start', 12, 600) + tx(428, 232, 'แรงที่ออกแรงดึง F (N)', 'mute', 'end', 12, 600) +
      tx(196, 66, sb('f', 's,max', ' = μ') + sb('', 's', ' N'), 'pri', 'start', 14) +
      tx(250, 144, sb('f', 'k', ' = μ') + sb('', 'k', ' N  (คงที่)'), 'warn', 'start', 14) +
      tx(150, 176, 'ยังไม่เลื่อน', 'pri', 'middle', 13) + tx(150, 194, 'f = F', 'pri', 'middle', 13) +
      tx(320, 100, 'เลื่อนแล้ว', 'warn', 'middle', 13),
      'ความเสียดทานสถิตเพิ่มตามแรงดึงจนถึงค่าสูงสุด แล้วลดเหลือค่าจลน์คงที่'),

    // งานของแรงเฉียง
    work: () => svg(440, 240,
      ln(20, 190, 420, 190, 'ink', 2.5) +
      '<rect class="fi" x="120" y="130" width="90" height="60" rx="4" style="fill:var(--card);stroke:var(--ink);stroke-width:2.5;animation-delay:.2s"/>' +
      ar(210, 160, 340, 95, 'pri', 3.5) + tx(346, 86, 'F', 'pri', 'start', 16) +
      ln(210, 160, 340, 160, 'ok', 2.2, '6 4') + ln(340, 160, 340, 95, 'bad', 2.2, '6 4') +
      tx(275, 180, 'F cosθ', 'ok', 'middle', 14) + tx(350, 132, 'F sinθ', 'bad', 'start', 14) +
      pa('M246,160 A36,36 0 0 0 242,142', 'ink', 2) + tx(256, 152, 'θ', 'ink', 'start', 14) +
      ar(120, 214, 250, 214, 'mute', 2.5) + tx(185, 232, 'การกระจัด s', 'mute', 'middle', 13),
      'มีเฉพาะองค์ประกอบของแรงที่ขนานการเคลื่อนที่เท่านั้นที่ทำงาน'),

    // พลังงานบนทางลาด
    ramp: () => svg(470, 250,
      fl('M40,40 L250,200 L40,200z', 'mute', .14) + pa('M40,40 L250,200', 'ink', 2.5) + ln(20, 200, 290, 200, 'ink', 2.5) +
      ci(64, 46, 9, 'pri') + ci(140, 105, 9, 'pri') + ci(246, 191, 9, 'pri') +
      tx(80, 38, 'A', 'ink', 'start', 14) + tx(156, 98, 'B', 'ink', 'start', 14) + tx(246, 216, 'C', 'ink', 'middle', 14) +
      ar2(64, 62, 64, 198, 'mute', 1.6) + tx(54, 140, 'h', 'ink', 'end', 15) +
      '<rect class="fi" x="318" y="100" width="34" height="100" style="fill:var(--pri);fill-opacity:.85;animation-delay:1.2s"/>' +
      '<rect class="fi" x="366" y="100" width="34" height="48" style="fill:var(--ok);fill-opacity:.85;animation-delay:1.3s"/><rect class="fi" x="366" y="148" width="34" height="52" style="fill:var(--pri);fill-opacity:.85;animation-delay:1.3s"/>' +
      '<rect class="fi" x="414" y="100" width="34" height="100" style="fill:var(--ok);fill-opacity:.85;animation-delay:1.4s"/>' +
      ln(306, 100, 456, 100, 'mute', 1.4, '5 4') + tx(335, 218, 'A', 'ink', 'middle', 14) + tx(383, 218, 'B', 'ink', 'middle', 14) + tx(431, 218, 'C', 'ink', 'middle', 14) +
      tx(330, 86, 'E รวมคงที่', 'mute', 'start', 12, 600) +
      '<rect x="318" y="232" width="12" height="12" style="fill:var(--pri)"/>' + tx(335, 243, sb('E', 'p') + ' = mgh', 'ink', 'start', 12, 600) +
      '<rect x="392" y="232" width="12" height="12" style="fill:var(--ok)"/>' + tx(409, 243, sb('E', 'k') + ' = ½mv²', 'ink', 'start', 12, 600) +
      mover(range(20, s => [64 + 182 * s * s, 46 + 145 * s * s]), 3, 'warn', 7),
      'ลูกบอลไถลลงทางลาดลื่น: พลังงานศักย์ค่อย ๆ เปลี่ยนเป็นพลังงานจลน์ ผลรวมคงที่'),

    // โพรเจกไทล์
    proj: () => svg(480, 270,
      ln(20, 215, 460, 215, 'ink', 2.5) + pa('M50,215 Q240,-95 430,215', 'mute', 2.5, '6 5') +
      ln(240, 60, 240, 215, 'mute', 1.5, '4 4') + tx(248, 150, 'H', 'mute', 'start', 15) +
      ar(50, 215, 87, 155, 'pri', 3.5) + ln(50, 215, 87, 215, 'ok', 2, '5 4') + ln(87, 215, 87, 155, 'bad', 2, '5 4') +
      pa('M80,215 A30,30 0 0 0 73,198', 'ink', 2) + tx(86, 208, 'θ', 'ink', 'start', 13) +
      ar(240, 60, 300, 60, 'ok', 3.5) + tx(306, 56, sb('v', 'x'), 'ok', 'start', 15) + tx(240, 44, sb('v', 'y', ' = 0'), 'bad', 'middle', 13) +
      ar(150, 135, 192, 135, 'ok', 2.4) + ar(290, 135, 332, 135, 'ok', 2.4) +
      tx(171, 156, sb('v', 'x', ' คงที่'), 'ok', 'middle', 12, 600) + tx(311, 156, sb('v', 'x', ' คงที่'), 'ok', 'middle', 12, 600) +
      ar(393, 155, 430, 215, 'pri', 3.5) + tx(382, 142, 'v', 'pri', 'end', 15) +
      ci(50, 215, 6, 'pri') + ci(240, 60, 6, 'ok') + ci(430, 215, 6, 'warn') +
      ar2(50, 240, 430, 240, 'mute', 1.8) + tx(240, 260, 'พิสัย R', 'mute', 'middle', 14) +
      tx(94, 182, sb('v', '0'), 'pri', 'start', 15) +
      mover(range(36, t => [50 + 380 * t, (1 - t) * (1 - t) * 215 + 2 * t * (1 - t) * -95 + t * t * 215]), 3.6, 'warn', 8),
      'วิถีโพรเจกไทล์: แนวราบความเร็วคงที่ แนวดิ่งเป็นการขว้างขึ้นแล้วตกลง'),

    // เคลื่อนที่แนววงกลม
    circ: () => svg(400, 266,
      `<circle class="fi" cx="200" cy="132" r="88" style="fill:none;stroke:${col.mute};stroke-width:2.5;stroke-dasharray:6 5;animation-delay:.1s"/>` +
      ci(200, 132, 4, 'ink') +
      ln(200, 132, 274.1, 84, 'mute', 1.6, '4 4') + tx(222, 104, 'r', 'ink', 'middle', 15) +
      ar(274.1, 84, 238.4, 33, 'pri', 3.5) + tx(236, 26, 'v (แนวสัมผัส)', 'pri', 'end', 14) +
      ar(274.1, 84, 223.7, 118, 'warn', 3.5) + tx(262, 124, sb('a', 'c'), 'warn', 'middle', 15) +
      ci(274.1, 84, 9, 'ok') +
      tx(200, 240, 'ความเร่งชี้เข้าหาจุดศูนย์กลาง O เสมอ', 'warn', 'middle', 13, 700) +
      tx(200, 258, 'อัตราเร็วคงที่ แต่ทิศของ v เปลี่ยนตลอด จึงมีความเร่ง', 'mute', 'middle', 12, 600) + tx(190, 150, 'O', 'ink', 'end', 13) +
      spin(200, 132, 288, 132, 5, 'ok', 6),
      'ความเร่งสู่ศูนย์กลางชี้เข้าหาจุดศูนย์กลางเสมอ และตั้งฉากกับความเร็ว')
  };
})();

/* ---------- ครูประจำกระดาน (SVG วาดเอง) ---------- */
const teacherSvg = () => `<svg class="tchsvg" viewBox="0 0 170 210" role="img" aria-label="ครูกำลังสอน">
  <g class="tch-arm"><path d="M122,158 Q150,150 152,112" style="fill:none;stroke:var(--pri);stroke-width:15;stroke-linecap:round"/><circle cx="152" cy="108" r="9" style="fill:#f2c9a0"/><line x1="152" y1="108" x2="160" y2="28" style="stroke:#b07a3c;stroke-width:4;stroke-linecap:round"/></g>
  <path d="M26,210 Q26,150 85,142 Q144,150 144,210z" style="fill:var(--pri)"/>
  <path d="M68,146 L85,170 L102,146z" style="fill:#fff"/>
  <rect x="73" y="124" width="24" height="26" rx="8" style="fill:#e8b98a"/>
  <circle cx="85" cy="92" r="44" style="fill:#f2c9a0"/>
  <path d="M40,88 Q36,40 85,40 Q134,40 130,88 Q120,62 85,62 Q52,62 40,88z" style="fill:#2b2b3a"/>
  <circle cx="68" cy="96" r="12" style="fill:#fff;fill-opacity:.55;stroke:#2b2b3a;stroke-width:3"/><circle cx="102" cy="96" r="12" style="fill:#fff;fill-opacity:.55;stroke:#2b2b3a;stroke-width:3"/><line x1="80" y1="96" x2="90" y2="96" style="stroke:#2b2b3a;stroke-width:3"/>
  <circle cx="68" cy="97" r="3.6" style="fill:#2b2b3a"/><circle cx="102" cy="97" r="3.6" style="fill:#2b2b3a"/>
  <circle cx="56" cy="116" r="7" style="fill:#f08c8c;fill-opacity:.45"/><circle cx="114" cy="116" r="7" style="fill:#f08c8c;fill-opacity:.45"/>
  <ellipse class="tch-mouth" cx="85" cy="120" rx="10" ry="5" style="fill:#b5483b"/>
</svg>`;

/* ---------- ตัวอย่างแบบกระดานดำ: ครูสอนทีละขั้น ----------
   { type:'board', h, q, given:[], find:[], plan, steps:[{w:'ที่เขียนบนกระดาน', s:'ครูอธิบาย', hl}], ans, outro } */
function boardHtml(sl, o) {
  o = o || {}; LS.bd = LS.bd || {};
  const key = o.key != null ? o.key : LS.i, P = o.who && typeof PEOPLE !== 'undefined' ? PEOPLE[o.who] : null;
  const n = Math.min(LS.bd[key] || 0, sl.steps.length), N = sl.steps.length, done = n === N;
  const lines = sl.steps.slice(0, n).map((s, i) => `<div class="bdl ${i === n - 1 ? 'new' : ''} ${s.hl ? 'hl' : ''}"><span class="bdn">${i + 1}</span><div class="bdw">${rt(s.w)}</div></div>`).join('');
  const say = n === 0 ? (P ? '“' + P.hi + '”<br><br>' : '') + sl.plan : sl.steps[n - 1].s + (done && sl.outro ? '<br><br>🎓 ' + sl.outro : '');
  const chip = (P ? '🎓 ' + P.n + ' · ' : '👩‍🏫 ') + (n === 0 ? 'อ่านโจทย์ให้ฟัง' : `ขั้นที่ ${n} จาก ${N}`);
  return `${o.noH ? `<h3 class="bdh3">${rt(sl.h)}</h3>` : `<h2>✏️ ${rt(sl.h)}</h2>`}
  <div class="board ${o.lvl != null ? 'lv' + o.lvl : ''}"><div class="bdq"><span class="bdtag">โจทย์</span>${nl(sl.q)}</div>
    <div class="bdgf"><div class="bdg"><b>📘 โจทย์ให้</b><ul>${(sl.given || []).map(g => `<li>${rt(g)}</li>`).join('')}</ul></div><div class="bdf"><b>🎯 ต้องหา</b><ul>${(sl.find || []).map(g => `<li>${rt(g)}</li>`).join('')}</ul></div></div>
    <div class="bdmain ${sl.fig ? 'hasfig' : ''}">${sl.fig ? `<div class="bdfig" data-a="figZoom" role="button" tabindex="0" aria-label="แตะเพื่อขยายภาพ"><div class="bdfigt">🖍 ภาพที่ครูวาดบนกระดาน · 🔍 แตะเพื่อขยาย</div>${AF.boardSvg(sl.fig, n, sl.fw || 420, sl.fh || 250, sl.h)}</div>` : ''}<div class="bdlines">${lines}</div></div>
    ${done ?`<div class="bdans">✔ คำตอบ: <b>${rt(sl.ans)}</b></div>` : ''}
    <div class="bdtray"><i></i><i></i><i></i></div></div>
  <div class="tchrow ${o.lvl != null ? 'lv' + o.lvl : ''}"><div class="tchwrap ${n === 0 ? '' : 'talk'}">${P ? personSvg(o.who) : teacherSvg()}</div>
    <div class="bubble" key="${n}"><span class="bchip">${chip}</span><div class="btxt">${artTxt(say).replace(/&lt;br&gt;/g, '<br>')}</div></div></div>
  <div class="bdctl"><button data-a="bdPrev" ${n === 0 ? 'disabled' : ''}>◀ ย้อนขั้น</button>
    <button class="pri" data-a="bdNext" ${done ? 'disabled' : ''}>${n === 0 ? '▶ เริ่มสอน' : done ? '✓ ครบแล้ว' : `ขั้นต่อไป (${n + 1}/${N}) ▶`}</button>
    <button data-a="bdAll" ${done ? 'disabled' : ''}>ดูทั้งหมด</button></div>`;
}
// กระดานที่กำลังแสดงอยู่ (สไลด์ board เดี่ยว หรือกระดานในระดับที่เลือกของสไลด์ exlv)
function bdCur() {
  const sl = LS && LS.slides[LS.i]; if (!sl) return null;
  if (sl.type === 'board') return { b: sl, key: LS.i };
  if (sl.type === 'exlv') { const L = exLvl(sl), bi = exBi(sl, L); return { b: sl.lv[LV_KEYS[L]][bi], key: LS.i + ':' + L + ':' + bi }; }
  return null;
}
// ขยายรูปบนกระดานเต็มจอ (มือถือรูปเล็ก ตัวหนังสือในรูปอ่านยาก) — เลื่อนดูได้ แตะที่ใดก็ได้เพื่อปิด
function figZoomClose() { const z = document.getElementById('figzoom'); if (z) z.remove(); document.body.style.overflow = ''; }
document.addEventListener('keydown', e => { if (e.key === 'Escape') figZoomClose(); });
const ART_ACT = {
  figZoom(v, el) {
    const svg = el && el.querySelector('svg'); if (!svg) return; figZoomClose();
    const z = document.createElement('div'); z.id = 'figzoom'; z.className = 'figzoom'; z.setAttribute('data-a', 'figZoomClose'); z.setAttribute('role', 'dialog'); z.setAttribute('aria-label', 'ภาพขยาย');
    z.innerHTML = `<div class="fzbar"><b>🔍 ภาพขยาย · เลื่อนดูได้</b><button data-a="figZoomClose">ปิด ✕</button></div><div class="fzbody"><div class="${((el.closest('.board') || {}).className || 'board')} fzboard">${svg.outerHTML}</div></div>`;
    document.body.appendChild(z); document.body.style.overflow = 'hidden';
  },
  figZoomClose,
  bdNext() { const c = bdCur(); if (!c) return; LS.bd = LS.bd || {}; LS.bd[c.key] = Math.min((LS.bd[c.key] || 0) + 1, c.b.steps.length); render(true); },
  bdPrev() { const c = bdCur(); if (!c) return; LS.bd = LS.bd || {}; LS.bd[c.key] = Math.max((LS.bd[c.key] || 0) - 1, 0); render(true); },
  bdAll() { const c = bdCur(); if (!c) return; LS.bd = LS.bd || {}; LS.bd[c.key] = c.b.steps.length; render(true); },
  lvSet(v) { const sl = LS && LS.slides[LS.i]; if (!sl || sl.type !== 'exlv') return; LS.lvl = LS.lvl || {}; LS.lvl[LS.i] = +v; if (typeof achMark === 'function') achMark('lvl', LS.k + ':' + v); render(true); },
  bsSet(v) { const sl = LS && LS.slides[LS.i]; if (!sl || sl.type !== 'exlv') return; LS.bsel = LS.bsel || {}; LS.bsel[LS.i + ':' + exLvl(sl)] = +v; render(true); }
};

/* ---------- หน้าเตือนจุดตาย: { type:'danger', h, intro, traps:[{t, bad, good, why}] } ---------- */
function dangerHtml(sl) {
  return `<div class="danger"><div class="dgbar"></div>
    <div class="dghead"><span class="dgico">⚠️</span><div><div class="dgk">DANGER ZONE · จุดที่ข้อสอบชอบหลอก</div><h2>${rt(sl.h)}</h2></div></div>
    <p class="dgintro">${artTxt(sl.intro || '')}</p>
    <div class="dgcards">${sl.traps.map((t, i) => `<div class="dgc" style="animation-delay:${.15 + i * .35}s"><div class="dgn">💀 จุดตายที่ ${i + 1}</div><h3>${rt(t.t)}</h3>
      <div class="dgx"><span>❌ ทำแบบนี้ = เสียคะแนนทันที</span><p>${artTxt(t.bad)}</p></div>
      <div class="dgo"><span>✅ ต้องทำแบบนี้</span><p>${artTxt(t.good)}</p></div>
      <div class="dgw">🔥 ${artTxt(t.why)}</div></div>`).join('')}</div>
    <div class="dgbar"></div></div>`;
}
