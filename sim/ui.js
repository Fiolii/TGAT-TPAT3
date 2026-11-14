// เฟรมเวิร์กซิมูเลเตอร์ขนาดเล็ก: SU.sim(host, cfg) วาดบน canvas พร้อม slider/ปุ่มเล่น/ค่าที่คำนวณสด
// ซิมแต่ละตัวลงทะเบียนที่ SIMS[name] = { mount(host) → { destroy() } }
const SIMS = {};
const SU = (function () {
  const cssv = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#888';
  const colors = () => ({ ink: cssv('--ink'), mute: cssv('--mute'), pri: cssv('--pri'), pri2: cssv('--pri2'), line: cssv('--line'), ok: cssv('--ok'), bad: cssv('--bad'), warn: cssv('--warn'), card: cssv('--card') });
  const f = (n, d) => (Math.round(n * Math.pow(10, d == null ? 1 : d)) / Math.pow(10, d == null ? 1 : d)).toString();
  function txt(g, s, x, y, col, size, align) { g.fillStyle = col; g.font = `${size || 12}px "Noto Sans Thai",system-ui,sans-serif`; g.textAlign = align || 'left'; g.fillText(s, x, y); }
  function arrow(g, x1, y1, x2, y2, col, w) {
    const a = Math.atan2(y2 - y1, x2 - x1), h = 7 + (w || 2);
    g.strokeStyle = col; g.fillStyle = col; g.lineWidth = w || 2; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
    g.beginPath(); g.moveTo(x2, y2); g.lineTo(x2 - h * Math.cos(a - .4), y2 - h * Math.sin(a - .4)); g.lineTo(x2 - h * Math.cos(a + .4), y2 - h * Math.sin(a + .4)); g.closePath(); g.fill();
  }
  function line(g, x1, y1, x2, y2, col, w, dash) { g.strokeStyle = col; g.lineWidth = w || 1; g.setLineDash(dash || []); g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); g.setLineDash([]); }
  function rect(g, x, y, w, h, fill, stroke) { if (fill) { g.fillStyle = fill; g.fillRect(x, y, w, h); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = 1.5; g.strokeRect(x, y, w, h); } }
  function circ(g, x, y, r, fill, stroke, w) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = w || 1.5; g.stroke(); } }

  /* cfg: { goal, h, controls:[{id,label,min,max,step,v,unit,fmt,opts}], animate, duration, loop, draw(g,W,H,S,t,C), out(S,t) → html } */
  function sim(host, cfg) {
    host.innerHTML = `<div class="sim"><div class="simgoal"></div><canvas class="simcv" role="img" aria-label="${cfg.label || 'ซิมูเลเตอร์'}"></canvas><div class="simbtns"></div><div class="simctl"></div><div class="simout"></div></div>`;
    const root = host.firstChild, cv = root.querySelector('canvas'), g = cv.getContext('2d'), ctl = root.querySelector('.simctl'), outEl = root.querySelector('.simout'), btns = root.querySelector('.simbtns'), goal = root.querySelector('.simgoal');
    if (cfg.goal) goal.innerHTML = uni(`🎯 <b>ลองทำ:</b> ${cfg.goal}`); else goal.remove();
    const S = {}; let t = 0, playing = !!cfg.animate, raf = 0, last = 0, W = 300, H = cfg.h || 220, dead = false, C = colors(), lastOut = '';
    const H0 = H, dur = () => typeof cfg.duration === 'function' ? cfg.duration(S) : cfg.duration;
    function size() { const w = cv.clientWidth || 300, d = window.devicePixelRatio || 1; W = w; H = cfg.h || H0; cv.style.height = H + 'px'; cv.width = Math.round(w * d); cv.height = Math.round(H * d); g.setTransform(d, 0, 0, d, 0, 0); }
    (cfg.controls || []).forEach(c => {
      S[c.id] = c.v;
      const lab = document.createElement('label'); lab.className = 'simc';
      const show = v => c.opts ? c.opts[v] : (c.fmt ? c.fmt(v) : f(v, c.dec == null ? (c.step < 1 ? 2 : 0) : c.dec)) + (c.unit ? ' ' + c.unit : '');
      lab.innerHTML = uni(`<span>${c.label} <b>${show(c.v)}</b></span><input type="range" min="${c.min}" max="${c.max}" step="${c.step || 1}" value="${c.v}" aria-label="${c.label}">`);
      const inp = lab.querySelector('input'), b = lab.querySelector('b');
      inp.addEventListener('input', () => { S[c.id] = +inp.value; b.textContent = show(S[c.id]); if (c.reset) { t = 0; } draw(); });
      ctl.appendChild(lab);
    });
    if (cfg.animate) {
      const bp = document.createElement('button'), br = document.createElement('button');
      const upd = () => bp.textContent = playing ? '⏸ หยุด' : '▶ เล่น';
      bp.onclick = () => { if (!playing && t >= (dur() || 1e9)) t = 0; playing = !playing; upd(); if (playing) { last = 0; raf = requestAnimationFrame(frame); } };
      br.textContent = '↺ เริ่มใหม่'; br.onclick = () => { t = 0; playing = true; upd(); last = 0; cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); };
      upd(); btns.append(bp, br); cfg._upd = upd;
    } else btns.remove();
    function draw() {
      if (dead) return; C = colors(); g.clearRect(0, 0, W, H);
      try { cfg.draw(g, W, H, S, t, C); } catch (e) { console.error('sim draw', e); }
      if (cfg.out) { const h = cfg.out(S, t); if (h !== lastOut) { outEl.innerHTML = uni(h); lastOut = h; } }
    }
    function frame(ts) {
      if (dead) return;
      if (!document.body.contains(root)) { destroy(); return; }
      if (playing) {
        if (last) t += Math.min(0.05, (ts - last) / 1000); last = ts;
        const D = dur(); if (D && t >= D) { if (cfg.loop) t = 0; else { t = D; playing = false; if (cfg._upd) cfg._upd(); } }
        draw(); if (playing) raf = requestAnimationFrame(frame);
      }
    }
    const onResize = () => { size(); draw(); };
    window.addEventListener('resize', onResize);
    function destroy() { dead = true; cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); }
    size(); draw(); if (playing) raf = requestAnimationFrame(frame);
    return { destroy, S, draw, setT(v) { t = v; draw(); } };
  }
  return { sim, txt, arrow, line, rect, circ, f, colors, cssv };
})();
