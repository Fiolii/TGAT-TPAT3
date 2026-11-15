// ระบบโปรไฟล์ "บัตรนักเรียนเตรียมวิศวะ": ตัวตน + เป้าหมาย + สถิติ + จุดแข็ง/จุดอ่อน + ตราที่ได้ + การ์ดแชร์เป็นรูป
// เก็บใน sx_profile (เฉพาะในเครื่อง ไม่ส่งขึ้นเซิร์ฟเวอร์) · ใช้ข้อมูลเดิมของแอป: attempts studies mocks streak() xpNow() shirtInfo() ธีมมหาวิทยาลัย สาขา และวันสอบ
const PROF_EMOJI = ['⚙️', '🔧', '🚀', '🧪', '💡', '🧠', '📐', '🤖', '⚡', '🛠️', '🌱', '🔥'];
const PROF_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9', '#8b5cf6', '#ef4444', '#14b8a6'];
const PROF_GRADES = ['ม.4', 'ม.5', 'ม.6', 'จบ ม.6 แล้ว', 'อื่น ๆ'];
const profGet = () => Object.assign({ bio: '', grade: '', color: PROF_COLORS[0], emoji: '⚙️', goal: 80 }, store.get('profile', {}));
const profSet = (k, v) => { const p = store.get('profile', {}); p[k] = v; store.set('profile', p); };

/* ป้ายโปรไฟล์ (ใช้แทนตัวละครระหว่างปิดฟีเจอร์ตัวละคร): วงกลมสีไล่เฉด + อักษรย่อ + สติกเกอร์อีโมจิ */
function profBadge(size) {
  const p = profGet(), nm = String(store.get('nick', 'น้องวิศวะ')).trim(), ch = [...nm][0] || '?', c = /^#[0-9a-f]{6}$/i.test(p.color) ? p.color : PROF_COLORS[0], id = 'pb' + Math.random().toString(36).slice(2, 7);
  return `<svg class="pfbadge" viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="${esc(nm)}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="${avMix ? avMix(c, '#000', .35) : c}"/></linearGradient></defs><circle cx="50" cy="50" r="48" fill="url(#${id})"/><circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2"/><ellipse cx="38" cy="30" rx="22" ry="12" fill="rgba(255,255,255,.22)"/><text x="50" y="63" text-anchor="middle" font-size="44" font-weight="700" fill="#fff" font-family="'Noto Sans Thai',sans-serif">${esc(ch)}</text><circle cx="80" cy="80" r="15" fill="#fff" stroke="${c}" stroke-width="2"/><text x="80" y="87" text-anchor="middle" font-size="19">${p.emoji}</text></svg>`;
}
function profData() {
  const ok = attempts.filter(a => a.ok).length, n = attempts.length, secs = studies.reduce((a, s) => a + s.secs, 0), si = shirtInfo(), t = THEMES.find(x => x.id === curThemeId()) || THEMES[0];
  const ts = topicStats().filter(x => x.n >= 3).map(x => ({ topic: x.topic, acc: pct(x.ok, x.n), n: x.n })), best = ts.slice().sort((a, b) => b.acc - a.acc || b.n - a.n).slice(0, 3), weak = ts.slice().sort((a, b) => a.acc - b.acc || b.n - a.n).filter(x => x.acc < 80).slice(0, 3);
  const cur = [...TITLES].reverse().find(x => si.xp >= x[0]) || TITLES[0], nxt = si.next, prog = nxt ? Math.min(100, Math.round((si.xp - cur[0]) / (nxt[0] - cur[0]) * 100)) : 100;
  const dleft = examDate ? Math.ceil((new Date(examDate + 'T00:00:00') - new Date()) / 864e5) : null;
  return { n, ok, acc: pct(ok, n), hrs: secs / 3600, mocks: mocks.length, streak: streak(), xp: si.xp, title: si.title, nxt, prog, patches: si.patches, best, weak, theme: t, dleft, uni: t.id === 'sixent' ? 'ยังไม่ได้เลือกมหาวิทยาลัย' : t.n };
}
function viewProfile() {
  const p = profGet(), d = profData(), nick = store.get('nick', 'น้องวิศวะ'), br = typeof brCur === 'function' ? brCur() : null, goalOk = d.n >= 10 ? Math.min(100, Math.round(d.acc / p.goal * 100)) : 0;
  const stat = (v, l, i) => `<div class="pf-stat"><span class="pf-si">${i}</span><b>${v}</b><small>${l}</small></div>`;
  const chipRow = (list, key, cur, fn) => `<div class="pf-pick">${list.map(v => `<button class="${cur === v ? 'on' : ''}" data-a="profPick" data-v="${key}|${esc(v)}" ${fn ? fn(v) : ''}>${fn ? '' : esc(v)}</button>`).join('')}</div>`;
  return `<div class="card pf-card" style="--pfc:${p.color}">
      <div class="pf-top"><div class="pf-av">${profBadge(92)}</div>
        <div class="pf-id"><div class="mute pf-kick">บัตรนักเรียนเตรียมวิศวะ</div>
          <input class="pf-nick" data-prof="nick" maxlength="10" value="${esc(nick)}" aria-label="ชื่อเล่น" placeholder="ชื่อเล่น">
          <div class="pf-title"><span class="tag">${esc(d.title)}</span> <span class="tag">⭐ ${d.xp.toLocaleString('th-TH')} แต้ม</span></div></div></div>
      <input class="pf-bio" data-prof="bio" maxlength="60" value="${esc(p.bio)}" aria-label="คำพูดประจำตัว" placeholder="คำพูดประจำตัว เช่น “วันนี้ดีกว่าเมื่อวาน”">
      <div class="pf-xp"><div class="pf-xpbar"><i style="width:${d.prog}%"></i></div><small class="mute">${d.nxt ? `อีก ${(d.nxt[0] - d.xp).toLocaleString('th-TH')} แต้มถึง “${esc(d.nxt[1])}”` : 'ถึงระดับสูงสุดแล้ว 🎉'}</small></div>
      <div class="row" style="gap:8px;margin-top:10px"><button class="pri" data-a="profShare">📸 สร้างการ์ดแชร์</button><button data-a="profCopy">📋 คัดลอกข้อความ</button></div></div>

    <div class="card pf-shirt"><h2>👕 เสื้อช็อปของฉัน</h2>
      <div class="pf-sh"><button class="pf-shbtn" data-a="nickEdit" aria-label="แก้ชื่อที่ปักบนอก" title="แตะเพื่อแก้ชื่อบนอก">${typeof shirtSvg === 'function' ? shirtSvg(nick) : ''}</button>
        <div class="pf-shi"><b>${d.theme.id === 'sixent' ? 'เสื้อช็อป SIXENT' : 'เสื้อช็อป ' + esc(d.theme.s || d.theme.n)}</b>
          ${d.theme.id !== 'sixent' && typeof uniOf === 'function' ? `<div class="unimotto">“${esc(uniOf(d.theme.id).motto)}”</div>` : '<div class="mute" style="font-size:13px">เลือกมหาวิทยาลัยที่อยากเข้า เสื้อช็อปจะเปลี่ยนเป็นของที่นั่น</div>'}
          <div class="mute" style="font-size:12.5px;margin-top:6px">ชื่อที่ปักบนอก: <b style="color:var(--ink)">${esc(String(nick).slice(0, 8))}</b></div>
          <div class="patches" style="margin-top:8px">${d.patches.length ? d.patches.map(pt => `<span title="${esc(pt[1])}">${pt[0]}</span>`).join('') : '<span class="mute" style="font-size:12px">ทำโจทย์เพื่อสะสมแพทช์ติดเสื้อ</span>'}</div>
          <div class="row" style="gap:8px;margin-top:10px"><button class="chip" data-a="themeOpen">🎓 เปลี่ยนมหาวิทยาลัย</button><button class="chip" data-a="nickEdit">✎ แก้ชื่อบนอก</button></div></div></div></div>

    <div class="card"><h2>🎯 เป้าหมายของฉัน</h2>
      <div class="pf-goals"><div class="pf-g"><small class="mute">มหาวิทยาลัยที่อยากเข้า</small><b>${esc(d.uni)}</b><button class="chip" data-a="themeOpen">เลือก/เปลี่ยน</button></div>
        <div class="pf-g"><small class="mute">สาขาที่สนใจ</small><b>${br ? esc(br.n || br.t || br.id) : 'ยังไม่ได้เลือก'}</b><button class="chip" data-a="branchOpen">เลือก/เปลี่ยน</button></div>
        <div class="pf-g"><small class="mute">วันสอบที่ตั้งไว้</small><b>${examDate ? (d.dleft >= 0 ? 'อีก ' + d.dleft + ' วัน' : 'ผ่านมาแล้ว') + ' <small class="mute">(' + examDate + ')</small>' : 'ยังไม่ได้ตั้ง'}</b><a class="chip" href="#/stats">ตั้งที่หน้าสถิติ</a></div></div>
      <p class="mute" style="margin:12px 0 4px">ชั้นปีตอนนี้</p>${chipRow(PROF_GRADES, 'grade', p.grade)}
      <p class="mute" style="margin:12px 0 2px">เป้าความแม่นยำ: <b style="color:var(--ink)">${p.goal}%</b></p><input type="range" min="50" max="100" step="5" value="${p.goal}" data-prof="goal" aria-label="เป้าความแม่นยำ" style="width:100%">
      <div class="pf-xpbar" style="margin-top:8px"><i style="width:${goalOk}%"></i></div><small class="mute">${d.n >= 10 ? `ตอนนี้แม่นยำ ${d.acc}% (${goalOk}% ของเป้า)` : 'ทำให้ครบ 10 ข้อเพื่อดูความคืบหน้าถึงเป้า'}</small></div>

    <div class="card"><h2>📊 สถิติของฉัน</h2><div class="pf-stats">
      ${stat(d.n.toLocaleString('th-TH'), 'ข้อที่ทำ', '✏️')}${stat(d.n ? d.acc + '%' : '-', 'ความแม่นยำ', '🎯')}${stat(d.streak + ' วัน', 'อ่านต่อเนื่อง', '🔥')}${stat(d.hrs.toFixed(1) + ' ชม.', 'เวลาอ่านรวม', '⏱')}${stat(d.mocks, 'สอบจำลอง', '📐')}${stat(d.patches.length, 'ตราที่ได้', '🏅')}</div></div>

    <div class="card"><h2>💪 จุดแข็ง · 🧗 ควรฝึกเพิ่ม</h2>
      ${d.best.length ? `<div class="pf-tp">${d.best.map(x => `<div class="pf-t ok"><span>${esc(x.topic)}</span><b>${x.acc}%</b></div>`).join('')}</div>` : '<p class="mute">ทำโจทย์หัวข้อละอย่างน้อย 3 ข้อ แล้วจะเห็นจุดแข็งตรงนี้</p>'}
      ${d.weak.length ? `<div class="pf-tp" style="margin-top:8px">${d.weak.map(x => `<button class="pf-t bad" data-a="practiceTopic" data-v="${esc(x.topic)}"><span>${esc(x.topic)}</span><b>${x.acc}%</b><small>ฝึกเลย ›</small></button>`).join('')}</div>` : ''}</div>

    <div class="card"><h2>🏅 ตราที่ได้</h2>${d.patches.length ? `<div class="pf-badges">${d.patches.map(([e, n]) => `<span class="pf-b" title="${esc(n)}"><i>${e}</i><small>${esc(n)}</small></span>`).join('')}</div>` : '<p class="mute">ยังไม่มีตรา ทำครบ 10 ข้อ หรืออ่านต่อเนื่อง 3 วัน เพื่อปลดล็อกตราแรก</p>'}</div>

    <div class="card"><h2>🎨 หน้าตาบัตร</h2><p class="mute" style="margin:0 0 6px">สี</p>
      <div class="pf-pick pf-swrow">${PROF_COLORS.map(c => `<button class="pf-sw ${p.color === c ? 'on' : ''}" style="--c:${c}" data-a="profPick" data-v="color|${c}" aria-label="สี ${c}"></button>`).join('')}</div>
      <p class="mute" style="margin:10px 0 6px">สติกเกอร์</p><div class="pf-pick em">${PROF_EMOJI.map(e => `<button class="${p.emoji === e ? 'on' : ''}" data-a="profPick" data-v="emoji|${e}">${e}</button>`).join('')}</div>
      <p class="mute" style="font-size:12px;margin-top:10px">ข้อมูลโปรไฟล์เก็บในเครื่องนี้เท่านั้น ไม่ถูกส่งขึ้นเซิร์ฟเวอร์ (เพื่อนเห็นเฉพาะชื่อ ชั้นปี และแต้มตามที่ตั้งสถานะไว้)</p></div>`;
}

/* ---------- การ์ดแชร์ (รูป PNG 1080×1350 วาดด้วย canvas) ---------- */
async function profCardBlob() {
  const p = profGet(), d = profData(), nick = store.get('nick', 'น้องวิศวะ'), W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  try { await document.fonts.load('700 40px "Noto Sans Thai"'); } catch { /* ใช้ฟอนต์สำรอง */ }
  const F = (w, s) => `${w} ${s}px "Noto Sans Thai", "Noto Sans", sans-serif`, g = d.theme.g || ['#6366f1', '#8b5cf6', '#ec4899'];
  const bg = x.createLinearGradient(0, 0, W, H); bg.addColorStop(0, g[0]); bg.addColorStop(.55, g[1]); bg.addColorStop(1, g[2]); x.fillStyle = bg; x.fillRect(0, 0, W, H);
  x.globalAlpha = .12; x.strokeStyle = '#fff'; x.lineWidth = 2; for (let i = -H; i < W; i += 54) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + H, H); x.stroke(); } x.globalAlpha = 1;
  const rr = (a, b, w, h, r) => { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); };
  rr(70, 120, W - 140, H - 240, 56); x.fillStyle = 'rgba(255,255,255,.93)'; x.shadowColor = 'rgba(0,0,0,.35)'; x.shadowBlur = 50; x.shadowOffsetY = 24; x.fill(); x.shadowColor = 'transparent';
  x.fillStyle = '#10142a'; x.font = F(600, 30); x.textAlign = 'left'; x.fillText('SIXENT · บัตรนักเรียนเตรียมวิศวะ', 130, 200);
  const col = /^#[0-9a-f]{6}$/i.test(p.color) ? p.color : PROF_COLORS[0]; const ag = x.createLinearGradient(130, 250, 370, 490); ag.addColorStop(0, col); ag.addColorStop(1, '#222'); x.fillStyle = ag; x.beginPath(); x.arc(250, 370, 120, 0, 7); x.fill();
  x.fillStyle = '#fff'; x.font = F(700, 130); x.textAlign = 'center'; x.fillText([...nick][0] || '?', 250, 415); x.fillStyle = '#fff'; x.beginPath(); x.arc(340, 460, 42, 0, 7); x.fill(); x.font = '56px sans-serif'; x.fillText(p.emoji, 340, 482);
  x.textAlign = 'left'; x.fillStyle = '#10142a'; x.font = F(700, 78); x.fillText(String(nick).slice(0, 10), 410, 350); x.font = F(500, 38); x.fillStyle = '#4a5070'; x.fillText(d.title + ' · ⭐ ' + d.xp.toLocaleString('th-TH'), 410, 410);
  x.font = F(500, 34); x.fillText((p.grade ? p.grade + ' · ' : '') + d.uni, 410, 462);
  if (p.bio) { x.fillStyle = '#10142a'; x.font = F(500, 38); x.fillText('“' + p.bio + '”', 130, 590); }
  const items = [[d.n.toLocaleString('th-TH'), 'ข้อที่ทำ'], [d.n ? d.acc + '%' : '-', 'ความแม่นยำ'], [d.streak + ' วัน', 'อ่านต่อเนื่อง'], [d.hrs.toFixed(1) + ' ชม.', 'เวลาอ่านรวม']];
  items.forEach((it, i) => { const a = 130 + (i % 2) * 400, b = 650 + Math.floor(i / 2) * 190; rr(a, b, 370, 160, 30); x.fillStyle = 'rgba(30,40,100,.07)'; x.fill(); x.fillStyle = col; x.font = F(700, 64); x.fillText(it[0], a + 28, b + 82); x.fillStyle = '#4a5070'; x.font = F(500, 30); x.fillText(it[1], a + 28, b + 130); });
  try {
    const svg = typeof shirtSvg === 'function' ? shirtSvg(nick) : ''; if (svg) {
      const img = new Image(), u = URL.createObjectURL(new Blob([svg.includes('xmlns') ? svg : svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')], { type: 'image/svg+xml' }));
      await new Promise((ok, no) => { img.onload = ok; img.onerror = no; img.src = u; setTimeout(no, 2500); }); x.drawImage(img, 740, 960, 210, 210 * (img.naturalHeight || 130) / (img.naturalWidth || 120)); URL.revokeObjectURL(u);
    }
  } catch { /* ถ้าวาดเสื้อไม่ได้ ใช้การ์ดแบบไม่มีเสื้อ */ }
  x.fillStyle = '#10142a'; x.font = F(600, 34); x.textAlign = 'left'; x.fillText('ตราที่ได้', 130, 1060); x.font = '58px sans-serif'; x.fillText(d.patches.slice(0, 6).map(v => v[0]).join(' ') || '—', 130, 1130);
  x.fillStyle = 'rgba(255,255,255,.9)'; x.font = F(600, 32); x.textAlign = 'center'; x.fillText('ติว TGAT · TPAT3 · A-Level กับ SIXENT', W / 2, H - 70);
  return new Promise(r => c.toBlob(r, 'image/png'));
}
function profText() {
  const p = profGet(), d = profData(), nick = store.get('nick', 'น้องวิศวะ');
  return `🪪 ${nick} · ${d.title}\n🎓 ${(p.grade ? p.grade + ' · ' : '') + d.uni}\n✏️ ทำโจทย์ ${d.n} ข้อ แม่นยำ ${d.n ? d.acc + '%' : '-'} · 🔥 อ่านต่อเนื่อง ${d.streak} วัน · ⏱ ${d.hrs.toFixed(1)} ชม.\n${p.bio ? '“' + p.bio + '”\n' : ''}มาติวด้วยกันที่ SIXENT`;
}
const PROF_ACT = {
  profPick(v) { const i = v.indexOf('|'), k = v.slice(0, i), val = v.slice(i + 1); if (k === 'grade') { const p = profGet(); profSet('grade', p.grade === val ? '' : val); } else if (k === 'color' && PROF_COLORS.includes(val)) profSet('color', val); else if (k === 'emoji' && PROF_EMOJI.includes(val)) profSet('emoji', val); else return; render(true); if (typeof hubAvSig !== 'undefined') hubAvSig = ''; },
  async profShare() {
    toast('กำลังสร้างการ์ด…'); const blob = await profCardBlob(); if (!blob) { toast('สร้างการ์ดไม่สำเร็จ'); return; }
    const f = new File([blob], 'sixent-profile.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [f] })) { try { await navigator.share({ files: [f], title: 'โปรไฟล์ SIXENT', text: profText() }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'sixent-profile.png'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); toast('บันทึกการ์ดเป็นรูปแล้ว');
  },
  async profCopy() { try { await navigator.clipboard.writeText(profText()); toast('คัดลอกข้อความแล้ว'); } catch { alert(profText()); } }
};
document.addEventListener('input', e => { const k = e.target && e.target.dataset && e.target.dataset.prof; if (!k) return; const v = e.target.value; if (k === 'nick') { store.set('nick', v.trim().slice(0, 10) || 'น้องวิศวะ'); } else if (k === 'bio') profSet('bio', v.slice(0, 60)); else if (k === 'goal') { profSet('goal', +v); const lab = e.target.previousElementSibling; if (lab) lab.innerHTML = 'เป้าความแม่นยำ: <b style="color:var(--ink)">' + v + '%</b>'; } });
document.addEventListener('change', e => { const k = e.target && e.target.dataset && e.target.dataset.prof; if (k === 'nick' || k === 'goal') { render(true); if (typeof hubAvSig !== 'undefined') hubAvSig = ''; } });
