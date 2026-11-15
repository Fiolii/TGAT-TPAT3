// ตัวละครของฉัน (ประกอบร่าง) — การ์ตูนหัวโตแรเงานุ่มกึ่ง 3 มิติ
// โครง: ฉากหลัง → ผมหลัง → สัตว์เลี้ยง → ขา/กางเกง/รองเท้า → ตัว/เสื้อ/ชั้นนอก/ที่คอ → หัว(หน้า ตา ปาก ผมหน้า ที่ประดับ หมวก แว่น) → มือ/ของในมือ → เอฟเฟกต์
// ความลึก: ไล่เฉดทุกชิ้น + เงาใต้ผมบนหน้าผาก + ไฮไลต์เงาวับ + ชั้นภาพขยับสวนกัน (parallax) ตามนิ้ว/เมาส์ — ดู .avl-* ใน char.css
// ===== สวิตช์ฟีเจอร์ตัวละคร =====
// ปิดชั่วคราว (false): ซ่อนตัวละคร/ห้องแต่งตัว/ร้านค้า และแสดงป้ายอักษรย่อแทนรูปตัวละคร ข้อมูลที่เก็บไว้ไม่หาย
// เปิดกลับมาโดยเปลี่ยนเป็น true แล้วเพิ่มเลขเวอร์ชันใน sw.js
const CHAR_ON = false;
const AV_FACE = 'M44 100C44 68 68 48 100 48C132 48 156 68 156 100C156 130 134 152 100 152C66 152 44 130 44 100Z';
const AV_EYES = [['sparkle', 'ประกายวิบวับ'], ['round', 'ตากลม'], ['dot', 'ตาจุด'], ['sleepy', 'ตาง่วง'], ['happy', 'ตายิ้ม'], ['cat', 'ตาแมว'], ['wink', 'ขยิบตา'], ['droopy', 'ตาหลุบ']];
const AV_MOUTHS = [['smile', 'ยิ้มนิด ๆ'], ['grin', 'ยิ้มกว้าง'], ['cat', 'ปากแมว'], ['open', 'อ้าปาก'], ['tongue', 'แลบลิ้น'], ['flat', 'เฉย ๆ'], ['pout', 'ทำปากจู๋']];
(function () {
  const lt = (c, a) => avMix(c, '#fff', a), dk = (c, a) => avMix(c, '#000', a);

  /* ---------- ตา ---------- */
  function eye(style, x, ec, uid, side) {
    const ink = '#3a2530', hi = (dx, dy, r) => `<ellipse cx="${x + dx}" cy="${108 + dy}" rx="${r}" ry="${r * 1.2}" fill="#fff"/>`;
    const big = (rx, ry, ir) => `<g class="avey"><ellipse cx="${x}" cy="108" rx="${rx}" ry="${ry}" fill="${ink}"/><ellipse cx="${x}" cy="${109 + (ry - ir) * .3}" rx="${rx - 2}" ry="${ir}" fill="url(#ir${uid})"/><ellipse cx="${x}" cy="${111 + (ry - ir) * .3}" rx="${rx * .5}" ry="${ir * .5}" fill="#1b1424"/>${hi(-4, -5.2, 4.2)}<circle cx="${x + 4.4}" cy="116" r="2.2" fill="#fff" opacity=".9"/><path d="M${x - rx - 1} ${108 - ry * .42}Q${x} ${108 - ry - 4} ${x + rx + 1} ${108 - ry * .42}" stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round"/></g>`;
    switch (style) {
      case 'round': return `<g class="avey"><ellipse cx="${x}" cy="108" rx="9" ry="11" fill="${ink}"/>${hi(-3, -3.8, 3.2)}<circle cx="${x + 2.6}" cy="112" r="1.3" fill="#fff" opacity=".8"/></g>`;
      case 'dot': return `<g class="avey"><ellipse cx="${x}" cy="108" rx="4.4" ry="5.6" fill="${ink}"/>${hi(-1.4, -1.8, 1.4)}</g>`;
      case 'sleepy': return `<g class="avey"><path d="M${x - 9} 108H${x + 9}A9 9 0 0 1 ${x - 9} 108Z" fill="${ink}"/><path d="M${x - 11} 108H${x + 11}" stroke="${ink}" stroke-width="3" stroke-linecap="round"/><ellipse cx="${x - 2}" cy="112" rx="2.6" ry="2" fill="#fff"/></g>`;
      case 'happy': return `<path d="M${x - 9} 112Q${x} 99 ${x + 9} 112" stroke="${ink}" stroke-width="3.8" fill="none" stroke-linecap="round"/>`;
      case 'cat': return `<g class="avey"><ellipse cx="${x}" cy="108" rx="9" ry="10.5" fill="${ink}"/><ellipse cx="${x}" cy="109" rx="7" ry="8.6" fill="url(#ir${uid})"/><ellipse cx="${x}" cy="109" rx="2.4" ry="8" fill="#1b1424"/>${hi(-3, -4, 3)}<path d="M${x - 9} 101Q${x} 96 ${x + 9} 101M${x + side * 8} 101L${x + side * 17} 94" stroke="${ink}" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>`;
      case 'droopy': return `<g class="avey" transform="rotate(${side * 10} ${x} 108)">${big(10.4, 12.8, 10).replace(/<g class="avey">|<\/g>$/g, '')}</g>`;
      case 'wink': return side > 0 ? `<path d="M${x - 9} 112Q${x} 99 ${x + 9} 112" stroke="${ink}" stroke-width="3.8" fill="none" stroke-linecap="round"/>` : big(11.6, 14.6, 11.2);
      default: return big(11.6, 14.6, 11.2);
    }
  }
  function mouth(style) {
    const ink = '#8a3b3b';
    switch (style) {
      case 'grin': return `<path d="M86 127Q100 150 114 127Z" fill="#7a2c3a" stroke="${ink}" stroke-width="2" stroke-linejoin="round"/><path d="M92 139Q100 134 108 139Q100 145 92 139Z" fill="#ff8fa3"/><path d="M88 128H112" stroke="#fff" stroke-width="3" opacity=".9"/>`;
      case 'cat': return `<path d="M88 130Q94 139 100 131Q106 139 112 130" stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      case 'open': return `<ellipse cx="100" cy="135" rx="5.5" ry="7" fill="#7a2c3a" stroke="${ink}" stroke-width="2"/><ellipse cx="100" cy="139" rx="3.2" ry="2.6" fill="#ff8fa3"/>`;
      case 'tongue': return `<path d="M88 129Q100 142 112 129" stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M96 136Q100 147 104 136Z" fill="#ff7a9a" stroke="${ink}" stroke-width="1.4"/>`;
      case 'flat': return `<path d="M93 134H107" stroke="${ink}" stroke-width="3.2" stroke-linecap="round"/>`;
      case 'pout': return `<path d="M94 135Q100 128 106 135Q100 140 94 135Z" fill="#ff8fa3" stroke="${ink}" stroke-width="2" stroke-linejoin="round"/>`;
      default: return `<path d="M91 130Q100 140 109 130" stroke="${ink}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
    }
  }

  /* ---------- ท่อนล่าง / รองเท้า (เอวที่ y≈248) ---------- */
  function legs(bot, bc, skin) {
    const dkc = dk(bc, .25), st = 'stroke="rgba(70,40,55,.65)" stroke-width="1.3" stroke-linejoin="round"', line = dk(skin, .38);
    const limb = (x1, y1, x2, y2, f, l, w) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${l}" stroke-width="${(w || 12.5) + 2.4}" stroke-linecap="round" fill="none"/><path d="M${x1} ${y1}L${x2} ${y2}" stroke="${f}" stroke-width="${w || 10}" stroke-linecap="round" fill="none"/>`;
    const lg = () => limb(91, 200, 90, 286, skin, line) + limb(109, 200, 110, 286, skin, line);
    const band = `<rect x="76" y="184" width="48" height="8" rx="3.5" fill="${dkc}" ${st}/>`;
    const sk = (hem, folds) => `<path d="M70 188H130L${130 + (hem - 188) * .3} ${hem}Q100 ${hem + 12} ${70 - (hem - 188) * .3} ${hem}Z" fill="${bc}" ${st}/>${folds || ''}`;
    switch (bot) {
      case 'skirt': return lg() + sk(238, `<path d="M82 192L74 240M100 192V246M118 192L126 240" stroke="${dkc}" stroke-width="1.4" opacity=".5"/>`) + band;
      case 'pleated': return lg() + sk(238, Array.from({ length: 8 }, (_, i) => `<path d="M${76 + i * 7.4} 192L${62 + i * 11} 242" stroke="${dkc}" stroke-width="1.5" opacity=".5"/>`).join('') + `<path d="M60 234Q100 246 140 234" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/>`) + band;
      case 'shorts': return lg() + `<path d="M76 189H124L128 234H103L100 214L97 234H72Z" fill="${bc}" ${st}/><path d="M100 194V214" stroke="${dkc}" stroke-width="1.4"/>` + band;
      case 'cargo': return lg() + `<path d="M75 189H125L130 262H103L100 216L97 262H70Z" fill="${bc}" ${st}/><rect x="74" y="232" width="15" height="14" rx="2" fill="${dkc}" opacity=".45"/><rect x="111" y="232" width="15" height="14" rx="2" fill="${dkc}" opacity=".45"/><path d="M100 194V216" stroke="${dkc}" stroke-width="1.4"/>` + band;
      case 'leggings': return limb(91, 196, 90, 286, bc, dkc, 11) + limb(109, 196, 110, 286, bc, dkc, 11) + `<path d="M87 210Q88 240 87 276M113 210Q112 240 113 276" stroke="${lt(bc, .3)}" stroke-width="2" fill="none" opacity=".5"/>` + band;
      case 'jeans': return `<path d="M76 189H124L121 288H103L100 214L97 288H79Z" fill="${bc}" ${st}/><path d="M88 230V286M112 230V286" stroke="${lt(bc, .25)}" stroke-width="1.4" opacity=".6"/><path d="M79 196Q84 205 92 198M121 196Q116 205 108 198" stroke="#f1d27a" stroke-width="1.4" fill="none" stroke-dasharray="2 2"/><path d="M80 282H97M103 282H120" stroke="${lt(bc, .3)}" stroke-width="3" opacity=".5"/>` + band;
      default: return `<path d="M76 189H124L121 288H103L100 212L97 288H79Z" fill="${bc}" ${st}/><path d="M88 230V286M112 230V286" stroke="${dkc}" stroke-width="1.2" opacity=".4"/>` + band;
    }
  }
  function shoes(kind, uc) {
    const one = (x, mir) => {
      const m = mir ? -1 : 1, X = d => x + d * m;
      switch (kind) {
        case 'loafer': return `<path d="M${X(-14)} 288H${X(12)}Q${X(20)} 290 ${X(20)} 298Q${X(20)} 302 ${X(16)} 302H${X(-14)}Q${X(-16)} 296 ${X(-14)} 288Z" fill="#6b4529" stroke="#3b2314" stroke-width="1.2"/><path d="M${X(-8)} 292Q${X(2)} 288 ${X(12)} 292" stroke="#a9744f" stroke-width="2" fill="none"/><path d="M${X(-15)} 300H${X(18)}" stroke="#2a180d" stroke-width="2.4"/>`;
        case 'boots': return `<path d="M${X(-12)} 274H${X(12)}L${X(12)} 290Q${X(22)} 292 ${X(22)} 299Q${X(22)} 302 ${X(18)} 302H${X(-14)}Q${X(-16)} 296 ${X(-12)} 288Z" fill="#7a4a2b" stroke="#3b2314" stroke-width="1.2"/><path d="M${X(-12)} 276H${X(12)}" stroke="#a9744f" stroke-width="3"/><path d="M${X(-15)} 300H${X(20)}" stroke="#2a180d" stroke-width="2.6"/>`;
        case 'slipper': return `<path d="M${X(-13)} 296H${X(15)}Q${X(19)} 296 ${X(19)} 300Q${X(19)} 303 ${X(15)} 303H${X(-13)}Q${X(-16)} 300 ${X(-13)} 296Z" fill="#f4b6c8" stroke="#c9849b" stroke-width="1.2"/><path d="M${X(-8)} 296Q${X(0)} 286 ${X(10)} 296" fill="${'#ff8fb1'}" stroke="#c9849b" stroke-width="1.2"/>`;
        case 'highcut': return `<path d="M${X(-13)} 278H${X(11)}L${X(12)} 288Q${X(21)} 290 ${X(21)} 298Q${X(21)} 302 ${X(17)} 302H${X(-15)}Q${X(-17)} 292 ${X(-13)} 278Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/><path d="M${X(-12)} 282H${X(10)}M${X(-13)} 288H${X(10)}" stroke="${uc}" stroke-width="2"/><path d="M${X(-16)} 298H${X(20)}" stroke="${uc}" stroke-width="3.4"/>`;
        case 'mary': return `<rect x="${X(-6)}" y="272" width="12" height="17" rx="5" fill="#fff" stroke="#cfc3cf" stroke-width="1.1"/><path d="M${X(-6)} 276H${X(6)}" stroke="#e4d8e4" stroke-width="1.2"/><path d="M${X(-13)} 288H${X(11)}Q${X(18)} 290 ${X(18)} 297Q${X(18)} 302 ${X(14)} 302H${X(-13)}Q${X(-15)} 295 ${X(-13)} 288Z" fill="#2b2530" stroke="#150f18" stroke-width="1.2"/><path d="M${X(-8)} 290H${X(8)}" stroke="#fff" stroke-width="1.6" opacity=".55"/><path d="M${X(-14)} 300H${X(16)}" stroke="#0b070d" stroke-width="2.2"/>`;
        default: return `<path d="M${X(-14)} 286H${X(12)}Q${X(22)} 290 ${X(20)} 299Q${X(20)} 302 ${X(16)} 302H${X(-16)}Q${X(-18)} 292 ${X(-14)} 286Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/><path d="M${X(-17)} 298H${X(19)}" stroke="${uc}" stroke-width="3.6"/><path d="M${X(-6)} 289L${X(6)} 291M${X(-6)} 293L${X(6)} 295" stroke="#94a3b8" stroke-width="1.4"/>`;
      }
    };
    return `<g transform="translate(88 0) scale(.74 1) translate(-88 0)">${one(88, false)}</g><g transform="translate(112 0) scale(.74 1) translate(-112 0)">${one(112, true)}</g>`;
  }

  /* ---------- ประกอบ ---------- */
  window.avatarSvg = function (over, o) {
    o = o || {}; const c = Object.assign({}, typeof avCfg === 'function' ? avCfg() : AVDEF, over || {}), uid = ++AVC;
    const skin = AVSKIN[c.skin] || AVSKIN.b, hc = /^#[0-9a-f]{6}$/i.test(c.hc) ? c.hc : '#1f1b1b', hc2 = /^#[0-9a-f]{6}$/i.test(c.hc2 || '') ? c.hc2 : '';
    const ec = /^#[0-9a-f]{6}$/i.test(c.ec || '') ? c.ec : '#6b3f24', uc = avUniCol(o.uni || (typeof curThemeId === 'function' ? curThemeId() : 'sixent'));
    const nick = o.nick != null ? String(o.nick) : (typeof store !== 'undefined' ? store.get('nick', 'น้องวิศวะ') : 'น้องวิศวะ');
    const ST = { chibi: { hs: .9, chin: 126, ty: 124, ts: .66 }, round: { hs: 1.02, chin: 140, ty: 136, ts: .52, eye: 'dot' }, real: { hs: .62, chin: 100, ty: 100, ts: .8 } }, S = ST[o.style || c.style] || ST.chibi;
    const x0 = 100 - 60 * S.ts, ay = S.ty + 24 * S.ts, hy = S.ty + 92 * S.ts, hxl = x0 + 10 * S.ts, hxr = 200 - hxl;
    const look = o.look || c.look || 'flat', flat = look !== 'soft', sz = Math.min(1.15, Math.max(.85, +c.sz || 1)), bw = Math.min(1.2, Math.max(.85, +c.bw || 1));
    const only = o.only || '', L = { bg: o.bg !== false && !only, hb: !only || only === 'head', pet: !only || only === 'pet', legs: !only || only === 'legs' || only === 'feet', torso: !only || only === 'torso' || only === 'hand', head: !only || only === 'head', hand: !only || only === 'hand', fx: !only || only === 'fx', bgOnly: only === 'bg' };
    if (only === 'fx' || only === 'bg') { L.torso = L.head = L.hb = L.legs = L.hand = false; L.pet = false; }
    if (only === 'bg') L.bg = true;
    const hairO = { f: `url(#hf${uid})`, fb: `url(#hb${uid})`, c: hc, d: dk(hc, .3), hl: lt(hc, .5) };
    let top;
    const isUni = /^unig?:/.test(c.top);
    if (isUni) {
      const gold = c.top.startsWith('unig:'), id = c.top.split(':')[1];
      top = uniShirt(nick, id, { paper: true, gold }).replace('<svg class="shirt"', '<svg x="0" y="0" width="120" height="130" overflow="visible" class="shirt"');
    } else top = AVX.top[c.top] ? AVX.top[c.top](c.tc, uid) : avGarment(c.top, c.tc, uid);
    const outer = AVX.outer[c.outer] ? AVX.outer[c.outer]() : avOuter(c.outer);
    const hood = c.top === 'hoodie' ? `<path d="M20 4Q60 -8 100 4L106 30Q60 46 14 30Z" fill="${avMix(c.tc, '#000', .12)}" stroke="rgba(0,0,0,.25)"/>` : '';
    const line = dk(skin, .38), arm = (x1, y1, x2, y2) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${line}" stroke-width="11.6" stroke-linecap="round"/><path d="M${x1} ${y1}L${x2} ${y2}" stroke="${skin}" stroke-width="9.2" stroke-linecap="round"/>`;
    const arms = arm(x0 + 20 * S.ts, ay, hxl, hy) + arm(200 - x0 - 20 * S.ts, ay, hxr, hy);
    const nk = String(c.neck).split(':'), neckUc = nk[1] ? avUniCol(nk[1]) : uc;
    const neckArt = AVX.neck[nk[0]] ? AVX.neck[nk[0]](neckUc) : avNeck(nk[0], neckUc, nick);
    const pet = AVX.pet[c.pet] ? `<g class="avpet" transform="translate(28 284) scale(.9)">${AVX.pet[c.pet]()}</g>` : '';
    const handItem = AVX.hand[c.hand] ? AVX.hand[c.hand](skin) : avHand(c.hand, skin).replace(/<circle cx="149" cy="163" r="7" fill="[^"]*"\/>$/, '');
    const bgSvg = (L.bg && c.bg) ? (AVX.bg[c.bg] ? AVX.bg[c.bg](uid) : avBg(c.bg, uid)) : '';
    const hacc = AVX.hacc[c.hacc] ? AVX.hacc[c.hacc](hc, uc) : '';
    const hat = AVX.head[c.head] ? AVX.head[c.head](uc) : avHead(c.head, uc);
    const glasses = AVX.face[c.face] ? AVX.face[c.face]() : avFace(c.face);
    const defs = `<defs>
      <radialGradient id="sk${uid}" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="${flat ? skin : lt(skin, .3)}"/><stop offset=".55" stop-color="${skin}"/><stop offset="1" stop-color="${flat ? skin : dk(skin, .13)}"/></radialGradient>
      <linearGradient id="hf${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${flat ? hc : lt(hc, .24)}"/><stop offset=".5" stop-color="${hc}"/><stop offset="1" stop-color="${flat ? hc : dk(hc, .24)}"/></linearGradient>
      <linearGradient id="hb${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${dk(hc, .06)}"/><stop offset=".55" stop-color="${dk(hc, .14)}"/><stop offset="1" stop-color="${hc2 || dk(hc, .26)}"/></linearGradient>
      <linearGradient id="ir${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${dk(ec, .4)}"/><stop offset=".5" stop-color="${ec}"/><stop offset="1" stop-color="${lt(ec, .45)}"/></linearGradient>
      <linearGradient id="sh${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".26"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".24"/></linearGradient>
      <linearGradient id="fh${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a3a2a" stop-opacity=".2"/><stop offset=".42" stop-color="#7a3a2a" stop-opacity="0"/></linearGradient>
      <radialGradient id="bl${uid}"><stop offset="0" stop-color="#ff7d98" stop-opacity=".7"/><stop offset="1" stop-color="#ff7d98" stop-opacity="0"/></radialGradient>
    </defs>`;
    const hl2 = dk(hc, .55);
    const brow = `<path d="M63 84Q76 78 91 83M109 83Q124 78 137 84" stroke="${dk(hc, .18)}" stroke-width="${c.g === 'f' ? 2.6 : 3.2}" fill="none" stroke-linecap="round"/>`;
    const HT = `translate(100 ${S.chin}) scale(${S.hs}) translate(-100 -152)`;
    const head = `<g transform="${HT}"><g class="avl-head">
      <circle cx="46" cy="108" r="9.5" fill="url(#sk${uid})" stroke="${line}" stroke-width="1.5"/><circle cx="154" cy="108" r="9.5" fill="url(#sk${uid})" stroke="${line}" stroke-width="1.5"/><circle cx="46" cy="109" r="4.6" fill="${dk(skin, .1)}" opacity=".5"/><circle cx="154" cy="109" r="4.6" fill="${dk(skin, .1)}" opacity=".5"/>
      <path d="${AV_FACE}" fill="url(#sk${uid})" stroke="${line}" stroke-width="1.7" stroke-linejoin="round"/><path d="${AV_FACE}" fill="url(#fh${uid})"/>
      <path d="M58 138Q100 160 142 138" stroke="${dk(skin, .12)}" stroke-width="7" fill="none" opacity=".18" stroke-linecap="round"/>
      <ellipse cx="64" cy="126" rx="14" ry="8.5" fill="url(#bl${uid})"/><ellipse cx="136" cy="126" rx="14" ry="8.5" fill="url(#bl${uid})"/>
      ${brow}${eye(S.eye || c.eye, 78, ec, uid, -1)}${eye(S.eye || c.eye, 122, ec, uid, 1)}
      <path d="M99 124Q100 125.5 101 124" stroke="${dk(skin, .3)}" stroke-width="1.8" fill="none" stroke-linecap="round"/>${mouth(c.mouth)}
      <g class="avl-hf"><g stroke="${hl2}" stroke-width="1.5" stroke-linejoin="round">${avHairFront(c.hair, hairO)}</g></g>
      <g class="avl-acc">${hacc}</g>
      <g transform="translate(100 108) scale(1.35) translate(-100 -70)">${glasses}</g>
      <g class="avl-acc"><g transform="translate(100 100) scale(1.28) translate(-100 -66)">${hat}</g></g>
    </g></g>`;
    const torso = `<rect x="93" y="${S.chin - 14}" width="14" height="22" rx="6" fill="${dk(skin, .08)}" stroke="${line}" stroke-width="1.3"/>${arms}
      <g transform="translate(${x0} ${S.ty}) scale(${S.ts})">${top}<path d="${AV_LS}" fill="url(#sh${uid})" opacity=".9" style="pointer-events:none"/>${hood}${outer}${outer ? `<path d="${AV_LS}" fill="url(#sh${uid})" opacity=".6"/>` : ''}</g>
      <g transform="translate(100 ${S.ty}) scale(${S.ts * 1.06}) translate(-100 -96)">${neckArt}</g>`;
    const hands = `<g class="avhands"><circle cx="${hxl}" cy="${hy + 2}" r="8" fill="url(#sk${uid})" stroke="${line}" stroke-width="1.4"/><circle cx="${hxr}" cy="${hy + 2}" r="8" fill="url(#sk${uid})" stroke="${line}" stroke-width="1.4"/><path d="M${hxl - 4} ${hy - 1}Q${hxl - 2} ${hy - 3} ${hxl + 1} ${hy - 2}" stroke="#fff" stroke-width="2" fill="none" opacity=".5" stroke-linecap="round"/></g><g transform="translate(${hxr - 149} ${hy + 2 - 163})">${handItem}</g>`;
    const vb = o.view === 'half' ? '8 0 184 262' : o.view === 'bust' ? '26 -4 148 168' : ({ head: '26 -6 148 148', torso: '36 108 128 128', legs: '36 182 128 124', feet: '44 250 112 60', hand: '84 110 100 110', pet: '0 244 72 64' }[only] || '0 0 200 310');
    const dims = o.w ? ` width="${o.w}"` : '';
    const fxSvg = (L.fx && AVX.fx[c.fx]) ? `<g class="avfx">${AVX.fx[c.fx]()}</g>` : '';
    return `<svg class="av ${o.cls || ''}" viewBox="${vb}"${dims} role="img" aria-label="ตัวละคร ${esc(nick)}" xmlns="http://www.w3.org/2000/svg">${defs}
      ${bgSvg}
      <g class="avbody"><g transform="translate(100 302) scale(${bw} ${sz}) translate(-100 -302)">${!only ? `<ellipse cx="100" cy="304" rx="56" ry="6" fill="rgba(0,0,0,.18)"/>` : ''}
      ${L.hb ? `<g transform="${HT}"><g class="avl-hb"><g stroke="${hl2}" stroke-width="1.5" stroke-linejoin="round">${avHairBack(c.hair, hairO)}</g></g></g>` : ''}${L.pet ? pet : ''}
      ${L.legs ? legs(c.bottom, c.bc, skin) + shoes(c.shoes, uc) : ''}
      ${L.torso ? torso : ''}${L.head ? head : ''}${(L.hand || L.torso) ? hands : ''}</g></g>${fxSvg}</svg>`;
  };
})();
