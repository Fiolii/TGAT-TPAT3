// ซิมูเลเตอร์มิติสัมพันธ์และตรรกะ (บางตัวใช้ DOM/SVG/CSS 3D แทน canvas)
(function () {
  const { f, txt, line, rect, circ } = SU, FG = FIG;
  const shell = (host, goal) => { host.innerHTML = `<div class="sim"><div class="simgoal">🎯 <b>ลองทำ:</b> ${goal}</div><div class="simbody"></div><div class="simout"></div></div>`; return { body: host.querySelector('.simbody'), out: host.querySelector('.simout') }; };

  /* กองบล็อกและภาพฉาย */
  SIMS.blocks3d = {
    mount(host) {
      const { body, out } = shell(host, 'แตะช่องเพื่อเพิ่มจำนวนชั้น (0–3) แล้วดูภาพฉายด้านหน้า (ก) ด้านข้าง (ข) และด้านบน — ลองทำให้ภาพหน้ากับภาพข้างเหมือนกันแต่จำนวนบล็อกต่างกัน');
      const Hm = [[1, 2, 0], [0, 3, 1], [0, 0, 1]];
      body.innerHTML = `<div class="bwrap"><div><div class="mute">แตะช่อง (แถวล่าง = ด้านหน้า ก)</div><div class="bgrid"></div><div class="simbtns"><button data-r>🎲 สุ่ม</button><button data-c>ล้าง</button></div></div><div class="biso"></div></div><div class="bviews"></div>`;
      const grid = body.querySelector('.bgrid'), iso = body.querySelector('.biso'), vw = body.querySelector('.bviews');
      function upd() {
        grid.innerHTML = ''; Hm.forEach((row, y) => row.forEach((h, x) => { const b = document.createElement('button'); b.className = 'bcell h' + h; b.textContent = h; b.setAttribute('aria-label', `แถว ${y + 1} คอลัมน์ ${x + 1} สูง ${h}`); b.onclick = () => { Hm[y][x] = (Hm[y][x] + 1) % 4; upd(); }; grid.appendChild(b); }));
        const cubes = FG.heightsToCubes(Hm), n = cubes.length; iso.innerHTML = n ? FG.iso(cubes, { s: 18, labels: true, cls: 'ofig big' }) : '<div class="mute" style="padding:30px 0">ยังไม่มีบล็อก</div>';
        if (n) { const fr = FG.frontView(Hm), rt = FG.rightView(Hm); vw.innerHTML = `<figure><figcaption>ภาพหน้า (ก)</figcaption>${FG.elev(fr, { maxH: 3 })}</figure><figure><figcaption>ภาพข้าง (ข)</figcaption>${FG.elev(rt, { maxH: 3 })}</figure><figure><figcaption>ภาพบน</figcaption>${FG.top(Hm, { nums: true })}</figure>`; out.innerHTML = `บล็อกทั้งหมด <b>${n}</b> ก้อน · ภาพหน้าสูง [${fr.join(', ')}] · ภาพข้างสูง [${rt.join(', ')}] (ซ้าย→ขวา)<br>ทาสีทุกหน้าที่โผล่รวมด้านล่าง = <b>${FG.exposedFaces(Hm)}</b> หน้า (= 6n − 2×คู่หน้าที่ติดกัน)`; } else { vw.innerHTML = ''; out.textContent = 'แตะช่องเพื่อเริ่มสร้าง'; }
      }
      body.querySelector('[data-r]').onclick = () => { for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) Hm[y][x] = Math.random() < .3 ? 0 : 1 + Math.floor(Math.random() * 3); upd(); };
      body.querySelector('[data-c]').onclick = () => { for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) Hm[y][x] = 0; upd(); };
      upd(); return { destroy() { } };
    },
  };

  /* พับ-เจาะกระดาษ */
  SIMS.foldpunch = {
    mount(host) {
      const { body, out } = shell(host, 'เลือกรูปแบบการพับและตำแหน่งรู แล้วเลื่อนดูการคลี่กระดาษทีละขั้น — ทุกครั้งที่คลี่หนึ่งรอยพับ รูจะ "สะท้อน" ข้ามเส้นพับนั้น');
      const kinds = [['VH', 'พับซ้าย→ขวา แล้วล่าง→บน'], ['HV', 'พับล่าง→บน แล้วซ้าย→ขวา'], ['VV', 'พับครึ่งสองครั้งตามแนวตั้ง'], ['D', 'พับทแยงมุม'], ['DA', 'พับทแยงมุมแล้วพับครึ่งสามเหลี่ยม']];
      const st = { k: 'VH', h: 0, u: 0 };
      body.innerHTML = `<div class="chips"></div><div class="fpfig"></div><label class="simc"><span>คลี่ย้อนกลับแล้วกี่รอยพับ <b class="u">0</b></span><input type="range" min="0" max="2" step="1" value="0"></label><div class="fpres"></div>`;
      const chips = body.querySelector('.chips'), figEl = body.querySelector('.fpfig'), res = body.querySelector('.fpres'), rng = body.querySelector('input'), ub = body.querySelector('.u');
      function unPartial(kind, hole, count) { const un = FG.FOLDS[kind].un; let pts = [hole]; for (let i = un.length - 1; i >= un.length - count; i--) { const nx = []; pts.forEach(p => nx.push(p, un[i](p))); pts = nx; } const seen = {}; return pts.filter(p => { const k = Math.round(p[0] * 100) + ',' + Math.round(p[1] * 100); return seen[k] ? false : (seen[k] = 1); }); }
      function upd() {
        const F = FG.FOLDS[st.k], hole = F.holes[st.h % F.holes.length], nF = F.un.length; rng.max = nF; st.u = Math.min(st.u, nF); rng.value = st.u; ub.textContent = st.u;
        chips.innerHTML = kinds.map(([k, t]) => `<button class="chip ${st.k === k ? 'on' : ''}" data-k="${k}">${t}</button>`).join('') + `<button class="chip" data-h>ตำแหน่งรู: ${st.h % F.holes.length + 1}/${F.holes.length} (แตะเพื่อเปลี่ยน)</button>`;
        chips.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { st.k = b.dataset.k; st.h = 0; st.u = 0; upd(); }); chips.querySelector('[data-h]').onclick = () => { st.h++; upd(); };
        figEl.innerHTML = FG.foldFig(st.k, hole); const pts = unPartial(st.k, hole, st.u);
        res.innerHTML = `<figure><figcaption>หลังคลี่ ${st.u}/${nF} รอยพับ</figcaption>${FG.paperOpt(pts)}</figure>`; out.innerHTML = `รูหนึ่งรู × 2 ทุกครั้งที่คลี่ → เมื่อคลี่ครบ ${nF} รอยพับ ได้ <b>${Math.pow(2, nF)}</b> รู (ถ้ารูไม่อยู่บนรอยพับ) · ตอนนี้มี <b>${pts.length}</b> รู`;
      }
      rng.oninput = () => { st.u = +rng.value; upd(); }; upd(); return { destroy() { } };
    },
  };

  /* พับแผ่นคลี่เป็นลูกบาศก์ (CSS 3D) */
  SIMS.netfold = {
    mount(host) {
      const { body, out } = shell(host, 'เลื่อนแถบ "พับ" ไปทางขวาเพื่อพับแผ่นคลี่รูปกากบาทขึ้นเป็นลูกบาศก์ แล้วหมุนมุมมอง — บอกให้ได้ว่าลวดลายใดอยู่ตรงข้ามกัน');
      const s = 64, glyph = g => FG.svg('0 0 40 40', FG.glyph(g, 20, 20, 10), 'ลวดลาย', 'nfsvg');
      body.innerHTML = `<div class="net-scene"><div class="net-root"></div></div><div class="simctl"><label class="simc"><span>พับ <b class="fb">0%</b></span><input type="range" class="fold" min="0" max="100" value="0"></label><label class="simc"><span>มุมมอง <b class="vb">35°</b></span><input type="range" class="view" min="0" max="360" value="35"></label></div><div class="simbtns"><button data-p>▶ พับให้ดู</button></div>`;
      const root = body.querySelector('.net-root'), fold = body.querySelector('.fold'), view = body.querySelector('.view'), fb = body.querySelector('.fb'), vb = body.querySelector('.vb');
      const mk = (g, left, top, origin, parent) => { const d = document.createElement('div'); d.className = 'nf'; d.style.cssText = `width:${s}px;height:${s}px;left:${left}px;top:${top}px;transform-origin:${origin}`; d.innerHTML = glyph(g); parent.appendChild(d); return d; };
      const c = mk(0, -s / 2, -s / 2, '50% 50%', root), N = mk(1, 0, -s, '50% 100%', c), So = mk(2, 0, s, '50% 0%', c), Wd = mk(3, -s, 0, '100% 50%', c), Ed = mk(4, s, 0, '0% 50%', c), Tp = mk(5, 0, s, '50% 0%', So);
      let raf = 0, playing = false;
      const sym = ['●', '■', '✚', '◆', '✖', '◎'];
      function upd() { const p = +fold.value / 100, th = p * 90; fb.textContent = Math.round(p * 100) + '%'; vb.textContent = view.value + '°'; N.style.transform = `rotateX(${-th}deg)`; So.style.transform = `rotateX(${th}deg)`; Tp.style.transform = `rotateX(${th}deg)`; Wd.style.transform = `rotateY(${th}deg)`; Ed.style.transform = `rotateY(${-th}deg)`; root.style.transform = `rotateX(58deg) rotateZ(${view.value}deg)`; out.innerHTML = p > .98 ? `พับครบแล้ว: ลวดลายตรงข้ามกัน → <b>${sym[0]} ↔ ${sym[5]}</b> · <b>${sym[1]} ↔ ${sym[2]}</b> · <b>${sym[3]} ↔ ${sym[4]}</b><br>(แผ่นกากบาท: หน้ากลางตรงข้ามหน้าล่างสุด, หน้าบน-ล่างของแถวตั้งตรงข้ามกัน, หน้าซ้าย-ขวาตรงข้ามกัน)` : 'ลวดลายต่าง ๆ จะหมุนมาติดกันตามรอยพับ — เลื่อนไปที่ 100%'; }
      fold.oninput = view.oninput = upd;
      body.querySelector('[data-p]').onclick = () => { if (playing) return; playing = true; fold.value = 0; const go = () => { fold.value = +fold.value + 2; upd(); if (+fold.value < 100) raf = requestAnimationFrame(go); else playing = false; }; raf = requestAnimationFrame(go); };
      upd(); return { destroy() { cancelAnimationFrame(raf); } };
    },
  };

  /* แผนภาพเวนอธิบายซิลโลจิซึม */
  SIMS.venn = {
    mount: host => SU.sim(host, {
      label: 'แผนภาพเวน', h: 250,
      goal: 'เปิด-ปิดเงื่อนไข "ทุก A เป็น B" และ "ทุก B เป็น C" ดูว่าเมื่อใดจึงสรุป "ทุก A เป็น C" ได้',
      controls: [{ id: 'ab', label: 'ทุก A เป็น B', min: 0, max: 1, step: 1, v: 1, opts: ['ไม่กำหนด', 'จริง'] }, { id: 'bc', label: 'ทุก B เป็น C', min: 0, max: 1, step: 1, v: 1, opts: ['ไม่กำหนด', 'จริง'] }],
      draw(g, W, H, S, t, C) {
        const cx = W / 2, cy = 128;
        const cc = (x, y, r, col, l, lx, ly) => { circ(g, x, y, r, col + '33', col, 3); txt(g, l, lx, ly, col, 18, 'center'); };
        if (S.ab && S.bc) { cc(cx, cy, 105, '#ec4899', 'C', cx, cy - 88); cc(cx, cy + 8, 72, '#8b5cf6', 'B', cx, cy - 50); cc(cx, cy + 22, 40, '#3e63dd', 'A', cx, cy + 26); }
        else if (S.ab) { cc(cx + 40, cy, 100, '#ec4899', 'C', cx + 100, cy - 70); cc(cx - 45, cy, 65, '#8b5cf6', 'B', cx - 70, cy - 40); cc(cx - 60, cy + 10, 30, '#3e63dd', 'A', cx - 60, cy + 16); }
        else if (S.bc) { cc(cx, cy, 105, '#ec4899', 'C', cx + 60, cy - 78); cc(cx - 10, cy + 10, 55, '#8b5cf6', 'B', cx - 10, cy + 14); cc(cx - 82, cy - 25, 40, '#3e63dd', 'A', cx - 100, cy - 28); }
        else { cc(cx - 55, cy, 70, '#3e63dd', 'A', cx - 90, cy); cc(cx + 5, cy - 20, 70, '#8b5cf6', 'B', cx + 5, cy - 35); cc(cx + 55, cy + 10, 70, '#ec4899', 'C', cx + 90, cy + 20); }
      },
      out: S => S.ab && S.bc ? 'A ⊂ B และ B ⊂ C → <b>A ⊂ C</b> สรุปได้แน่นอน: ทุก A เป็น C (ซิลโลจิซึมถูกต้อง)' : S.ab ? 'รู้แค่ A ⊂ B แต่ B กับ C ซ้อนกันบางส่วน → <b>สรุปความสัมพันธ์ของ A กับ C ไม่ได้</b>' : S.bc ? 'รู้แค่ B ⊂ C แต่ A กับ B ซ้อนกันบางส่วน → <b>สรุปไม่ได้ว่า A ทุกตัวเป็น C</b>' : 'ไม่มีเงื่อนไขซ้อนกันชัดเจน → <b>สรุปไม่ได้</b>',
    }),
  };
})();
