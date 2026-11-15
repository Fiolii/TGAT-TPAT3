// หน้าต่าง "รู้จักมหาวิทยาลัย" — ดีไซน์แบบ "ตำนาน/พงศาวดาร": พื้นทอง-น้ำเงินเข้ม ลายประดับ บทที่ ๑–๖ ทำเนียบบุคคลสำคัญ และเส้นเวลาของคณะ
// เปิดอัตโนมัติเมื่อเปลี่ยนธีมมหาวิทยาลัย หรือกดจากการ์ดหน้าแรก (สไตล์อยู่ใน hist.css, ข้อมูลบุคคลใน data/uni_hist.js)
const unThYear = y => /^\d{4}/.test(y) ? 'พ.ศ. ' + y : y;
const thNum = n => String(n).replace(/\d/g, d => '๐๑๒๓๔๕๖๗๘๙'[d]);
function uniCard() {
  const id = curThemeId(), t = THEMES.find(x => x.id === id) || THEMES[0];
  if (id === 'sixent' || !UNIINFO[id]) return `<div class="card unipick"><div class="row between" style="gap:12px"><div style="min-width:0"><b>เลือกมหาวิทยาลัยที่อยากเข้า</b><div class="mute">ดูว่าเด่นด้านอะไร มีคณะอะไร และวิศวะที่นั่นเกิดขึ้นได้อย่างไร — พร้อมเปลี่ยนธีมทั้งแอปเป็นของมหาวิทยาลัยนั้น</div></div><button class="pri" data-a="themeOpen">เลือก</button></div></div>`;
  const I = UNIINFO[id];
  return `<div class="card unipick"><div class="row" style="gap:14px;flex-wrap:nowrap"><div class="unipickemb">${uniMark(id, 56)}</div><div style="flex:1;min-width:0"><b>${esc(t.n)}</b><div class="mute">${esc(I.eng.title)} · เริ่มก่อตั้ง ${unThYear(I.eng.born)}</div></div></div>
    <div class="row" style="margin-top:10px"><button class="pri" data-a="uniOpen" data-v="${id}">ประวัติและวิศวะที่นี่</button><button data-a="themeOpen">เปลี่ยนมหาวิทยาลัย</button></div></div>`;
}

/* ---------- ชิ้นส่วนตกแต่ง (วาดเอง) ---------- */
const ORN = `<svg class="orn" viewBox="0 0 260 22" aria-hidden="true"><defs><linearGradient id="ornG" x1="0" x2="1"><stop offset="0" stop-color="#b98a2c" stop-opacity="0"/><stop offset=".5" stop-color="#f3d98b"/><stop offset="1" stop-color="#b98a2c" stop-opacity="0"/></linearGradient></defs><path d="M6 11H104M156 11H254" stroke="url(#ornG)" stroke-width="1.4"/><path d="M130 2l9 9-9 9-9-9z" fill="#e8c46a" stroke="#fff5cf" stroke-width=".6"/><path d="M130 7l4 4-4 4-4-4z" fill="#7a5a14"/><circle cx="108" cy="11" r="2.6" fill="#e8c46a"/><circle cx="152" cy="11" r="2.6" fill="#e8c46a"/><path d="M96 11q-6-6-12 0q6 6 12 0zM164 11q6-6 12 0q-6 6-12 0z" fill="none" stroke="#e8c46a" stroke-width="1"/></svg>`;
// ตราพระมหากษัตริย์/พระบรมวงศ์: ยอดมงกุฎ + ช่อชัยพฤกษ์ (ไม่วาดพระพักตร์)
const CREST_R = `<svg viewBox="0 0 120 140" class="crest" aria-hidden="true"><defs><linearGradient id="crG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0b8"/><stop offset=".55" stop-color="#e8c46a"/><stop offset="1" stop-color="#a77a1c"/></linearGradient></defs>
  <path d="M60 10l6 22H54z M60 30l11 30H49z M60 56l17 40H43z" fill="url(#crG)" stroke="#7a5a14" stroke-width="1.2" stroke-linejoin="round"/><path d="M36 100h48l6 14H30z" fill="url(#crG)" stroke="#7a5a14" stroke-width="1.2"/><path d="M40 108h40" stroke="#7a5a14" stroke-width=".8" stroke-dasharray="2 2"/>
  <path d="M22 124q-4-30 14-44M98 124q4-30-14-44" fill="none" stroke="#e8c46a" stroke-width="2.4" stroke-linecap="round"/>${[[24, 112], [26, 100], [31, 90], [96, 112], [94, 100], [89, 90]].map(p => `<ellipse cx="${p[0]}" cy="${p[1]}" rx="4.200" ry="2.200" fill="#e8c46a" transform="rotate(${p[0] < 60 ? -50 : 50} ${p[0]} ${p[1]})"/>`).join('')}</svg>`;
// ป้ายหน่วยงาน/ผู้ร่วมก่อตั้ง: อาคารมีเสาและหน้าจั่ว
const CREST_O = `<svg viewBox="0 0 120 140" class="crest" aria-hidden="true"><defs><linearGradient id="coG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0b8"/><stop offset=".55" stop-color="#e8c46a"/><stop offset="1" stop-color="#a77a1c"/></linearGradient></defs>
  <path d="M60 22L106 52H14z" fill="url(#coG)" stroke="#7a5a14" stroke-width="1.2" stroke-linejoin="round"/><circle cx="60" cy="42" r="5" fill="#7a5a14"/>${[24, 42, 60, 78, 96].map(x => `<rect x="${x - 5}" y="56" width="10" height="46" rx="2" fill="url(#coG)" stroke="#7a5a14" stroke-width=".9"/>`).join('')}<rect x="10" y="104" width="100" height="8" rx="2" fill="url(#coG)" stroke="#7a5a14" stroke-width="1"/><rect x="4" y="114" width="112" height="8" rx="2" fill="url(#coG)" stroke="#7a5a14" stroke-width="1"/></svg>`;
function legendCard(L, i) {
  const art = L.k === 'p' ? personBust({ n: L.n, a: L.a }) : L.k === 'r' ? CREST_R : CREST_O;
  const tag = L.k === 'r' ? 'พระนาม' : L.k === 'o' ? 'ผู้ร่วมก่อตั้ง' : 'บุคคลสำคัญ';
  return `<article class="lg lg-${L.k}" style="--i:${i}"><div class="lgframe"><div class="lgin">${art}</div><span class="lgtag">${tag}</span></div>
    <h5>${esc(L.n)}</h5><div class="lgrole">${esc(L.role)}</div>${L.yr ? `<div class="lgyr">${esc(L.yr)}</div>` : ''}
    <details class="lgmore"><summary>อ่านเรื่องราว</summary><p>${esc(L.st)}</p></details></article>`;
}
const chapter = (no, title, sub, sk) => `<div class="chp" data-no="${thNum(String(no).padStart(2, '0'))}"><span class="chn">${sk && sk.lab ? sk.lab(no) : 'บทที่ ' + thNum(no)}</span><h3>${title}</h3>${sub ? `<div class="chs">${sub}</div>` : ''}${sk && sk.orn ? sk.orn : ORN}</div>`;

function uniPage(id) {
  let el = document.getElementById('unipage'); if (el) el.remove(); document.body.classList.remove('uni-open');
  if (!id) return;
  const t = THEMES.find(x => x.id === id), u = uniOf(id), I = UNIINFO[id]; if (!t || !I) return;
  const E = I.eng, fact = ([ic, k, v]) => v ? `<div class="unifact"><i>${uic(ic, 18)}</i><div><small>${k}</small><div>${esc(v)}</div></div></div>` : '';
  const facts = [['calendar', 'ก่อตั้ง', I.founded], ['pin', 'ที่ตั้ง', I.place], ['flag', 'ใครเป็นผู้ริเริ่ม', I.founder], ['tree', 'ต้นไม้ประจำมหาวิทยาลัย', u.tree], ['crest', 'สัญลักษณ์', u.symbol], ['palette', 'สีประจำ', u.color]].map(fact).join('');
  const nav = [['about', 'พงศาวดาร'], ['strong', 'เสาหลัก'], ['legend', 'บุคคลสำคัญ'], ['fac', 'คณะ'], ['eng', 'วิศวะที่นี่'], ['tl', 'เส้นเวลา']];
  const L = (typeof UNILEG !== 'undefined' && UNILEG[id]) || [];
  const sk = (typeof UNISKIN !== 'undefined' && UNISKIN[id]) || null; if (sk) uniFont(sk);   // หน้าตาเฉพาะของแต่ละมหาวิทยาลัย (data/uni_skin.js)
  const ct = (i, dt, ds) => sk ? sk.ch[i] : [dt, ds];
  const deco = sk && typeof UNIDECO !== 'undefined' && UNIDECO[id] ? UNIDECO[id](I, E) : '';
  const stl = sk && sk.stat ? sk.stat : ['ก่อตั้งมหาวิทยาลัย', 'กำเนิดคณะวิศวะ', 'ปีของวิศวะที่นี่'];
  const bornN = parseInt(String(E.born).replace(/\D/g, '').slice(0, 4)), thNow = new Date().getFullYear() + 543, age = bornN ? thNow - bornN : 0;
  const me = typeof avatarSvg === 'function' && CHAR_ON ? `<div class="uh-me"><div class="uh-meav">${avatarSvg({ top: 'uni:' + id }, { w: 92 })}</div><div class="uh-met"><b>ลองสวมเสื้อช็อปของที่นี่</b><small>ตัวละครของคุณจะใส่เสื้อช็อป ${esc(t.s || t.n)} ทันที</small><div class="row" style="gap:8px;margin-top:8px"><button class="pri" data-a="avWearUni" data-v="${id}">สวมเลย</button><button data-a="avOpen">ห้องแต่งตัว</button></div></div></div>` : '';
  el = document.createElement('div'); el.id = 'unipage'; el.dataset.u = id; el.className = 'omr uniomr uh-omr' + (sk ? ' has-skin uk-' + id : ''); el.setAttribute('data-a', 'uniClose'); el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'รู้จัก ' + t.n);
  el.innerHTML = `<div>
    <div class="unitop"><b>${uic('book', 18)} ตำนานมหาวิทยาลัย</b><span><button data-a="uniPickOther">เปลี่ยนที่อื่น</button> <button class="pri" data-a="uniClose">ปิด</button></span></div>
    <div class="unibody">
      <header class="uh uni-${id} lay-${sk ? sk.lay : 'c'}">${sk ? `<div class="uh-sc" aria-hidden="true">${sk.scene()}</div>` : '<div class="uh-rays" aria-hidden="true"></div><div class="uh-dust" aria-hidden="true"></div>'}${deco}
        <div class="uh-frame"><div class="uh-emb">${uniMark(id, 112)}</div>
          <div class="uh-kick">${sk ? sk.kick : 'ตำนานแห่งบัณฑิตวิศวะ'}</div>
          <h2>${esc(t.n)}</h2><div class="uh-en">${esc(I.en)}</div>${sk ? sk.orn : ORN}
          <div class="uh-q"><span>“</span>${esc(u.motto)}<span>”</span></div>
          <div class="uh-stats"><div><b>${thNum(String(I.founded).match(/\d{4}/) ? String(I.founded).match(/\d{4}/)[0] : '—')}</b><small>${stl[0]}</small></div><div><b>${thNum(E.born.replace(/\D/g, '').slice(0, 4))}</b><small>${stl[1]}</small></div>${age ? `<div><b>${thNum(age)}</b><small>${stl[2]}</small></div>` : ''}</div></div>
        ${me}
      </header>
      <nav class="uninav">${nav.map(([k, v]) => `<button class="chip" data-a="uniGo" data-v="${k}">${v}</button>`).join('')}</nav>

      <section id="us-about" class="rvs">${chapter(1, ...ct(0, 'พงศาวดารมหาวิทยาลัย', 'จุดเริ่มต้นและเรื่องราวที่ทำให้เกิดที่นี่'), sk)}<p class="uniprose lead">${esc(I.story)}</p><div class="unifacts">${facts}</div></section>

      <section id="us-strong" class="rvs">${chapter(2, ...ct(1, 'เสาหลักแห่งความโดดเด่น', 'สิ่งที่ทำให้มหาวิทยาลัยนี้ไม่เหมือนที่ไหน'), sk)}<div class="unistrong">${I.strong.map((s, i) => `<div class="unis"><span class="n">${thNum(i + 1)}</span><b>${esc(s[0])}</b><p>${esc(s[1])}</p></div>`).join('')}</div></section>

      ${L.length ? `<section id="us-legend" class="rvs wide">${chapter(3, ct(2, 'ทำเนียบบุคคลสำคัญ', '')[0], (sk ? sk.ch[2][1] : 'ผู้วางรากฐาน ผู้ริเริ่ม และผู้ร่วมสร้างวิศวะที่นี่') + ' — แตะ “อ่านเรื่องราว” ที่การ์ด', sk)}<div class="lgrow" tabindex="0" aria-label="บุคคลสำคัญ">${L.map(legendCard).join('')}</div><p class="mute lgnote">${uic('info', 14)} ภาพบุคคลเป็นการ์ตูนที่วาดขึ้นตามจินตนาการ ไม่ใช่ภาพเหมือนจริง • พระมหากษัตริย์และพระบรมวงศ์แสดงเป็นตราสัญลักษณ์เพื่อความเหมาะสม • เนื้อหาสรุปจาก Wikipedia ภาษาไทย</p></section>` : ''}

      <section id="us-fac" class="rvs">${chapter(L.length ? 4 : 3, ...ct(3, 'ราชอาณาจักรแห่งคณะ', 'คณะและหน่วยงานการเรียนการสอนในมหาวิทยาลัย'), sk)}${I.fac.map((g, i) => `<details ${i === 0 ? 'open' : ''}><summary>${esc(g[0])} <span class="mute">(${g[1].length})</span></summary><div class="unichips big">${g[1].map(f => `<span class="${/วิศวกรรม/.test(f) ? 'hl' : ''}">${esc(f)}</span>`).join('')}</div></details>`).join('')}<p class="mute" style="font-size:12px;margin-top:6px">รายชื่อคณะตามที่ Wikipedia ภาษาไทยรวบรวมไว้ ชื่อและจำนวนเปลี่ยนได้เมื่อมีการจัดตั้งหรือยุบรวม</p></section>

      <section id="us-eng" class="rvs">${chapter(L.length ? 5 : 4, sk ? sk.ch[4][0] : 'กำเนิดวิศวกรรมศาสตร์', E.title, sk)}<div class="engban"><div class="engyear"><small>ปีที่ก่อตั้ง</small><b>${thNum(E.born.replace(/\D/g, '').slice(0, 4))}</b><small>พ.ศ.</small></div><div><div class="engkick">${uic('gear', 16)} วิศวกรรมศาสตร์</div><div class="engtag">${esc(E.tag)}</div></div></div>
        <p class="uniprose">${esc(E.lead)}</p>
        ${L.length ? '' : `<h4>ใครอยู่เบื้องหลัง</h4><div class="unipeople">${E.people.map(p => `<div><i>${uic('user', 16)}</i><div><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div></div>`).join('')}</div>`}
        <h4>สาขา/ภาควิชาที่เปิดสอน</h4><div class="unichips big">${E.depts.map(d => `<span>${esc(d)}</span>`).join('')}</div>
        <h4>รู้ไหมว่า</h4><ul class="unifl">${E.facts.map(f => `<li>${uic('bulb', 16)}<span>${esc(f)}</span></li>`).join('')}</ul></section>

      <section id="us-tl" class="rvs">${chapter(L.length ? 6 : 5, ...ct(5, 'ลำดับกาลเวลา', 'จากวันแรกถึงปัจจุบัน'), sk)}<ol class="untl2">${E.timeline.map(([y, tx], i) => `<li style="--i:${i}"><span class="tly">${thNum(String(y).replace('พ.ศ. ', ''))}</span><span class="tlt">${esc(tx)}</span></li>`).join('')}</ol></section>

      <section class="uniend">${sk ? sk.orn : ORN}<div class="row" style="gap:8px;justify-content:center;flex-wrap:wrap"><a class="btn" href="${esc(I.web)}" target="_blank" rel="noopener">${uic('link', 16)} เว็บคณะวิศวะ</a><a class="btn" href="${esc(I.ewiki)}" target="_blank" rel="noopener">ประวัติคณะ (Wikipedia)</a><a class="btn" href="${esc(I.wiki)}" target="_blank" rel="noopener">เกี่ยวกับมหาวิทยาลัย</a></div>
        <p class="mute" style="font-size:12px;margin-top:10px">${uic('info', 14)} ข้อมูลสรุปจาก Wikipedia ภาษาไทยของมหาวิทยาลัยและคณะ (ตรวจเมื่อ พ.ย. 2569) บางหัวข้อในหน้าต้นทางยังไม่มีแหล่งอ้างอิง ตัวเลขอันดับและจำนวนหลักสูตรเปลี่ยนได้ ก่อนตัดสินใจสมัครควรเช็กกับเว็บคณะและ mytcas.com อีกครั้ง • ตราและเสื้อช็อปในแอปเป็นภาพที่วาดเอง ไม่ใช่ตราทางการ</p></section>
    </div></div>`;
  document.body.appendChild(el); document.body.classList.add('uni-open');
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) el.querySelectorAll('animate,animateTransform,animateMotion').forEach(a => a.remove());   // ฉาก SVG ที่ใช้ SMIL ไม่ขยับเมื่อผู้ใช้ตั้งค่าลดการเคลื่อนไหว
  const b = el.querySelector('.unibody'); if (b) { b.scrollTop = 0; uniReveal(b); }
}
// ให้แต่ละบทค่อย ๆ ปรากฏเมื่อเลื่อนมาถึง (ปิดเองเมื่อผู้ใช้ตั้งค่าลดการเคลื่อนไหว)
function uniReveal(root) {
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { root, threshold: .08 });
  root.querySelectorAll('.rvs').forEach((s, i) => { if (i > 0) s.classList.add('rvx'); io.observe(s); });
}
