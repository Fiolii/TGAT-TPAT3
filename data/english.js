// มุมภาษาอังกฤษ (TGAT1): แฟลชการ์ดพลิกได้ + ทบทวนแบบเว้นช่วง (Leitner) + ควิซเลือกความหมาย + ฟังเสียงออกเสียง
// คลังคำอยู่ใน data/english_words.js · ความจำเก็บใน localStorage คีย์ sx_eng · เส้นทาง #/english (แท็บย่อย "อังกฤษ" ในกลุ่ม "ฝึก")

const ENG_IV = [0, 0, 1, 2, 4, 8, 16];           // กล่อง 1..6 → ทบทวนอีกกี่วันถัดไป
const ENG_SET = 10;                              // จำนวนการ์ด/ข้อต่อชุด
const engDay = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5);
const engSt = () => { const s = store.get('eng', null); return s && s.w ? s : { w: {}, log: {} }; };
const engBy = id => EN_WORDS.find(x => x.id === id);
let ENG_S = { mode: 'cards', cat: 'all', queue: null, qi: 0, flip: false, re: {}, quiz: null };

const engPool = () => EN_WORDS.filter(w => ENG_S.cat === 'all' || w.c === ENG_S.cat);
function engDue() { const s = engSt(), d = engDay(); return engPool().filter(w => s.w[w.id] && s.w[w.id][1] <= d); }
function engFresh() { const s = engSt(); return engPool().filter(w => !s.w[w.id]); }
function engBuild() {
  const due = shuffle(engDue()).slice(0, ENG_SET), fill = shuffle(engFresh()).slice(0, ENG_SET - due.length);
  ENG_S.queue = due.concat(fill).map(w => w.id); ENG_S.qi = 0; ENG_S.flip = false; ENG_S.re = {};
}
function engMark(id, ok) {
  const s = engSt(), cur = s.w[id], d = engDay(), box = ok ? Math.min(6, (cur ? cur[0] : 1) + 1) : 1;
  s.w[id] = [box, ok ? d + ENG_IV[box] : d]; s.log[d] = (s.log[d] || 0) + 1;
  Object.keys(s.log).forEach(k => { if (+k < d - 60) delete s.log[k]; });
  store.set('eng', s);
}
function engSpeak(text) {
  if (!('speechSynthesis' in window)) return; const u = new SpeechSynthesisUtterance(String(text).replace(/\s*\/\s*/g, ' ')); u.lang = 'en-US'; u.rate = .9;
  const v = speechSynthesis.getVoices().find(x => /^en[-_]US/i.test(x.lang)) || speechSynthesis.getVoices().find(x => /^en/i.test(x.lang)); if (v) u.voice = v;
  speechSynthesis.cancel(); speechSynthesis.speak(u);
}
const engSpkBtn = id => ('speechSynthesis' in window) ? `<button class="en-spk" data-a="enSpeak" data-v="${esc(id)}" aria-label="ฟังเสียงออกเสียง" title="ฟังเสียง">🔊</button>` : '';

/* ---------- ควิซ ---------- */
function engQuizBuild() {
  const s = engSt(), pool = engPool(); if (pool.length < 4) { ENG_S.quiz = { qs: [], i: 0, score: 0 }; return; }
  const pick = shuffle(pool).sort((a, b) => ((s.w[a.id] ? s.w[a.id][0] : 0) - (s.w[b.id] ? s.w[b.id][0] : 0)) + (Math.random() - .5) * 2).slice(0, ENG_SET);   // เอาคำที่ยังจำไม่แม่นขึ้นก่อน
  const qs = pick.map(w => {
    const others = shuffle(EN_WORDS.filter(x => x.id !== w.id && x.th !== w.th && (x.c === w.c))).slice(0, 3), type = Math.random() < .6 ? 'a' : 'b';
    return { id: w.id, type, opts: shuffle([w.id].concat(others.map(x => x.id))), pick: null };
  });
  ENG_S.quiz = { qs, i: 0, score: 0 };
}

/* ---------- มุมมอง ---------- */
function engStats() {
  const s = engSt(), d = engDay(), total = EN_WORDS.length, seen = EN_WORDS.filter(w => s.w[w.id]).length, mastered = EN_WORDS.filter(w => s.w[w.id] && s.w[w.id][0] >= 4).length, due = EN_WORDS.filter(w => s.w[w.id] && s.w[w.id][1] <= d).length;
  return `<div class="card en-stats"><div class="en-st"><b>${EN_WORDS.length - seen}</b><small>คำใหม่</small></div><div class="en-st"><b>${due}</b><small>ถึงรอบทบทวน</small></div><div class="en-st"><b>${mastered}</b><small>จำได้แม่น</small></div><div class="en-st"><b>${s.log[d] || 0}</b><small>วันนี้ฝึกไป</small></div>
    <div class="bar g" style="grid-column:1/-1;margin-top:4px"><i style="width:${pct(mastered, total)}%"></i></div><div class="mute" style="grid-column:1/-1;font-size:12.5px">จำได้แม่น ${mastered}/${total} คำ · การ์ดที่ตอบถูกจะกลับมาทบทวนห่างขึ้น 1 → 2 → 4 → 8 → 16 วัน</div></div>`;
}
function engControls() {
  const modes = [['cards', '🃏 การ์ด'], ['quiz', '✍ ควิซ'], ['list', '📚 คลัง']];
  return `<div class="seg en-modes">${modes.map(([k, t]) => `<button class="${ENG_S.mode === k ? 'on' : ''}" data-a="enMode" data-v="${k}">${t}</button>`).join('')}</div>
    <div class="row en-cats"><button class="chip ${ENG_S.cat === 'all' ? 'on' : ''}" data-a="enCat" data-v="all">ทั้งหมด</button>${Object.entries(EN_CATS).map(([k, [ic, t]]) => `<button class="chip ${ENG_S.cat === k ? 'on' : ''}" data-a="enCat" data-v="${k}">${ic} ${t}</button>`).join('')}</div>`;
}
function engCards() {
  if (!ENG_S.queue) engBuild();
  const q = ENG_S.queue, w = engBy(q[ENG_S.qi]);
  if (!w) {
    const left = engDue().length + engFresh().length;
    return `<div class="card en-done"><div style="font-size:44px">🎉</div><h2>จบชุดนี้แล้ว</h2><p class="mute">${q.length ? `ทบทวนไป ${q.length} ใบ` : 'ตอนนี้ยังไม่มีการ์ดที่ถึงรอบ'}${left ? ` · เหลือคำที่ยังไม่ได้ฝึกหรือถึงรอบอีก ${left} คำ` : ' · ครบทุกคำในหมวดนี้แล้ว'}</p>
      <div class="row" style="justify-content:center;gap:8px"><button class="pri" data-a="enMore">${left ? 'เริ่มชุดต่อไป' : 'สับการ์ดฝึกซ้ำ'}</button><button data-a="enMode" data-v="quiz">ลองควิซ</button></div></div>`;
  }
  const [ic, ct] = EN_CATS[w.c], st = engSt().w[w.id], tag = st ? `กล่อง ${st[0]}` : 'คำใหม่';
  return `<div class="en-prog"><span class="mute">การ์ด ${ENG_S.qi + 1}/${q.length}</span><span class="tag">${tag}</span></div>
    <div class="en-card ${ENG_S.flip ? 'flip' : ''}" data-a="enFlip" role="button" tabindex="0" aria-label="แตะเพื่อพลิกการ์ด">
      <div class="en-cat">${ic} ${ct}</div>
      ${ENG_S.flip ? `<div class="en-back"><div class="en-th">${esc(w.th)}</div><div class="en-sm"><b>${esc(w.w)}</b> <i>${esc(w.pos)}</i></div><div class="en-ex">“${esc(w.ex)}”</div><div class="en-exth">${esc(w.exth)}</div></div>`
      : `<div class="en-front"><div class="en-w">${esc(w.w)}</div><div class="en-sm"><i>${esc(w.pos)}</i></div><div class="en-hint">แตะการ์ดเพื่อดูความหมาย</div></div>`}
      ${engSpkBtn(w.id)}</div>
    ${ENG_S.flip ? `<div class="en-judge"><button class="en-no" data-a="enKnow" data-v="0">😵 ยังไม่จำ</button><button class="en-yes" data-a="enKnow" data-v="1">✅ จำได้</button></div>` : `<div class="row" style="justify-content:center"><button class="pri" data-a="enFlip">ดูความหมาย</button></div>`}`;
}
function engQuiz() {
  if (!ENG_S.quiz) engQuizBuild();
  const Q = ENG_S.quiz;
  if (!Q.qs.length) return '<div class="card"><p class="mute">หมวดนี้มีคำน้อยเกินไปสำหรับควิซ — เลือก "ทั้งหมด" ดูนะ</p></div>';
  if (Q.i >= Q.qs.length) {
    const wrong = Q.qs.filter(q => q.pick !== q.id);
    return `<div class="card en-done"><div style="font-size:44px">${Q.score >= Q.qs.length * .8 ? '🏆' : '💪'}</div><h2>คะแนน ${Q.score}/${Q.qs.length} ข้อ</h2>
      ${wrong.length ? `<div class="en-wrong">${wrong.map(q => { const w = engBy(q.id); return `<div class="en-wr"><b>${esc(w.w)}</b><span>${esc(w.th)}</span>${engSpkBtn(w.id)}</div>`; }).join('')}</div><p class="mute">คำที่ตอบผิดถูกส่งกลับไปทบทวนวันนี้แล้ว</p>` : '<p class="mute">ถูกหมดเลย!</p>'}
      <div class="row" style="justify-content:center;gap:8px"><button class="pri" data-a="enRestart">ควิซชุดใหม่</button><button data-a="enMode" data-v="cards">ไปทบทวนการ์ด</button></div></div>`;
  }
  const q = Q.qs[Q.i], w = engBy(q.id), done = q.pick != null;
  const lab = id => { const o = engBy(id); return q.type === 'a' ? o.th : o.w; };
  return `<div class="en-prog"><span class="mute">ข้อ ${Q.i + 1}/${Q.qs.length}</span><span class="tag">ถูก ${Q.score}</span></div>
    <div class="card en-q"><div class="mute" style="font-size:13px">${q.type === 'a' ? 'คำนี้แปลว่าอะไร' : 'เลือกคำอังกฤษที่ตรงกับความหมาย'}</div>
      <div class="en-qw">${esc(q.type === 'a' ? w.w : w.th)} ${q.type === 'a' ? engSpkBtn(w.id) : ''}</div>
      <div class="en-opts">${q.opts.map((id, i) => `<button class="en-opt ${done ? (id === q.id ? 'ok' : id === q.pick ? 'bad' : 'dim') : ''}" ${done ? 'disabled' : ''} data-a="enAns" data-v="${i}">${esc(lab(id))}</button>`).join('')}</div>
      ${done ? `<div class="en-fb ${q.pick === q.id ? 'ok' : 'bad'}"><b>${q.pick === q.id ? '✓ ถูกต้อง' : '✗ ยังไม่ใช่'}</b> <span>${esc(w.w)} = ${esc(w.th)}</span><div class="en-ex">“${esc(w.ex)}”</div><div class="en-exth">${esc(w.exth)}</div></div><div class="row" style="justify-content:flex-end"><button class="pri" data-a="enNext">${Q.i + 1 >= Q.qs.length ? 'ดูคะแนน' : 'ข้อต่อไป →'}</button></div>` : ''}</div>`;
}
function engList() {
  const s = engSt(), pool = engPool();
  return `<div class="card en-list">${pool.map(w => { const st = s.w[w.id], b = st ? st[0] : 0; return `<div class="en-li"><i class="en-dot b${b}" title="${b ? 'กล่อง ' + b : 'ยังไม่เคยฝึก'}"></i><div class="en-lt"><b>${esc(w.w)}</b> <small class="mute">${esc(w.pos)}</small><div>${esc(w.th)}</div><div class="mute en-lex">${esc(w.ex)}</div></div>${engSpkBtn(w.id)}</div>`; }).join('')}</div>
    <div class="row" style="justify-content:center"><button class="chip" data-a="enReset">↺ ล้างความจำการ์ดทั้งหมด</button></div>`;
}
function viewEnglish() {
  const body = ENG_S.mode === 'quiz' ? engQuiz() : ENG_S.mode === 'list' ? engList() : engCards();
  return `${hubTabs('practice', 'english')}<h1>อังกฤษ TGAT1</h1><p class="mute" style="margin:-4px 0 12px">สำนวนบทสนทนา คำวิชาการ วลีกริยา และคำเชื่อมที่เจอบ่อยในข้อสอบ — ฝึกวันละชุดเล็ก ๆ พอ</p>${engStats()}${engControls()}${body}`;
}

const ENG_ACT = {
  enMode(v) { ENG_S.mode = v; if (v === 'cards') ENG_S.queue = null; if (v === 'quiz') ENG_S.quiz = null; render(true); },
  enCat(v) { ENG_S.cat = v; ENG_S.queue = null; ENG_S.quiz = null; render(true); },
  enFlip() { ENG_S.flip = !ENG_S.flip; render(true); },
  enKnow(v) {
    const id = ENG_S.queue[ENG_S.qi], ok = v === '1'; engMark(id, ok);
    if (!ok && !ENG_S.re[id]) { ENG_S.re[id] = 1; ENG_S.queue.push(id); }   // ตอบไม่ได้: วนกลับมาอีกครั้งท้ายชุด
    ENG_S.qi++; ENG_S.flip = false; render(true);
  },
  enMore() { ENG_S.queue = null; render(true); },
  enSpeak(v) { const w = engBy(v); if (w) engSpeak(w.w); },
  enAns(v) {
    const Q = ENG_S.quiz, q = Q.qs[Q.i]; if (q.pick != null) return; q.pick = q.opts[+v]; const ok = q.pick === q.id; if (ok) Q.score++; engMark(q.id, ok); render(true);
  },
  enNext() { ENG_S.quiz.i++; render(true); },
  enRestart() { ENG_S.quiz = null; render(true); },
  enReset() { if (confirm('ล้างความคืบหน้าของการ์ดภาษาอังกฤษทั้งหมด?')) { store.set('eng', { w: {}, log: {} }); ENG_S.queue = null; ENG_S.quiz = null; render(true); } },
};
if ('speechSynthesis' in window) speechSynthesis.getVoices();   // ให้เบราว์เซอร์โหลดรายการเสียงล่วงหน้า
