// อัตลักษณ์ของแต่ละมหาวิทยาลัย: คติพจน์ ต้นไม้/ดอกไม้ สัญลักษณ์ ลวดลายพื้นหลัง และทรงเสื้อช็อป
// ข้อมูลคติพจน์/สี/ต้นไม้/สัญลักษณ์อ้างอิงจากกล่องข้อมูลของ Wikipedia ภาษาไทยของแต่ละมหาวิทยาลัย
// ตราสัญลักษณ์ (data/uni_art.js) เสื้อช็อปและลวดลายทั้งหมดวาดขึ้นเอง ไม่ใช่ของทางการ — ถ้าอยากใช้รูปจริง วางไฟล์ไว้ที่ icons/uni/ (ดู README ในโฟลเดอร์นั้น)
const UNI = {
  sixent: { motto: 'ติวให้พร้อม แล้วไปเป็นวิศวกรในฝัน', pat: 'gear', shirt: { base: null, btn: '#f4f4f4', pocket: 'flat', low: 2, emb: 'pocket', t1: '#ffffff', l1: 'SIXENT', l2: 'ENGINEERING' } },
  chula: { motto: 'ความรู้คู่คุณธรรม', tree: 'ต้นจามจุรี', symbol: 'พระเกี้ยว', color: 'สีชมพู', pat: 'leaf', shirt: { base: '#5d7390', btn: '#4b5f7a', pocket: 'flat', low: 2, emb: 'pocket', t1: '#c8283a', l1: 'FACULTY OF ENGINEERING', l2: 'CHULALONGKORN UNIVERSITY' } },
  ku: { motto: 'ศาสตร์แห่งแผ่นดิน', tree: 'ต้นนนทรี', symbol: 'พระพิรุณทรงนาค', color: 'สีเขียวใบไม้', pat: 'leaf2', shirt: { base: '#5b6258', btn: '#1c1e1b', pocket: 'pleat', low: 2, emb: 'chest', ring: '#d6283a', t1: '#f2c14e', l1: 'FACULTY OF ENGINEERING', l2: 'KASETSART UNIVERSITY' } },
  psu: { motto: 'ประโยชน์ของเพื่อนมนุษย์เป็นกิจที่หนึ่ง', tree: 'ดอกศรีตรัง', symbol: 'พระมหาพิชัยมงกุฎ', color: 'สีน้ำเงิน', pat: 'wave', shirt: { base: '#1f2b55', btn: '#0f1638', pocket: 'flat', low: 2, emb: 'pocket', t1: '#e8b43a', t2: '#d8402a', l1: 'FACULTY OF ENGINEERING', l2: 'PRINCE OF SONGKLA UNIV.', stitch: 'rgba(255,255,255,.25)' } },
  kku: { motto: 'วิทยา จริยา ปัญญา', tree: 'ต้นกัลปพฤกษ์', symbol: 'พระธาตุพนม และกาลพฤกษ์', color: 'สีดินแดง', pat: 'khit', shirt: { base: '#2b3368', btn: '#1a2050', pocket: 'flat', low: 0, emb: 'pocket', ring: '#e8542a', t1: '#f2c14e', l1: 'FACULTY OF ENGINEERING', l2: 'KHON KAEN UNIVERSITY' } },
  cmu: { motto: 'อตฺตานํ ทมยนฺติ ปณฺฑิตา (บัณฑิตย่อมฝึกตน)', tree: 'ต้นทองกวาว', symbol: 'ช้างเผือก', color: 'สีม่วงดอกรัก', pat: 'lanna', shirt: { base: '#1a2240', btn: '#f4f4f4', pocket: 'flat', low: 0, emb: 'cmu' } },
  kmutt: { motto: 'ทนโต เสฏโฐ มนุสเสสุ (ผู้ฝึกตนดีแล้วประเสริฐสุด)', tree: 'ดอกธรรมรักษา', symbol: 'พระมหามงกุฎ', color: 'สีแสดและสีเหลือง', pat: 'gear', shirt: { base: '#432a2e', btn: '#12161d', pocket: 'pleat', low: 2, emb: 'chest', t1: '#e8542a', t2: '#f2c14e', l1: "KING MONGKUT'S UNIVERSITY", l2: 'OF TECHNOLOGY THONBURI', sleeve: true, stitch: 'rgba(214,170,150,.55)' } },
  kmitl: { motto: 'การศึกษา วิจัย ด้านวิทยาศาสตร์และเทคโนโลยี เป็นรากฐานของการพัฒนาประเทศ', tree: 'ดอกแคแสด', symbol: 'พระมหามงกุฎ', color: 'สีแสดและสีขาว', pat: 'circuit', shirt: { base: '#3d5575', btn: '#11151c', pocket: 'pleat', low: 2, emb: 'chest', t1: '#e04545', t2: '#e8b43a', l1: 'FACULTY OF ENGINEERING', l2: 'KMITL', stitch: 'rgba(200,220,240,.5)' } },
  kmutnb: { motto: 'พัฒนาคน พัฒนาวิทยาศาสตร์และเทคโนโลยี', tree: 'ต้นประดู่แดง', symbol: 'พระมหามงกุฎ', color: 'สีแสดและสีดำ', pat: 'chevron', shirt: { base: '#26272d', btn: '#0b0c0f', pocket: 'pleat', low: 2, emb: 'chest', t1: '#ff7a2a', t2: '#ff7a2a', l1: 'FACULTY OF ENGINEERING', l2: 'KMUTNB' } },
  tu: { motto: 'เป็นเลิศ เป็นธรรม ร่วมนำสังคม', tree: 'ต้นหางนกยูงฝรั่ง', symbol: 'ธรรมจักร · ตึกโดม', color: 'สีเหลืองและสีแดง', pat: 'dharma', shirt: { base: '#203559', btn: '#0f1a33', pocket: 'flat', low: 2, emb: 'chest', ring: '#e8801a', t1: '#f2c14e', l1: 'FACULTY OF ENGINEERING', l2: 'THAMMASAT UNIVERSITY' } },
  mu: { motto: 'อตฺตานํ อุปมํ กเร (ปฏิบัติต่อผู้อื่นเหมือนต่อตนเอง)', tree: 'ต้นกันภัยมหิดล', symbol: 'ตราราชสกุลมหิดล (วงกลมสองชั้น)', color: 'สีน้ำเงิน', pat: 'dna', shirt: { base: '#202f5b', btn: '#101a38', pocket: 'flat', low: 2, emb: 'pocket', t1: '#e0452d', t2: '#e0452d', l1: 'FACULTY OF ENGINEERING', l2: 'MAHIDOL UNIVERSITY', sleeve: true, stitch: 'rgba(255,255,255,.28)' } }
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
  /* เสื้อช็อปวิศวะทรงเชิ้ตคอเปิด (คอแคมป์) — สี ตำแหน่งปัก กระเป๋า และสีด้ายอ้างอิงจากรูปเสื้อจริงของแต่ละมหาวิทยาลัย (ภาพที่วาดเอง ไม่ใช่รูปถ่าย) */
  const base = S.base || 'var(--pri)', hx = /^#[0-9a-f]{6}$/i.test(S.base || '') ? parseInt(S.base.slice(1), 16) : 0x4f46e5;
  const lum = (0.299 * (hx >> 16) + 0.587 * ((hx >> 8) & 255) + 0.114 * (hx & 255)) / 255, dk = lum < 0.42;
  const ln = dk ? 'rgba(255,255,255,.22)' : 'rgba(0,0,0,.32)', st = S.stitch || (dk ? 'rgba(255,255,255,.3)' : 'rgba(0,0,0,.3)');
  const btn = S.btn || '#f4f4f4', t1 = S.t1 || '#f2c14e', t2 = S.t2 || t1, l1 = S.l1 || 'FACULTY OF ENGINEERING', l2 = S.l2 || '';
  const bodyP = 'M44 8 L16 22 L2 52 L22 62 L30 50 L30 120 L90 120 L90 50 L98 62 L118 52 L104 22 L76 8 L60 44 Z';
  const tx = (x, y, s, fs, fill, w) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${fs}" font-weight="700" fill="${fill}" textLength="${w}" lengthAdjust="spacingAndGlyphs">${esc(s)}</text>`;
  /* ลายปักตราคณะ: วงเฟืองด้าย + ตรามหาวิทยาลัย + ข้อความสองบรรทัด */
  const emb = (cx, top, E, tw) => {
    const cy = top + E / 2, ring = S.ring ? `<circle cx="${cx}" cy="${cy}" r="${E / 2 + 1.3}" fill="none" stroke="${S.ring}" stroke-width="1.7" stroke-dasharray="1.500 1.100"/>` : '';
    return `${ring}${uniEmblem(id, E, { at: [cx - E / 2, top] })}${tx(cx, top + E + (S.ring ? 4.600 : 3.600), l1, 1.9, t1, tw)}${l2 ? tx(cx, top + E + (S.ring ? 7.400 : 6.400), l2, 1.9, t2, tw) : ''}`;
  };
  const pocketPath = S.pocket === 'pleat' ? 'M66 54H86V73L76 77L66 73Z' : 'M66 54H86V75Q86 76 85 76H67Q66 76 66 75Z';
  const cmuPocket = `<g transform="translate(0 -4)" fill="none" stroke="#e8edf7" stroke-linecap="round" stroke-linejoin="round" opacity=".95"><circle cx="76" cy="67.500" r="5.300" stroke-width=".6" stroke-dasharray="1 .7"/><circle cx="76" cy="67.500" r="3.700" stroke-width=".35"/><path d="M76 61.300v1.200M76 72.500v1.200M69.800 67.500H71M81 67.500h1.200M71.600 63.100l.9.9M79.500 71l.9.9M80.400 63.100l-.9.9M72.500 71l-.9.9" stroke-width=".7"/><path d="M73.600 64.300h4.800L76 67.500l2.400 3.200h-4.800L76 67.500Z" stroke-width=".55" fill="rgba(232,237,247,.28)"/></g><g transform="translate(0 -4)">${tx(76, 76.300, 'ENTANEER', 2.700, '#e8edf7', 14)}${tx(76, 78.600, 'CHIANG MAI UNIVERSITY', 1.4, '#e8edf7', 15)}</g>`;
  const pocket = `<g><path d="${pocketPath}" fill="rgba(0,0,0,.1)" stroke="${ln}" stroke-width=".9"/><path d="M66 57.500H86" stroke="${st}" stroke-width=".5" stroke-dasharray="1.200 .8"/>${S.pocket === 'pleat' ? `<path d="M76 58V74" stroke="${ln}" stroke-width=".8"/>` : ''}${S.emb === 'pocket' ? emb(76, 58.500, 9, 17) : S.emb === 'cmu' ? cmuPocket : ''}</g>`;
  const low = n => !n ? '' : [32, 66].map(x => `<g><path d="M${x} 90H${x + 22}V111L${x + 19} 114H${x + 3}L${x} 111Z" fill="rgba(0,0,0,.1)" stroke="${ln}" stroke-width=".9"/><path d="M${x} 94H${x + 22}" stroke="${st}" stroke-width=".5" stroke-dasharray="1.200 .8"/>${S.pocket === 'pleat' ? `<path d="M${x + 11} 95V110" stroke="${ln}" stroke-width=".8"/>` : ''}</g>`).join('');
  const nmY = (S.emb === 'chest' || S.emb === 'cmu') ? 75 : 58;
  const chestEmb = S.emb === 'chest' ? emb(43, 47, 12, 24)
    : S.emb === 'cmu' ? `<circle cx="43" cy="55" r="7" fill="#141b34" stroke="#c9d3ea" stroke-width=".8"/><circle cx="43" cy="55" r="5.600" fill="none" stroke="#c9d3ea" stroke-width=".3" stroke-dasharray="1 .7"/>${tx(43, 56.600, 'CMU', 4.400, '#e8edf7', 8.500)}` : '';
  const sleeve = S.sleeve ? `<g transform="rotate(-22 12 42)"><circle cx="12" cy="42" r="4.800" fill="rgba(0,0,0,.22)"/>${uniEmblem(id, 8, { at: [8, 38] })}</g>` : '';
  const sheen = dk ? '.035' : '.1';
  return `<svg class="shirt" viewBox="0 0 120 130" role="img" aria-label="เสื้อช็อปของ ${nm} (${esc(u.symbol || 'SIXENT')})">
    <defs><linearGradient id="sh${sid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".36"/></linearGradient>
      <linearGradient id="sv${sid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".26"/><stop offset=".22" stop-color="#000" stop-opacity="0"/><stop offset=".78" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient>
      <pattern id="sw${sid}" width="3" height="3" patternUnits="userSpaceOnUse"><path d="M0 3L3 0" stroke="rgba(255,255,255,${sheen})" stroke-width=".6"/><path d="M0 0L3 3" stroke="rgba(0,0,0,.05)" stroke-width=".5"/></pattern>
      <filter id="sb${sid}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.500"/></filter></defs>
    <ellipse cx="60" cy="125" rx="40" ry="3.500" fill="rgba(0,0,0,.16)"/>
    <path d="${bodyP}" fill="${base}" stroke="rgba(0,0,0,.34)" stroke-width="1.500" stroke-linejoin="round"/>
    <path d="${bodyP}" fill="url(#sw${sid})"/><path d="${bodyP}" fill="url(#sv${sid})"/><path d="${bodyP}" fill="url(#sh${sid})"/>
    <g filter="url(#sb${sid})"><path d="M30 50L22 62L10 57L20 38z" fill="rgba(0,0,0,.2)"/><path d="M90 50L98 62L110 57L100 38z" fill="rgba(0,0,0,.24)"/>
      <g fill="none" stroke="rgba(0,0,0,.2)" stroke-width="3"><path d="M34 70Q43 88 37 108"/><path d="M86 70Q77 90 83 108"/><path d="M46 90Q60 97 74 90"/></g>
      <g fill="none" stroke="rgba(255,255,255,.18)" stroke-width="2.600"><path d="M44 68Q50 86 46 106"/></g></g>
    <g fill="none" stroke="${st}" stroke-width=".6" stroke-dasharray="1.600 1.200"><path d="M20 24Q31 34 30 50M100 24Q89 34 90 50"/><path d="M3.800 48.400L23.800 58.400M116.200 48.400L96.200 58.400"/><path d="M32 117H88"/></g>
    <path d="M44 8L76 8L60 44Z" fill="rgba(0,0,0,.42)"/>
    <path d="M45 8Q60 16 75 8L60 36Z" fill="rgba(0,0,0,.18)"/>
    <g stroke="${ln}" stroke-width=".9" stroke-linejoin="round"><path d="M31 14.500L46 5L64 33L60 46Z" fill="${base}"/><path d="M89 14.500L74 5L56 33L60 46Z" fill="${base}"/></g>
    <path d="M31 14.500L46 5L64 33L60 46Z M89 14.500L74 5L56 33L60 46Z" fill="rgba(255,255,255,${dk ? '.09' : '.12'})"/>
    <path d="M35 15L60 41M85 15L60 41" fill="none" stroke="${st}" stroke-width=".5" stroke-dasharray="1.200 .8"/>
    <path d="M60 44V120" stroke="rgba(0,0,0,.28)" stroke-width="1"/>${[56, 69, 82, 95, 108].map(y => `<circle cx="60" cy="${y}" r="2.100" fill="${btn}" stroke="rgba(0,0,0,.4)" stroke-width=".5"/><circle cx="59.300" cy="${y - .7}" r=".6" fill="rgba(255,255,255,.55)"/>`).join('')}
    ${low(S.low)}${pocket}${chestEmb}${sleeve}
    <rect x="31" y="${nmY}" width="23" height="8.500" rx="2" fill="#fff" stroke="rgba(0,0,0,.25)"/><text x="42.500" y="${nmY + 6.200}" text-anchor="middle" font-size="5.400" font-weight="700" fill="#222">${nm}</text></svg>`;
}

/* ---------- แผงอัตลักษณ์ (ใช้ในการ์ดเสื้อและหน้าเลือกธีม) ---------- */
function uniFacts(id) {
  const u = uniOf(id), chips = [];
  if (u.tree) chips.push(['tree', u.tree]); if (u.symbol) chips.push(['crest', u.symbol]); if (u.color) chips.push(['palette', u.color]);
  return `<div class="unichips">${chips.map(c => `<span>${uic(c[0], 14)} ${esc(c[1])}</span>`).join('')}</div>`;
}
function uniLogoHtml(id, size) { return uniMark(id, size); }
