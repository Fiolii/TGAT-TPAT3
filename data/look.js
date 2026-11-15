// ปรับหน้าตาเอง: โทนมืด↔สว่างแบบต่อเนื่อง (ปรับพื้นหลัง การ์ด ตัวอักษร และเลือกโหมดมืด/สว่างให้ตามโทน) · ความใสของกระจก · ความเบลอ — เก็บใน sx_look
const LOOK_DEF = { glass: 50, blur: 50 };           // tone ไม่ตั้ง = ใช้โหมดอัตโนมัติ/สว่าง/มืดตามเดิม
const lookGet = () => Object.assign({}, LOOK_DEF, store.get('look', {}));
const lookMix = (a, b, u) => { const p = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)); const x = p(a), y = p(b); return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * u).toString(16).padStart(2, '0')).join(''); };
// โทน 0 = มืดสนิท … 50 = กลาง … 100 = สว่างสุด (ครึ่งมืดใช้ตัวอักษรสว่าง ครึ่งสว่างใช้ตัวอักษรเข้ม)
function lookTonePalette(tone) {
  const t = Math.min(100, Math.max(0, tone));
  if (t < 50) { const u = t / 50; return { dark: true, bg: lookMix('#03040a', '#343a5e', u), card: lookMix('#0a0c18', '#474e7a', u), line: lookMix('#14172a', '#5c6494', u), ink: '#f2f3ff', mute: lookMix('#9aa0bb', '#d3d7ee', u) }; }
  const u = (t - 50) / 50; return { dark: false, bg: lookMix('#9aa1c4', '#f7f8ff', u), card: lookMix('#b9bfdb', '#ffffff', u), line: lookMix('#838bb0', '#e1e4f2', u), ink: '#12152a', mute: lookMix('#2f3555', '#646b86', u) };
}
function applyLook() {
  const L = lookGet(), r = document.documentElement;
  // สกินแบบแปลน (Blueprint): กำหนดสีทั้งชุดเอง จึงล้างค่าโทน/กระจกที่ตั้งไว้ชั่วคราว แล้วให้ CSS ของสกินทำงาน
  if (L.skin === 'blueprint') { r.setAttribute('data-skin', 'blueprint'); ['--bg', '--card', '--line', '--ink', '--mute', '--gl-fill', '--gl-fill2', '--gl-blur'].forEach(p => r.style.removeProperty(p)); const o = document.getElementById('lookdim'); if (o) o.remove(); return; }
  r.removeAttribute('data-skin');
  const hasTone = L.tone != null, pal = hasTone ? lookTonePalette(+L.tone) : null;
  const dark = hasTone ? pal.dark : (typeof isDark === 'function' && isDark()), t = Math.min(1, Math.max(0, L.glass / 100)), f = x => x.toFixed(3);
  ['--bg', '--card', '--line', '--ink', '--mute'].forEach(p => r.style.removeProperty(p));
  if (pal) { r.style.setProperty('--bg', pal.bg); r.style.setProperty('--card', pal.card); r.style.setProperty('--line', pal.line); r.style.setProperty('--ink', pal.ink); r.style.setProperty('--mute', pal.mute); }
  let fill, fill2;
  if (dark) {   // กระจกโทนมืด: แผ่นสีเข้ม (ทึบเมื่อ t=0) + ประกายขาวบาง ๆ
    const base = pal ? pal.card : '#0e1022', rgb = [1, 3, 5].map(i => parseInt(base.slice(i, i + 2), 16)).join(','), p = (1 - t) * .94, w = .05 + (1 - t) * .12;
    fill = `linear-gradient(rgba(${rgb},${f(p)}),rgba(${rgb},${f(p)})),linear-gradient(150deg,rgba(255,255,255,${f(w * 1.4)}),rgba(255,255,255,${f(w * .5)}) 55%,rgba(255,255,255,${f(w)}))`;
    fill2 = `rgba(${rgb},${f(.15 + (1 - t) * .7)})`;
  } else {      // กระจกโทนสว่าง: ขาวทึบ → ใสมาก (โทนกลางใช้สีการ์ดแทนขาว)
    const base = pal ? pal.card : '#ffffff', rgb = [1, 3, 5].map(i => parseInt(base.slice(i, i + 2), 16)).join(','), a = .96 - t * .86;
    fill = `linear-gradient(150deg,rgba(${rgb},${f(a)}),rgba(${rgb},${f(a * .55)}) 55%,rgba(${rgb},${f(a * .8)}))`;
    fill2 = `rgba(${rgb},${f(a * .65)})`;
  }
  r.style.setProperty('--gl-fill', fill); r.style.setProperty('--gl-fill2', fill2);
  r.style.setProperty('--gl-blur', `blur(${Math.round(4 + L.blur * .5)}px) saturate(185%)`);
  const old = document.getElementById('lookdim'); if (old) old.remove();   // รุ่นก่อนใช้ชั้นคลุมหรี่แสง ตอนนี้เปลี่ยนเป็นโทนจริง
}
function lookPanel() {
  const L = lookGet(), dk = typeof isDark === 'function' && isDark(), tone = L.tone != null ? +L.tone : (dk ? 22 : 92);
  const row = (k, a, lo, hi, v) => `<div class="lkrow"><small>${lo}</small><input type="range" min="0" max="100" value="${v}" data-look="${k}" aria-label="${a}"><small>${hi}</small></div>`;
  return `<div class="lookp"><p class="mute" style="margin:12px 0 2px">โทนหน้าจอ ${L.tone != null ? '' : '<small>(ตอนนี้ตามโหมดอัตโนมัติ)</small>'}</p>${row('tone', 'โทนมืดถึงสว่าง', '🌙 มืด', '☀ สว่าง', tone)}
    <p class="mute" style="margin:8px 0 2px">ความใสของกระจก</p>${row('glass', 'ความใสของกระจก', 'ทึบ', 'ใส', L.glass)}
    <p class="mute" style="margin:8px 0 2px">ความเบลอหลังกระจก</p>${row('blur', 'ความเบลอ', 'คม', 'เบลอ', L.blur)}
    <div class="row" style="gap:8px;margin-top:10px"><button class="chip ${L.skin === 'blueprint' ? 'on' : ''}" data-lookskin="blueprint">📐 สกินแบบแปลน (Blueprint)</button></div>
    <div class="row" style="gap:8px;margin-top:6px"><button class="chip" data-looktoneauto>🌗 โทนอัตโนมัติ</button><button class="chip" data-lookreset>↺ ค่าเริ่มต้น</button></div></div>`;
}
function lookSetScheme(want) { if (store.get('scheme', 'auto') !== want) { store.set('scheme', want); if (typeof applyTheme === 'function') { applyTheme(); return; } } applyLook(); }
document.addEventListener('input', e => {
  const k = e.target && e.target.dataset && e.target.dataset.look; if (!k) return; const L = store.get('look', {}); L[k] = +e.target.value; store.set('look', L);
  if (k === 'tone') lookSetScheme(+e.target.value < 50 ? 'dark' : 'light'); else applyLook();
});
document.addEventListener('click', e => {
  const sk = e.target.closest && e.target.closest('[data-lookskin]');
  if (sk) { const x = store.get('look', {}); if (x.skin === sk.dataset.lookskin) delete x.skin; else x.skin = sk.dataset.lookskin; store.set('look', x); applyLook(); if (typeof render === 'function') render(true); const sh = document.getElementById('themesheet'); if (sh && typeof themeSheet === 'function') themeSheet(true); return; }
  const c = e.target.closest && e.target.closest('[data-looktoneauto],[data-lookreset]'); if (!c) return;
  const L = c.hasAttribute('data-lookreset') ? {} : (() => { const x = store.get('look', {}); delete x.tone; return x; })();
  store.set('look', L); store.set('scheme', 'auto'); if (typeof applyTheme === 'function') applyTheme(); else applyLook();
  if (typeof render === 'function') render(true); const sh = document.getElementById('themesheet'); if (sh && typeof themeSheet === 'function') themeSheet(true);
});
// applyLook() ถูกเรียกจาก applyTheme() ใน app.js ตอนเริ่มแอป (store ถูกประกาศใน app.js ซึ่งโหลดหลังไฟล์นี้)
