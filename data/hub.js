// โครงแอป 4 แท็บ: วันนี้ · ฝึก · ความก้าวหน้า · ฉัน — เส้นทางเดิม (#/exam #/timer #/cal #/stats #/library #/me) ยังใช้ได้ทั้งหมด
// แต่ละแท็บมีแถบสลับแท็บย่อยด้านบนหน้า (hubTabs) และการ์ดต่าง ๆ ถูกย้ายมารวมตามหน้าที่ใช้ ไม่ลบฟีเจอร์ใด
// หน้าเดิมยังเป็นตัวสร้างเนื้อหา (viewExam/viewStats/viewCal/viewTimer/viewLibrary/viewMe) — ไฟล์นี้แค่ห่อและย้ายการ์ด

const HUB_PRIMARY = { '': '', timer: '', exam: 'exam', library: 'exam', stats: 'stats', cal: 'stats', rank: 'stats', me: 'me' };   // เส้นทาง → แท็บล่างที่ต้องไฮไลต์
const hubPrimary = r => (r in HUB_PRIMARY ? HUB_PRIMARY[r] : '');
const HUB_TABS = {
  today: [['', 'วันนี้'], ['timer', 'จับเวลา']],
  practice: [['exam', 'ข้อสอบ'], ['library', 'บทเรียน'], ['library:info', 'ข้อมูลสอบ']],
  progress: [['stats', 'สถิติ'], ['cal', 'ปฏิทิน'], ['rank', 'อันดับ']],
};
const hubTabs = (g, active) => `<div class="hubtabs" role="tablist">${HUB_TABS[g].map(([v, t]) => `<button role="tab" class="${v === active ? 'on' : ''}" aria-selected="${v === active}" data-a="hubGo" data-v="${v}">${t}</button>`).join('')}</div>`;
const hubAfterH1 = (html, extra) => html.replace('</h1>', () => '</h1>' + extra);

/* ---------- การ์ดที่ย้ายมาจากหน้าแรกเดิม ---------- */
function overviewCard() {
  const total = attempts.length, ok = attempts.filter(a => a.ok).length; let cd = '-', cdsub = 'ยังไม่ตั้งวันสอบ';
  if (examDate) { const d = Math.ceil((new Date(examDate + 'T00:00:00') - Date.now()) / 864e5); cd = d >= 0 ? d : '✓'; cdsub = d >= 0 ? 'วันก่อนสอบ' : 'สอบแล้ว'; }
  return `<div class="card"><h2>ภาพรวม</h2><div class="grid" style="grid-template-columns:1fr 1fr">
      <div><b style="font-size:26px">${total ? pct(ok, total) + '%' : '-'}</b><div class="mute">แม่นยำ (${total} ข้อ)</div></div>
      <div><b style="font-size:26px">${cd}</b><div class="mute">${cdsub}</div></div></div>
      <div class="row" style="margin-top:10px"><input type="date" id="ed" value="${esc(examDate)}"><button data-a="setDate">ตั้งวันสอบ</button></div>
      <div class="row" style="margin-top:6px"><button class="chip" data-a="setExam" data-v="${TCAS70.dates.tpat3}">TPAT3/TGAT 30 ม.ค. 70</button><button class="chip" data-a="setExam" data-v="${TCAS70.dates.alevel}">A-Level 13 มี.ค. 70</button></div></div>`;
}
function weakCard() {
  const weak = weakTopics().slice(0, 3);
  return `<div class="card"><h2>แนะนำให้ทบทวน</h2>${weak.length ? weak.map(t => `<div class="row between" style="padding:6px 0"><span>${esc(t.topic)} <span class="mute">แม่นยำ ${pct(t.ok, t.n)}% · ${t.n} ข้อ</span></span><span><button data-a="practiceTopic" data-v="${esc(t.topic)}">ฝึก</button> ${LESSONS[t.topic] ? `<button data-a="openLesson" data-v="${esc(t.topic)}">อ่านบทเรียน</button>` : ''}</span></div>`).join('') : '<span class="mute">ยังไม่มีข้อมูลเพียงพอ — ทำโจทย์ให้ได้อย่างน้อย 3 ข้อต่อหัวข้อ แล้วระบบจะชี้จุดอ่อนให้</span>'}</div>`;
}
const presetsCard = () => `<div class="card"><h2>ชุดข้อสอบ</h2><div class="presets">${PRESETS.map((p, i) => `<button class="preset" data-a="preset" data-v="${i}"><b>${p.t}</b><small>${allQ().filter(p.f).length} ข้อ · ≈ ${mockMinutes(allQ().filter(p.f))} นาที</small></button>`).join('')}</div></div>`;
function goalCard() {
  const mins = Math.round(todaySecs() / 60);
  return `<div class="card"><h2>เป้าหมายวันนี้</h2><div class="row" style="gap:18px">${ring(mins / goalMin, 110, mins + ' น.', 'จาก ' + goalMin)}
      <div><div class="mute">streak</div><b style="font-size:24px">🔥 ${streak()} วัน</b><div style="margin-top:8px"><label><span>เป้าหมาย (นาที/วัน)</span><input type="number" min="5" value="${goalMin}" data-change="goal" style="width:90px"></label></div></div></div></div>`;
}

/* ---------- หน้า "วันนี้" ---------- */
function hubHero() {
  const th = THEMES.find(x => x.id === store.get('theme', 'sixent')) || THEMES[0], un = uniOf(th.id), sub = T.subject || 'ทั่วไป';
  const icon = th.id === 'sixent' ? '<svg class="gearmark" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="10" stroke-dasharray="9.95"/><circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" stroke-width="4"/></svg>' : `<div class="heroicon" aria-hidden="true">${uniLogoHtml(th.id, 64)}</div>`;
  const clk = T.mode === 'sw' ? tElapsed() : T.remain;
  return `<div class="card hero hero-s uni-${th.id}">${dressHero()}${icon}<h1>${th.s ? 'สู่วิศวะ ' + esc(th.s) : 'พร้อมติวหรือยัง? 🚀'}</h1>${th.s ? `<div class="unimotto herom">“${esc(un.motto)}”</div>` : ''}
    <div class="hubnow"><div class="hubclk" id="hubclk">${T.running || tElapsed() > 0 ? fmt(clk) : ''}</div><div class="hubsub">${T.running ? (T.mode === 'pomo' && T.phase === 'break' ? '☕ พัก' : '🎯 กำลังอ่าน') : 'วิชา'}: <a href="#/timer">${esc(sub)}</a></div></div>
    <div class="row"><button class="btn w" data-a="hubStart">${T.running ? '⏸ หยุดชั่วคราว' : '▶ เริ่มจับเวลา'}</button><a class="btn" href="#/exam">ทำข้อสอบ</a></div></div>`;
}
function todayCard() {
  const d = getDaily(), done = Object.keys(d.results).length, total = d.ids.length, okN = Object.values(d.results).filter(Boolean).length;
  const ch = COURSE.find(c => c.id === d.chapter), read = readLog()[d.chapter] && dayKey(readLog()[d.chapter]) === d.date, mins = Math.round(todaySecs() / 60), all = done >= total, ms = missionStreak();
  const step = (ok, txt, btn) => `<div class="mstep ${ok ? 'ok' : ''}"><i>${ok ? '✓' : ''}</i><span>${txt}</span>${btn || ''}</div>`;
  const p = ypPlan(), by = ypBy('day'), n = p.items.length, pk = p.items.filter(i => ypDone(i, by)).length;
  return `<div class="card daily todaycard"><div class="row between"><h2 style="margin:0">🎯 วันนี้ต้องทำ</h2><span class="tag ${all ? 'ok' : ''}">${all ? 'ภารกิจครบแล้ว!' : 'ยังไม่ครบ'}${ms ? ' · 🔥 ' + ms + ' วันติด' : ''}</span></div>
    <div style="margin-top:10px">
    ${step(!!read, `อ่านบทแนะนำ: <b>${ch ? esc(ch.title) : '-'}</b>`, ch ? `<button data-a="dailyRead">${read ? 'อ่านอีกรอบ' : 'อ่านเลย'}</button>` : '')}
    ${step(all, `ทำโจทย์ประจำวัน <b>${done}/${total}</b> ข้อ${done ? ` (ถูก ${okN})` : ''}`, `<button class="pri" data-a="dailyStart">${all ? 'ทบทวน' : done ? 'ทำต่อ' : 'เริ่มทำ'}</button>`)}
    ${step(mins >= goalMin, `อ่านหนังสือ/จับเวลา <b>${mins}/${goalMin}</b> นาที`, `<a class="btn" href="#/timer" style="text-decoration:none;color:inherit">จับเวลา</a>`)}</div>
    <div class="bar ${all ? 'g' : ''}" style="margin:10px 0 6px"><i style="width:${pct(done, total)}%"></i></div>
    <div class="row between" style="margin-top:14px"><b>📋 แผนของฉัน</b><span class="tag ${n && pk === n ? 'ok' : ''}">${pk}/${n}</span></div>
    ${yptPlanBody(p, by)}
    <details class="hubset"><summary>⚙ จำนวนโจทย์ประจำวัน: ${dailyGoal()} ข้อ</summary><div class="row" style="gap:8px;margin-top:6px">${[5, 10, 15, 20].map(k => `<button class="chip ${dailyGoal() === k ? 'on' : ''}" data-a="dailyGoalSet" data-v="${k}">${k}</button>`).join('')}</div></details></div>`;
}
function viewToday() {
  return `${hubTabs('today', '')}${hubHero()}${typeof yptDday === 'function' ? yptDday() : ''}${todayCard()}${typeof dqCard === 'function' ? dqCard() : ''}<div id="frstrip">${typeof friendStrip === 'function' ? friendStrip(false) : ''}</div>${goalCard()}`;
}
const viewFocus = () => hubTabs('today', 'timer') + viewTimer();

/* ---------- ฝึก ---------- */
function viewPractice() { if (E) return viewExam(); return hubTabs('practice', 'exam') + hubAfterH1(viewExam(), presetsCard() + weakCard()); }
function viewLibHub() { const html = viewLibrary(); return libTab === 'lessons' && libOpen && hasLesson(libOpen) ? html : hubTabs('practice', libTab === 'info' ? 'library:info' : 'library') + html; }

/* ---------- ความก้าวหน้า ---------- */
const viewProgress = () => hubTabs('progress', 'stats') + hubAfterH1(viewStats(), overviewCard() + yptStudyCard());
const viewCalHub = () => hubTabs('progress', 'cal') + viewCal();
const viewRank = () => hubTabs('progress', 'rank') + '<h1>อันดับเวลาอ่าน</h1>' + (yptRank() || '<div class="card"><p class="mute">ระบบเพื่อนยังไม่เปิดให้ใช้งาน</p></div>') + '<div class="card"><div class="row between" style="gap:10px"><div><b>กลุ่มอ่านหนังสือและเพื่อน</b><div class="mute" style="font-size:13px">สร้างกลุ่ม เข้ากลุ่ม และเพิ่มเพื่อนได้ที่แท็บ "ฉัน"</div></div><button data-a="avOpen" data-v="friends">ไปจัดการ</button></div></div>';

/* ---------- ฉัน: แท็บธีมและผลงาน ---------- */
const meThemeTab = () => `${uniCard()}${branchCard()}<div class="card">${dressSheetExtra()}</div>`;
const meAchTab = () => `${shirtCard()}${achCard()}<div class="card" style="display:grid;align-content:center"><div class="mute" style="margin-bottom:6px">คำคมประจำวัน</div>${quoteHtml()}</div><div class="row" style="justify-content:center;margin:6px 0 2px"><button class="chip" data-a="adminOpen" style="opacity:.55;min-height:32px;padding:4px 12px;font-size:12.5px">🔧 แอดมิน</button></div>`;

/* ---------- ปุ่มอวาตาร์บนแถบบน (เปลี่ยนตามลุคตัวละครเมื่อมีการแก้) ---------- */
let hubAvSig = '';
function hubAfterRender() {
  const b = document.querySelector('#top .themebtn[data-a=avOpen]'); if (b && !CHAR_ON && typeof profBadge === 'function') { const sig = JSON.stringify(profGet()) + '|' + store.get('nick', ''); if (sig !== hubAvSig) { hubAvSig = sig; b.innerHTML = `<span class="hdav">${profBadge(34)}</span>`; b.setAttribute('aria-label', 'ฉัน — โปรไฟล์ เพื่อน ธีม'); b.title = 'ฉัน'; } return; }
  if (!b || typeof avatarSvg !== 'function' || !CHAR_ON) return;
  const sig = JSON.stringify(typeof avCfg === 'function' ? avCfg() : '') + '|' + store.get('theme', 'sixent'); if (sig === hubAvSig) return; hubAvSig = sig;
  b.innerHTML = `<span class="hdav">${avatarSvg({}, { view: 'bust', w: 34 })}</span>`; b.setAttribute('aria-label', 'ฉัน — ตัวละคร ร้านค้า เพื่อน ธีม'); b.title = 'ฉัน';
}
setInterval(() => { const c = document.getElementById('hubclk'); if (c && typeof T !== 'undefined') c.textContent = (T.running || tElapsed() > 0) ? fmt(T.mode === 'sw' ? tElapsed() : T.remain) : ''; }, 1000);

const HUB_ACT = {
  hubGo(v) {
    const [r, sub] = String(v).split(':'); if (r === 'library') { libTab = sub || 'lessons'; libOpen = ''; killSim(); LS = null; }
    const h = '#/' + r, cur = location.hash === '' || location.hash === '#' ? '#/' : location.hash; if (cur === h || (r === '' && cur === '#/')) render(true); else location.hash = h;
  },
  hubStart() { if (T.running) tPause(); else tStart(); },
};
