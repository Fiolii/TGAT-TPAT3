// ข้อมูลตั้งต้นของแอป SIXENT (แก้ไขได้)
// โครงสร้างข้อสอบอ้างอิงแนวข้อสอบ/คู่มือปี 2022 จากบทความ Trueplookpanya (ตรวจเมื่อ พ.ย. 2026)
// ตัวเลขจริงของปีที่คุณสอบอาจต่างออกไป — ตรวจประกาศล่าสุดจาก สทศ. และ mytcas.com เสมอ

const GROUPS = { tpat3: 'TPAT3', tgat: 'TGAT', alevel: 'A-Level' };
const LETTERS = ['ก', 'ข', 'ค', 'ง', 'จ'];
const R = (t, u) => ({ t, u });

const SOURCES = {
  tcas: R('mytcas.com — ระบบ TCAS (ประกาศอย่างเป็นทางการ)', 'https://www.mytcas.com/'),
  niets: R('สทศ. (NIETS) — ผู้จัดสอบ TGAT/TPAT/A-Level', 'https://www.niets.or.th/'),
  tpat3guide: R('Trueplookpanya: โครงสร้างและแนวข้อสอบ TPAT3', 'https://www.trueplookpanya.com/knowledge/content/95298'),
  tgat1guide: R('Trueplookpanya: โครงสร้าง TGAT1/TGAT2', 'https://www.trueplookpanya.com/knowledge/content/94066-edu-'),
  tgat3guide: R('Trueplookpanya: แนวข้อสอบ TGAT3', 'https://www.trueplookpanya.com/knowledge/content/95295'),
};

const EXAM_INFO = [
  { name: 'TGAT1 การสื่อสารภาษาอังกฤษ', group: 'tgat', items: '60 ข้อ (5 ตัวเลือก)', time: '60 นาที', score: '100',
    parts: ['ทักษะการพูด 30 ข้อ: ถาม-ตอบ, เติมบทสนทนาสั้น/ยาว', 'ทักษะการอ่าน 30 ข้อ: เติมข้อความ (Cloze) 15 ข้อ, อ่านจับใจความ 15 ข้อ'], src: SOURCES.tgat1guide },
  { name: 'TGAT2 การคิดอย่างมีเหตุผล', group: 'tgat', items: '80 ข้อ (5 ตัวเลือก)', time: '60 นาที', score: '100',
    parts: ['ภาษา 20 ข้อ', 'ตัวเลข 20 ข้อ', 'มิติสัมพันธ์ 20 ข้อ', 'เหตุผล 20 ข้อ'], src: SOURCES.tgat1guide },
  { name: 'TGAT3 สมรรถนะการทำงานแห่งอนาคต', group: 'tgat', items: '60 ข้อ', time: '90 นาที', score: '100',
    parts: ['การสร้างคุณค่าและนวัตกรรม 25', 'การแก้ไขปัญหาที่ซับซ้อน 25', 'การบริหารจัดการอารมณ์ 25', 'การเป็นพลเมืองที่มีส่วนร่วมของสังคม 25'], src: SOURCES.tgat3guide },
  { name: 'TPAT3 วิทยาศาสตร์ เทคโนโลยี วิศวกรรมศาสตร์', group: 'tpat3', items: '70 ข้อ', time: '180 นาที', score: '100',
    parts: ['ส่วน 1 ความถนัด (60 คะแนน): เชิงตัวเลข 15, มิติสัมพันธ์/ภาพ 15, เชิงกลและฟิสิกส์ 15', 'ส่วน 2 ความคิดและความสนใจ (40 คะแนน): การคิดวิทย์-เทค-วิศวะ 15, ความสนใจข่าว/ความรู้วิทย์-เทค-วิศวะ 10', 'เนื้อหาอ้างอิงหลักสูตรแกนกลาง'], src: SOURCES.tpat3guide },
  { name: 'A-Level (คณิต 1 / ฟิสิกส์ / เคมี / ชีววิทยา)', group: 'alevel', items: 'ตามประกาศแต่ละปี', time: '≈ 90 นาที/วิชา', score: '100 / วิชา',
    parts: ['ยังไม่ได้ยืนยันรายละเอียดจากประกาศปีล่าสุด — ตรวจที่ สทศ./mytcas'], src: SOURCES.niets },
];

// หน้าข้อสอบ: ชื่อหัวกระดาษของแต่ละชุด
const SECTIONS = {
  tpat3: { title: 'TPAT3 ความถนัดวิทยาศาสตร์ เทคโนโลยี และวิศวกรรมศาสตร์', mins: 180, per: 2.6 },
  tgat: { title: 'TGAT ความถนัดทั่วไป', mins: 60, per: 1 },
  alevel: { title: 'A-Level', mins: 90, per: 1.8 },
};

function Q(id, group, subject, topic, diff, q, c, a, exp, x) {
  return Object.assign({ id, group, subject, topic, diff, q, c, a, exp }, x || {});
}
const QUESTIONS = [];
