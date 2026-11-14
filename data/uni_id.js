// อัตลักษณ์ของแต่ละมหาวิทยาลัย: คติพจน์ ต้นไม้/ดอกไม้ สัญลักษณ์ ลวดลายพื้นหลัง และทรงเสื้อช็อป
// ข้อมูลคติพจน์/สี/ต้นไม้/สัญลักษณ์อ้างอิงจากกล่องข้อมูลของ Wikipedia ภาษาไทยของแต่ละมหาวิทยาลัย
// ตราสัญลักษณ์ (data/uni_art.js) เสื้อช็อปและลวดลายทั้งหมดวาดขึ้นเอง ไม่ใช่ของทางการ — ถ้าอยากใช้รูปจริง วางไฟล์ไว้ที่ icons/uni/ (ดู README ในโฟลเดอร์นั้น)
const UNI = {
  sixent: { motto: 'ติวให้พร้อม แล้วไปเป็นวิศวกรในฝัน', pat: 'gear', shirt: { collar: '#ffffff', trim: '#ffffff', collarType: 'classic', stripe: [] } },
  chula: { motto: 'ความรู้คู่คุณธรรม', tree: 'ต้นจามจุรี', symbol: 'พระเกี้ยว', color: 'สีชมพู', pat: 'leaf', shirt: { collar: '#ffffff', trim: '#f2c14e', collarType: 'classic', stripe: ['hem', 'cuff'] } },
  ku: { motto: 'ศาสตร์แห่งแผ่นดิน', tree: 'ต้นนนทรี', symbol: 'พระพิรุณทรงนาค', color: 'สีเขียวใบไม้', pat: 'leaf2', shirt: { collar: '#ffffff', trim: '#d9f2a6', collarType: 'band', stripe: ['shoulder', 'cuff'] } },
  psu: { motto: 'ประโยชน์ของเพื่อนมนุษย์เป็นกิจที่หนึ่ง', tree: 'ดอกศรีตรัง', symbol: 'พระมหาพิชัยมงกุฎ', color: 'สีน้ำเงิน', pat: 'wave', shirt: { collar: '#ffffff', trim: '#f2c14e', collarType: 'classic', stripe: ['chest', 'cuff'] } },
  kku: { motto: 'วิทยา จริยา ปัญญา', tree: 'ต้นกัลปพฤกษ์', symbol: 'พระธาตุพนม และกาลพฤกษ์', color: 'สีดินแดง', pat: 'khit', shirt: { collar: '#ffffff', trim: '#f2c14e', collarType: 'classic', stripe: ['hem', 'cuff'] } },
  cmu: { motto: 'อตฺตานํ ทมยนฺติ ปณฺฑิตา (บัณฑิตย่อมฝึกตน)', tree: 'ต้นทองกวาว', symbol: 'ช้างเผือก', color: 'สีม่วงดอกรัก', pat: 'lanna', shirt: { collar: '#ffffff', trim: '#e3d6f7', collarType: 'band', stripe: ['hem', 'cuff'] } },
  kmutt: { motto: 'ทนโต เสฏโฐ มนุสเสสุ (ผู้ฝึกตนดีแล้วประเสริฐสุด)', tree: 'ดอกธรรมรักษา', symbol: 'พระมหามงกุฎ', color: 'สีแสดและสีเหลือง', pat: 'gear', shirt: { collar: '#ffffff', trim: '#ffe066', collarType: 'classic', stripe: ['shoulder', 'cuff'] } },
  kmitl: { motto: 'การศึกษา วิจัย ด้านวิทยาศาสตร์และเทคโนโลยี เป็นรากฐานของการพัฒนาประเทศ', tree: 'ดอกแคแสด', symbol: 'พระมหามงกุฎ', color: 'สีแสดและสีขาว', pat: 'circuit', shirt: { collar: '#ffffff', trim: '#ffffff', collarType: 'classic', stripe: ['cuff', 'chest'] } },
  kmutnb: { motto: 'พัฒนาคน พัฒนาวิทยาศาสตร์และเทคโนโลยี', tree: 'ต้นประดู่แดง', symbol: 'พระมหามงกุฎ', color: 'สีแสดและสีดำ', pat: 'chevron', shirt: { collar: '#1f1f24', trim: '#1f1f24', collarType: 'band', stripe: ['hem', 'cuff'] } },
  tu: { motto: 'เป็นเลิศ เป็นธรรม ร่วมนำสังคม', tree: 'ต้นหางนกยูงฝรั่ง', symbol: 'ธรรมจักร · ตึกโดม', color: 'สีเหลืองและสีแดง', pat: 'dharma', shirt: { collar: '#ffd23f', trim: '#ffd23f', collarType: 'classic', stripe: ['hem', 'cuff'] } },
  mu: { motto: 'อตฺตานํ อุปมํ กเร (ปฏิบัติต่อผู้อื่นเหมือนต่อตนเอง)', tree: 'ต้นกันภัยมหิดล', symbol: 'ตราราชสกุลมหิดล (วงกลมสองชั้น)', color: 'สีน้ำเงิน', pat: 'dna', shirt: { collar: '#ffffff', trim: '#f2c14e', collarType: 'band', stripe: ['chest', 'cuff'] } }
};
const uniOf = id => UNI[id] || UNI.sixent;
const curThemeId = () => (store.get('theme', 'sixent'));

/* ---------- ลวดลายพื้นหลัง (วาดเอง เป็นไทล์ 64×64) ---------- */
const UNIPAT = {
  gear: '<circle cx="32" cy="32" r="13"/><circle cx="32" cy="32" r="5"/><path d="M32 12v6M32 46v6M12 32h6M46 32h6M18 18l4 4M42 42l4 4M46 18l-4 4M18 46l4-4"/>',
  leaf: '<ellipse cx="18" cy="18" rx="10" ry="4" transform="rotate(-35 18 18)"/><ellipse cx="46" cy="46" rx="10" ry="4" transform="rotate(-35 46 46)"/><path d="M10 26l16-16M38 54l16-16"/>',
  leaf2: '<path d="M10 30Q22 10 40 14Q36 34 10 30Z"/><path d="M10 30L36 18"/><path d="M40 58Q50 44 60 46Q58 58 40 58Z"/>',
  wave: '<path d="M0 20Q16 6 32 20T64 20M0 46Q16 32 32 46T64 46"/>',
  khit: '<path d="M32 6L58 32 32 58 6 32Z"/><path d="M32 20L44 32 32 44 20 32Z"/><path d="M32 29v6M29 32h6"/>',
  lanna: '<path d="M0 18l8-8 8 8 8-8 8 8 8-8 8 8 8-8 8 8M0 50l8-8 8 8 8-8 8 8 8-8 8 8 8-8 8 8"/><path d="M0 34h64"/>',
  circuit: '<path d="M6 20H28V44H58M6 54H20M42 6V26H58"/><circle cx="28" cy="20" r="3"/><circle cx="58" cy="44" r="3"/><circle cx="42" cy="26" r="3"/>',
  chevron: '<path d="M6 24L32 8 58 24M6 48L32 32 58 48"/>',
  dharma: '<circle cx="32" cy="32" r="18"/><circle cx="32" cy="32" r="4"/><path d="M32 14v36M14 32h36M19 19l26 26M45 19L19 45"/>',
  dna: '<path d="M8 8Q32 32 56 8M8 56Q32 32 56 56"/><circle cx="20" cy="20" r="2"/><circle cx="44" cy="20" r="2"/><circle cx="20" cy="44" r="2"/><circle cx="44" cy="44" r="2"/>'
};
function uniPat(kind, stroke, opacity) {
  const body = UNIPAT[kind]; if (!body) return 'none';
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><g fill='none' stroke='${stroke}' stroke-opacity='${opacity}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>${body}</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/* ---------- รูปจริงที่ผู้ใช้วางเอง: icons/uni/<id>-logo.(png|webp|jpg|svg) และ <id>-shirt.(…) ---------- */
const UNIIMG = { logo: {}, shirt: {} }, UNIPROBED = {};
function uniProbe(id) {
  if (!id || UNIPROBED[id]) return; UNIPROBED[id] = 1;
  ['logo', 'shirt'].forEach(kind => {
    const exts = ['png', 'webp', 'jpg', 'jpeg', 'svg'];
    const tryNext = i => {
      if (i >= exts.length) return;
      const url = `icons/uni/${id}-${kind}.${exts[i]}`, im = new Image();
      im.onload = () => { UNIIMG[kind][id] = url; if (typeof applyTheme === 'function') applyTheme(); if (typeof render === 'function' && (location.hash || '#/') === '#/') render(true); };
      im.onerror = () => tryNext(i + 1); im.src = url;
    };
    tryNext(0);
  });
}

/* ---------- เสื้อช็อปแบบวาดเอง ตามอัตลักษณ์ของแต่ละมหาวิทยาลัย ---------- */
function uniShirt(name) {
  const id = curThemeId(), u = uniOf(id), S = u.shirt, nm = esc(String(name || 'น้องวิศวะ').slice(0, 8)), sid = ++UEC;
  if (UNIIMG.shirt[id]) return `<div class="shirtimg"><img src="${UNIIMG.shirt[id]}" alt="เสื้อช็อป ${esc(id)}"><span class="shirtnm">${nm}</span></div>`;
  const has = k => S.stripe.includes(k), col = S.collar, trim = S.trim;
  const bodyP = 'M38 10 L18 22 L4 54 L24 62 L30 48 L30 120 L90 120 L90 48 L96 62 L116 54 L102 22 L82 10 Q60 32 38 10Z';
  const collar = S.collarType === 'band'
    ? `<path d="M40 10 Q60 34 80 10 L84 14 Q60 46 36 14Z" fill="${col}" stroke="rgba(0,0,0,.28)" stroke-width="1"/><path d="M44 12.500 Q60 32 76 12.500" fill="none" stroke="${trim}" stroke-width="1.400" opacity=".7"/>`
    : `<path d="M38 10 L50 34 L60 22 L70 34 L82 10 Q60 32 38 10Z" fill="${col}" stroke="rgba(0,0,0,.25)" stroke-width="1"/><path d="M50 34 L60 22 L70 34" fill="none" stroke="rgba(0,0,0,.18)"/>`;
  const patchIcon = UNIIMG.logo[id]
    ? `<clipPath id="uc${sid}"><circle cx="76" cy="46" r="9.500"/></clipPath><image href="${UNIIMG.logo[id]}" x="66.500" y="36.500" width="19" height="19" clip-path="url(#uc${sid})" preserveAspectRatio="xMidYMid slice"/><circle cx="76" cy="46" r="9.500" fill="none" stroke="${trim}" stroke-width="1.200"/>`
    : `<circle cx="76" cy="47" r="11.500" fill="rgba(0,0,0,.3)" filter="url(#sb${sid})"/>${uniEmblem(id, 21, { at: [65.500, 35.500] })}<circle cx="76" cy="46" r="11.200" fill="none" stroke="${trim}" stroke-width=".9" stroke-dasharray="1.300 .9" opacity=".95"/>`;
  return `<svg class="shirt" viewBox="0 0 120 130" role="img" aria-label="เสื้อช็อปของ ${nm} (${esc(u.symbol || 'SIXENT')})">
    <defs><linearGradient id="sh${sid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></linearGradient>
      <linearGradient id="sv${sid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset=".22" stop-color="#000" stop-opacity="0"/><stop offset=".78" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>
      <pattern id="sw${sid}" width="3" height="3" patternUnits="userSpaceOnUse"><path d="M0 3L3 0" stroke="rgba(255,255,255,.1)" stroke-width=".6"/><path d="M0 0L3 3" stroke="rgba(0,0,0,.06)" stroke-width=".5"/></pattern>
      <filter id="sb${sid}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.500"/></filter></defs>
    <ellipse cx="60" cy="125" rx="40" ry="3.500" fill="rgba(0,0,0,.16)"/>
    <path d="${bodyP}" fill="var(--pri)" stroke="rgba(0,0,0,.32)" stroke-width="1.500" stroke-linejoin="round"/>
    ${has('shoulder') ? `<path d="M38 10 L18 22 L22 28 L42 16Z M82 10 L102 22 L98 28 L78 16Z" fill="${trim}" opacity=".92"/>` : ''}
    ${has('chest') ? `<rect x="30" y="86" width="60" height="4" fill="${trim}" opacity=".92"/><rect x="30" y="92" width="60" height="2" fill="${trim}" opacity=".6"/>` : ''}
    ${has('hem') ? `<rect x="30" y="112" width="60" height="8" fill="${trim}" opacity=".94"/>` : ''}
    ${has('cuff') ? `<path d="M4 54 L24 62" stroke="${trim}" stroke-width="5" stroke-linecap="round"/><path d="M116 54 L96 62" stroke="${trim}" stroke-width="5" stroke-linecap="round"/>` : ''}
    <path d="${bodyP}" fill="url(#sw${sid})"/><path d="${bodyP}" fill="url(#sv${sid})"/><path d="${bodyP}" fill="url(#sh${sid})"/>
    <g filter="url(#sb${sid})"><path d="M30 48L24 62L12 58L22 40z" fill="rgba(0,0,0,.2)"/><path d="M90 48L96 62L108 58L98 40z" fill="rgba(0,0,0,.24)"/>
      <g fill="none" stroke="rgba(0,0,0,.22)" stroke-width="3"><path d="M34 68Q43 86 37 108"/><path d="M86 68Q77 88 83 106"/><path d="M46 92Q60 99 74 92"/></g>
      <g fill="none" stroke="rgba(255,255,255,.2)" stroke-width="2.600"><path d="M44 66Q50 84 46 106"/><path d="M52 40Q40 52 36 62"/></g></g>
    <g fill="none" stroke="rgba(0,0,0,.2)" stroke-width="1"><path d="M20 24Q31 34 30 48M100 24Q89 34 90 48"/></g>
    <g fill="none" stroke="rgba(255,255,255,.35)" stroke-width=".8" stroke-dasharray="2.200 2"><path d="M32 118H88"/><path d="M60 36V118" transform="translate(2 0)"/></g>
    <path d="M38 12Q60 36 82 12L80 24Q60 44 40 24z" fill="rgba(0,0,0,.28)" filter="url(#sb${sid})"/>
    ${collar}
    <path d="M57.500 34H62.500V120H57.500z" fill="rgba(0,0,0,.1)"/>${[46, 62, 78, 94, 108].map(y => `<circle cx="60" cy="${y}" r="2.100" fill="rgba(255,255,255,.88)" stroke="rgba(0,0,0,.3)" stroke-width=".5"/>`).join('')}
    ${patchIcon}
    <g><rect x="66" y="60" width="20" height="19" rx="2" fill="rgba(0,0,0,.1)" stroke="rgba(0,0,0,.3)"/><path d="M66 60H86V65L76 68L66 65z" fill="rgba(0,0,0,.14)" stroke="rgba(0,0,0,.3)" stroke-width=".8"/><circle cx="76" cy="66" r="1.200" fill="rgba(255,255,255,.85)"/><path d="M68 76H84" stroke="rgba(255,255,255,.4)" stroke-dasharray="1.600 1.400"/></g>
    <rect x="31" y="58" width="25" height="10.500" rx="2" fill="#fff" stroke="rgba(0,0,0,.25)"/><text x="43.500" y="66" text-anchor="middle" font-size="6.500" font-weight="700" fill="#222">${nm}</text></svg>`;
}

/* ---------- แผงอัตลักษณ์ (ใช้ในการ์ดเสื้อและหน้าเลือกธีม) ---------- */
function uniFacts(id) {
  const u = uniOf(id), chips = [];
  if (u.tree) chips.push(['tree', u.tree]); if (u.symbol) chips.push(['crest', u.symbol]); if (u.color) chips.push(['palette', u.color]);
  return `<div class="unichips">${chips.map(c => `<span>${uic(c[0], 14)} ${esc(c[1])}</span>`).join('')}</div>`;
}
function uniLogoHtml(id, size) { return uniMark(id, size); }
