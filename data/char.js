// ตัวละครของฉัน — ห้องแต่งตัว เหรียญ และร้านค้า "ของลิมิเต็ด" (ของมหาวิทยาลัย + ของเทศกาลตามฤดู)
// ข้อมูลที่เก็บ: sx_av (ลุคที่ใส่), sx_own (ของที่แลกแล้ว), sx_coins {earned,spent,log}, sx_coinBonus (โบนัสแอดมิน)
// ภาพตัวละครอยู่ที่ data/char_art.js — เสื้อช็อปของแต่ละมหาวิทยาลัยใช้ uniShirt() ตัวเดียวกับหน้าแรก

/* ---------- เทศกาล (ช่วงวันที่ซ้ำทุกปี; ตรุษจีน/ลอยกระทงเป็นช่วงโดยประมาณเพราะวันจริงเปลี่ยนตามปฏิทินจันทรคติ) ---------- */
const SEASONS = [
  { id: 'tcas', n: 'ฤดูสอบ TCAS', ic: '📚', from: [1, 5], to: [3, 31] },
  { id: 'cny', n: 'ตรุษจีน', ic: '🧧', from: [1, 20], to: [2, 28] },
  { id: 'songkran', n: 'สงกรานต์', ic: '💦', from: [4, 1], to: [4, 21] },
  { id: 'halloween', n: 'ฮาโลวีน', ic: '🎃', from: [10, 20], to: [11, 2] },
  { id: 'loy', n: 'ลอยกระทง', ic: '🏮', from: [11, 1], to: [11, 30] },
  { id: 'xmas', n: 'คริสต์มาสและปีใหม่', ic: '🎄', from: [12, 15], to: [1, 7] }
];
const TH_MON = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const avNow = () => { const f = store.get('fakeNow', 0); return f ? new Date(f) : new Date(); };
const thDate = d => d.getDate() + ' ' + TH_MON[d.getMonth()];
function seasonState(s) {
  const d = avNow(), y = d.getFullYear(), wrap = s.to[0] < s.from[0]; let next = null;
  for (const yy of [y - 1, y, y + 1]) {
    const a = new Date(yy, s.from[0] - 1, s.from[1]), b = new Date(wrap ? yy + 1 : yy, s.to[0] - 1, s.to[1], 23, 59, 59);
    if (d >= a && d <= b) return { on: true, left: Math.max(1, Math.ceil((b - d) / 864e5)), end: b, start: a };
    if (a > d && (!next || a < next)) next = a;
  }
  return { on: false, start: next, in: Math.ceil((next - d) / 864e5) };
}
const seasonOf = id => SEASONS.find(s => s.id === id);

/* ---------- แคตตาล็อกของ ---------- */
const AVITEMS = [];
const AVBY = {};
const UNIIDS = ['sixent', 'chula', 'ku', 'psu', 'kku', 'cmu', 'kmutt', 'kmitl', 'kmutnb', 'tu', 'mu'];
const uniShort = id => id === 'sixent' ? 'SIXENT' : ((typeof THEMES !== 'undefined' && THEMES.find(t => t.id === id)) || { s: id }).s;
function addItem(o) { o.id = o.slot + ':' + o.v; o.p = o.p || 0; AVITEMS.push(o); AVBY[o.id] = o; }
const FREE = (slot, v, n, e) => addItem({ slot, v, n, e: e || '', cat: 'basic' });
const SHOPI = (slot, v, n, p, d, extra) => addItem(Object.assign({ slot, v, n, e: '', p, d: d || '', cat: 'shop' }, extra || {}));
// ---- ของฟรี: ทุกคนมี ----
AVHAIRS.forEach(([v, n, p]) => p ? SHOPI('hair', v, n, p, 'ทรงผมน่ารักสำหรับเปลี่ยนลุค') : FREE('hair', v, n));
AV_EYES.forEach(([v, n]) => FREE('eye', v, n));
AV_MOUTHS.forEach(([v, n]) => FREE('mouth', v, n));
UNIIDS.forEach(id => addItem({ slot: 'top', v: 'uni:' + id, n: 'เสื้อช็อป ' + uniShort(id), e: '👕', cat: 'basic' }));
[['top', 'tee', 'เสื้อยืด'], ['top', 'hoodie', 'ฮู้ด'], ['top', 'polo', 'เสื้อโปโล'], ['top', 'stripe', 'เสื้อลายขวาง'],
  ['outer', '', 'ไม่ใส่', '🚫'], ['head', '', 'ไม่ใส่', '🚫'], ['head', 'cap', 'หมวกแก๊ปสีธีม'], ['hacc', '', 'ไม่ใส่', '🚫'], ['hacc', 'ribbon', 'โบว์น้อย'], ['hacc', 'clip', 'กิ๊บติดผม'], ['hacc', 'band', 'ที่คาดผม'],
  ['face', '', 'ไม่ใส่', '🚫'], ['face', 'round', 'แว่นกลม'], ['neck', '', 'ไม่ใส่', '🚫'], ['neck', 'lanyard', 'สายคล้องบัตร'], ['hand', '', 'มือเปล่า', '✋'], ['hand', 'roll', 'ม้วนแบบแปลน'], ['hand', 'calc', 'เครื่องคิดเลข'],
  ['bottom', 'trouser', 'กางเกงขายาว'], ['bottom', 'jeans', 'กางเกงยีนส์'], ['bottom', 'skirt', 'กระโปรง'], ['bottom', 'pleated', 'กระโปรงจีบ'], ['bottom', 'shorts', 'กางเกงขาสั้น'],
  ['shoes', 'sneaker', 'รองเท้าผ้าใบ'], ['shoes', 'mary', 'รองเท้ามารีเจน+ถุงเท้า'], ['shoes', 'loafer', 'รองเท้าหนัง'], ['pet', '', 'ไม่มี', '🚫'], ['fx', '', 'ไม่มี', '🚫'],
  ['bg', '', 'ไม่มีฉาก', '🚫'], ['bg', 'room', 'ห้องติว'], ['bg', 'sky', 'ท้องฟ้าใส'], ['bg', 'candy', 'ลูกกวาดพาสเทล'], ['bg', 'blueprint', 'แบบแปลนวิศวะ']].forEach(([slot, v, n, e]) => FREE(slot, v, n, e));
// ---- ของแลกด้วยเหรียญ ----
[['top', 'sweater', 'สเวตเตอร์ถัก', 40, 'ไหมพรมนุ่ม ๆ เปลี่ยนสีได้'], ['top', 'sailor', 'ชุดกะลาสี', 70, 'ปกกะลาสีผูกโบว์แดง'],
  ['outer', 'cardigan', 'คาร์ดิแกนสีพีช', 50, 'อบอุ่นน่ารัก'], ['outer', 'blazer', 'เสื้อสูทนักเรียน', 70, 'เรียบหรูดูดี'], ['outer', 'varsity', 'แจ็กเก็ตวาร์ซิตี้', 90, 'ทีมเดียวกันทั้งมหาลัย'],
  ['outer', 'lab', 'เสื้อกราวน์แล็บ', 80, 'เสื้อกราวน์ขาวของคนสายวิทย์'], ['outer', 'vest', 'เสื้อกั๊กเซฟตี้', 60, 'ลงสนามก่อสร้างต้องใส่'],
  ['head', 'beanie', 'หมวกไหมพรมปอมปอม', 30, 'หมวกนุ่มมีปอมปอม'], ['head', 'beret', 'หมวกเบเร่ต์', 40, 'สไตล์ศิลปินฝรั่งเศส'], ['head', 'bucket', 'หมวกบักเก็ต', 40, 'ใส่สบายสายชิล'], ['head', 'bearhood', 'ฮู้ดหูหมี', 60, 'หูหมีกลม ๆ น่ากอด'],
  ['head', 'hardhat', 'หมวกเซฟตี้วิศวกร', 40, 'หมวกนิรภัยสีเหลือง'], ['head', 'phones', 'หูฟังครอบหู', 60, 'ฟังเพลงตอนติว'],
  ['hacc', 'catears', 'ที่คาดผมหูแมว', 50, 'เหมียว~'], ['hacc', 'bunny', 'ที่คาดผมหูกระต่าย', 60, 'หูยาวฟูฟ่อง'], ['hacc', 'flower', 'ดอกไม้ติดผม', 30, 'ช่อดอกไม้สีหวาน'], ['hacc', 'stars', 'กิ๊บดาว', 30, 'ดาวเล็กระยิบระยับ'], ['hacc', 'halo', 'วงแหวนนางฟ้า', 80, 'ลอยเหนือหัว'], ['hacc', 'horns', 'เขาน้อยจอมซน', 60, 'ซนนิด ๆ'],
  ['face', 'square', 'แว่นเหลี่ยม', 40, 'ดูเป็นนักคำนวณ'], ['face', 'shades', 'แว่นกันแดด', 70, 'เท่เกินห้องเรียน'], ['face', 'cateye', 'แว่นแคทอาย', 40, 'กรอบเฉียงสีชมพู'], ['face', 'heart', 'แว่นหัวใจ', 50, 'ส่งยิ้มหวาน'], ['face', 'mask', 'หน้ากากอนามัย', 20, 'ปลอดภัยไว้ก่อน'], ['face', 'goggles', 'แว่นเซฟตี้', 60, 'สายแล็บตัวจริง'],
  ['neck', 'bow', 'โบว์ผูกคอ', 20, 'โบว์แดงเรียบร้อย'], ['neck', 'tie', 'เนคไทสีธีม', 20, 'ผูกให้เนี้ยบ'], ['neck', 'pearl', 'สร้อยไข่มุก', 40, 'เรียบหรู'], ['neck', 'bell', 'ปลอกคอกระดิ่ง', 30, 'กรุ๋งกริ๋ง'], ['neck', 'hphone', 'หูฟังคล้องคอ', 50, 'พร้อมฟังเพลงทุกเมื่อ'],
  ['hand', 'coffee', 'กาแฟร้อน', 20, 'ตื่นตัวก่อนติว'], ['hand', 'boba', 'ชานมไข่มุก', 30, 'หวานน้อยไข่มุกเยอะ'], ['hand', 'book', 'หนังสือเรียน', 20, 'เล่มโปรดของเรา'], ['hand', 'balloon', 'ลูกโป่ง', 40, 'ลอยตามมาเลย'], ['hand', 'bouquet', 'ช่อดอกไม้', 50, 'ฉลองความสำเร็จ'], ['hand', 'bulb', 'หลอดไฟไอเดีย', 40, 'ปิ๊งไอเดียแล้ว!'],
  ['bottom', 'cargo', 'กางเกงคาร์โก้ขาสั้น', 30, 'กระเป๋าเยอะ'], ['bottom', 'leggings', 'เลกกิ้ง', 30, 'คล่องตัว'],
  ['shoes', 'slipper', 'รองเท้าแตะนุ่มนิ่ม', 20, 'ใส่สบายที่สุด'], ['shoes', 'boots', 'รองเท้าบูต', 40, 'ลุยได้ทุกที่'], ['shoes', 'highcut', 'ผ้าใบหุ้มข้อ', 50, 'สีตามธีม'],
  ['pet', 'chick', 'ลูกเจี๊ยบ', 30, 'ติ๊ด ๆ'], ['pet', 'duck', 'เป็ดเหลือง', 40, 'ก๊าบ ๆ'], ['pet', 'cat', 'แมวส้ม', 60, 'เพื่อนซี้ขี้อ้อน'], ['pet', 'dog', 'ชิบะอินุ', 60, 'ซื่อสัตย์ที่สุด'], ['pet', 'bunny', 'กระต่ายขาว', 70, 'ฟูนุ่ม'], ['pet', 'penguin', 'เพนกวิน', 80, 'เดินเตาะแตะ'], ['pet', 'capy', 'คาปิบาร่า', 100, 'ใจเย็นที่สุดในโลก'], ['pet', 'robot', 'หุ่นยนต์ตัวจิ๋ว', 120, 'ของคนสายวิศวะ'],
  ['fx', 'sparkle', 'ประกายดาว', 60, 'ระยิบระยับรอบตัว'], ['fx', 'heart', 'หัวใจลอย', 60, 'หวาน ๆ'], ['fx', 'bubble', 'ฟองสบู่', 50, 'ลอยล่องเบา ๆ'], ['fx', 'petal', 'กลีบซากุระ', 60, 'ร่วงพรู'],
  ['bg', 'sunset', 'ฉากพระอาทิตย์ตก', 30, 'ท้องฟ้าสีส้มม่วง'], ['bg', 'night', 'ฉากคืนดาวระยิบ', 40, 'ดาวและพระจันทร์'], ['bg', 'sakura', 'ฉากซากุระ', 50, 'กลีบดอกไม้ปลิว'], ['bg', 'cafe', 'ฉากคาเฟ่อบอุ่น', 60, 'โคมไฟและหน้าต่าง']
].forEach(([slot, v, n, p, d]) => SHOPI(slot, v, n, p, d));
// ---- ชิ้นส่วนภาพวาด (PNG) ของตัวละครแบบใหม่: แทนที่ผม/ใบหน้า/ท่อนล่าง/รองเท้าแบบเวกเตอร์เดิม ----
for (let i = AVITEMS.length - 1; i >= 0; i--) if (['hair', 'eye', 'mouth', 'hacc', 'bottom', 'shoes'].includes(AVITEMS[i].slot)) { delete AVBY[AVITEMS[i].id]; AVITEMS.splice(i, 1); }
FREE('hacc', '', 'ไม่ใส่', '🚫');
['f', 'm'].forEach(g => Object.entries(PNGSET[g]).forEach(([slot, list]) => list.forEach(([id, n, p]) => addItem({ slot, v: g + '.' + id, n, e: '', p, d: 'ชิ้นส่วนวาดมือสไตล์อนิเมะ', cat: p ? 'shop' : 'basic', g }))));
// ใช้เฉพาะชิ้นส่วนภาพวาดของผู้ใช้: ตัดของเวกเตอร์เดิมทั้งหมด (เสื้อช็อป/ชุดเทศกาล/ฉาก/เอฟเฟกต์ ฯลฯ) ออกจากแคตตาล็อก
const AV_ONLY_PNG = true;
for (let i = AVITEMS.length - 1; i >= 0; i--) { const it = AVITEMS[i]; if (!it.g && !(it.v === '' && ['face', 'neck', 'head', 'hacc', 'hand', 'pet'].includes(it.slot))) { delete AVBY[it.id]; AVITEMS.splice(i, 1); } }

/* ---------- สถานะ: ของที่มี / ลุคที่ใส่ ---------- */
const avOwn = () => store.get('own', {});
const avHas = id => { const it = AVBY[id]; return !!it && (it.p === 0 || !!avOwn()[id]); };
const AV_SLOTS = ['hair', 'fc', 'top', 'head', 'hacc', 'face', 'neck', 'hand', 'bottom', 'legs', 'shoes', 'pet'];
// ค่าของแต่ละเพศ: ผม/หน้า/กางเกง/ถุงเท้า/รองเท้าเป็นชุดภาพของเพศนั้น ถ้าไม่ตรงเพศให้ใช้ค่าเริ่มต้น
function avFixG(c) {
  const g = c.g === 'm' ? 'm' : 'f';
  Object.keys(PNG_DEF[g]).forEach(s => { const v = c[s]; if (typeof v !== 'string' || !v.startsWith(g + '.') || !AVBY[s + ':' + v] || !avHas(s + ':' + v)) c[s] = PNG_DEF[g][s]; });
  ['top', 'outer', 'head', 'hacc', 'face', 'neck', 'hand', 'pet'].forEach(s => { const v = c[s]; if (typeof v === 'string' && /^[fm]./.test(v) && !v.startsWith(g + '.')) c[s] = ''; });
  return c;
}
function avCfg() {
  const c = Object.assign({}, AVDEF, store.get('av', {}));
  AV_SLOTS.forEach(s => { if (c[s] && !avHas(s + ':' + c[s])) c[s] = AVDEF[s]; });
  if (!AVSKIN[c.skin]) c.skin = 'a';
  return avFixG(c);
}
const avSave = c => store.set('av', c);
const GD = { m: { hair: 'short', bottom: 'trouser' }, f: { hair: 'long', bottom: 'skirt' }, n: { hair: 'side', bottom: 'trouser' } };

/* ---------- เหรียญ ---------- */
function coinData() {
  let c = store.get('coins', null);
  if (!c) { const start = Math.min(300, attempts.length); c = { earned: start, spent: 0, log: start ? [{ ts: Date.now(), t: 'โบนัสต้อนรับจากโจทย์ที่เคยทำ', n: start }] : [] }; store.set('coins', c); }
  return c;
}
const coinBal = () => { const c = coinData(); return Math.max(0, c.earned - c.spent + store.get('coinBonus', 0)); };
function coinLog(n, t) { const c = coinData(); if (n > 0) c.earned += n; else c.spent -= n; c.log = [{ ts: Date.now(), t, n }].concat(c.log || []).slice(0, 40); store.set('coins', c); }
// ให้เหรียญเมื่อทำโจทย์จบหนึ่งชุด (เรียกจาก submitExam) — คืนรายละเอียดเพื่อแสดงในหน้าผลสอบ
function coinAward(E) {
  const n = E.list.length, answered = Object.keys(E.ans).length; if (answered < 3) return null;
  const correct = E.score, p = n ? Math.round(correct / n * 100) : 0, parts = [];
  parts.push([`ทำโจทย์ ${answered} ข้อ`, answered]); parts.push([`ตอบถูก ${correct} ข้อ`, correct]);
  if (p === 100 && n >= 10) parts.push(['เต็มทุกข้อ!', 20]); else if (p >= 80) parts.push(['แม่นยำ ≥ 80%', 10]); else if (p >= 60) parts.push(['แม่นยำ ≥ 60%', 5]);
  if (E.mode === 'mock') { const sub = parts.reduce((a, x) => a + x[1], 0); parts.push(['สอบจำลองจับเวลา ×1.5', Math.floor(sub * .5)]); }
  if (E.daily) { const d = getDaily(); if (Object.keys(d.results).length >= d.ids.length && store.get('coinDaily', '') !== todayKey()) { store.set('coinDaily', todayKey()); parts.push(['ทำภารกิจวันนี้ครบ 🎯', 20]); } }
  const total = parts.reduce((a, x) => a + x[1], 0); coinLog(total, 'ทำชุดโจทย์ ' + (E.label || '') + ' (' + correct + '/' + n + ')');
  if (CHAR_ON && typeof toast === 'function') toast('🪙 ได้รับ ' + total + ' เหรียญจากชุดโจทย์นี้');
  return CHAR_ON ? { total, parts, bal: coinBal() } : null;   // ปิดฟีเจอร์ตัวละคร: ยังสะสมเหรียญไว้เงียบ ๆ แต่ไม่แสดง
}
function coinCard(c) {
  return `<div class="card coinres"><div class="coinbig"><span class="coinic">🪙</span><div><b>+${c.total} เหรียญ</b><small>ยอดคงเหลือ ${coinBal()} เหรียญ</small></div></div>
    <ul class="coinparts">${c.parts.map(p => `<li><span>${esc(p[0])}</span><b>+${p[1]}</b></li>`).join('')}</ul>
    <div class="row" style="gap:8px;margin-top:6px"><a class="btn pri" href="#/me" data-a="avOpen" data-v="shop">🛍 ไปแลกของ</a><a class="btn" href="#/me" data-a="avOpen" data-v="dress">👕 แต่งตัวละคร</a></div></div>`;
}
const coinChip = () => `<span class="coinchip" title="เหรียญของฉัน">🪙 ${coinBal().toLocaleString('th-TH')}</span>`;

/* ---------- เงื่อนไขการซื้อ ---------- */
function itemLock(it) {
  if (it.season) { const st = seasonState(seasonOf(it.season)); if (!st.on) return `เปิดอีกครั้งใน ${st.in} วัน (${thDate(st.start)})`; }
  if (it.uni && curThemeId() !== it.uni) return 'เลือกธีม ' + uniShort(it.uni) + ' เพื่อปลดล็อก';
  if (it.req && it.req.k === 'xp' && xpNow() < it.req.n) return it.req.t;
  return '';
}

/* ---------- ห้องแต่งตัว + ร้านค้า (รวมเป็นหน้าเดียวที่ #/me) ----------
   ตัวละครอยู่ติดบนจอเสมอ → เลือกหมวดด้านล่าง → แตะของที่มีแล้วเพื่อใส่ทันที / แตะของที่ยังไม่มีเพื่อ "ลองใส่" แล้วกดซื้อที่แถบด้านล่างครั้งเดียว */
const ME = { tab: CHAR_ON ? 'dress' : 'friends', cat: 'hair', f: 'all', try: {} };
const meCfg = () => Object.assign({}, avCfg(), ME.try);
const AV_CATS = [
  ['hair', 'ทรงผม', '💇', ['hair']], ['face', 'ใบหน้า', '😊', ['fc']], ['top', 'เสื้อ', '👕', ['top']], 
  ['bottom', 'กระโปรง/กางเกง', '👖', ['bottom']], ['legs', 'ถุงเท้า/ขา', '🧦', ['legs']], ['shoes', 'รองเท้า', '👟', ['shoes']], ['head', 'หมวก', '🧢', ['head']], ['hacc', 'ประดับผม', '🎀', ['hacc']],
  ['glass', 'แว่น', '👓', ['face']], ['neck', 'ที่คอ', '🧣', ['neck']], ['hand', 'ของถือ', '🧋', ['hand']], ['pet', 'เพื่อนตัวน้อย', '🐣', ['pet']],
  
];
const AV_SLOT_NAME = { hair: 'ทรงผม', eye: 'ตา', mouth: 'ปาก', top: 'เสื้อ', outer: 'ตัวนอก', bottom: 'ท่อนล่าง', shoes: 'รองเท้า', head: 'หมวก', hacc: 'ประดับผม', face: 'แว่น', neck: 'ที่คอ', hand: 'ของถือ', pet: 'เพื่อน', fx: 'เอฟเฟกต์', bg: 'ฉาก' };
const AV_CROP = { hair: 'head', fc: 'head', legs: 'socks', head: 'head', hacc: 'head', face: 'head', top: 'torso', outer: 'torso', neck: 'torso', bottom: 'legs', shoes: 'feet', hand: 'hand', pet: 'pet' };
const AV_TINT_TOPS = ['tee', 'hoodie', 'polo', 'stripe', 'sweater', 'sailor'];
const itemLimited = i => !!(i.season || i.uni || i.req);
const tileRank = i => (avHas(i.id) ? 0 : itemLock(i) ? 3 : 1) + (i.season && seasonState(seasonOf(i.season)).on ? -0.5 : 0);

function sw(arr, cur, key, none) {
  return `<div class="avsw">${none ? `<button class="sw none ${!cur ? 'on' : ''}" data-a="avCol" data-v="${key}|" aria-label="ไม่ใช้" title="ไม่ใช้">∅</button>` : ''}${arr.map(c => `<button class="sw ${cur === c ? 'on' : ''}" style="--c:${c}" data-a="avCol" data-v="${key}|${c}" aria-label="สี ${c}"></button>`).join('')}</div>`;
}
function itemTile(it) {
  const own = avHas(it.id), cfg = avCfg(), worn = cfg[it.slot] === it.v, tried = ME.try[it.slot] === it.v, lock = own ? '' : itemLock(it);
  const hot = it.season && seasonState(seasonOf(it.season)).on;
  const prev = it.v === '' ? `<span class="wtnone">${it.e || '🚫'}</span>` : avatarSvg(it.slot === 'fc' ? { fc: it.v, hair: '-' } : { [it.slot]: it.v }, AV_CROP[it.slot] ? { only: AV_CROP[it.slot], w: 76, bg: false } : { view: 'half', w: 76, bg: true });
  const badge = worn ? '<i class="wtb ok">✓ ใส่อยู่</i>' : own ? '' : lock ? '<i class="wtb lk">🔒</i>' : `<i class="wtb pr">🪙 ${it.p}</i>`;
  return `<button class="wt ${worn ? 'on' : ''} ${tried ? 'try' : ''} ${own ? 'own' : ''} ${lock ? 'lock' : ''}" data-a="avPick" data-v="${esc(it.id)}" aria-pressed="${worn}" aria-label="${esc(it.n)}">${hot ? '<em class="wthot">🎉</em>' : ''}<span class="wtp">${prev}</span><span class="wtn">${esc(it.n)}</span>${badge}</button>`;
}
function itemsFor(slots, onlyLimited) {
  const f = ME.f;
  return AVITEMS.filter(i => slots.includes(i.slot) && (onlyLimited ? itemLimited(i) : !itemLimited(i) || avHas(i.id)))
    .filter(i => (!i.g || i.g === (avCfg().g === 'm' ? 'm' : 'f'))).filter(i => f === 'all' || (f === 'mine' && avHas(i.id)) || (f === 'new' && !avHas(i.id)))
    .map((i, k) => [i, k]).sort((a, b) => tileRank(a[0]) - tileRank(b[0]) || a[0].p - b[0].p || a[1] - b[1]).map(x => x[0]);
}
function avStage() {
  const nick = store.get('nick', 'น้องวิศวะ'), si = typeof shirtInfo === 'function' ? shirtInfo() : { title: '' }, cfg = meCfg(), lock = Object.keys(ME.try).length;
  return `<div class="card avstage wr-stage ${cfg.bg ? 'hasbg' : ''}"><div class="avbig auto">${avatarSvg(ME.try, { w: 190 })}</div>
    <div class="avmeta"><div class="mute">${esc(si.title || '')}</div><div class="row" style="gap:6px;flex-wrap:nowrap"><b class="avname">${esc(nick)}</b><button class="chip" data-a="nickEdit" aria-label="แก้ชื่อ">✎</button></div>
      <div class="row" style="gap:6px;flex-wrap:nowrap">${coinChip()}<button class="chip" data-a="avHow" aria-label="ได้เหรียญยังไง" title="ได้เหรียญยังไง?">?</button></div>
      <div class="avbtns"><button data-a="avRandom">🎲 สุ่ม</button><button data-a="avReset">↺ รีเซ็ต</button><button data-a="avLayers">🧩 เลเยอร์</button></div>
      ${lock ? `<div class="avtry"><b>กำลังลองใส่</b></div>` : ''}</div></div>`;
}
function catBody(cat) {
  const c = avCfg(), def = AV_CATS.find(x => x[0] === cat) || AV_CATS[0], f = ME.f;
  const filt = `<div class="wfil">${[['all', 'ทั้งหมด'], ['mine', 'ของฉัน'], ['new', 'ยังไม่มี']].map(([k, t]) => `<button class="${f === k ? 'on' : ''}" data-a="avFilter" data-v="${k}">${t}</button>`).join('')}</div>`;
  const grid = (slots, lim) => { const l = itemsFor(slots, lim); return l.length ? `<div class="wgrid">${l.map(itemTile).join('')}</div>` : `<div class="wempty mute">ไม่มีของในตัวกรองนี้</div>`; };
  const sub = t => `<h4 class="wsub">${t}</h4>`;
  if (cat === 'hair') return `${sub('สีผม (แตะสีแรกเพื่อกลับเป็นสีเดิมของภาพ)')}${sw(AVHAIR, c.hc, 'hc')}${sub('ทรงผม')}${filt}${grid(['hair'])}`;
  if (cat === 'face') return `${sub('เพศของตัวละคร (เปลี่ยนทรงผม/ท่อนล่างเริ่มต้น)')}<div class="seg">${[['m', '👦 ชาย'], ['f', '👧 หญิง'], ['n', '🧑 ไม่ระบุ']].map(([k, t]) => `<button class="${c.g === k ? 'on' : ''}" data-a="avGender" data-v="${k}">${t}</button>`).join('')}</div>${sub('ขนาดตัว')}<div class="wsize"><label>ความสูง <input type="range" min="85" max="115" value="${Math.round((+c.sz || 1) * 100)}" data-r="sz"></label><label>ความอวบ <input type="range" min="85" max="120" value="${Math.round((+c.bw || 1) * 100)}" data-r="bw"></label></div>${sub('สีผิว')}${sw(Object.values(AVSKIN), AVSKIN[c.skin], 'skin')}${sub('ใบหน้า / ดวงตา')}${grid(['fc'])}`;
  if (cat === 'top') return `${AV_TINT_TOPS.includes(c.top) ? `${sub('สีเสื้อ')}${sw(AVTEE, c.tc, 'tc')}` : ''}${filt}${grid(['top'])}`;
  if (cat === 'bottom') return `${filt}${grid(['bottom'])}`;
  if (cat === 'ltd') {
    const live = SEASONS.filter(s => seasonState(s).on), soon = SEASONS.map(s => [s, seasonState(s)]).filter(x => !x[1].on).sort((a, b) => a[1].in - b[1].in)[0], cur = curThemeId();
    return `<div class="seasons">${live.length ? live.map(s => { const st = seasonState(s); return `<span class="sbadge on">${s.ic} ${s.n} <small>เหลือ ${st.left} วัน</small></span>`; }).join('') : '<span class="mute">ตอนนี้ไม่มีเทศกาลพิเศษ</span>'}${soon ? `<span class="sbadge">${soon[0].ic} ${soon[0].n} <small>อีก ${soon[1].in} วัน (${thDate(soon[1].start)})</small></span>` : ''}</div>
      <div class="mute" style="font-size:13px;margin:6px 0">${cur !== 'sixent' ? `ธีมตอนนี้คือ ${esc(uniShort(cur))} — ปลดล็อกของมหาวิทยาลัยนี้ได้เลย` : 'เลือกธีมมหาวิทยาลัยที่แท็บ 🎨 ธีม เพื่อปลดล็อกของลิมิเต็ดเฉพาะที่นั่น'}</div>${filt}${grid(AV_SLOTS, true)}`;
  }
  return `${filt}${grid(def[3])}`;
}
function layerPanel() {
  const hide = avCfg().hide || [];
  return `<div class="wlay"><h4 class="wsub">เลเยอร์ของตัวละคร (บน→ล่าง) แตะเพื่อซ่อน/แสดง</h4><div class="wlayg">${AV_LAYERS.slice().reverse().map(([k, n]) => `<button class="${hide.includes(k) ? '' : 'on'}" data-a="avLayer" data-v="${k}">${hide.includes(k) ? '🙈' : '👁'} ${n}</button>`).join('')}</div></div>`;
}
function dressTab() {
  const cat = ME.cat, coins = coinBal();
  return `<div class="wr">${avStage()}<div class="wr-panel card">
    <div class="wcats" role="tablist">${AV_CATS.map(([k, t, e]) => `<button class="wcat ${cat === k ? 'on' : ''}" role="tab" aria-selected="${cat === k}" data-a="avCat" data-v="${k}"><span>${e}</span><small>${t}</small></button>`).join('')}</div>
    <div class="wr-body">${ME.layers ? layerPanel() : ''}${catBody(cat)}</div></div></div>`;
}
function buyBar(bal) {
  const slot = Object.keys(ME.try)[0]; if (!slot) return '';
  const it = AVBY[slot + ':' + ME.try[slot]]; if (!it || avHas(it.id)) return '';
  const lock = itemLock(it);
  const act = lock ? `<button disabled>🔒 ยังซื้อไม่ได้</button>` : bal >= it.p ? `<button class="pri" data-a="avBuy" data-v="${esc(it.id)}">🪙 ${it.p} · ซื้อและใส่เลย</button>` : `<button disabled>ขาดอีก ${it.p - bal} 🪙</button>`;
  return `<div class="wbuy" role="region" aria-label="ลองใส่ของ"><div class="wbi"><b>${esc(it.n)}</b><small>${esc(lock || it.d || '')}${!lock && bal < it.p ? ' · ทำโจทย์ให้จบอีกชุดเพื่อสะสมเหรียญ' : ''}</small></div><div class="wbb"><button data-a="avUntry">ไม่เอา</button>${act}</div></div>`;
}
/* แถบซื้อของลอยล่างจอ: ต้องอยู่นอก .view (ที่มี transform ทำให้ position:fixed เพี้ยน) จึงสร้างเป็นองค์ประกอบของ body */
function avSyncBar() {
  let el = document.getElementById('avbar');
  const on = location.hash === '#/me' && ME.tab === 'dress' && Object.keys(ME.try).length, html = on ? buyBar(coinBal()) : '';
  if (!html) { if (el) el.remove(); return; }
  if (!el) { el = document.createElement('div'); el.id = 'avbar'; document.body.appendChild(el); }
  if (el.dataset.k !== html) { el.dataset.k = html; el.innerHTML = html; }
}
window.addEventListener('hashchange', avSyncBar);
function viewMe() {
  if (ME.tab === 'shop') ME.tab = 'dress';
  if (!CHAR_ON && ME.tab === 'dress') ME.tab = 'friends';
  const tabs = [...(CHAR_ON ? [['dress', '👕 ตัวละคร']] : []), ['friends', '👥 เพื่อน'], ['theme', '🎨 ธีม'], ['ach', '🏆 ผลงาน']];
  const body = ({ dress: dressTab, friends: friendsTab, theme: meThemeTab, ach: meAchTab }[ME.tab] || dressTab)();
  setTimeout(avSyncBar, 0);
  return `<h1>ฉัน</h1><div class="seg tabs2 ${CHAR_ON ? 'tabs4' : ''}">${tabs.map(([k, t]) => `<button class="${ME.tab === k ? 'on' : ''}" data-a="avTab" data-v="${k}">${t}</button>`).join('')}</div>${body}`;
}
/* ภาพตัวละครขยับตามนิ้ว/เมาส์ (ความลึกแบบกึ่ง 3 มิติ) + โยกเบา ๆ เมื่อไม่มีใครแตะ */
(function () {
  if (window.__avTilt) return; window.__avTilt = 1; let last = 0;
  const set = (el, x, y) => { el.style.setProperty('--px', x.toFixed(2)); el.style.setProperty('--py', y.toFixed(2)); };
  document.addEventListener('pointermove', e => { const el = e.target.closest && e.target.closest('.avbig'); if (!el) return; const r = el.getBoundingClientRect(); last = Date.now(); set(el, Math.max(-1, Math.min(1, (e.clientX - r.left) / r.width * 2 - 1)), Math.max(-1, Math.min(1, (e.clientY - r.top) / r.height * 2 - 1))); }, { passive: true });
  document.addEventListener('pointerout', e => { const el = e.target.closest && e.target.closest('.avbig'); if (el && !el.contains(e.relatedTarget)) { last = Date.now() - 1500; } }, { passive: true });
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  (function loop(t) { if (Date.now() - last > 2200) document.querySelectorAll('.avbig.auto').forEach(el => set(el, Math.sin(t / 1700) * .55, Math.cos(t / 2300) * .2)); requestAnimationFrame(loop); })(0);
})();

/* ---------- การกระทำ ---------- */
function avUpdateHero(id) { const h = document.querySelector('.uh-meav'); if (h) h.innerHTML = avatarSvg({ top: 'uni:' + id }, { w: 92 }); }
const CHAR_ACT = {
  avOpen(v) { ME.tab = ['friends', 'theme', 'ach'].includes(v) ? v : (CHAR_ON ? 'dress' : 'friends'); if (v === 'shop') ME.cat = 'hair'; ME.try = {}; uniPage(null); if (location.hash !== '#/me') location.hash = '#/me'; else render(true); },
  avTab(v) { ME.tab = (v === 'shop' || v === 'dress') ? (CHAR_ON ? 'dress' : 'friends') : v; if (v === 'shop') ME.cat = 'hair'; ME.try = {}; render(true); if (v === 'friends' && typeof socLoadFriends === 'function') socLoadFriends(); },
  avFilter(v) { ME.f = v; render(true); },
  avLayers() { ME.layers = !ME.layers; render(true); },
  avLayer(v) { const c = avCfg(), h = (c.hide || []).slice(), i = h.indexOf(v); if (i >= 0) h.splice(i, 1); else h.push(v); c.hide = h; avSave(c); render(true); },
  avCat(v) { ME.cat = v; ME.try = {}; render(true); const b = document.querySelector('.wcat.on'); if (b && b.scrollIntoView) b.scrollIntoView({ block: 'nearest', inline: 'center' }); },
  avPick(v) { const it = AVBY[v]; if (!it) return; if (avHas(v)) { const c = avCfg(); c[it.slot] = it.v; avSave(c); ME.try = {}; } else ME.try = { [it.slot]: it.v }; render(true); },
  avSize(k, v) { const c = avCfg(); c[k] = Math.min(k === 'bw' ? 1.2 : 1.15, Math.max(.85, v / 100)); avSave(c); ME.try = {}; render(true); },
  avCol(v) { const i = v.indexOf('|'), k = v.slice(0, i), val = v.slice(i + 1), c = avCfg(); if (k === 'skin') { if (!AVSKIN[val]) { const kk = Object.keys(AVSKIN).find(x => AVSKIN[x] === val); if (!kk) return; c.skin = kk; } else c.skin = val; } else if (['hc', 'hc2', 'ec', 'tc', 'bc'].includes(k) && (val === '' || /^#[0-9a-f]{6}$/i.test(val))) c[k] = val; else return; avSave(c); ME.try = {}; render(true); },
  avSet(v) { const [slot, val] = v.split('|'), c = avCfg(); if (slot === 'top' && val !== c.top) { /* เปลี่ยนเสื้อ */ } c[slot] = val; avSave(c); ME.try = {}; render(true); },
  avGender(v) { const c = avCfg(); c.g = v; Object.assign(c, PNG_DEF[v === 'm' ? 'm' : 'f']); avSave(c); ME.try = {}; render(true); },
  avSkin(v) { const c = avCfg(), k = Object.keys(AVSKIN).find(k => AVSKIN[k] === v); if (k) { c.skin = k; avSave(c); render(true); } },
  avHair(v) { const c = avCfg(); c.hair = v; avSave(c); render(true); },
  avHairC(v) { const c = avCfg(); c.hc = v; avSave(c); render(true); },
  avTee(v) { const c = avCfg(); c.tc = v; avSave(c); render(true); },
  avBot(v) { const c = avCfg(); c.bc = v; avSave(c); render(true); },
  avWearUni(v) { const c = avCfg(); c.top = 'uni:' + v; avSave(c); avUpdateHero(v); toast('👕 ตัวละครสวมเสื้อช็อป ' + uniShort(v) + ' แล้ว'); },
  avTry(v) { ACT.avPick(v); },
  avUntry() { ME.try = {}; render(true); },
  avBuy(v) {
    const it = AVBY[v]; if (!it || avHas(v)) return; const lock = itemLock(it); if (lock) { toast('🔒 ' + lock); return; }
    if (coinBal() < it.p) { toast('เหรียญไม่พอ — ทำโจทย์ให้จบอีกชุดเพื่อสะสมเหรียญ'); return; }
    const own = avOwn(); own[v] = Date.now(); store.set('own', own); coinLog(-it.p, 'แลก ' + it.n);
    const c = avCfg(); c[it.slot] = it.v; avSave(c); ME.try = {}; render(true); toast('🎉 ได้ ' + it.n + ' แล้ว และสวมให้เรียบร้อย'); if (typeof confetti === 'function') confetti();
  },
  avRandom() {
    const c = avCfg(), pick = a => a[Math.floor(Math.random() * a.length)];
    c.skin = pick(Object.keys(AVSKIN)); c.hc = pick(AVHAIR); c.hc2 = Math.random() < .25 ? pick(AVHAIR) : ''; c.ec = pick(AVEYEC); c.tc = pick(AVTEE); c.bc = pick(AVBOT);
    AV_SLOTS.forEach(s => { const o = AVITEMS.filter(i => i.slot === s && avHas(i.id) && (!i.g || i.g === (c.g === 'm' ? 'm' : 'f'))); if (o.length) c[s] = pick(o).v; });
    avSave(c); ME.try = {}; render(true);
  },
  avReset() { if (confirm('รีเซ็ตลุคกลับค่าเริ่มต้น? (ของที่ซื้อแล้วยังอยู่ครบ)')) { store.set('av', {}); ME.try = {}; render(true); } },
  avHow() { alert('วิธีได้เหรียญ 🪙\n• ทำโจทย์จบ 1 ชุด: ได้ 1 เหรียญต่อข้อที่ทำ + 1 เหรียญต่อข้อที่ถูก\n• แม่นยำ ≥ 60% / ≥ 80% / เต็มทุกข้อ (10 ข้อขึ้นไป): โบนัส +5 / +10 / +20\n• สอบจำลองจับเวลา: คูณ 1.5\n• ทำภารกิจรายวันครบ: +20 (วันละครั้ง)\n\nของเทศกาลซื้อได้เฉพาะช่วงเทศกาล ซื้อแล้วเก็บไว้ได้ตลอด ส่วนของมหาวิทยาลัยซื้อได้เมื่อเลือกธีมของที่นั่นอยู่'); }
};

document.addEventListener('change', e => { const r = e.target && e.target.dataset && e.target.dataset.r; if (r === 'sz' || r === 'bw') ACT.avSize(r, +e.target.value); });
