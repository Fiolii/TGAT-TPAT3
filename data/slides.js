// สไลด์บทเรียน (ข้อความ + ภาพ + ซิมูเลเตอร์) — คีย์ต้องตรงกับ LESSONS
// type: text | sim (ชื่อใน SIMS) ; svg: สตริง SVG หรือฟังก์ชันที่คืนค่า SVG ; note: ข้อสังเกต/ทางลัด
const SLIDES = {
  'เชิงกลและฟิสิกส์': [
    { type: 'text', h: 'โจทย์เชิงกลคือการ "อ่านแรง"', bullets: ['เริ่มทุกข้อด้วยคำถาม: มีแรงอะไรกระทำ ทิศใด?', 'เลือกกฎให้ถูก: การเคลื่อนที่ (s, v, a) · แรง (F = ma) · พลังงาน · โมเมนต์', 'ตัวหลอกส่วนใหญ่มาจาก ลืมหน่วย ลืมหารสอง สลับอัตราส่วน — แต่ละสไลด์ต่อไปให้ลองปรับค่าเองเพื่อดู "ทำไม"'], svg: () => FIG.gearTrainSvg([14, 30, 18], ['A 14', 'B 30', 'C 18'], [0, 0, 0], '↻') },
    { type: 'sim', sim: 'kinematics', h: 'จลนศาสตร์: ตำแหน่ง ความเร็ว ความเร่ง', note: 'v = u + at · s = ut + ½at² · พื้นที่ใต้กราฟ v–t คือการกระจัด ถ้ากราฟอยู่ใต้แกนเวลาแปลว่ากลับทิศ' },
    { type: 'sim', sim: 'projectile', h: 'โพรเจกไทล์: แยกแนวราบกับแนวดิ่ง', note: 'แนวราบความเร็วคงที่ แนวดิ่งมี g — มุม θ และ 90°−θ ให้พิสัยเท่ากัน และ 45° ไกลสุด' },
    { type: 'sim', sim: 'newton', h: 'แรงลัพธ์และความเสียดทาน', note: 'ΣF = ma: ถ้า F ≤ μmg กล่องไม่ขยับ (a = 0) — เพิ่มมวล ความเร่งลดลง' },
    { type: 'sim', sim: 'energy', h: 'พลังงานกล: ศักย์ ↔ จลน์', note: 'ไม่คิดแรงต้าน พลังงานรวมคงที่: mgh₀ = ½mv² ที่จุดต่ำสุด → v = √(2gh₀) ไม่ขึ้นกับมวล' },
    { type: 'sim', sim: 'lever', h: 'คานและโมเมนต์', note: 'สมดุลเมื่อ ΣM = 0: m₁d₁ = m₂d₂ ใช้ระยะ "จากจุดหมุน" ไม่ใช่ความยาวคานทั้งหมด' },
    { type: 'text', h: 'เฟืองและอัตราทด', bullets: ['เฟืองที่ขบกันหมุนสวนทางกัน', 'รอบ × จำนวนฟัน เท่ากันทุกคู่ที่ขบกัน: N₁n₁ = N₂n₂ (ฟันมาก → หมุนช้า)', 'เฟืองกลาง (idler) เปลี่ยนทิศ แต่ไม่เปลี่ยนอัตราทดรวม', 'เฟืองที่ติดบนเพลาเดียวกันหมุนด้วยรอบเท่ากัน'], svg: () => FIG.gearTrainSvg([10, 30, 12, 24], ['A 10', 'B 30', 'C 12', 'D 24'], [0, 0, 1, 0], '↻'), note: 'เฟืองสีม่วงติดเพลาเดียวกับ B' },
    { type: 'sim', sim: 'gears', h: 'ลองปรับจำนวนฟันและรอบ' },
    { type: 'text', h: 'สายพานและรอก', bullets: ['สายพานเปิด: ล้อหมุนทิศเดิม · สายพานไขว้: ทิศตรงข้าม', 'ความเร็วเส้นของสายพานเท่ากัน: n₁d₁ = n₂d₂', 'รอก: แรงที่ใช้ = W ÷ จำนวนเส้นเชือกที่รับน้ำหนัก (ไม่นับเส้นที่คนดึง)'], svg: () => FIG.pulleyBeltSvg(34, 18, true, 'A', 'B') },
    { type: 'sim', sim: 'pulley', h: 'รอก: แรงลดลงแต่ระยะดึงเพิ่มขึ้น', note: 'ผลคูณ แรง × ระยะ = งาน ไม่ลดลง' },
    { type: 'sim', sim: 'circuit', h: 'วงจรอนุกรม vs ขนาน', note: 'อนุกรม: I เท่ากัน, V แบ่ง · ขนาน: V เท่ากัน, I แบ่ง; ขนานแล้ว R รวมน้อยกว่าตัวที่เล็กที่สุด' },
    { type: 'sim', sim: 'pressure', h: 'ความดันในของเหลว', note: 'ความดันเพิ่มตามความลึก ไม่ขึ้นกับรูปร่างภาชนะ: P = ρgh' },
    { type: 'sim', sim: 'buoyancy', h: 'แรงลอยตัว', note: 'วัตถุลอย: ส่วนที่จม = ρวัตถุ/ρของเหลว · ลอยเมื่อ ρวัตถุ < ρของเหลว' },
    { type: 'sim', sim: 'heat', h: 'ความร้อนและการเปลี่ยนสถานะ', note: 'ช่วงเปลี่ยนสถานะอุณหภูมิคงที่ ใช้ Q = mL; ช่วงที่อุณหภูมิเปลี่ยนใช้ Q = mcΔT' },
    { type: 'sim', sim: 'wave', h: 'คลื่น v = fλ', note: 'ความถี่เป็นของแหล่งกำเนิด; เมื่อเปลี่ยนตัวกลาง v และ λ เปลี่ยน แต่ f คงที่' },
  ],
  'ฟิสิกส์': [
    { type: 'text', h: 'ฟิสิกส์ A-Level: เชื่อมสูตรเข้ากับภาพ', bullets: ['ทุกสูตรมีเงื่อนไขการใช้ (ความเร่งคงที่, ไม่คิดแรงต้าน, อนุรักษ์พลังงาน)', 'ตรวจหน่วยก่อนและหลังคำนวณเสมอ', 'ลองสลับค่าในซิมูเลเตอร์ให้เห็นผลก่อนจำสูตร'] },
    { type: 'sim', sim: 'projectile', h: 'โพรเจกไทล์', note: 'พิสัย R = v₀² sin2θ / g' },
    { type: 'sim', sim: 'energy', h: 'อนุรักษ์พลังงานกล' },
    { type: 'sim', sim: 'circuit', h: 'กระแสและกำลังไฟฟ้า', note: 'P = I²R = V²/R = VI' },
    { type: 'sim', sim: 'wave', h: 'คลื่นและความถี่' },
    { type: 'sim', sim: 'heat', h: 'ความร้อนและสถานะ' },
  ],

  'เชิงมิติสัมพันธ์/ภาพ': [
    { type: 'text', h: 'อย่าจำรูป — ให้ "สร้างและหมุน" ในใจ', bullets: ['ข้อสอบจริงมีหลายแบบ: ภาพฉาย, พับ-เจาะกระดาษ, แผ่นคลี่, หมุน/พลิกรูป, เมทริกซ์ลวดลาย, เฟืองและสายพาน, ผังงาน', 'ใช้ "จุดอ้างอิง" (มุมพิเศษ ลวดลาย ปลายแขน) แล้วตามดูว่าไปอยู่ตรงไหน', 'ตัดช้อยที่ "ผิดแน่" ก่อน แล้วค่อยตรวจที่เหลือทีละข้อ'], svg: () => FIG.iso(FIG.heightsToCubes([[1, 2, 0], [0, 3, 1], [0, 0, 1]]), { s: 18, labels: true }) },
    { type: 'sim', sim: 'blocks3d', h: 'กองบล็อกและภาพฉาย', note: 'ภาพฉาย = ความสูงสูงสุดในแนวที่มอง · จำนวนหน้าที่ถูกทา = 6n − 2×คู่ที่ติดกัน' },
    { type: 'text', h: 'การอ่านภาพฉายอย่างเป็นระบบ', bullets: ['มองจาก ก: อ่านซ้ายไปขวาตาม x (ความสูงสูงสุดของแต่ละคอลัมน์)', 'มองจาก ข: ลำดับซ้าย–ขวากลับด้าน (y มาก → น้อย)', 'ภาพบนบอก "ว่ามีบล็อกที่ใดบ้าง" ส่วนภาพหน้า-ข้างบอก "สูงสุดเท่าใด" — ใช้สามภาพร่วมกันหาจำนวนน้อยสุด/มากสุด'], svg: () => FIG.elev([2, 3, 1], { maxH: 3, cls: 'ofig big' }) },
    { type: 'sim', sim: 'foldpunch', h: 'พับ-เจาะกระดาษ', note: 'คลี่ย้อนกลับจากรอยพับสุดท้ายไปรอยแรก: แต่ละรอยทำให้รูสะท้อนข้ามเส้นพับ' },
    { type: 'text', h: 'แผ่นคลี่ลูกบาศก์', bullets: ['แถว 4 ช่อง (1-4-1) พับเป็นลูกบาศก์ได้เสมอ', 'หน้าตรงข้ามกันคือสองช่องที่ถูกคั่นกลางหนึ่งช่องในแถวเดียวกัน', 'ห้ามมีสองช่องที่พับแล้วไปซ้อนกันที่หน้าเดียว (เช่น ก้อน 2×2)', 'ตรวจ "ตามเข็ม/ทวนเข็ม" รอบมุมเมื่อถามมุมมองสามด้าน'], svg: () => FIG.netSvg([[1, 0], [0, 1], [1, 1], [2, 1], [1, 2], [1, 3]], { '1,0': 0, '0,1': 1, '1,1': 2, '2,1': 3, '1,2': 4, '1,3': 5 }, { cls: 'ofig big' }) },
    { type: 'sim', sim: 'netfold', h: 'พับแผ่นคลี่เป็นลูกบาศก์ 3 มิติ' },
    { type: 'text', h: 'หมุนรูป vs พลิกรูป (ภาพสะท้อน)', bullets: ['การหมุนทำให้ทับกันได้ ภาพสะท้อนในกระจกทับไม่ได้', 'รูปที่มีแกนสมมาตรไม่แยกการหมุน/พลิกออก — ใช้ได้เฉพาะรูปไม่สมมาตร', 'ติดตามส่วนยื่น (แขน) ว่าอยู่ซ้ายหรือขวาของแกนหลัก'], svg: () => FIG.cellsSvg(FIG.PENT.F).replace('class="ofig"', 'class="ofig big"') + FIG.cellsSvg(FIG.mir2(FIG.PENT.F)).replace('class="ofig"', 'class="ofig big"') },
    { type: 'text', h: 'เมทริกซ์ลวดลาย 3×3', bullets: ['แยกพิจารณาทีละคุณสมบัติ: รูปร่าง จำนวน การระบายสี', 'มักเป็นกฎ "ทุกแถว/คอลัมน์มีครบสามแบบไม่ซ้ำ" หรือ "เปลี่ยนไปตามแถว/คอลัมน์"', 'ตรวจกฎกับแถวที่ครบก่อน แล้วค่อยหาช่องที่หายไป'], svg: () => FIG.matrixSvg([[{ shape: 0, count: 1, fill: 0 }, { shape: 1, count: 2, fill: 1 }, { shape: 2, count: 3, fill: 2 }], [{ shape: 1, count: 3, fill: 2 }, { shape: 2, count: 1, fill: 0 }, { shape: 0, count: 2, fill: 1 }], [{ shape: 2, count: 2, fill: 1 }, { shape: 0, count: 3, fill: 2 }, null]]), note: 'ช่อง ? ควรเป็น: สี่เหลี่ยม × 1 ชิ้น ระบายสีขาว (ตรวจดูกฎทีละคุณสมบัติ)' },
  ],
  'มิติสัมพันธ์': [
    { type: 'sim', sim: 'blocks3d', h: 'กองบล็อกและภาพฉาย' },
    { type: 'sim', sim: 'foldpunch', h: 'พับ-เจาะกระดาษ' },
    { type: 'sim', sim: 'netfold', h: 'พับแผ่นคลี่เป็นลูกบาศก์' },
  ],
  'เหตุผล': [
    { type: 'text', h: 'ตรรกะ: ดูโครงสร้าง ไม่ใช่เนื้อหา', bullets: ['ตัดเนื้อเรื่องออก เหลือแต่ "ถ้า P แล้ว Q", "ทุก A เป็น B", "บาง A เป็น B"', 'วาดแผนภาพเวนหรือตารางค่าความจริงทุกครั้งที่งง', 'ระวังการสรุปแบบ "ย้อนกลับ" (affirming the consequent)'] },
    { type: 'sim', sim: 'venn', h: 'แผนภาพเวนกับซิลโลจิซึม', note: 'ถ้า P แล้ว Q; ไม่ Q → ไม่ P เป็นจริงเสมอ (contrapositive) แต่ Q → P ไม่จริงเสมอไป' },
  ],
  'เชิงตัวเลข': [
    { type: 'text', h: 'ทำเลขให้เร็วและไม่พลาด', bullets: ['เปอร์เซ็นต์ซ้อน: คูณตัวคูณ ไม่ใช่บวกลบเปอร์เซ็นต์', 'อัตราเร็วเฉลี่ย = ระยะรวม ÷ เวลารวม', 'งานร่วมกัน: บวกอัตรา (งาน/วัน) ของแต่ละคน', 'ตรวจคำตอบด้วยการประมาณก่อนเสมอ'] },
    { type: 'sim', sim: 'percent', h: 'เพิ่มแล้วลด % เท่ากัน', note: 'สูตรลัด: เพิ่ม p% แล้วลด p% = ลดลง p²/100 %' },
    { type: 'sim', sim: 'sequence', h: 'ลำดับเลขคณิตและเรขาคณิต' },
  ],
  'คณิต: พีชคณิตและฟังก์ชัน': [
    { type: 'sim', sim: 'parabola', h: 'พาราโบลา: a, b, c ทำอะไรกับกราฟ', note: 'a บอกทิศเปิด · c คือจุดตัดแกน y · จุดยอด x = −b/2a · Δ บอกจำนวนราก' },
    { type: 'sim', sim: 'sequence', h: 'ลำดับและอนุกรม' },
  ],
  'คณิต: ตรีโกณ เวกเตอร์ เมทริกซ์': [
    { type: 'sim', sim: 'unitcircle', h: 'วงกลมหนึ่งหน่วย: cos คือ x, sin คือ y', note: 'ค่ามุมพิเศษ: 30°, 45°, 60° — sin(180° − θ) = sin θ และ cos(180° − θ) = −cos θ' },
  ],
  'คณิต: แคลคูลัสและความน่าจะเป็น': [
    { type: 'sim', sim: 'derivative', h: 'อนุพันธ์ = ความชันของเส้นสัมผัส', note: 'ค่าสูงสุด/ต่ำสุดเกิดที่ f′ = 0 และเครื่องหมายของ f′ เปลี่ยนรอบจุดนั้น' },
  ],
  'เคมี': [
    { type: 'sim', sim: 'conc', h: 'ความเข้มข้นและการเจือจาง', note: 'จำนวนโมลตัวละลายไม่เปลี่ยนเมื่อเติมน้ำ: M₁V₁ = M₂V₂' },
    { type: 'sim', sim: 'ph', h: 'pH กับไอออน H⁺ และ OH⁻', note: 'pH ต่างกัน 1 หน่วย = [H⁺] ต่างกัน 10 เท่า · เบสที่ให้ OH⁻ สองตัว (เช่น Ba(OH)₂) ให้ [OH⁻] = 2 × ความเข้มข้น' },
  ],
  'ชีววิทยา': [
    { type: 'sim', sim: 'dna', h: 'จาก DNA ถึงโปรตีน', note: 'ถอดรหัส: DNA → mRNA (ใช้ U แทน T) · แปลรหัส: mRNA ทีละ 3 เบส → กรดอะมิโน' },
    { type: 'sim', sim: 'osmosis', h: 'ออสโมซิสของเซลล์พืชและเซลล์สัตว์', note: 'น้ำเคลื่อนที่ไปทางที่สารละลายเข้มข้นกว่า · เซลล์พืชมีผนังเซลล์จึงไม่แตก' },
  ],
};
Object.keys(SLIDES).forEach(k => { if (LESSONS[k]) LESSONS[k].slides = SLIDES[k]; });

// แหล่งอ่านต่อเพิ่มเติม (ตรวจแล้วเปิดได้ทุกลิงก์) — ซิมูเลเตอร์ของ PhET (มหาวิทยาลัยโคโลราโด) ไว้ลองเล่นเพิ่ม
const PHET = n => 'https://phet.colorado.edu/en/simulations/' + n;
const XREFS = {
  'เชิงกลและฟิสิกส์': [R('PhET: Forces and Motion', PHET('forces-and-motion-basics')), R('PhET: Projectile Motion', PHET('projectile-motion')), R('PhET: Energy Skate Park', PHET('energy-skate-park-basics')), R('PhET: Circuit Construction Kit', PHET('circuit-construction-kit-dc')), R('PhET: Fluid Pressure and Flow', PHET('fluid-pressure-and-flow')), R('PhET: Balancing Act (คาน/โมเมนต์)', PHET('balancing-act')), R('PhET: States of Matter', PHET('states-of-matter-basics'))],
  'ฟิสิกส์': [R('PhET: Projectile Motion', PHET('projectile-motion')), R('PhET: Circuit Construction Kit', PHET('circuit-construction-kit-dc')), R('PhET: Wave on a String', PHET('wave-on-a-string')), R('Wikipedia: Projectile motion', 'https://en.wikipedia.org/wiki/Projectile_motion')],
  'เชิงมิติสัมพันธ์/ภาพ': [R('Wikipedia: Mental rotation', 'https://en.wikipedia.org/wiki/Mental_rotation'), R('Wikipedia: Orthographic projection', 'https://en.wikipedia.org/wiki/Orthographic_projection'), R('Wikipedia: Net (polyhedron)', 'https://en.wikipedia.org/wiki/Net_(polyhedron)')],
  'มิติสัมพันธ์': [R('Wikipedia: Mental rotation', 'https://en.wikipedia.org/wiki/Mental_rotation'), R('Wikipedia: Net (polyhedron)', 'https://en.wikipedia.org/wiki/Net_(polyhedron)')],
  'เคมี': [R('PhET: pH Scale', PHET('ph-scale')), R('PhET: Molarity', PHET('molarity')), R('Wikipedia: Le Chatelier\'s principle', 'https://en.wikipedia.org/wiki/Le_Chatelier%27s_principle')],
  'ชีววิทยา': [R('PhET: Gene Expression Basics', PHET('gene-expression-basics')), R('Wikipedia: Transcription (biology)', 'https://en.wikipedia.org/wiki/Transcription_(biology)'), R('Wikipedia: Osmosis', 'https://en.wikipedia.org/wiki/Osmosis'), R('Wikipedia: Hardy–Weinberg principle', 'https://en.wikipedia.org/wiki/Hardy%E2%80%93Weinberg_principle')],
  'คณิต: พีชคณิตและฟังก์ชัน': [R('PhET: Graphing Quadratics', PHET('graphing-quadratics')), R('PhET: Function Builder', PHET('function-builder'))],
  'คณิต: ตรีโกณ เวกเตอร์ เมทริกซ์': [R('PhET: Trig Tour', PHET('trig-tour')), R('Khan Academy: Trigonometry', 'https://www.khanacademy.org/math/trigonometry')],
  'คณิต: แคลคูลัสและความน่าจะเป็น': [R('Wikipedia: Integral', 'https://en.wikipedia.org/wiki/Integral')],
  'เหตุผล': [R('Wikipedia: Venn diagram', 'https://en.wikipedia.org/wiki/Venn_diagram')],
};
Object.entries(XREFS).forEach(([k, a]) => { if (LESSONS[k]) LESSONS[k].refs.push(...a); });
