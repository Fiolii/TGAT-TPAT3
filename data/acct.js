// บัญชีผู้ใช้ (username + password) และซิงก์ข้อมูลข้ามเครื่อง — ใช้ Supabase ผ่าน RPC (โค้ดเซิร์ฟเวอร์: supabase/accounts.sql)
// ไม่ผูกกับระบบเพื่อน (social.js) และไม่ใช้อีเมล · ถ้าเซิร์ฟเวอร์ยังไม่ได้ติดตั้ง SQL จะแจ้งผู้ใช้และแอปทำงานแบบในเครื่องตามเดิม
// ข้อมูลที่ซิงก์: เฉพาะคีย์ใน ACCT_KEYS (สถิติ ความคืบหน้า โปรไฟล์ ร้านค้า ฯลฯ) · ไม่ซิงก์ภาษา/ธีมหน้าจอ/สถานะระบบเพื่อน/รหัสแอดมิน
// การรวมข้อมูลสองเครื่อง: ประวัติ (attempts/studies/mocks) = รวมแบบ union · อ็อบเจ็กต์ = รวมทีละคีย์ · ค่าอื่นและอาร์เรย์ที่ลบได้ = ฉบับที่แก้ล่าสุดชนะ

const ACCT_KEYS = ['nick', 'theme', 'branch', 'profile', 'av', 'own', 'coins', 'coinBonus', 'coinDaily', 'xpBonus', 'ach', 'dlog', 'daily', 'dailyGoal', 'allPatches', 'plans', 'plan', 'planPrev', 'eng', 'egg', 'readlog', 'goal', 'examDate', 'subs', 'studies', 'records', 'mocks', 'marks', 'custom', 'attempts'];
const ACCT_UNION = ['attempts', 'studies', 'mocks'];
const ACCT_LS_ST = 'sx_acct', ACCT_LS_T = 'sx_acct_t';
const ACCT = { tab: 'login', mode: '', msg: '', err: '', busy: false, code: null, syncing: false, timer: 0, dirty: false, user: '' };

const acctRead = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } };
const acctWrite = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } };
const acctSt = () => acctRead(ACCT_LS_ST, {});        // {token, username, version, last, reset}
const acctTs = () => acctRead(ACCT_LS_T, {});         // เวลาที่แก้ล่าสุดของแต่ละคีย์ (ใช้ตัดสินเมื่อสองเครื่องแก้ค่าเดียวกัน)
const acctOn = () => typeof SOCIAL_CFG !== 'undefined' && !!SOCIAL_CFG.url && !!SOCIAL_CFG.key;
const acctIn = () => !!acctSt().token;
const acctObj = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const acctCanon = x => Array.isArray(x) ? '[' + x.map(acctCanon).join(',') + ']' : acctObj(x) ? '{' + Object.keys(x).sort().map(k => JSON.stringify(k) + ':' + acctCanon(x[k])).join(',') + '}' : JSON.stringify(x === undefined ? null : x);   // jsonb สลับลำดับคีย์ จึงเทียบแบบเรียงคีย์

/* ---------- เรียกเซิร์ฟเวอร์ ---------- */
const ACCT_ERR = {
  invalid_username: 'ชื่อผู้ใช้ต้องเป็นตัวอักษร a–z ตัวเลข 0–9 หรือ _ ยาว 3–20 ตัว',
  weak_password: 'รหัสผ่านต้องยาว 8–72 ตัวอักษร',
  username_taken: 'ชื่อผู้ใช้นี้ถูกใช้แล้ว ลองชื่ออื่น',
  bad_credentials: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
  bad_session: 'เซสชันหมดอายุหรือถูกยกเลิก กรุณาเข้าสู่ระบบใหม่',
  too_large: 'ข้อมูลใหญ่เกินกำหนด (4 MB) ลองล้างข้อมูลเก่าก่อน',
  bad_data: 'ข้อมูลไม่ถูกต้อง',
  conflict: 'ข้อมูลถูกแก้พร้อมกันจากอีกเครื่อง ลองซิงก์อีกครั้ง',
  pw_mismatch: 'รหัสผ่านสองช่องไม่ตรงกัน',
  offline: 'เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ (ตรวจอินเทอร์เน็ต)',
  nosetup: 'เซิร์ฟเวอร์ยังไม่ได้ติดตั้งระบบบัญชี (ต้องรันไฟล์ supabase/accounts.sql ใน Supabase ก่อน)',
};
const acctFail = (code, extra) => { const e = new Error(code === 'locked' ? 'ใส่ผิดหลายครั้ง บัญชีถูกล็อกชั่วคราว ลองใหม่ในอีก ' + ((extra && extra.minutes) || 15) + ' นาที' : (ACCT_ERR[code] || 'เกิดข้อผิดพลาด (' + code + ')')); e.code = code; return e; };
async function acctRpc(fn, args) {
  let r; try { r = await fetch(SOCIAL_CFG.url.replace(/\/$/, '') + '/rest/v1/rpc/' + fn, { method: 'POST', headers: { apikey: SOCIAL_CFG.key, 'Content-Type': 'application/json' }, body: JSON.stringify(args) }); } catch { throw acctFail('offline'); }
  let j = null; try { j = await r.json(); } catch { /* ไม่มีเนื้อหา */ }
  if (!r.ok) { if (r.status === 404 || (j && /Could not find the function|PGRST202/.test(JSON.stringify(j)))) throw acctFail('nosetup'); throw acctFail('server', j); }
  if (j && j.ok === false) throw acctFail(j.error, j);
  return j;
}
const acctDevice = () => { const u = navigator.userAgent || '', os = /Windows/.test(u) ? 'Windows' : /Android/.test(u) ? 'Android' : /iPhone|iPad|iOS/.test(u) ? 'iOS' : /Mac/.test(u) ? 'Mac' : /Linux/.test(u) ? 'Linux' : 'อุปกรณ์', br = /Edg\//.test(u) ? 'Edge' : /Chrome\//.test(u) ? 'Chrome' : /Firefox\//.test(u) ? 'Firefox' : /Safari\//.test(u) ? 'Safari' : ''; return (os + ' ' + br).trim(); };

/* ---------- รวมข้อมูล ---------- */
function acctMergeVal(a, b, ta, tb) {
  if (a === undefined) return b; if (b === undefined) return a;
  if (acctCanon(a) === acctCanon(b)) return a;
  if (acctObj(a) && acctObj(b)) { const o = {}; for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) o[k] = acctMergeVal(a[k], b[k], ta, tb); return o; }
  return ta >= tb ? a : b;   // ค่าเดี่ยว/อาร์เรย์ซ้อน: ฉบับที่แก้ล่าสุดชนะ (เสมอ = ใช้ของเครื่องนี้)
}
function acctMerge(key, lv, lt, rv, rt, reset) {
  if (ACCT_UNION.includes(key) && (lv == null || Array.isArray(lv)) && (rv == null || Array.isArray(rv))) {
    const seen = new Set(), out = [];
    for (const x of [...(rv || []), ...(lv || [])]) { if (reset && x && typeof x.ts === 'number' && x.ts < reset) continue; const j = acctCanon(x); if (!seen.has(j)) { seen.add(j); out.push(x); } }
    return out.sort((a, b) => ((a && a.ts) || 0) - ((b && b.ts) || 0));
  }
  return acctMergeVal(lv, rv, lt, rt);
}
function acctLocalDoc() {
  const t = acctTs(), doc = {};
  for (const k of ACCT_KEYS) { let raw = null; try { raw = localStorage.getItem('sx_' + k); } catch { } if (raw == null) continue; try { doc[k] = { v: JSON.parse(raw), t: t[k] || 0 }; } catch { } }
  return doc;
}

/* ---------- ซิงก์ ---------- */
let ACCT_RELOADED = 0;
function acctClear() { const st = acctSt(); delete st.token; delete st.username; delete st.version; acctWrite(ACCT_LS_ST, st); }
async function acctSync(manual) {
  if (!acctOn() || !acctIn() || ACCT.syncing) return;
  if (typeof E !== 'undefined' && E && !E.done) { ACCT.dirty = true; return; }   // ไม่รวมข้อมูลกลางการทำข้อสอบ
  ACCT.syncing = true; ACCT.err = ''; if (manual) { ACCT.msg = ''; acctRefresh(); }
  let changedAny = false;
  try {
    for (let n = 0; n < 4; n++) {
      const st = acctSt(), pulled = await acctRpc('acct_pull', { p_token: st.token });
      const remote = pulled.data && acctObj(pulled.data) ? pulled.data : {}, local = acctLocalDoc(), ts = acctTs();
      const reset = Math.max(+remote._reset || 0, +st.reset || 0), merged = {}, changed = [];
      for (const k of ACCT_KEYS) {
        const l = local[k], r = remote[k]; if (!l && !(r && 'v' in r)) continue;
        const v = acctMerge(k, l && l.v, l ? l.t : 0, r && r.v, r && r.t ? r.t : 0, reset);
        merged[k] = { v, t: Math.max(l ? l.t : 0, r && r.t ? r.t : 0) };
        if (!l || acctCanon(l.v) !== acctCanon(v)) changed.push(k);
      }
      changed.forEach(k => { try { localStorage.setItem('sx_' + k, JSON.stringify(merged[k].v)); } catch { } });
      const nts = Object.assign({}, ts); Object.keys(merged).forEach(k => nts[k] = merged[k].t); acctWrite(ACCT_LS_T, nts);
      if (changed.length) changedAny = true;
      const body = Object.assign({}, remote, merged); if (reset) body._reset = reset;
      const needPush = Object.keys(merged).some(k => !remote[k] || acctCanon(remote[k].v) !== acctCanon(merged[k].v) || remote[k].t !== merged[k].t) || (reset && remote._reset !== reset);
      if (!needPush) { Object.assign(st, { version: pulled.version, last: Date.now(), reset: reset || st.reset }); acctWrite(ACCT_LS_ST, st); break; }
      let res; try { res = await acctRpc('acct_push', { p_token: st.token, p_data: body, p_expect: pulled.version }); } catch (e) { if (e.code === 'conflict') continue; throw e; }
      Object.assign(st, { version: res.version, last: Date.now(), reset: reset || st.reset }); acctWrite(ACCT_LS_ST, st); break;
    }
    ACCT.dirty = false;
  } catch (e) {
    if (e.code === 'bad_session') { acctClear(); ACCT.err = ACCT_ERR.bad_session; } else ACCT.err = e.message;
  }
  ACCT.syncing = false;
  if (changedAny && Date.now() - ACCT_RELOADED > 15000) { ACCT_RELOADED = Date.now(); try { sessionStorage.setItem('sx_acct_rl', String(ACCT_RELOADED)); } catch { } location.reload(); return; }   // โหลดข้อมูลที่รวมแล้วเข้าหน้าจอ
  if (manual && !ACCT.err) ACCT.msg = 'ซิงก์เรียบร้อย ✓';
  acctRefresh();
}
function acctSchedule() { if (!acctIn()) return; clearTimeout(ACCT.timer); ACCT.timer = setTimeout(() => acctSync(), 5000); }
function acctRefresh() { if (/^#\/me/.test(location.hash) && typeof render === 'function' && !document.querySelector('#ac_u:focus,#ac_p:focus,#ac_p2:focus,#ac_rc:focus,#ac_np:focus,#ac_np2:focus,#ac_op:focus,#ac_dp:focus')) render(true); }

// ครอบ store.set เพื่อจดว่าคีย์ใดถูกแก้เมื่อไร (ใช้ตัดสินเวลาสองเครื่องแก้ค่าเดียวกัน) และตั้งเวลาซิงก์
function acctHook() {
  if (typeof store === 'undefined' || store.__acct) return; store.__acct = true;
  const orig = store.set.bind(store);
  store.set = (k, v) => {
    const tracked = ACCT_KEYS.includes(k); let prev = null; if (tracked) { try { prev = localStorage.getItem('sx_' + k); } catch { } }
    orig(k, v);
    if (!tracked) return; let now = null; try { now = localStorage.getItem('sx_' + k); } catch { }
    if (now === prev) return;
    const t = acctTs(); t[k] = Date.now(); acctWrite(ACCT_LS_T, t);
    if (ACCT_UNION.includes(k)) { try { const p = JSON.parse(prev || '[]'), n = JSON.parse(now || '[]'); if (Array.isArray(p) && p.length && Array.isArray(n) && !n.length) { const st = acctSt(); st.reset = Date.now(); acctWrite(ACCT_LS_ST, st); } } catch { } }   // ล้างสถิติ → เครื่องอื่นต้องไม่ดึงประวัติเก่ากลับมา
    acctSchedule();
  };
}

/* ---------- การกระทำของผู้ใช้ ---------- */
const acctVal = id => { const e = document.getElementById(id); return e ? e.value : ''; };
async function acctSession(r, st0) { acctWrite(ACCT_LS_ST, Object.assign({}, acctSt(), { token: r.token, username: r.username, version: 0, last: 0 })); const t = acctTs(); if (st0 === 'new') { ACCT_KEYS.forEach(k => { if (localStorage.getItem('sx_' + k) != null && !t[k]) t[k] = Date.now(); }); acctWrite(ACCT_LS_T, t); } }
const ACCT_ACT = {
  acctTab(v) { ACCT.tab = v; ACCT.err = ACCT.msg = ''; ACCT.mode = ''; render(true); },
  acctMode(v) { ACCT.mode = ACCT.mode === v ? '' : v; ACCT.err = ACCT.msg = ''; render(true); },
  async acctSubmit() {
    if (ACCT.busy) return; ACCT.err = ACCT.msg = ''; const tab = ACCT.tab, u = acctVal('ac_u').trim(), p = acctVal('ac_p'), p2 = acctVal('ac_p2'), rc = acctVal('ac_rc'); ACCT.user = u; ACCT.busy = true; render(true);
    try {
      if (tab === 'register') {
        if (p !== p2) throw acctFail('pw_mismatch');
        const r = await acctRpc('acct_register', { p_username: u, p_password: p, p_device: acctDevice() }); await acctSession(r, 'new'); ACCT.code = r.recovery; ACCT.msg = '';
        await acctSync();
      } else if (tab === 'recover') {
        const r = await acctRpc('acct_recover', { p_username: u, p_code: rc, p_new: p, p_device: acctDevice() }); await acctSession(r); ACCT.code = r.recovery; ACCT.msg = '';
        await acctSync();
      } else {
        const r = await acctRpc('acct_login', { p_username: u, p_password: p, p_device: acctDevice() }); await acctSession(r); ACCT.msg = 'เข้าสู่ระบบแล้ว';
        await acctSync();
      }
    } catch (e) { ACCT.err = e.message; }
    ACCT.busy = false; render(true);
  },
  acctCodeDone() { ACCT.code = null; ACCT.msg = 'สร้างบัญชีเรียบร้อย ข้อมูลในเครื่องนี้ถูกซิงก์ขึ้นบัญชีแล้ว'; render(true); },
  acctCopyCode() { if (ACCT.code && navigator.clipboard) navigator.clipboard.writeText(ACCT.code).then(() => { ACCT.msg = 'คัดลอกรหัสกู้คืนแล้ว'; render(true); }).catch(() => { }); },
  acctSyncNow() { acctSync(true); },
  async acctLogout() {
    if (!confirm('ออกจากระบบบนเครื่องนี้? ข้อมูลที่ซิงก์แล้วยังอยู่ในบัญชี และข้อมูลในเครื่องนี้จะยังอยู่')) return;
    try { await acctSync(); } catch { } try { await acctRpc('acct_logout', { p_token: acctSt().token }); } catch { }
    acctClear(); ACCT.msg = 'ออกจากระบบแล้ว'; ACCT.err = ''; render(true);
  },
  async acctChangePw() {
    ACCT.err = ACCT.msg = ''; const o = acctVal('ac_op'), n = acctVal('ac_np'); if (n !== acctVal('ac_np2')) { ACCT.err = 'รหัสผ่านใหม่สองช่องไม่ตรงกัน'; render(true); return; }
    ACCT.busy = true; render(true);
    try { await acctRpc('acct_change_password', { p_token: acctSt().token, p_old: o, p_new: n }); ACCT.msg = 'เปลี่ยนรหัสผ่านแล้ว (เครื่องอื่นต้องเข้าสู่ระบบใหม่)'; ACCT.mode = ''; } catch (e) { ACCT.err = e.message; }
    ACCT.busy = false; render(true);
  },
  async acctDelete() {
    const p = acctVal('ac_dp'); if (!confirm('ลบบัญชีนี้ถาวร? ข้อมูลที่ซิงก์ไว้บนเซิร์ฟเวอร์จะถูกลบทั้งหมด (ข้อมูลในเครื่องนี้ยังอยู่) ย้อนกลับไม่ได้')) return;
    ACCT.busy = true; render(true);
    try { await acctRpc('acct_delete', { p_token: acctSt().token, p_password: p }); acctClear(); ACCT.mode = ''; ACCT.msg = 'ลบบัญชีแล้ว'; } catch (e) { ACCT.err = e.message; }
    ACCT.busy = false; render(true);
  },
};

/* ---------- หน้าจอ (การ์ดในแท็บ "ฉัน → โปรไฟล์") ---------- */
function acctCard() {
  if (!acctOn()) return '';
  const st = acctSt(), e = typeof esc === 'function' ? esc : (s => String(s)), msg = (ACCT.err ? `<div class="ac-msg bad" role="alert">${e(ACCT.err)}</div>` : '') + (ACCT.msg ? `<div class="ac-msg ok" role="status">${e(ACCT.msg)}</div>` : '');
  if (ACCT.code) return `<div class="card ac-card"><h2>🔑 เก็บรหัสกู้คืนของคุณ</h2>
    <p class="mute" style="margin:0 0 8px">ระบบนี้ไม่ใช้อีเมล ถ้าลืมรหัสผ่าน <b>รหัสกู้คืนนี้คือทางเดียวที่จะเข้าบัญชีได้อีก</b> จดหรือแคปหน้าจอเก็บไว้ในที่ปลอดภัย รหัสนี้แสดงครั้งนี้ครั้งเดียว</p>
    <div class="ac-code" id="ac_code">${e(ACCT.code)}</div>${msg}
    <div class="row" style="gap:8px;margin-top:10px"><button data-a="acctCopyCode">📋 คัดลอกรหัส</button></div>
    <label class="ac-chk"><input type="checkbox" id="ac_saved" data-acct-saved><span>ฉันบันทึกรหัสกู้คืนไว้แล้ว</span></label>
    <button class="pri" data-a="acctCodeDone" id="ac_done" disabled style="margin-top:6px">ไปต่อ ›</button></div>`;
  if (st.token) {
    const last = st.last ? new Date(st.last).toLocaleString(typeof I18N_ON === 'function' && I18N_ON() ? 'en-GB' : 'th-TH', { dateStyle: 'short', timeStyle: 'short' }) : '—';
    return `<div class="card ac-card"><div class="row between" style="gap:10px"><h2 style="margin:0">☁ บัญชีของฉัน</h2><span class="tag ok">เข้าสู่ระบบแล้ว</span></div>
      <p style="margin:8px 0 2px;font-size:17px"><b>@${e(st.username)}</b></p>
      <p class="mute" style="margin:0 0 8px;font-size:13px">ซิงก์ล่าสุด ${e(last)} · เข้าใช้ได้จากหลายเครื่อง สถิติและความคืบหน้าจะรวมกันให้อัตโนมัติ</p>${msg}
      <div class="row" style="gap:8px;flex-wrap:wrap"><button class="pri" data-a="acctSyncNow" ${ACCT.syncing ? 'disabled' : ''}>${ACCT.syncing ? 'กำลังซิงก์…' : '🔄 ซิงก์ตอนนี้'}</button><button data-a="acctMode" data-v="pw">🔒 เปลี่ยนรหัสผ่าน</button><button data-a="acctLogout">ออกจากระบบ</button></div>
      ${ACCT.mode === 'pw' ? `<div class="ac-form"><label><span>รหัสผ่านเดิม</span><input type="password" id="ac_op" autocomplete="current-password"></label><label><span>รหัสผ่านใหม่ (8–72 ตัว)</span><input type="password" id="ac_np" autocomplete="new-password"></label><label><span>ยืนยันรหัสผ่านใหม่</span><input type="password" id="ac_np2" autocomplete="new-password"></label><button class="pri" data-a="acctChangePw" ${ACCT.busy ? 'disabled' : ''}>บันทึกรหัสผ่านใหม่</button></div>` : ''}
      <details class="ac-danger"><summary>ลบบัญชี</summary><div class="ac-form"><p class="mute" style="margin:0">ลบบัญชีและข้อมูลที่ซิงก์ไว้บนเซิร์ฟเวอร์ (ข้อมูลในเครื่องนี้ยังอยู่) ต้องใส่รหัสผ่านเพื่อยืนยัน</p><label><span>รหัสผ่าน</span><input type="password" id="ac_dp" autocomplete="current-password"></label><button class="bad" data-a="acctDelete" ${ACCT.busy ? 'disabled' : ''}>ลบบัญชีถาวร</button></div></details></div>`;
  }
  const t = ACCT.tab, tabs = [['login', 'เข้าสู่ระบบ'], ['register', 'สมัครใหม่']];
  return `<div class="card ac-card"><h2>☁ บัญชี — ใช้ได้หลายเครื่อง</h2>
    <p class="mute" style="margin:0 0 10px;font-size:13.5px">สมัครด้วยชื่อผู้ใช้และรหัสผ่าน (ไม่ต้องใช้อีเมล) แล้วเข้าสู่ระบบจากเครื่องอื่นเพื่อใช้สถิติและความคืบหน้าชุดเดียวกัน</p>
    <div class="seg ac-tabs">${tabs.map(([k, l]) => `<button class="${t === k || (t === 'recover' && k === 'login') ? 'on' : ''}" data-a="acctTab" data-v="${k}">${l}</button>`).join('')}</div>
    <div class="ac-form"><label><span>ชื่อผู้ใช้ (a–z, 0–9, _ · 3–20 ตัว)</span><input id="ac_u" autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="20" value="${e(ACCT.user)}"></label>
      ${t === 'recover' ? `<label><span>รหัสกู้คืน</span><input id="ac_rc" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="XXXX-XXXX-XXXX-XXXX"></label>` : ''}
      <label><span>${t === 'recover' ? 'รหัสผ่านใหม่ (8–72 ตัว)' : 'รหัสผ่าน' + (t === 'register' ? ' (8–72 ตัว)' : '')}</span><input type="password" id="ac_p" autocomplete="${t === 'login' ? 'current-password' : 'new-password'}"></label>
      ${t === 'register' ? `<label><span>ยืนยันรหัสผ่าน</span><input type="password" id="ac_p2" autocomplete="new-password"></label>` : ''}${msg}
      <button class="pri" data-a="acctSubmit" ${ACCT.busy ? 'disabled' : ''}>${ACCT.busy ? 'กำลังดำเนินการ…' : t === 'register' ? 'สมัครและเริ่มซิงก์' : t === 'recover' ? 'ตั้งรหัสผ่านใหม่ด้วยรหัสกู้คืน' : 'เข้าสู่ระบบ'}</button>
      ${t === 'login' ? `<button class="chip" data-a="acctTab" data-v="recover" style="justify-self:start">ลืมรหัสผ่าน? ใช้รหัสกู้คืน</button>` : t === 'recover' ? `<button class="chip" data-a="acctTab" data-v="login" style="justify-self:start">← กลับไปเข้าสู่ระบบ</button>` : ''}</div>
    <p class="mute" style="font-size:12px;margin:10px 0 0">ข้อมูลที่ซิงก์: สถิติ ความคืบหน้า โปรไฟล์ และไอเท็มที่ได้ · ไม่ส่งอีเมล เบอร์โทร หรือชื่อจริง · รหัสผ่านถูกเก็บเป็นแฮชบนเซิร์ฟเวอร์</p></div>`;
}
document.addEventListener('change', e => { if (e.target && e.target.hasAttribute && e.target.hasAttribute('data-acct-saved')) { const b = document.getElementById('ac_done'); if (b) b.disabled = !e.target.checked; } });
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target && /^ac_(u|p|p2|rc)$/.test(e.target.id || '')) { e.preventDefault(); ACCT_ACT.acctSubmit(); } });
window.addEventListener('load', () => { acctHook(); if (acctIn()) setTimeout(() => acctSync(), 1500); });
document.addEventListener('visibilitychange', () => { if (!acctIn()) return; if (document.visibilityState === 'hidden') { if (ACCT.dirty || ACCT.timer) acctSync(); } else if (Date.now() - (acctSt().last || 0) > 60000) acctSync(); });
window.addEventListener('online', () => acctSync());
