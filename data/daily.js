// ภารกิจรายวัน (โจทย์ประจำวัน + บทเรียนแนะนำ), เสื้อช็อปวิศวะ และคำคมประจำวัน
// ฟังก์ชันที่ใช้ตัวแปรของ app.js (store, attempts, allQ, dayKey, ...) ถูกเรียกหลัง app.js โหลดแล้วเท่านั้น
const QUOTES = [
  { t: 'นักวิทยาศาสตร์ศึกษาโลกที่เป็นอยู่ วิศวกรสร้างโลกที่ไม่เคยมีมาก่อน', by: 'Theodore von Kármán' },
  { t: 'สิ่งที่ฉันสร้างไม่ได้ ฉันก็ยังไม่เข้าใจมันจริง ๆ', by: 'Richard Feynman (ข้อความบนกระดานดำของเขา)' },
  { t: 'วิธีทำนายอนาคตที่ดีที่สุด คือการสร้างมันขึ้นมา', by: 'Alan Kay' },
  { t: 'ถ้าฉันมองได้ไกลกว่าคนอื่น นั่นเพราะฉันยืนอยู่บนไหล่ของยักษ์', by: 'Isaac Newton (จดหมายถึงโรเบิร์ต ฮุก ค.ศ. 1675)' },
  { t: 'ความเป็นอัจฉริยะคือแรงบันดาลใจ 1% และเหงื่อ 99%', by: 'Thomas Edison (ที่มักถูกอ้างถึง)' },
  { t: 'ปัญหาทุกข้อมีทางออก ถ้าวาด free-body diagram ถูก' },
  { t: 'อย่าเพิ่งท้อ ค่าความคลาดเคลื่อนของคุณยังอยู่ในพิกัดเผื่อ' },
  { t: 'g = 10 ถ้าโจทย์บอกให้ใช้ 10 — อย่าเถียงกับโจทย์' },
  { t: 'หน่วยไม่ตรง = ตอบผิด ต่อให้ตัวเลขสวยแค่ไหน' },
  { t: 'บั๊กไม่ใช่ปัญหา มันคือฟีเจอร์ที่ยังไม่ได้เขียนเอกสาร' },
  { t: 'วิศวะไม่ได้เก่งเพราะสูตรเยอะ แต่เก่งเพราะไม่ยอมแพ้ตอนสูตรไม่ออก' },
  { t: 'เสื้อช็อปเปื้อนจารบี คือหลักฐานว่าคุณลงมือทำจริง' },
  { t: 'ทดลองซ้ำสามครั้ง แล้วค่อยบอกว่า "มันไม่เวิร์ก" — และจดผลทุกครั้ง' },
  { t: 'ความล้มเหลวไม่ใช่จุดจบ มันคือต้นแบบรุ่นที่ 1' },
  { t: 'ระบบที่ดีมี feedback — โจทย์ที่ทำผิดคือ feedback ที่ดีที่สุด' },
  { t: 'สมดุลที่ดีที่สุดคือ Στ = 0 ของชีวิต: เรียน พัก เล่น' },
  { t: 'ทุกเฟืองหมุนได้เพราะมีเฟืองอื่นหมุนสวนทาง — เพื่อนร่วมสู้ก็เช่นกัน' },
  { t: 'ทำ sanity check ทุกครั้ง: ถ้าคำตอบคือคนวิ่ง 500 m/s แปลว่าคุณผิดที่ไหนสักแห่ง' },
  { t: 'ถ้าติดโจทย์ ให้ลดโจทย์เป็นภาพ แล้วลดภาพเป็นสมการ' },
  { t: 'ถ้ามันใช้งานได้ อย่าไปแตะ ถ้าใช้ไม่ได้ ลองอ่านโจทย์ใหม่อีกรอบ' },
  { t: 'ความเร็วต่ำกว่าแสง ความขยันต่ำกว่าเส้นตาย — วันละ 10 ข้อก็พอแล้ว' },
  { t: 'อย่าเปรียบเทียบตัวเองกับเพื่อน เปรียบเทียบกับตัวเองเมื่อวาน (Δ > 0 ก็ชนะ)' },
  { t: 'ถ้าเข้าใจสูตรจากที่มา คุณจะไม่ต้องท่องสูตร' },
  { t: 'สะพานที่ยิ่งใหญ่เริ่มจากการเลือกวัสดุให้ถูก — และนอนให้พอ' },
  { t: 'พักสมองสักห้านาที ก็เหมือนรีเซ็ตเครื่อง ไม่ใช่แพ้' },
  { t: 'โจทย์ยากคือโจทย์ง่ายที่ยังไม่ได้แยกส่วน' },
  { t: 'วิศวกรที่ดีไม่ใช่คนที่ไม่เคยพลาด แต่คือคนที่ออกแบบให้พลาดแล้วไม่พัง' },
  { t: 'เมื่อไม่แน่ใจ ให้ทดสอบด้วยกรณีง่าย ๆ ก่อน (x = 0, x = 1)' },
  { t: 'ฝันให้ใหญ่ แต่แก้บั๊กทีละบรรทัด' },
];
const TITLES = [[0, 'น้องใหม่ (ปี 1)'], [60, 'ปี 2'], [180, 'ปี 3'], [400, 'ปี 4'], [800, 'วิศวกรฝึกหัด'], [1500, 'วิศวกรมืออาชีพ']];
const hashStr = s => { let h = 2166136261; for (const c of String(s)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
const dqById = id => allQ().find(q => q.id === id);
const todayKey = () => dayKey(Date.now());
const dayNum = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5);
function quoteOfDay(offset) { const q = QUOTES[(hashStr(todayKey()) + (offset || 0)) % QUOTES.length]; return q; }
function quoteHtml(q) { q = q || quoteOfDay(); return `<div class="quote"><span class="qm">“</span>${esc(q.t)}${q.by ? `<small>— ${esc(q.by)}</small>` : ''}</div>`; }

/* ---------- ภารกิจรายวัน ---------- */
const dailyGoal = () => store.get('dailyGoal', 10);
function readLog() { return store.get('readlog', {}); }
function markRead(chId) { const l = readLog(); l[chId] = Date.now(); store.set('readlog', l); }
function pickChapter() {
  const log = readLog(), recent = id => log[id] && Date.now() - log[id] < 5 * 864e5;
  for (const t of weakTopics()) { const c = COURSE.find(x => x.topic === t.topic && !recent(x.id)); if (c) return c.id; }
  const n = COURSE.length; for (let k = 0; k < n; k++) { const c = COURSE[(dayNum() + k) % n]; if (!recent(c.id)) return c.id; }
  return COURSE[dayNum() % n].id;
}
function buildDaily(goal) {
  const last = {}; attempts.forEach(a => last[a.qid] = a);
  const weak = new Set(weakTopics().map(t => t.topic)), rng = FIG.rnd('daily-' + todayKey()), now = Date.now();
  const score = q => {
    let s = rng() * 1.2; const l = last[q.id];
    if (!l) s += 2; else if (!l.ok) s += 3.5; else { const age = (now - l.ts) / 864e5; s += age > 14 ? .8 : age > 3 ? 0 : -2; }
    if (weak.has(q.topic)) s += 1.5; if (q.diff === 3) s += .2; return s;
  };
  const pool = allQ().map(q => [score(q), q]).sort((a, b) => b[0] - a[0]).map(x => x[1]);
  const quota = { tpat3: Math.round(goal * .4), alevel: Math.round(goal * .3) }; quota.tgat = goal - quota.tpat3 - quota.alevel;
  const cap = Math.max(2, Math.ceil(goal / 5)), chosen = [], used = {}, per = {};
  const take = (g, n) => { for (const q of pool) { if (n <= 0) break; if (chosen.includes(q) || (g && q.group !== g)) continue; if ((per[q.topic] || 0) >= cap) continue; chosen.push(q); per[q.topic] = (per[q.topic] || 0) + 1; n--; } };
  ['tpat3', 'alevel', 'tgat'].forEach(g => take(g, quota[g]));
  if (chosen.length < goal) take(null, goal - chosen.length);
  return chosen.sort((a, b) => a.diff - b.diff).map(q => q.id);
}
function getDaily() {
  const today = todayKey(), goal = dailyGoal(); let d = store.get('daily', null);
  if (d && d.date === today && d.goal === goal && d.ids.every(dqById)) return d;
  if (d && d.date !== today) { const log = store.get('dlog', {}); const res = d.results || {}; log[d.date] = { done: Object.keys(res).length, total: d.ids.length, ok: Object.values(res).filter(Boolean).length }; store.set('dlog', log); }
  d = { date: today, goal, ids: buildDaily(goal), results: {}, chapter: pickChapter() }; store.set('daily', d); return d;
}
function dailyRecord(qid, ok) { const d = getDaily(); if (!d.ids.includes(qid)) return; d.results[qid] = !!ok; store.set('daily', d); }
function missionStreak() {
  const log = store.get('dlog', {}), d = getDaily(); let n = 0; const day = new Date();
  const full = k => k === d.date ? Object.keys(d.results).length >= d.ids.length : (log[k] && log[k].done >= log[k].total && log[k].total > 0);
  if (!full(dayKey(day))) day.setDate(day.getDate() - 1);
  while (full(dayKey(day))) { n++; day.setDate(day.getDate() - 1); }
  return n;
}
function dailyCard() {
  const d = getDaily(), done = Object.keys(d.results).length, total = d.ids.length, okN = Object.values(d.results).filter(Boolean).length;
  const ch = COURSE.find(c => c.id === d.chapter), read = readLog()[d.chapter] && dayKey(readLog()[d.chapter]) === d.date;
  const mins = Math.round(todaySecs() / 60), all = done >= total, ms = missionStreak();
  const step = (ok, txt, btn) => `<div class="mstep ${ok ? 'ok' : ''}"><i>${ok ? '✓' : ''}</i><span>${txt}</span>${btn || ''}</div>`;
  return `<div class="card daily"><div class="row between"><h2 style="margin:0">🎯 ภารกิจวันนี้</h2><span class="tag ${all ? 'ok' : ''}">${all ? 'ครบแล้ว!' : 'ยังไม่ครบ'}${ms ? ' · 🔥 ' + ms + ' วันติด' : ''}</span></div>
    <p class="mute" style="margin:4px 0 10px">เปิดแอปมาไม่รู้ว่าทำอะไร? ทำตามนี้เลย — ระบบเลือกโจทย์ให้จากข้อที่ผิด/ยังไม่เคยทำ/หัวข้อที่ยังอ่อน</p>
    ${step(!!read, `อ่านบทเรียนแนะนำ: <b>${ch ? esc(ch.title) : '-'}</b>`, ch ? `<button data-a="dailyRead">${read ? 'อ่านอีกรอบ' : 'อ่านเลย'}</button>` : '')}
    ${step(all, `ทำโจทย์ประจำวัน <b>${done}/${total}</b> ข้อ${done ? ` (ถูก ${okN})` : ''}`, `<button class="pri" data-a="dailyStart">${all ? 'ทบทวน' : done ? 'ทำต่อ' : 'เริ่มทำ'}</button>`)}
    ${step(mins >= goalMin, `อ่านหนังสือ/จับเวลา <b>${mins}/${goalMin}</b> นาที`, `<a class="btn" href="#/timer" style="text-decoration:none;color:inherit">จับเวลา</a>`)}
    <div class="bar ${all ? 'g' : ''}" style="margin:10px 0 6px"><i style="width:${pct(done, total)}%"></i></div>
    <div class="row between"><span class="mute">จำนวนข้อต่อวัน:</span><span class="row">${[5, 10, 15, 20].map(n => `<button class="chip ${dailyGoal() === n ? 'on' : ''}" data-a="dailyGoalSet" data-v="${n}">${n}</button>`).join('')}</span></div></div>`;
}

/* ---------- เสื้อช็อป ---------- */
function xpNow() { return attempts.length + Math.round(studies.reduce((a, s) => a + s.secs, 0) / 600); } // 1 ข้อ = 1 แต้ม, อ่าน 10 นาที = 1 แต้ม
function shirtInfo() {
  const xp = xpNow(), idx = TITLES.map(t => t[0]).filter(v => xp >= v).length - 1, next = TITLES[idx + 1];
  const patches = [], dl = store.get('dlog', {}), daysDone = Object.values(dl).filter(x => x.done >= x.total && x.total > 0).length + (Object.keys(getDaily().results).length >= getDaily().ids.length ? 1 : 0);
  if (attempts.length >= 10) patches.push(['⚙️', 'ทำครบ 10 ข้อ']); if (attempts.length >= 100) patches.push(['🔧', 'ทำครบ 100 ข้อ']);
  if (streak() >= 3) patches.push(['🔌', 'อ่านต่อเนื่อง 3 วัน']); if (streak() >= 7) patches.push(['🔥', 'อ่านต่อเนื่อง 7 วัน']);
  if (mocks.length) patches.push(['📐', 'ทำสอบจำลองแล้ว']); if (daysDone >= 5) patches.push(['🎯', 'ภารกิจครบ 5 วัน']);
  if (Object.keys(readLog()).length >= 10) patches.push(['📚', 'อ่านครบ 10 บท']);
  return { xp, title: TITLES[idx][1], next, patches };
}
function shirtSvg(name) {
  const nm = esc(String(name || 'น้องวิศวะ').slice(0, 8));
  return `<svg class="shirt" viewBox="0 0 120 130" role="img" aria-label="เสื้อช็อปของ ${nm}"><path d="M38 10 L18 22 L4 54 L24 62 L30 48 L30 120 L90 120 L90 48 L96 62 L116 54 L102 22 L82 10 Q60 32 38 10Z" fill="var(--pri)" stroke="rgba(0,0,0,.28)" stroke-width="1.5" stroke-linejoin="round"/><path d="M38 10 L52 32 L60 20 L68 32 L82 10 Q60 32 38 10Z" fill="#fff" opacity=".92" stroke="rgba(0,0,0,.2)"/><line x1="60" y1="34" x2="60" y2="120" stroke="rgba(0,0,0,.28)" stroke-width="1.5"/>${[48, 66, 84, 102].map(y => `<circle cx="60" cy="${y}" r="2" fill="rgba(255,255,255,.85)"/>`).join('')}<rect x="66" y="56" width="20" height="22" rx="2" fill="rgba(0,0,0,.12)" stroke="rgba(0,0,0,.28)"/><line x1="66" y1="62" x2="86" y2="62" stroke="rgba(0,0,0,.28)"/><rect x="31" y="58" width="25" height="10" rx="2" fill="#fff" stroke="rgba(0,0,0,.25)"/><text x="43.5" y="66" text-anchor="middle" font-size="6.5" font-weight="700" fill="#222">${nm}</text><g transform="translate(14 44) rotate(-12)"><circle r="7" fill="#fff" opacity=".9"/><circle r="5" fill="none" stroke="var(--pri)" stroke-width="2" stroke-dasharray="1.6"/><circle r="1.6" fill="var(--pri)"/></g></svg>`;
}
function shirtCard() {
  const si = shirtInfo(), nm = store.get('nick', 'น้องวิศวะ'), pct_ = si.next ? Math.min(100, Math.round((si.xp - TITLES[TITLES.findIndex(t => t[1] === si.title)][0]) / (si.next[0] - TITLES[TITLES.findIndex(t => t[1] === si.title)][0]) * 100)) : 100;
  return `<div class="card shirtcard"><button class="shirtbtn" data-a="nickEdit" aria-label="แก้ชื่อบนเสื้อช็อป" title="แตะเพื่อแก้ชื่อบนอก">${shirtSvg(nm)}</button>
    <div class="shirtinfo"><div class="mute">เสื้อช็อปของฉัน</div><b style="font-size:19px">${esc(nm)}</b> <span class="tag">${si.title}</span>
    <div class="bar" style="margin:8px 0 4px"><i style="width:${pct_}%"></i></div><div class="mute" style="font-size:12px">${si.next ? 'อีก ' + (si.next[0] - si.xp) + ' แต้ม (ข้อที่ทำ + เวลาอ่าน) → ' + si.next[1] : 'ระดับสูงสุดแล้ว 🎓'}</div>
    <div class="patches">${si.patches.length ? si.patches.map(p => `<span title="${esc(p[1])}">${p[0]}</span>`).join('') : '<span class="mute" style="font-size:12px">ทำโจทย์เพื่อสะสมแพทช์ติดเสื้อ</span>'}</div></div></div>`;
}
let logoTaps = 0, logoTimer = 0;
function easterEgg() {
  logoTaps++; clearTimeout(logoTimer); logoTimer = setTimeout(() => logoTaps = 0, 1500);
  if (logoTaps >= 5) { logoTaps = 0; const q = QUOTES[Math.floor(Math.random() * QUOTES.length)]; toast('⚙️ ' + q.t); confetti(); }
}
function toast(msg) { let t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); } t.textContent = msg; t.className = 'show'; clearTimeout(t._h); t._h = setTimeout(() => t.className = '', 4200); }
