'use strict';
/* ====================== helpers & storage ====================== */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/* ตัวห้อย/ตัวยกจริง: E_k, x_{ab}, ₀-₉, ², ^2 → <sub>/<sup> (ใช้กับข้อความเนื้อหาเท่านั้น ไม่ใช้กับ attribute) */
const SUBM = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9', '₊': '+', '₋': '−', '₌': '=', '₍': '(', '₎': ')', 'ₐ': 'a', 'ₑ': 'e', 'ₒ': 'o', 'ₓ': 'x', 'ₕ': 'h', 'ₖ': 'k', 'ₗ': 'l', 'ₘ': 'm', 'ₙ': 'n', 'ₚ': 'p', 'ₛ': 's', 'ₜ': 't', 'ᵢ': 'i', 'ⱼ': 'j' };
const SUPM = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁺': '+', '⁻': '−', '⁼': '=', '⁽': '(', '⁾': ')', 'ⁿ': 'n', 'ⁱ': 'i' };
const uni = h => String(h ?? '')
  .replace(/[₀-₉₊₋₌₍₎ₐₑₒₓₕₖₗₘₙₚₛₜᵢⱼ]+/g, m => '<sub>' + [...m].map(c => SUBM[c] || c).join('') + '</sub>')
  .replace(/[⁰¹²³⁴-⁹⁺⁻⁼⁽⁾ⁿⁱ]+/g, m => '<sup>' + [...m].map(c => SUPM[c] || c).join('') + '</sup>');
const rt = s => uni(esc(s).replace(/\\_/g, '\u0001')
  .replace(/([A-Za-z0-9\u0370-\u03ff\)\]])_\{([^}]+)\}/g, '$1<sub>$2</sub>')
  .replace(/([A-Za-z0-9\u0370-\u03ff\)\]])_([a-z]+|[0-9]+|[A-Z]{1,2}|[\u0E00-\u0E7F]+)/g, '$1<sub>$2</sub>')
  .replace(/\^[{(]([^})]+)[})]/g, '<sup>$1</sup>')
  .replace(/\^(-?[0-9A-Za-z\u0370-\u03ff]+)/g, '<sup>$1</sup>')).replace(/\u0001/g, '_');
const nl = s => rt(s).replace(/\n/g, '<br>');
// ตัวเลือกที่เป็นภาพ SVG (เฉพาะโจทย์ที่มากับแอป) แสดงเป็น HTML ดิบ; ที่เหลือ escape เสมอ
const isFig = s => typeof s === 'string' && s.startsWith('<svg');
const chHtml = c => isFig(c) ? c : rt(c);
const chLabel = (q, i) => LETTERS[i] + (isFig(q.c[i]) ? '' : '. ' + rt(q.c[i]));
// โจทย์ตอบเป็นตัวเลข (q.type === 'num', เฉลย q.ans ยอมคลาดเคลื่อน q.tol) เหมือน 5 ข้อท้ายของ A-Level จริง
const isNum = q => q.type === 'num';
const isRight = (q, v) => isNum(q) ? (v !== undefined && v !== null && v !== '' && Math.abs(+v - q.ans) <= (q.tol == null ? 1e-9 : q.tol)) : v === q.a;
const showAns = (q, v) => isNum(q) ? rt(String(v)) + (q.unit ? ' ' + rt(q.unit) : '') : chLabel(q, v);
const rightTxt = q => isNum(q) ? rt(String(q.ans)) + (q.unit ? ' ' + rt(q.unit) : '') : chLabel(q, q.a);
const numBox = (q, picked, shown) => `<div class="numbox"><label><span>ตอบเป็นตัวเลข${q.unit ? ' (หน่วย ' + esc(q.unit) + ')' : ''}${q.hint ? ' — ' + esc(q.hint) : ''}</span><input type="number" step="any" inputmode="decimal" id="numans" data-input="num" value="${picked != null ? esc(String(picked)) : ''}" ${shown ? 'disabled' : ''} placeholder="พิมพ์คำตอบ"></label>${shown || E.mode === 'mock' ? '' : '<button class="pri" data-a="numSubmit">ตรวจคำตอบ</button>'}</div>`;
const whyHtml = q => isNum(q) ? (q.wrong ? `<div class="why"><b>คำตอบที่พบบ่อยแต่ผิด</b>${q.wrong.map(w => `<div><span class="wl">≠</span> ถ้าได้ <b>${rt(String(w[0]))}</b> → ${rt(w[1])}</div>`).join('')}</div>` : '') : q.why ? `<div class="why"><b>ทำไมข้ออื่นถึงไม่ใช่</b>${q.c.map((c, i) => i === q.a ? '' : `<div><span class="wl">${LETTERS[i]}</span> ${rt(q.why[i] || '')}</div>`).join('')}</div>` : '';
const store = {
  get(k, d) { try { const v = localStorage.getItem('sx_' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('sx_' + k, JSON.stringify(v)); } catch { } },
};
let attempts = store.get('attempts', []);   // {ts,qid,group,subject,topic,ok,secs,mode}
let studies = store.get('studies', []);     // {ts,secs,subject}
let mocks = store.get('mocks', []);         // {ts,set,score,total,secs}
let records = store.get('records', []);
let custom = store.get('custom', []);
let marks = store.get('marks', []);
let examDate = store.get('examDate', '');
let goalMin = store.get('goal', 60);
const save = () => { ['attempts', 'studies', 'mocks', 'records', 'custom', 'marks'].forEach(k => store.set(k, ({ attempts, studies, mocks, records, custom, marks })[k])); store.set('examDate', examDate); store.set('goal', goalMin); };
const allQ = () => QUESTIONS.concat(custom);
// กระจายตำแหน่งคำตอบที่ถูกให้สมดุล (กำหนดตายตัวจาก id) — ข้ามข้อที่ตัวเลือกเป็นตัวเลขเรียงค่า
QUESTIONS.forEach(q => {
  let h = 0; for (const ch of q.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  // ตัวเลือกตัวเลขเรียงค่า: ไม่สลับตำแหน่ง แต่บางข้อเรียงจากมากไปน้อย (ได้ทั้งสองแบบในข้อสอบจริง) เพื่อกระจายตำแหน่งคำตอบ
  if (!q.c) return;
  if (q.c.every(s => /^[\d−\-.([]/.test(s))) { if (h % 2) { q.c.reverse(); if (q.why) q.why.reverse(); q.a = q.c.length - 1 - q.a; } return; }
  const t = h % q.c.length;[q.c[q.a], q.c[t]] = [q.c[t], q.c[q.a]]; if (q.why) [q.why[q.a], q.why[t]] = [q.why[t], q.why[q.a]]; q.a = t;
});
const dayKey = ts => { const d = new Date(ts); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const fmt = s => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ':' : '') + String(m).padStart(h ? 2 : 1, '0') + ':' + String(x).padStart(2, '0'); };
const pct = (a, b) => b ? Math.round(a * 100 / b) : 0;
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0;[a[i], a[j]] = [a[j], a[i]]; } return a; };
const uniq = a => [...new Set(a)];
const val = id => { const e = document.getElementById(id); return e ? e.value : ''; };
const ICON = {
  home: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',
  exam: 'M6 2h9l5 5v15H6zM14 2v6h6M9 13h8M9 17h8',
  stats: 'M4 20V10M10 20V4M16 20v-8M22 20H2',
  timer: 'M12 8v5l3 2M9 2h6M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16z',
  book: 'M4 5a2 2 0 0 1 2-2h14v15H6a2 2 0 0 0-2 2zM4 20a2 2 0 0 0 2 2h14',
};
const ico = n => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${ICON[n]}"/></svg>`;
const NAV = [['', 'หน้าแรก', 'home'], ['exam', 'ทำข้อสอบ', 'exam'], ['stats', 'สถิติ', 'stats'], ['timer', 'จับเวลา', 'timer'], ['library', 'คลังความรู้', 'book']];
$('#dnav').innerHTML = NAV.map(([r, t, i]) => `<a href="#/${r}" data-r="${r}">${ico(i)}${t}</a>`).join('');
$('#tabbar').innerHTML = NAV.map(([r, t, i]) => `<a href="#/${r}" data-r="${r}">${ico(i)}<span>${t}</span></a>`).join('');

// นาที/ข้อ ตาม blueprint ของ mytcas: TPAT3 70 ข้อ/180 นาที, TGAT1 60/60, TGAT2 80/60, TGAT3 60/60, A-Level 90 นาที (Math1/ฟิสิกส์ 30 ข้อ, เคมี 35, ชีวะ 40)
const PER_MIN = { TPAT3: 180 / 70, TGAT1: 1, TGAT2: 60 / 80, TGAT3: 1, 'คณิต': 3, 'ฟิสิกส์': 3, 'เคมี': 90 / 35, 'ชีววิทยา': 90 / 40 };
const mockMinutes = list => Math.max(1, Math.ceil(list.reduce((a, q) => a + (PER_MIN[q.subject] ?? 1.8), 0)));
const lessonFor = q => LESSONS[q.topic];

/* ====================== stats helpers ====================== */
function streak() {
  const days = new Set([...attempts.map(a => dayKey(a.ts)), ...studies.map(s => dayKey(s.ts))]);
  let n = 0; const d = new Date();
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
  while (days.has(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
const todaySecs = () => studies.filter(s => dayKey(s.ts) === dayKey(Date.now())).reduce((a, s) => a + s.secs, 0);
function topicStats() {
  const m = {};
  attempts.forEach(a => { const t = m[a.topic] ||= { topic: a.topic, n: 0, ok: 0, secs: 0 }; t.n++; t.ok += a.ok ? 1 : 0; t.secs += a.secs || 0; });
  return Object.values(m);
}
const weakTopics = () => topicStats().filter(t => t.n >= 3 && pct(t.ok, t.n) < 60).sort((a, b) => pct(a.ok, a.n) - pct(b.ok, b.n));
function beep() { try { const c = new (window.AudioContext || window.webkitAudioContext)(), o = c.createOscillator(); o.connect(c.destination); o.frequency.value = 880; o.start(); setTimeout(() => { o.stop(); c.close(); }, 450); } catch { } }
function confetti() {
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const cols = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
  for (let i = 0; i < 40; i++) {
    const e = document.createElement('i'); e.className = 'confetti';
    e.style.cssText = `left:${Math.random() * 100}vw;background:${cols[i % 5]};--dx:${(Math.random() - .5) * 200}px;--rot:${Math.random() * 720}deg;animation-duration:${1.6 + Math.random() * 1.4}s;animation-delay:${Math.random() * .4}s`;
    document.body.appendChild(e); setTimeout(() => e.remove(), 3500);
  }
}

/* ====================== global study timer ====================== */
const T = { mode: 'pomo', phase: 'focus', focusMin: 25, breakMin: 5, subject: '', running: false, endAt: 0, startedAt: 0, base: 0, remain: 25 * 60 };
const phaseTotal = () => (T.phase === 'focus' ? T.focusMin : T.breakMin) * 60;
const tElapsed = () => T.mode === 'sw' ? T.base + (T.running ? (Date.now() - T.startedAt) / 1000 : 0) : (T.phase === 'focus' ? T.focusMin * 60 - T.remain : 0);
function logStudy(secs) { if (secs >= 60) { studies.push({ ts: Date.now(), secs: Math.round(secs), subject: T.subject || 'ทั่วไป' }); save(); } }
function tStart() { if (T.running) return; T.running = true; if (T.mode === 'sw') T.startedAt = Date.now(); else T.endAt = Date.now() + T.remain * 1000; render(); }
function tPause() { if (!T.running) return; if (T.mode === 'sw') T.base = tElapsed(); else T.remain = Math.max(0, Math.ceil((T.endAt - Date.now()) / 1000)); T.running = false; render(); }
function tReset(logIt) { if (logIt) { tPause(); logStudy(tElapsed()); } T.running = false; T.base = 0; T.phase = 'focus'; T.remain = T.focusMin * 60; render(); }
function tick() {
  if (T.running && T.mode === 'pomo') {
    T.remain = Math.max(0, Math.ceil((T.endAt - Date.now()) / 1000));
    if (T.remain <= 0) {
      beep();
      if (T.phase === 'focus') { logStudy(T.focusMin * 60); T.phase = 'break'; T.remain = T.breakMin * 60; } else { T.phase = 'focus'; T.remain = T.focusMin * 60; }
      T.running = false; render(); return;
    }
  }
  const c = $('#clk'); if (c) c.textContent = fmt(T.mode === 'sw' ? tElapsed() : T.remain);
  const r = $('#ring'); if (r && T.mode === 'pomo') r.style.strokeDashoffset = 628 * (1 - T.remain / phaseTotal());
  if (E && !E.done) {
    const left = E.mode === 'mock' ? Math.ceil((E.endAt - Date.now()) / 1000) : null;
    const el = $('#et'); if (el) { el.textContent = E.mode === 'mock' ? fmt(left) : fmt((Date.now() - E.t0) / 1000); el.classList.toggle('low', left !== null && left <= 300); }
    if (left !== null && left <= 0) submitExam(true);
  }
  document.title = T.running ? fmt(T.mode === 'sw' ? tElapsed() : T.remain) + ' · SIXENT' : 'SIXENT – ติว TGAT / TPAT3';
}
setInterval(tick, 500);

/* ====================== router ====================== */
let E = null;      // exam state
const X = { mode: 'practice', group: '', subject: '', topic: '', src: 'all', n: 10, shuffle: true };
let libTab = 'lessons', libOpen = '';
const routes = { '': viewHome, exam: viewExam, stats: viewStats, timer: viewTimer, library: viewLibrary };
function render(keepScroll) {
  const r = (location.hash.replace(/^#\/?/, '') || '').split('/')[0];
  document.querySelectorAll('[data-r]').forEach(a => a.classList.toggle('on', a.dataset.r === r));
  document.body.classList.toggle('in-exam', r === 'exam' && !!E && !E.done);
  killSim();
  $('#app').innerHTML = `<div class="${r === 'exam' && E && !E.done ? '' : 'view'}">${(routes[r] || viewHome)()}</div>`;
  mountSim();
  achAfterRender(r);
  if (!keepScroll) window.scrollTo(0, 0);
  tick();
}
// ซิมูเลเตอร์ในสไลด์บทเรียน: ปิดตัวเก่าและเปิดตัวใหม่ทุกครั้งที่ render
let LS = null; // สถานะสไลด์ {k,i,slides,sim,dir}
function killSim() { if (LS && LS.sim) { try { LS.sim.destroy(); } catch { } LS.sim = null; } }
function mountSim() {
  const host = $('#simhost'); if (!host || !LS) return; const sl = LS.slides[LS.i];
  if (sl && sl.type === 'sim' && (typeof SIMS === 'undefined' || !SIMS[sl.sim])) { host.innerHTML = '<div class="warnbox">โหลดซิมูเลเตอร์ไม่สำเร็จ — ลองรีเฟรชหน้า หรือเปิดแอปใหม่เมื่อออนไลน์</div>'; return; }
  if (sl && sl.type === 'sim' && SIMS[sl.sim]) { try { LS.sim = SIMS[sl.sim].mount(host); } catch (e) { host.textContent = 'โหลดซิมูเลเตอร์ไม่สำเร็จ'; console.error(e); } }
}
window.addEventListener('hashchange', () => render());
document.addEventListener('click', e => {
  if (e.target.closest('.logo')) easterEgg(); // แตะโลโก้ 5 ครั้งติด มีของเล็ก ๆ
  const b = e.target.closest('[data-a]'); if (!b || b.disabled) return;
  if (b.classList.contains('omr') && e.target !== b) return; // คลิกในแผ่นกระดาษคำตอบไม่ปิด
  const fn = ACT[b.dataset.a]; if (fn) fn(b.dataset.v, b);
});
// โหมดสอบจำลอง: เก็บคำตอบตัวเลขทันทีที่พิมพ์ (ไม่เฉลย)
document.addEventListener('input', e => {
  if (e.target.dataset.input !== 'num' || !E || E.done || E.mode !== 'mock') return;
  const v = e.target.value; if (v === '') delete E.ans[E.i]; else E.ans[E.i] = v;
});
document.addEventListener('change', e => {
  const k = e.target.dataset.change; if (!k) return;
  if (k.startsWith('x:')) { X[k.slice(2)] = e.target.type === 'checkbox' ? e.target.checked : (['n'].includes(k.slice(2)) ? +e.target.value : e.target.value); if (k === 'x:group') { X.subject = ''; X.topic = ''; } if (k === 'x:subject') X.topic = ''; render(true); }
  if (k === 'tsub') T.subject = e.target.value;
  if (k === 'tcfg') { T.focusMin = Math.max(1, +val('tf') || 25); T.breakMin = Math.max(1, +val('tb') || 5); if (!T.running) T.remain = phaseTotal(); render(true); }
  if (k === 'goal') { goalMin = Math.max(5, +e.target.value || 60); save(); render(true); }
});
// ปัดซ้าย-ขวาเพื่อพลิกหน้าข้อสอบ
let tx = 0, ty = 0, tOn = false;
document.addEventListener('touchstart', e => { tOn = e.target.closest('.sheet') ? 'exam' : (e.target.closest('.slide') && !e.target.closest('.sim') ? 'slide' : ''); tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
document.addEventListener('touchend', e => {
  if (!tOn) return; const kind = tOn; tOn = '';
  const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
  if (!(Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6)) return;
  if (kind === 'exam' && E && !E.done) (dx < 0 ? ACT.next : ACT.prev)();
  else if (kind === 'slide' && LS) (dx < 0 ? ACT.slideNext : ACT.slidePrev)();
}, { passive: true });
document.addEventListener('keydown', e => {
  if (LS && (!E || E.done) && location.hash === '#/library' && !/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) { if (e.key === 'ArrowRight') ACT.slideNext(); else if (e.key === 'ArrowLeft') ACT.slidePrev(); return; }
  if (!E || E.done || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  if (e.key === 'ArrowRight') ACT.next(); else if (e.key === 'ArrowLeft') ACT.prev();
  else if ('12345'.includes(e.key) && E.list[E.i].c && E.list[E.i].c[+e.key - 1] !== undefined) ACT.pick(String(+e.key - 1));
});

/* ====================== home ====================== */
function ring(p, size, label, sub) {
  const r = 52, c = 2 * Math.PI * r, off = c * (1 - Math.min(1, p));
  return `<div class="ringwrap"><svg width="${size}" height="${size}" viewBox="0 0 120 120" style="transform:rotate(-90deg)"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs><circle class="ring-bg" cx="60" cy="60" r="${r}" fill="none" stroke-width="10"/><circle class="ring-fg" cx="60" cy="60" r="${r}" fill="none" stroke-width="10" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}"/></svg><div class="ringtxt"><b>${label}</b><span class="mute">${sub}</span></div></div>`;
}
function viewHome() {
  const total = attempts.length, ok = attempts.filter(a => a.ok).length, mins = Math.round(todaySecs() / 60);
  let cd = '-', cdsub = 'ยังไม่ตั้งวันสอบ';
  if (examDate) { const d = Math.ceil((new Date(examDate + 'T00:00:00') - Date.now()) / 864e5); cd = d >= 0 ? d : '✓'; cdsub = d >= 0 ? 'วันก่อนสอบ' : 'สอบแล้ว'; }
  const weak = weakTopics().slice(0, 3);
  const th = THEMES.find(x => x.id === store.get('theme', 'sixent')) || THEMES[0];
  return `<div class="card hero"><svg class="gearmark" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="10" stroke-dasharray="9.95"/><circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" stroke-width="4"/></svg><h1>${th.s ? 'สู่วิศวะ ' + esc(th.s) + ' ⚙️' : 'พร้อมติวหรือยัง? 🚀'}</h1><p>เปิดข้อสอบทีละหน้าเหมือนสนามจริง ทบทวนจุดอ่อน และจับเวลาการอ่าน</p>
    <div class="row"><a class="btn w" href="#/exam">เริ่มทำข้อสอบ</a><a class="btn" href="#/timer">เริ่มจับเวลา</a></div></div>
  ${dailyCard()}
  ${achCard()}
  <div class="grid2">${shirtCard()}<div class="card" style="display:grid;align-content:center"><div class="mute" style="margin-bottom:6px">คำคมประจำวัน</div>${quoteHtml()}</div></div>
  <div class="grid2">
    <div class="card"><h2>เป้าหมายวันนี้</h2><div class="row" style="gap:18px">${ring(mins / goalMin, 120, mins + ' น.', 'จาก ' + goalMin)}
      <div><div class="mute">streak</div><b style="font-size:24px">🔥 ${streak()} วัน</b><div style="margin-top:8px"><label><span>เป้าหมาย (นาที/วัน)</span><input type="number" min="5" value="${goalMin}" data-change="goal" style="width:90px"></label></div></div></div></div>
    <div class="card"><h2>ภาพรวม</h2><div class="grid" style="grid-template-columns:1fr 1fr">
      <div><b style="font-size:26px">${total ? pct(ok, total) + '%' : '-'}</b><div class="mute">แม่นยำ (${total} ข้อ)</div></div>
      <div><b style="font-size:26px">${cd}</b><div class="mute">${cdsub}</div></div></div>
      <div class="row" style="margin-top:10px"><input type="date" id="ed" value="${esc(examDate)}"><button data-a="setDate">ตั้งวันสอบ</button></div>
      <div class="row" style="margin-top:6px"><button class="chip" data-a="setExam" data-v="${TCAS70.dates.tpat3}">TPAT3/TGAT 30 ม.ค. 70</button><button class="chip" data-a="setExam" data-v="${TCAS70.dates.alevel}">A-Level 13 มี.ค. 70</button></div></div>
  </div>
  <div class="card"><h2>แนะนำให้ทบทวน</h2>${weak.length ? weak.map(t => `<div class="row between" style="padding:6px 0"><span>${esc(t.topic)} <span class="mute">แม่นยำ ${pct(t.ok, t.n)}% · ${t.n} ข้อ</span></span><span><button data-a="practiceTopic" data-v="${esc(t.topic)}">ฝึก</button> ${LESSONS[t.topic] ? `<button data-a="openLesson" data-v="${esc(t.topic)}">อ่านบทเรียน</button>` : ''}</span></div>`).join('') : '<span class="mute">ยังไม่มีข้อมูลเพียงพอ — ทำโจทย์ให้ได้อย่างน้อย 3 ข้อต่อหัวข้อ แล้วระบบจะชี้จุดอ่อนให้</span>'}</div>
  <div class="card"><h2>ชุดข้อสอบ</h2><div class="presets">${PRESETS.map((p, i) => `<button class="preset" data-a="preset" data-v="${i}"><b>${p.t}</b><small>${allQ().filter(p.f).length} ข้อ · ≈ ${mockMinutes(allQ().filter(p.f))} นาที</small></button>`).join('')}</div></div>
  <div class="row" style="justify-content:center;margin:6px 0 2px"><button class="chip" data-a="adminOpen" style="opacity:.55;min-height:32px;padding:4px 12px;font-size:12.5px">🔧 แอดมิน</button></div>`;
}

/* ====================== exam setup ====================== */
const PRESETS = [
  { t: 'TPAT3 ทั้งชุด', f: q => q.group === 'tpat3' },
  { t: 'TGAT1 ภาษาอังกฤษ', f: q => q.subject === 'TGAT1' },
  { t: 'TGAT2 การคิดอย่างมีเหตุผล', f: q => q.subject === 'TGAT2' },
  { t: 'TGAT3 สมรรถนะการทำงาน', f: q => q.subject === 'TGAT3' },
  { t: 'A-Level คณิตศาสตร์', f: q => q.subject === 'คณิต' },
  { t: 'A-Level วิทย์ (ฟิสิกส์ เคมี ชีว)', f: q => q.group === 'alevel' && q.subject !== 'คณิต' },
];
function pool() {
  const wrong = new Set(attempts.filter(a => !a.ok).map(a => a.qid)), seen = new Set(attempts.map(a => a.qid));
  return allQ().filter(q => (!X.group || q.group === X.group) && (!X.subject || q.subject === X.subject) && (!X.topic || q.topic === X.topic) &&
    (X.src === 'all' || (X.src === 'wrong' ? wrong.has(q.id) : X.src === 'marked' ? marks.includes(q.id) : !seen.has(q.id))));
}
function viewExam() {
  if (!E) return examSetup();
  return E.done ? examResult() : examPaper();
}
function examSetup() {
  const base = allQ().filter(q => !X.group || q.group === X.group), subs = uniq(base.map(q => q.subject)), tops = uniq(base.filter(q => !X.subject || q.subject === X.subject).map(q => q.topic));
  const p = pool(), mins = mockMinutes(p.slice(0, X.n));
  const opt = (v, t, cur) => `<option value="${esc(v)}" ${cur === v ? 'selected' : ''}>${esc(t)}</option>`;
  return `<h1>ทำข้อสอบ</h1>
  <div class="card"><h2>เลือกโหมด</h2><div class="chips">
    <button class="chip ${X.mode === 'practice' ? 'on' : ''}" data-a="xmode" data-v="practice">📖 ฝึกทำ (เฉลยทันที)</button>
    <button class="chip ${X.mode === 'mock' ? 'on' : ''}" data-a="xmode" data-v="mock">⏱ สอบจำลอง (จับเวลา ซ่อนเฉลย)</button></div>
    <h2>ชุดสำเร็จรูป</h2><div class="presets">${PRESETS.map((q, i) => `<button class="preset" data-a="preset" data-v="${i}"><b>${q.t}</b><small>${allQ().filter(q.f).length} ข้อ</small></button>`).join('')}</div></div>
  <div class="card"><h2>หรือกำหนดเอง</h2>
    <label><span>ชุดสอบ</span><select data-change="x:group">${opt('', 'ทั้งหมด', X.group)}${Object.entries(GROUPS).map(([k, v]) => opt(k, v, X.group)).join('')}</select></label>
    <label><span>วิชา/ส่วน</span><select data-change="x:subject">${opt('', 'ทั้งหมด', X.subject)}${subs.map(s => opt(s, s, X.subject)).join('')}</select></label>
    <label><span>หัวข้อ</span><select data-change="x:topic">${opt('', 'ทุกหัวข้อ', X.topic)}${tops.map(s => opt(s, s, X.topic)).join('')}</select></label>
    <label><span>แหล่งโจทย์</span><select data-change="x:src">${opt('all', 'ทั้งหมด', X.src)}${opt('unseen', 'ที่ยังไม่เคยทำ', X.src)}${opt('wrong', 'ที่เคยผิด', X.src)}${opt('marked', 'ที่บุ๊กมาร์ก', X.src)}</select></label>
    <label><span>จำนวนข้อ</span><select data-change="x:n">${[5, 10, 20, 40, 999].map(n => `<option value="${n}" ${X.n === n ? 'selected' : ''}>${n === 999 ? 'ทั้งหมด' : n}</option>`).join('')}</select></label>
    <label><span>&nbsp;</span><span style="display:flex;gap:6px;align-items:center;color:var(--ink)"><input type="checkbox" data-change="x:shuffle" ${X.shuffle ? 'checked' : ''} style="min-height:auto"> สลับลำดับข้อ</span></label>
    <div class="row" style="margin-top:8px"><button class="pri" data-a="startExam" ${p.length ? '' : 'disabled'}>เริ่ม (${Math.min(p.length, X.n)} ข้อ${X.mode === 'mock' ? ' · ' + mins + ' นาที' : ''})</button>${p.length ? '' : '<span class="mute">ไม่พบโจทย์ตามเงื่อนไข</span>'}</div></div>`;
}
function buildList(list, shuf) {
  return shuf ? shuffle(list) : list;
}
function beginExam(mode, list, label) {
  E = { mode, label, list, i: 0, ans: {}, flag: {}, rev: {}, qs: {}, t0: Date.now(), tq: Date.now(), dir: '', done: false, omr: false, mins: mockMinutes(list), endAt: 0 };
  E.endAt = E.t0 + E.mins * 60000;
  history.replaceState(null, '', '#/exam'); render();
}
function startExam() {
  let l = buildList(pool(), X.shuffle).slice(0, X.n);
  if (!l.length) return;
  beginExam(X.mode, l, 'ชุดกำหนดเอง');
}

/* ====================== booklet ====================== */
function examPaper() {
  const q = E.list[E.i], n = E.list.length, mock = E.mode === 'mock', picked = E.ans[E.i], shown = !mock && E.rev[E.i];
  const dir = E.dir; E.dir = '';
  const answered = Object.keys(E.ans).length;
  return `<div class="exam">
  <div class="ebar"><div class="row between"><div><b>${esc(E.label)}</b> <span class="tag">${mock ? 'สอบจำลอง' : 'ฝึกทำ'}</span></div>
    <div class="row"><span class="eclock" id="et">0:00</span><button data-a="quit" aria-label="ออก">✕</button></div></div>
    <div class="prog"><i style="width:${(E.i + 1) / n * 100}%"></i></div></div>
  <div class="stage"><article class="sheet ${dir}" aria-label="ข้อ ${E.i + 1}">
    <div class="shead"><span class="qno">ข้อ ${E.i + 1} / ${n}</span><span><span class="tag">${esc(q.subject)}</span><span class="tag">${esc(q.topic)}</span></span></div>
    ${q.passage ? `<div class="passage">${nl(q.passage)}</div>` : ''}
    <div class="qtext">${nl(q.q)}</div>
    ${q.fig ? q.fig : ''}
    ${isNum(q) ? numBox(q, picked, shown) : `<div role="radiogroup">${q.c.map((c, i) => {
    let cls = '';
    if (shown) cls = i === q.a ? 'ok' : (i === picked ? 'bad' : ''); else if (picked === i) cls = 'sel';
    return `<button class="opt ${cls}" role="radio" aria-checked="${picked === i}" data-a="pick" data-v="${i}" ${shown ? 'disabled' : ''}><span class="bub">${LETTERS[i] || i + 1}</span><span class="otx">${chHtml(c)}</span></button>`;
  }).join('')}</div>`}
    ${shown ? `<div class="exp"><b>${isRight(q, picked) ? '✅ ถูกต้อง!' : '❌ เฉลย: ' + rightTxt(q)}</b><div style="margin-top:6px">${nl(q.exp || '')}</div>${whyHtml(q)}${q.tip ? `<div class="tip">💡 ${rt(q.tip)}</div>` : ''}
      ${lessonFor(q) ? `<div style="margin-top:8px"><a href="#/library" data-a="openLesson" data-v="${esc(q.topic)}" onclick="return false">📚 อ่านบทเรียน: ${esc(q.topic)}</a></div>` : ''}</div>` : ''}
  </article></div>
  <div class="efoot"><div class="row"><button data-a="prev" ${E.i === 0 ? 'disabled' : ''} aria-label="ข้อก่อนหน้า">◀</button>
    <button class="grow" data-a="omr">📋 ตอบแล้ว ${answered}/${n}</button>
    ${mock ? `<button data-a="flag" aria-label="ปักธง">${E.flag[E.i] ? '⚑' : '⚐'}</button>` : `<button data-a="mark" data-v="${esc(q.id)}" aria-label="บุ๊กมาร์ก">${marks.includes(q.id) ? '★' : '☆'}</button>`}
    ${E.i === n - 1 ? `<button class="pri" data-a="finish">ส่ง ✓</button>` : `<button class="pri" data-a="next" aria-label="ข้อถัดไป">▶</button>`}</div></div>
  ${E.omr ? omrSheet() : ''}</div>`;
}
function omrSheet() {
  const n = E.list.length;
  return `<div class="omr" data-a="omrclose"><div><div class="row between"><h2 style="margin:0">กระดาษคำตอบ</h2><button data-a="omrclose">ปิด</button></div>
  <div class="navg">${E.list.map((_, i) => `<button class="${E.ans[i] != null ? 'done' : ''} ${E.flag[i] ? 'flag' : ''} ${i === E.i ? 'cur' : ''}" data-a="go" data-v="${i}">${i + 1}</button>`).join('')}</div>
  <div class="legend"><span>● ตอบแล้ว</span><span>○ ยังไม่ตอบ</span><span>⚑ ปักธง (วงเหลือง)</span></div>
  <div style="margin-top:12px"><button class="pri" data-a="finish" style="width:100%">${E.mode === 'mock' ? 'ส่งข้อสอบ' : 'จบและดูผล'}</button></div></div></div>`;
}
function leave() { const now = Date.now(); E.qs[E.i] = (E.qs[E.i] || 0) + (now - E.tq) / 1000; E.tq = now; }
function goTo(i, dir) { if (i < 0 || i >= E.list.length) return; leave(); E.dir = dir || (i > E.i ? 'next' : 'prev'); E.i = i; E.omr = false; render(true); }
function submitExam(auto) {
  if (!E || E.done) return;
  leave();
  const n = E.list.length, mock = E.mode === 'mock';
  let score = 0;
  E.list.forEach((q, i) => {
    const ok = isRight(q, E.ans[i]); if (ok) score++;
    if (mock && E.ans[i] != null) attempts.push({ ts: Date.now(), qid: q.id, group: q.group, subject: q.subject, topic: q.topic, ok, secs: Math.round(E.qs[i] || 0), mode: 'mock' });
  });
  E.score = score; E.secs = Math.min((Date.now() - E.t0) / 1000, E.mins * 60); E.done = true; E.auto = !!auto; E.omr = false;
  if (mock) mocks.push({ ts: Date.now(), set: E.label, score, total: n, secs: Math.round(E.secs) });
  save(); render();
  if (pct(score, n) >= 70) setTimeout(confetti, 400);
}
function examResult() {
  const n = E.list.length, p = pct(E.score, n), by = {};
  E.list.forEach((q, i) => { const t = by[q.topic] ||= { n: 0, ok: 0 }; t.n++; if (isRight(q, E.ans[i])) t.ok++; });
  const msg = p >= 80 ? 'เยี่ยมมาก! เสื้อช็อปตัวนี้คู่ควรแล้ว 🎉' : p >= 60 ? 'ดีเลย ค่า error เริ่มเข้าพิกัดเผื่อแล้ว 💪' : 'ไม่เป็นไร นี่คือต้นแบบรุ่นที่ 1 — ทบทวนจุดที่พลาดแล้วลองใหม่ 📚';
  setTimeout(() => { const f = document.querySelector('.ring-fg'); if (f) f.style.strokeDashoffset = 2 * Math.PI * 52 * (1 - p / 100); }, 60);
  return `<h1>ผลการสอบ ${E.auto ? '<span class="tag warn">หมดเวลา ส่งอัตโนมัติ</span>' : ''}</h1>
  <div class="card ctr">${ring(0, 170, E.score + '/' + n, p + '%')}<p style="margin:10px 0 2px"><b>${msg}</b></p>${E.daily ? `<p class="mute" style="margin:2px 0">ภารกิจรายวัน: ทำแล้ว ${Object.keys(getDaily().results).length}/${getDaily().ids.length} ข้อ${missionStreak() ? ' · 🔥 ติดต่อกัน ' + missionStreak() + ' วัน' : ''}</p>` : ''}${quoteHtml(quoteOfDay(E.score))}<div class="mute">ใช้เวลา ${fmt(E.secs)} ${E.mode === 'mock' ? 'จาก ' + E.mins + ' นาที' : ''} · ตอบแล้ว ${Object.keys(E.ans).length}/${n} ข้อ</div>
    <div class="row" style="justify-content:center;margin-top:12px"><button class="pri" data-a="resetE">ทำชุดใหม่</button><a class="btn" href="#/stats">ดูสถิติ</a></div></div>
  <div class="card"><h2>รายหัวข้อ</h2><div class="tbl"><table>${Object.entries(by).map(([t, v]) => `<tr><td>${esc(t)}</td><td>${v.ok}/${v.n}</td><td style="width:40%"><div class="bar ${pct(v.ok, v.n) >= 60 ? 'g' : 'r'}"><i style="width:${pct(v.ok, v.n)}%"></i></div></td></tr>`).join('')}</table></div></div>
  <div class="card"><h2>ทบทวนทีละข้อ</h2>${E.list.map((q, i) => { const mine = E.ans[i], ok = isRight(q, mine); return `<div class="rv"><div class="row between"><b>ข้อ ${i + 1}</b><span class="tag ${ok ? 'ok' : 'bad'}">${mine == null ? 'ไม่ได้ตอบ' : ok ? 'ถูก' : 'ผิด'}</span></div>
    ${q.passage ? `<details><summary>ดูบทอ่าน/ข้อมูล</summary><div class="passage">${nl(q.passage)}</div></details>` : ''}<div style="margin:4px 0">${nl(q.q)}</div>${q.fig ? q.fig : ''}
    <div class="mute">คุณตอบ: ${mine != null ? showAns(q, mine) : '(ว่าง)'} · เฉลย: <b style="color:var(--ok)">${rightTxt(q)}</b></div>
    <div class="exp"><div>${nl(q.exp || '')}</div>${whyHtml(q)}${q.tip ? `<div class="tip">💡 ${rt(q.tip)}</div>` : ''}${lessonFor(q) ? `<div style="margin-top:6px"><a href="#/library" data-a="openLesson" data-v="${esc(q.topic)}" onclick="return false">📚 บทเรียน: ${esc(q.topic)}</a></div>` : ''}</div></div>`; }).join('')}</div>`;
}

/* ====================== stats ====================== */
function viewStats() {
  const ts = topicStats().sort((a, b) => pct(a.ok, a.n) - pct(b.ok, b.n));
  const days = []; for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(dayKey(d)); }
  const qd = days.map(k => attempts.filter(a => dayKey(a.ts) === k).length), sd = days.map(k => Math.round(studies.filter(s => dayKey(s.ts) === k).reduce((a, s) => a + s.secs, 0) / 60));
  const chart = (arr, unit) => { const mx = Math.max(1, ...arr); return `<div class="days">${arr.map((v, i) => `<div title="${days[i]}: ${v} ${unit}"><small>${v || ''}</small><i style="height:${v / mx * 85}%"></i><small>${days[i].slice(8)}</small></div>`).join('')}</div>`; };
  const avg = attempts.length ? Math.round(attempts.reduce((a, x) => a + (x.secs || 0), 0) / attempts.length) : 0;
  // heatmap 12 สัปดาห์
  const act = {}; attempts.forEach(a => act[dayKey(a.ts)] = (act[dayKey(a.ts)] || 0) + 1); studies.forEach(s => act[dayKey(s.ts)] = (act[dayKey(s.ts)] || 0) + Math.round(s.secs / 600));
  const cells = []; const first = new Date(); first.setDate(first.getDate() - (first.getDay() + 6) % 7 - 77); // จันทร์ของ 11 สัปดาห์ก่อน
  for (let i = 0; i < 84; i++) { const d = new Date(first); d.setDate(first.getDate() + i); const v = act[dayKey(d)] || 0; cells.push(`<i class="${v >= 20 ? 'l4' : v >= 10 ? 'l3' : v >= 4 ? 'l2' : v >= 1 ? 'l1' : ''}" title="${dayKey(d)}: ${v}"></i>`); }
  let trend = '<span class="mute">ยังไม่มีผลสอบจำลอง — ลองทำโหมด "สอบจำลอง"</span>';
  if (mocks.length) {
    const m = mocks.slice(-12), pts = m.map((x, i) => [m.length > 1 ? 14 + i * 272 / (m.length - 1) : 150, 88 - pct(x.score, x.total) * .76]);
    trend = `<svg viewBox="0 0 300 100" style="width:100%;max-width:520px"><defs><linearGradient id="ar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6366f1" stop-opacity=".35"/><stop offset="1" stop-color="#6366f1" stop-opacity="0"/></linearGradient></defs>
      <line x1="10" y1="12" x2="290" y2="12" stroke="var(--line)"/><line x1="10" y1="88" x2="290" y2="88" stroke="var(--line)"/>
      <polygon points="${pts.map(p => p.join(',')).join(' ')} ${pts[pts.length - 1][0]},88 ${pts[0][0]},88" fill="url(#ar)"/><polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linejoin="round"/>
      ${pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="#6366f1"/>`).join('')}</svg><div class="mute">คะแนน (%) ของ ${m.length} ครั้งล่าสุด · ล่าสุด ${pct(m[m.length - 1].score, m[m.length - 1].total)}%</div>`;
  }
  return `<h1>สถิติ</h1><div class="grid">
  <div class="stat"><b>${attempts.length}</b><span>ข้อที่ทำทั้งหมด</span></div>
  <div class="stat"><b>${attempts.length ? pct(attempts.filter(a => a.ok).length, attempts.length) + '%' : '-'}</b><span>ความแม่นยำ</span></div>
  <div class="stat"><b>${avg} วิ</b><span>เวลาเฉลี่ย/ข้อ</span></div>
  <div class="stat"><b>${(studies.reduce((a, s) => a + s.secs, 0) / 3600).toFixed(1)} ชม.</b><span>เวลาอ่านสะสม</span></div></div>
  <div class="grid2" style="margin-top:14px"><div class="card"><h2>ข้อที่ทำ 14 วัน</h2>${chart(qd, 'ข้อ')}</div><div class="card"><h2>เวลาอ่าน 14 วัน (นาที)</h2>${chart(sd, 'นาที')}</div></div>
  <div class="card"><h2>ความสม่ำเสมอ 12 สัปดาห์</h2><div class="heat">${cells.join('')}</div></div>
  <div class="card"><h2>แนวโน้มคะแนนสอบจำลอง</h2>${trend}</div>
  <div class="card"><h2>รายหัวข้อ (อ่อน → แข็ง)</h2>${ts.length ? `<div class="tbl"><table>${ts.map(t => { const p = pct(t.ok, t.n); return `<tr><td>${esc(t.topic)}</td><td>${t.ok}/${t.n}</td><td>${Math.round(t.secs / t.n)} วิ/ข้อ</td><td style="width:32%"><div class="bar ${p >= 70 ? 'g' : p >= 50 ? 'y' : 'r'}"><i style="width:${p}%"></i></div></td></tr>`; }).join('')}</table></div>` : '<span class="mute">ยังไม่มีข้อมูล</span>'}</div>
  <div class="card"><h2>จัดการข้อมูล</h2><p class="mute">ข้อมูลเก็บในเบราว์เซอร์ของเครื่องนี้ ถ้าจะย้ายมือถือ ↔ คอมพิวเตอร์ ให้ส่งออกแล้วนำเข้าอีกเครื่อง</p>
  <div class="row"><button data-a="exportData">⬇ ส่งออก</button><label class="btn" style="margin:0">⬆ นำเข้า<input type="file" accept="application/json" id="impfile" data-change="importFile" style="display:none"></label><button data-a="resetData">ล้างข้อมูลทั้งหมด</button></div></div>`;
}

/* ====================== timer ====================== */
function viewTimer() {
  const pomo = T.mode === 'pomo';
  return `<h1>จับเวลา</h1><div class="card">
  <div class="chips" style="justify-content:center"><button class="chip ${pomo ? 'on' : ''}" data-a="tmode" data-v="pomo">Pomodoro</button><button class="chip ${!pomo ? 'on' : ''}" data-a="tmode" data-v="sw">จับเวลาอิสระ</button></div>
  ${pomo ? `<div class="chips" style="justify-content:center">${[[25, 5], [45, 10], [50, 10], [90, 15]].map(([f, b]) => `<button class="chip ${T.focusMin === f && T.breakMin === b ? 'on' : ''}" data-a="tpreset" data-v="${f},${b}">${f}/${b}</button>`).join('')}</div>` : ''}
  <div class="tring"><svg viewBox="0 0 220 220"><circle cx="110" cy="110" r="100" fill="none" stroke="var(--line)" stroke-width="12"/><circle id="ring" cx="110" cy="110" r="100" fill="none" stroke="${T.phase === 'focus' ? 'var(--pri)' : 'var(--ok)'}" stroke-width="12" stroke-linecap="round" stroke-dasharray="628" stroke-dashoffset="${pomo ? 628 * (1 - T.remain / phaseTotal()) : 0}" style="transition:stroke-dashoffset .5s linear"/></svg>
    <div class="ct"><div class="mute">${pomo ? (T.phase === 'focus' ? '🎯 โฟกัส' : '☕ พัก') : '⏱ นับขึ้น'}</div><div class="clock" id="clk">0:00</div></div></div>
  <div class="row" style="justify-content:center">${T.running ? '<button class="pri" data-a="tpause">⏸ หยุดชั่วคราว</button>' : '<button class="pri" data-a="tstart">▶ เริ่ม</button>'}<button data-a="tstop">✔ จบ + บันทึก</button><button data-a="treset">↺ รีเซ็ต</button></div>
  <hr style="border:0;border-top:1px solid var(--line);margin:16px 0">
  <label><span>วิชา/หัวข้อที่อ่าน</span><select data-change="tsub"><option value="">ทั่วไป</option>${uniq(allQ().map(q => q.subject)).map(s => `<option ${T.subject === s ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select></label>
  ${pomo ? `<label><span>โฟกัส (นาที)</span><input id="tf" type="number" min="1" value="${T.focusMin}" style="width:90px" data-change="tcfg"></label><label><span>พัก (นาที)</span><input id="tb" type="number" min="1" value="${T.breakMin}" style="width:90px" data-change="tcfg"></label>` : ''}
  <p class="mute">เวลาที่อ่านตั้งแต่ 1 นาทีขึ้นไปจะบันทึกลงสถิติ นาฬิกายังเดินต่อแม้เปลี่ยนหน้า (แต่ต้องเปิดแอปค้างไว้)</p></div>
  <div class="card"><h2>บันทึกล่าสุด</h2>${studies.slice(-6).reverse().map(s => `<div class="row between" style="padding:4px 0"><span>${new Date(s.ts).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })} · ${esc(s.subject)}</span><b>${Math.round(s.secs / 60)} นาที</b></div>`).join('') || '<span class="mute">ยังไม่มี</span>'}</div>`;
}

/* ====================== library ====================== */
/* ---------- ข้อมูลทางการจาก mytcas (ทปอ.) ---------- */
function infoView() {
  const T = TCAS70, ex = rows => `<div class="tbl"><table><tr><th>วันที่</th><th>เวลา</th><th>รหัส</th><th>วิชา</th></tr>${rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</table></div>`;
  const setBtn = (d, t) => `<button data-a="setExam" data-v="${d}">ตั้งวันนับถอยหลัง: ${t}</button>`;
  return `<div class="warnbox" style="margin-bottom:12px">📌 ข้อมูลส่วนนี้ดึงจาก <a href="${T.src.u}" target="_blank" rel="noopener">mytcas.com</a> (ระบบกลางของ ทปอ.) ตรวจเมื่อ ${T.checked} — วันสอบและโครงสร้างอาจถูกประกาศแก้ไข ให้เปิดดูต้นฉบับก่อนตัดสินใจเสมอ
    <div class="row" style="margin-top:6px">${T.cal.map(c => `<a href="${c.u}" target="_blank" rel="noopener">🗓 ${esc(c.t)}</a>`).join(' · ')}</div></div>
  <div class="card"><h2>${T.title} — รอบการรับสมัครเข้ามหาวิทยาลัย</h2><div class="tbl"><table><tr><th>รอบ</th><th>รูปแบบ</th><th>สมัคร</th><th>ผล</th></tr>${T.rounds.map(r => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</table></div></div>
  <div class="card"><h2>TGAT / TPAT — ปฏิทินสอบ</h2><p>${esc(T.tgat.reg)}</p><p class="mute">${esc(T.tgat.print)}</p>${ex(T.tgat.exam)}<p class="mute">${esc(T.tgat.after)} · ${esc(T.tgat.fee)}</p><div class="row">${setBtn(T.dates.tpat3, 'TPAT3/TGAT 30 ม.ค. 70')}</div></div>
  <div class="card"><h2>A-Level — ปฏิทินสอบ</h2><p>${esc(T.alevel.reg)}</p><p class="mute">${esc(T.alevel.print)}</p>${ex(T.alevel.exam)}<p class="mute">${esc(T.alevel.after)} · ${esc(T.alevel.fee)}</p><div class="warnbox">💡 ${esc(T.alevel.tip)}</div><div class="row" style="margin-top:8px">${setBtn(T.dates.alevel, 'A-Level 13 มี.ค. 70')}</div></div>
  <h2 style="margin:16px 0 8px">โครงสร้างข้อสอบ (blueprint ทางการ)</h2>
  ${Object.values(BLUEPRINT).map(b => `<div class="card"><h2>${esc(b.name)}</h2><div class="row"><span class="tag">${esc(b.items)}</span><span class="tag">${b.time}</span><span class="tag">คะแนนเต็ม ${b.score}</span></div>
    ${b.parts.map(p => `<details><summary>${esc(p[0])}</summary><ul>${p[1].map(x => `<li>${esc(x)}</li>`).join('')}</ul></details>`).join('')}
    ${b.note ? `<p class="mute">${esc(b.note)}</p>` : ''}<div class="mute">ที่มา: <a href="${b.url}" target="_blank" rel="noopener">${esc(b.name.split(' ')[0] === 'A-Level' ? 'mytcas blueprint' : 'mytcas blueprint')}</a> · ตัวอย่างข้อสอบอยู่ในหน้านั้น</div></div>`).join('')}
  <div class="card"><h2>ขอบเขตเนื้อหาทางการ</h2><div class="refs"><a href="${OBEC.sci.u}" target="_blank" rel="noopener">🔗 ${esc(OBEC.sci.t)}</a><a href="${OBEC.scimath.u}" target="_blank" rel="noopener">🔗 ${esc(OBEC.scimath.t)}</a></div>
  <p class="mute">โจทย์ในแอปเขียนใหม่ใช้ 5 ตัวเลือกทุกข้อ (ข้อสอบจริง TGAT1 และ TGAT3 ใช้ 4 ตัวเลือก)</p></div>`;
}
function viewLibrary() {
  const tabs = [['lessons', 'บทเรียน'], ['info', 'ข้อมูลการสอบ'], ['sources', 'แหล่งข้อสอบเก่า'], ['records', 'ผลสอบเก่าของฉัน'], ['import', 'นำเข้าโจทย์']];
  let body = '';
  if (libTab === 'lessons') body = libOpen && hasLesson(libOpen) ? lessonView(libOpen) : lessonList();
  if (libTab === 'info') body = infoView();
  if (libTab === 'sources') body = `<div class="card"><h2>ข้อสอบเก่า/แนวข้อสอบ — ไปอ่านต่อที่ไหน</h2>
    <p class="mute">ข้อสอบจริงมีลิขสิทธิ์ของผู้จัดสอบ จึงไม่คัดลอกมาไว้ในแอปนี้ ใช้ลิงก์ต่อไปนี้เพื่อดูของจริง แล้วบันทึกผลที่แท็บ "ผลสอบเก่าของฉัน" หรือพิมพ์ข้อที่ทำเองเข้าแท็บ "นำเข้าโจทย์"</p>
    <div class="refs">${[SOURCES.tcas, SOURCES.niets, SOURCES.tpat3guide, SOURCES.tgat1guide, SOURCES.tgat3guide, R('Trueplookpanya: แนวข้อสอบ TPAT3 ชุดที่ 1 (ออนไลน์)', 'https://www.trueplookpanya.com/examination2/start-exam/14408'), R('Trueplookpanya: แนวข้อสอบ TPAT3 ชุดที่ 2 (ออนไลน์)', 'https://www.trueplookpanya.com/examination2/start-exam/14410')].map(r => `<a href="${r.u}" target="_blank" rel="noopener">🔗 ${esc(r.t)}</a>`).join('')}</div></div>`;
  if (libTab === 'records') body = `<div class="card"><h2>บันทึกผลสอบ/ข้อสอบเก่าที่ทำแล้ว</h2><div class="row">
    <label><span>รอบ/ชุด</span><input id="ry" placeholder="เช่น แนวข้อสอบ TPAT3 ชุด 1" style="width:200px"></label>
    <label><span>วิชา</span><input id="rs" placeholder="TPAT3" style="width:110px"></label>
    <label><span>ได้</span><input id="rp" type="number" style="width:80px"></label><label><span>เต็ม</span><input id="rt" type="number" value="100" style="width:80px"></label>
    <label><span>หมายเหตุ</span><input id="rn" style="width:160px"></label><button class="pri" data-a="addRec">เพิ่ม</button></div></div>
    <div class="card tbl"><table><tr><th>รอบ</th><th>วิชา</th><th>คะแนน</th><th>%</th><th>หมายเหตุ</th><th></th></tr>${records.map((r, i) => `<tr><td>${esc(r.y)}</td><td>${esc(r.s)}</td><td>${r.p}/${r.t}</td><td>${pct(r.p, r.t)}%</td><td>${esc(r.n)}</td><td><button data-a="delRec" data-v="${i}">ลบ</button></td></tr>`).join('') || '<tr><td colspan="6" class="mute">ยังไม่มี</td></tr>'}</table></div>`;
  if (libTab === 'import') body = `<div class="card"><h2>นำเข้าโจทย์ (JSON)</h2><p class="mute">พิมพ์โจทย์ที่คุณมีเองแล้วนำเข้า: <code>group</code> = tpat3 | tgat | alevel, <code>a</code> = ลำดับคำตอบที่ถูก (เริ่ม 0), ตัวเลือก 2–5 ข้อ</p>
    <textarea id="imp">[
  {"group":"tpat3","subject":"TPAT3","topic":"เชิงกลและฟิสิกส์","q":"โจทย์ตัวอย่าง","c":["ก","ข","ค","ง","จ"],"a":0,"exp":"คำอธิบาย"}
]</textarea>
    <div class="row" style="margin-top:8px"><button class="pri" data-a="doImport">นำเข้า</button><span class="mute">นำเข้าแล้ว ${custom.length} ข้อ</span>${custom.length ? '<button data-a="clearImport">ลบที่นำเข้า</button>' : ''}</div></div>`;
  if (libTab === 'lessons' && libOpen && hasLesson(libOpen)) return body; // โหมดสไลด์: ใช้พื้นที่เต็มจอ
  return `<h1>คลังความรู้</h1><div class="chips">${tabs.map(([k, v]) => `<button class="chip ${libTab === k ? 'on' : ''}" data-a="ltab" data-v="${k}">${v}</button>`).join('')}</div>${body}`;
}
/* ---------- หลักสูตรรายบท (ตามโครงสร้าง blueprint ของ mytcas) ---------- */
const chapterOf = k => typeof k === 'string' && k.startsWith('ch:') ? COURSE.find(c => c.id === k.slice(3)) : null;
function lessonMeta(k) {
  const ch = chapterOf(k); if (ch) { const base = LESSONS[ch.topic]; return { title: ch.title, group: ch.group, topic: ch.topic, refs: (ch.refs || []).concat(base ? base.refs : []).filter((r, i, a) => a.findIndex(x => x.u === r.u) === i), intro: ch.intro || ch.part, ch }; }
  const l = LESSONS[k]; return { title: l.title, group: l.group, topic: k, refs: l.refs, intro: l.intro, l };
}
const hasLesson = k => !!(LESSONS[k] || chapterOf(k));
/* ---------- แหล่งอ้างอิง: ภาษาไทยขึ้นก่อน ภาษาอังกฤษไว้อ่านเพิ่ม ---------- */
const isThaiUrl = u => /\.th(\/|$)|\/\/(www\.)?mytcas\.com|trueplookpanya\.com|th\.wikipedia\.org|th\.khanacademy\.org|phet\.colorado\.edu\/th\//.test(u);
function thaiAlt(r) {
  let m = r.u.match(/en\.wikipedia\.org\/wiki\/(.+)$/);
  if (m) { const th = typeof THWIKI !== 'undefined' && THWIKI[decodeURIComponent(m[1])]; if (th) return { t: 'วิกิพีเดียไทย: ' + th, u: 'https://th.wikipedia.org/wiki/' + encodeURIComponent(th.replace(/ /g, '_')) }; }
  if (/phet\.colorado\.edu\/en\//.test(r.u)) return { t: r.t.replace(/^PhET:/, 'PhET (หน้าภาษาไทย):'), u: r.u.replace('/en/', '/th/') };
  return null;
}
const THAI_BASE = [R('สสวท. Learning Space — สื่อการเรียนรู้ภาษาไทย', 'https://learningspace.ipst.ac.th/'), R('Khan Academy ภาษาไทย (วิดีโอพากย์/คำบรรยายไทย)', 'https://th.khanacademy.org/'), R('ทรูปลูกปัญญา — บทความและแนวข้อสอบภาษาไทย', 'https://www.trueplookpanya.com/')];
function refsHtml(refs) {
  const th = [], en = [], seen = new Set(), add = (arr, r) => { if (!seen.has(r.u)) { seen.add(r.u); arr.push(r); } };
  refs.forEach(r => { const alt = thaiAlt(r); if (alt) add(th, alt); if (isThaiUrl(r.u)) add(th, r); else add(en, r); });
  THAI_BASE.forEach(r => add(th, r));
  const a = r => `<a href="${r.u}" target="_blank" rel="noopener">🔗 ${esc(r.t)}</a>`;
  return `<h3>🇹🇭 แหล่งภาษาไทย</h3><div class="refs">${th.map(a).join('')}</div>${en.length ? `<h3>🌐 ภาษาอังกฤษ (ถ้าอยากอ่านเพิ่ม)</h3><div class="refs">${en.map(a).join('')}</div>` : ''}`;
}
function courseTree() {
  const groups = [['alevel', 'A-Level'], ['tpat3', 'TPAT3'], ['tgat', 'TGAT']];
  return groups.map(([g, name]) => {
    const chs = COURSE.filter(c => c.group === g); if (!chs.length) return '';
    const subs = uniq(chs.map(c => c.subject));
    return `<h2 style="margin:16px 0 6px">${name}</h2>` + subs.map(s => {
      const sc = chs.filter(c => c.subject === s), parts = uniq(sc.map(c => c.part));
      return `<div class="card"><h3 style="margin:0 0 6px">${esc(s)} <span class="mute">· ${sc.length} บท · ${sc.reduce((a, c) => a + c.slides.length, 0)} สไลด์</span></h3>${parts.map((p, pi) => `<details ${pi === 0 && subs.length === 1 ? 'open' : ''}><summary>${esc(p)}</summary><div class="chgrid">${sc.filter(c => c.part === p).map(c => { const nq = allQ().filter(q => q.topic === c.topic).length, sims = c.slides.filter(x => x.type === 'sim').length; return `<button class="lcard" data-a="openLesson" data-v="ch:${c.id}"><b>${esc(c.title)}</b><small>${c.slides.length} สไลด์${sims ? ' · 🎛 ' + sims + ' ซิม' : ''}</small></button>`; }).join('')}</div></details>`).join('')}</div>`;
    }).join('');
  }).join('');
}
function lessonList() {
  const topics = lessonListTopics();
  return `${courseTree()}<h2 style="margin:18px 0 6px">ภาพรวมรายหัวข้อ (สำหรับฝึกโจทย์)</h2>${topics}`;
}
function lessonListTopics() {
  const grp = g => Object.entries(LESSONS).filter(([, l]) => l.group === g).map(([k, l]) => {
    const n = allQ().filter(q => q.topic === k).length, st = topicStats().find(t => t.topic === k);
    return `<button class="lcard" data-a="openLesson" data-v="${esc(k)}"><b>${rt(l.title)}</b><small>${n} ข้อฝึก${st ? ' · แม่นยำ ' + pct(st.ok, st.n) + '%' : ''} · ${l.refs.length} แหล่งอ้างอิง${l.slides ? ' · 🎛 มีซิมูเลเตอร์' : ''}</small></button>`;
  }).join('');
  return Object.entries(GROUPS).map(([g, name]) => `<h2 style="margin-top:14px">${name}</h2><div class="presets">${grp(g)}</div>`).join('');
}
/* ---------- บทเรียนแบบสไลด์ (ข้อความ + ภาพ SVG + ซิมูเลเตอร์โต้ตอบ) ---------- */
function buildSlides(k) {
  const m = lessonMeta(k);
  if (m.ch) return [{ type: 'cover', h: m.title, intro: m.ch.intro || '', part: m.ch.part }, ...m.ch.slides, { type: 'end' }];
  const l = LESSONS[k], secs = l.sections.map(s => ({ type: 'text', h: s.h, bullets: s.items }));
  const s = [{ type: 'cover', h: l.title, intro: l.intro }];
  if (l.slides) { s.push(...l.slides); s.push({ type: 'divider', h: 'สรุปสูตรและแนวคิดสำคัญ' }); s.push(...secs); } else s.push(...secs);
  s.push({ type: 'text', h: 'ตัวอย่างทำให้ดู', bullets: [l.example.q, 'วิธีทำ: ' + l.example.sol] });
  s.push({ type: 'text', h: 'ข้อผิดพลาดที่พบบ่อย', bullets: l.pitfalls });
  s.push({ type: 'end' }); return s;
}
function slideHtml(sl, k) {
  const l = lessonMeta(k), n = allQ().filter(q => q.topic === l.topic).length, fig = sl.svg ? `<div class="slfig">${typeof sl.svg === 'function' ? sl.svg() : sl.svg}</div>` : '';
  const note = sl.note ? `<div class="slnote">💡 ${rt(sl.note)}</div>` : '';
  if (sl.type === 'cover') return `<div class="cover"><div class="big">${l.group === 'tpat3' ? '⚙️' : l.group === 'tgat' ? '🧠' : '🔬'}</div><h1>${rt(sl.h)}</h1><p>${rt(sl.intro)}</p><div class="mute">กด ▶ หรือปัดซ้ายเพื่อเริ่ม · มี ${LS.slides.filter(x => x.type === 'sim').length} ซิมูเลเตอร์ให้ลองปรับค่า</div></div>`;
  if (sl.type === 'divider') return `<div class="cover"><div class="big">📐</div><h1>${rt(sl.h)}</h1></div>`;
  if (sl.type === 'sim') return `<h2>🎛 ${rt(sl.h)}</h2><div id="simhost"></div>${note}`;
  if (sl.type === 'end') return `<h2>ไปต่อ</h2><div class="row" style="margin:10px 0"><button class="pri" data-a="practiceTopic" data-v="${esc(l.topic)}" ${n ? '' : 'disabled'}>ฝึกหัวข้อนี้ (${n} ข้อ)</button></div>${refsHtml(l.refs)}`;
  if (sl.type === 'proof') return `<h2>🧪 ที่มาของสูตร: ${rt(sl.h)}</h2><div class="proofbadge">ส่วนเสริมสำหรับคนที่อยากรู้ที่มา — ข้ามได้ ไม่กระทบการทำข้อสอบ</div><ol class="steps proof">${sl.steps.map((s, i) => `<li style="animation-delay:${.15 + i * .3}s">${rt(s)}</li>`).join('')}</ol>${sl.concl ? `<div class="exans" style="animation-delay:${.2 + sl.steps.length * .3}s">∴ <b>${rt(sl.concl)}</b></div>` : ''}${note}`;
  if (sl.type === 'formula') return `<h2>🧮 ${rt(sl.h)}</h2><div class="ftable">${sl.rows.map((r, i) => `<div class="frow" style="animation-delay:${.1 + i * .12}s"><code>${rt(r[0])}</code><span>${rt(r[1])}</span></div>`).join('')}</div>${note}`;
  if (sl.type === 'example') return `<h2>✏️ ${rt(sl.h)}</h2><div class="exq">${nl(sl.q)}</div>${fig}<ol class="steps">${sl.steps.map((s, i) => `<li style="animation-delay:${.15 + i * .3}s">${rt(s)}</li>`).join('')}</ol><div class="exans" style="animation-delay:${.2 + sl.steps.length * .3}s">✔ คำตอบ: <b>${rt(sl.ans)}</b></div>${note}`;
  return `<h2>${sl.cls === 'trap' ? '⚠️ ' : ''}${rt(sl.h)}</h2>${fig}<ul class="bul ${sl.cls || ''}">${(sl.bullets || []).map((b, i) => `<li style="animation-delay:${.12 + i * .2}s">${rt(b)}</li>`).join('')}</ul>${note}`;
}
function lessonView(k) {
  if (!LS || LS.k !== k) LS = { k, i: 0, slides: buildSlides(k), sim: null, dir: '' };
  const n = LS.slides.length, sl = LS.slides[LS.i], dir = LS.dir; LS.dir = '';
  const dots = n <= 22 ? LS.slides.map((s, i) => `<i class="d ${i === LS.i ? 'on' : ''} ${s.type === 'sim' ? 'sm' : ''}" data-a="slideGo" data-v="${i}"></i>`).join('') : '';
  return `<div class="row between"><button data-a="lessonBack">← รายการบทเรียน</button><span class="mute">${LS.i + 1} / ${n}</span></div>
  <div class="deck"><div class="prog"><i style="width:${(LS.i + 1) / n * 100}%"></i></div>
  <article class="slide ${dir}">${slideHtml(sl, k)}</article>
  <div class="deckfoot"><button data-a="slidePrev" ${LS.i === 0 ? 'disabled' : ''} aria-label="สไลด์ก่อนหน้า">◀</button><div class="dots">${dots}</div><button class="pri" data-a="slideNext" ${LS.i === n - 1 ? 'disabled' : ''} aria-label="สไลด์ถัดไป">▶</button></div></div>`;
}

/* ====================== actions ====================== */
const ACT = {
  ...ADMIN_ACT, ...ACH_ACT,
  setDate() { examDate = val('ed'); save(); render(true); },
  setExam(v) { examDate = v; save(); if ((location.hash || '#/') === '#/') render(true); else alert('ตั้งวันนับถอยหลังเป็น ' + v + ' แล้ว (ดูที่หน้าแรก)'); },
  themeOpen() { themeSheet(true); }, themeClose() { themeSheet(false); },
  themePick(v) { setTheme(v); render(true); themeSheet(true); },
  schemePick(v) { setScheme(v); render(true); themeSheet(true); },
  xmode(v) { X.mode = v; render(true); },
  preset(v) { const p = PRESETS[+v], l = allQ().filter(p.f), mode = location.hash === '#/exam' ? X.mode : 'mock'; beginExam(mode, mode === 'practice' ? shuffle(l) : l, p.t); },
  startExam,
  practiceTopic(v) { X.mode = 'practice'; X.group = ''; X.subject = ''; X.topic = v; X.src = 'all'; X.n = 20; X.shuffle = true; location.hash = '#/exam'; E = null; startExam(); },
  pick(v) {
    const i = +v, q = E.list[E.i];
    if (E.mode === 'mock') { E.ans[E.i] = E.ans[E.i] === i ? undefined : i; if (E.ans[E.i] === undefined) delete E.ans[E.i]; render(true); return; }
    if (E.rev[E.i]) return;
    leave(); E.ans[E.i] = i; E.rev[E.i] = true;
    attempts.push({ ts: Date.now(), qid: q.id, group: q.group, subject: q.subject, topic: q.topic, ok: i === q.a, secs: Math.round(E.qs[E.i] || 0), mode: 'practice' });
    if (E.daily) dailyRecord(q.id, i === q.a);
    save(); render(true);
  },
  numSubmit() {
    const q = E.list[E.i], v = val('numans'); if (v === '' || E.rev[E.i]) return;
    leave(); E.ans[E.i] = v; E.rev[E.i] = true;
    attempts.push({ ts: Date.now(), qid: q.id, group: q.group, subject: q.subject, topic: q.topic, ok: isRight(q, v), secs: Math.round(E.qs[E.i] || 0), mode: 'practice' });
    if (E.daily) dailyRecord(q.id, isRight(q, v));
    save(); render(true);
  },
  next() { goTo(E.i + 1, 'next'); }, prev() { goTo(E.i - 1, 'prev'); },
  go(v) { goTo(+v); },
  flag() { E.flag[E.i] = !E.flag[E.i]; render(true); },
  mark(id) { marks = marks.includes(id) ? marks.filter(x => x !== id) : [...marks, id]; save(); render(true); },
  omr() { E.omr = true; render(true); }, omrclose() { E.omr = false; render(true); },
  finish() {
    const left = E.list.length - Object.keys(E.ans).length;
    if (E.mode === 'mock' && left && !confirm(`ยังไม่ได้ตอบ ${left} ข้อ ส่งเลยไหม?`)) return;
    submitExam(false);
  },
  quit() { if (confirm('ออกจากข้อสอบ? ความคืบหน้าจะหายไป')) { E = null; render(); } },
  resetE() { E = null; render(); },
  tmode(v) { if (T.running) tPause(); T.mode = v; T.base = 0; T.phase = 'focus'; T.remain = T.focusMin * 60; render(true); },
  tpreset(v) { const [f, b] = v.split(',').map(Number); T.focusMin = f; T.breakMin = b; if (!T.running) { T.phase = 'focus'; T.remain = f * 60; } render(true); },
  tstart: tStart, tpause: tPause, treset() { tReset(false); }, tstop() { tReset(true); },
  ltab(v) { libTab = v; if (v !== 'lessons') libOpen = ''; render(true); },
  dailyStart() {
    const d = getDaily(), rest = d.ids.filter(id => !(id in d.results)).map(dqById).filter(Boolean);
    if (!rest.length) { toast('ภารกิจวันนี้ครบแล้ว 🎉 พรุ่งนี้มีชุดใหม่ — หรือกด "ทำข้อสอบ" เพื่อฝึกเพิ่ม'); return; }
    location.hash = '#/exam'; E = null; beginExam('practice', rest, 'ภารกิจวันนี้'); E.daily = true;
  },
  dailyRead() { const d = getDaily(); if (d.chapter) ACT.openLesson('ch:' + d.chapter); },
  dailyGoalSet(v) { store.set('dailyGoal', +v); render(true); },
  nickEdit() { const n = prompt('ชื่อ/ชื่อเล่นที่จะปักบนอกเสื้อช็อป (ไม่เกิน 8 ตัวอักษร)', store.get('nick', 'น้องวิศวะ')); if (n !== null && n.trim()) { store.set('nick', n.trim().slice(0, 8)); render(true); } },
  openLesson(v) { if (String(v).startsWith('ch:')) markRead(String(v).slice(3)); killSim(); LS = null; libTab = 'lessons'; libOpen = v; if (location.hash !== '#/library') location.hash = '#/library'; else render(); },
  lessonBack() { killSim(); libOpen = ''; LS = null; render(); },
  slideNext() { if (LS && LS.i < LS.slides.length - 1) { LS.i++; LS.dir = 'next'; render(true); } },
  slidePrev() { if (LS && LS.i > 0) { LS.i--; LS.dir = 'prev'; render(true); } },
  slideGo(v) { if (LS) { LS.dir = +v > LS.i ? 'next' : 'prev'; LS.i = +v; render(true); } },
  addRec() { const p = +val('rp'), t = +val('rt'); if (!val('ry') || !t) return; records.push({ y: val('ry'), s: val('rs'), p, t, n: val('rn') }); save(); render(true); },
  delRec(v) { records.splice(+v, 1); save(); render(true); },
  doImport() {
    try {
      const arr = JSON.parse(val('imp')); if (!Array.isArray(arr)) throw 0;
      let n = 0;
      arr.forEach(o => {
        if (!o || !o.q || !Array.isArray(o.c) || o.c.length < 2 || o.c.length > 5 || !(o.a >= 0 && o.a < o.c.length) || !GROUPS[o.group]) return;
        custom.push({ id: 'c' + Date.now() + '-' + n, group: o.group, subject: String(o.subject || 'นำเข้า'), topic: String(o.topic || 'นำเข้า'), diff: 2, q: String(o.q), c: o.c.map(x => { x = String(x); return isFig(x) ? ' ' + x : x; }), a: o.a, exp: String(o.exp || ''), passage: o.passage ? String(o.passage) : undefined }); n++;
      });
      save(); alert(`นำเข้าสำเร็จ ${n} ข้อ`); render(true);
    } catch { alert('รูปแบบ JSON ไม่ถูกต้อง'); }
  },
  clearImport() { if (confirm('ลบโจทย์ที่นำเข้าทั้งหมด?')) { custom = []; save(); render(true); } },
  exportData() {
    const blob = new Blob([JSON.stringify({ v: 2, attempts, studies, mocks, records, custom, marks, examDate, goalMin }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'sixent-data.json'; a.click();
  },
  resetData() { if (confirm('ล้างข้อมูลสถิติและบันทึกทั้งหมด? ย้อนกลับไม่ได้')) { attempts = []; studies = []; mocks = []; records = []; custom = []; marks = []; examDate = ''; save(); render(true); } },
};
document.addEventListener('change', e => {
  if (e.target.dataset.change !== 'importFile') return;
  const f = e.target.files[0]; if (!f) return;
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const d = JSON.parse(rd.result); if (!confirm('นำเข้าจะแทนที่ข้อมูลปัจจุบันบนเครื่องนี้ ต้องการต่อไหม?')) return;
      const arr = k => Array.isArray(d[k]) ? d[k] : [];
      attempts = arr('attempts'); studies = arr('studies'); mocks = arr('mocks'); records = arr('records'); custom = arr('custom').filter(q => q && q.q && Array.isArray(q.c)).map(q => ({ ...q, fig: undefined })); marks = arr('marks'); examDate = d.examDate || ''; goalMin = d.goalMin || 60;
      save(); render(true);
    } catch { alert('ไฟล์ไม่ถูกต้อง'); }
  };
  rd.readAsText(f);
});
/* ====================== ธีมสีมหาวิทยาลัย ====================== */
function isDark() { const s = store.get('scheme', 'auto'); return s === 'dark' || (s === 'auto' && matchMedia('(prefers-color-scheme:dark)').matches); }
function applyTheme() {
  const t = THEMES.find(x => x.id === store.get('theme', 'sixent')) || THEMES[0], r = document.documentElement, sc = store.get('scheme', 'auto'), dark = isDark();
  if (sc === 'auto') r.removeAttribute('data-scheme'); else r.setAttribute('data-scheme', sc);
  ['--pri', '--pri2', '--grad', '--onpri'].forEach(p => r.style.removeProperty(p));
  if (t.id !== 'sixent') { r.style.setProperty('--pri', dark ? t.pd : t.pl); r.style.setProperty('--pri2', `color-mix(in srgb, var(--pri) ${dark ? 24 : 12}%, var(--card))`); r.style.setProperty('--grad', `linear-gradient(135deg,${t.g[0]},${t.g[1]} 55%,${t.g[2]})`); r.style.setProperty('--onpri', dark ? '#10131f' : '#fff'); }
  const mt = document.querySelector('meta[name=theme-color]'); if (mt) mt.content = t.pl;
  const sub = document.querySelector('.brand small'); if (sub) sub.textContent = t.s ? 'ติวเข้าวิศวะ · ' + t.s : 'ติวเข้าวิศวะ';
}
function setTheme(id) { store.set('theme', id); achMark('theme', id); applyTheme(); }
function setScheme(s) { store.set('scheme', s); applyTheme(); }
function themeSheet(open) {
  let el = $('#themesheet'); if (el) el.remove(); if (!open) return;
  const cur = store.get('theme', 'sixent'), sc = store.get('scheme', 'auto');
  const sw = t => `<button class="swatch ${cur === t.id ? 'on' : ''}" data-a="themePick" data-v="${t.id}" style="--s1:${t.g[0]};--s2:${t.g[1]};--s3:${t.g[2]}"><i></i><span><b>${esc(t.s || 'SIXENT')}</b><small>${esc(t.c)}</small></span>${cur === t.id ? '<em>✓</em>' : ''}</button>`;
  el = document.createElement('div'); el.id = 'themesheet'; el.className = 'omr';
  el.setAttribute('data-a', 'themeClose');
  el.innerHTML = `<div><div class="row between"><h2 style="margin:0">🎨 ธีมสีตามมหาวิทยาลัย</h2><button data-a="themeClose">ปิด</button></div>
    <p class="mute" style="margin:6px 0">เลือกสีของมหาวิทยาลัยวิศวะที่อยากเข้า — แปดเสือวิศวะ</p>
    <div class="swgrid">${THEMES.filter(t => t.id === 'sixent' || t.e8).map(sw).join('')}</div>
    <p class="mute" style="margin:10px 0 4px">มหาวิทยาลัยอื่นที่มีคณะวิศวะ</p><div class="swgrid">${THEMES.filter(t => t.id !== 'sixent' && !t.e8).map(sw).join('')}</div>
    <p class="mute" style="margin:10px 0 4px">โหมดหน้าจอ</p><div class="chips">${[['auto', 'อัตโนมัติ'], ['light', '☀ สว่าง'], ['dark', '🌙 มืด']].map(([k, v]) => `<button class="chip ${sc === k ? 'on' : ''}" data-a="schemePick" data-v="${k}">${v}</button>`).join('')}</div>
    <p class="mute" style="font-size:12px">ชื่อสีอ้างอิงสีประจำมหาวิทยาลัยจาก Wikipedia เฉดที่แสดงเป็นค่าโดยประมาณ ไม่ใช่รหัสสีทางการ</p></div>`;
  document.body.appendChild(el);
}
matchMedia('(prefers-color-scheme:dark)').addEventListener('change', applyTheme);
applyTheme();
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => { });
render();

// หลัง render: บันทึกสไลด์พิสูจน์/ซิมูเลเตอร์ที่เปิดดู แล้วตรวจความสำเร็จ
function achAfterRender(r) {
  if (r === 'library' && LS) { const sl = LS.slides[LS.i]; if (sl && sl.type === 'proof') achMark('proof', LS.k + ':' + LS.i); if (sl && sl.type === 'sim' && sl.sim) achMark('sim', sl.sim); }
  achCheck(store.get('ach', null) === null); // ครั้งแรกที่มีระบบนี้: ปลดล็อกของเดิมแบบเงียบ ๆ ไม่ให้ toast ท่วม
}
