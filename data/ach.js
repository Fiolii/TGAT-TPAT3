/* ระบบความสำเร็จ (Achievements) — คำนวณจากสถิติที่มีอยู่ + เหตุการณ์เล็กน้อย (ดูสไลด์พิสูจน์ ลองซิมูเลเตอร์ ลองธีม)
   เก็บการปลดล็อกใน sx_ach {id: เวลา} และตรวจใหม่ทุกครั้งที่ render */
function achMark(kind, key) { const m = store.get('seen_' + kind, []); if (!m.includes(key)) { m.push(key); store.set('seen_' + kind, m); } }
const achSeen = kind => store.get('seen_' + kind, []).length;

const ACH_DEFS = (() => {
  const L = [];
  const add = (id, icon, name, desc, g, p, group) => L.push({ id, icon, name, desc, g, p, group });
  const okAtt = f => attempts.filter(a => a.ok && f(a)).length;
  const maxRun = () => { let b = 0, c = 0; attempts.forEach(a => { c = a.ok ? c + 1 : 0; b = Math.max(b, c); }); return b; };
  const hour = a => new Date(a.ts).getHours();
  const redo = () => { const bad = new Set(); let n = 0, seen = new Set(); attempts.forEach(a => { if (a.ok && bad.has(a.qid) && !seen.has(a.qid)) { n++; seen.add(a.qid); } if (!a.ok) bad.add(a.qid); }); return n; };
  const dailyDays = () => Object.values(store.get('dlog', {})).filter(x => x.total > 0 && x.done >= x.total).length;
  const bestMock = () => mocks.reduce((m, x) => Math.max(m, x.total ? Math.round(x.score / x.total * 100) : 0), 0);
  const groupsOk = () => ['tpat3', 'tgat', 'alevel'].filter(g => attempts.some(a => a.ok && a.group === g)).length;
  const lvl = () => TITLES.map(t => t[0]).filter(v => xpNow() >= v).length - 1;
  const acc = () => attempts.length >= 50 ? Math.round(attempts.filter(a => a.ok).length / attempts.length * 100) : 0;

  add('q1', '🔩', 'น็อตตัวแรก', 'ทำโจทย์ครบ 1 ข้อ', 1, () => attempts.length, 'โจทย์');
  add('q10', '⚙️', 'เฟืองเริ่มหมุน', 'ทำโจทย์ครบ 10 ข้อ', 10, () => attempts.length, 'โจทย์');
  add('q100', '🔧', 'ช่างประจำโต๊ะ', 'ทำโจทย์ครบ 100 ข้อ', 100, () => attempts.length, 'โจทย์');
  add('q300', '🏭', 'โรงงานความรู้', 'ทำโจทย์ครบ 300 ข้อ', 300, () => attempts.length, 'โจทย์');
  add('run10', '🎯', 'แม่นยิ่งกว่าเลเซอร์', 'ตอบถูกติดต่อกัน 10 ข้อ', 10, maxRun, 'โจทย์');
  add('acc80', '📈', 'ค่าความคลาดเคลื่อนต่ำ', 'ความแม่นยำรวมถึง 80% (ทำอย่างน้อย 50 ข้อ)', 80, acc, 'โจทย์');
  add('redo10', '🔁', 'ดีบั๊กสำเร็จ', 'ทำข้อที่เคยผิดให้ถูก 10 ข้อ', 10, redo, 'โจทย์');
  add('num5', '🔢', 'ตอบเป็นตัวเลขแบบมืออาชีพ', 'ตอบถูกโจทย์แบบกรอกตัวเลข 5 ข้อ', 5, () => okAtt(a => /^n-/.test(a.qid)), 'โจทย์');
  add('spatial10', '🧊', 'มองทะลุสามมิติ', 'ตอบถูกโจทย์มิติสัมพันธ์ 10 ข้อ', 10, () => okAtt(a => /-sp-|^p-sp|^g2-sp/.test(a.qid)), 'โจทย์');
  add('calc10', '∫', 'เด็กแคลคูลัส', 'ตอบถูกโจทย์แคลคูลัส 10 ข้อ', 10, () => okAtt(a => /^(a|n)-k\d/.test(a.qid)), 'โจทย์');
  add('allg', '🧭', 'รอบด้านครบสามสนาม', 'ตอบถูกอย่างน้อย 1 ข้อใน TPAT3, TGAT และ A-Level', 3, groupsOk, 'โจทย์');

  add('mock1', '📝', 'ลงสนามจำลอง', 'ทำข้อสอบจำลองจับเวลา 1 ชุด', 1, () => mocks.length, 'สอบจำลอง');
  add('mock5', '🏟️', 'ซ้อมใหญ่', 'ทำข้อสอบจำลองครบ 5 ชุด', 5, () => mocks.length, 'สอบจำลอง');
  add('mock80', '🥇', 'คะแนนระดับเกียรตินิยม', 'ได้คะแนนสอบจำลองตั้งแต่ 80%', 80, bestMock, 'สอบจำลอง');

  add('d1', '🎯', 'ภารกิจแรก', 'ทำภารกิจรายวันครบ 1 วัน', 1, dailyDays, 'ภารกิจ');
  add('d5', '📅', 'ทำงานเป็นระบบ', 'ทำภารกิจรายวันครบรวม 5 วัน', 5, dailyDays, 'ภารกิจ');
  add('ds3', '🔌', 'ไฟไม่ตก', 'ภารกิจครบติดกัน 3 วัน', 3, () => missionStreak(), 'ภารกิจ');
  add('ds7', '🔥', 'เครื่องยนต์ร้อน', 'ภารกิจครบติดกัน 7 วัน', 7, () => missionStreak(), 'ภารกิจ');
  add('st14', '🛠️', 'บำรุงรักษาสม่ำเสมอ', 'อ่านหนังสือต่อเนื่อง 14 วัน', 14, () => streak(), 'ภารกิจ');
  add('hours5', '⏱️', 'ชั่วโมงบิน', 'เวลาอ่านสะสม 5 ชั่วโมง', 300, () => Math.round(studies.reduce((a, s) => a + s.secs, 0) / 60), 'ภารกิจ');

  add('read10', '📚', 'ห้องสมุดเคลื่อนที่', 'อ่านบทเรียนครบ 10 บท', 10, () => Object.keys(readLog()).length, 'เรียนรู้');
  add('read30', '🎓', 'ผู้รอบรู้', 'อ่านบทเรียนครบ 30 บท', 30, () => Object.keys(readLog()).length, 'เรียนรู้');
  add('proof5', '🧪', 'ไม่ท่องสูตร แต่เข้าใจที่มา', 'เปิดอ่านสไลด์พิสูจน์สูตร 5 หน้า', 5, () => achSeen('proof'), 'เรียนรู้');
  add('proof20', '🧠', 'นักพิสูจน์', 'เปิดอ่านสไลด์พิสูจน์สูตร 20 หน้า', 20, () => achSeen('proof'), 'เรียนรู้');
  add('sim5', '🎛️', 'ช่างทดลอง', 'เปิดซิมูเลเตอร์ 5 ตัว', 5, () => achSeen('sim'), 'เรียนรู้');
  add('sim15', '🔬', 'ห้องแล็บส่วนตัว', 'เปิดซิมูเลเตอร์ 15 ตัว', 15, () => achSeen('sim'), 'เรียนรู้');

  add('lv2', '👕', 'ขึ้นปี 2', 'ถึงระดับ ปี 2', 1, () => lvl() >= 1 ? 1 : 0, 'เสื้อช็อป');
  add('lv4', '👷', 'ปีสุดท้าย', 'ถึงระดับ ปี 4', 1, () => lvl() >= 3 ? 1 : 0, 'เสื้อช็อป');
  add('lv6', '🎖️', 'วิศวกรมืออาชีพ', 'ถึงระดับสูงสุด', 1, () => lvl() >= 5 ? 1 : 0, 'เสื้อช็อป');
  add('shop1', '🛍️', 'ลูกค้าคนแรก', 'แลกของชิ้นแรกจากร้านค้าด้วยเหรียญ', 1, () => Object.keys(store.get('own', {})).length ? 1 : 0, 'ตัวละคร');
  add('coll3', '💎', 'นักสะสมของลิมิเต็ด', 'มีของที่แลกมาครบ 3 ชิ้น', 3, () => Object.keys(store.get('own', {})).length, 'ตัวละคร');
  add('coin500', '🪙', 'เศรษฐีเหรียญ', 'สะสมเหรียญรวม 500 เหรียญ', 500, () => (store.get('coins', null) || { earned: 0 }).earned, 'ตัวละคร');
  add('nick', '🪪', 'ป้ายชื่อบนอก', 'ตั้งชื่อบนเสื้อช็อปของตัวเอง', 1, () => store.get('nick', '') && store.get('nick', '') !== 'น้องวิศวะ' ? 1 : 0, 'เสื้อช็อป');
  add('theme5', '🎨', 'นักแต่งตัว', 'ลองธีมสีมหาวิทยาลัย 5 แบบ', 5, () => achSeen('theme'), 'เสื้อช็อป');
  add('themeAll', '🌈', 'แปดเสือครบสี', 'ลองธีมสีครบทุกแบบ', THEMES.length, () => achSeen('theme'), 'เสื้อช็อป');
  add('egg', '🥚', 'นักสืบโลโก้', 'หาของลับที่ซ่อนไว้ในแอป', 1, () => store.get('egg', 0) ? 1 : 0, 'เสื้อช็อป');

  add('owl', '🦉', 'นกฮูกกลางคืน', 'ทำโจทย์ช่วง 23:00–04:59', 1, () => attempts.some(a => hour(a) >= 23 || hour(a) < 5) ? 1 : 0, 'ลับ');
  add('lark', '🌅', 'ตื่นเช้าไปติว', 'ทำโจทย์ช่วง 05:00–06:59', 1, () => attempts.some(a => hour(a) >= 5 && hour(a) < 7) ? 1 : 0, 'ลับ');
  return L;
})();

const achState = () => store.get('ach', {});
function achProgress(d) { const p = Math.max(0, Math.min(d.g, d.p())); return { p, done: p >= d.g }; }
let achBusy = false;
function achCheck(silent) {
  if (achBusy) return; achBusy = true;
  try {
    const st = achState(), fresh = [];
    ACH_DEFS.forEach(d => { if (!st[d.id] && achProgress(d).done) { st[d.id] = Date.now(); fresh.push(d); } });
    if (fresh.length || store.get('ach', null) === null) {
      store.set('ach', st);
      if (!silent) { toast('🏆 ปลดล็อก: ' + fresh.map(d => d.name).join(' · ')); if (typeof confetti === 'function') confetti(); }
    }
  } finally { achBusy = false; }
}
function achCard() {
  const st = achState(), done = ACH_DEFS.filter(d => st[d.id]), recent = done.sort((a, b) => st[b.id] - st[a.id]).slice(0, 5);
  return `<button class="card achcard" data-a="achOpen"><div class="row between"><h2 style="margin:0">🏆 ความสำเร็จ</h2><span class="tag">${done.length}/${ACH_DEFS.length}</span></div>
    <div class="bar" style="margin:10px 0 6px"><i style="width:${pct(done.length, ACH_DEFS.length)}%"></i></div>
    <div class="achrow">${recent.length ? recent.map(d => `<span title="${esc(d.name)}">${d.icon}</span>`).join('') : '<span class="mute" style="font-size:13px">ยังไม่มี — ทำโจทย์ข้อแรกเพื่อปลดล็อกอันแรก</span>'}</div></button>`;
}
function achSheet(open) {
  let el = $('#achsheet'); if (el) el.remove(); if (!open) return;
  const st = achState(), groups = [...new Set(ACH_DEFS.map(d => d.group))], done = ACH_DEFS.filter(d => st[d.id]).length;
  const item = d => { const pr = achProgress(d), on = !!st[d.id]; return `<div class="ach ${on ? 'on' : ''}"><i>${on ? d.icon : '🔒'}</i><div><b>${esc(d.name)}</b><small>${esc(d.desc)}</small>${on ? `<small class="when">ปลดล็อก ${new Date(st[d.id]).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</small>` : `<div class="bar"><i style="width:${pct(pr.p, d.g)}%"></i></div><small>${pr.p}/${d.g}</small>`}</div></div>`; };
  el = document.createElement('div'); el.id = 'achsheet'; el.className = 'omr'; el.setAttribute('data-a', 'achClose');
  el.innerHTML = `<div><div class="row between"><h2 style="margin:0">🏆 ความสำเร็จ <span class="tag">${done}/${ACH_DEFS.length}</span></h2><button data-a="achClose">ปิด</button></div>
    ${groups.map(g => `<p class="mute" style="margin:14px 0 6px">${g}</p><div class="achgrid">${ACH_DEFS.filter(d => d.group === g).map(item).join('')}</div>`).join('')}</div>`;
  document.body.appendChild(el);
}
const ACH_ACT = {
  achOpen() { achCheck(true); achSheet(true); },
  achClose() { achSheet(false); },
  adminAchAll() { const st = {}; ACH_DEFS.forEach(d => st[d.id] = Date.now()); store.set('ach', st); render(true); achSheet(true); },
  adminAchReset() { store.set('ach', {}); store.set('seen_proof', []); store.set('seen_sim', []); store.set('seen_theme', []); store.set('egg', 0); render(true); achSheet(true); },
};
