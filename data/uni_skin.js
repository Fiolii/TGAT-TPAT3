// "หน้าตาเฉพาะตัว" ของหน้าประวัติแต่ละมหาวิทยาลัย — แต่ละที่มีฉากฮีโร่ (SVG วาดเอง) ลายคั่น คำเรียกบท ชื่อบท ฟอนต์ และเลย์เอาต์ของตัวเอง
// สีพื้นผิว/การจัดวางอยู่ใน hist_skins.css แยกตาม [data-u="รหัส"] ; ไฟล์นี้เก็บ "เนื้อหาที่ต่างกัน" และภาพประกอบ
// ภาพทั้งหมดวาดขึ้นเองเพื่อสื่ออัตลักษณ์ (ไม่ใช่ตราทางการ) ; เพิ่มมหาวิทยาลัยใหม่ = เพิ่มก้อนใน UNISKIN

const uskRnd = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const uskN = (v, d = 1) => (+v).toFixed(d);
function uskGear(cx, cy, r, n, tooth = .17, hole = .34) {
  const a = 2 * Math.PI / n; let d = '';
  for (let i = 0; i < n; i++) {
    const t = i * a;
    [[1 - tooth, -.3], [1, -.17], [1, .17], [1 - tooth, .3]].forEach(([k, o], j) => { d += (i === 0 && j === 0 ? 'M' : 'L') + uskN(cx + r * k * Math.cos(t + o * a)) + ' ' + uskN(cy + r * k * Math.sin(t + o * a)); });
  }
  const h = r * hole; return d + `ZM${uskN(cx + h)} ${uskN(cy)}a${uskN(h)} ${uskN(h)} 0 1 0 ${uskN(-2 * h)} 0a${uskN(h)} ${uskN(h)} 0 1 0 ${uskN(2 * h)} 0Z`;
}
const uskWave = (y, amp, per, w, close) => { let d = `M0 ${y}`; for (let x = 0; x < w; x += per) d += `q${per / 4} ${-amp} ${per / 2} 0t${per / 2} 0`; return d + (close ? `V320H0Z` : ''); };
const uskTw = (i, d = 3) => `class="uk-tw" style="animation-delay:-${uskN((i * .73) % d)}s;animation-duration:${uskN(2 + (i * .37) % 2.5)}s"`;
const uskStars = (n, seed, h, col = '#fff') => { const r = uskRnd(seed); return Array.from({ length: n }, (_, i) => `<circle ${uskTw(i)} cx="${uskN(r() * 400)}" cy="${uskN(r() * h)}" r="${uskN(.4 + r() * 1.1)}" fill="${col}"/>`).join(''); };
// ประกายสี่แฉก (กะพริบ)
const uskSpark = (n, seed, x0, y0, x1, y1, col) => { const r = uskRnd(seed); return Array.from({ length: n }, (_, i) => { const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), q = 2.5 + r() * 3.2, a = q * .22; return `<path ${uskTw(i)} d="M${uskN(x)} ${uskN(y - q)}L${uskN(x + a)} ${uskN(y - a)}L${uskN(x + q)} ${uskN(y)}L${uskN(x + a)} ${uskN(y + a)}L${uskN(x)} ${uskN(y + q)}L${uskN(x - a)} ${uskN(y + a)}L${uskN(x - q)} ${uskN(y)}L${uskN(x - a)} ${uskN(y - a)}Z" fill="${col}"/>`; }).join(''); };
// ลอยขึ้น: 'c' จุดทึบ · 'l' โคมลอย · 'o' ฟองอากาศ
const uskRise = (n, seed, x0, x1, y0, col, rmax = 3, shape = 'c') => { const r = uskRnd(seed); return Array.from({ length: n }, () => { const x = uskN(x0 + r() * (x1 - x0)), y = uskN(y0 + r() * 30), q = uskN(1 + r() * (rmax - 1)), st = `style="animation-delay:-${uskN(r() * 9)}s;animation-duration:${uskN(7 + r() * 7)}s"`;
  return shape === 'l' ? `<g class="uk-rise" ${st}><ellipse cx="${x}" cy="${y}" rx="${q}" ry="${uskN(q * 1.3)}" fill="${col}"/><ellipse cx="${x}" cy="${y}" rx="${uskN(q * 2.4)}" ry="${uskN(q * 3)}" fill="${col}" opacity=".18"/></g>` : shape === 'o' ? `<circle class="uk-rise" ${st} cx="${x}" cy="${y}" r="${q}" fill="none" stroke="${col}" stroke-width="1"/>` : `<circle class="uk-rise" ${st} cx="${x}" cy="${y}" r="${q}" fill="${col}"/>`; }).join(''); };
// หิ่งห้อย: ลอยวนเวียนและกะพริบ
const uskFlies = (n, seed, x0, x1, y0, y1, col) => { const r = uskRnd(seed); return Array.from({ length: n }, () => `<circle class="uk-fly" cx="${uskN(x0 + r() * (x1 - x0))}" cy="${uskN(y0 + r() * (y1 - y0))}" r="${uskN(1.2 + r() * 1.2)}" fill="${col}" style="animation-delay:-${uskN(r() * 8)}s;animation-duration:${uskN(5 + r() * 5)}s"/>`).join(''); };
const SCN = (inner, extra = '') => `<svg class="uh-svg" viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" aria-hidden="true" ${extra}>${inner}</svg>`;

const UNISKIN = {
  /* ───────── จุฬาฯ: ราชสำนัก ลายกนก ซุ้มเรือนแก้ว ชมพู-ทอง บนผ้าไหมสีงาช้าง ───────── */
  chula: {
    font: 'Trirong:wght@500;600;700', ff: "'Trirong','Noto Serif Thai',serif", lay: 'c',
    kick: 'พระเกี้ยวแห่งบัณฑิตวิศวะ', lab: n => 'บทที่ ' + thNum(n), stat: ['ก่อตั้งจุฬาฯ', 'กำเนิดคณะวิศวะ', 'ปีแห่งวิศวะจุฬาฯ'],
    ch: [['พระเกี้ยวและพงศาวดาร', 'จากพระราชปณิธานสู่รั้วจามจุรี'], ['เสาหลักแห่งแผ่นดิน', 'สิ่งที่ทำให้จุฬาฯ ไม่เหมือนที่ไหน'], ['ทำเนียบผู้สถิตในประวัติศาสตร์', 'ผู้วางรากฐานและผู้ร่วมสร้างวิศวะจุฬาฯ'], ['ปริมณฑลแห่งคณะ', 'คณะและหน่วยงานในรั้วจามจุรี'], ['วิศวะจุฬาฯ เกิดขึ้นได้อย่างไร', ''], ['ลำดับพระราชพงศาวดารเวลา', 'จากวันแรกถึงปัจจุบัน']],
    orn: `<svg class="orn" viewBox="0 0 260 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M8 12H92q8 0 12-6 4 8 10 6M252 12H168q-8 0-12-6-4 8-10 6"/><path d="M130 3c5 5 9 8 9 13s-4 7-9 7-9-2-9-7 4-8 9-13z" fill="currentColor" fill-opacity=".22"/><path d="M130 8c2.500 3 4 5 4 8M130 8c-2.500 3-4 5-4 8M119 17q-7-1-9-8M141 17q7-1 9-8"/></g><circle cx="130" cy="14" r="1.600" fill="currentColor"/></svg>`,
    scene() {
      const rays = Array.from({ length: 24 }, (_, i) => { const a = i * 15 * Math.PI / 180; return `<path d="M200 190L${uskN(200 + 420 * Math.cos(a))} ${uskN(190 + 420 * Math.sin(a))}"/>`; }).join('');
      const kan = (s) => `<g class="uk-kan" transform="translate(${s > 0 ? 0 : 400} 0) scale(${s} 1)" fill="none" stroke="#c9962f" stroke-width="1.5" stroke-linecap="round"><path d="M18 304q0-60 22-96t4-84"/><path d="M40 208q-24-4-26-24t14-22 14 12-10 12"/><path d="M36 250q22-6 24-26t-14-20-14 10 8 12"/><path d="M26 288q-20-4-18-22t14-14 10 12-8 10"/><path d="M44 124q18-10 14-30t-18-16"/></g>`;
      return SCN(`<defs><linearGradient id="chA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe6ef"/><stop offset=".7" stop-color="#fff6ee"/><stop offset="1" stop-color="#fffaf3"/></linearGradient><linearGradient id="chB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8b6cb" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
        <rect width="400" height="320" fill="url(#chA)"/><g class="uk-spin uk-slow" style="transform-origin:200px 190px" stroke="#e6c27a" stroke-width=".7" opacity=".55">${rays}</g>
        <path d="M52 320V160Q52 112 132 84Q192 62 200 6Q208 62 268 84Q348 112 348 160V320Z" fill="url(#chB)" stroke="#c9962f" stroke-width="3"/>
        <path class="uk-march" d="M68 320V164Q68 124 138 98Q190 80 200 30Q210 80 262 98Q332 124 332 164V320Z" fill="none" stroke="#d8559a" stroke-width="1.2" stroke-dasharray="2 5"/>
        ${kan(1)}${kan(-1)}
        <g class="uk-sb uk-sway" fill="#f4a8c6" stroke="#c9962f" stroke-width="1"><path d="M200 318c-14-12-30-30-24-48 10 6 20 16 24 30 4-14 14-24 24-30 6 18-10 36-24 48z"/><path d="M140 320c-8-10-16-24-10-38 8 4 14 12 18 22 2-10 8-18 14-22 4 14-6 30-16 38z" opacity=".8"/><path d="M260 320c8-10 16-24 10-38-8 4-14 12-18 22-2-10-8-18-14-22-4 14 6 30 16 38z" opacity=".8"/></g>
        <circle cx="200" cy="30" r="3" fill="#c9962f"/>${uskSpark(16, 3, 40, 20, 360, 300, '#d9a640')}`);
    },
  },

  /* ───────── เกษตรศาสตร์: ผืนดิน สายฝน นาขั้นบันได พระพิรุณ ───────── */
  ku: {
    font: 'Pridi:wght@500;600;700', ff: "'Pridi','Noto Serif Thai',serif", lay: 'l',
    kick: 'จากผืนดินสู่ผู้สร้าง', lab: n => 'ฤดูที่ ' + thNum(n), stat: ['ก่อตั้งมหาวิทยาลัย', 'กำเนิดคณะวิศวะ', 'ปีที่หว่านเมล็ด'],
    ch: [['เมล็ดพันธุ์แรก', 'จุดเริ่มต้นของมหาวิทยาลัยแห่งผืนดิน'], ['รากแก้วที่หยั่งลึก', 'สิ่งที่ทำให้เกษตรศาสตร์ไม่เหมือนที่ไหน'], ['ผู้หว่านและผู้เพาะ', 'คนสำคัญผู้ปลูกฝังวิศวะที่นี่'], ['แปลงแห่งความรู้', 'คณะและหน่วยงานในรั้วนนทรี'], ['วิศวะที่เติบโตจากดิน', ''], ['ฤดูกาลแห่งการเติบโต', 'จากวันแรกถึงปัจจุบัน']],
    orn: `<svg class="orn" viewBox="0 0 260 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M8 18q60-2 100-6M252 18q-60-2-100-6"/><path d="M130 22V6"/><path d="M130 17q-8-1-10-8 8 0 10 8zM130 17q8-1 10-8-8 0-10 8zM130 11q-6-1-7-7 6 0 7 7zM130 11q6-1 7-7-6 0-7 7z" fill="currentColor" fill-opacity=".3"/></g></svg>`,
    scene() {
      const r = uskRnd(7), rain = Array.from({ length: 22 }, () => { const x = uskN(r() * 440 - 20), d = uskN(r() * 3, 1); return `<path class="uk-rain" d="M${x} -20l-6 22" style="animation-delay:-${d}s;animation-duration:${uskN(1.2 + r() * .9, 1)}s"/>`; }).join('');
      const sprouts = [[40, 252], [92, 262], [160, 246], [240, 258], [310, 250], [362, 262], [120, 292], [290, 296]].map(([x, y], i) => `<g class="uk-sb uk-sway" style="animation-delay:-${i * .6}s"><path d="M${x} ${y}v-9M${x} ${y - 4}q-5-1-6-6 5 0 6 6M${x} ${y - 5}q5-1 6-7-5 1-6 7" fill="none" stroke="#7fe3a0" stroke-width="1.2" stroke-linecap="round"/></g>`).join('');
      return SCN(`<defs><linearGradient id="kuA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#08170f"/><stop offset=".55" stop-color="#1c4a2b"/><stop offset="1" stop-color="#5a8f3a"/></linearGradient><radialGradient id="kuG" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#f2d46a" stop-opacity=".75"/><stop offset="1" stop-color="#f2d46a" stop-opacity="0"/></radialGradient></defs>
        <rect width="400" height="320" fill="url(#kuA)"/><circle class="uk-pg" cx="300" cy="196" r="110" fill="url(#kuG)"/>${uskStars(30, 11, 120, '#cfeecf')}
        <path class="uk-breath" d="M0 214q60-26 120-8t130 4 150-14V320H0z" fill="#24602f"/><path class="uk-breath uk-b2" d="M0 238q90-28 170-6t230-8V320H0z" fill="#1c4f27"/><path class="uk-breath uk-b3" d="M0 262q110-26 210-4t190-6V320H0z" fill="#153e1f"/><path d="M0 290q120-22 230-4t170-6V320H0z" fill="#0c2a14"/>
        <path class="uk-march" d="M-10 238q80 12 150 2t140 6 140-8" fill="none" stroke="#9be8c4" stroke-opacity=".5" stroke-width="2"/><path class="uk-march uk-rv" d="M-10 266q90 10 170 0t120 4 140-6" fill="none" stroke="#9be8c4" stroke-opacity=".35" stroke-width="1.6"/>${sprouts}<g class="uk-rainbox" stroke="#bfe9ff" stroke-width="1.100" stroke-linecap="round" opacity=".6">${rain}</g>${uskFlies(11, 9, 20, 380, 190, 300, '#f4f79a')}`);
    },
  },

  /* ───────── สงขลานครินทร์: ทะเลใต้ คลื่น เข็มทิศ ประภาคาร ───────── */
  psu: {
    font: 'Prompt:wght@500;600;700', ff: "'Prompt','Noto Sans Thai',sans-serif", lay: 'c',
    kick: 'จากอ่าวสงขลาสู่โลกกว้าง', lab: n => 'ท่าเรือที่ ' + thNum(n), stat: ['ก่อตั้งมหาวิทยาลัย', 'กำเนิดคณะวิศวะ', 'ปีที่ออกเรือ'],
    ch: [['ลมมรสุมแรก', 'จุดเริ่มต้นของมหาวิทยาลัยแห่งภาคใต้'], ['เข็มทิศนำทาง', 'สิ่งที่ทำให้ มอ. ไม่เหมือนที่ไหน'], ['กัปตันและลูกเรือ', 'ผู้นำทางและผู้ร่วมเดินเรือสร้างวิศวะที่นี่'], ['กองเรือทั้งหมด', 'คณะและหน่วยงานของ มอ.'], ['วิศวะบนฝั่งอันดามัน-สงขลา', ''], ['บันทึกการเดินเรือ', 'จากวันแรกถึงปัจจุบัน']],
    orn: `<svg class="orn" viewBox="0 0 260 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M6 14q10-8 20 0t20 0 20 0 20 0 20 0M254 14q-10-8-20 0t-20 0-20 0-20 0-20 0"/><circle cx="130" cy="9" r="3"/><path d="M130 12v10M122 17q8 8 16 0M125 15h10"/></g></svg>`,
    scene() {
      const compass = `<g class="uk-spin" style="transform-origin:78px 98px" fill="none" stroke="#bfe6ff" stroke-opacity=".5" stroke-width="1"><circle cx="78" cy="98" r="52"/><circle cx="78" cy="98" r="40" stroke-dasharray="2 4"/><path d="M78 40l6 52 -6 6 -6-6zM78 156l6-52-6-6-6 6zM20 98l52-6 6 6-6 6zM136 98l-52-6-6 6 6 6z" fill="#bfe6ff" fill-opacity=".18"/></g>`;
      return SCN(`<defs><linearGradient id="psA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#091e4a"/><stop offset=".55" stop-color="#13609a"/><stop offset="1" stop-color="#1bb0b4"/></linearGradient><radialGradient id="psG" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".85"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></radialGradient><linearGradient id="psB" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#fff6c8" stop-opacity=".9"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></linearGradient></defs>
        <rect width="400" height="320" fill="url(#psA)"/><circle class="uk-pg" cx="296" cy="112" r="86" fill="url(#psG)"/><circle cx="296" cy="112" r="30" fill="#fff3c4"/>${uskStars(26, 5, 90, '#dff3ff')}${compass}
        <g transform="translate(346 150)"><path d="M-9 100l4-70h10l4 70z" fill="#f3f7fb"/><path d="M-7 62h14l1 8h-16zM-6 38h12l1 9h-14z" fill="#e0452d"/><path d="M-10 28h20l-4-9h-12z" fill="#33415a"/><rect x="-5" y="14" width="10" height="7" fill="#ffe27a"/><path d="M-4 14l4-8 4 8z" fill="#33415a"/></g><path class="uk-beam" d="M346 164L70 118L70 210Z" fill="url(#psB)" style="transform-origin:346px 164px"/><g transform="translate(40 204)"><g class="uk-boatx"><g class="uk-bob"><path d="M0 8h34l-6 9H6z" fill="#0b1c3a"/><path d="M17 8V-14l14 18z" fill="#f3f7fb"/><path d="M15 8V-8l-11 14z" fill="#d8e6f3"/></g></g></g>
        <path class="uk-w uk-w1" d="${uskWave(214, 9, 70, 760, true)}" fill="#1a78b4" fill-opacity=".55"/><path class="uk-w uk-w2" d="${uskWave(238, 11, 90, 760, true)}" fill="#0f5f98" fill-opacity=".75"/><path class="uk-w uk-w3" d="${uskWave(266, 13, 110, 760, true)}" fill="#0a3f78"/>`);
    },
  },

  /* ───────── ขอนแก่น: ผ้าไหมขิต ลายสอง พระธาตุพนม สีดินแดง-คราม ───────── */
  kku: {
    font: 'Mitr:wght@400;500;600', ff: "'Mitr','Noto Sans Thai',sans-serif", lay: 'c',
    kick: 'ลายผ้าไหมแห่งอีสาน', lab: n => 'ลายที่ ' + thNum(n), stat: ['ก่อตั้งมหาวิทยาลัย', 'กำเนิดคณะวิศวะ', 'ปีที่ทอผืนแรก'],
    ch: [['เส้นไหมเส้นแรก', 'จุดเริ่มต้นของมหาวิทยาลัยในใจกลางอีสาน'], ['ลวดลายแห่งความโดดเด่น', 'สิ่งที่ทำให้ มข. ไม่เหมือนที่ไหน'], ['ช่างทอผู้วางลาย', 'ผู้ริเริ่มและผู้ร่วมทอวิศวะที่นี่'], ['ผืนผ้าทั้งผืน', 'คณะและหน่วยงานของ มข.'], ['วิศวะบนผืนดินอีสาน', ''], ['ลายเวลาที่ทอต่อเนื่อง', 'จากวันแรกถึงปัจจุบัน']],
    orn: `<svg class="orn" viewBox="0 0 260 20" aria-hidden="true"><g fill="currentColor">${Array.from({ length: 13 }, (_, i) => `<path ${uskTw(i)} d="M${10 + i * 20} 10l7-7 7 7-7 7z"/>`).join('')}</g></svg>`,
    scene() {
      const khit = `<pattern id="kkP" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M14 2l12 12-12 12L2 14z" fill="none" stroke="#e8a62a" stroke-width="1.600"/><path d="M14 8l6 6-6 6-6-6z" fill="#e8a62a"/><path d="M0 14h2M26 14h2M14 0v2M14 26v2" stroke="#e8a62a" stroke-width="1.600"/><animateTransform attributeName="patternTransform" type="translate" from="0 0" to="28 0" dur="7s" repeatCount="indefinite"/></pattern><pattern id="kkQ" width="14" height="14" patternUnits="userSpaceOnUse"><path d="M7 1l6 6-6 6-6-6z" fill="#5c6bd0"/></pattern>`;
      const stupa = `<g transform="translate(200 56)"><path d="M0 0v18M-3 18h6" stroke="#f2c14e" stroke-width="2.400"/><path d="M0 18l9 16h-18z" fill="#f2c14e"/><path d="M-11 34l11-6 11 6v16h-22z" fill="#e8a62a"/><path d="M-20 50h40l-5 20h-30z" fill="#f2c14e"/><path d="M-30 70h60l-6 28h-48z" fill="#e8a62a"/><path d="M-42 98h84l-8 40h-68z" fill="#f2c14e"/><path d="M-56 138h112l-8 56h-96z" fill="#e8a62a"/><path d="M-4 150h8v44h-8z" fill="#7a2a1c"/><g stroke="#7a2a1c" stroke-width="1" opacity=".5"><path d="M-30 80h60M-40 112h80M-50 160h100"/></g></g>`;
      return SCN(`<defs>${khit}<radialGradient id="kkG" cx=".5" cy=".55" r=".5"><stop offset="0" stop-color="#ffcf6a" stop-opacity=".55"/><stop offset="1" stop-color="#ffcf6a" stop-opacity="0"/></radialGradient></defs>
        <rect width="400" height="320" fill="#4b1417"/><rect y="0" width="400" height="30" fill="url(#kkP)" opacity=".9"/><rect y="30" width="400" height="5" fill="#2b3368"/><rect y="36" width="400" height="2" fill="#e8a62a"/>
        <rect y="282" width="400" height="38" fill="url(#kkP)" opacity=".9"/><rect y="276" width="400" height="5" fill="#2b3368"/><rect y="274" width="400" height="2" fill="#e8a62a"/>
        <rect x="0" y="40" width="400" height="232" fill="url(#kkQ)" opacity=".1"/><circle class="uk-pg" cx="200" cy="170" r="150" fill="url(#kkG)"/><g class="uk-pg2">${stupa}</g>${uskSpark(18, 8, 30, 50, 370, 270, '#f2c14e')}
        <g fill="#e8a62a" opacity=".5"><rect x="20" y="60" width="4" height="200"/><rect x="376" y="60" width="4" height="200"/></g>`);
    },
  },

  /* ───────── เชียงใหม่: ล้านนา ขุนเขาเหนือหมอก เจดีย์ทองบนดอย ───────── */
  cmu: {
    font: 'Maitree:wght@500;600;700', ff: "'Maitree','Noto Serif Thai',serif", lay: 'c',
    kick: 'ล้านนาเหนือม่านหมอก', lab: n => 'ขุนเขาที่ ' + thNum(n), stat: ['ก่อตั้งมหาวิทยาลัย', 'กำเนิดคณะวิศวะ', 'ปีบนดอย'],
    ch: [['ตำนานเหนือม่านหมอก', 'จุดเริ่มต้นของมหาวิทยาลัยแห่งล้านนา'], ['ยอดดอยแห่งความโดดเด่น', 'สิ่งที่ทำให้ มช. ไม่เหมือนที่ไหน'], ['ผู้นำทางขึ้นดอย', 'ผู้วางรากฐานและผู้ร่วมสร้างวิศวะที่นี่'], ['หุบเขาแห่งคณะ', 'คณะและหน่วยงานของ มช.'], ['วิศวะที่เชิงดอยสุเทพ', ''], ['เส้นทางขึ้นสู่ยอดดอย', 'จากวันแรกถึงปัจจุบัน']],
    orn: `<svg class="orn" viewBox="0 0 260 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M8 18h86q10 0 14-8M252 18h-86q-10 0-14-8"/><path d="M130 22c-9-3-11-11-5-16 1 4 4 5 5 3-2-4 0-8 4-11 0 5 4 7 4 12 2-1 3-3 3-5 4 7 0 14-11 17z" fill="currentColor" fill-opacity=".25"/></g></svg>`,
    scene() {
      return SCN(`<defs><linearGradient id="cmA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#150a33"/><stop offset=".5" stop-color="#4b2590"/><stop offset="1" stop-color="#d78fbd"/></linearGradient><linearGradient id="cmM" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#f1e4ff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
        <rect width="400" height="320" fill="url(#cmA)"/>${uskStars(46, 21, 150, '#fff')}<circle class="uk-pg" cx="304" cy="62" r="46" fill="#fff4cf" opacity=".2"/><path d="M300 40a24 24 0 1 0 12 44 19 19 0 1 1-12-44z" fill="#fff4cf"/>
        <g transform="translate(0 46)"><path d="M0 180l60-40 50 28 70-62 60 52 50-34 110 56V320H0z" fill="#5d3399"/>
        <circle class="uk-pg" cx="290" cy="104" r="24" fill="#f2c14e" opacity=".25"/><g transform="translate(290 105) scale(.9)"><path d="M0 0v-14M-3-14h6" stroke="#f2c14e" stroke-width="2"/><path d="M0-14l7 14h-14z M-9 0h18l-3 9h-12z M-12 9h24l-3 10h-18z" fill="#f2c14e"/></g>
        </g><path d="M0 216l50-36 60 30 80-56 70 44 60-26 80 40V320H0z" fill="#3b1d70"/><path class="uk-mist" d="M-100 204h600v22h-600z" fill="url(#cmM)"/>
        <path d="M0 250l70-30 70 22 80-34 90 30 90-20V320H0z" fill="#25104f"/><path class="uk-mist uk-mist2" d="M-100 248h600v20h-600z" fill="url(#cmM)"/>
        <path d="M0 286l90-22 100 18 110-20 100 14V320H0z" fill="#150a33"/>${uskRise(10, 4, 20, 380, 292, '#ffd27a', 3.2, 'l')}
        <g fill="#150a33"><path d="M60 286l8-26 8 26z"/><path d="M80 288l6-20 6 20z"/><path d="M330 284l8-24 8 24z"/><path d="M352 286l6-18 6 18z"/></g>`);
    },
  },

  /* ───────── มจธ.: แบบแปลน-เกียร์ แม่น้ำเจ้าพระยา โรงงานแห่งอนาคต (ส้ม-เหลืองบนน้ำตาลเข้ม) ───────── */
  kmutt: {
    font: 'Bai+Jamjuree:wght@500;600;700', ff: "'Bai Jamjuree','Noto Sans Thai',sans-serif", lay: 'l',
    kick: 'BLUEPRINT · ธนบุรี', lab: n => 'ขั้นที่ ' + thNum(n), stat: ['ก่อตั้ง', 'กำเนิดวิศวะ', 'ปีแห่งการสร้าง'],
    ch: [['แบบร่างแรก', 'จุดเริ่มต้นของสถาบันแห่งเทคโนโลยี'], ['ชิ้นส่วนหลัก', 'สิ่งที่ทำให้ มจธ. ไม่เหมือนที่ไหน'], ['วิศวกรผู้ออกแบบ', 'ผู้วางโครงและผู้ร่วมสร้างวิศวะที่นี่'], ['แผนผังหน่วยงาน', 'คณะและหน่วยงานของ มจธ.'], ['วิศวะที่ถูกสร้างขึ้น', ''], ['บันทึกการก่อสร้าง', 'จากวันแรกถึงปัจจุบัน']],
    orn: `<svg class="orn" viewBox="0 0 260 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.300" stroke-linecap="round"><path d="M6 12h104M150 12h104M6 6v12M254 6v12"/><path d="M12 12l6-4v8zM248 12l-6-4v8z" fill="currentColor"/><path d="${uskGear(130, 12, 9, 8, .22, .38)}" fill="currentColor" fill-opacity=".25" fill-rule="evenodd"/></g></svg>`,
    scene() {
      const grid = `<pattern id="mtG" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#f59e0b" stroke-opacity=".13" stroke-width=".8"/></pattern><pattern id="mtH" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M100 0H0V100" fill="none" stroke="#f59e0b" stroke-opacity=".22" stroke-width="1"/></pattern><linearGradient id="mtS" x1="0" x2="1"><stop offset="0" stop-color="#fde047" stop-opacity="0"/><stop offset="1" stop-color="#fde047" stop-opacity=".24"/></linearGradient>`;
      return SCN(`<defs>${grid}</defs><rect width="400" height="320" fill="#1a1612"/><rect width="400" height="320" fill="url(#mtG)"/><rect width="400" height="320" fill="url(#mtH)"/><rect class="uk-scan" x="-70" y="0" width="70" height="320" fill="url(#mtS)"/>
        <g class="uk-spin" style="transform-origin:318px 118px"><path d="${uskGear(318, 118, 84, 18)}" fill="#f59e0b" fill-opacity=".14" stroke="#f59e0b" stroke-width="1.5" fill-rule="evenodd"/></g>
        <g class="uk-spin uk-rev" style="transform-origin:196px 214px"><path d="${uskGear(196, 214, 54, 12)}" fill="#fde047" fill-opacity=".12" stroke="#fde047" stroke-width="1.4" fill-rule="evenodd"/></g>
        <g class="uk-spin" style="transform-origin:60px 270px"><path d="${uskGear(60, 270, 38, 9)}" fill="#f59e0b" fill-opacity=".12" stroke="#f59e0b" stroke-width="1.3" fill-rule="evenodd"/></g>
        <g stroke="#fde047" stroke-opacity=".7" stroke-width="1" fill="#fde047" font-family="ui-monospace,Menlo,monospace" font-size="8"><path d="M232 44h172M232 40v8M404 40v8"/><path d="M236 44l6-3v6zM400 44l-6-3v6z"/><text class="uk-blink" x="290" y="38" stroke="none">Ø 168</text><path d="M14 150v110M10 150h8M10 260h8"/><text class="uk-blink" x="22" y="212" stroke="none" transform="rotate(-90 22 212)">R 54</text></g>
        <path class="uk-w4" d="${uskWave(300, 8, 100, 720, true)}" fill="#f59e0b" fill-opacity=".18"/><path class="uk-w5" d="${uskWave(310, 7, 80, 720)}" fill="none" stroke="#f59e0b" stroke-opacity=".5"/>${uskRise(12, 6, 30, 380, 300, '#fde047', 1.8)}`);
    },
  },

  /* ───────── สจล.: วงจรอิเล็กทรอนิกส์ บนพื้นขาว-ส้ม วงโคจรดาวเทียม ───────── */
  kmitl: {
    font: 'Chakra+Petch:wght@500;600;700', ff: "'Chakra Petch','Noto Sans Thai',sans-serif", lay: 'l',
    kick: 'CIRCUIT · ลาดกระบัง', lab: n => 'โมดูล ' + String(n).padStart(2, '0'), stat: ['ก่อตั้ง', 'กำเนิดวิศวะ', 'ปีที่รันระบบ'],
    ch: [['บูตระบบ', 'จุดเริ่มต้นของสถาบันแห่งเทคโนโลยี'], ['แกนหลักของระบบ', 'สิ่งที่ทำให้ สจล. ไม่เหมือนที่ไหน'], ['ผู้เขียนโปรแกรมแรก', 'ผู้ริเริ่มและผู้ร่วมสร้างวิศวะที่นี่'], ['แผงวงจรทั้งหมด', 'คณะและหน่วยงานของ สจล.'], ['วิศวะที่ถูกประกอบขึ้น', ''], ['ล็อกการทำงาน', 'จากวันแรกถึงปัจจุบัน']],
    orn: `<svg class="orn" viewBox="0 0 260 22" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 11h74l8-7h24M254 11h-74l-8 7h-24"/><rect x="118" y="5" width="24" height="12" rx="2" fill="currentColor" fill-opacity=".18"/></g><g fill="currentColor"><circle cx="112" cy="4" r="2.200"/><circle cx="148" cy="18" r="2.200"/><circle cx="6" cy="11" r="2"/><circle cx="254" cy="11" r="2"/></g></svg>`,
    scene() {
      const tr = ['M20 40H120L150 70H300', 'M380 96H300L270 126H150L120 156H40', 'M60 250H170L200 220H340L360 240', 'M30 190H90L120 220', 'M250 60V20H390', 'M320 300V250L350 220H392', 'M180 300V270L210 240', 'M110 106V76', 'M360 160H290'];
      const pads = [[20, 40], [300, 70], [380, 96], [40, 156], [60, 250], [360, 240], [30, 190], [390, 20], [392, 220], [180, 300], [320, 300], [110, 76], [360, 160], [290, 160]];
      return SCN(`<defs><linearGradient id="miA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#ffe9d6"/></linearGradient></defs>
        <rect width="400" height="320" fill="url(#miA)"/>
        <g fill="none" stroke="#e8590c" stroke-opacity=".38" stroke-width="2.200" stroke-linejoin="round">${tr.map(d => `<path d="${d}"/>`).join('')}</g>
        <g fill="none" stroke="#ff8a3d" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round">${tr.slice(0, 6).map((d, i) => `<path class="uk-pulse" d="${d}" style="animation-delay:-${i * .7}s"/>`).join('')}</g>
        <g fill="#fff" stroke="#e8590c" stroke-width="2">${pads.map(([x, y], i) => `<circle ${uskTw(i)} cx="${x}" cy="${y}" r="4.500"/>`).join('')}${tr.slice(0, 6).map((d, i) => `<rect x="-3.5" y="-3.5" width="7" height="7" rx="1.500" fill="#e8590c"><animateMotion dur="${4 + i}s" begin="-${i}s" repeatCount="indefinite" path="${d}"/></rect>`).join('')}</g>
        <g class="uk-pg2" fill="#fff3e8" stroke="#e8590c" stroke-width="1.500"><rect x="296" y="196" width="64" height="52" rx="4"/><path d="M308 196v-8M324 196v-8M340 196v-8M308 248v8M324 248v8M340 248v8M296 210h-8M296 226h-8M360 210h8M360 226h8"/><path d="M304 204l8 0" /></g><text x="308" y="226" font-family="ui-monospace,Menlo,monospace" font-size="10" fill="#e8590c">MCU</text>
        <g transform="rotate(-24 90 120)"><ellipse cx="90" cy="120" rx="70" ry="22" fill="none" stroke="#e8590c" stroke-opacity=".4" stroke-dasharray="3 5"/><circle r="4.500" fill="#e8590c"><animateMotion dur="7s" repeatCount="indefinite" path="M20 120a70 22 0 1 0 140 0a70 22 0 1 0 -140 0"/></circle></g><circle class="uk-pg" cx="90" cy="120" r="9" fill="#ffcf9e" stroke="#e8590c"/>`);
    },
  },

  /* ───────── มจพ.: โปสเตอร์เหล็กกล้า ดำ-ส้มแดง ลายเชฟรอน ตัวอักษรหนัก ───────── */
  kmutnb: {
    font: 'Kanit:wght@500;700;800', ff: "'Kanit','Noto Sans Thai',sans-serif", lay: 'l',
    kick: 'STEEL · พระนครเหนือ', lab: n => 'แท่นที่ ' + thNum(n), stat: ['ก่อตั้ง', 'กำเนิดวิศวะ', 'ปีที่ตีเหล็ก'],
    ch: [['ตีเหล็กครั้งแรก', 'จุดเริ่มต้นของสถาบันสายช่าง'], ['แกนเหล็กกล้า', 'สิ่งที่ทำให้ มจพ. ไม่เหมือนที่ไหน'], ['ช่างใหญ่', 'ผู้วางรากฐานและผู้ร่วมสร้างวิศวะที่นี่'], ['โรงงานทั้งหมด', 'คณะและหน่วยงานของ มจพ.'], ['วิศวะที่หล่อขึ้นมา', ''], ['บันทึกหน้างาน', 'จากวันแรกถึงปัจจุบัน']],
    orn: `<svg class="orn" viewBox="0 0 260 20" aria-hidden="true"><g fill="currentColor"><path d="M0 4h112v12H0z" opacity=".25"/>${[0, 1, 2, 3].map(i => `<path d="M${122 + i * 4} 2l12 8-12 8h-5l12-8-12-8z" opacity="${.35 + i * .2}"/>`).join('')}<path d="M148 4h112v12H148z" opacity=".25"/></g></svg>`,
    scene() {
      const ch = Array.from({ length: 11 }, (_, i) => `<path d="M${-122 + i * 62} 330l70-90h30l-70 90z" fill="#ff5a1f" opacity="${i % 2 ? .95 : .55}"/>`).join('');
      return SCN(`<defs><linearGradient id="mnA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#24242a"/><stop offset="1" stop-color="#0a0a0c"/></linearGradient></defs>
        <rect width="400" height="320" fill="url(#mnA)"/><g stroke="#fff" stroke-opacity=".05">${Array.from({ length: 12 }, (_, i) => `<path d="M${i * 40} 0v320"/>`).join('')}</g>
        <g class="uk-spin" style="transform-origin:360px 40px"><path d="${uskGear(360, 40, 100, 16, .14, .5)}" fill="none" stroke="#ff5a1f" stroke-opacity=".45" stroke-width="3" fill-rule="evenodd"/></g>
        <g class="uk-slide62">${ch}</g>${uskRise(14, 5, 20, 380, 236, '#ff8a3d', 2.2)}<path d="M0 238h400" stroke="#ff5a1f" stroke-width="3"/>
        <g fill="#8a8a92" stroke="#2a2a30">${[[14, 14], [386, 14], [14, 306], [386, 306]].map(([x, y]) => `<circle ${uskTw(x)} cx="${x}" cy="${y}" r="5"/><path d="M${x - 3} ${y}h6" stroke="#2a2a30"/>`).join('')}</g>`);
    },
  },

  /* ───────── ธรรมศาสตร์: หนังสือพิมพ์/แถลงการณ์ ตึกโดม ธรรมจักร แดง-เหลืองบนกระดาษ ───────── */
  tu: {
    font: 'Taviraj:wght@500;600;700', ff: "'Taviraj','Noto Serif Thai',serif", lay: 'c',
    kick: 'ฉบับพิเศษ · ท่าพระจันทร์', lab: n => 'มาตรา ' + thNum(n), stat: ['ก่อตั้งมหาวิทยาลัย', 'กำเนิดคณะวิศวะ', 'ปีแห่งการเปลี่ยนแปลง'],
    ch: [['ปฐมบท: มหาวิทยาลัยของประชาชน', 'จุดเริ่มต้นของธรรมศาสตร์และการเมือง'], ['หลักการและความโดดเด่น', 'สิ่งที่ทำให้ ม.ธรรมศาสตร์ไม่เหมือนที่ไหน'], ['ผู้ร่วมลงนามประวัติศาสตร์', 'ผู้ริเริ่มและผู้ร่วมสร้างวิศวะที่นี่'], ['หมวดว่าด้วยคณะ', 'คณะและหน่วยงานของธรรมศาสตร์'], ['วิศวะ มธ. ปรากฏขึ้นอย่างไร', ''], ['บันทึกเหตุการณ์', 'จากวันแรกถึงปัจจุบัน']],
    orn: `<svg class="orn" viewBox="0 0 260 14" aria-hidden="true"><g fill="none" stroke="currentColor"><path d="M0 4h108M152 4h108" stroke-width="2.600"/><path d="M0 9h108M152 9h108" stroke-width=".9"/></g><g fill="currentColor" stroke="none"><circle cx="130" cy="7" r="5"/>${Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4; return `<path d="M${uskN(130 + 5 * Math.cos(a))} ${uskN(7 + 5 * Math.sin(a))}l${uskN(3 * Math.cos(a))} ${uskN(3 * Math.sin(a))}" stroke="currentColor" stroke-width="1.600"/>`; }).join('')}</g><circle cx="130" cy="7" r="2" fill="#f6efe0"/></svg>`,
    scene() {
      const spokes = Array.from({ length: 16 }, (_, i) => { const a = i * Math.PI / 8; return `<path d="M200 130L${uskN(200 + 112 * Math.cos(a))} ${uskN(130 + 112 * Math.sin(a))}"/>`; }).join('');
      const dots = `<pattern id="tuH" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.100" fill="#2b1a14"/></pattern>`;
      return SCN(`<defs>${dots}<linearGradient id="tuF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b1a14" stop-opacity="0"/><stop offset="1" stop-color="#2b1a14" stop-opacity=".55"/></linearGradient></defs>
        <rect width="400" height="320" fill="#f3ead6"/><rect width="400" height="320" fill="url(#tuH)" opacity=".07"/>
        <g class="uk-spin" style="transform-origin:200px 130px" fill="none" stroke="#c8102e" stroke-opacity=".28" stroke-width="1.400"><circle cx="200" cy="130" r="118"/><circle cx="200" cy="130" r="92" stroke-dasharray="3 6"/><circle cx="200" cy="130" r="16"/>${spokes}</g>
        <g fill="#2b1a14"><path d="M0 320V262h74v-8h20v-20h18v-16h14v-22l8-10 8 10v22h20v-14h40v14h20v-22l8-10 8 10v22h14v16h18v20h20v8h74v58z"/></g>
        <g fill="#f6dd8a">${[[104, 248], [140, 248], [236, 248], [272, 248], [170, 232], [218, 232]].map(([x, y], i) => `<path ${uskTw(i + 2)} d="M${x} ${y + 22}v-12q0-8 6-8t6 8v12z"/>`).join('')}<path d="M194 222v-14q0-9 6-9t6 9v14z"/><circle cx="200" cy="190" r="6"/></g>
        <rect y="150" width="400" height="170" fill="url(#tuF)"/>${[[44, 26, 0], [78, 34, -10], [26, 44, -20]].map(([y, d, dl]) => `<g transform="translate(0 ${y})"><g class="uk-cross" style="animation-duration:${d}s;animation-delay:${dl}s"><path class="uk-flap" d="M0 0q5-7 10 0q5-7 10 0" fill="none" stroke="#2b1a14" stroke-width="1.700" stroke-linecap="round"/></g></g>`).join('')}`);
    },
  },

  /* ───────── มหิดล: เวชศาสตร์/ชีวิต ดีเอ็นเอ คลื่นหัวใจ น้ำเงินกรมท่า-แดงชีพจร ───────── */
  mu: {
    font: 'IBM+Plex+Sans+Thai:wght@400;500;600;700', ff: "'IBM Plex Sans Thai','Noto Sans Thai',sans-serif", lay: 'l',
    kick: 'REPORT · ศาลายา-ศิริราช', lab: n => 'รายงานที่ ' + thNum(n), stat: ['ก่อตั้งมหาวิทยาลัย', 'กำเนิดคณะวิศวะ', 'ปีแห่งการค้นคว้า'],
    ch: [['ประวัติผู้ป่วยรายแรก', 'จุดเริ่มต้นของมหาวิทยาลัยแห่งการแพทย์'], ['ผลตรวจเด่นชัด', 'สิ่งที่ทำให้มหิดลไม่เหมือนที่ไหน'], ['ทีมแพทย์ผู้บุกเบิก', 'ผู้วางรากฐานและผู้ร่วมสร้างวิศวะที่นี่'], ['แผนกทั้งหมด', 'คณะและหน่วยงานของมหิดล'], ['วิศวะที่เกิดจากชีวิต', ''], ['บันทึกการรักษา', 'จากวันแรกถึงปัจจุบัน']],
    orn: `<svg class="orn" viewBox="0 0 260 24" aria-hidden="true"><path d="M4 12h88l6-3 4 3h8l5-10 7 20 5-10h8l4-3 6 3h112" fill="none" stroke="currentColor" stroke-width="1.600" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    scene() {
      let a = '', b = '', rungs = ''; const A = 34, K = 64 / (2 * Math.PI);
      for (let y = -64; y <= 400; y += 4) { a += (y === -64 ? 'M' : 'L') + uskN(A * Math.sin(y / K)) + ' ' + y; b += (y === -64 ? 'M' : 'L') + uskN(-A * Math.sin(y / K)) + ' ' + y; }
      for (let y = -64; y <= 400; y += 8) { const x = A * Math.sin(y / K); rungs += `<path d="M${uskN(x)} ${y}L${uskN(-x)} ${y}" opacity="${uskN(.25 + .5 * Math.abs(Math.cos(y / K)), 2)}"/>`; }
      const beat = 'h18q4-7 8 0h8l4 6 6-48 6 58 4-16h10q6-10 12 0h14';
      return SCN(`<defs><linearGradient id="muA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#091a47"/><stop offset="1" stop-color="#1c3f9a"/></linearGradient><linearGradient id="muS" x1="0" x2="1"><stop offset="0" stop-color="#7fa6ff" stop-opacity="0"/><stop offset="1" stop-color="#7fa6ff" stop-opacity=".26"/></linearGradient></defs>
        <rect width="400" height="320" fill="url(#muA)"/><g stroke="#fff" stroke-opacity=".06">${Array.from({ length: 11 }, (_, i) => `<path d="M0 ${i * 32}h400M${i * 40} 0v320"/>`).join('')}</g>
        <g transform="translate(340 0)"><g class="uk-dna" fill="none" stroke-width="2.200" stroke-linecap="round"><path d="${a}" stroke="#7fa6ff"/><path d="${b}" stroke="#ff7a68"/><g stroke="#cfe0ff" stroke-width="1.200">${rungs}</g></g></g>
        <path class="uk-ecg-bg" d="M0 214${beat}${beat}${beat}${beat}${beat}" fill="none" stroke="#ff7a68" stroke-opacity=".28" stroke-width="2"/><path class="uk-ecg" d="M0 214${beat}${beat}${beat}${beat}${beat}" fill="none" stroke="#ff8f7e" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round" pathLength="100"/>
        <g class="uk-pg2" fill="#fff" fill-opacity=".09"><path d="M52 40h22v22h22v22H74v22H52V84H30V62h22z"/></g>${[0, 1, 2].map(i => `<circle class="uk-ring" style="animation-delay:-${i * 1.2}s" cx="63" cy="73" r="20" fill="none" stroke="#ff8f7e" stroke-width="1.500"/>`).join('')}<rect class="uk-scan" x="-70" y="0" width="70" height="320" fill="url(#muS)"/>${uskRise(14, 9, 20, 320, 306, '#9fc0ff', 4, 'o')}`);
    },
  },
};

// ภาพเสริมในฮีโร่ที่ต่างกันตามมหาวิทยาลัย (วางไว้ใต้ตราและหัวเรื่อง)
const UNIDECO = {
  tu: (I, E) => `<div class="uk-mast"><span>เล่มที่ ${thNum((String(E.born).match(/\d{4}/) || ['๐'])[0])}</span><i></i><span>ฉบับพิเศษ</span><i></i><span>ราคา ความรู้</span></div>`,
  kmutt: () => `<div class="uk-tb"><span>DWG NO. ๐๑</span><span>SCALE 1:1</span><span>REV. A</span></div>`,
  kmitl: () => `<div class="uk-term"><span>&gt;</span> boot --university <b>kmitl</b><i></i></div>`,
  mu: () => `<div class="uk-chart"><span>แฟ้มประวัติ</span><span>แผนก: วิศวกรรมศาสตร์</span><span class="ok">● สถานะ: ปกติ</span></div>`,
  kmutnb: (I, E) => `<div class="uk-est" aria-hidden="true">${thNum((String(E.born).match(/\d{4}/) || [''])[0])}</div>`,
};

// โหลดฟอนต์เฉพาะของมหาวิทยาลัยนั้น ๆ เมื่อเปิดหน้า (ไม่โหลดล่วงหน้าเพื่อประหยัดเน็ต; ออฟไลน์จะใช้ฟอนต์สำรอง)
function uniFont(sk) {
  if (!sk || !sk.font) return; const id = 'ukf-' + sk.font.split(':')[0].replace(/\W/g, '');
  if (document.getElementById(id)) return;
  const l = document.createElement('link'); l.id = id; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=' + sk.font + '&display=swap'; document.head.appendChild(l);
}
