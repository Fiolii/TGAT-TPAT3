'use strict';
/* ====================== helpers & storage ====================== */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nl = s => esc(s).replace(/\n/g, '<br>');
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
  if (q.c.every(s => /^[\d−\-.([]/.test(s))) return;
  let h = 0; for (const ch of q.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const t = h % q.c.length;[q.c[q.a], q.c[t]] = [q.c[t], q.c[q.a]]; q.a = t;
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

const PER_MIN = { TPAT3: 180 / 70, TGAT1: 1, TGAT2: 60 / 80, TGAT3: 1.5 }; // นาที/ข้อ ตามโครงสร้างจริงโดยประมาณ
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
  $('#app').innerHTML = `<div class="${r === 'exam' && E && !E.done ? '' : 'view'}">${(routes[r] || viewHome)()}</div>`;
  if (!keepScroll) window.scrollTo(0, 0);
  tick();
}
window.addEventListener('hashchange', () => render());
document.addEventListener('click', e => {
  const b = e.target.closest('[data-a]'); if (!b || b.disabled) return;
  if (b.classList.contains('omr') && e.target !== b) return; // คลิกในแผ่นกระดาษคำตอบไม่ปิด
  const fn = ACT[b.dataset.a]; if (fn) fn(b.dataset.v, b);
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
document.addEventListener('touchstart', e => { tOn = !!e.target.closest('.sheet'); tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
document.addEventListener('touchend', e => {
  if (!tOn || !E || E.done) return; tOn = false;
  const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
  if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) (dx < 0 ? ACT.next : ACT.prev)();
}, { passive: true });
document.addEventListener('keydown', e => {
  if (!E || E.done || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  if (e.key === 'ArrowRight') ACT.next(); else if (e.key === 'ArrowLeft') ACT.prev();
  else if ('12345'.includes(e.key) && E.list[E.i].c[+e.key - 1] !== undefined) ACT.pick(String(+e.key - 1));
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
  return `<div class="card hero"><h1>พร้อมติวหรือยัง? 🚀</h1><p>เปิดข้อสอบทีละหน้าเหมือนสนามจริง ทบทวนจุดอ่อน และจับเวลาการอ่าน</p>
    <div class="row"><a class="btn w" href="#/exam">เริ่มทำข้อสอบ</a><a class="btn" href="#/timer">เริ่มจับเวลา</a></div></div>
  <div class="grid2">
    <div class="card"><h2>เป้าหมายวันนี้</h2><div class="row" style="gap:18px">${ring(mins / goalMin, 120, mins + ' น.', 'จาก ' + goalMin)}
      <div><div class="mute">streak</div><b style="font-size:24px">🔥 ${streak()} วัน</b><div style="margin-top:8px"><label><span>เป้าหมาย (นาที/วัน)</span><input type="number" min="5" value="${goalMin}" data-change="goal" style="width:90px"></label></div></div></div></div>
    <div class="card"><h2>ภาพรวม</h2><div class="grid" style="grid-template-columns:1fr 1fr">
      <div><b style="font-size:26px">${total ? pct(ok, total) + '%' : '-'}</b><div class="mute">แม่นยำ (${total} ข้อ)</div></div>
      <div><b style="font-size:26px">${cd}</b><div class="mute">${cdsub}</div></div></div>
      <div class="row" style="margin-top:10px"><input type="date" id="ed" value="${esc(examDate)}"><button data-a="setDate">ตั้งวันสอบ</button></div></div>
  </div>
  <div class="card"><h2>แนะนำให้ทบทวน</h2>${weak.length ? weak.map(t => `<div class="row between" style="padding:6px 0"><span>${esc(t.topic)} <span class="mute">แม่นยำ ${pct(t.ok, t.n)}% · ${t.n} ข้อ</span></span><span><button data-a="practiceTopic" data-v="${esc(t.topic)}">ฝึก</button> ${LESSONS[t.topic] ? `<button data-a="openLesson" data-v="${esc(t.topic)}">อ่านบทเรียน</button>` : ''}</span></div>`).join('') : '<span class="mute">ยังไม่มีข้อมูลเพียงพอ — ทำโจทย์ให้ได้อย่างน้อย 3 ข้อต่อหัวข้อ แล้วระบบจะชี้จุดอ่อนให้</span>'}</div>
  <div class="card"><h2>ชุดข้อสอบ</h2><div class="presets">${PRESETS.map((p, i) => `<button class="preset" data-a="preset" data-v="${i}"><b>${p.t}</b><small>${allQ().filter(p.f).length} ข้อ · ≈ ${mockMinutes(allQ().filter(p.f))} นาที</small></button>`).join('')}</div></div>`;
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
    <div role="radiogroup">${q.c.map((c, i) => {
    let cls = '';
    if (shown) cls = i === q.a ? 'ok' : (i === picked ? 'bad' : ''); else if (picked === i) cls = 'sel';
    return `<button class="opt ${cls}" role="radio" aria-checked="${picked === i}" data-a="pick" data-v="${i}" ${shown ? 'disabled' : ''}><span class="bub">${LETTERS[i] || i + 1}</span><span>${esc(c)}</span></button>`;
  }).join('')}</div>
    ${shown ? `<div class="exp"><b>${picked === q.a ? '✅ ถูกต้อง!' : '❌ เฉลย: ' + LETTERS[q.a] + '. ' + esc(q.c[q.a])}</b><div style="margin-top:6px">${nl(q.exp || '')}</div>${q.tip ? `<div class="tip">💡 ${esc(q.tip)}</div>` : ''}
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
    const ok = E.ans[i] === q.a; if (ok) score++;
    if (mock && E.ans[i] != null) attempts.push({ ts: Date.now(), qid: q.id, group: q.group, subject: q.subject, topic: q.topic, ok, secs: Math.round(E.qs[i] || 0), mode: 'mock' });
  });
  E.score = score; E.secs = Math.min((Date.now() - E.t0) / 1000, E.mins * 60); E.done = true; E.auto = !!auto; E.omr = false;
  if (mock) mocks.push({ ts: Date.now(), set: E.label, score, total: n, secs: Math.round(E.secs) });
  save(); render();
  if (pct(score, n) >= 70) setTimeout(confetti, 400);
}
function examResult() {
  const n = E.list.length, p = pct(E.score, n), by = {};
  E.list.forEach((q, i) => { const t = by[q.topic] ||= { n: 0, ok: 0 }; t.n++; if (E.ans[i] === q.a) t.ok++; });
  const msg = p >= 80 ? 'เยี่ยมมาก! 🎉' : p >= 60 ? 'ดีเลย ไปต่ออีกนิด 💪' : 'ไม่เป็นไร ทบทวนจุดที่พลาดแล้วลองใหม่ 📚';
  setTimeout(() => { const f = document.querySelector('.ring-fg'); if (f) f.style.strokeDashoffset = 2 * Math.PI * 52 * (1 - p / 100); }, 60);
  return `<h1>ผลการสอบ ${E.auto ? '<span class="tag warn">หมดเวลา ส่งอัตโนมัติ</span>' : ''}</h1>
  <div class="card ctr">${ring(0, 170, E.score + '/' + n, p + '%')}<p style="margin:10px 0 2px"><b>${msg}</b></p><div class="mute">ใช้เวลา ${fmt(E.secs)} ${E.mode === 'mock' ? 'จาก ' + E.mins + ' นาที' : ''} · ตอบแล้ว ${Object.keys(E.ans).length}/${n} ข้อ</div>
    <div class="row" style="justify-content:center;margin-top:12px"><button class="pri" data-a="resetE">ทำชุดใหม่</button><a class="btn" href="#/stats">ดูสถิติ</a></div></div>
  <div class="card"><h2>รายหัวข้อ</h2><div class="tbl"><table>${Object.entries(by).map(([t, v]) => `<tr><td>${esc(t)}</td><td>${v.ok}/${v.n}</td><td style="width:40%"><div class="bar ${pct(v.ok, v.n) >= 60 ? 'g' : 'r'}"><i style="width:${pct(v.ok, v.n)}%"></i></div></td></tr>`).join('')}</table></div></div>
  <div class="card"><h2>ทบทวนทีละข้อ</h2>${E.list.map((q, i) => { const mine = E.ans[i], ok = mine === q.a; return `<div class="rv"><div class="row between"><b>ข้อ ${i + 1}</b><span class="tag ${ok ? 'ok' : 'bad'}">${mine == null ? 'ไม่ได้ตอบ' : ok ? 'ถูก' : 'ผิด'}</span></div>
    ${q.passage ? `<details><summary>ดูบทอ่าน/ข้อมูล</summary><div class="passage">${nl(q.passage)}</div></details>` : ''}<div style="margin:4px 0">${nl(q.q)}</div>${q.fig ? q.fig : ''}
    <div class="mute">คุณตอบ: ${mine != null ? LETTERS[mine] + '. ' + esc(q.c[mine]) : '(ว่าง)'} · เฉลย: <b style="color:var(--ok)">${LETTERS[q.a]}. ${esc(q.c[q.a])}</b></div>
    <div class="exp"><div>${nl(q.exp || '')}</div>${q.tip ? `<div class="tip">💡 ${esc(q.tip)}</div>` : ''}${lessonFor(q) ? `<div style="margin-top:6px"><a href="#/library" data-a="openLesson" data-v="${esc(q.topic)}" onclick="return false">📚 บทเรียน: ${esc(q.topic)}</a></div>` : ''}</div></div>`; }).join('')}</div>`;
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
function viewLibrary() {
  const tabs = [['lessons', 'บทเรียน'], ['info', 'ข้อมูลการสอบ'], ['sources', 'แหล่งข้อสอบเก่า'], ['records', 'ผลสอบเก่าของฉัน'], ['import', 'นำเข้าโจทย์']];
  let body = '';
  if (libTab === 'lessons') body = libOpen && LESSONS[libOpen] ? lessonView(libOpen) : lessonList();
  if (libTab === 'info') body = `<div class="warnbox" style="margin-bottom:12px">⚠ โครงสร้างข้อสอบด้านล่างอ้างอิงแนวข้อสอบ/คู่มือปี 2022 (ตรวจเมื่อ พ.ย. 2026) — ปีที่คุณสอบอาจเปลี่ยน ให้ยืนยันกับ <a href="${SOURCES.tcas.u}" target="_blank" rel="noopener">mytcas.com</a> และ <a href="${SOURCES.niets.u}" target="_blank" rel="noopener">สทศ.</a> เสมอ</div>
    ${EXAM_INFO.map(e => `<div class="card"><h2>${esc(e.name)}</h2><div class="row"><span class="tag">${e.items}</span><span class="tag">${e.time}</span><span class="tag">คะแนนเต็ม ${e.score}</span></div><ul>${e.parts.map(p => `<li>${esc(p)}</li>`).join('')}</ul><div class="mute">ที่มา: <a href="${e.src.u}" target="_blank" rel="noopener">${esc(e.src.t)}</a></div></div>`).join('')}`;
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
  return `<h1>คลังความรู้</h1><div class="chips">${tabs.map(([k, v]) => `<button class="chip ${libTab === k ? 'on' : ''}" data-a="ltab" data-v="${k}">${v}</button>`).join('')}</div>${body}`;
}
function lessonList() {
  const grp = g => Object.entries(LESSONS).filter(([, l]) => l.group === g).map(([k, l]) => {
    const n = allQ().filter(q => q.topic === k).length, st = topicStats().find(t => t.topic === k);
    return `<button class="lcard" data-a="openLesson" data-v="${esc(k)}"><b>${esc(l.title)}</b><small>${n} ข้อฝึก${st ? ' · แม่นยำ ' + pct(st.ok, st.n) + '%' : ''} · ${l.refs.length} แหล่งอ้างอิง</small></button>`;
  }).join('');
  return Object.entries(GROUPS).map(([g, name]) => `<h2 style="margin-top:14px">${name}</h2><div class="presets">${grp(g)}</div>`).join('');
}
function lessonView(k) {
  const l = LESSONS[k], n = allQ().filter(q => q.topic === k).length;
  return `<button data-a="lessonBack">← กลับ</button><div class="card lesson" style="margin-top:12px"><h1 style="margin-top:0">${esc(l.title)}</h1><p>${esc(l.intro)}</p>
  ${l.sections.map(s => `<h3>${esc(s.h)}</h3><ul>${s.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`).join('')}
  <div class="ex"><b>ตัวอย่าง</b><div>${esc(l.example.q)}</div><div class="mute" style="margin-top:4px">วิธีทำ: ${esc(l.example.sol)}</div></div>
  <h3>ข้อผิดพลาดที่พบบ่อย</h3><ul>${l.pitfalls.map(p => `<li>${esc(p)}</li>`).join('')}</ul>
  <div class="row" style="margin:12px 0"><button class="pri" data-a="practiceTopic" data-v="${esc(k)}" ${n ? '' : 'disabled'}>ฝึกหัวข้อนี้ (${n} ข้อ)</button></div>
  <h3>แหล่งที่มา / อ่านต่อ</h3><div class="refs">${l.refs.map(r => `<a href="${r.u}" target="_blank" rel="noopener">🔗 ${esc(r.t)}</a>`).join('')}</div></div>`;
}

/* ====================== actions ====================== */
const ACT = {
  setDate() { examDate = val('ed'); save(); render(true); },
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
  openLesson(v) { libTab = 'lessons'; libOpen = v; if (location.hash !== '#/library') location.hash = '#/library'; else render(); },
  lessonBack() { libOpen = ''; render(); },
  addRec() { const p = +val('rp'), t = +val('rt'); if (!val('ry') || !t) return; records.push({ y: val('ry'), s: val('rs'), p, t, n: val('rn') }); save(); render(true); },
  delRec(v) { records.splice(+v, 1); save(); render(true); },
  doImport() {
    try {
      const arr = JSON.parse(val('imp')); if (!Array.isArray(arr)) throw 0;
      let n = 0;
      arr.forEach(o => {
        if (!o || !o.q || !Array.isArray(o.c) || o.c.length < 2 || o.c.length > 5 || !(o.a >= 0 && o.a < o.c.length) || !GROUPS[o.group]) return;
        custom.push({ id: 'c' + Date.now() + '-' + n, group: o.group, subject: String(o.subject || 'นำเข้า'), topic: String(o.topic || 'นำเข้า'), diff: 2, q: String(o.q), c: o.c.map(String), a: o.a, exp: String(o.exp || ''), passage: o.passage ? String(o.passage) : undefined }); n++;
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
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => { });
render();
