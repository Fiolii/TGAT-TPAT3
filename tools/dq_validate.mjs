// ตรวจ "แพ็กโจทย์/เกร็ดความรู้ประจำวัน" ก่อนนำขึ้นเว็บ:  node tools/dq_validate.mjs data/dq/days/YYYY-MM-DD.json
//   node tools/dq_validate.mjs --coverage   → แสดงจำนวนโจทย์ต่อหัวข้อ (ใช้เลือกว่าวันนี้ควรเขียนหัวข้อไหนเพิ่ม)
// exit code 0 = ผ่านทั้งหมด ; 1 = มีข้อผิดพลาด (ห้าม push)  ข้อกำหนดทั้งหมดอยู่ใน tools/DAILY.md
import fs from 'fs'; import vm from 'vm'; import path from 'path'; import { fileURLToPath } from 'url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { console, Math, JSON, Object, Array, String, Number, Set, Map, RegExp }; vm.createContext(ctx);
for (const f of ['meta.js', 'figs.js', 'q_tpat3.js', 'q_tpat3_2.js', 'q_spatial.js', 'q_tgat.js', 'q_tgat1_2.js', 'q_tgat2_2.js', 'q_tgat3_2.js', 'q_alevel.js', 'q_math2.js', 'q_alevel_sci.js', 'q_sci_phy.js', 'q_sci_phy2.js', 'q_sci_chem.js', 'q_sci_chem2.js', 'q_sci_bio.js', 'q_sci_bio2.js', 'q_num.js', 'q_calc.js', 'q_fix.js']) { try { vm.runInContext(fs.readFileSync(path.join(root, 'data', f), 'utf8'), ctx, { filename: f }); } catch (e) { console.error('โหลดคลังโจทย์เดิมไม่ได้:', f, e.message); process.exit(1); } }
const base = vm.runInContext('QUESTIONS.map(q => JSON.parse(JSON.stringify({ id: q.id, group: q.group, subject: q.subject, topic: q.topic, q: q.q, c: q.c, a: q.a, type: q.type })))', ctx);
// ตัวช่วยตรวจ "ข้อถูกยาวที่สุดจนเดาได้": คืน {ratio, longest} ของตัวเลือกปรนัย (ข้ามตัวเลือกที่เป็นรูป/ตัวเลือกสั้นมาก)
const lenInfo = q => { if (q.type === 'num' || !Array.isArray(q.c) || q.c.some(s => String(s).startsWith('<svg'))) return null; const L = q.c.map(s => [...String(s)].length), ca = L[q.a], o = L.filter((_, i) => i !== q.a), avg = o.reduce((x, y) => x + y, 0) / o.length; return { ratio: ca / avg, longest: ca > Math.max(...o), ca, avg }; };
const daysDir = path.join(root, 'data', 'dq', 'days');
const prior = []; if (fs.existsSync(daysDir)) for (const f of fs.readdirSync(daysDir).filter(x => /^\d{4}-\d{2}-\d{2}(_\d+)?\.json$/.test(x)).sort()) { try { const d = JSON.parse(fs.readFileSync(path.join(daysDir, f), 'utf8')); (d.questions || []).forEach(q => prior.push({ ...q, _day: f })); } catch { /* ไฟล์เสียจะถูกตรวจตอนสร้าง bundle */ } }
const tax = new Set(base.map(q => [q.group, q.subject, q.topic].join('|')));
const GROUPS = { tpat3: 'TPAT3', tgat: null, alevel: null };

if (process.argv[2] === '--lengths') {
  const bad = [...base, ...prior].map(q => [q.id, lenInfo(q)]).filter(([, i]) => i && i.longest && i.ratio >= 1.25);
  const n = [...base, ...prior].filter(q => lenInfo(q)).length, lg = [...base, ...prior].filter(q => { const i = lenInfo(q); return i && i.longest; }).length;
  console.log('ปรนัยที่ตรวจความยาวได้', n, 'ข้อ · ข้อถูกยาวที่สุด', lg, 'ข้อ (' + Math.round(lg / n * 100) + '%; ถ้าสุ่มจะราว 20%) · ยาวที่สุดและเด่นชัด (≥1.25 เท่า)', bad.length, 'ข้อ'); bad.forEach(([id, i]) => console.log('  ✗', id, 'ข้อถูกยาว', i.ca, 'เฉลี่ยข้อผิด', i.avg.toFixed(0)));
  process.exit(bad.length ? 1 : 0);
}
if (process.argv[2] === '--coverage') {
  const by = {}; [...base, ...prior].forEach(q => { const k = [q.group, q.subject, q.topic].join(' | '); by[k] = (by[k] || 0) + 1; });
  console.log('จำนวนโจทย์ต่อหัวข้อ (รวมแพ็กรายวันที่มีอยู่):'); Object.entries(by).sort((a, b) => a[1] - b[1]).forEach(([k, n]) => console.log(String(n).padStart(4), k)); console.log('รวม', base.length + prior.length, 'ข้อ'); process.exit(0);
}
// --day YYYY-MM-DD [ขั้นต่ำต่อหัวข้อ=3] → ดูว่าวันนั้นแต่ละหัวข้อมีโจทย์ใหม่กี่ข้อ และหัวข้อไหนยังขาด (ใช้วางแผนเขียนแพ็กส่วนที่ 1, 2, 3 …)
if (process.argv[2] === '--day') {
  const d = process.argv[3], need = +process.argv[4] || 3; if (!/^\d{4}-\d{2}-\d{2}$/.test(d || '')) { console.error('ใช้: --day YYYY-MM-DD [ขั้นต่ำ]'); process.exit(1); }
  const c = {}; [...tax].forEach(k => c[k] = 0); prior.filter(q => q._day.startsWith(d)).forEach(q => { const k = [q.group, q.subject, q.topic].join('|'); c[k] = (c[k] || 0) + 1; });
  const rows = Object.entries(c).sort((a, b) => a[1] - b[1]); let miss = 0, total = 0;
  rows.forEach(([k, n]) => { total += n; if (n < need) miss += need - n; console.log(String(n).padStart(3), n < need ? '✗ ขาด ' + (need - n) : '✓      ', k); });
  console.log('วันที่ ' + d + ' มีโจทย์ใหม่ ' + total + ' ข้อ · ' + (miss ? 'ยังขาดอีกอย่างน้อย ' + miss + ' ข้อ ให้ครบหัวข้อละ ' + need : 'ครบทุกหัวข้อแล้ว (หัวข้อละ ≥ ' + need + ')'));
  const nextPart = (() => { let n = 1; while (fs.existsSync(path.join(daysDir, d + (n === 1 ? '' : '_' + n) + '.json'))) n++; return n; })();
  console.log('ไฟล์ถัดไปที่ต้องเขียน: ' + d + (nextPart === 1 ? '' : '_' + nextPart) + '.json' + (nextPart > 1 ? ' (id เริ่ม dq-' + d.replace(/-/g, '') + '-' + String((nextPart - 1) * 40 + 1).padStart(2, '0') + ')' : ''));
  process.exit(0);
}
const file = process.argv[2]; if (!file) { console.error('ใช้: node tools/dq_validate.mjs <ไฟล์แพ็ก.json> | --coverage'); process.exit(1); }
const errs = [], warns = []; const E = (m) => errs.push(m), W = (m) => warns.push(m);
let pack; try { pack = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { console.error('อ่าน JSON ไม่ได้:', e.message); process.exit(1); }
const fm = /(\d{4})-(\d{2})-(\d{2})(?:_(\d+))?\.json$/.exec(file.replace(/\\/g, '/')); if (!fm) E('ชื่อไฟล์ต้องเป็น YYYY-MM-DD.json หรือ YYYY-MM-DD_2.json (แพ็กส่วนที่ 2, 3, …ของวันเดียวกัน)');
const part = fm && fm[4] ? +fm[4] : 1;
const date = fm ? fm[1] + '-' + fm[2] + '-' + fm[3] : ''; if (pack.date !== date) E('ฟิลด์ date ต้องตรงกับชื่อไฟล์ (' + date + ')');
const qs = Array.isArray(pack.questions) ? pack.questions : (E('ต้องมี questions เป็นอาร์เรย์'), []), notes = Array.isArray(pack.notes) ? pack.notes : [];
if (qs.length < 12) E('วันละอย่างน้อย 12 ข้อ (ตอนนี้ ' + qs.length + ')'); if (qs.length > 40) E('วันละไม่เกิน 40 ข้อ');
if (part === 1 ? (notes.length < 2 || notes.length > 6) : notes.length > 6) E('เกร็ดความรู้ ' + (part === 1 ? 'ต้องมี 2–6 รายการ' : 'ไม่เกิน 6 รายการ (ส่วนที่ 2 ขึ้นไปไม่มีก็ได้)') + ' (ตอนนี้ ' + notes.length + ')');
const norm = s => String(s || '').toLowerCase().replace(/[\s\p{P}\p{S}]/gu, '');
const tri = s => { const t = new Set(); for (let i = 0; i + 3 <= s.length; i++) t.add(s.slice(i, i + 3)); return t; };
const jac = (a, b) => { if (!a.size || !b.size) return 0; let n = 0; a.forEach(x => { if (b.has(x)) n++; }); return n / (a.size + b.size - n); };
const selfName = path.basename(file), corpus = [...base, ...prior.filter(q => q._day !== selfName)].map(q => ({ id: q.id, t: tri(norm(q.q)) }));
const ids = new Set(), seenTxt = [], priorIds = new Set(prior.filter(q => q._day !== selfName).map(q => q.id));
const BAD = /<\s*\/?\s*(script|iframe|img|svg|style|a)\b|javascript:|on\w+\s*=|lorem ipsum|TODO|\?\?\?/i;
const str = (v, min, max, what) => { if (typeof v !== 'string' || v.trim().length < min || v.length > max) { E(what + ' ต้องเป็นข้อความยาว ' + min + '–' + max + ' ตัวอักษร'); return false; } if (BAD.test(v)) { E(what + ' มีรูปแบบที่ไม่อนุญาต (HTML/สคริปต์/ข้อความค้าง)'); return false; } return true; };
const posCount = [0, 0, 0, 0, 0], diffCount = { 1: 0, 2: 0, 3: 0 }; let longestN = 0, lenN = 0;
qs.forEach((q, i) => {
  const w = 'ข้อ ' + (i + 1) + (q && q.id ? ' (' + q.id + ')' : '');
  if (!q || typeof q !== 'object') { E(w + ' ไม่ใช่ออบเจ็กต์'); return; }
  const idm = new RegExp('^dq-' + date.replace(/-/g, '') + '-\\d{2,3}$'); if (!idm.test(q.id || '')) E(w + ': id ต้องเป็น dq-' + date.replace(/-/g, '') + '-NN (ส่วนที่ 2 เริ่ม 41, ส่วนที่ 3 เริ่ม 81 …)'); else if (ids.has(q.id)) E(w + ': id ซ้ำ'); else if (priorIds.has(q.id)) E(w + ': id ซ้ำกับแพ็กอื่นของวันเดียวกัน'); ids.add(q.id);
  if (!(q.group in GROUPS)) E(w + ': group ต้องเป็น tpat3 | tgat | alevel');
  if (!tax.has([q.group, q.subject, q.topic].join('|'))) E(w + ': หัวข้อ (group|subject|topic) ไม่มีในคลังเดิม — ใช้ชื่อให้ตรงกับที่ --coverage แสดง เพื่อให้ลิงก์ไปบทเรียนได้');
  if (![1, 2, 3].includes(q.diff)) E(w + ': diff ต้องเป็น 1–3'); else diffCount[q.diff]++;
  str(q.q, 12, 1500, w + ' โจทย์'); if (q.passage != null) str(q.passage, 20, 2500, w + ' passage'); str(q.exp, 20, 1500, w + ' วิธีทำ/เฉลย'); if (q.tip != null) str(q.tip, 3, 300, w + ' tip');
  if (q.fig != null) E(w + ': ห้ามใช้ fig (ภาพ SVG) ในแพ็กรายวัน');
  { const li = lenInfo(q); if (li) { if (li.longest) longestN++; lenN++; if (li.longest && li.ratio >= 1.2) E(w + ': ข้อถูกยาวกว่าข้อผิดอย่างเด่นชัด (' + li.ca + ' ตัวอักษร เทียบเฉลี่ยข้อผิด ' + li.avg.toFixed(0) + ') — เขียนข้อผิดให้ยาว/ละเอียดใกล้เคียงข้อถูก ไม่ให้เดาจากความยาวได้'); else if (li.longest && li.ratio >= 1.1) W(w + ': ข้อถูกเป็นตัวเลือกที่ยาวที่สุด (ลองทำให้ข้อผิดยาวขึ้นหรือทำข้อถูกให้สั้นลง)'); } }
  if (q.type === 'num') {
    if (typeof q.ans !== 'number' || !isFinite(q.ans)) E(w + ': ans ต้องเป็นตัวเลข'); if (typeof q.tol !== 'number' || !(q.tol >= 0)) E(w + ': tol ต้องเป็นตัวเลข ≥ 0'); if (q.unit != null && typeof q.unit !== 'string') E(w + ': unit ต้องเป็นข้อความ');
    if (q.group !== 'alevel') W(w + ': โจทย์ตอบเป็นตัวเลขปกติใช้กับ A-Level');
    if (q.wrong != null && !(Array.isArray(q.wrong) && q.wrong.every(x => Array.isArray(x) && x.length === 2 && x.every(y => y != null && String(y).length)))) E(w + ': wrong ต้องเป็น [[คำตอบที่ผิด, เพราะอะไร],...]');
  } else {
    if (q.type != null) E(w + ': type มีได้เฉพาะ "num"');
    if (!Array.isArray(q.c) || q.c.length !== 5) E(w + ': ต้องมี 5 ตัวเลือก (c)'); else {
      if (!q.c.every(s => str(s, 1, 400, w + ' ตัวเลือก'))) { /* รายงานแล้ว */ }
      { const lead = s => { const m = String(s).replace(/,/g, '').match(/^(−|-)?\d+(\.\d+)?/); return m && !/^[^\s]*\//.test(s) ? parseFloat(m[0].replace('−', '-')) : NaN; }, v = q.c.map(lead); if (v.every(x => !isNaN(x)) && new Set(v).size === 5) { const up = v.every((x, k) => !k || x > v[k - 1]), dn = v.every((x, k) => !k || x < v[k - 1]); if (!up && !dn) W(w + ': ตัวเลือกที่เป็นตัวเลขควรเรียงจากน้อยไปมาก'); } }
      if (new Set(q.c.map(s => String(s).replace(/s+/g, '').toLowerCase())).size !== 5) E(w + ': มีตัวเลือกซ้ำกัน');
      if (!Number.isInteger(q.a) || q.a < 0 || q.a > 4) E(w + ': a ต้องเป็น 0–4'); else posCount[q.a]++;
      if (!Array.isArray(q.why) || q.why.length !== 5) E(w + ': why ต้องเป็นอาร์เรย์ 5 ช่อง (ช่องของข้อที่ถูกเป็น "")'); else {
        q.why.forEach((x, k) => { if (k === q.a) { if (x !== '') W(w + ': why ของข้อที่ถูกควรเป็น ""'); } else if (typeof x !== 'string' || x.trim().length < 6) E(w + ': why[' + k + '] ต้องอธิบายว่าทำไมข้อนี้ผิด'); else BAD.test(x) && E(w + ': why มีรูปแบบที่ไม่อนุญาต'); });
      }
    }
  }
  const t = tri(norm(q.q)); let best = { j: 0, id: '' }; for (const o of corpus) { const j = jac(t, o.t); if (j > best.j) best = { j, id: o.id }; }
  if (best.j >= 0.55) E(w + ': โจทย์คล้ายข้อเดิมมาก (' + best.id + ' ความคล้าย ' + best.j.toFixed(2) + ') — เขียนใหม่ให้ต่างจริง');
  seenTxt.forEach(([id, tt]) => { if (jac(t, tt) >= 0.55) E(w + ': คล้ายกับ ' + id + ' ในแพ็กเดียวกัน'); }); seenTxt.push([q.id, t]);
});
if (qs.length >= 12) { const n = qs.length; if (diffCount[3] < Math.floor(n * .2)) W('ข้อยากควรมีอย่างน้อย ~35% (ตอนนี้ ' + diffCount[3] + '/' + n + ')'); if (diffCount[1] > Math.ceil(n * .35)) W('ข้อง่ายเยอะเกินไป'); const mx = Math.max(...posCount); if (mx > Math.ceil(n * .5)) W('ตำแหน่งเฉลยกระจุกตัว (แอปจะสลับให้เองอยู่แล้ว)'); }
if (lenN >= 8 && longestN / lenN > 0.3) E('ข้อถูกเป็นตัวเลือกที่ยาวที่สุดใน ' + longestN + '/' + lenN + ' ข้อ (เกิน 30%) — ผู้เรียนจะเดาจากความยาวได้ ให้ปรับตัวเลือก');
const gc = {}; qs.forEach(q => gc[q.group] = (gc[q.group] || 0) + 1); ['tpat3', 'tgat', 'alevel'].forEach(g => { if (qs.length >= 12 && !(gc[g] >= 3)) E('ต้องมีโจทย์กลุ่ม ' + g + ' อย่างน้อย 3 ข้อ'); });
const nids = new Set(); notes.forEach((nn, i) => {
  const w = 'เกร็ด ' + (i + 1); if (!nn || typeof nn !== 'object') { E(w + ' ไม่ใช่ออบเจ็กต์'); return; }
  if (!new RegExp('^dn-' + date.replace(/-/g, '') + '-\\d{2,3}$').test(nn.id || '')) E(w + ': id ต้องเป็น dn-' + date.replace(/-/g, '') + '-NN'); else if (nids.has(nn.id)) E(w + ': id ซ้ำ'); nids.add(nn.id);
  str(nn.title, 4, 80, w + ' หัวข้อ'); str(nn.body, 120, 900, w + ' เนื้อหา'); if (nn.topic != null) str(nn.topic, 2, 60, w + ' topic'); if (nn.link != null && !/^https:\/\/[^\s"'<>]+$/.test(nn.link)) E(w + ': link ต้องเป็น https:// เท่านั้น');
});
console.log('ตรวจ', file, '→ โจทย์', qs.length, 'ข้อ (กลุ่ม', JSON.stringify(gc) + ') เกร็ด', notes.length, '| ยาก/กลาง/ง่าย', diffCount[3] + '/' + diffCount[2] + '/' + diffCount[1]);
warns.forEach(m => console.log('  ⚠', m)); errs.forEach(m => console.log('  ✗', m));
if (errs.length) { console.log('ไม่ผ่าน:', errs.length, 'ข้อผิดพลาด — ห้าม commit/push จนกว่าจะแก้'); process.exit(1); }
console.log('ผ่านการตรวจ ✓');
