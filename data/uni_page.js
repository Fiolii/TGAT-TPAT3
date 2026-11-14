// หน้าต่าง "รู้จักมหาวิทยาลัย": ภาพรวม เด่นด้านอะไร มีคณะอะไร และประวัติคณะวิศวกรรมศาสตร์ของมหาวิทยาลัยที่เลือก
// เปิดอัตโนมัติเมื่อเปลี่ยนธีมมหาวิทยาลัย หรือกดจากการ์ดหน้าแรก
const unThYear = y => /^\d{4}/.test(y) ? 'พ.ศ. ' + y : y;
function uniCard() {
  const id = curThemeId(), t = THEMES.find(x => x.id === id) || THEMES[0];
  if (id === 'sixent' || !UNIINFO[id]) return `<div class="card unipick"><div class="row between" style="gap:12px"><div style="min-width:0"><b>เลือกมหาวิทยาลัยที่อยากเข้า</b><div class="mute">ดูว่าเด่นด้านอะไร มีคณะอะไร และวิศวะที่นั่นเกิดขึ้นได้อย่างไร — พร้อมเปลี่ยนธีมทั้งแอปเป็นของมหาวิทยาลัยนั้น</div></div><button class="pri" data-a="themeOpen">เลือก</button></div></div>`;
  const I = UNIINFO[id];
  return `<div class="card unipick"><div class="row" style="gap:14px;flex-wrap:nowrap"><div class="unipickemb">${uniMark(id, 56)}</div><div style="flex:1;min-width:0"><b>${esc(t.n)}</b><div class="mute">${esc(I.eng.title)} · เริ่มก่อตั้ง ${unThYear(I.eng.born)}</div></div></div>
    <div class="row" style="margin-top:10px"><button class="pri" data-a="uniOpen" data-v="${id}">ประวัติและวิศวะที่นี่</button><button data-a="themeOpen">เปลี่ยนมหาวิทยาลัย</button></div></div>`;
}
function uniPage(id) {
  let el = document.getElementById('unipage'); if (el) el.remove(); document.body.classList.remove('uni-open');
  if (!id) return;
  const t = THEMES.find(x => x.id === id), u = uniOf(id), I = UNIINFO[id]; if (!t || !I) return;
  const E = I.eng, fact = ([ic, k, v]) => v ? `<div class="unifact"><i>${uic(ic, 18)}</i><div><small>${k}</small><div>${esc(v)}</div></div></div>` : '';
  const facts = [['calendar', 'ก่อตั้ง', I.founded], ['pin', 'ที่ตั้ง', I.place], ['flag', 'ใครเป็นผู้ริเริ่ม', I.founder], ['tree', 'ต้นไม้ประจำมหาวิทยาลัย', u.tree], ['crest', 'สัญลักษณ์', u.symbol], ['palette', 'สีประจำ', u.color]].map(fact).join('');
  const nav = [['about', 'ภาพรวม'], ['strong', 'เด่นด้าน'], ['fac', 'มีคณะอะไร'], ['eng', 'วิศวะที่นี่'], ['tl', 'เส้นเวลา']];
  el = document.createElement('div'); el.id = 'unipage'; el.className = 'omr uniomr'; el.setAttribute('data-a', 'uniClose'); el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'รู้จัก ' + t.n);
  el.innerHTML = `<div>
    <div class="unitop"><b>${uic('book', 18)} รู้จักมหาวิทยาลัย</b><span><button data-a="uniPickOther">เปลี่ยนที่อื่น</button> <button class="pri" data-a="uniClose">ปิด</button></span></div>
    <div class="unibody">
      <header class="unihero uni-${id}"><div class="uniheroemb">${uniMark(id, 96)}</div><div class="unihero-t"><h2>${esc(t.n)}</h2><div class="uni-en">${esc(I.en)}</div><div class="uni-q">${uic('quote', 16)} <span>${esc(u.motto)}</span></div></div></header>
      <nav class="uninav">${nav.map(([k, v]) => `<button class="chip" data-a="uniGo" data-v="${k}">${v}</button>`).join('')}</nav>

      <section id="us-about"><h3>ภาพรวมมหาวิทยาลัย</h3><p class="uniprose">${esc(I.story)}</p><div class="unifacts">${facts}</div></section>

      <section id="us-strong"><h3>เด่นด้านอะไร</h3><div class="unistrong">${I.strong.map((s, i) => `<div class="unis"><span class="n">${i + 1}</span><b>${esc(s[0])}</b><p>${esc(s[1])}</p></div>`).join('')}</div></section>

      <section id="us-fac"><h3>มีคณะอะไรบ้าง</h3>${I.fac.map((g, i) => `<details ${i === 0 ? 'open' : ''}><summary>${esc(g[0])} <span class="mute">(${g[1].length})</span></summary><div class="unichips big">${g[1].map(f => `<span class="${/วิศวกรรม/.test(f) ? 'hl' : ''}">${esc(f)}</span>`).join('')}</div></details>`).join('')}<p class="mute" style="font-size:12px;margin-top:6px">รายชื่อคณะตามที่ Wikipedia ภาษาไทยรวบรวมไว้ ชื่อและจำนวนเปลี่ยนได้เมื่อมีการจัดตั้งหรือยุบรวม</p></section>

      <section id="us-eng"><div class="engban"><div class="engyear"><small>เริ่มก่อตั้ง</small><b>${unThYear(E.born).replace('พ.ศ. ', '')}</b><small>พ.ศ.</small></div><div><div class="engkick">${uic('gear', 16)} วิศวกรรมศาสตร์</div><h3 style="margin:2px 0">${esc(E.title)}</h3><div class="engtag">${esc(E.tag)}</div></div></div>
        <p class="uniprose">${esc(E.lead)}</p>
        <h4>ใครอยู่เบื้องหลัง</h4><div class="unipeople">${E.people.map(p => `<div><i>${uic('user', 16)}</i><div><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div></div>`).join('')}</div>
        <h4>สาขา/ภาควิชาที่เปิดสอน</h4><div class="unichips big">${E.depts.map(d => `<span>${esc(d)}</span>`).join('')}</div>
        <h4>รู้ไหมว่า</h4><ul class="unifl">${E.facts.map(f => `<li>${uic('bulb', 16)}<span>${esc(f)}</span></li>`).join('')}</ul></section>

      <section id="us-tl"><h3>เส้นเวลาของคณะ</h3><ol class="untl">${E.timeline.map(([y, tx]) => `<li><b>${unThYear(y)}</b><span>${esc(tx)}</span></li>`).join('')}</ol></section>

      <section class="uniend"><div class="row" style="gap:8px"><a class="btn" href="${esc(I.web)}" target="_blank" rel="noopener">${uic('link', 16)} เว็บคณะวิศวะ</a><a class="btn" href="${esc(I.ewiki)}" target="_blank" rel="noopener">ประวัติคณะ (Wikipedia)</a><a class="btn" href="${esc(I.wiki)}" target="_blank" rel="noopener">เกี่ยวกับมหาวิทยาลัย</a></div>
        <p class="mute" style="font-size:12px;margin-top:10px">${uic('info', 14)} ข้อมูลสรุปจาก Wikipedia ภาษาไทยของมหาวิทยาลัยและคณะ (ตรวจเมื่อ พ.ย. 2569) บางหัวข้อในหน้าต้นทางยังไม่มีแหล่งอ้างอิง ตัวเลขอันดับและจำนวนหลักสูตรเปลี่ยนได้ ก่อนตัดสินใจสมัครควรเช็กกับเว็บคณะและ mytcas.com อีกครั้ง • ตราและเสื้อช็อปในแอปเป็นภาพที่วาดเองตามสัญลักษณ์ ไม่ใช่ตราทางการ</p></section>
    </div></div>`;
  document.body.appendChild(el); document.body.classList.add('uni-open');
  const b = el.querySelector('.unibody'); if (b) b.scrollTop = 0;
}
