// ระบบเพื่อน: เพิ่มเพื่อนด้วยโค้ด + ดูตัวละครของเพื่อน (ใช้ Supabase ผ่าน fetch ตรง ๆ ไม่พึ่งไลบรารีภายนอก)
// ผู้ใช้ต้องกด "เปิดใช้งาน" เอง จึงจะสร้างบัญชีแบบไม่ระบุตัวตนและอัปโหลดโปรไฟล์ (ชื่อเล่น มหาวิทยาลัย ลุคตัวละคร แต้ม ชั้นปี) — ไม่ส่งสถิติโจทย์หรือข้อมูลอื่น
// โค้ดเซิร์ฟเวอร์และ RLS อยู่ใน supabase/schema.sql ; ค่าเชื่อมต่ออยู่ใน data/social_cfg.js

const SOC = { friends: [], loading: false, err: '', me: null, last: 0, sent: '', busy: false };
const socOn = () => !!(typeof SOCIAL_CFG !== 'undefined' && SOCIAL_CFG.url && SOCIAL_CFG.key);
const socSt = () => store.get('soc', {});            // {on:true, s:{access,refresh,exp,uid}, code}
const socEnabled = () => socOn() && !!socSt().on;

/* ---------- ตรวจข้อมูลตัวละครที่มาจากเพื่อน (ห้ามเชื่อ: ค่าสีและชื่อไอเท็มถูกแทรกลง SVG) ---------- */
function avClean(c) {
  c = c && typeof c === 'object' ? c : {}; const o = Object.assign({}, AVDEF), col = v => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v) ? v : null;
  if (['m', 'f', 'n'].includes(c.g)) o.g = c.g; if (AVSKIN[c.skin]) o.skin = c.skin; if (AV_HAIRS.includes(c.hair)) o.hair = c.hair;
  o.sz = Math.min(1.15, Math.max(.85, +c.sz || 1)); o.bw = Math.min(1.2, Math.max(.85, +c.bw || 1)); o.look = c.look === 'soft' ? 'soft' : 'flat'; o.hc = col(c.hc) || o.hc; o.hc2 = col(c.hc2) || ''; o.ec = col(c.ec) || o.ec; o.tc = col(c.tc) || o.tc; o.bc = col(c.bc) || o.bc;
  if (AV_EYES.some(e => e[0] === c.eye)) o.eye = c.eye; if (AV_MOUTHS.some(e => e[0] === c.mouth)) o.mouth = c.mouth;
  if (['trouser', 'skirt', 'shorts', 'jeans', 'pleated', 'cargo', 'leggings'].includes(c.bottom)) o.bottom = c.bottom; if (['sneaker', 'loafer', 'boots', 'slipper', 'highcut', 'mary'].includes(c.shoes)) o.shoes = c.shoes;
  AV_SLOTS.forEach(s => { if (c[s] != null && typeof c[s] === 'string' && AVBY[s + ':' + c[s]]) o[s] = c[s]; });
  return avFixG(o);
}

/* ---------- เรียกเซิร์ฟเวอร์ ---------- */
async function socRaw(path, method, body, token) {
  const h = { apikey: SOCIAL_CFG.key, 'Content-Type': 'application/json' }; if (token) h.Authorization = 'Bearer ' + token;
  const r = await fetch(SOCIAL_CFG.url.replace(/\/$/, '') + path, { method, headers: h, body: body == null ? undefined : JSON.stringify(body) });
  let j = null; try { j = await r.json(); } catch { /* ไม่มีเนื้อหา */ }
  if (!r.ok) { const e = new Error((j && (j.message || j.msg || j.error_description)) || 'เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ'); e.status = r.status; throw e; }
  return j;
}
function socSave(s) { const st = socSt(); st.s = { access: s.access_token, refresh: s.refresh_token, exp: s.expires_at ? s.expires_at * 1000 : Date.now() + (s.expires_in || 3600) * 1000, uid: s.user && s.user.id }; store.set('soc', st); }
/* ขอ token ทีละครั้งเท่านั้น: ถ้ามีหลายคำขอพร้อมกัน (ส่งสถานะ + โหลดเพื่อน + โพลล์) จะไม่สมัครบัญชีซ้ำ
   และไม่ใช้ refresh token เดียวกันสองรอบ (รอบที่สองจะถูกปฏิเสธแล้วทำให้เสียบัญชี/เพื่อนเดิม) */
let TOKP = null;
function socToken() { if (!TOKP) TOKP = socToken1().finally(() => { TOKP = null; }); return TOKP; }
async function socToken1() {
  const st = socSt(); let s = st.s;
  if (!s) { socSave(await socRaw('/auth/v1/signup', 'POST', {})); return socSt().s.access; }   // บัญชีแบบไม่ระบุตัวตน
  if (Date.now() > s.exp - 60000) { try { socSave(await socRaw('/auth/v1/token?grant_type=refresh_token', 'POST', { refresh_token: s.refresh })); } catch (e) { if (e.status >= 400 && e.status < 500) { delete st.s; store.set('soc', st); return socToken1(); } throw e; } }
  return socSt().s.access;
}
async function socRpc(fn, args) {
  try { return await socRaw('/rest/v1/rpc/' + fn, 'POST', args || {}, await socToken()); }
  catch (e) { if (e.status === 401) { const st = socSt(); if (st.s) { st.s.exp = 0; store.set('soc', st); } return socRaw('/rest/v1/rpc/' + fn, 'POST', args || {}, await socToken()); } throw e; }
}

/* ---------- ซิงก์โปรไฟล์ของฉัน ---------- */
function socPayload() {
  const cfg = avCfg(), keep = {}; ['g', 'skin', 'hair', 'hc', 'hc2', 'eye', 'ec', 'mouth', 'top', 'tc', 'outer', 'head', 'hacc', 'face', 'neck', 'hand', 'bottom', 'bc', 'shoes', 'pet', 'fx', 'bg', 'sz', 'bw', 'look', 'fc', 'legs'].forEach(k => keep[k] = cfg[k]);
  return { p_nick: String(store.get('nick', 'น้องวิศวะ')).slice(0, 12), p_uni: curThemeId(), p_avatar: keep, p_xp: xpNow(), p_title: shirtInfo().title };
}
async function socSync(force) {
  if (!socEnabled() || SOC.busy) return; const p = socPayload(), key = JSON.stringify(p);
  if (!force && key === SOC.sent) return; SOC.busy = true;
  try { SOC.me = await socRpc('upsert_profile', p); SOC.sent = key; SOC.last = Date.now(); SOC.err = ''; }
  catch (e) { SOC.err = e.message; }
  finally { SOC.busy = false; if (ME.tab === 'friends' && location.hash === '#/me') render(true); }
}
async function socLoadFriends(quiet) {
  if (!socEnabled() || SOC.fbusy) return; SOC.fbusy = true; if (!quiet) { SOC.loading = true; if (ME.tab === 'friends') render(true); }
  try { await socSync(); SOC.friends = (await socRpc('my_friends')) || []; SOC.flast = Date.now(); SOC.err = ''; }
  catch (e) { if (!quiet) SOC.err = e.message; }
  SOC.fbusy = false; SOC.loading = false; if (ME.tab === 'friends' && location.hash === '#/me' && !quiet) render(true); else socPaint();
}
setInterval(() => { if (typeof store !== 'undefined' && socEnabled() && document.visibilityState === 'visible') socSync(); }, 20000);

/* ---------- สถานะ "กำลังทำอะไรอยู่": จับเวลา / อ่านบทเรียน / ทำข้อสอบ ----------
   เปิดเป็นรายคน (socSt().pr) ส่งแค่ ประเภทกิจกรรม + ชื่อบท/วิชา + เวลาที่ทำมาแล้ว — ไม่ส่งคะแนนหรือคำตอบ
   เวลาที่เพื่อนเห็นคำนวณฝั่งเซิร์ฟเวอร์ จึงไม่คลาดเคลื่อนตามนาฬิกาเครื่อง ถือว่า "ออนไลน์" เมื่อมีสัญญาณภายใน 150 วินาที */
const PRES = { sig: '', pt: 0, busy: false, pgKey: '', pgT0: 0, st: {}, lastPoll: 0, polling: false, told: {}, first: true, kt: 0 };
// [ไอคอน, ประโยคเต็ม, คำสั้น, นับเป็น "กำลังติว"?]
const PACT = { timer: ['⏱', 'จับเวลาอ่านหนังสือ', 'จับเวลา', 1], break: ['☕', 'พักระหว่างโฟกัส', 'พักอยู่', 0], read: ['📖', 'อ่านบทเรียน', 'อ่านบท', 1], exam: ['📝', 'ทำข้อสอบ', 'ทำข้อสอบ', 1],
  dress: ['👕', 'แต่งตัวละคร', 'แต่งตัว', 0], shop: ['🛍', 'เลือกซื้อของในร้านค้า', 'ช็อปปิ้ง', 0], stats: ['📊', 'ดูสถิติของตัวเอง', 'ดูสถิติ', 0], uni: ['🎓', 'อ่านประวัติมหาวิทยาลัย', 'อ่านประวัติ', 0] };
const isStudy = a => !!(PACT[a] && PACT[a][3]);
const socPres = () => socEnabled() && socSt().pr === true;
const plain = s => String(s == null ? '' : s).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 40);
/* หน้าที่ผู้ใช้เปิดอยู่ → กิจกรรม ; จับเวลาที่กำลังเดินชนะเมื่อกำลังอ่านบท หรือเมื่อออกจากหน้าจอไปแล้ว */
function socActivity() {
  const sec = ms => Math.max(0, Math.round(ms / 1000)), h = location.hash, vis = document.visibilityState === 'visible', uo = document.getElementById('unipage'); let pg = null;
  if (E && !E.done && h.startsWith('#/exam')) return { k: 'exam', l: E.mode === 'mock' ? 'สอบจำลอง' : 'ฝึกทำโจทย์', s: sec(Date.now() - E.t0) };
  if (uo) pg = { k: 'uni', l: plain(typeof uniShort === 'function' ? uniShort(uo.dataset.u) : ''), key: 'uni' + uo.dataset.u };
  else if (h === '#/library' && typeof libTab !== 'undefined' && libTab === 'lessons' && libOpen && hasLesson(libOpen)) pg = { k: 'read', l: plain(lessonMeta(libOpen).title), key: 'read' + libOpen };
  else if (h === '#/me' && ME.tab === 'dress') pg = { k: 'dress', l: '', key: 'dress' };
  else if (h === '#/me' && ME.tab === 'shop') pg = { k: 'shop', l: '', key: 'shop' };
  else if (h === '#/stats') pg = { k: 'stats', l: '', key: 'stats' };
  if (!pg) PRES.pgKey = ''; else if (PRES.pgKey !== pg.key) { PRES.pgKey = pg.key; PRES.pgT0 = Date.now(); }
  if (T.running && (!pg || pg.k === 'read' || !vis)) {
    const brk = T.mode === 'pomo' && T.phase === 'break';
    return { k: brk ? 'break' : 'timer', l: brk ? '' : ((pg && pg.k === 'read' && pg.l) || plain(T.subject)), s: T.mode === 'sw' ? sec(tElapsed() * 1000) : sec(((brk ? T.breakMin : T.focusMin) * 60 - T.remain) * 1000) };
  }
  if (pg) return { k: pg.k, l: pg.l, s: sec(Date.now() - PRES.pgT0) };
  return { k: 'idle', l: '', s: 0 };
}
async function socPush(force) {
  if (!socPres() || PRES.busy) return;
  const vis = document.visibilityState === 'visible', live = vis || T.running, a = live ? socActivity() : { k: 'idle', l: '', s: 0 }, sig = a.k + '|' + a.l;
  if (!force && sig === PRES.sig && !(live && Date.now() - PRES.pt > 19000)) return;
  PRES.busy = true;
  const tot = typeof ypTotals === 'function' ? ypTotals() : null, args = { p_act: a.k, p_label: a.l, p_secs: a.s }; if (tot) Object.assign(args, { p_day: dayKey(Date.now()), p_today: tot.day, p_week: tot.week, p_month: tot.month });
  try { await socRpc('set_presence', args); PRES.sig = sig; PRES.pt = Date.now(); } catch { /* ลองใหม่รอบหน้า */ }
  finally { PRES.busy = false; }
}
const socWatching = () => { const h = location.hash; return h === '' || h === '#' || h === '#/' || h === '#/timer' || h === '#/rank' || (h === '#/me' && ME.tab === 'friends'); };
async function socPoll(force) {
  if (!socEnabled() || PRES.polling || document.visibilityState !== 'visible') return;
  if (!force && (!socWatching() || Date.now() - PRES.lastPoll < 6000)) return;
  PRES.polling = true;
  try {
    const rows = (await socRpc('friend_status')) || [], old = PRES.st, now = Date.now(); PRES.st = {};
    rows.forEach(r => { PRES.st[r.id] = { act: PACT[r.act] || r.act === 'idle' ? r.act : 'off', label: plain(r.act_label), secs: Math.max(0, +r.act_secs || 0), seen: r.seen_secs == null ? null : Math.max(0, +r.seen_secs || 0), at: now, st: r.st_today == null ? null : { day: +r.st_today || 0, week: +r.st_week || 0, month: +r.st_month || 0 } }; });
    PRES.lastPoll = now;
    if (!SOC.flast || rows.length !== SOC.friends.length || rows.some(r => !SOC.friends.some(f => f.id === r.id)) || now - SOC.flast > 180000) await socLoadFriends(true);
    if (!PRES.first && !(E && !E.done && location.hash.startsWith('#/exam'))) rows.forEach(r => {
      const s = socStat(r.id), p = old[r.id], was = p && p.seen != null && p.seen < 150 && isStudy(p.act), f = SOC.friends.find(x => x.id === r.id);
      if (s && s.live && isStudy(s.act) && !was && f && now - (PRES.told[r.id] || 0) > 300000) { PRES.told[r.id] = now; toast(PACT[s.act][0] + ' ' + String(f.nick || 'เพื่อน').slice(0, 12) + ' กำลัง' + PACT[s.act][1] + (s.label ? ' · ' + s.label : '') + ' — ไปสู้ด้วยกัน!'); }
    });
    PRES.first = false; socPaint();
  } catch { /* เงียบไว้ ลองใหม่รอบหน้า */ }
  finally { PRES.polling = false; }
}
function socKick() { if (!socEnabled()) return; clearTimeout(PRES.kt); PRES.kt = setTimeout(() => { socPush(); socPoll(); }, 700); }
const socReady = () => typeof store !== 'undefined' && typeof T !== 'undefined';   // social.js โหลดก่อน app.js
setInterval(() => { if (!socReady()) return; socPush(); socPoll(); }, 3000);
document.addEventListener('visibilitychange', () => { if (!socReady()) return; PRES.pt = 0; socPush(); if (document.visibilityState === 'visible') socPoll(true); });
// เปิดเว็บแล้วขึ้นออนไลน์ทันที: ส่งสถานะก่อน (ไม่รอโหลดรายชื่อเพื่อน) แล้วค่อยโหลดเพื่อนกับสถานะเพื่อนพร้อมกัน
function socStart() { if (!socEnabled()) return; socPush(true); socPoll(true); socLoadFriends(true); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', socStart); else socStart();

function socStat(id) {
  const s = PRES.st[id]; if (!s || s.act === 'off' || s.seen == null) return null;
  const drift = (Date.now() - s.at) / 1000, seen = s.seen + drift, live = seen < 150;
  return { live, act: live && PACT[s.act] ? s.act : 'idle', label: s.label, mins: Math.floor((s.secs + drift) / 60), seen };
}
const durTxt = m => m < 1 ? 'เพิ่งเริ่ม' : m < 60 ? m + ' นาทีแล้ว' : Math.floor(m / 60) + ' ชม. ' + (m % 60) + ' น.';
function statusHtml(id, f) {
  const s = socStat(id);
  if (!s) return `<span class="fst">ใช้งานล่าสุด ${socAgo(f.updated_at)}</span>`;
  if (!s.live) return `<span class="fst">ออฟไลน์ · เห็นล่าสุด ${socAgo(Date.now() - s.seen * 1000)}</span>`;
  if (s.act === 'idle') return `<span class="fst on"><i></i>ออนไลน์ · เปิดแอปอยู่</span>`;
  return `<span class="fst ${isStudy(s.act) ? 'act' : 'on'}"><i></i>${PACT[s.act][0]} ${PACT[s.act][1]}${s.label ? ': ' + esc(s.label) : ''} · ${durTxt(s.mins)}</span>`;
}
function socPaint() {
  document.querySelectorAll('[data-fst]').forEach(el => { const f = SOC.friends.find(x => x.id === el.dataset.fst); if (f) el.innerHTML = statusHtml(f.id, f); });
  [['frstrip', false], ['frstrip2', true]].forEach(([id, compact]) => {
    const el = document.getElementById(id); if (!el) return; const row = el.querySelector('.frrow'), x = row ? row.scrollLeft : 0;
    el.innerHTML = friendStrip(compact); const r2 = el.querySelector('.frrow'); if (r2) r2.scrollLeft = x;
  });
}

/* ---------- หน้าจอ ---------- */
const socAgo = t => { const m = Math.max(0, Math.round((Date.now() - new Date(t).getTime()) / 60000)); return m < 2 ? 'เมื่อกี้' : m < 60 ? m + ' นาทีที่แล้ว' : m < 1440 ? Math.round(m / 60) + ' ชม.ที่แล้ว' : Math.round(m / 1440) + ' วันที่แล้ว'; };
const socLink = code => location.origin + location.pathname + '?add=' + code;
function friendCard(f) {
  const cfg = avClean(f.avatar), nm = String(f.nick || '').slice(0, 12), un = (typeof THEMES !== 'undefined' && THEMES.some(t => t.id === f.uni)) ? uniShort(f.uni) : 'SIXENT';
  return `<div class="frc"><button class="frav" data-a="socView" data-v="${esc(f.id)}" aria-label="ดูตัวละครของ ${esc(nm)}">${avatarSvg(cfg, { view: 'half', w: 104, nick: nm, uni: f.uni })}</button>
    <div class="frin"><b>${esc(nm)}</b><span class="tag">${esc(String(f.title || '').slice(0, 30))}</span><div class="mute" style="font-size:12.5px">🎓 ${esc(un)} · ⭐ ${(+f.xp || 0).toLocaleString('th-TH')} แต้ม</div><div class="mute" style="font-size:12.5px" data-fst="${esc(f.id)}">${statusHtml(f.id, f)}</div></div></div>`;
}
/* แถบเพื่อนบนหน้าแรก (และแบบกะทัดรัดในหน้าจับเวลา): ตัวละครเพื่อน + สถานะสด เรียงคนที่กำลังอ่านอยู่ขึ้นก่อน */
function frTile(f) {
  const s = socStat(f.id), nm = String(f.nick || '').slice(0, 12), doing = s && s.live && PACT[s.act], cls = s && s.live ? (isStudy(s.act) ? 'act' : 'on') : '';
  const line = doing ? PACT[s.act][0] + ' ' + PACT[s.act][2] : s && s.live ? 'ออนไลน์' : 'ออฟไลน์';
  const sub = doing ? esc(s.label || (isStudy(s.act) ? durTxt(s.mins) : '')) : '';
  return `<button class="frt ${cls}" data-a="socView" data-v="${esc(f.id)}" aria-label="${esc(nm)} ${esc(line)}"><span class="frtav">${avatarSvg(avClean(f.avatar), { view: 'bust', w: 70, nick: nm, uni: f.uni })}<i class="dot"></i></span><b>${esc(nm)}</b><span class="frts">${line}</span>${sub ? `<span class="frts sub">${sub}</span>` : ''}</button>`;
}
function friendStrip(compact) {
  if (!socOn()) return '';
  const addBtn = `<button class="chip" data-a="avOpen" data-v="friends">${SOC.friends.length ? 'จัดการ' : '+ เพิ่มเพื่อน'}</button>`;
  if (!socEnabled()) return compact ? '' : `<div class="card frhome"><div class="row between" style="gap:10px"><div><b>👥 ติวด้วยกันกับเพื่อน</b><div class="mute" style="font-size:13px">เพิ่มเพื่อนด้วยโค้ด ดูตัวละคร และเห็นว่าใครกำลังอ่านอยู่</div></div><button class="pri" data-a="avOpen" data-v="friends">เริ่มเลย</button></div></div>`;
  if (!SOC.flast) return compact ? '' : `<div class="card frhome"><b>👥 เพื่อนของฉัน</b><div class="mute" style="font-size:13px">${SOC.err ? '⚠️ ' + esc(SOC.err) : 'กำลังโหลดเพื่อน…'}</div></div>`;
  const rank = f => { const s = socStat(f.id); return s && s.live ? (isStudy(s.act) ? 0 : s.act !== 'idle' ? 1 : 2) : 3; };
  let list = SOC.friends.map((f, i) => [f, i]).sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1]).map(x => x[0]);
  const act = list.filter(f => rank(f) === 0).length;
  if (compact) { list = list.filter(f => rank(f) < 3); if (!list.length) return ''; }
  if (!list.length) return `<div class="card frhome"><div class="row between" style="gap:10px"><div><b>👥 ยังไม่มีเพื่อน</b><div class="mute" style="font-size:13px">แชร์โค้ดของคุณหรือกรอกโค้ดเพื่อน แล้วมาติวด้วยกัน</div></div>${addBtn}</div></div>`;
  return `<div class="card frhome ${compact ? 'compact' : ''}"><div class="row between" style="gap:8px"><h2 style="margin:0">👥 ${compact ? 'เพื่อนที่ออนไลน์' : 'เพื่อนของฉัน'} ${act ? `<span class="tag live">🔥 ${act} คนกำลังอ่านอยู่</span>` : ''}</h2>${addBtn}</div><div class="frrow">${list.map(frTile).join('')}</div></div>`;
}
function friendsTab() {
  if (!socOn()) return `<div class="card"><h2>👥 เพื่อน</h2><p>ระบบเพื่อนยังไม่เปิดให้ใช้งาน — กำลังเตรียมเซิร์ฟเวอร์อยู่ เร็ว ๆ นี้จะเพิ่มเพื่อนด้วยโค้ดและดูตัวละครของกันและกันได้</p></div>`;
  if (!socEnabled()) return `<div class="card"><h2>👥 เพิ่มเพื่อนและดูตัวละครเพื่อน</h2>
    <p>เปิดใช้งานแล้วคุณจะได้ <b>โค้ดเพื่อน 6 ตัวอักษร</b> ให้เพื่อนกรอกเพื่อเป็นเพื่อนกัน และดูตัวละคร ชั้นปี และแต้มของกันได้</p>
    <ul class="coinparts"><li><span>ข้อมูลที่ส่งขึ้นเซิร์ฟเวอร์</span><b style="color:var(--ink)">ชื่อเล่น · มหาวิทยาลัยที่เลือก · ลุคตัวละคร · แต้มและชั้นปี · สถานะว่ากำลังจับเวลา/อ่านบทเรียนไหน/ทำข้อสอบอยู่ · เวลาอ่านรวมต่อวัน/สัปดาห์/เดือน (ปิดสถานะได้)</b></li><li><span>ไม่ส่ง</span><b style="color:var(--ink)">ชื่อจริง · อีเมล · ผลสอบ · สถิติโจทย์</b></li></ul>
    <p class="mute" style="font-size:13px">ใช้บัญชีแบบไม่ระบุตัวตน (ไม่ต้องสมัคร) ใครมีโค้ดของคุณจะเห็นข้อมูลข้างต้นของคุณได้ จึงอย่าใส่ชื่อจริงเป็นชื่อเล่น และสร้างโค้ดใหม่หรือลบข้อมูลออนไลน์ได้ทุกเมื่อ ถ้าล้างข้อมูลเบราว์เซอร์ บัญชีนี้จะเข้าไม่ได้อีก</p>
    <button class="pri" data-a="socEnable">เปิดใช้งานระบบเพื่อน</button></div>`;
  const code = SOC.me && SOC.me.code;
  return `<div class="card socme"><div class="mute">โค้ดเพื่อนของฉัน</div><div class="socode" aria-live="polite">${code ? esc(code) : (SOC.err ? '—' : 'กำลังสร้าง…')}</div>
    <div class="row" style="gap:8px;flex-wrap:wrap"><button data-a="socCopy" ${code ? '' : 'disabled'}>📋 คัดลอกโค้ด</button><button data-a="socShare" ${code ? '' : 'disabled'}>🔗 แชร์ลิงก์</button><button data-a="socRotate" ${code ? '' : 'disabled'}>🔄 สร้างโค้ดใหม่</button></div>
    ${SOC.err ? `<div class="socerr">⚠️ ${esc(SOC.err)}</div>` : SOC.last ? `<div class="mute" style="font-size:12px">ซิงก์โปรไฟล์ล่าสุด ${socAgo(SOC.last)}</div>` : ''}</div>
  <div class="card"><div class="row between" style="gap:10px;flex-wrap:nowrap"><div style="min-width:0"><b>${socSt().pr === undefined ? '🆕 ' : ''}${socSt().pr ? '👁' : '🙈'} แสดงสถานะ "กำลังทำอะไรอยู่"</b><div class="mute" style="font-size:13px">เพื่อนจะเห็นว่าคุณกำลังจับเวลา อ่านบทเรียน (เห็นชื่อบท) หรือทำข้อสอบ และเห็นเวลาอ่านรวมของคุณในอันดับ — ไม่เห็นคะแนน คำตอบ หรือรายวิชา ${socSt().pr ? 'ตอนนี้: เปิดอยู่' : 'ตอนนี้: ปิดอยู่'}</div></div><button class="${socSt().pr ? '' : 'pri'}" data-a="socPres">${socSt().pr ? 'ปิด' : 'เปิด'}</button></div></div>
  ${typeof yptGroupCard === 'function' ? yptGroupCard() : ''}
  <div class="card"><h2>เพิ่มเพื่อน</h2><div class="row" style="flex-wrap:nowrap;gap:8px"><input id="socCode" maxlength="6" placeholder="กรอกโค้ด 6 ตัว" autocomplete="off" autocapitalize="characters" spellcheck="false" style="flex:1;min-width:0;text-transform:uppercase;letter-spacing:.2em;font-weight:700"><button class="pri" data-a="socAdd">เพิ่ม</button></div></div>
  <div class="row between" style="margin:6px 2px"><h2 style="margin:0">เพื่อนของฉัน ${SOC.friends.length ? `<span class="tag">${SOC.friends.length}</span>` : ''}</h2><button class="chip" data-a="socRefresh">${SOC.loading ? 'กำลังโหลด…' : '↻ รีเฟรช'}</button></div>
  ${SOC.friends.length ? `<div class="frgrid">${SOC.friends.map(friendCard).join('')}</div>` : `<div class="card"><p class="mute" style="margin:0">${SOC.loading ? 'กำลังโหลดรายชื่อเพื่อน…' : 'ยังไม่มีเพื่อน — แชร์โค้ดของคุณให้เพื่อน หรือกรอกโค้ดของเพื่อนด้านบน'}</p></div>`}
  <div class="row" style="justify-content:center;margin:14px 0"><button class="chip" data-a="socOff" style="opacity:.75">🗑 ลบข้อมูลออนไลน์ของฉัน</button></div>`;
}
function socSheet(f) {
  let el = document.getElementById('socsheet'); if (el) el.remove(); if (!f) return;
  const cfg = avClean(f.avatar), nm = String(f.nick || '').slice(0, 12);
  el = document.createElement('div'); el.id = 'socsheet'; el.className = 'omr'; el.setAttribute('data-a', 'socClose');
  el.innerHTML = `<div class="socview"><div class="avbig" style="margin:0 auto">${avatarSvg(cfg, { w: 230, nick: nm, uni: f.uni })}</div><h2 style="margin:8px 0 2px;text-align:center">${esc(nm)}</h2><div class="mute" style="text-align:center">${esc(String(f.title || '').slice(0, 30))} · ⭐ ${(+f.xp || 0).toLocaleString('th-TH')} แต้ม</div>
    <div class="mute" style="text-align:center;margin-top:4px" data-fst="${esc(f.id)}">${statusHtml(f.id, f)}</div>
    <div class="row" style="justify-content:center;margin-top:12px;gap:8px"><button data-a="socClose">ปิด</button><button data-a="socRemove" data-v="${esc(f.id)}">ลบเพื่อน</button></div></div>`;
  document.body.appendChild(el);
}
const SOC_ACT = {
  async socEnable() {
    if (!confirm('เปิดระบบเพื่อน?\nจะสร้างบัญชีแบบไม่ระบุตัวตน และอัปโหลดชื่อเล่น มหาวิทยาลัย ลุคตัวละคร แต้ม ชั้นปี\nสถานะว่ากำลังจับเวลา/อ่านบทไหน/ทำข้อสอบอยู่ และเวลาอ่านรวมต่อวัน/สัปดาห์/เดือน ให้เพื่อนที่มีโค้ดของคุณและสมาชิกกลุ่มเห็น (ปิดสถานะได้ภายหลัง)')) return;
    const st = socSt(); st.on = true; st.pr = true; store.set('soc', st); SOC.err = ''; SOC.sent = ''; render(true); await socLoadFriends(); socPush(true); if (typeof ypLoadGroups === 'function') ypLoadGroups(true);
    const pend = store.get('socPending', ''); if (pend) { store.set('socPending', ''); setTimeout(() => { const i = document.getElementById('socCode'); if (i) i.value = pend; }, 300); }
  },
  async socOff() {
    if (!confirm('ลบโปรไฟล์และรายชื่อเพื่อนของคุณออกจากเซิร์ฟเวอร์ และปิดระบบเพื่อน?\n(ย้อนกลับไม่ได้ แต่เปิดใหม่และสร้างโค้ดใหม่ได้)')) return;
    try { if (socSt().s) await socRpc('delete_me'); } catch (e) { toast('ลบไม่สำเร็จ: ' + e.message); return; }
    store.set('soc', {}); SOC.friends = []; SOC.me = null; SOC.sent = ''; SOC.err = ''; SOC.flast = 0; PRES.st = {}; PRES.sig = ''; render(true); toast('ลบข้อมูลออนไลน์เรียบร้อยแล้ว');
  },
  socRefresh() { SOC.sent = ''; socLoadFriends(); socPoll(true); },
  async socPres() {
    const st = socSt(), on = st.pr !== true; st.pr = on; store.set('soc', st); PRES.sig = ''; render(true);
    if (on) { await socSync(); socPush(true); toast('เพื่อนจะเห็นสถานะของคุณแล้ว'); }
    else { try { await socRpc('set_presence', { p_act: 'off', p_label: '', p_secs: 0 }); } catch { /* ลองใหม่ภายหลัง */ } toast('ซ่อนสถานะแล้ว เพื่อนจะไม่เห็นว่าคุณกำลังทำอะไร'); }
  },
  async socAdd(v) {
    const inp = document.getElementById('socCode'), code = String(v && v.length === 6 ? v : (inp ? inp.value : '')).trim().toUpperCase(); if (!code) { toast('กรอกโค้ดเพื่อนก่อน'); return; }
    try { await socSync(); const f = await socRpc('add_friend', { p_code: code }); const r = Array.isArray(f) ? f[0] : f; toast('🎉 เพิ่ม ' + (r && r.nick || 'เพื่อน') + ' แล้ว'); if (inp) inp.value = ''; await socLoadFriends(); }
    catch (e) { toast('เพิ่มเพื่อนไม่สำเร็จ: ' + e.message); }
  },
  async socRemove(id) { if (!confirm('ลบเพื่อนคนนี้? (จะไม่เห็นกันอีก)')) return; try { await socRpc('remove_friend', { p_id: id }); socSheet(null); await socLoadFriends(); toast('ลบเพื่อนแล้ว'); } catch (e) { toast('ลบไม่สำเร็จ: ' + e.message); } },
  async socRotate() { if (!confirm('สร้างโค้ดใหม่? โค้ดเก่าจะใช้เพิ่มเพื่อนไม่ได้อีก (เพื่อนเดิมยังอยู่)')) return; try { const c = await socRpc('rotate_code'); if (SOC.me) SOC.me.code = c; render(true); toast('สร้างโค้ดใหม่แล้ว'); } catch (e) { toast('ไม่สำเร็จ: ' + e.message); } },
  async socCopy() { const c = SOC.me && SOC.me.code; if (!c) return; try { await navigator.clipboard.writeText(c); toast('คัดลอกโค้ด ' + c + ' แล้ว'); } catch { prompt('คัดลอกโค้ดนี้', c); } },
  async socShare() { const c = SOC.me && SOC.me.code; if (!c) return; const url = socLink(c); try { if (navigator.share) await navigator.share({ title: 'เพิ่มเพื่อนใน SIXENT', text: 'มาเป็นเพื่อนกันใน SIXENT ติวเข้าวิศวะ', url }); else { await navigator.clipboard.writeText(url); toast('คัดลอกลิงก์เพิ่มเพื่อนแล้ว'); } } catch { /* ผู้ใช้ยกเลิกการแชร์ */ } },
  socView(id) { const f = SOC.friends.find(x => x.id === id); if (f) socSheet(f); },
  socClose() { socSheet(null); }
};
/* ลิงก์เชิญ ?add=CODE : เปิดแอปแล้วพาไปหน้าเพื่อนพร้อมเติมโค้ดให้ (ต้องเปิดใช้งานระบบเพื่อนก่อนจึงเพิ่มได้) */
function socDeepLink() {
  const m = /[?&]add=([A-Za-z0-9]{6})\b/.exec(location.search); if (!m || !socOn()) return;
  history.replaceState(null, '', location.pathname + location.hash); const code = m[1].toUpperCase();
  ME.tab = 'friends'; location.hash = '#/me'; render(true);
  if (!socEnabled()) { toast('เปิดระบบเพื่อนก่อน แล้วกรอกโค้ด ' + code + ' เพื่อเพิ่มเพื่อน'); store.set('socPending', code); return; }
  setTimeout(() => { const i = document.getElementById('socCode'); if (i) i.value = code; if (confirm('เพิ่มเพื่อนด้วยโค้ด ' + code + ' ?')) SOC_ACT.socAdd(code); }, 400);
}
setTimeout(() => { socDeepLink(); if (socEnabled()) socSync(); }, 1200);
