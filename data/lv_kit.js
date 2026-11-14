// ตัวอย่าง 3 ระดับ (ในห้องเรียน / ข้อสอบจริง / สอวน) — เปลี่ยนระดับแล้วครูเปลี่ยนเป็นบุคคลสำคัญของบทนั้น
// LV('id บท', ['ครูห้องเรียน','ครูข้อสอบ','ครูสอวน'], { h:'ชื่อชุดตัวอย่าง', class:[กระดาน|'old:0'], exam:[…], olym:[…] })
const LV_KEYS = ['class', 'exam', 'olym'];
const LV_META = [
  { t: 'ในห้องเรียน', s: 'พื้นฐาน', star: '★☆☆', d: 'ตัวอย่างเริ่มต้นที่ค่อย ๆ ไปทีละขั้น เหมาะกับการเรียนครั้งแรก' },
  { t: 'ข้อสอบจริง', s: 'ระดับที่ออกสอบ', star: '★★☆', d: 'ระดับข้อสอบจริง มีกับดักและต้องจัดการหลายขั้นตอนในข้อเดียว' },
  { t: 'สอวน', s: 'ท้าทายสุด', star: '★★★', d: 'โจทย์แนวสอวน/แข่งขัน ต้องดัดแปลงสูตร คิดข้ามขั้น และรวมหลายแนวคิดเข้าด้วยกัน' }
];
const LVDEF = {};
function LV(id, who, def) { LVDEF[id] = { who, def }; }
const BX = (h, o) => Object.assign({ type: 'board', h }, o);
const exLvl = sl => (LS.lvl && LS.lvl[LS.i]) || 0;
const exBi = (sl, L) => Math.min((LS.bsel && LS.bsel[LS.i + ':' + L]) || 0, sl.lv[LV_KEYS[L]].length - 1);

function exlvHtml(sl) {
  const L = exLvl(sl), lk = LV_KEYS[L], list = sl.lv[lk], bi = exBi(sl, L), b = list[bi], who = sl.who[L], P = PEOPLE[who] || PEOPLE.newton, key = LS.i + ':' + L + ':' + bi;
  const tabs = LV_META.map((m, i) => `<button class="lvt lv${i} ${i === L ? 'on' : ''}" data-a="lvSet" data-v="${i}" aria-pressed="${i === L}"><span class="lvst">${m.star}</span><b>${m.t}</b><small>${m.s}</small></button>`).join('');
  const sel = list.length > 1 ? `<div class="lvsel">${list.map((x, i) => `<button class="chip ${i === bi ? 'on' : ''}" data-a="bsSet" data-v="${i}">ข้อ ${i + 1}</button>`).join('')}</div>` : '';
  const lvNote = L === 0 ? '' : '';
  return `<h2>✏️ ${rt(sl.h)}</h2>
  <div class="lvbar" role="group" aria-label="เลือกระดับตัวอย่าง">${tabs}</div>
  <div class="lvwho lv${L}" key="${L}"><div class="lvwhoa">${personSvg(who)}</div><div class="lvwhot"><div class="lvwk">${LV_META[L].t} · ${LV_META[L].star}</div><b>${esc(P.n)}</b><span class="lvy">ค.ศ. ${esc(P.y)}</span><p>${esc(P.r)}</p></div></div>
  <p class="lvdesc lv${L}">${LV_META[L].d}</p>${sel}${lvNote}
  ${boardHtml(b, { key, who, lvl: L, noH: true })}
  <p class="lvfoot">ครูในหน้านี้เป็นการ์ตูนจากบุคคลในประวัติศาสตร์ที่เกี่ยวกับเนื้อหาบทนี้ คำทักทายแต่งขึ้นเพื่อการสอน ไม่ใช่คำพูดจริงของท่าน</p>`;
}

// รวมสไลด์ board/example เดิมของแต่ละบทเป็นสไลด์ exlv เดียว (ต้องเรียกหลังโหลด proofs.js)
function applyLevels() {
  COURSE.forEach(ch => {
    const d = LVDEF[ch.id]; if (!d) return;
    const olds = ch.slides.filter(s => s.type === 'board');
    const pick = x => typeof x === 'string' && x.startsWith('old:') ? olds[+x.slice(4)] : x;
    const lv = {}; LV_KEYS.forEach(k => { lv[k] = (d.def[k] || []).map(pick).filter(Boolean); });
    if (typeof applyFigs === 'function') applyFigs(ch.id, lv);
    const isEx = s => s.type === 'board' || s.type === 'example';
    const first = ch.slides.findIndex(isEx), rest = ch.slides.filter(s => !isEx(s));
    let pos = first >= 0 ? first : rest.findIndex(s => s.type === 'danger'); if (pos < 0) pos = rest.length;
    rest.splice(pos, 0, { type: 'exlv', h: d.def.h, who: d.who, lv });
    ch.slides = rest;
  });
}
