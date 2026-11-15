// สลับภาษา ไทย ↔ English ของส่วนติดต่อผู้ใช้
// วิธีทำงาน: แอปยังสร้างหน้าเป็นภาษาไทยเหมือนเดิม แล้วตัวนี้แปลข้อความที่โผล่ในหน้า (ปุ่ม หัวข้อ ป้าย ข้อความระบบ) ตามพจนานุกรม data/i18n_en.js
// เนื้อหาบทเรียน/โจทย์/เฉลย ถูกกันไว้ไม่แปลแบบท่อน ๆ (ยังเป็นภาษาไทย) · ภาษาที่เลือกเก็บใน sx_lang · ถ้ายังไม่เคยเลือก ใช้ตามภาษาของเบราว์เซอร์ (ไม่ใช่ไทย = English)
const I18N_TH = /[฀-๿]/;
const I18N_SKIP = 'script,style,textarea,svg,.qtext,.otx,.exp,.why,.exans,.passage,.lcard,.slfig,.steps,.slnote,.deck,.stage,.exq,.sheet .stem,.dqnote,[data-i18n="off"]';
let I18N_RX = null;
function langCur() {
  let v = null; try { v = JSON.parse(localStorage.getItem('sx_lang')); } catch { }
  return v === 'th' || v === 'en' ? v : (/^th\b/i.test(navigator.language || 'th') ? 'th' : 'en');
}
const I18N_ON = () => langCur() === 'en';
function i18nRx() {
  if (I18N_RX) return I18N_RX;
  const keys = Object.keys(I18N_EN).sort((a, b) => b.length - a.length);
  I18N_RX = new RegExp(keys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
  return I18N_RX;
}
// แปลข้อความหนึ่งก้อน (ท่อนที่ไม่รู้จักคงเดิม · ท่อนจะแทนเมื่อไม่ติดตัวอักษรไทยด้านหน้า/หลัง กันตัดกลางคำ)
function tr(s) {
  if (!I18N_ON() || typeof s !== 'string' || !I18N_TH.test(s)) return s;
  return s.replace(i18nRx(), (m, off, all) => (I18N_TH.test(all[off - 1] || '') || I18N_TH.test(all[off + m.length] || '')) ? m : I18N_EN[m]).replace(/ {2,}/g, ' ')
    .replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (25\d\d)\b/g, (m, mo, y) => mo + ' ' + (+y - 543));   // ปี พ.ศ. → ค.ศ.
}
function i18nNode(root) {
  if (!I18N_ON() || !root) return;
  if (root.nodeType === 1 && root.hasAttribute('data-i18n')) return;
  if (root.nodeType === 3) { if (I18N_TH.test(root.nodeValue) && !(root.parentElement && root.parentElement.closest(I18N_SKIP))) { const t = tr(root.nodeValue); if (t !== root.nodeValue) root.nodeValue = t; } return; }
  if (root.nodeType !== 1 || root.matches && root.matches(I18N_SKIP) || root.closest && root.closest(I18N_SKIP)) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => I18N_TH.test(n.nodeValue) && !(n.parentElement && n.parentElement.closest(I18N_SKIP)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT });
  const list = []; while (w.nextNode()) list.push(w.currentNode);
  list.forEach(n => { const t = tr(n.nodeValue); if (t !== n.nodeValue) n.nodeValue = t; });
  root.querySelectorAll('[placeholder],[aria-label],[title],[alt]').forEach(el => ['placeholder', 'aria-label', 'title', 'alt'].forEach(a => { const v = el.getAttribute(a); if (v && I18N_TH.test(v)) el.setAttribute(a, tr(v)); }));
  if (root.hasAttribute && ['placeholder', 'aria-label', 'title', 'alt'].some(a => root.hasAttribute(a))) ['placeholder', 'aria-label', 'title', 'alt'].forEach(a => { const v = root.getAttribute(a); if (v && I18N_TH.test(v)) root.setAttribute(a, tr(v)); });
}
function i18nApply() {
  document.documentElement.lang = langCur();
  if (I18N_ON()) {
    document.title = tr(document.title);
    const m = document.querySelector('meta[name=description]'); if (m) m.content = 'TGAT / TPAT3 / A-Level prep for future engineers: step-by-step mock exams, stats, a study timer and lessons with references.';
  }
  const b = document.getElementById('langbtn'); if (b) { b.textContent = I18N_ON() ? 'ไทย' : 'EN'; b.setAttribute('aria-label', I18N_ON() ? 'เปลี่ยนเป็นภาษาไทย' : 'Switch to English'); b.title = I18N_ON() ? 'เปลี่ยนเป็นภาษาไทย' : 'Switch to English'; }
}
function langSet(v) { try { localStorage.setItem('sx_lang', JSON.stringify(v)); } catch { } location.reload(); }
(function init() {
  const top = document.getElementById('top');
  if (top && !document.getElementById('langbtn')) {
    const b = document.createElement('button'); b.id = 'langbtn'; b.className = 'langbtn'; b.setAttribute('data-i18n', 'off');
    b.addEventListener('click', () => langSet(I18N_ON() ? 'th' : 'en'));
    const av = top.querySelector('.themebtn'); top.insertBefore(b, av || null);
  }
  i18nApply();
  // ข้อความเตือน/ยืนยันของเบราว์เซอร์
  ['alert', 'confirm', 'prompt'].forEach(k => { const f = window[k]; window[k] = function (m, ...r) { return f.call(window, tr(String(m)), ...r); }; });
  if (!I18N_ON()) return;
  let q = new Set(), raf = 0;
  const flush = () => { raf = 0; const items = [...q]; q = new Set(); items.forEach(n => { if (n.isConnected) i18nNode(n); }); };
  new MutationObserver(ms => {
    for (const m of ms) { if (m.type === 'characterData' || m.type === 'attributes') q.add(m.target); else m.addedNodes.forEach(n => q.add(n)); }
    if (!raf) raf = requestAnimationFrame(flush);
  }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['aria-label', 'title', 'placeholder'] });
  i18nNode(document.body);
})();
