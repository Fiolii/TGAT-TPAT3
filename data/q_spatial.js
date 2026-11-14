// โจทย์ TPAT3 ส่วนมิติสัมพันธ์/เชิงกลแบบภาพ — สร้างด้วยโค้ดจาก FIG (คำนวณเฉลยด้วยโปรแกรม ไม่เดา)
(function () {
  const FG = FIG;
  const dirs = ['ตามเข็ม', 'ทวนเข็ม'];
  const row = items => `<div class="figrow">${items.map(([t, s]) => `<figure><figcaption>${t}</figcaption>${s}</figure>`).join('')}</div>`;
  function build(cfg) {
  const G = cfg.G, S = cfg.S, T1 = cfg.T1, T2 = cfg.T2;
  const gen = (id, fn) => { if (cfg.only && !cfg.only.includes(id)) return; const nid = id.replace('p-sp-', cfg.pre); try { fn(nid, FG.rnd(nid)); } catch (e) { console.error('สร้างโจทย์ไม่สำเร็จ', nid, e); } };
  const add = (id, topic, diff, q, o, exp, extra) => QUESTIONS.push(Q(id, G, S, topic, diff, q, o.c, o.a, exp, Object.assign({ why: o.why }, extra)));
  // ประกอบตัวเลือก: correct/dists = {k:คีย์เทียบซ้ำ, o:ตัวเลือก(string), w:เหตุผล}
  function build(r, correct, dists) {
    const seen = new Set([correct.k]), ds = [];
    for (const d of dists) { if (!seen.has(d.k)) { seen.add(d.k); ds.push(d); } if (ds.length === 4) break; }
    if (ds.length < 4) throw new Error('ตัวหลอกไม่พอ');
    const pos = Math.floor(r() * 5), all = ds.slice(); all.splice(pos, 0, correct);
    return { c: all.map(x => x.o), a: pos, why: all.map(x => x.w) };
  }
  const bad = 'ผิด: ';

  /* ----- 1) ภาพฉายของกองบล็อก ----- */
  [['p-sp-v1', 'ก'], ['p-sp-v2', 'ข'], ['p-sp-v3', 'ข']].forEach(([id, view]) => gen(id, (id, r) => {
    const H = FG.randomStack(r, 3, 3, 6), fr = FG.frontView(H), rt = FG.rightView(H), cor = view === 'ก' ? fr : rt, other = view === 'ก' ? rt : fr;
    const mut = (a, i, d) => a.map((v, j) => j === i ? Math.min(3, Math.max(1, v + d)) : v);
    const m = a => ({ k: FG.key(a), o: FG.elev(a, { maxH: 3 }) });
    const i1 = Math.floor(r() * 3), i2 = (i1 + 1) % 3;
    const o = build(r, Object.assign(m(cor), { w: `ถูก: ภาพมองจาก ${view} ความสูงจากซ้ายไปขวา = ${cor.join(', ')}` }), [
      Object.assign(m(other), { w: bad + 'นี่คือภาพที่มองจากอีกด้านหนึ่ง (ผิดทิศ)' }),
      Object.assign(m(cor.slice().reverse()), { w: bad + 'ลำดับซ้าย-ขวากลับด้าน' }),
      Object.assign(m(mut(cor, i1, cor[i1] >= 3 ? -1 : 1)), { w: bad + `คอลัมน์ที่ ${i1 + 1} สูงไม่ตรง (ต้องดูกองที่สูงสุดที่บังอยู่ด้านหลัง)` }),
      Object.assign(m(mut(cor, i2, cor[i2] <= 1 ? 1 : -1)), { w: bad + `คอลัมน์ที่ ${i2 + 1} สูงไม่ตรง` }),
      Object.assign(m(mut(other, i1, 1)), { w: bad + 'ปะปนระหว่างภาพสองด้าน' }),
      Object.assign(m(mut(other, i2, -1)), { w: bad + 'ปะปนระหว่างภาพสองด้าน' }),
      Object.assign(m(mut(mut(cor, 0, cor[0] >= 3 ? -1 : 1), 2, cor[2] <= 1 ? 1 : -1)), { w: bad + 'ความสูงของคอลัมน์ริมสองข้างไม่ตรง' }),
      Object.assign(m(cor.map(v => 4 - v > 3 ? 3 : 4 - v)), { w: bad + 'สลับสูง-ต่ำ (กลับด้านบน-ล่าง)' }),
    ]);
    add(id, T1, 2, `กองบล็อกลูกบาศก์ในภาพ ถ้ามองจากทิศ ${view} (ตามลูกศรใต้ภาพ) จะเห็นภาพใด`, o, `มองจาก ${view}: แต่ละคอลัมน์ให้ดูจำนวนชั้นที่สูงที่สุดในแนวลึก → ซ้ายไปขวา = ${cor.join(', ')} ชั้น`, { fig: FG.iso(FG.heightsToCubes(H), { s: 22, labels: true }), tip: 'ภาพฉายแสดงเงาเท่านั้น: ความสูงของแต่ละคอลัมน์ = กองที่สูงที่สุดในแนวที่มองทะลุ' });
  }));

  /* ----- 2) นับหน้าที่ถูกทาสี (ไม่ใช่ลูกเต๋า: กองบล็อกทั่วไป) ----- */
  ['p-sp-a1', 'p-sp-a2'].forEach(id => gen(id, (id, r) => {
    const H = FG.randomStack(r, 3, 2, 5), n = H.flat().reduce((a, b) => a + b, 0), cells = H.flat().filter(v => v > 0).length, E = FG.exposedFaces(H);
    const m = v => ({ k: String(v), o: String(v) });
    let adjH = 0; H.forEach((row, y) => row.forEach((h, x) => { if (x < 2) adjH += Math.min(h, row[x + 1]); if (y < 2) adjH += Math.min(h, H[y + 1][x]); }));
    const o = build(r, Object.assign(m(E), { w: `ถูก: ทาทุกหน้าที่โผล่ = ${E} หน้า` }), [
      Object.assign(m(E - cells), { w: bad + 'ลืมนับด้านล่างของกอง' }), Object.assign(m(E + cells), { w: bad + 'นับด้านล่างซ้ำ' }),
      Object.assign(m(6 * n - 2 * adjH), { w: bad + 'ลืมว่าบล็อกที่ซ้อนกันในแนวตั้งก็สัมผัสกันด้วย' }), Object.assign(m(6 * n), { w: bad + 'ลืมหักหน้าที่ติดกัน' }), Object.assign(m(E + 2), { w: bad + 'นับเกิน' }),
    ].sort((a, b) => +a.o - +b.o));
    // ตัวเลือกตัวเลขเรียงน้อย→มาก
    const idx = o.c.map((v, i) => i).sort((a, b) => +o.c[a] - +o.c[b]); const sorted = { c: idx.map(i => o.c[i]), a: idx.indexOf(o.a), why: idx.map(i => o.why[i]) };
    add(id, T1, 3, 'กองบล็อกลูกบาศก์ขนาด 1 หน่วยวางบนพื้น ตามภาพมองจากด้านบน (ตัวเลขคือจำนวนชั้น) ถ้าทาสีทุกหน้าที่ไม่ถูกบล็อกอื่นปิดอยู่ รวมด้านล่างที่ติดพื้นด้วย จะมีกี่หน้าของลูกบาศก์เล็กที่ถูกทาสี', sorted, `นับ ด้านบน+ด้านล่าง = ${2 * cells} หน้า และหน้าข้างที่โผล่ตามผลต่างความสูงกับกองข้างเคียง → รวม ${E} หน้า\n(ตรวจ: 6×${n} − 2×คู่หน้าที่ติดกัน)`, { fig: row([['มองจากด้านบน (ตัวเลข = จำนวนชั้น)', FG.top(H, { nums: true })], ['มุมมองประกอบ', FG.iso(FG.heightsToCubes(H), { s: 16, cls: 'ofig' })]]) });
  }));

  /* ----- 3) จำนวนบล็อกน้อยสุด/มากสุดจาก 3 ภาพ ----- */
  [['p-sp-r1', 0], ['p-sp-r2', 1]].forEach(([id, wantMax]) => gen(id, (id, r) => {
    let H, mn, mx;
    for (let k = 0; k < 50; k++) { H = FG.randomStack(FG.rnd(id + k), 3, 3, 6); const cells = H.map(row => row.map(v => v > 0)); [mn, mx] = FG.blockRange(cells, FG.frontView(H), H.map(row => Math.max(...row))); if (mn < mx) break; }
    const ans = wantMax ? mx : mn, other = wantMax ? mn : mx, m = v => ({ k: String(v), o: String(v) });
    const fsum = FG.frontView(H).reduce((a, b) => a + b, 0);
    const o = build(r, Object.assign(m(ans), { w: `ถูก: ${wantMax ? 'มากสุด' : 'น้อยสุด'} = ${ans}` }), [
      Object.assign(m(other), { w: bad + `นี่คือค่า${wantMax ? 'น้อยสุด' : 'มากสุด'}` }), Object.assign(m(ans + 1), { w: bad + 'ใกล้เคียงแต่ไม่ตรง' }), Object.assign(m(ans - 1), { w: bad + 'ใกล้เคียงแต่ไม่ตรง' }), Object.assign(m(fsum), { w: bad + 'รวมแค่ภาพด้านหน้า ไม่ได้ตรวจกับภาพข้างและภาพบน' }), Object.assign(m(ans + 2), { w: bad + 'เกินความเป็นไปได้' }),
    ].filter(d => +d.o >= 1));
    const idx = o.c.map((v, i) => i).sort((a, b) => +o.c[a] - +o.c[b]);
    add(id, T1, 3, `วัตถุสร้างจากลูกบาศก์หน่วยทุกก้อนวางอยู่ติดกัน (ไม่มีช่องลอยกลางอากาศ) จากภาพบน ภาพด้านหน้า (ก) และภาพด้านข้าง (ข) จำนวนลูกบาศก์${wantMax ? 'มากที่สุด' : 'น้อยที่สุด'}ที่เป็นไปได้คือกี่ก้อน`,
      { c: idx.map(i => o.c[i]), a: idx.indexOf(o.a), why: idx.map(i => o.why[i]) },
      `ช่องที่มีบล็อกจากภาพบนคือช่องที่ต้องสูงอย่างน้อย 1 ชั้น และความสูงต้องไม่เกินทั้งภาพหน้าและภาพข้างของแถวนั้น ลองทุกการจัดที่ตรงทั้งสามภาพ → น้อยสุด ${mn}, มากสุด ${mx}`,
      { fig: row([['ภาพบน', FG.top(H)], ['ภาพหน้า (ก)', FG.elev(FG.frontView(H), { maxH: 3 })], ['ภาพข้าง (ข)', FG.elev(FG.rightView(H), { maxH: 3 })]]), tip: 'ค่ามากสุดคือเติมให้สูงเท่าที่ภาพทั้งสองอนุญาต ส่วนค่าน้อยสุดต้องเลือกช่องที่ทำให้ได้ความสูงตรงภาพโดยใช้บล็อกน้อยที่สุด' });
  }));

  /* ----- 4) พับกระดาษแล้วเจาะรู ----- */
  const pk = pts => pts.map(p => p.map(v => Math.round(v * 100))).sort((a, b) => a[0] - b[0] || a[1] - b[1]).join('|');
  const unPartial = (kind, hole, count) => { const un = FG.FOLDS[kind].un; let pts = [hole]; for (let i = un.length - 1; i >= un.length - count; i--) { const nx = []; pts.forEach(p => nx.push(p, un[i](p))); pts = nx; } return pts; };
  ['VH', 'HV', 'VV', 'D', 'DA'].forEach((kind, i) => gen('p-sp-f' + (i + 1), (id, r) => {
    const f = FG.FOLDS[kind], hole = FG.pick(r, f.holes), ok = FG.unfold(kind, hole), nF = f.un.length;
    const m = (pts, w) => ({ k: pk(pts), o: FG.paperOpt(pts), w });
    const wrongPt = [[.3, .3], [.2, .7], [.65, .65], [.4, .85], [.15, .2], [.5, .5], [.9, .9], [.1, .9], [.35, .55], [.55, .15], [.2, .45]].find(p => !ok.some(q => Math.abs(q[0] - p[0]) < .17 && Math.abs(q[1] - p[1]) < .17));
    const dists = [m([hole], bad + 'ลืมคลี่ออก มีรูเดียวตามตำแหน่งที่เจาะ'), m(ok.slice(0, ok.length - 1), bad + 'รูหายไปหนึ่งรู (ทุกชั้นของกระดาษต้องมีรู)'), m(ok.concat([wrongPt]), bad + 'มีรูเกินที่ไม่ควรมี'), m(ok.map(p => [p[1], p[0]]), bad + 'สลับแกน x–y ผิด'), m(ok.map(p => [1 - p[0], p[1]]), bad + 'สะท้อนซ้าย-ขวาผิดด้าน'), m(ok.map(p => [p[0], 1 - p[1]]), bad + 'สะท้อนบน-ล่างผิดด้าน'), m(ok.map(p => [1 - p[1], 1 - p[0]]), bad + 'สะท้อนข้ามเส้นทแยงอีกเส้น')];
    if (nF > 1) dists.splice(1, 0, m(unPartial(kind, hole, 1), bad + 'คลี่ออกแค่ครั้งสุดท้าย ลืมคลี่พับครั้งแรก'));
    const o = build(r, m(ok, `ถูก: ได้ ${ok.length} รู ตามการสะท้อนข้ามรอยพับย้อนกลับ`), dists);
    add(id, T1, nF > 1 ? 3 : 2, `พับกระดาษสี่เหลี่ยมจัตุรัสตามเส้นประในลำดับที่แสดง แล้วเจาะรูหนึ่งรูทะลุทุกชั้นตามภาพ เมื่อคลี่กระดาษออกทั้งหมดจะได้ภาพใด`, o,
      `คลี่ย้อนจากพับครั้งสุดท้ายไปครั้งแรก: รูทุกรูจะสะท้อนข้ามรอยพับแต่ละครั้ง (รูหนึ่งรู × ${Math.pow(2, nF)} = ${ok.length} รู)`, { fig: FG.foldFig(kind, hole), tip: 'ย้อนกลับทีละรอยพับ: ทุกครั้งที่คลี่ รูเดิมจะเกิดรูใหม่ที่สะท้อนข้ามเส้นพับ' });
  }));

  /* ----- 5) แผ่นคลี่และการพับเป็นกล่อง (ลวดลายบนหน้า) ----- */
  const canonNet = cells => { const tr = [(x, y) => [x, y], (x, y) => [-x, y], (x, y) => [x, -y], (x, y) => [-x, -y], (x, y) => [y, x], (x, y) => [-y, x], (x, y) => [y, -x], (x, y) => [-y, -x]]; return tr.map(t => { const c = cells.map(p => t(p[0], p[1])); const mx = Math.min(...c.map(p => p[0])), my = Math.min(...c.map(p => p[1])); return c.map(p => [p[0] - mx, p[1] - my]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).join(';'); }).sort()[0]; };
  function netPool(id, nValid, nInvalid) {
    const r = FG.rnd(id), seen = new Set(), valid = [], invalid = [];
    for (let k = 0; k < 4000 && (valid.length < nValid || invalid.length < nInvalid); k++) { const c = FG.randomHexomino(r), key = canonNet(c); if (seen.has(key)) continue; seen.add(key); if (FG.foldNet(c)) { if (valid.length < nValid) valid.push(c); } else if (invalid.length < nInvalid) invalid.push(c); }
    return { valid, invalid };
  }
  [['p-sp-n1', true], ['p-sp-n2', false]].forEach(([id, askBad]) => gen(id, (id, r) => {
    const p = netPool(id, askBad ? 4 : 1, askBad ? 1 : 4), correct = askBad ? p.invalid[0] : p.valid[0], others = askBad ? p.valid : p.invalid;
    const item = (c, w) => ({ k: canonNet(c), o: FG.netSvg(c), w });
    const o = build(r, item(correct, askBad ? 'ถูก: แผ่นนี้พับแล้วมีสองหน้าซ้อนทับกัน จึงปิดเป็นกล่องไม่ได้' : 'ถูก: พับได้ครบหกหน้าไม่ซ้ำกัน'), others.map(c => item(c, askBad ? bad + 'แผ่นนี้พับเป็นลูกบาศก์ได้' : bad + 'พับแล้วมีหน้าซ้อนทับ ปิดกล่องไม่ได้')));
    add(id, T1, 3, askBad ? 'แผ่นคลี่รูปใดต่อไปนี้ "ไม่สามารถ" พับเป็นลูกบาศก์ปิดได้' : 'แผ่นคลี่รูปใดต่อไปนี้พับเป็นลูกบาศก์ปิดได้', o, 'จำลองการกลิ้งลูกบาศก์ไปบนแผ่นคลี่ แล้วตรวจว่าทั้ง 6 ช่องแตะหน้าที่ต่างกันครบหรือไม่', { tip: 'แถวยาว 4 ช่อง (1-4-1) พับได้เสมอ; ระวังรูปที่มี 2×2 ก้อนหรือแถว 3 ช่องซ้อนกันที่จะทำให้หน้าซ้ำ' });
  }));
  const gOpt = g => FG.svg('0 0 30 30', FG.glyph(g, 15, 15, 8), 'ลวดลาย', 'ofig');
  function symNet(r) { for (; ;) { const c = FG.randomHexomino(r), face = FG.foldNet(c); if (face) { const perm = FG.shuffle(r, [0, 1, 2, 3, 4, 5]), sym = {}, byFace = {}; c.forEach((p, i) => { sym[p[0] + ',' + p[1]] = perm[i]; byFace[face[p[0] + ',' + p[1]]] = perm[i]; }); return { c, face, sym, byFace }; } } }
  gen('p-sp-n3', (id, r) => {
    const N = symNet(r), t = N.c[0], tf = N.face[t[0] + ',' + t[1]], opp = N.byFace[FG.OPP[tf]], tg = N.sym[t[0] + ',' + t[1]];
    const choices = [0, 1, 2, 3, 4, 5].filter(g => g !== tg), pos = choices.indexOf(opp);
    add(id, T1, 3, 'พับแผ่นคลี่ที่มีลวดลายเป็นลูกบาศก์ (ลวดลายอยู่ด้านนอก) ด้านที่ถูกวงกรอบสีส้มจะอยู่ตรงข้ามกับลวดลายใด', { c: choices.map(gOpt), a: pos, why: choices.map(g => g === opp ? 'ถูก: ลวดลายนี้อยู่หน้าตรงข้าม (ไม่ติดกับด้านที่วงไว้เลย)' : bad + 'หน้านี้อยู่ติดกับด้านที่วงไว้ ไม่ใช่ด้านตรงข้าม') }, 'หน้าตรงข้ามคือหน้าที่ห่างกันสองช่องในแถวเดียวกัน หรือตำแหน่งที่ถูกคั่นกลางหลังพับ — ใช้การกลิ้งทีละช่องเพื่อหาคู่ตรงข้าม', { fig: FG.netSvg(N.c, N.sym, { hl: t[0] + ',' + t[1], cls: 'fig' }) });
  });
  gen('p-sp-n4', (id, r) => {
    const N = symNet(r), cs = FG.corners(), pick1 = FG.pick(r, cs), toG = f => N.byFace[f], key = x => x.join(',');
    const ok = [toG(pick1[0]), toG(pick1[1]), toG(pick1[2])];
    const sw = cs.map(c => [toG(c[0]), toG(c[2]), toG(c[1])]).filter(x => key(x) !== key(ok));
    const opp = [], ids = [0, 1, 2, 3, 4, 5]; ids.forEach(a => ids.forEach(b => { if (a !== b && FG.OPP[a] !== b) { const c = ids.find(z => z !== a && z !== b && z !== FG.OPP[a] && z !== FG.OPP[b]); if (c !== undefined) opp.push([toG(a), toG(FG.OPP[a]), toG(c)]); } }));
    const m = (v, w) => ({ k: key(v), o: FG.cornerSvg(v[0], v[1], v[2]), w });
    const real = new Set(cs.flatMap(c => [[0, 1, 2], [1, 2, 0], [2, 0, 1]].map(s => key([toG(c[s[0]]), toG(c[s[1]]), toG(c[s[2]])]))));
    const o = build(r, m(ok, 'ถูก: สามหน้านี้มาบรรจบที่มุมเดียวกันและเรียงทิศถูกต้อง'), [m(sw.find(x => !real.has(key(x))) || sw[0], bad + 'สามหน้านี้ติดกันได้ แต่ลำดับ ซ้าย-ขวา สลับกัน (เป็นภาพสะท้อน)'), m(sw.filter(x => !real.has(key(x)))[1] || sw[1], bad + 'ลำดับรอบมุมกลับทิศ'), m(opp[0], bad + 'มีสองหน้าที่ตรงข้ามกัน ซึ่งไม่มีทางอยู่ติดกันที่มุมเดียว'), m(opp[3] || opp[1], bad + 'ลวดลายคู่นี้เป็นหน้าตรงข้าม')]);
    add(id, T1, 3, 'พับแผ่นคลี่ที่มีลวดลายตามภาพเป็นลูกบาศก์ (ลวดลายอยู่ด้านนอก) เมื่อมองที่มุมหนึ่งจะเห็นสามด้านเป็นแบบใดได้', o, 'หาว่าลวดลายใดอยู่ติดกัน (ไม่ใช่หน้าตรงข้าม) แล้วตรวจลำดับรอบมุม (ตามเข็ม/ทวนเข็ม) ให้ตรงกับแผ่นคลี่', { fig: FG.netSvg(N.c, N.sym, { cls: 'fig' }), tip: 'ตัดช้อยที่มีหน้าตรงข้ามอยู่ด้วยกันก่อน แล้วค่อยตรวจลำดับรอบมุม' });
  });

  /* ----- 6) หมุน / พลิกรูปร่าง ----- */
  ['F', 'L', 'N', 'P'].slice(0, 2).forEach((name, i) => gen('p-sp-m' + (i + 1), (id, r) => {
    const base = FG.PENT[name], rotK = FG.shuffle(r, [0, 1, 2, 3]), mk = FG.rot2(FG.mir2(base), Math.floor(r() * 4));
    const m = (c, w) => ({ k: c.join(';'), o: FG.cellsSvg(c), w });
    const rots = rotK.map(k => m(FG.rot2(base, k), `หมุน ${k * 90}° จากรูปต้นแบบได้ จึงไม่ใช่คำตอบ`));
    const o = build(r, m(mk, 'ถูก: ต้องพลิกรูปกลับด้านจึงจะได้ ไม่สามารถได้จากการหมุนอย่างเดียว'), rots);
    add(id, T1, 3, 'ข้อใดเป็นรูปที่ "ไม่สามารถ" ได้จากการหมุนรูปต้นแบบ (ห้ามพลิกกลับด้านเหมือนกระจก)', o, 'รูปต้นแบบไม่มีแกนสมมาตร ดังนั้นรูปที่เป็นภาพสะท้อนจึงไม่เท่ากับรูปใดที่ได้จากการหมุน', { fig: `<div style="max-width:130px;margin:8px auto">${FG.cellsSvg(base).replace('class="ofig"', 'class="fig"')}</div>`, tip: 'ลองหมุนรูปในใจทีละ 90° แล้วเทียบ "ปลายแขน" ว่าอยู่ซ้ายหรือขวาของแกนหลัก' });
  }));
  ['p-sp-c1', 'p-sp-c2'].forEach(id => gen(id, (id, r) => {
    const base = FG.randomPolycube(r, 6), mats = FG.shuffle(r, FG.ROTS), used = new Set(), opts = [];
    for (const mt of mats) { const c = FG.rot3(base, mt), k = FG.key(c); if (!used.has(k) && opts.length < 4) { used.add(k); opts.push(c); } }
    let mir; do { mir = FG.rot3(FG.mir3(base), FG.pick(r, FG.ROTS)); } while (used.has(FG.key(mir)));
    const m = (c, w) => ({ k: FG.key(c), o: FG.iso(c, { s: 11, cls: 'ofig' }), w });
    const o = build(r, m(mir, 'ถูก: รูปนี้เป็นภาพสะท้อนของต้นแบบ ไม่ว่าจะหมุนอย่างไรก็ทับกันไม่ได้'), opts.map(c => m(c, 'หมุนจากรูปต้นแบบได้ (เปลี่ยนมุมมองเท่านั้น)')));
    add(id, T1, 3, 'กลุ่มลูกบาศก์ 6 ก้อนในภาพต้นแบบ เมื่อหมุนในสามมิติ ข้อใดคือรูปที่ "ไม่ใช่" รูปเดิม (เป็นภาพสะท้อนในกระจก)', o, 'ตรวจจำนวนก้อนในแต่ละชั้นและตำแหน่งแขนที่ยื่นออก: รูปที่หมุนจากต้นแบบจะมีโครงสร้างเดียวกัน ส่วนภาพสะท้อนจะมี "มือ" ตรงข้ามกัน', { fig: FG.iso(base, { s: 16 }), tip: 'หาส่วนที่ยื่นออกมาเป็นจุดอ้างอิง (เช่น แขนที่ยื่นขึ้น) แล้วตามดูว่าอยู่ซ้ายหรือขวาของแกนหลัก' });
  }));

  /* ----- 7) เมทริกซ์ลวดลาย 3×3 ----- */
  const attrName = { shape: 'รูปร่าง', count: 'จำนวน', fill: 'การระบายสี' };
  [['p-sp-x1', 2], ['p-sp-x2', 2], ['p-sp-x3', 3], ['p-sp-x4', 3]].forEach(([id, diff]) => gen(id, (id, r) => {
    const co = () => FG.pick(r, [[1, 1], [1, 2], [2, 1], [2, 2], [0, 1], [1, 0]]).concat(Math.floor(r() * 3)), cs = { shape: co(), count: co(), fill: co() };
    const val = (n, i, j) => (cs[n][0] * i + cs[n][1] * j + cs[n][2]) % 3;
    const g = [0, 1, 2].map(i => [0, 1, 2].map(j => ({ shape: val('shape', i, j), count: val('count', i, j) + 1, fill: val('fill', i, j) })));
    const cor = g[2][2], shown = g.map(rw => rw.slice()); shown[2][2] = null;
    const m = (c, w) => ({ k: FG.key(c), o: FG.cellOpt(c), w });
    const ch = (a, b) => Object.assign({}, cor, { [a]: b });
    const nx = (k, v) => k === 'count' ? v % 3 + 1 : (v + 1) % 3;
    const dists = [m(ch('shape', nx('shape', cor.shape)), bad + 'รูปร่างไม่ตามกฎ'), m(ch('count', nx('count', cor.count)), bad + 'จำนวนไม่ตามกฎ'), m(ch('fill', nx('fill', cor.fill)), bad + 'การระบายสีไม่ตามกฎ'), m(Object.assign({}, cor, { shape: nx('shape', cor.shape), count: nx('count', cor.count) }), bad + 'รูปร่างและจำนวนไม่ตามกฎ'), m(Object.assign({}, cor, { count: nx('count', cor.count), fill: nx('fill', cor.fill) }), bad + 'จำนวนและสีไม่ตามกฎ'), m(ch('shape', (cor.shape + 2) % 3), bad + 'รูปร่างไม่ตามกฎ')];
    const rule = n => cs[n][0] && cs[n][1] ? 'ทุกแถวและทุกคอลัมน์มีครบสามแบบไม่ซ้ำ' : cs[n][0] === 0 ? 'เปลี่ยนไปตามคอลัมน์ ทุกแถวเหมือนกัน' : 'เปลี่ยนไปตามแถว ทุกคอลัมน์เหมือนกัน';
    const o = build(r, m(cor, `ถูก: ${attrName.shape}${'→'}${rule('shape')}, ${attrName.count}${'→'}${rule('count')}, ${attrName.fill}${'→'}${rule('fill')}`), dists);
    add(id, T1, diff, 'ภาพแต่ละแถวและแต่ละคอลัมน์มีความสัมพันธ์กันตามกฎ 3 อย่าง (รูปร่าง จำนวน การระบายสี) ช่องที่มีเครื่องหมาย ? ควรเป็นรูปใด', o, `หาทีละคุณสมบัติ — รูปร่าง: ${rule('shape')}; จำนวน: ${rule('count')}; การระบายสี: ${rule('fill')}`, { fig: FG.matrixSvg(shown), tip: 'อย่าดูภาพรวม ให้แยกพิจารณาคุณสมบัติทีละอย่างในแถวที่ครบแล้ว' });
  }));

  /* ----- 8) เฟือง สายพาน รอก (เชิงกล) ----- */
  const rpmStr = (rpm, d) => `${rpm} rpm ${dirs[d]}`;
  const gmk = (rpm, d, w) => ({ k: rpm + '/' + d, o: rpmStr(rpm, d), w });
  gen('p-sp-g1', (id, r) => { // เฟืองต่อกัน 3 ตัว ตัวกลางเป็นเฟืองคั่น
    const a = 12, b = 36, c = 18, rpm = 90, out = rpm * a / c;
    const o = build(r, gmk(out, 0, `ถูก: ${rpm}×${a}/${c} = ${out} rpm และหมุนตามเข็ม (ขบสองครั้ง ทิศกลับสองรอบ = ทิศเดิม)`), [gmk(out, 1, bad + 'ทิศผิด: ขบกันสองครั้งทิศจึงกลับมาเหมือนเดิม'), gmk(rpm * a / b, 0, bad + 'ใช้เฟืองกลาง (36 ฟัน) แทนตัวสุดท้าย เฟืองกลางไม่มีผลต่ออัตราทดรวม'), gmk(rpm * c / a, 0, bad + 'กลับอัตราส่วน (ฟันมากหมุนช้า ไม่ใช่เร็วขึ้น)'), gmk(rpm * b / a, 0, bad + 'ใช้ฟันเฟืองกลางคูณ')]);
    add(id, T2, 3, 'เฟือง A (12 ฟัน) หมุนตามเข็มด้วยอัตรา 90 รอบต่อนาที ขับเฟือง B (36 ฟัน) ซึ่งขับเฟือง C (18 ฟัน) ต่อกัน เฟือง C หมุนอย่างไร', o, 'อัตราทดรวมขึ้นกับเฟืองแรกและเฟืองสุดท้ายเท่านั้น (เฟืองกลางเป็นแค่ตัวคั่น) แต่ทิศกลับทุกครั้งที่ขบกัน', { fig: FG.gearTrainSvg([a, b, c], ['A 12', 'B 36', 'C 18'], [0, 0, 0], '↻'), tip: 'เฟืองกลางที่ขบสองด้านเรียกว่า idler — เปลี่ยนทิศ แต่ไม่เปลี่ยนอัตราทดรวม' });
  });
  gen('p-sp-g2', (id, r) => { // เฟืองสองชั้น (ติดแกนเดียวกัน)
    const a = 10, b = 30, c = 12, d = 24, rpm = 180, out = rpm * a / b * c / d;
    const o = build(r, gmk(out, 0, `ถูก: ${rpm}×(${a}/${b})×(${c}/${d}) = ${out} rpm ตามเข็ม`), [gmk(out, 1, bad + 'ทิศผิด: ขบสองครั้ง ทิศกลับมาเหมือนเดิม'), gmk(rpm * a / b * d / c, 0, bad + 'กลับอัตราส่วนครั้งที่สอง'), gmk(rpm * c / d, 0, bad + 'ข้ามขั้นแรก'), gmk(rpm * a / b, 0, bad + 'คิดแค่ขั้นแรก')]);
    add(id, T2, 3, 'เฟือง A (10 ฟัน) หมุนตามเข็มด้วย 180 รอบต่อนาที ขบกับเฟือง B (30 ฟัน) เฟือง C (12 ฟัน) ติดอยู่บนเพลาเดียวกับ B และขบกับเฟือง D (24 ฟัน) เฟือง D หมุนอย่างไร', o, 'เฟืองบนเพลาเดียวกันหมุนด้วยรอบเท่ากันและทิศเดียวกัน จึงคิดอัตราทดทีละขั้น: A→B แล้ว C→D', { fig: FG.gearTrainSvg([a, b, c, d], ['A 10', 'B 30', 'C 12', 'D 24'], [0, 0, 1, 0], '↻'), tip: 'เฟืองสีม่วง (C) ติดเพลาเดียวกับ B จึงหมุนเท่ากับ B' });
  });
  [['p-sp-g3', false, 30, 10, 120], ['p-sp-g4', true, 24, 36, 180]].forEach(([id, crossed, d1, d2, rpm]) => gen(id, (id, r) => {
    const out = rpm * d1 / d2, dir = crossed ? 1 : 0;
    const o = build(r, gmk(out, dir, `ถูก: รอบ ∝ 1/เส้นผ่านศูนย์กลาง → ${rpm}×${d1}/${d2} = ${out} rpm; สายพาน${crossed ? 'ไขว้ → ทิศกลับ' : 'เปิด → ทิศเดิม'}`), [gmk(out, 1 - dir, bad + `ทิศผิด (สายพาน${crossed ? 'ไขว้ทิศกลับ' : 'เปิดทิศเดิม'})`), gmk(rpm * d2 / d1, dir, bad + 'กลับอัตราส่วน (ล้อเล็กหมุนเร็วกว่า)'), gmk(rpm * d2 / d1, 1 - dir, bad + 'กลับอัตราส่วนและทิศผิด'), gmk(rpm, dir, bad + 'รอบไม่เปลี่ยนไม่ได้ เพราะขนาดล้อต่างกัน')]);
    add(id, T2, 2, `ล้อสายพาน A (เส้นผ่านศูนย์กลาง ${d1} cm) หมุนตามเข็มด้วย ${rpm} รอบต่อนาที ขับล้อ B (${d2} cm) ด้วยสายพานแบบ${crossed ? 'ไขว้' : 'เปิด'} ล้อ B หมุนอย่างไร`, o, 'ความเร็วเชิงเส้นของสายพานเท่ากัน → n₁d₁ = n₂d₂; สายพานเปิดหมุนทิศเดิม สายพานไขว้ทิศตรงข้าม', { fig: FG.pulleyBeltSvg(d1 / 2.2, d2 / 2.2, crossed, 'A ' + d1 + ' cm', 'B ' + d2 + ' cm') });
  }));
  [['p-sp-p1', 3, 360, 0.5], ['p-sp-p2', 4, 480, 0.25]].forEach(([id, n, load, h]) => gen(id, (id, r) => {
    const F = load / n, dd = n * h, m = (f, d, w) => ({ k: f + '/' + d, o: `${f} N, ดึงเชือก ${d} m`, w });
    const o = build(r, m(F, dd, `ถูก: เชือกรับน้ำหนัก ${n} เส้น → F = ${load}/${n} = ${F} N และดึงเชือก ${n}×${h} = ${dd} m`), [m(load / (n - 1), (n - 1) * h, bad + `นับเส้นเชือกผิด (นับ ${n - 1} เส้น)`), m(load / (n + 1), (n + 1) * h, bad + 'นับเส้นที่คนดึงรวมเข้าไปด้วย (เส้นนั้นไม่ได้รับน้ำหนักของวัตถุ)'), m(F, h, bad + 'แรงถูกแต่ระยะผิด: ได้เปรียบเชิงกลต้องแลกด้วยระยะที่ไกลขึ้น'), m(load, h, bad + 'ไม่ได้ผ่อนแรงเลย')]);
    add(id, T2, 3, `ยกวัตถุหนัก ${load} N ขึ้นสูง ${h} m ด้วยระบบรอกตามภาพ (ไม่คิดน้ำหนักรอกและแรงเสียดทาน) ต้องออกแรง F เท่าใด และต้องดึงเชือกยาวกี่เมตร`, o, 'นับเส้นเชือกที่ติดอยู่กับรอกเคลื่อนที่ (เส้นปลายที่ผู้ดึงจับไม่นับ) งานเท่าเดิม: แรงลดลง n เท่า ระยะเพิ่มขึ้น n เท่า', { fig: FG.blockTackleSvg(n, load), tip: 'F × ระยะที่ดึง = W × ระยะที่ยก' });
  }));
  }
  build({ G: 'tpat3', S: 'TPAT3', T1: 'เชิงมิติสัมพันธ์/ภาพ', T2: 'เชิงกลและฟิสิกส์', pre: 'p-sp-' });
  // ชุดย่อยสำหรับ TGAT2 ความสามารถทางมิติสัมพันธ์ (ใช้ seed ต่างกันจึงได้ภาพคนละชุดกับ TPAT3)
  build({ G: 'tgat', S: 'TGAT2', T1: 'มิติสัมพันธ์', T2: 'มิติสัมพันธ์', pre: 'g2-sp-', only: ['p-sp-v1', 'p-sp-v2', 'p-sp-f1', 'p-sp-f4', 'p-sp-m1', 'p-sp-x1', 'p-sp-x2', 'p-sp-x3'] });
})();
