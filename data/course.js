// หลักสูตรรายบท: แต่ละบท = สไลด์สอน (แนวคิด → สูตร → ตัวอย่างทำให้ดู → ซิมูเลเตอร์ → กับดัก)
// จัดตามโครงสร้างทางการของ mytcas blueprint (ส่วน/หัวข้อ) และตัวชี้วัดแกนกลาง สสวท./สพฐ.
const COURSE = [];
const cT = (h, bullets, o) => Object.assign({ type: 'text', h, bullets }, o || {});
const cF = (h, rows, o) => Object.assign({ type: 'formula', h, rows }, o || {});                 // rows: [[สูตร, ความหมาย], ...]
const cX = (h, q, steps, ans, o) => Object.assign({ type: 'example', h, q, steps, ans }, o || {}); // ตัวอย่างทำให้ดูทีละขั้น
const cK = (h, bullets, o) => Object.assign({ type: 'text', h, bullets, cls: 'trap' }, o || {});    // กับดักที่พบบ่อย
const cSM = (sim, h, note) => ({ type: 'sim', sim, h, note });
const cWK = (t, p) => R('Wikipedia: ' + t, 'https://en.wikipedia.org/wiki/' + p);
// (ในไฟล์บทเรียนใช้ชื่อสั้น T/F/X/K/SM/WK ผ่านการกำหนดค่าภายใน IIFE เพื่อไม่ชนกับตัวแปรของแอป)
// CH(รหัส, กลุ่ม, วิชา, ส่วน, ชื่อบท, หัวข้อโจทย์ที่เชื่อมไป, บทนำ, [สไลด์], [แหล่งอ้างอิง])
function CH(id, group, subject, part, title, topic, intro, slides, refs) { COURSE.push({ id, group, subject, part, title, topic, intro, slides, refs: refs || [] }); }
