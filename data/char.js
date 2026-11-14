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
// ของพื้นฐาน (ฟรี): ลองสวมเสื้อช็อปได้ทุกมหาวิทยาลัย
UNIIDS.forEach(id => addItem({ slot: 'top', v: 'uni:' + id, n: 'เสื้อช็อป ' + uniShort(id), e: '👕', cat: 'basic' }));
[['top', 'tee', 'เสื้อยืด', '👕'], ['top', 'hoodie', 'ฮู้ด', '🧥'], ['outer', '', 'ไม่ใส่', '🚫'], ['head', '', 'ไม่ใส่', '🚫'], ['head', 'cap', 'หมวกแก๊ปสีธีม', '🧢'], ['face', '', 'ไม่ใส่', '🚫'], ['face', 'round', 'แว่นกลม', '👓'],
  ['neck', '', 'ไม่ใส่', '🚫'], ['neck', 'lanyard', 'สายคล้องบัตร', '🪪'], ['hand', '', 'มือเปล่า', '✋'], ['hand', 'roll', 'ม้วนแบบแปลน', '📜'], ['hand', 'calc', 'เครื่องคิดเลข', '🧮'],
  ['bottom', 'trouser', 'กางเกงขายาว', '👖'], ['bottom', 'skirt', 'กระโปรง', '👗'], ['bottom', 'shorts', 'กางเกงขาสั้น', '🩳'], ['shoes', 'sneaker', 'รองเท้าผ้าใบ', '👟'], ['shoes', 'loafer', 'รองเท้าหนัง', '👞'],
  ['bg', '', 'ไม่มีฉาก', '🚫'], ['bg', 'room', 'ห้องติว', '🏠']].forEach(([slot, v, n, e]) => addItem({ slot, v, n, e, cat: 'basic' }));
// ของแลกด้วยเหรียญทั่วไป
[['outer', 'lab', 'เสื้อกราวน์แล็บ', '🥼', 80, 'เสื้อกราวน์ขาวของคนสายวิทย์'], ['outer', 'vest', 'เสื้อกั๊กเซฟตี้', '🦺', 60, 'ลงสนามก่อสร้างต้องใส่'], ['head', 'hardhat', 'หมวกเซฟตี้วิศวกร', '⛑️', 40, 'หมวกนิรภัยสีเหลือง'],
  ['head', 'phones', 'หูฟังครอบหู', '🎧', 60, 'ฟังเพลงตอนติว'], ['face', 'square', 'แว่นเหลี่ยม', '🤓', 40, 'ดูเป็นนักคำนวณ'], ['face', 'shades', 'แว่นกันแดด', '🕶️', 70, 'เท่เกินห้องเรียน'],
  ['hand', 'trophy', 'ถ้วยรางวัล', '🏆', 300, 'โชว์ความขยัน', 'xp', 180, 'ต้องถึงชั้นปี 3 (180 แต้มสะสม)'],
  ['top', 'gown', 'ชุดครุยบัณฑิต', '🎓', 600, 'ฝันให้ไกล ไปให้ถึง', 'xp', 400, 'ต้องถึงชั้นปี 4 (400 แต้มสะสม)'], ['head', 'grad', 'หมวกบัณฑิต', '🎓', 200, 'ใส่คู่ชุดครุย', 'xp', 400, 'ต้องถึงชั้นปี 4 (400 แต้มสะสม)'],
  ['head', 'crown', 'มงกุฎวิศวกร', '👑', 800, 'สำหรับผู้ที่ไปถึงระดับสูงสุด', 'xp', 1500, 'ต้องถึงวิศวกรมืออาชีพ (1,500 แต้มสะสม)']
].forEach(([slot, v, n, e, p, d, req, rn, rt]) => addItem({ slot, v, n, e, p, d, cat: 'shop', req: req ? { k: req, n: rn, t: rt } : null }));
// ของเทศกาล (ซื้อได้เฉพาะช่วงเทศกาล — ซื้อแล้วเป็นของเราตลอด)
[['tcas', 'head', 'hachi', 'ผ้าคาดหัวพิชิตสนามสอบ', '🎌', 100, 'ผ้าขาวจุดแดง ให้กำลังใจก่อนสอบ'],
  ['cny', 'top', 'cny', 'เสื้อตรุษจีน', '🧧', 150, 'สีแดงมงคลลายเส้นทอง'], ['cny', 'bg', 'cny', 'ฉากโคมแดงตรุษจีน', '🏮', 160, 'โคมแดงและกรอบทอง'],
  ['songkran', 'top', 'songkran', 'เสื้อลายดอกสงกรานต์', '🌺', 120, 'เสื้อลายดอกไม้ใส่เล่นน้ำ'], ['songkran', 'head', 'garland', 'พวงมาลัยดอกไม้', '🌼', 80, 'พวงดอกไม้สดใส'], ['songkran', 'neck', 'lei', 'สร้อยดอกไม้', '💐', 80, 'สร้อยดอกไม้คล้องคอ'],
  ['songkran', 'hand', 'gun', 'ปืนฉีดน้ำ', '🔫', 90, 'ระวังเปียก!'], ['songkran', 'bg', 'songkran', 'ฉากสาดน้ำสงกรานต์', '💦', 150, 'ท้องฟ้าใสและละอองน้ำ'],
  ['halloween', 'top', 'halloween', 'เสื้อฟักทองฮาโลวีน', '🎃', 120, 'เสื้อส้มลายฟักทอง'], ['halloween', 'head', 'witch', 'หมวกแม่มด', '🧙', 90, 'หมวกแหลมสีม่วง'], ['halloween', 'bg', 'halloween', 'ฉากคืนพระจันทร์เต็มดวง', '🌕', 150, 'ฉากค้างคาวและพระจันทร์'],
  ['loy', 'top', 'thai', 'ชุดไทยลอยกระทง', '🥻', 150, 'เสื้อสีครีมขลิบทอง'], ['loy', 'hand', 'krathong', 'กระทงใบตอง', '🏮', 90, 'กระทงดอกไม้พร้อมเทียน'], ['loy', 'bg', 'loy', 'ฉากโคมลอยกลางคืน', '🌙', 160, 'ท้องฟ้ายามค่ำและโคมลอย'],
  ['xmas', 'top', 'xmas', 'สเวตเตอร์คริสต์มาส', '🎄', 140, 'ไหมพรมแดนุ่ม ๆ'], ['xmas', 'head', 'santa', 'หมวกซานตาคลอส', '🎅', 90, 'หมวกแดงขอบขาว'], ['xmas', 'hand', 'spark', 'ดอกไม้ไฟ', '🎇', 80, 'ฉลองส่งท้ายปี'], ['xmas', 'bg', 'xmas', 'ฉากหิมะ', '❄️', 150, 'หิมะและต้นสน']
].forEach(([season, slot, v, n, e, p, d]) => addItem({ slot, v, n, e, p, d, cat: 'season', season }));
// ของประจำมหาวิทยาลัย (ซื้อได้เมื่อเลือกธีมของมหาวิทยาลัยนั้น — ชิ้นละ 1 ต่อบัญชี)
UNIIDS.filter(id => id !== 'sixent').forEach(id => {
  const s = uniShort(id);
  addItem({ slot: 'top', v: 'unig:' + id, n: 'เสื้อช็อป Gold Edition ' + s, e: '✨', p: 450, d: 'เสื้อช็อปรุ่นปักด้ายทอง เฉพาะ ' + s, cat: 'uni', uni: id });
  addItem({ slot: 'neck', v: 'scarf:' + id, n: 'ผ้าพันคอ ' + s, e: '🧣', p: 150, d: 'ผ้าพันคอสีประจำมหาวิทยาลัย', cat: 'uni', uni: id });
  addItem({ slot: 'bg', v: 'scene:' + id, n: 'ฉากตราสัญลักษณ์ ' + s, e: '🏛️', p: 280, d: 'ฉากเรืองแสงพร้อมตราสัญลักษณ์', cat: 'uni', uni: id });
});

/* ---------- สถานะ: ของที่มี / ลุคที่ใส่ ---------- */
const avOwn = () => store.get('own', {});
const avHas = id => { const it = AVBY[id]; return !!it && (it.p === 0 || !!avOwn()[id]); };
const AV_SLOTS = ['top', 'outer', 'head', 'face', 'neck', 'hand', 'bg'];
function avCfg() {
  const c = Object.assign({}, AVDEF, store.get('av', {}));
  AV_SLOTS.forEach(s => { if (c[s] && !avHas(s + ':' + c[s])) c[s] = AVDEF[s]; });
  if (!AVSKIN[c.skin]) c.skin = 'b';
  return c;
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
  if (typeof toast === 'function') toast('🪙 ได้รับ ' + total + ' เหรียญจากชุดโจทย์นี้');
  return { total, parts, bal: coinBal() };
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

/* ---------- ห้องแต่งตัว + ร้านค้า (#/me) ---------- */
const ME = { tab: 'dress', filter: 'all', try: {} };
const meCfg = () => Object.assign({}, avCfg(), ME.try);
function tileRow(title, slot, opts) {
  opts = opts || {}; const cfg = avCfg(), items = AVITEMS.filter(i => i.slot === slot && !(opts.skip && opts.skip(i)) && avHas(i.id));
  return `<div class="avrow"><h4>${title}</h4><div class="avtiles ${opts.big ? 'big' : ''}">${items.map(i => `<button class="avt ${cfg[slot] === i.v ? 'on' : ''}" data-a="avSet" data-v="${slot}|${esc(i.v)}" aria-pressed="${cfg[slot] === i.v}">${opts.big ? `<span class="avtp">${avatarSvg({ [slot]: i.v }, { view: 'half', w: 70, bg: false })}</span>` : `<span class="avte">${i.e}</span>`}<small>${esc(i.n)}</small></button>`).join('')}<button class="avt more" data-a="avTab" data-v="shop"><span class="avte">🛍</span><small>ซื้อเพิ่ม</small></button></div></div>`;
}
const swatches = (arr, cur, act, sub) => `<div class="avsw">${arr.map(c => `<button class="sw ${cur === c ? 'on' : ''}" style="--c:${c}" data-a="${act}" data-v="${c}" aria-label="สี ${c}"></button>`).join('')}</div>`;
function avStage() {
  const nick = store.get('nick', 'น้องวิศวะ'), si = typeof shirtInfo === 'function' ? shirtInfo() : { title: '' }, cfg = meCfg();
  const lock = Object.keys(ME.try).length;
  return `<div class="card avstage ${cfg.bg ? 'hasbg' : ''}"><div class="avbig">${avatarSvg(ME.try, { w: 210 })}</div>
    <div class="avmeta"><div class="mute">${esc(si.title || '')}</div><div class="row" style="gap:6px;flex-wrap:nowrap"><b class="avname">${esc(nick)}</b><button class="chip" data-a="nickEdit" aria-label="แก้ชื่อ">✎</button></div>${coinChip()}
      <div class="avbtns"><button data-a="avRandom">🎲 สุ่มลุค</button><button data-a="avReset">↺ รีเซ็ต</button></div>
      ${lock ? `<div class="avtry"><b>กำลังลองใส่</b> — ยังไม่ได้ซื้อ <button class="chip" data-a="avUntry">ยกเลิก</button></div>` : ''}</div></div>`;
}
function dressTab() {
  const c = avCfg(), tee = c.top === 'tee' || c.top === 'hoodie';
  return `<div class="card avpanel">
    <div class="avrow"><h4>เพศของตัวละคร</h4><div class="seg">${[['m', '👦 ชาย'], ['f', '👧 หญิง'], ['n', '🧑 ไม่ระบุ']].map(([k, t]) => `<button class="${c.g === k ? 'on' : ''}" data-a="avGender" data-v="${k}">${t}</button>`).join('')}</div></div>
    <div class="avrow"><h4>สีผิว</h4>${swatches(Object.values(AVSKIN), AVSKIN[c.skin], 'avSkin')}</div>
    <div class="avrow"><h4>ทรงผม</h4><div class="chips">${[['short', 'สั้น'], ['side', 'แสกข้าง'], ['buzz', 'เกรียน'], ['curly', 'หยิก'], ['bob', 'บ็อบ'], ['long', 'ยาว'], ['ponytail', 'ม้วนหางม้า'], ['bun', 'จุก']].map(([k, t]) => `<button class="chip ${c.hair === k ? 'on' : ''}" data-a="avHair" data-v="${k}">${t}</button>`).join('')}</div>${swatches(AVHAIR, c.hc, 'avHairC')}</div>
  </div>
  <div class="card avpanel">${tileRow('เสื้อ (ลองสวมเสื้อช็อปได้ทุกมหาวิทยาลัย)', 'top', { big: true })}${tee ? `<div class="avrow"><h4>สีเสื้อ</h4>${swatches(AVTEE, c.tc, 'avTee')}</div>` : ''}
    ${tileRow('ชั้นนอก', 'outer')}${tileRow('ศีรษะ', 'head')}${tileRow('แว่น', 'face')}${tileRow('ที่คอ', 'neck')}${tileRow('ในมือ', 'hand')}
    ${tileRow('ท่อนล่าง', 'bottom')}<div class="avrow"><h4>สีกางเกง/กระโปรง</h4>${swatches(AVBOT, c.bc, 'avBot')}</div>${tileRow('รองเท้า', 'shoes')}${tileRow('ฉากหลัง', 'bg')}</div>`;
}
function itemCard(it) {
  const own = avHas(it.id), lock = own ? '' : itemLock(it), bal = coinBal(), cfg = avCfg(), worn = cfg[it.slot] === it.v;
  const st = it.season ? seasonState(seasonOf(it.season)) : null, sn = it.season ? seasonOf(it.season) : null;
  const tag = it.season ? `<span class="itag s${st.on ? ' on' : ''}">${sn.ic} ${sn.n}${st.on ? ` · เหลือ ${st.left} วัน` : ''}</span>` : it.uni ? `<span class="itag u">🎓 ${esc(uniShort(it.uni))} · จำกัด 1 ชิ้น</span>` : it.req ? `<span class="itag">🔒 ปลดล็อกตามระดับ</span>` : '';
  let btn;
  if (own) btn = `<button class="${worn ? '' : 'pri'}" data-a="avSet" data-v="${it.slot}|${esc(it.v)}">${worn ? '✓ กำลังใส่' : 'ใส่เลย'}</button>`;
  else if (lock) btn = `<button disabled>🔒 ล็อก</button>`;
  else btn = `<button class="pri" data-a="avBuy" data-v="${esc(it.id)}" ${bal < it.p ? 'disabled' : ''}>🪙 ${it.p}</button>`;
  return `<div class="itc ${own ? 'own' : ''} ${lock ? 'locked' : ''}"><div class="itp" data-a="avTry" data-v="${esc(it.id)}">${avatarSvg({ [it.slot]: it.v }, { view: 'half', w: 118 })}${tag}</div>
    <b>${esc(it.n)}</b><small class="mute">${esc(it.d || '')}</small>${lock ? `<small class="lockmsg">${esc(lock)}</small>` : !own && bal < it.p ? `<small class="lockmsg soft">ขาดอีก ${it.p - bal} เหรียญ</small>` : ''}
    <div class="row" style="gap:6px"><button data-a="avTry" data-v="${esc(it.id)}">ลองใส่</button>${btn}</div></div>`;
}
function shopTab() {
  const f = ME.filter, shop = AVITEMS.filter(i => i.cat !== 'basic' && (f === 'all' || i.cat === f)), cur = curThemeId();
  const live = SEASONS.filter(s => seasonState(s).on), soon = SEASONS.map(s => [s, seasonState(s)]).filter(x => !x[1].on).sort((a, b) => a[1].in - b[1].in)[0];
  const rank = i => (i.season ? (seasonState(seasonOf(i.season)).on ? 0 : 3) : i.uni ? (i.uni === cur ? 1 : 4) : 2);
  const list = shop.slice().sort((a, b) => rank(a) - rank(b) || (avHas(a.id) ? 1 : 0) - (avHas(b.id) ? 1 : 0) || a.p - b.p);
  return `<div class="card coinbox"><div class="row between" style="gap:10px"><div><b style="font-size:17px">ร้านค้าลิมิเต็ด</b><div class="mute">เหรียญของคุณ ${coinChip()}</div></div><button class="chip" data-a="avHow">ได้เหรียญยังไง?</button></div>
    <div class="seasons">${live.length ? live.map(s => { const st = seasonState(s); return `<span class="sbadge on">${s.ic} ${s.n} <small>เหลือ ${st.left} วัน</small></span>`; }).join('') : '<span class="mute">ตอนนี้ไม่มีเทศกาลพิเศษ</span>'}${soon ? `<span class="sbadge">${soon[0].ic} ${soon[0].n} <small>อีก ${soon[1].in} วัน (${thDate(soon[1].start)})</small></span>` : ''}</div>
    ${cur !== 'sixent' ? `<div class="mute" style="font-size:13px">ธีมตอนนี้คือ ${esc(uniShort(cur))} — ปลดล็อกของมหาวิทยาลัยนี้ได้เลย</div>` : '<div class="mute" style="font-size:13px">เลือกธีมมหาวิทยาลัย (ปุ่ม 🎨) เพื่อปลดล็อกของลิมิเต็ดเฉพาะที่นั่น</div>'}</div>
  <div class="chips" style="margin:6px 0">${[['all', 'ทั้งหมด'], ['season', '🎉 เทศกาล'], ['uni', '🎓 มหาวิทยาลัย'], ['shop', '⭐ ทั่วไป']].map(([k, t]) => `<button class="chip ${f === k ? 'on' : ''}" data-a="avFilter" data-v="${k}">${t}</button>`).join('')}</div>
  <div class="itgrid">${list.map(itemCard).join('')}</div>`;
}
function viewMe() {
  const hist = (coinData().log || []).slice(0, 6);
  return `<h1>ตัวละครของฉัน</h1>${avStage()}
    <div class="seg tabs2"><button class="${ME.tab === 'dress' ? 'on' : ''}" data-a="avTab" data-v="dress">👕 ห้องแต่งตัว</button><button class="${ME.tab === 'shop' ? 'on' : ''}" data-a="avTab" data-v="shop">🛍 ร้านค้า</button><button class="${ME.tab === 'friends' ? 'on' : ''}" data-a="avTab" data-v="friends">👥 เพื่อน</button></div>
    ${ME.tab === 'dress' ? dressTab() : ME.tab === 'shop' ? shopTab() : friendsTab()}
    ${hist.length ? `<div class="card"><h2>เหรียญล่าสุด</h2><ul class="coinparts">${hist.map(h => `<li><span>${esc(h.t)}</span><b class="${h.n < 0 ? 'neg' : ''}">${h.n > 0 ? '+' : ''}${h.n}</b></li>`).join('')}</ul></div>` : ''}`;
}

/* ---------- การกระทำ ---------- */
function avUpdateHero(id) { const h = document.querySelector('.uh-meav'); if (h) h.innerHTML = avatarSvg({ top: 'uni:' + id }, { w: 92 }); }
const CHAR_ACT = {
  avOpen(v) { ME.tab = v === 'shop' ? 'shop' : v === 'friends' ? 'friends' : 'dress'; ME.try = {}; uniPage(null); if (location.hash !== '#/me') location.hash = '#/me'; else render(true); },
  avTab(v) { ME.tab = v; ME.try = {}; render(true); if (v === 'friends' && typeof socLoadFriends === 'function') socLoadFriends(); },
  avFilter(v) { ME.filter = v; render(true); },
  avSet(v) { const [slot, val] = v.split('|'), c = avCfg(); if (slot === 'top' && val !== c.top) { /* เปลี่ยนเสื้อ */ } c[slot] = val; avSave(c); ME.try = {}; render(true); },
  avGender(v) { const c = avCfg(), o = GD[c.g] || GD.m, n = GD[v]; if (c.hair === o.hair) c.hair = n.hair; if (c.bottom === o.bottom) c.bottom = n.bottom; c.g = v; avSave(c); render(true); },
  avSkin(v) { const c = avCfg(), k = Object.keys(AVSKIN).find(k => AVSKIN[k] === v); if (k) { c.skin = k; avSave(c); render(true); } },
  avHair(v) { const c = avCfg(); c.hair = v; avSave(c); render(true); },
  avHairC(v) { const c = avCfg(); c.hc = v; avSave(c); render(true); },
  avTee(v) { const c = avCfg(); c.tc = v; avSave(c); render(true); },
  avBot(v) { const c = avCfg(); c.bc = v; avSave(c); render(true); },
  avWearUni(v) { const c = avCfg(); c.top = 'uni:' + v; avSave(c); avUpdateHero(v); toast('👕 ตัวละครสวมเสื้อช็อป ' + uniShort(v) + ' แล้ว'); },
  avTry(v) { const it = AVBY[v]; if (!it) return; if (avHas(v)) { ACT.avSet(it.slot + '|' + it.v); return; } ME.try = { [it.slot]: it.v }; render(true); window.scrollTo({ top: 0, behavior: 'smooth' }); },
  avUntry() { ME.try = {}; render(true); },
  avBuy(v) {
    const it = AVBY[v]; if (!it || avHas(v)) return; const lock = itemLock(it); if (lock) { toast('🔒 ' + lock); return; }
    if (coinBal() < it.p) { toast('เหรียญไม่พอ — ทำโจทย์ให้จบอีกชุดเพื่อสะสมเหรียญ'); return; }
    if (!confirm(`แลก “${it.n}” ราคา ${it.p} เหรียญ?`)) return;
    const own = avOwn(); own[v] = Date.now(); store.set('own', own); coinLog(-it.p, 'แลก ' + it.n);
    const c = avCfg(); c[it.slot] = it.v; avSave(c); ME.try = {}; render(true); toast('🎉 ได้ ' + it.n + ' แล้ว และสวมให้เรียบร้อย'); if (typeof confetti === 'function') confetti();
  },
  avRandom() {
    const c = avCfg(), pick = a => a[Math.floor(Math.random() * a.length)]; c.skin = pick(Object.keys(AVSKIN)); c.hair = pick(['short', 'side', 'buzz', 'curly', 'bob', 'long', 'ponytail', 'bun']); c.hc = pick(AVHAIR);
    AV_SLOTS.forEach(s => { const o = AVITEMS.filter(i => i.slot === s && avHas(i.id)); if (o.length) c[s] = pick(o).v; }); c.tc = pick(AVTEE); c.bottom = pick(['trouser', 'skirt', 'shorts']); c.bc = pick(AVBOT); c.shoes = pick(['sneaker', 'loafer']);
    avSave(c); ME.try = {}; render(true);
  },
  avReset() { if (confirm('รีเซ็ตลุคกลับค่าเริ่มต้น? (ของที่ซื้อแล้วยังอยู่ครบ)')) { store.set('av', {}); ME.try = {}; render(true); } },
  avHow() { alert('วิธีได้เหรียญ 🪙\n• ทำโจทย์จบ 1 ชุด: ได้ 1 เหรียญต่อข้อที่ทำ + 1 เหรียญต่อข้อที่ถูก\n• แม่นยำ ≥ 60% / ≥ 80% / เต็มทุกข้อ (10 ข้อขึ้นไป): โบนัส +5 / +10 / +20\n• สอบจำลองจับเวลา: คูณ 1.5\n• ทำภารกิจรายวันครบ: +20 (วันละครั้ง)\n\nของเทศกาลซื้อได้เฉพาะช่วงเทศกาล ซื้อแล้วเก็บไว้ได้ตลอด ส่วนของมหาวิทยาลัยซื้อได้เมื่อเลือกธีมของที่นั่นอยู่'); }
};
