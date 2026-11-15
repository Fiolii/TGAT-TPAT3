// ตัวละครแบบภาพวาด 2 มิติ (ชิ้นส่วน PNG ที่ตัดจากแผ่นของผู้ใช้: assets/char/pf = หญิง, pm = ชาย) ซ้อนเป็นชั้นใน SVG
// ชิ้นส่วนที่ไม่ใช่ภาพ (เสื้อช็อปมหาวิทยาลัย ชุดเทศกาล ฉาก เอฟเฟกต์ ฯลฯ) ยังเป็นเวกเตอร์เดิม วางซ้อนด้วยจุดอ้างอิงของแต่ละเพศ
const PNGSET = {
  f: {
    hair: [['h_long', 'ผมยาวสลวย', 0], ['h_part', 'ผมแสกกลาง', 0], ['h_short', 'ผมสั้นหน้าม้า', 0], ['h_twin', 'ผมทูเทล', 30], ['h_pony', 'หางม้าสูง', 30], ['h_bun', 'ผมขนมจีบ', 40], ['h_braid', 'ผมเปียข้าง', 40]],
    fc: [['fc1', 'หน้านิ่ง', 0], ['fc2', 'ตาปิดอ้าปาก', 0], ['fc3', 'ยิ้มตาปิด', 0], ['fc4', 'น้ำตาซึม', 0], ['fc5', 'ยิ้มกว้าง', 0], ['fc6', 'หลับตายิ้ม', 0], ['fc7', 'ตาม่วงตกใจ', 0], ['fc8', 'หลับตา', 0], ['fc9', 'หลับตานิ่ง', 0]],
    top: [['t_blouse', 'เสื้อเชิ้ตผูกโบว์', 0], ['t_sailor', 'ชุดกะลาสี', 0], ['t_tee', 'เสื้อยืดขาว', 0], ['t_crop', 'เสื้อกล้ามสั้น', 20], ['t_longbow', 'เสื้อเชิ้ตแขนยาว', 40], ['t_sailor2', 'กะลาสีแขนยาว', 50], ['t_hoodie', 'ฮู้ดสีฟ้า', 50], ['t_cardi', 'คาร์ดิแกนชมพู', 60], ['t_vest', 'เสื้อกั๊กนักเรียน', 60], ['t_layer', 'เลเยอร์ดำ', 70], ['t_jacket', 'แจ็กเก็ตดำ', 70], ['t_varsity', 'วาร์ซิตี้', 80]],
    bottom: [['b_navy', 'กระโปรงกรมท่า', 0], ['b_black', 'กระโปรงดำคาดเข็มขัด', 0], ['b_plaid', 'กระโปรงสก็อต', 30], ['b_white', 'กระโปรงขาวโบว์', 40], ['b_layer', 'กระโปรงระบาย', 40], ['b_cargo', 'กางเกงคาร์โก้ดำ', 40], ['b_cargo2', 'กางเกงคาร์โก้เทา', 40]],
    legs: [['l_bare', 'ขาเปล่า', 0], ['l_white', 'ถุงเท้าขาวยาว', 0], ['l_black', 'ถุงเท้าดำ', 0], ['l_stripe', 'ถุงเท้าลายขอบ', 20]],
    shoes: [['s_mary', 'รองเท้ามารีเจน', 0], ['s_mary2', 'รองเท้าหนังดำ', 0], ['s_low', 'ผ้าใบขาว', 0], ['s_hi', 'ผ้าใบหุ้มข้อ', 30], ['s_boot', 'บูตหนัง', 30]],
    hacc: [['bow_white', 'โบว์ขาวติดผม', 0], ['pbow', 'โบว์ชมพู', 0], ['nbow', 'โบว์กรมท่า', 0], ['lbow', 'โบว์ฟ้า', 20], ['star', 'กิ๊บดาว', 20], ['band', 'ที่คาดผม', 20], ['ear', 'หูแมว', 40]],
    head: [['phones', 'หูฟังครอบหู', 60]], neck: [['bow_navy', 'โบว์ผูกคอกรมท่า', 20], ['bow_pink', 'โบว์ผูกคอชมพู', 20]], face: [['glasses', 'แว่นกรอบดำ', 30]],
    hand: [['boba', 'ชานมไข่มุก', 30], ['bottle', 'ขวดน้ำกระต่าย', 20], ['phone', 'โทรศัพท์', 20], ['bag1', 'กระเป๋าสะพาย', 40], ['bag2', 'กระเป๋าสีดำ', 40]], pet: [['bunny', 'ตุ๊กตากระต่าย', 60], ['cat', 'ตุ๊กตาแมวดำ', 60]]
  },
  m: {
    hair: [['h_a', 'ผมสั้นยุ่ง 1', 0], ['h_b', 'ผมสั้นยุ่ง 2', 0], ['h_c', 'ผมสั้นยุ่ง 3', 0], ['h_d', 'ผมสั้นยุ่ง 4', 0], ['h_e', 'ผมสั้นยุ่ง 5', 20]],
    fc: [['e1', 'ตานิ่ง', 0], ['e2', 'ตาเฉียบ', 0], ['e3', 'ตาง่วง', 0], ['e4', 'ตาหรี่', 0], ['e5', 'ตาโต', 0], ['e6', 'ตาเรียบ', 0], ['e7', 'ตามองเหลือบ', 0], ['e8', 'ตาเศร้า', 0]],
    top: [['t_shirt', 'เสื้อนักเรียน', 0], ['t_tie', 'เสื้อนักเรียนผูกเนคไท', 0], ['t_hoodie', 'ฮู้ดสีดำ', 40], ['t_vest', 'เสื้อกั๊กนักเรียน', 50], ['t_sporty', 'ฮู้ดแจ็กเก็ตสปอร์ต', 60], ['t_jacket', 'แจ็กเก็ตดำ', 60]],
    bottom: [['b_shorts', 'กางเกงขาสั้น', 0], ['b_pants', 'กางเกงขายาว', 0], ['b_sweat', 'กางเกงวอร์มเทา', 20], ['b_plaid', 'กางเกงลายสก็อต', 30]],
    legs: [['l_bare', 'ขาเปล่า', 0], ['l_white', 'ถุงเท้าขาว', 0], ['l_black', 'ถุงเท้าดำ', 0], ['l_stripe', 'ถุงเท้าลายขอบ', 20]],
    shoes: [['s_loafer', 'รองเท้าหนังดำ', 0], ['s_white', 'ผ้าใบขาว', 0], ['s_snk1', 'ผ้าใบดำขาว 1', 30], ['s_snk2', 'ผ้าใบดำขาว 2', 30], ['s_snk3', 'ผ้าใบดำขาว 3', 30], ['s_boot', 'บูตดำ', 30], ['s_boot2', 'บูตหุ้มข้อ', 30]],
    hacc: [], head: [['cap', 'หมวกแก๊ปดำ', 30], ['phones', 'หูฟังครอบหู', 60]], neck: [['neck', 'สร้อยหัวใจ', 40]], face: [['glasses', 'แว่นกรอบดำ', 30], ['mask1', 'หน้ากากอนามัยดำ', 20]],
    hand: [['boba', 'ชานมไข่มุก', 30], ['phone', 'โทรศัพท์', 20], ['bag1', 'กระเป๋าเป้ดำ', 40], ['bag2', 'กระเป๋าเป้ขาว', 40]], pet: [['bear', 'ตุ๊กตาหมีขาว', 60], ['bear2', 'ตุ๊กตาหมีเทา', 60]]
  }
};
const PNG_DEF = { f: { top: 'f.t_blouse', hair: 'f.h_long', fc: 'f.fc1', bottom: 'f.b_navy', legs: 'f.l_white', shoes: 'f.s_mary' }, m: { top: 'm.t_shirt', hair: 'm.h_a', fc: 'm.e1', bottom: 'm.b_shorts', legs: 'm.l_white', shoes: 'm.s_loafer' } };
// ลำดับเลเยอร์จากล่างขึ้นบน (ชื่อไทยใช้ในแผงเลเยอร์)
const AV_LAYERS = [['pet', 'เพื่อนตัวน้อย'], ['hairBack', 'ผมด้านหลัง'], ['legs', 'ขา/ถุงเท้า'], ['shoes', 'รองเท้า'], ['body', 'ลำตัว'], ['bottom', 'กางเกง/กระโปรง'], ['armL', 'แขนซ้าย+มือ'], ['armR', 'แขนขวา+มือ'], ['shirt', 'เสื้อ'], ['outer', 'ตัวนอก'], ['neck', 'ที่คอ'], ['head', 'หัว/ใบหน้า'], ['eyes', 'ดวงตา (ชาย)'], ['hairFront', 'ผมด้านหน้า'], ['hacc', 'ประดับผม'], ['glasses', 'แว่น'], ['hat', 'หมวก'], ['hand', 'ของในมือ']];
const AV_LAYER_ORDER = AV_LAYERS.map(l => l[0]);
const pngG = g => g === 'm' ? 'm' : 'f';
(function () {
  const old = window.avatarSvg;
  // จุดอ้างอิงของแต่ละเพศ (พิกัดเวที = พิกัดตัวอย่างในแผ่นที่ผู้ใช้ทำ)
  const A = {
    f: { W: 243, H: 420, cx: 128, fw: 141, fcy: 130, ey: 152, st: 197, sw: 112, hr: [186, 298], hl: [70, 298], pet: [34, 352, 1.1], dir: 'pf', base: '#fce9de', hbase: 60 },
    m: { W: 310, H: 705, cx: 167, fw: 175, fcy: 205, ey: 245, st: 312, sw: 160, hr: [262, 432], hl: [72, 432], pet: [44, 640, 1.7], dir: 'pm', base: '#fce9de', hbase: 42 }
  };
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const img = (g, id, cx, top, k, flip, extra) => { const d = PNGDIM[g][id]; if (!d) return ''; const w = d[0] * k, h = d[1] * k, x = cx - w / 2; return `<image href="assets/char/${A[g].dir}/${id}.png" x="${x.toFixed(1)}" y="${top.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" ${flip ? `transform="translate(${(2 * cx).toFixed(1)} 0) scale(-1 1)"` : ''} ${extra || ''}/>`; };
  const key = v => String(v || '').replace(/^[fm]\./, '');
  const ok = (g, v) => typeof v === 'string' && v.startsWith(g + '.');

  window.avatarSvg = function (over, o) {
    o = o || {};
    if (!CHAR_ON) { const nm = String(o.nick != null ? o.nick : (typeof store !== 'undefined' ? store.get('nick', '?') : '?')).trim(), ch = [...nm][0] || '?', w = o.w ? ` width="${o.w}"` : ''; return `<svg class="av ph ${o.cls || ''}" viewBox="0 0 100 100"${w} role="img" aria-label="${esc(nm)}" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="#d8cdfa" stroke="#a794ee" stroke-width="3"/><text x="50" y="64" text-align="center" text-anchor="middle" font-size="44" font-weight="700" fill="#5b46b8">${esc(ch)}</text></svg>`; } const c = Object.assign({}, typeof avCfg === 'function' ? avCfg() : AVDEF, over || {});
    if (c.eng === 'svg') return old(over, o);
    const g = pngG(c.g), a = A[g], uid = ++AVC, D = PNG_DEF[g];
    const pick = (slot) => ok(g, c[slot]) ? key(c[slot]) : key(D[slot]);
    const skin = AVSKIN[c.skin] || AVSKIN.b, tone = hex(skin), bt = hex(a.base), tf = tone.map((t, i) => Math.min(1.1, t / bt[i]).toFixed(3));
    const hcol = /^#[0-9a-f]{6}$/i.test(c.hc) && c.hc !== '#1f1b1b' ? hex(c.hc) : null, hf = hcol ? hcol.map(v => Math.min(4, v / a.hbase)) : null;
    const nick = o.nick != null ? String(o.nick) : (typeof store !== 'undefined' ? store.get('nick', 'น้องวิศวะ') : 'น้องวิศวะ');
    const uc = avUniCol(o.uni || (typeof curThemeId === 'function' ? curThemeId() : 'sixent'));
    const only = o.only || '', L = { bg: o.bg !== false && !only, pet: !only || only === 'pet', legs: !only || only === 'legs' || only === 'feet' || only === 'socks', torso: !only || only === 'torso' || only === 'hand', head: !only || only === 'head', fx: !only || only === 'fx' };
    if (only === 'fx' || only === 'bg') { L.torso = L.head = L.legs = L.pet = false; }
    if (only === 'bg') L.bg = true;
    const defs = `<defs><filter id="tn${uid}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${tf[0]} 0 0 0 0 0 ${tf[1]} 0 0 0 0 0 ${tf[2]} 0 0 0 0 0 1 0"/></filter>${hf ? `<filter id="hc${uid}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${(.3 * hf[0]).toFixed(3)} ${(.59 * hf[0]).toFixed(3)} ${(.11 * hf[0]).toFixed(3)} 0 0 ${(.3 * hf[1]).toFixed(3)} ${(.59 * hf[1]).toFixed(3)} ${(.11 * hf[1]).toFixed(3)} 0 0 ${(.3 * hf[2]).toFixed(3)} ${(.59 * hf[2]).toFixed(3)} ${(.11 * hf[2]).toFixed(3)} 0 0 0 0 0 1 0"/></filter>` : ''}</defs>`;
    const T = `filter="url(#tn${uid})"`, H = hf ? `filter="url(#hc${uid})"` : '';
    const sz = Math.min(1.15, Math.max(.85, +c.sz || 1)), bw = Math.min(1.2, Math.max(.85, +c.bw || 1));
    const cx = a.cx, fw = a.fw, k = fw / 141;           // k = สเกลสัมพัทธ์ของตัวละคร (ฐาน = ตัวผู้หญิง)
    const LY = {}, add = (n, s) => { if (s) LY[n] = (LY[n] || '') + s; };   // เลเยอร์ตามชื่อ (ลำดับวาดอยู่ที่ AV_LAYER_ORDER)
    const hide = Array.isArray(c.hide) ? c.hide : [];
    /* สัตว์เลี้ยง */
    const petK = PNGSET[g].pet.some(p => p[0] === key(c.pet)) && ok(g, c.pet);
    if (L.pet) add('pet', petK ? img(g, key(c.pet), a.pet[0], a.pet[1] - (g === 'f' ? 40 : 110), g === 'f' ? .8 : 1.3) : (AVX.pet[c.pet] ? `<g transform="translate(${a.pet[0]} ${a.pet[1]}) scale(${a.pet[2]})">${AVX.pet[c.pet]()}</g>` : ''));
    /* ขา + รองเท้า */
    if (L.legs) {
      const lg = pick('legs'), sh = pick('shoes'), lk = g === 'f' ? .55 : .98, lt = g === 'f' ? 300 : 470, dx = g === 'f' ? 15 : 28, shk = g === 'f' ? .85 : .9, st = g === 'f' ? 374 : 636, sd = g === 'f' ? 16 : 36;
      const lf = lg === 'l_bare' ? T : '';
      add('legs', img(g, lg, cx - dx, lt, lk, false, lf) + img(g, lg, cx + dx, lt, lk, true, lf));
      add('shoes', img(g, sh, cx - sd, st, shk, false) + img(g, sh, cx + sd, st, shk, true));
    }
    /* ตัว: คอ/ไหล่/แขน (วาดเอง/ชิ้นส่วน) */
    const handItem = PNGSET[g].hand.some(p => p[0] === key(c.hand)) && ok(g, c.hand);
    const sk = `fill="${skin}" stroke="${avMix(skin, '#000', .35)}" stroke-width="1.6"`;
    if (L.torso) {
      if (g === 'f') {
        add('body', `<svg x="${cx - 51}" y="186" width="102" height="72" viewBox="0 0 102 72" overflow="hidden"><image href="assets/char/pf/body.png" width="102" height="218" ${T}/></svg>`);
        add('armR', img('f', 'arm', cx + 46, 222, 1.0, false, T)); add('armL', img('f', 'arm', cx - 46, 222, 1.0, true, T));
      } else {
        // ฐานลำตัวชาย: ภาพลำตัวเปลือยพร้อมแขนจากแผ่นของผู้ใช้ (แขนซ้าย/ขวาจึงรวมอยู่ในชั้น body)
        add('body', img('m', 'torso', cx, 282, 1.25, false, T));
        // แขนซ้าย/ขวา = ภาพลำตัวชุดเดียวกันตัดเฉพาะริมซ้าย/ขวา วางเหนือกางเกงเพื่อให้เห็นมือ (ใต้เสื้อ แขนเสื้อจึงคลุมไหล่)
        add('armL', `<clipPath id="mal${uid}"><rect x="${cx - 92}" y="340" width="44" height="200"/></clipPath><g clip-path="url(#mal${uid})">${img('m', 'torso', cx, 282, 1.25, false, T)}</g>` + img('m', 'fist', cx - 75, 452, .85, false, T));
        add('armR', `<clipPath id="mar${uid}"><rect x="${cx + 48}" y="340" width="44" height="200"/></clipPath><g clip-path="url(#mar${uid})">${img('m', 'torso', cx, 282, 1.25, false, T)}</g>` + img('m', 'fist', cx + 75, 452, .85, true, T));
      }
    }
    /* กางเกง/กระโปรง */
    const bt2 = pick('bottom'), bk = g === 'f' ? (/cargo/.test(bt2) ? .9 : 1.05) : (/shorts|plaid/.test(bt2) ? 1.2 : 1.12);
    const btop = g === 'f' ? (/cargo/.test(bt2) ? 250 : 244) : (/shorts|plaid/.test(bt2) ? 458 : 456);
    if ((L.torso || L.legs) && only !== 'socks' && only !== 'feet') add('bottom', img(g, bt2, cx, btop, bk));
    /* เสื้อ */
    if (L.torso) {
      const tp = ok(g, c.top) ? key(c.top) : '', ck = g === 'f' ? .95 : 1.05, ct = g === 'f' ? 197 : 294;
      if (tp && PNGSET[g].top.some(p => p[0] === tp)) add('shirt', img(g, tp, cx, ct, ck));
      else if (/^unig?:/.test(c.top)) { const gold = c.top.startsWith('unig:'), id = c.top.split(':')[1], w = g === 'f' ? 126 : 174, hh = g === 'f' ? 96 : 190; add('shirt', uniShirt(nick, id, { paper: true, gold }).replace('<svg class="shirt"', `<svg x="${cx - w / 2}" y="${g === 'f' ? 190 : 292}" width="${w}" height="${hh}" preserveAspectRatio="none" overflow="visible" class="shirt"`)); }
      else if (c.top && !/^[fm]\./.test(c.top)) add('shirt', `<g transform="translate(${cx - (g === 'f' ? 63 : 87)} ${g === 'f' ? 190 : 292}) scale(${g === 'f' ? 1.05 : 1.45} ${g === 'f' ? .8 : 1.45})">${AVX.top[c.top] ? AVX.top[c.top](c.tc, uid) : avGarment(c.top, c.tc, uid)}</g>`);
      else add('shirt', img(g, g === 'f' ? 't_blouse' : 't_shirt', cx, ct, ck));
      const ou = AVX.outer[c.outer] ? AVX.outer[c.outer]() : avOuter(c.outer); if (ou) add('outer', `<g transform="translate(${cx - a.sw / 2} ${a.st - 4}) scale(${a.sw / 120})">${ou}</g>`);
      const nk = String(c.neck).split(':'); const nkp = PNGSET[g].neck.find(p => p[0] === key(nk[0]));
      if (nkp && ok(g, c.neck)) add('neck', img(g, nkp[0], cx, g === 'f' ? 203 : 300, g === 'f' ? .9 : 1.0));
      else { const nka = AVX.neck[nk[0]] ? AVX.neck[nk[0]](nk[1] ? avUniCol(nk[1]) : uc) : avNeck(nk[0], nk[1] ? avUniCol(nk[1]) : uc, nick); if (nka) add('neck', `<g transform="translate(${cx} ${a.st - 4}) scale(${a.sw / 120}) translate(-100 -96)">${nka}</g>`); }
    }
    /* หัว */
    if (L.head) {
      const fcv = pick('fc'), hr = pick('hair');
      if (g === 'f') add('head', img('f', fcv, cx, 62, 1.35, false, T));
      else { add('head', img('m', 'head', cx, 126, .87, false, T)); add('eyes', img('m', fcv, cx - 41, 232, 1.3, false) + img('m', fcv, cx + 41, 232, 1.3, true)); }
      const HOFF = { h_part: -6, h_pony: -20, h_bun: -20, h_braid: -14, h_short: -4 }, hk = g === 'f' ? 1.38 : 1.37, ht = (g === 'f' ? 28 : 68) + (g === 'f' ? (HOFF[hr] || 0) : 0), hcx = g === 'f' ? cx + 2 : cx;
      if (c.hair !== '-') {
        // ผมแยกหน้า/หลังจริง: ชั้นหลังวาดเต็มใบอยู่ใต้ตัว ชั้นหน้าตัดเฉพาะส่วนหน้าม้า/ผมด้านบนไว้บนใบหน้า
        add('hairBack', img(g, hr, hcx, ht, hk, false, H));
        const cl = g === 'f' ? `<clipPath id="hcl${uid}"><rect x="0" y="0" width="243" height="198"/></clipPath>` : `<clipPath id="hcl${uid}"><rect x="0" y="0" width="310" height="282"/></clipPath>`;
        add('hairFront', cl + `<g clip-path="url(#hcl${uid})">${img(g, hr, hcx, ht, hk, false, H)}</g>`);
      }
      const hp = PNGSET[g].hacc.find(p => p[0] === key(c.hacc)); if (hp && ok(g, c.hacc)) { const hh = hp[0]; add('hacc', hh === 'band' ? img('f', hh, cx + 2, 46, 1.6) : hh === 'ear' ? img('f', 'ear', cx - 46, 40, 1.5) + img('f', 'ear', cx + 50, 40, 1.5, true) : img('f', hh, cx + 68, 92, 1.0)); }
      const gl = PNGSET[g].face.find(p => p[0] === key(c.face)); const lens = ok(g, c.face) && gl;
      if (lens) { const nm = lens[0]; add('glasses', nm === 'glasses' ? img(g, 'glasses', cx, g === 'f' ? 140 : 218, g === 'f' ? 1.35 : 1.5) : img(g, nm, cx, g === 'f' ? 160 : 262, g === 'f' ? 1.3 : 1.5)); }
      else if (c.face && !ok(g, c.face) && c.face) { const ga = AVX.face[c.face] ? AVX.face[c.face]() : avFace(c.face); if (ga) add('glasses', `<g transform="translate(${cx} ${a.ey}) scale(${fw / 84}) translate(-100 -70)">${ga}</g>`); }
      const hd = PNGSET[g].head.find(p => p[0] === key(c.head)); if (hd && ok(g, c.head)) add('hat', hd[0] === 'cap' ? img('m', 'cap', cx, 80, 1.7) : img(g, 'phones', cx, g === 'f' ? 64 : 130, g === 'f' ? 1.65 : 1.5));
      else if (c.head && !/^[fm]\./.test(c.head)) { const ha = AVX.head[c.head] ? AVX.head[c.head](uc) : avHead(c.head, uc); if (ha) add('hat', `<g transform="translate(${cx} ${a.fcy}) scale(${fw / 84}) translate(-100 -66)">${ha}</g>`); }
    }
    /* ของในมือ */
    if (L.torso || only === 'hand') {
      const hp = PNGSET[g].hand.find(p => p[0] === key(c.hand));
      if (hp && ok(g, c.hand)) add('hand', img(g, hp[0], a.hr[0] + (/bag/.test(hp[0]) ? 8 : 6), a.hr[1] - (g === 'f' ? (/bag/.test(hp[0]) ? 50 : 6) : (/bag/.test(hp[0]) ? 100 : 10)), g === 'f' ? (/bag/.test(hp[0]) ? .8 : 1.0) : (/bag/.test(hp[0]) ? 1.2 : 1.3)));
      else if (c.hand && !/^[fm]\./.test(c.hand)) { const hh = AVX.hand[c.hand] ? AVX.hand[c.hand](skin) : avHand(c.hand, skin).replace(/<circle cx="149" cy="163" r="7" fill="[^"]*"\/>$/, ''); add('hand', `<g transform="translate(${a.hr[0] - 149 * (fw / 141)} ${a.hr[1] - 163 * (fw / 141)}) scale(${fw / 141})">${hh}</g>`); }
    }
    const bgSvg = (L.bg && c.bg) ? `<g transform="scale(${a.W / 200} ${a.H / 310})">${AVX.bg[c.bg] ? AVX.bg[c.bg](uid) : avBg(c.bg, uid)}</g>` : '';
    const fxSvg = (L.fx && AVX.fx[c.fx]) ? `<g transform="scale(${a.W / 200} ${a.H / 310})">${AVX.fx[c.fx]()}</g>` : '';
    const VB = { f: { full: '0 0 243 420', half: '0 0 243 345', bust: '14 14 215 225', head: '12 12 219 219', torso: '48 184 150 150', legs: '40 250 170 170', feet: '60 360 130 60', socks: '60 290 130 130', hand: '120 190 123 150', pet: '0 290 90 130' }, m: { full: '0 0 310 705', half: '0 40 310 520', bust: '20 40 270 330', head: '20 40 270 280', torso: '60 270 190 220', legs: '50 450 210 255', feet: '50 620 210 85', socks: '50 460 210 245', hand: '150 300 160 220', pet: '0 540 100 165' } }[g];
    const vb = o.view === 'half' ? VB.half : o.view === 'bust' ? VB.bust : (VB[only] || VB.full);
    const dims = o.w ? ` width="${o.w}"` : '';
    return `<svg class="av png ${o.cls || ''}" viewBox="${vb}"${dims} role="img" aria-label="ตัวละคร ${esc(nick)}" xmlns="http://www.w3.org/2000/svg">${defs}${bgSvg}<g class="avbody"><g transform="translate(${cx} ${a.H}) scale(${bw} ${sz}) translate(${-cx} ${-a.H})">${AV_LAYER_ORDER.filter(n => !hide.includes(n)).map(n => `<g class="ly ly-${n}" data-layer="${n}">${LY[n] || ''}</g>`).join('')}</g></g>${fxSvg}</svg>`;
  };
})();
