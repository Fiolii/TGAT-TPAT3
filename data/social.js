// ระบบเพื่อน: เพิ่มเพื่อนด้วยโค้ด + ดูตัวละครของเพื่อน (ใช้ Supabase ผ่าน fetch ตรง ๆ ไม่พึ่งไลบรารีภายนอก)
// ผู้ใช้ต้องกด "เปิดใช้งาน" เอง จึงจะสร้างบัญชีแบบไม่ระบุตัวตนและอัปโหลดโปรไฟล์ (ชื่อเล่น มหาวิทยาลัย ลุคตัวละคร แต้ม ชั้นปี) — ไม่ส่งสถิติโจทย์หรือข้อมูลอื่น
// โค้ดเซิร์ฟเวอร์และ RLS อยู่ใน supabase/schema.sql ; ค่าเชื่อมต่ออยู่ใน data/social_cfg.js

const SOC = { friends: [], loading: false, err: '', me: null, last: 0, sent: '', busy: false };
const socOn = () => !!(typeof SOCIAL_CFG !== 'undefined' && SOCIAL_CFG.url && SOCIAL_CFG.key);
const socSt = () => store.get('soc', {});            // {on:true, s:{access,refresh,exp,uid}, code}
const socEnabled = () => socOn() && !!socSt().on;

/* ---------- ตรวจข้อมูลตัวละครที่มาจากเพื่อน (ห้ามเชื่อ: ค่าสีและชื่อไอเท็มถูกแทรกลง SVG) ---------- */
const AV_HAIRS = ['short', 'side', 'long', 'bob', 'ponytail', 'bun', 'curly', 'buzz'];
function avClean(c) {
  c = c && typeof c === 'object' ? c : {}; const o = Object.assign({}, AVDEF), col = v => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v) ? v : null;
  if (['m', 'f', 'n'].includes(c.g)) o.g = c.g; if (AVSKIN[c.skin]) o.skin = c.skin; if (AV_HAIRS.includes(c.hair)) o.hair = c.hair;
  o.hc = col(c.hc) || o.hc; o.tc = col(c.tc) || o.tc; o.bc = col(c.bc) || o.bc;
  if (['trouser', 'skirt', 'shorts'].includes(c.bottom)) o.bottom = c.bottom; if (['sneaker', 'loafer'].includes(c.shoes)) o.shoes = c.shoes;
  AV_SLOTS.forEach(s => { if (c[s] != null && typeof c[s] === 'string' && AVBY[s + ':' + c[s]]) o[s] = c[s]; });
  return o;
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
async function socToken() {
  const st = socSt(); let s = st.s;
  if (!s) { socSave(await socRaw('/auth/v1/signup', 'POST', {})); return socSt().s.access; }   // บัญชีแบบไม่ระบุตัวตน
  if (Date.now() > s.exp - 60000) { try { socSave(await socRaw('/auth/v1/token?grant_type=refresh_token', 'POST', { refresh_token: s.refresh })); } catch (e) { if (e.status >= 400 && e.status < 500) { delete st.s; store.set('soc', st); return socToken(); } throw e; } }
  return socSt().s.access;
}
async function socRpc(fn, args) {
  try { return await socRaw('/rest/v1/rpc/' + fn, 'POST', args || {}, await socToken()); }
  catch (e) { if (e.status === 401) { const st = socSt(); if (st.s) { st.s.exp = 0; store.set('soc', st); } return socRaw('/rest/v1/rpc/' + fn, 'POST', args || {}, await socToken()); } throw e; }
}

/* ---------- ซิงก์โปรไฟล์ของฉัน ---------- */
function socPayload() {
  const cfg = avCfg(), keep = {}; ['g', 'skin', 'hair', 'hc', 'top', 'tc', 'outer', 'head', 'face', 'neck', 'hand', 'bottom', 'bc', 'shoes', 'bg'].forEach(k => keep[k] = cfg[k]);
  return { p_nick: String(store.get('nick', 'น้องวิศวะ')).slice(0, 12), p_uni: curThemeId(), p_avatar: keep, p_xp: xpNow(), p_title: shirtInfo().title };
}
async function socSync(force) {
  if (!socEnabled() || SOC.busy) return; const p = socPayload(), key = JSON.stringify(p);
  if (!force && key === SOC.sent) return; SOC.busy = true;
  try { SOC.me = await socRpc('upsert_profile', p); SOC.sent = key; SOC.last = Date.now(); SOC.err = ''; }
  catch (e) { SOC.err = e.message; }
  finally { SOC.busy = false; if (ME.tab === 'friends' && location.hash === '#/me') render(true); }
}
async function socLoadFriends() {
  if (!socEnabled()) return; SOC.loading = true; if (ME.tab === 'friends') render(true);
  try { await socSync(); SOC.friends = (await socRpc('my_friends')) || []; SOC.err = ''; }
  catch (e) { SOC.err = e.message; }
  SOC.loading = false; if (ME.tab === 'friends' && location.hash === '#/me') render(true);
}
setInterval(() => { if (socEnabled() && document.visibilityState === 'visible') socSync(); }, 20000);

/* ---------- หน้าจอ ---------- */
const socAgo = t => { const m = Math.max(0, Math.round((Date.now() - new Date(t).getTime()) / 60000)); return m < 2 ? 'เมื่อกี้' : m < 60 ? m + ' นาทีที่แล้ว' : m < 1440 ? Math.round(m / 60) + ' ชม.ที่แล้ว' : Math.round(m / 1440) + ' วันที่แล้ว'; };
const socLink = code => location.origin + location.pathname + '?add=' + code;
function friendCard(f) {
  const cfg = avClean(f.avatar), nm = String(f.nick || '').slice(0, 12), un = (typeof THEMES !== 'undefined' && THEMES.some(t => t.id === f.uni)) ? uniShort(f.uni) : 'SIXENT';
  return `<div class="frc"><button class="frav" data-a="socView" data-v="${esc(f.id)}" aria-label="ดูตัวละครของ ${esc(nm)}">${avatarSvg(cfg, { view: 'half', w: 104, nick: nm, uni: f.uni })}</button>
    <div class="frin"><b>${esc(nm)}</b><span class="tag">${esc(String(f.title || '').slice(0, 30))}</span><div class="mute" style="font-size:12.5px">🎓 ${esc(un)} · ⭐ ${(+f.xp || 0).toLocaleString('th-TH')} แต้ม</div><div class="mute" style="font-size:12px">ใช้งานล่าสุด ${socAgo(f.updated_at)}</div></div></div>`;
}
function friendsTab() {
  if (!socOn()) return `<div class="card"><h2>👥 เพื่อน</h2><p>ระบบเพื่อนยังไม่เปิดให้ใช้งาน — กำลังเตรียมเซิร์ฟเวอร์อยู่ เร็ว ๆ นี้จะเพิ่มเพื่อนด้วยโค้ดและดูตัวละครของกันและกันได้</p></div>`;
  if (!socEnabled()) return `<div class="card"><h2>👥 เพิ่มเพื่อนและดูตัวละครเพื่อน</h2>
    <p>เปิดใช้งานแล้วคุณจะได้ <b>โค้ดเพื่อน 6 ตัวอักษร</b> ให้เพื่อนกรอกเพื่อเป็นเพื่อนกัน และดูตัวละคร ชั้นปี และแต้มของกันได้</p>
    <ul class="coinparts"><li><span>ข้อมูลที่ส่งขึ้นเซิร์ฟเวอร์</span><b style="color:var(--ink)">ชื่อเล่น · มหาวิทยาลัยที่เลือก · ลุคตัวละคร · แต้มและชั้นปี</b></li><li><span>ไม่ส่ง</span><b style="color:var(--ink)">ชื่อจริง · อีเมล · ผลสอบ · สถิติโจทย์</b></li></ul>
    <p class="mute" style="font-size:13px">ใช้บัญชีแบบไม่ระบุตัวตน (ไม่ต้องสมัคร) ใครมีโค้ดของคุณจะเห็นข้อมูลข้างต้นของคุณได้ จึงอย่าใส่ชื่อจริงเป็นชื่อเล่น และสร้างโค้ดใหม่หรือลบข้อมูลออนไลน์ได้ทุกเมื่อ ถ้าล้างข้อมูลเบราว์เซอร์ บัญชีนี้จะเข้าไม่ได้อีก</p>
    <button class="pri" data-a="socEnable">เปิดใช้งานระบบเพื่อน</button></div>`;
  const code = SOC.me && SOC.me.code;
  return `<div class="card socme"><div class="mute">โค้ดเพื่อนของฉัน</div><div class="socode" aria-live="polite">${code ? esc(code) : (SOC.err ? '—' : 'กำลังสร้าง…')}</div>
    <div class="row" style="gap:8px;flex-wrap:wrap"><button data-a="socCopy" ${code ? '' : 'disabled'}>📋 คัดลอกโค้ด</button><button data-a="socShare" ${code ? '' : 'disabled'}>🔗 แชร์ลิงก์</button><button data-a="socRotate" ${code ? '' : 'disabled'}>🔄 สร้างโค้ดใหม่</button></div>
    ${SOC.err ? `<div class="socerr">⚠️ ${esc(SOC.err)}</div>` : SOC.last ? `<div class="mute" style="font-size:12px">ซิงก์โปรไฟล์ล่าสุด ${socAgo(SOC.last)}</div>` : ''}</div>
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
    <div class="row" style="justify-content:center;margin-top:12px;gap:8px"><button data-a="socClose">ปิด</button><button data-a="socRemove" data-v="${esc(f.id)}">ลบเพื่อน</button></div></div>`;
  document.body.appendChild(el);
}
const SOC_ACT = {
  async socEnable() {
    if (!confirm('เปิดระบบเพื่อน?\nจะสร้างบัญชีแบบไม่ระบุตัวตน และอัปโหลดชื่อเล่น มหาวิทยาลัย ลุคตัวละคร แต้ม และชั้นปี ให้เพื่อนที่มีโค้ดของคุณเห็น')) return;
    const st = socSt(); st.on = true; store.set('soc', st); SOC.err = ''; SOC.sent = ''; render(true); await socLoadFriends();
    const pend = store.get('socPending', ''); if (pend) { store.set('socPending', ''); setTimeout(() => { const i = document.getElementById('socCode'); if (i) i.value = pend; }, 300); }
  },
  async socOff() {
    if (!confirm('ลบโปรไฟล์และรายชื่อเพื่อนของคุณออกจากเซิร์ฟเวอร์ และปิดระบบเพื่อน?\n(ย้อนกลับไม่ได้ แต่เปิดใหม่และสร้างโค้ดใหม่ได้)')) return;
    try { if (socSt().s) await socRpc('delete_me'); } catch (e) { toast('ลบไม่สำเร็จ: ' + e.message); return; }
    store.set('soc', {}); SOC.friends = []; SOC.me = null; SOC.sent = ''; SOC.err = ''; render(true); toast('ลบข้อมูลออนไลน์เรียบร้อยแล้ว');
  },
  socRefresh() { SOC.sent = ''; socLoadFriends(); },
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
