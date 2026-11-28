// ตรวจไฟล์ข้อมูลข่าว: node tools/validate.mjs
// ผ่าน = exit 0 และพิมพ์ id ถัดไปที่ต้องใช้
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const ctx = { window: {} };
vm.createContext(ctx);
const errs = [];
for (const f of ["data/news.js", "data/summary.js"]) {
  try { vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx, { filename: f }); }
  catch (e) { errs.push(`${f}: อ่านไม่ได้ (${e.message})`); }
}
const news = ctx.window.STEM_NEWS, sum = ctx.window.STEM_SUMMARY;
if (!Array.isArray(news)) errs.push("ไม่พบ window.STEM_NEWS เป็น array");
if (!sum || typeof sum.months !== "object" || !sum.year) errs.push("ไม่พบ window.STEM_SUMMARY ที่มี months และ year");

const CATS = ["space", "ai", "bio", "phys", "energy", "eng"];
const ids = new Set(), titles = new Set(), urls = new Map();
let maxId = 0;
for (const [i, n] of (news || []).entries()) {
  const at = `ข่าวลำดับ ${i + 1} (${n && n.id})`;
  if (!n || typeof n !== "object") { errs.push(`${at}: ไม่ใช่ object`); continue; }
  if (!/^n\d{4}$/.test(n.id || "")) errs.push(`${at}: id ต้องเป็นรูปแบบ n0001`);
  else { if (ids.has(n.id)) errs.push(`${at}: id ซ้ำ`); ids.add(n.id); maxId = Math.max(maxId, +n.id.slice(1)); }
  const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(n.d || "");
  if (!m || +m[2] < 1 || +m[2] > 12 || (m[3] && (+m[3] < 1 || +m[3] > 31))) errs.push(`${at}: d ต้องเป็น YYYY-MM-DD หรือ YYYY-MM`);
  else if (n.d.slice(0, 10) > new Date().toLocaleDateString("sv-SE")) errs.push(`${at}: วันที่อยู่ในอนาคต`);
  if (!["thai", "intl"].includes(n.reg)) errs.push(`${at}: reg ต้องเป็น thai หรือ intl`);
  if (!CATS.includes(n.cat)) errs.push(`${at}: cat ต้องเป็นหนึ่งใน ${CATS.join(", ")}`);
  for (const k of ["t", "s"]) if (typeof n[k] !== "string" || n[k].trim().length < 8) errs.push(`${at}: ${k} สั้นหรือว่าง`);
  if (n.t) { const key = n.t.trim().toLowerCase(); if (titles.has(key)) errs.push(`${at}: หัวข่าวซ้ำ`); titles.add(key); }
  if (!Array.isArray(n.src) || !n.src.length) errs.push(`${at}: ต้องมี src อย่างน้อย 1 แหล่ง`);
  else for (const s of n.src) {
    if (!Array.isArray(s) || s.length !== 2 || !/^https?:\/\/\S+$/.test(s[1] || "")) { errs.push(`${at}: src ต้องเป็น [ชื่อ, url]`); continue; }
    if (urls.has(s[1]) && urls.get(s[1]) !== n.id && !/archive|tag|news\/space_time|\?p=|summary/.test(s[1]))
      errs.push(`${at}: url ซ้ำกับข่าว ${urls.get(s[1])} (ข่าวเดียวกันหรือเปล่า?)`);
    urls.set(s[1], n.id);
  }
  for (const k of ["nobel", "verify"]) if (k in n && typeof n[k] !== "boolean") errs.push(`${at}: ${k} ต้องเป็น true/false`);
}

if (errs.length) { console.error("ไม่ผ่าน:\n- " + errs.join("\n- ")); process.exit(1); }
const today = new Date().toLocaleDateString("sv-SE");
const thisMonth = today.slice(0, 7);
console.log(`ผ่าน: ${news.length} ข่าว (ไทย ${news.filter(n => n.reg === "thai").length}) · ข่าววันนี้ ${news.filter(n => n.d === today).length} · เดือนนี้ ${news.filter(n => n.d.startsWith(thisMonth)).length}`);
console.log(`id ถัดไป: n${String(maxId + 1).padStart(4, "0")}`);
