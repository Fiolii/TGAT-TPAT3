// รวมแพ็กรายวัน (data/dq/days/*.json) เป็นไฟล์ที่แอปโหลด:  node tools/dq_build.mjs
//   data/dq/bundle-YYYY-MM.json  = โจทย์+เกร็ดของเดือนนั้น (ใส่ฟิลด์ date ให้ทุกรายการ)
//   data/dq/manifest.json        = รายการ bundle + วันที่ล่าสุด (แอปอ่านไฟล์นี้ก่อน)
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'data', 'dq'), days = path.join(dir, 'days'); fs.mkdirSync(days, { recursive: true });
const files = fs.readdirSync(days).filter(f => /^\d{4}-\d{2}-\d{2}(_\d+)?\.json$/.test(f)).sort();
const byMonth = {}; let nq = 0, nn = 0, latest = '';
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(days, f), 'utf8')), date = f.slice(0, 10), mk = date.slice(0, 7);
  const b = byMonth[mk] || (byMonth[mk] = { month: mk, questions: [], notes: [] });
  (d.questions || []).forEach(q => { b.questions.push({ ...q, date }); nq++; }); (d.notes || []).forEach(n => { b.notes.push({ ...n, date }); nn++; }); latest = date;
}
for (const f of fs.readdirSync(dir).filter(f => /^bundle-\d{4}-\d{2}\.json$/.test(f))) if (!byMonth[f.slice(7, 14)]) fs.unlinkSync(path.join(dir, f));
const bundles = Object.keys(byMonth).sort().map(mk => { const n = 'bundle-' + mk + '.json'; fs.writeFileSync(path.join(dir, n), JSON.stringify(byMonth[mk])); return n; });
fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify({ v: 1, updated: new Date().toISOString(), latest, days: files.length, questions: nq, notes: nn, bundles }, null, 1) + '\n');
const bytes = bundles.reduce((s, n) => s + fs.statSync(path.join(dir, n)).size, 0);
console.log('สร้างแล้ว: ' + bundles.length + ' bundle · ' + files.length + ' วัน · โจทย์ ' + nq + ' ข้อ · เกร็ด ' + nn + ' · ล่าสุด ' + (latest || '-') + ' · ขนาดรวม ' + (bytes / 1e6).toFixed(2) + ' MB' + (bytes > 6e6 ? ' ⚠ เกิน 6 MB' : ''));
