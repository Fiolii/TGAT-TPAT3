// ชุดเครื่องมือสำหรับเขียนบทเรียนแบบบทความ (ใช้ร่วมกันทุกวิชา)
const RK = (() => {
  const R = (h, blocks, lead) => ({ type: 'read', h, blocks, lead });
  const E = (eq, name, vars, use) => ({ eq, name, vars, use });
  const P = p => ({ p }), FIG = (fig, cap) => ({ fig, cap }), TIP = (tip, warn) => ({ tip, warn });
  const BFIG = (name, w, h, cap) => ({ bfig: [BF[name], w, h], cap });
  const BD = (h, o) => Object.assign({ type: 'board', h }, o), DG = (h, intro, traps) => ({ type: 'danger', h, intro, traps });
  const TB = (head, rows) => ({ tbl: { head, rows } });
  // make(sims, exs) คืนอาร์เรย์สไลด์ใหม่ (sims/exs = ซิมูเลเตอร์และตัวอย่างเดิมของบท)
  function rebuild(id, make) {
    const ch = COURSE.find(c => c.id === id); if (!ch) { console.warn('ไม่พบบท', id); return; }
    const sims = ch.slides.filter(s => s.type === 'sim'), exs = ch.slides.filter(s => s.type === 'example');
    const proofs = ch.slides.filter(s => s.type === 'proof'); ch.slides = make(sims, exs, proofs); ch.article = true;
  }
  // เลือกกลุ่มภาพให้ตรงกับขั้นของครู: map[i] = ดัชนีกลุ่มที่ปรากฏเพิ่มในขั้น i (null = ไม่มีภาพใหม่)
  const STG = (name, map) => S => { const g = BF[name](S); return map.map(i => i == null ? '' : g[i]); };
  return { R, E, P, FIG, TIP, BFIG, BD, DG, TB, STG, rebuild };
})();
