// โจทย์และเกร็ดความรู้ "ใหม่ทุกวัน": แอปอ่าน data/dq/manifest.json แล้วโหลดโจทย์เข้าคลังเดิม (ทุกโหมดใช้ได้: ฝึก สอบจำลอง ภารกิจรายวัน สถิติ)
// ไฟล์ข้อมูลสร้างโดยงานประจำวัน (ดู tools/DAILY.md) ; ข้อมูลที่โหลดมาถูกตรวจซ้ำฝั่งแอปเสมอ — ข้อความทั้งหมดผ่าน esc() ไม่รับ HTML/ภาพ

const DQ = { loaded: false, questions: [], notes: [], latest: '', err: '' };
const dqStr = (v, max) => typeof v === 'string' && v.length > 0 && v.length <= max;
function dqOkQ(q) {
  if (!q || typeof q !== 'object' || !/^dq-\d{8}-\d{2}$/.test(q.id || '') || !['tpat3', 'tgat', 'alevel'].includes(q.group) || !dqStr(q.subject, 40) || !dqStr(q.topic, 60) || !dqStr(q.q, 1600) || ![1, 2, 3].includes(q.diff) || !dqStr(q.exp, 1600)) return false;
  if (q.passage != null && !dqStr(q.passage, 2600)) return false;
  if (q.type === 'num') return typeof q.ans === 'number' && isFinite(q.ans) && typeof q.tol === 'number' && q.tol >= 0;
  return Array.isArray(q.c) && q.c.length === 5 && q.c.every(s => dqStr(s, 420) && !s.startsWith('<svg')) && Number.isInteger(q.a) && q.a >= 0 && q.a <= 4 && Array.isArray(q.why) && q.why.length === 5;
}
const dqOkN = n => n && /^dn-\d{8}-\d{2}$/.test(n.id || '') && dqStr(n.title, 90) && dqStr(n.body, 1000) && (n.link == null || /^https:\/\/[^\s"'<>]+$/.test(n.link));
// กระจายตำแหน่งเฉลยให้สมดุลเหมือนโจทย์เดิม (ตายตัวจาก id)
function dqBalance(q) {
  if (!q.c) return; let h = 0; for (const ch of q.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  if (q.c.every(s => /^[\d−\-.([]/.test(s))) { if (h % 2) { q.c.reverse(); q.why.reverse(); q.a = q.c.length - 1 - q.a; } return; }
  const t = h % q.c.length;[q.c[q.a], q.c[t]] = [q.c[t], q.c[q.a]];[q.why[q.a], q.why[t]] = [q.why[t], q.why[q.a]]; q.a = t;
}
async function dqLoad() {
  try {
    const man = await (await fetch('data/dq/manifest.json', { cache: 'no-cache' })).json(); if (!man || !Array.isArray(man.bundles)) return;
    const list = man.bundles.filter(b => /^bundle-\d{4}-\d{2}\.json$/.test(b)).sort().reverse(), have = new Set(QUESTIONS.map(q => q.id));   // โหลดเดือนล่าสุดก่อน แล้วค่อยทยอยโหลดเดือนเก่า (ไม่บล็อกหน้าจอ)
    const ingest = b => {
      (b.questions || []).forEach(q => { if (!dqOkQ(q) || have.has(q.id)) return; delete q.fig; dqBalance(q); QUESTIONS.push(q); DQ.questions.push(q); have.add(q.id); });
      (b.notes || []).forEach(n => { if (dqOkN(n) && !DQ.notes.some(x => x.id === n.id)) DQ.notes.push(n); });
      DQ.questions.sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.id.localeCompare(b.id)); DQ.notes.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      DQ.latest = DQ.questions.length ? DQ.questions[0].date || '' : ''; DQ.loaded = true;
    };
    for (let i = 0; i < list.length; i++) {
      ingest(await fetch('data/dq/' + list[i], { cache: 'no-cache' }).then(r => r.json()));
      if (i === 0 || i === list.length - 1) { const r = (location.hash.replace(/^#\/?/, '') || '').split('/')[0]; if ((r === '' || r === 'exam') && (typeof E === 'undefined' || !E || E.done)) render(true); }
      if (i < list.length - 1) await new Promise(r => setTimeout(r, 500));
    }
  } catch (e) { DQ.err = e.message; /* ออฟไลน์ครั้งแรก/ยังไม่มีไฟล์: ข้ามไป ใช้คลังเดิม */ }
}
window.addEventListener('load', () => setTimeout(dqLoad, 300));

const dqSeen = () => new Set(attempts.map(a => a.qid));
const dqThai = d => d ? new Date(d + 'T00:00:00').toLocaleDateString(typeof I18N_ON === 'function' && I18N_ON() ? 'en-GB' : 'th-TH', { day: 'numeric', month: 'short', year: '2-digit' }) : '';
function dqCard() {
  if (!DQ.loaded || !DQ.questions.length) return '';
  const seen = dqSeen(), fresh = DQ.questions.filter(q => !seen.has(q.id)), today = DQ.notes.filter(n => n.date === (DQ.notes[0] || {}).date).slice(0, 3);
  const days = new Set(DQ.questions.map(q => q.date)).size;
  return `<div class="card dqcard"><div class="row between" style="gap:10px"><div style="min-width:0"><h2 style="margin:0">🆕 โจทย์ใหม่ล่าสุด</h2><div class="mute" style="font-size:13px">เพิ่มทุกวัน · อัปเดต ${dqThai(DQ.latest)} · รวม ${DQ.questions.length} ข้อจาก ${days} วัน</div></div><span class="tag ${fresh.length ? '' : 'ok'}">${fresh.length ? 'ยังไม่เคยทำ ' + fresh.length : 'ทำครบแล้ว'}</span></div>
    <div class="row" style="margin-top:10px"><button class="pri" data-a="dqStart">${fresh.length ? 'ทำโจทย์ใหม่ (' + Math.min(10, fresh.length) + ' ข้อ)' : 'ทบทวนโจทย์ล่าสุด'}</button></div>
    ${today.length ? `<h3 style="margin:14px 0 4px;font-size:15px">💡 เกร็ดความรู้ล่าสุด</h3>${today.map(n => `<details class="dqnote"><summary>${esc(n.title)}</summary><div class="dqbody">${nl(n.body)}${n.topic && typeof hasLesson === 'function' && hasLesson(n.topic) ? `<div style="margin-top:8px"><button class="chip" data-a="openLesson" data-v="${esc(n.topic)}">📚 อ่านบทเรียน: ${esc(n.topic)}</button></div>` : ''}${n.link ? `<div style="margin-top:6px"><a href="${esc(n.link)}" target="_blank" rel="noopener">🔗 อ่านต่อ</a></div>` : ''}</div></details>`).join('')}` : ''}</div>`;
}
const DQ_ACT = {
  dqStart() {
    const seen = dqSeen(); let list = DQ.questions.filter(q => !seen.has(q.id)).slice(0, 10); if (!list.length) list = DQ.questions.slice(0, 10);
    if (!list.length) { toast('ยังไม่มีโจทย์ใหม่'); return; } beginExam('practice', list, 'โจทย์ใหม่ล่าสุด');
  },
};
