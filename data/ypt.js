// ฟีเจอร์แบบแอปจับเวลาอ่านหนังสือ (แนว YPT): เวลาอ่านแยกวิชา วัน/สัปดาห์/เดือน · แพลนเนอร์ประจำวัน · D-day · อันดับเวลาอ่านกับเพื่อน · กลุ่มอ่านหนังสือ
// เวลาอ่านเก็บในเครื่อง (studies) ; ส่งยอดรวมต่อวัน/สัปดาห์/เดือนขึ้นเซิร์ฟเวอร์พร้อมสถานะ เมื่อเปิดสถานะเพื่อนไว้เท่านั้น (ไม่ส่งรายวิชา) — ตัวเลขมาจากเครื่องผู้ใช้ จึงปลอมได้ เหมาะกับการแข่งเล่น ๆ
// เซิร์ฟเวอร์: supabase/schema.sql ส่วน "เพิ่มเติม (รอบ 3)"

const YP = { tab: 'day', rk: 'day', scope: 'friends', groups: [], gerr: '', board: {}, gbusy: false, gload: 0 };
const YP_COL = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ef4444', '#84cc16', '#f97316', '#14b8a6'];
const ypCol = s => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return YP_COL[h % YP_COL.length]; };
const ypSubs = () => uniq(['ทั่วไป', ...store.get('subs', []), ...allQ().map(q => q.subject)]);
const ypHM = s => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return h ? h + ' ชม. ' + String(m).padStart(2, '0') + ' น.' : m + ' น.'; };
const ypHMS = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 3600) + ':' + String(Math.floor(s % 3600 / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
const ypSubKey = () => T.subject || 'ทั่วไป';

/* ---------- เวลาอ่านของฉัน (รวมรอบที่กำลังเดินอยู่แบบสด) ---------- */
function ypRange(k) { const d = new Date(); d.setHours(0, 0, 0, 0); if (k === 'week') d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); if (k === 'month') d.setDate(1); return d.getTime(); }
const ypLive = () => (T.mode === 'sw' || T.phase === 'focus') ? Math.max(0, tElapsed()) : 0;
function ypBy(k) {
  const from = ypRange(k), m = {}; studies.forEach(s => { if (s.ts >= from) m[s.subject] = (m[s.subject] || 0) + s.secs; });
  const live = ypLive(); if (live >= 1) m[ypSubKey()] = (m[ypSubKey()] || 0) + live; return m;
}
const ypSum = m => Object.values(m).reduce((a, b) => a + b, 0);
function ypTotals() { return { day: Math.round(ypSum(ypBy('day'))), week: Math.round(ypSum(ypBy('week'))), month: Math.round(ypSum(ypBy('month'))) }; }

/* เปลี่ยนวิชาระหว่างจับเวลา: บันทึกรอบที่ผ่านมาให้วิชาเดิมก่อน แล้วนับต่อให้วิชาใหม่ */
function ypSwitch(sb) {
  const nv = sb === 'ทั่วไป' ? '' : sb; if (nv === T.subject) return;
  const e = tElapsed();
  if (e >= 60) { logStudy(e); if (T.mode === 'sw') { T.base = 0; if (T.running) T.startedAt = Date.now(); } else if (T.phase === 'focus') { T.remain = T.focusMin * 60; if (T.running) T.endAt = Date.now() + T.remain * 1000; } }
  T.subject = nv; render(true);
}

/* ---------- ชิ้นส่วนหน้าจอ ---------- */
function yptSubjects() {
  const cur = ypSubKey();
  return `<div class="ypsubs"><span class="mute" style="font-size:13px">วิชา/หัวข้อที่อ่านตอนนี้</span><div class="chips" style="margin:6px 0 0">${ypSubs().map(s => `<button class="chip ${cur === s ? 'on' : ''}" data-a="ypSub" data-v="${esc(s)}"><i class="ypdot" style="background:${ypCol(s)}"></i>${esc(s)}</button>`).join('')}<button class="chip" data-a="ypSubAdd">＋ เพิ่มวิชา</button>${store.get('subs', []).length ? '<button class="chip" data-a="ypSubDel" style="opacity:.7">🗑</button>' : ''}</div></div>`;
}
function yptDday() {
  const d = TCAS70.dates, items = [['TPAT3 / TGAT', d.tpat3], ['A-Level', d.alevel]]; if (typeof examDate === 'string' && examDate && !items.some(i => i[1] === examDate)) items.unshift(['วันสอบของฉัน', examDate]);
  const chips = items.map(([n, dt]) => { const k = Math.ceil((new Date(dt + 'T00:00:00') - Date.now()) / 864e5); if (k < 0) return ''; return `<div class="ddc ${k <= 30 ? 'hot' : ''}"><b>${k === 0 ? 'วันนี้!' : 'D-' + k}</b><span>${esc(n)}</span><small>${new Date(dt + 'T00:00:00').toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}</small></div>`; }).join('');
  return chips ? `<div class="ddrow" aria-label="นับถอยหลังวันสอบ">${chips}</div>` : '';
}
function yptStudyInner() {
  const k = YP.tab, m = ypBy(k), tot = ypSum(m), mx = Math.max(1, ...Object.values(m)), rows = Object.entries(m).sort((a, b) => b[1] - a[1]);
  const names = { day: 'วันนี้', week: 'สัปดาห์นี้', month: 'เดือนนี้' };
  return `<div class="row between" style="gap:8px;flex-wrap:wrap"><h2 style="margin:0">⏱ เวลาอ่านของฉัน</h2><div class="chips" style="margin:0">${['day', 'week', 'month'].map(x => `<button class="chip ${k === x ? 'on' : ''}" data-a="ypTab" data-v="${x}">${{ day: 'วัน', week: 'สัปดาห์', month: 'เดือน' }[x]}</button>`).join('')}</div></div>
    <div class="yptot"><b>${ypHMS(tot)}</b><span>${names[k]}${k === 'day' ? ' · เป้า ' + goalMin + ' น.' : ''}</span></div>
    ${k === 'day' ? `<div class="bar" style="margin:0 0 10px"><i style="width:${Math.min(100, Math.round(tot / (goalMin * 60) * 100))}%"></i></div>` : ''}
    ${rows.length ? rows.map(([s, v]) => `<div class="yprow"><span class="ypn"><i class="ypdot" style="background:${ypCol(s)}"></i>${esc(s)}</span><b>${ypHM(v)}</b><div class="ypb"><u style="width:${Math.max(3, Math.round(v / mx * 100))}%;background:${ypCol(s)}"></u></div></div>`).join('') : '<div class="mute">ยังไม่มีเวลาอ่านในช่วงนี้ — เลือกวิชาแล้วกด ▶ เริ่ม ได้เลย</div>'}`;
}
const yptStudyCard = () => `<div class="card ypc" id="ypStudy">${yptStudyInner()}</div>`;

/* ---------- แพลนเนอร์ประจำวัน ---------- */
// แผนเก็บเป็นแผนที่ วันที่ → รายการ (ใช้ร่วมกับหน้าปฏิทิน) ; ย้ายข้อมูลแผนแบบเก่า (plan/planPrev) ให้อัตโนมัติ
function plansAll() {
  let m = store.get('plans', null);
  if (!m) { m = {}; const o = store.get('plan', null), pv = store.get('planPrev', null); [pv, o].forEach(p => { if (p && p.date && p.items && p.items.length) m[p.date] = p.items; }); store.set('plans', m); }
  return m;
}
const planOf = d => (plansAll()[d] || []).map(x => ({ ...x }));
function planSet(d, items) { const m = plansAll(); if (items.length) m[d] = items; else delete m[d]; const keys = Object.keys(m).sort(); while (keys.length > 400) delete m[keys.shift()]; store.set('plans', m); }
const ypPlan = () => { const d = todayKey(); return { date: d, items: planOf(d) }; };
const ypPlanSave = p => planSet(p.date, p.items);
function ypPrevPlan() { const m = plansAll(), t = todayKey(), ks = Object.keys(m).filter(k => k < t && m[k].length).sort(); return ks.length ? { date: ks[ks.length - 1], items: m[ks[ks.length - 1]] } : null; }
const ypDone = (it, by) => !!it.d || (it.m > 0 && Math.floor((by[it.s] || 0) / 60) >= it.m);
// เนื้อในแพลนเนอร์ (ใช้ทั้งในการ์ดแพลนเนอร์เดิมและการ์ด "วันนี้ต้องทำ")
function yptPlanBody(p, by) {
  p = p || ypPlan(); by = by || ypBy('day'); const n = p.items.length, ok = p.items.filter(i => ypDone(i, by)).length, prev = ypPrevPlan();
  return `${n ? `<div class="bar" style="margin:8px 0"><i style="width:${pct(ok, n)}%"></i></div>` : '<p class="mute" style="margin:6px 0">วางแผนว่าวันนี้จะอ่านอะไร เช่น “ฟิสิกส์ บทแรง 40 นาที” แล้วกด ▶ เพื่อเริ่มจับเวลาตามวิชานั้นได้เลย ติ๊กครบเองเมื่ออ่านถึงเป้า</p>'}
    ${p.items.map(it => { const dn = ypDone(it, by), st = Math.floor((by[it.s] || 0) / 60); return `<div class="plrow ${dn ? 'done' : ''}"><button class="plck" data-a="plTog" data-v="${it.id}" aria-label="${dn ? 'ยกเลิกติ๊ก' : 'ติ๊กว่าทำแล้ว'}">${dn ? '✓' : ''}</button><div class="plt"><span>${esc(it.t)}</span><small><i class="ypdot" style="background:${ypCol(it.s)}"></i>${esc(it.s)}${it.m ? ` · อ่านแล้ว ${st}/${it.m} น.` : ''}</small></div><button class="chip" data-a="plGo" data-v="${it.id}" aria-label="เริ่มจับเวลาวิชานี้">▶</button><button class="chip" data-a="plDel" data-v="${it.id}" aria-label="ลบรายการ" style="opacity:.7">✕</button></div>`; }).join('')}
    <div class="row pladd"><input id="plTxt" maxlength="40" placeholder="เพิ่มสิ่งที่จะทำวันนี้" autocomplete="off" style="flex:1 1 150px;min-width:0"><select id="plSub" aria-label="วิชา">${ypSubs().map(s => `<option ${ypSubKey() === s ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select><input id="plMin" type="number" min="0" max="600" placeholder="นาที" style="width:74px"><button class="pri" data-a="plAdd">เพิ่ม</button></div>
    ${!n && prev && prev.items.length ? '<div class="row" style="margin-top:6px"><button class="chip" data-a="plCopy">↺ คัดลอกแผนของเมื่อวาน</button></div>' : ''}`;
}
function yptPlanner() {
  const p = ypPlan(), by = ypBy('day'), n = p.items.length, ok = p.items.filter(i => ypDone(i, by)).length;
  return `<div class="card plc"><div class="row between"><h2 style="margin:0">📋 แพลนเนอร์วันนี้</h2><span class="tag ${n && ok === n ? 'ok' : ''}">${ok}/${n}</span></div>${yptPlanBody(p, by)}</div>`;
}

/* ---------- อันดับเวลาอ่าน (เพื่อน / กลุ่ม) ---------- */
const ypKey = k => ({ day: 'today', week: 'week', month: 'month' })[k];
function ypStatOf(o) {   // o = {act,label,secs,seen,at}
  if (!o || o.act === 'off' || o.seen == null) return '<span class="fst">ซ่อนสถานะ</span>';
  const drift = (Date.now() - (o.at || Date.now())) / 1000, live = o.seen + drift < 150;
  if (!live) return '<span class="fst">ออฟไลน์</span>';
  if (o.act === 'idle' || !PACT[o.act]) return '<span class="fst on"><i></i>ออนไลน์</span>';
  return `<span class="fst ${isStudy(o.act) ? 'act' : 'on'}"><i></i>${PACT[o.act][0]} ${PACT[o.act][2]}${o.label ? ': ' + esc(o.label) : ''}</span>`;
}
function ypEntries() {
  const me = { me: true, nick: String(store.get('nick', 'น้องวิศวะ')).slice(0, 12), s: ypTotals()[YP.rk], av: avatarSvg({}, { view: 'bust', w: 46 }), stat: socPres() ? (() => { const a = socActivity(); return ypStatOf({ act: a.k, label: a.l, secs: a.s, seen: 0, at: Date.now() }); })() : '<span class="fst">คุณซ่อนสถานะอยู่</span>' };
  let rows = [];
  if (YP.scope === 'friends') rows = SOC.friends.map(f => { const st = PRES.st[f.id]; return { id: f.id, nick: String(f.nick || '').slice(0, 12), s: st && st.st ? st.st[YP.rk] : null, av: avatarSvg(avClean(f.avatar), { view: 'bust', w: 46, nick: f.nick, uni: f.uni }), stat: ypStatOf(st) }; });
  else { const b = YP.board[YP.scope]; rows = (b ? b.rows : []).filter(r => !r.is_me).map(r => ({ id: r.id, nick: String(r.nick || '').slice(0, 12), s: r['st_' + ypKey(YP.rk)] == null ? null : +r['st_' + ypKey(YP.rk)], av: avatarSvg(avClean(r.avatar), { view: 'bust', w: 46, nick: r.nick, uni: r.uni }), stat: ypStatOf({ act: PACT[r.act] || r.act === 'idle' ? r.act : 'off', label: plain(r.act_label), seen: r.seen_secs, at: b.at }) })); }
  return [me, ...rows].sort((a, b) => (b.s == null ? -1 : b.s) - (a.s == null ? -1 : a.s) || (a.me ? -1 : 1));
}
function yptRankInner() {
  const list = ypEntries(), medal = ['🥇', '🥈', '🥉'], g = YP.groups.find(x => x.id === YP.scope), loading = YP.scope !== 'friends' && !YP.board[YP.scope];
  let i = 0;
  return `<div class="row between" style="gap:8px;flex-wrap:wrap"><h2 style="margin:0">🏆 อันดับเวลาอ่าน</h2><div class="chips" style="margin:0">${['day', 'week', 'month'].map(x => `<button class="chip ${YP.rk === x ? 'on' : ''}" data-a="ypRk" data-v="${x}">${{ day: 'วัน', week: 'สัปดาห์', month: 'เดือน' }[x]}</button>`).join('')}</div></div>
    <div class="chips" style="margin:8px 0"><button class="chip ${YP.scope === 'friends' ? 'on' : ''}" data-a="ypScope" data-v="friends">👥 เพื่อน</button>${YP.groups.map(x => `<button class="chip ${YP.scope === x.id ? 'on' : ''}" data-a="ypScope" data-v="${esc(x.id)}">${esc(x.name)} <small>${x.n}</small></button>`).join('')}<button class="chip" data-a="avOpen" data-v="friends">＋ กลุ่ม</button></div>
    ${loading ? '<div class="mute">กำลังโหลดกลุ่ม…</div>' : list.length < 2 && YP.scope === 'friends' ? '<div class="mute">ยังไม่มีเพื่อนให้เทียบ — เพิ่มเพื่อนหรือสร้างกลุ่มที่แท็บ “เพื่อน” แล้วกลับมาดูอันดับที่นี่</div>' : ''}
    ${list.map(r => { const rk = r.s == null ? '–' : (medal[i] || '#' + (i + 1)); if (r.s != null) i++; return `<div class="rkrow ${r.me ? 'me' : ''}"><span class="rkn">${rk}</span><span class="rkav">${r.av}</span><div class="rkin"><b>${esc(r.nick)}${r.me ? ' <small>(คุณ)</small>' : ''}</b><div class="mute" style="font-size:12px">${r.stat}</div></div><b class="rkt">${r.s == null ? '—' : ypHM(r.s)}</b></div>`; }).join('')}
    <p class="mute" style="font-size:11.5px;margin:8px 0 0">เวลามาจากเครื่องของแต่ละคน (ปลอมได้) เหมาะกับการแข่งกันเล่น ๆ เพื่อสร้างกำลังใจ ${g ? '· รหัสกลุ่ม ' + esc(g.code) : ''}</p>`;
}
function yptRank() {
  if (!socOn()) return '';
  if (!socEnabled()) return `<div class="card"><h2>🏆 อันดับเวลาอ่านกับเพื่อน</h2><p class="mute">เปิดระบบเพื่อนแล้วจะเห็นอันดับเวลาอ่านของเพื่อนและกลุ่ม พร้อมสถานะว่าใครกำลังอ่านอยู่</p><button class="pri" data-a="avOpen" data-v="friends">เปิดระบบเพื่อน</button></div>`;
  return `<div class="card rkc" id="ypRank">${yptRankInner()}</div>`;
}

/* ---------- กลุ่มอ่านหนังสือ (แท็บ "เพื่อน") ---------- */
function yptGroupCard() {
  if (!socEnabled()) return '';
  return `<div class="card"><h2>📚 กลุ่มอ่านหนังสือ</h2><p class="mute" style="margin:2px 0 8px">รวมกลุ่มติวกับเพื่อน (ไม่ต้องเป็นเพื่อนกันก่อนก็เข้ากลุ่มเดียวกันได้) เห็นเวลาอ่านและสถานะของทุกคนในกลุ่ม — สูงสุด 30 คนต่อกลุ่ม</p>
    ${YP.gerr ? `<div class="socerr">⚠️ ${esc(YP.gerr)}</div>` : ''}
    ${YP.groups.map(g => `<div class="grow2"><div style="min-width:0"><b>${esc(g.name)}</b><div class="mute" style="font-size:12.5px">${g.n} คน · รหัส <span class="grcode">${esc(g.code)}</span></div></div><div class="row" style="gap:6px;flex-wrap:nowrap"><button class="chip" data-a="grpView" data-v="${esc(g.id)}">🏆 อันดับ</button><button class="chip" data-a="grpCopy" data-v="${esc(g.code)}">📋</button><button class="chip" data-a="grpLeave" data-v="${esc(g.id)}" style="opacity:.75">ออก</button></div></div>`).join('') || '<div class="mute" style="margin-bottom:6px">ยังไม่ได้อยู่ในกลุ่มไหน</div>'}
    <div class="row" style="flex-wrap:nowrap;gap:8px;margin-top:8px"><input id="grpName" maxlength="24" placeholder="ชื่อกลุ่มใหม่ เช่น ติวฟิสิกส์" autocomplete="off" style="flex:1;min-width:0"><button class="pri" data-a="grpCreate">สร้าง</button></div>
    <div class="row" style="flex-wrap:nowrap;gap:8px;margin-top:8px"><input id="grpCode" maxlength="6" placeholder="รหัสกลุ่ม 6 ตัว" autocomplete="off" autocapitalize="characters" spellcheck="false" style="flex:1;min-width:0;text-transform:uppercase;letter-spacing:.2em;font-weight:700"><button data-a="grpJoin">เข้าร่วม</button></div></div>`;
}
async function ypLoadGroups(quiet) {
  if (!socEnabled() || YP.gbusy) return; YP.gbusy = true;
  try { YP.groups = (await socRpc('my_groups')) || []; YP.gerr = ''; if (YP.scope !== 'friends' && !YP.groups.some(g => g.id === YP.scope)) YP.scope = 'friends'; }
  catch (e) { if (!quiet) YP.gerr = /function|schema|404/.test(e.message) ? 'เซิร์ฟเวอร์ยังไม่ได้อัปเดตส่วนกลุ่ม (ต้องรัน schema.sql ส่วนรอบ 3)' : e.message; }
  YP.gbusy = false; YP.gload = Date.now(); ypRepaint();
}
async function ypLoadBoard(id) { try { YP.board[id] = { rows: (await socRpc('group_board', { p_id: id })) || [], at: Date.now() }; } catch { /* ลองใหม่รอบหน้า */ } ypPaint(); }
function ypRepaint() { if (typeof ME !== 'undefined' && ME.tab === 'friends' && location.hash === '#/me') render(true); else ypPaint(); }
function ypPaint() {
  const a = document.getElementById('ypStudy'); if (a) a.innerHTML = yptStudyInner();
  const b = document.getElementById('ypRank'); if (b) b.innerHTML = yptRankInner();
}
setInterval(() => {
  if (typeof T === 'undefined' || typeof store === 'undefined') return;
  if (/^#\/(timer|stats|rank)$/.test(location.hash) && document.visibilityState === 'visible') {
    ypPaint();
    if (socEnabled()) { if (!YP.gload || Date.now() - YP.gload > 60000) ypLoadGroups(true); if (YP.scope !== 'friends' && (!YP.board[YP.scope] || Date.now() - YP.board[YP.scope].at > 9000)) ypLoadBoard(YP.scope); }
  }
}, 3000);

const YPT_ACT = {
  ypTab(v) { YP.tab = v; ypPaint(); },
  ypRk(v) { YP.rk = v; ypPaint(); },
  ypScope(v) { YP.scope = v; ypPaint(); if (v !== 'friends') ypLoadBoard(v); },
  ypSub(v) { ypSwitch(v); },
  ypSubAdd() {
    const n = String(prompt('ชื่อวิชา/หัวข้อที่อยากจับเวลา เช่น “ฟิสิกส์ แรง” หรือ “ภาษาอังกฤษ”') || '').trim().slice(0, 14); if (!n) return;
    const l = store.get('subs', []); if (!ypSubs().includes(n)) { l.push(n); store.set('subs', l.slice(-20)); } ypSwitch(n); toast('เพิ่มวิชา “' + n + '” แล้ว');
  },
  ypSubDel() {
    const l = store.get('subs', []); const n = String(prompt('พิมพ์ชื่อวิชาที่เพิ่มไว้และอยากลบ:\n' + l.join(', ')) || '').trim(); if (!n || !l.includes(n)) return;
    store.set('subs', l.filter(x => x !== n)); if (T.subject === n) T.subject = ''; render(true);
  },
  plAdd() {
    const t = document.getElementById('plTxt'), s = document.getElementById('plSub'), m = document.getElementById('plMin'), txt = (t.value || '').trim().slice(0, 40); if (!txt) { toast('พิมพ์สิ่งที่จะทำก่อน'); return; }
    const p = ypPlan(); p.items.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), t: txt, s: s.value || 'ทั่วไป', m: Math.max(0, Math.min(600, +m.value || 0)), d: false }); ypPlanSave(p); render(true);
  },
  plTog(id) { const p = ypPlan(), it = p.items.find(i => i.id === id); if (it) { it.d = !ypDone(it, ypBy('day')); ypPlanSave(p); render(true); } },
  plDel(id) { const p = ypPlan(); p.items = p.items.filter(i => i.id !== id); ypPlanSave(p); render(true); },
  plGo(id) { const it = ypPlan().items.find(i => i.id === id); if (!it) return; ypSwitch(it.s); if (!T.running) tStart(); else render(true); },
  plCopy() { const pv = ypPrevPlan(); if (!pv) return; const p = ypPlan(); p.items = pv.items.map(i => ({ ...i, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), d: false })); ypPlanSave(p); render(true); },
  async grpCreate() {
    const i = document.getElementById('grpName'), n = (i && i.value || '').trim(); if (!n) { toast('ตั้งชื่อกลุ่มก่อน'); return; }
    try { const r = await socRpc('create_group', { p_name: n }); const g = Array.isArray(r) ? r[0] : r; toast('สร้างกลุ่ม “' + g.name + '” แล้ว รหัส ' + g.code); await ypLoadGroups(); YP.scope = g.id; }
    catch (e) { toast('สร้างกลุ่มไม่สำเร็จ: ' + e.message); }
  },
  async grpJoin() {
    const i = document.getElementById('grpCode'), c = (i && i.value || '').trim().toUpperCase(); if (!c) { toast('กรอกรหัสกลุ่มก่อน'); return; }
    try { const r = await socRpc('join_group', { p_code: c }); const g = Array.isArray(r) ? r[0] : r; toast('เข้ากลุ่ม “' + g.name + '” แล้ว'); await ypLoadGroups(); YP.scope = g.id; }
    catch (e) { toast('เข้ากลุ่มไม่สำเร็จ: ' + e.message); }
  },
  async grpLeave(id) { if (!confirm('ออกจากกลุ่มนี้? (ถ้าไม่เหลือสมาชิก กลุ่มจะถูกลบ)')) return; try { await socRpc('leave_group', { p_id: id }); delete YP.board[id]; if (YP.scope === id) YP.scope = 'friends'; await ypLoadGroups(); toast('ออกจากกลุ่มแล้ว'); } catch (e) { toast('ไม่สำเร็จ: ' + e.message); } },
  async grpCopy(c) { try { await navigator.clipboard.writeText(c); toast('คัดลอกรหัสกลุ่ม ' + c + ' แล้ว ส่งให้เพื่อนได้เลย'); } catch { prompt('คัดลอกรหัสกลุ่ม', c); } },
  grpView(id) { YP.scope = id; YP.rk = 'day'; ypLoadBoard(id); location.hash = '#/timer'; },
};
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target && e.target.id === 'plTxt') YPT_ACT.plAdd(); });
