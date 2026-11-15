// ตกแต่งทุกหน้าตามธีมมหาวิทยาลัย + ธีมสาขา: ฉากหลังที่ขยับ (ใช้ฉากเดียวกับหน้าประวัติ) ลายคั่นใต้หัวข้อ ฟอนต์หัวข้อ แถบประดับใต้แถบบน
// รูปทรงการ์ดและลายขอบของแต่ละมหาวิทยาลัย (อยู่ใน dress.css ตามคลาส body.th-รหัส) และไอคอนสาขาหน้าหัวข้อการ์ด (body.br-รหัส)
// โหมดเอฟเฟกต์: anim = ขยับ · still = นิ่ง · off = ปิดฉากพื้นหลัง (ตั้งได้ในหน้าเลือกธีม) ; ผู้ใช้ตั้ง "ลดการเคลื่อนไหว" ในเครื่อง = นิ่งอัตโนมัติ

const fxMode = () => store.get('fx', 'anim');
const stripBg = svg => svg.replace(/<rect width="400" height="320" fill="[^"]*"\/>/, '');
const noSmil = svg => svg.replace(/<animate\w*[^>]*>(<\/animate\w*>)?/g, '');
function dressUni(id, align, still) {
  const sk = typeof UNISKIN !== 'undefined' && UNISKIN[id]; if (!sk) return '';
  let s = stripBg(sk.scene()).replace('preserveAspectRatio="xMidYMid slice"', `preserveAspectRatio="${align}"`).replace('class="uh-svg"', 'class="th-svg"');
  return still ? noSmil(s) : s;
}
const maskUrl = svg => 'url("data:image/svg+xml,' + encodeURIComponent(svg.replace('class="orn"', 'xmlns="http://www.w3.org/2000/svg"').replace(/currentColor/g, '#000')) + '")';
const glyphUrl = b => 'url("data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${b.glyph}</svg>`) + '")';

let dressSig = '';
function dressApply() {
  const id = store.get('theme', 'sixent'), br = brCur(), fx = fxMode(), b = document.body, r = document.documentElement, sk = typeof UNISKIN !== 'undefined' ? UNISKIN[id] : null;
  b.className = b.className.replace(/(^|\s)(th|br)-\S+/g, '').trim();
  b.classList.add('th-' + id); if (br) b.classList.add('br-' + br.id);
  r.dataset.fx = fx;
  if (sk) { if (typeof uniFont === 'function') uniFont(sk); r.style.setProperty('--th-ff', sk.ff); r.style.setProperty('--th-orn', maskUrl(sk.orn)); r.style.setProperty('--th-orn-d', 'block'); }
  else { r.style.removeProperty('--th-ff'); r.style.removeProperty('--th-orn'); r.style.setProperty('--th-orn-d', 'none'); }
  if (br) { r.style.setProperty('--br1', br.c[0]); r.style.setProperty('--br2', br.c[1]); r.style.setProperty('--br-glyph', glyphUrl(br)); r.style.setProperty('--br-glyph-d', 'inline-block'); }
  else { ['--br1', '--br2', '--br-glyph'].forEach(p => r.style.removeProperty(p)); r.style.setProperty('--br-glyph-d', 'none'); }
  // ฉากพื้นหลัง (สร้างใหม่เมื่อธีม/สาขา/โหมดเปลี่ยนเท่านั้น)
  const sig = id + '|' + (br ? br.id : '') + '|' + fx;
  let L = document.getElementById('thscene');
  if (!L) { L = document.createElement('div'); L.id = 'thscene'; L.setAttribute('aria-hidden', 'true'); document.body.prepend(L); }
  if (sig !== dressSig) { dressSig = sig; const still = fx === 'still'; L.innerHTML = fx === 'off' ? '' : `<div class="ths-u">${dressUni(id, 'xMidYMax meet', still)}</div><div class="ths-b">${brScene(br, still)}</div>`; }
}

/* ฮีโร่หน้าแรก: ซ้อนฉากของมหาวิทยาลัย + สาขา */
function dressHero() {
  const id = store.get('theme', 'sixent'), br = brCur(), fx = fxMode(); if (fx === 'off') return '';
  const u = dressUni(id, 'xMidYMax slice', fx === 'still'), b = br ? brScene(br, fx === 'still').replace('xMidYMax meet', 'xMidYMax slice') : '';
  const badge = br ? `<span class="hero-br" style="--br1:${br.c[0]}">${brIcon(br, 15, '#fff')} ${esc(br.n)}</span>` : '';
  return (u || b ? `<div class="hero-sc" aria-hidden="true">${u}${b}</div>` : '') + badge;
}
/* ลายน้ำตราในวงนาฬิกา */
function dressTimer() { const id = store.get('theme', 'sixent'); return id === 'sixent' ? '' : `<div class="twm" aria-hidden="true">${uniMark(id, 150)}</div>`; }
/* ส่วนเสริมในหน้าเลือกธีม: ธีมสาขา + โหมดเอฟเฟกต์ */
function dressSheetExtra() {
  const br = brCur(), fx = fxMode();
  return (typeof lookPanel === 'function' ? lookPanel() : '') + `<p class="mute" style="margin:12px 0 4px">ธีมสาขาวิศวะ (ซ้อนกับธีมมหาวิทยาลัยได้)</p>
    <button class="swatch brpick" data-a="branchOpen" ${br ? `style="--s1:${br.c[0]};--s2:${br.c[1]}"` : ''}><i>${brIcon(br, 30, br ? br.c[0] : 'currentColor')}</i><span><b>${br ? 'วิศวกรรม' + esc(br.n) : 'ยังไม่ได้เลือกสาขา'}</b><small>${br ? esc(br.tag) : 'โยธา เครื่องกล ไฟฟ้า คอมพิวเตอร์ เคมี และอีก 7 สาขา'}</small></span><em>›</em></button>
    <p class="mute" style="margin:10px 0 4px">ฉากพื้นหลังของธีม</p><div class="chips">${[['anim', '✨ ขยับ'], ['still', '🖼 นิ่ง'], ['off', '🚫 ปิด']].map(([k, v]) => `<button class="chip ${fx === k ? 'on' : ''}" data-a="fxPick" data-v="${k}">${v}</button>`).join('')}</div>
    <p class="mute" style="font-size:12px">ฉากที่ขยับอาจกินแบตเตอรี่/ทำให้เครื่องรุ่นเก่ากระตุก ถ้าเป็นแบบนั้นให้เลือก "นิ่ง" หรือ "ปิด"</p>`;
}
