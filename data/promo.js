// คลิปแนะนำ SIXENT: เด้งขึ้นทุกครั้งที่เปิดเว็บ ถ้าติ๊ก "ไม่ต้องแสดงอีกวันนี้" จะเงียบจนถึงเที่ยงคืน แล้วกลับมาเด้งใหม่ทุกวัน (เก็บใน sx_promo_off)
// เริ่มเล่นแบบปิดเสียง (เบราว์เซอร์ไม่ให้เล่นเสียงเองก่อนผู้ใช้แตะ) มีปุ่มเปิดเสียง/หยุด/ข้าม · ไฟล์เว็บ 720×1280 (~20 MB) อยู่ที่ assets/promo/ (ต้นฉบับ 1080p อยู่ใน promo/renders ไม่ได้ขึ้นเว็บ) — ถ้าเปลี่ยนไฟล์ให้ตั้งชื่อใหม่เพื่อไม่ให้ติดแคช
const PROMO_SRC = 'assets/promo/sixent-promo-hd.mp4', PROMO_POSTER = 'assets/promo/poster.jpg';
// เก็บ "วันที่" (ตามเวลาเครื่อง) ที่ผู้ใช้ติ๊กไม่ต้องแสดง — พอข้ามเที่ยงคืนวันที่เปลี่ยน คลิปจะกลับมาเด้งใหม่เอง (ค่าเก่า true จากรุ่นก่อนถือว่าหมดอายุ)
const promoToday = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const promoOff = () => { try { return JSON.parse(localStorage.getItem('sx_promo_off')) === promoToday(); } catch { return false; } };
function promoClose(save) {
  const o = document.getElementById('promo'); if (!o) return;
  const v = o.querySelector('video'); if (save && o.querySelector('#promoskip').checked) { try { localStorage.setItem('sx_promo_off', JSON.stringify(promoToday())); } catch { } }
  if (v) { v.pause(); v.removeAttribute('src'); v.load(); }   // หยุดโหลดไฟล์ที่ค้างอยู่
  o.classList.add('out'); document.body.classList.remove('promo-open'); document.removeEventListener('keydown', promoKey);
  setTimeout(() => o.remove(), 220);
}
const promoKey = e => { if (e.key === 'Escape') promoClose(true); };
function promoOpen(manual) {
  if (document.getElementById('promo')) return;
  const o = document.createElement('div'); o.id = 'promo'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.setAttribute('aria-label', 'คลิปแนะนำ SIXENT');
  o.innerHTML = `<div class="promo-box">
    <div class="promo-stage"><video playsinline muted autoplay preload="auto" poster="${PROMO_POSTER}" src="${PROMO_SRC}"></video>
      <div class="promo-bar"><i></i></div>
      <button class="promo-snd" aria-label="เปิดเสียง">🔇 แตะเพื่อเปิดเสียง</button>
      <button class="promo-pp" aria-label="หยุดชั่วคราว">⏸</button></div>
    <div class="promo-foot"><label class="promo-chk"><input type="checkbox" id="promoskip"${manual ? '' : ''}><span>ไม่ต้องแสดงอีกวันนี้</span></label>
      <button class="pri promo-go" id="promogo">เริ่มใช้งาน ›</button></div></div>`;
  document.body.appendChild(o); document.body.classList.add('promo-open'); document.addEventListener('keydown', promoKey);
  const v = o.querySelector('video'), bar = o.querySelector('.promo-bar i'), snd = o.querySelector('.promo-snd'), pp = o.querySelector('.promo-pp');
  v.addEventListener('timeupdate', () => { bar.style.width = (v.duration ? v.currentTime / v.duration * 100 : 0) + '%'; });
  v.addEventListener('ended', () => { o.classList.add('done'); pp.textContent = '↻'; });
  v.addEventListener('error', () => { o.classList.add('broken'); });
  const play = v.play(); if (play && play.catch) play.catch(() => { pp.textContent = '▶'; });   // เบราว์เซอร์บล็อกเล่นเอง → ให้กดเล่น
  const sync = () => { snd.textContent = v.muted ? '🔇 แตะเพื่อเปิดเสียง' : '🔊 เปิดเสียงอยู่'; snd.classList.toggle('on', !v.muted); if (typeof i18nNode === 'function') i18nNode(snd); };
  v.addEventListener('volumechange', sync); sync();
  snd.addEventListener('click', () => { v.muted = !v.muted; if (!v.muted) v.volume = 1; if (v.paused && !o.classList.contains('done')) v.play(); });
  const toggle = () => { if (o.classList.contains('done')) { o.classList.remove('done'); v.currentTime = 0; v.play(); } else if (v.paused) v.play(); else v.pause(); };
  pp.addEventListener('click', toggle); v.addEventListener('click', toggle);
  v.addEventListener('play', () => { pp.textContent = '⏸'; }); v.addEventListener('pause', () => { if (!v.ended) pp.textContent = '▶'; });
  o.querySelector('#promogo').addEventListener('click', () => promoClose(true));
  o.querySelector('#promoskip').focus({ preventScroll: true });
  if (typeof i18nNode === 'function') i18nNode(o);
}
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('[data-promo-open]')) promoOpen(true); });
window.addEventListener('load', () => { if (!promoOff()) setTimeout(() => promoOpen(false), 500); });
