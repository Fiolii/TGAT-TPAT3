// ปฏิทิน: ดูเวลาอ่านรายวัน (ยิ่งอ่านมากสียิ่งเข้ม) วันสอบ แผนที่วางไว้ และโจทย์ที่ทำ — แตะวันเพื่อดูรายละเอียดและวางแผนล่วงหน้า
// ข้อมูลทั้งหมดมาจากที่มีอยู่แล้วในเครื่อง (studies, attempts, mocks, แผนใน ypt.js) ไม่ส่งขึ้นเซิร์ฟเวอร์

const CAL_M = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
const CAL_MS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const CAL_W = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'], CAL_WF = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const CAL = { y: new Date().getFullYear(), m: new Date().getMonth(), sel: '' };
const calKey = (y, m, d) => y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
const calDate = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const calLong = k => { const d = calDate(k); return 'วัน' + CAL_WF[d.getDay()] + 'ที่ ' + d.getDate() + ' ' + CAL_MS[d.getMonth()] + ' ' + (d.getFullYear() + 543); };

function calExams() {
  const m = {}, add = (d, n) => { if (d) (m[d] = m[d] || []).push(n); };
  add(TCAS70.dates.tpat3, 'สอบ TPAT3 / TGAT'); add(TCAS70.dates.alevel, 'สอบ A-Level');
  if (typeof examDate === 'string' && examDate && examDate !== TCAS70.dates.tpat3 && examDate !== TCAS70.dates.alevel) add(examDate, 'วันสอบของฉัน');
  return m;
}
// รวมข้อมูลรายวันครั้งเดียวต่อการวาด
function calData() {
  const D = {}, day = k => D[k] || (D[k] = { secs: 0, by: {}, q: 0, ok: 0, mocks: [] });
  studies.forEach(s => { const x = day(dayKey(s.ts)); x.secs += s.secs; x.by[s.subject] = (x.by[s.subject] || 0) + s.secs; });
  attempts.forEach(a => { const x = day(dayKey(a.ts)); x.q++; if (a.ok) x.ok++; });
  mocks.forEach(m => day(dayKey(m.ts)).mocks.push(m));
  const live = typeof ypLive === 'function' ? ypLive() : 0; if (live >= 1) { const x = day(todayKey()), sb = T.subject || 'ทั่วไป'; x.secs += live; x.by[sb] = (x.by[sb] || 0) + live; }
  return D;
}
const calHeat = (secs) => { const g = goalMin * 60; return secs < 60 ? 0 : secs < g * .34 ? 1 : secs < g * .67 ? 2 : secs < g ? 3 : 4; };
const calShort = secs => { const m = Math.round(secs / 60); return m < 1 ? '' : m < 60 ? m + 'น.' : (m / 60).toFixed(m % 60 ? 1 : 0) + 'ช.'; };

function calCell(k, d, D, ex, today) {
  const x = D[k], pl = planOf(k), done = pl.length && pl.every(i => ypDone(i, (x && x.by) || {})), h = x ? calHeat(x.secs) : 0;
  return `<button class="calc h${h} ${k === today ? 'today' : ''} ${k === CAL.sel ? 'sel' : ''} ${ex[k] ? 'exm' : ''}" data-a="calSel" data-v="${k}" aria-label="${calLong(k)}${ex[k] ? ' — ' + ex[k].join(', ') : ''}">
    <b>${d}</b><span class="cmk">${ex[k] ? '<i class="cx cxe" title="วันสอบ"></i>' : ''}${pl.length ? (done ? '<i class="cx cxo"></i>' : '<i class="cx cxp"></i>') : ''}${x && x.mocks.length ? '<i class="cx cxm"></i>' : ''}</span><small>${x && x.secs >= 60 ? calShort(x.secs) : x && x.q ? x.q + 'ข' : ''}</small></button>`;
}
function calMonthStats(D) {
  let secs = 0, days = 0, q = 0, best = 0, bestK = '';
  Object.keys(D).forEach(k => { const [y, m] = k.split('-').map(Number); if (y !== CAL.y || m - 1 !== CAL.m) return; const x = D[k]; secs += x.secs; q += x.q; if (x.secs >= 60 || x.q) days++; if (x.secs > best) { best = x.secs; bestK = k; } });
  return { secs, days, q, best, bestK };
}
function calDayPanel(D, ex) {
  const k = CAL.sel, x = D[k] || { secs: 0, by: {}, q: 0, ok: 0, mocks: [] }, pl = planOf(k), t = todayKey();
  const diff = Math.round((calDate(k) - calDate(t)) / 864e5), rel = diff === 0 ? 'วันนี้' : diff > 0 ? 'อีก ' + diff + ' วัน' : Math.abs(diff) + ' วันที่แล้ว';
  const rows = Object.entries(x.by).sort((a, b) => b[1] - a[1]), mx = Math.max(1, ...Object.values(x.by));
  const nOk = pl.filter(i => ypDone(i, x.by)).length;
  return `<div class="card calday">
    <div class="row between" style="gap:8px"><div style="min-width:0"><h2 style="margin:0">${calLong(k)}</h2><div class="mute" style="font-size:13px">${rel}</div></div>${k === t ? '<a class="btn pri" href="#/timer" style="text-decoration:none">▶ จับเวลา</a>' : ''}</div>
    ${ex[k] ? `<div class="warnbox" style="margin:10px 0 0">🎯 <b>${ex[k].map(esc).join(' · ')}</b>${diff > 0 ? ' — เหลืออีก ' + diff + ' วัน' : ''}</div>` : ''}
    <div class="calsum"><div><b>${x.secs >= 60 ? ypHM(x.secs) : '—'}</b><span>เวลาอ่าน</span></div><div><b>${x.q || '—'}</b><span>โจทย์${x.q ? ' (ถูก ' + pct(x.ok, x.q) + '%)' : ''}</span></div><div><b>${pl.length ? nOk + '/' + pl.length : '—'}</b><span>แผนที่ทำได้</span></div></div>
    ${rows.length ? rows.map(([s, v]) => `<div class="yprow"><span class="ypn"><i class="ypdot" style="background:${ypCol(s)}"></i>${esc(s)}</span><b>${ypHM(v)}</b><div class="ypb"><u style="width:${Math.max(3, Math.round(v / mx * 100))}%;background:${ypCol(s)}"></u></div></div>`).join('') : ''}
    ${x.mocks.length ? `<div style="margin-top:8px">${x.mocks.map(m => `<div class="row between" style="padding:3px 0"><span>📝 ${esc(m.set || 'สอบจำลอง')}</span><b>${m.score}/${m.total}</b></div>`).join('')}</div>` : ''}
    <h3 style="margin:14px 0 4px;font-size:16px">📋 แผนของวันนี้${k === t ? '' : ' (' + (diff > 0 ? 'ล่วงหน้า' : 'ย้อนหลัง') + ')'}</h3>
    ${pl.length ? '' : '<p class="mute" style="margin:2px 0 6px">ยังไม่มีแผนในวันนี้ — วางแผนล่วงหน้าได้ เมื่อถึงวันจะขึ้นในแพลนเนอร์หน้าจับเวลาเอง</p>'}
    ${pl.map(it => { const dn = ypDone(it, x.by), st = Math.floor(((x.by || {})[it.s] || 0) / 60); return `<div class="plrow ${dn ? 'done' : ''}"><button class="plck" data-a="calPlTog" data-v="${it.id}" aria-label="ติ๊ก">${dn ? '✓' : ''}</button><div class="plt"><span>${esc(it.t)}</span><small><i class="ypdot" style="background:${ypCol(it.s)}"></i>${esc(it.s)}${it.m ? ` · ${k <= t ? 'อ่านแล้ว ' + st + '/' : 'เป้า '}${it.m} น.` : ''}</small></div><button class="chip" data-a="calPlDel" data-v="${it.id}" aria-label="ลบ" style="opacity:.7">✕</button></div>`; }).join('')}
    <div class="row pladd"><input id="cpTxt" maxlength="40" placeholder="เพิ่มแผน/นัดหมายของวันนี้" autocomplete="off" style="flex:1 1 150px;min-width:0"><select id="cpSub" aria-label="วิชา">${ypSubs().map(s => `<option>${esc(s)}</option>`).join('')}</select><input id="cpMin" type="number" min="0" max="600" placeholder="นาที" style="width:74px"><button class="pri" data-a="calPlAdd">เพิ่ม</button></div></div>`;
}
function calUpcoming(ex) {
  const t = todayKey(), items = [];
  for (let i = 0; i < 8; i++) { const d = calDate(t); d.setDate(d.getDate() + i); const k = calKey(d.getFullYear(), d.getMonth(), d.getDate()); (ex[k] || []).forEach(n => items.push([k, '🎯 ' + n])); planOf(k).filter(p => !p.d).forEach(p => items.push([k, '📋 ' + p.t + (p.m ? ' (' + p.m + ' น.)' : '')])); }
  return items.length ? `<div class="card"><h2>📆 7 วันข้างหน้า</h2>${items.slice(0, 12).map(([k, s]) => `<button class="calup" data-a="calSel" data-v="${k}"><b>${k === t ? 'วันนี้' : calDate(k).getDate() + ' ' + CAL_MS[calDate(k).getMonth()]}</b><span>${esc(s)}</span></button>`).join('')}</div>` : '';
}
function viewCal() {
  if (!CAL.sel) CAL.sel = todayKey();
  const D = calData(), ex = calExams(), t = todayKey(), first = new Date(CAL.y, CAL.m, 1).getDay(), n = new Date(CAL.y, CAL.m + 1, 0).getDate(), st = calMonthStats(D);
  const cells = []; for (let i = 0; i < first; i++) cells.push('<span class="calc blank"></span>'); for (let d = 1; d <= n; d++) cells.push(calCell(calKey(CAL.y, CAL.m, d), d, D, ex, t));
  return `<h1>ปฏิทิน</h1>
  <div class="card calcard"><div class="calhead"><button data-a="calPrev" aria-label="เดือนก่อน">‹</button><div><b>${CAL_M[CAL.m]} ${CAL.y + 543}</b></div><button data-a="calNext" aria-label="เดือนถัดไป">›</button><button class="chip" data-a="calToday">วันนี้</button></div>
    <div class="calw">${CAL_W.map((w, i) => `<span class="${i === 0 ? 'sun' : ''}">${w}</span>`).join('')}</div>
    <div class="calgrid">${cells.join('')}</div>
    <div class="callg"><span>น้อย</span>${[0, 1, 2, 3, 4].map(h => `<i class="calc h${h}"></i>`).join('')}<span>ถึงเป้า ${goalMin} น.</span><em><i class="cx cxe"></i>วันสอบ</em><em><i class="cx cxp"></i>มีแผน</em><em><i class="cx cxo"></i>ทำครบ</em><em><i class="cx cxm"></i>สอบจำลอง</em></div></div>
  <div class="calstat"><div class="stat"><b>${st.secs >= 60 ? ypHM(st.secs) : '—'}</b><span>อ่านเดือนนี้</span></div><div class="stat"><b>${st.days}</b><span>วันที่ได้ทำ</span></div><div class="stat"><b>${st.q}</b><span>โจทย์เดือนนี้</span></div><div class="stat"><b>🔥 ${streak()}</b><span>วันติดต่อกัน</span></div></div>
  ${calDayPanel(D, ex)}${calUpcoming(ex)}`;
}
function calMove(dm) { const d = new Date(CAL.y, CAL.m + dm, 1); CAL.y = d.getFullYear(); CAL.m = d.getMonth(); render(true); }
const CAL_ACT = {
  calPrev() { calMove(-1); }, calNext() { calMove(1); },
  calToday() { const d = new Date(); CAL.y = d.getFullYear(); CAL.m = d.getMonth(); CAL.sel = todayKey(); render(true); },
  calSel(k) { CAL.sel = k; const d = calDate(k); CAL.y = d.getFullYear(); CAL.m = d.getMonth(); render(true); setTimeout(() => { const p = document.querySelector('.calday'); if (p && p.getBoundingClientRect().top > innerHeight * .75) p.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60); },
  calPlAdd() {
    const t = document.getElementById('cpTxt'), s = document.getElementById('cpSub'), m = document.getElementById('cpMin'), txt = (t.value || '').trim().slice(0, 40); if (!txt) { toast('พิมพ์แผนหรือนัดหมายก่อน'); return; }
    const items = planOf(CAL.sel); items.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), t: txt, s: s.value || 'ทั่วไป', m: Math.max(0, Math.min(600, +m.value || 0)), d: false }); planSet(CAL.sel, items); render(true);
  },
  calPlTog(id) { const items = planOf(CAL.sel), it = items.find(i => i.id === id); if (!it) return; const by = (calData()[CAL.sel] || {}).by || {}; it.d = !ypDone(it, by); planSet(CAL.sel, items); render(true); },
  calPlDel(id) { planSet(CAL.sel, planOf(CAL.sel).filter(i => i.id !== id)); render(true); },
};
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target && e.target.id === 'cpTxt') CAL_ACT.calPlAdd(); });
