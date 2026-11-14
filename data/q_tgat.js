// โจทย์ TGAT1-3 — เขียนใหม่ตามโครงสร้างข้อสอบ (ไม่ใช่ข้อสอบจริง)
(function () {
  const G = 'tgat';
  const add = (...a) => QUESTIONS.push(Q(...a));
  const E1 = 'TGAT1', E2 = 'TGAT2', E3 = 'TGAT3';

  // ---------- TGAT1 บทสนทนาสั้น ----------
  const T1 = 'บทสนทนาสั้น';
  add('g1-01', G, E1, T1, 1, 'A: Would you mind closing the window?\nB: ______', ['Yes, I would.', 'Not at all.', 'It is a window.', 'I don\'t mind to.', 'No, I closed.'], 1, '"Would you mind...?" ถามว่ารังเกียจไหม → ยินดีทำให้ตอบ "Not at all." (ไม่เลย) ส่วน "Yes, I would." แปลว่ารังเกียจ');
  add('g1-02', G, E1, T1, 1, 'A: Thank you so much for helping me with my project.\nB: ______', ['Never mind.', 'My pleasure.', 'Excuse me.', 'Good luck.', 'I\'m sorry.'], 1, 'ตอบรับคำขอบคุณ: My pleasure / You\'re welcome / No problem');
  add('g1-03', G, E1, T1, 1, 'A: I\'m sorry I\'m late. The traffic was terrible.\nB: ______', ['That\'s all right.', 'Congratulations!', 'Same to you.', 'I\'m afraid not.', 'You\'re welcome.'], 0, 'รับคำขอโทษ: That\'s all right / No problem / Never mind');
  add('g1-04', G, E1, T1, 1, 'A: Shall we have lunch together?\nB: ______', ['Yes, we shall not.', 'That sounds great.', 'It was delicious.', 'No, thanks for coming.', 'I\'m having lunch yesterday.'], 1, 'Shall we...? เป็นคำชวน ตอบรับด้วย That sounds great / Good idea');
  add('g1-05', G, E1, T1, 2, 'A: How do you like the new library?\nB: ______', ['I like to read.', 'It\'s very quiet and has a lot of books.', 'Yes, I do like.', 'I go there by bus.', 'The library opens at 8.'], 1, '"How do you like...?" ถามความคิดเห็น → ต้องตอบเป็นความรู้สึก/ความเห็น');
  add('g1-06', G, E1, T1, 2, 'A: Could you tell me how to get to the station?\nB: ______', ['By train, of course.', 'Go straight and turn left at the second traffic light.', 'It takes two hours.', 'I\'m going there.', 'Yes, I could.'], 1, 'ถามเส้นทาง → ตอบทิศทาง');
  add('g1-07', G, E1, T1, 2, 'A: I\'d like to book a table for four at 7 p.m.\nB: ______', ['Certainly. May I have your name, please?', 'I like four seats.', 'The food is ready.', 'Please sit down.', 'No, I booked.'], 0, 'พนักงานร้านอาหารรับจอง → ขอชื่อผู้จอง');
  add('g1-08', G, E1, T1, 2, 'A: Do you mind if I sit here?\nB: ______', ['Yes, please sit.', 'Go ahead.', 'No, I\'m not.', 'It is mine.', 'Sit down, please yes.'], 1, 'Do you mind if...? ตอบอนุญาตด้วย "Go ahead / Not at all / Please do" (ไม่ใช้ Yes ซึ่งแปลว่าไม่อนุญาต)');

  // ---------- TGAT1 บทสนทนายาว ----------
  const T2 = 'บทสนทนายาว';
  const d1 = 'Mina: Hi, Ken. You look tired.\nKen: (1) ______ I stayed up until 2 a.m. finishing my physics project.\nMina: That\'s too late! Did you finish it?\nKen: Almost. (2) ______\nMina: I can help you check the calculations after class.';
  add('g1-09', G, E1, T2, 2, 'เติมช่องว่าง (1)', ['I\'m fine, thank you.', 'Yes, I am. I didn\'t get much sleep.', 'No, I\'ve been sleeping all day.', 'Not at all.', 'I\'m looking for my project.'], 1, 'Ken ตอบว่าดูเหนื่อย → ยืนยันแล้วให้เหตุผลตามด้วย "I stayed up until 2 a.m." ทำให้ (1) ต้องเกี่ยวกับการนอนน้อย', { passage: d1 });
  add('g1-10', G, E1, T2, 2, 'เติมช่องว่าง (2)', ['I still need someone to double-check my calculations.', 'I will never do it again.', 'It was easy for me.', 'I have a lot of free time.', 'Physics is not important.'], 0, 'Mina ตอบว่า "I can help you check the calculations" → ประโยคก่อนหน้าต้องพูดถึงการตรวจการคำนวณ', { passage: d1 });
  const d2 = 'Clerk: Good morning. How can I help you?\nCustomer: (1) ______ It doesn\'t turn on.\nClerk: Did you try charging it?\nCustomer: Yes, for two hours, but nothing happens.\nClerk: (2) ______';
  add('g1-11', G, E1, T2, 2, 'เติมช่องว่าง (1)', ['I bought this laptop last week, but it has a problem.', 'I want to buy a new bag.', 'Where is the nearest bank?', 'Do you sell fruit?', 'Can I borrow a pen?'], 0, 'ประโยคถัดไปคือ "It doesn\'t turn on." ต้องมีสิ่งของที่ "it" อ้างถึง → laptop', { passage: d2 });
  add('g1-12', G, E1, T2, 2, 'เติมช่องว่าง (2)', ['Please come back tomorrow without it.', 'Let me check it. It may be a battery problem.', 'You should eat more vegetables.', 'It\'s a nice day today.', 'I don\'t sell laptops.'], 1, 'พนักงานบริการควรเสนอตรวจสอบและวิเคราะห์สาเหตุ', { passage: d2 });

  // ---------- TGAT1 Cloze ----------
  const T3 = 'เติมข้อความ (Cloze)';
  const cz = 'Many students feel stressed before exams. One way to (1) ______ stress is to make a study plan. (2) ______ you divide the work into small parts, it feels easier to finish. It is also important to get enough sleep, (3) ______ the brain needs rest to remember information. Some students prefer studying in groups, (4) ______ others work better alone. (5) ______, you should choose the method that suits you best.';
  add('g1-13', G, E1, T3, 1, 'เติมช่องว่าง (1)', ['reduce', 'increase', 'ignore', 'create', 'forget'], 0, 'make a study plan ช่วย "ลด" ความเครียด → reduce', { passage: cz });
  add('g1-14', G, E1, T3, 2, 'เติมช่องว่าง (2)', ['Although', 'When', 'Because of', 'Unless', 'Despite'], 1, 'ต้องการเงื่อนไข/เวลา "เมื่อ/ถ้าคุณแบ่งงานเป็นส่วนเล็ก ๆ" → When (Because of/Despite ต้องตามด้วยนาม)', { passage: cz });
  add('g1-15', G, E1, T3, 2, 'เติมช่องว่าง (3)', ['so', 'because', 'but', 'although', 'however'], 1, 'ประโยคหลังคือเหตุผลของการนอนให้พอ → because', { passage: cz });
  add('g1-16', G, E1, T3, 2, 'เติมช่องว่าง (4)', ['while', 'because', 'so', 'unless', 'since'], 0, 'เปรียบเทียบสองฝ่าย (บางคนชอบกลุ่ม ในขณะที่คนอื่นชอบคนเดียว) → while (ในขณะที่)', { passage: cz });
  add('g1-17', G, E1, T3, 2, 'เติมช่องว่าง (5)', ['However', 'Therefore', 'For example', 'Besides', 'Meanwhile'], 1, 'สรุปตอนท้ายจากเนื้อหาข้างต้น → Therefore (ดังนั้น)', { passage: cz });
  add('g1-18', G, E1, T3, 2, 'If I ______ more time, I would join the robotics club.', ['have', 'had', 'will have', 'having', 'has'], 1, 'Conditional type 2 (สมมติตรงข้ามกับปัจจุบัน): If + V2, would + V1');

  // ---------- TGAT1 อ่านจับใจความ ----------
  const T4 = 'อ่านจับใจความ';
  const r1 = 'Solar panels convert sunlight into electricity. They work best on sunny days but still produce some power when it is cloudy. Installing them on rooftops can reduce electricity bills, although the initial cost is high. In Thailand, where sunshine is abundant, many households are choosing solar energy.';
  add('g1-19', G, E1, T4, 1, 'ใจความสำคัญของข้อความคือข้อใด', ['Solar panels are too expensive to use.', 'Solar energy is a practical option, especially in sunny places.', 'Cloudy days stop solar panels completely.', 'Thailand has no sunshine.', 'Electricity bills are always high.'], 1, 'ข้อความอธิบายหลักการ ประโยชน์ ข้อเสีย และการนำไปใช้ในไทยที่มีแดดมาก → สรุปว่าเป็นทางเลือกที่ใช้ได้จริง', { passage: r1 });
  add('g1-20', G, E1, T4, 2, 'ข้อใดเป็นข้อเสียของแผงโซลาร์เซลล์ตามข้อความ', ['They do not work on sunny days.', 'The initial cost is high.', 'They increase electricity bills.', 'They only work at night.', 'They are not used in Thailand.'], 1, 'ข้อความระบุ "although the initial cost is high"', { passage: r1 });
  add('g1-21', G, E1, T4, 2, 'อนุมานได้ว่าอย่างไรเกี่ยวกับวันที่มีเมฆ', ['Panels produce no electricity.', 'Panels still produce some electricity.', 'Panels produce more power than on sunny days.', 'Panels are removed.', 'Panels need rain to work.'], 1, 'ข้อความ: "still produce some power when it is cloudy"', { passage: r1 });
  add('g1-22', G, E1, T4, 2, 'คำว่า "abundant" ในข้อความใกล้เคียงกับความหมายใดที่สุด', ['rare', 'plentiful', 'dangerous', 'weak', 'expensive'], 1, 'abundant = มีมาก/อุดมสมบูรณ์ = plentiful', { passage: r1 });
  const r2 = 'Robotics clubs are becoming popular in high schools. Members design, build and program robots to complete tasks such as moving objects or following a line. Beyond technical skills, students learn teamwork and problem-solving, because projects often fail the first time and must be improved. Many universities consider this experience valuable for engineering applicants.';
  add('g1-23', G, E1, T4, 2, 'จุดประสงค์ของผู้เขียนคือข้อใด', ['To advertise a specific robot', 'To inform readers about the benefits of robotics clubs', 'To complain about school projects', 'To compare two universities', 'To teach how to program'], 1, 'บทความให้ข้อมูลเรื่องกิจกรรมและประโยชน์ของชมรมหุ่นยนต์ (น้ำเสียงให้ข้อมูล)', { passage: r2 });
  add('g1-24', G, E1, T4, 2, 'ตามข้อความ นักเรียนได้เรียนรู้ทักษะใดนอกเหนือจากทักษะเทคนิค', ['Cooking and dancing', 'Teamwork and problem-solving', 'Public speaking only', 'Drawing only', 'Language translation'], 1, 'ระบุตรง ๆ: "students learn teamwork and problem-solving"', { passage: r2 });
  add('g1-25', G, E1, T4, 3, 'ข้อใดอนุมานได้ว่าเป็นเหตุผลที่ทำให้นักเรียนได้ฝึกแก้ปัญหา', ['Robots never fail.', 'Projects often fail at first and must be improved.', 'Members do not need to design anything.', 'Clubs are required by law.', 'Universities run the clubs.'], 1, '"because projects often fail the first time and must be improved" ให้เหตุผลของการฝึกแก้ปัญหา', { passage: r2 });

  // ---------- TGAT2 ภาษา ----------
  const L = 'ภาษา';
  add('g2-01', G, E2, L, 1, 'แพทย์ : โรงพยาบาล = ครู : ?', ['นักเรียน', 'โรงเรียน', 'หนังสือ', 'ห้องสมุด', 'กระดาน'], 1, 'ความสัมพันธ์ ผู้ประกอบอาชีพ : สถานที่ทำงานหลัก');
  add('g2-02', G, E2, L, 1, 'มีด : หั่น = เลื่อย : ?', ['ตัด', 'ปลูก', 'ต่อ', 'ทา', 'ผสม'], 0, 'เครื่องมือ : หน้าที่ — เลื่อยใช้ตัด (มีดใช้หั่น/ตัด)');
  add('g2-03', G, E2, L, 1, 'ร้อน : เย็น = สว่าง : ?', ['แดด', 'มืด', 'ไฟ', 'ดวงจันทร์', 'ใส'], 1, 'ความสัมพันธ์ ตรงข้าม');
  add('g2-04', G, E2, L, 2, 'นิ้ว : มือ = ใบ : ?', ['ต้นไม้', 'ลม', 'น้ำ', 'ผลไม้', 'ดิน'], 0, 'ส่วนประกอบ : สิ่งทั้งหมด (นิ้วเป็นส่วนของมือ ใบเป็นส่วนของต้นไม้)');
  add('g2-05', G, E2, L, 2, '"การออกกำลังกายสม่ำเสมอช่วยลดความเสี่ยงของโรคหัวใจ แต่ไม่ได้รับประกันว่าจะไม่เป็นโรค" ข้อใดสรุปได้เหมาะสมที่สุด', ['การออกกำลังกายทำให้ไม่เป็นโรคหัวใจแน่นอน', 'การออกกำลังกายไม่มีผลต่อโรคหัวใจ', 'การออกกำลังกายลดความเสี่ยงแต่ไม่ได้รับประกัน', 'โรคหัวใจเกิดเฉพาะคนไม่ออกกำลังกาย', 'ไม่ควรออกกำลังกาย'], 2, 'สรุปตามข้อความ: ลดความเสี่ยง (ไม่ใช่ป้องกัน 100%)');
  add('g2-06', G, E2, L, 2, 'เรียงข้อความให้ได้ใจความ: ก) จึงต้องวางแผนการเดินทางล่วงหน้า  ข) ในช่วงเทศกาลมีผู้เดินทางกลับบ้านจำนวนมาก  ค) การจราจรจึงติดขัดมาก', ['ก ข ค', 'ข ก ค', 'ข ค ก', 'ค ข ก', 'ก ค ข'], 2, 'ลำดับเหตุ → ผล → ข้อเสนอ: ข (สถานการณ์) → ค (ผล) → ก (แนวทาง)');

  // ---------- TGAT2 ตัวเลข ----------
  const N = 'ตัวเลข';
  add('g2-07', G, E2, N, 1, 'อนุกรม 3, 5, 9, 17, 33, ?', ['49', '57', '65', '67', '69'], 2, 'ผลต่าง 2, 4, 8, 16 → ต่อไปต่าง 32 → 33 + 32 = 65');
  add('g2-08', G, E2, N, 2, 'ราคาสินค้าเพิ่มขึ้น 20% แล้วลดลง 20% ราคาสุดท้ายเทียบกับราคาเดิม', ['เท่าเดิม', 'ลดลง 4%', 'เพิ่มขึ้น 4%', 'ลดลง 2%', 'เพิ่มขึ้น 2%'], 1, '1.2 × 0.8 = 0.96 → ลดลง 4%');
  add('g2-09', G, E2, N, 1, 'อนุกรม 2, 3, 5, 9, 17, ?', ['25', '29', '31', '33', '35'], 3, 'ผลต่าง 1, 2, 4, 8 → ต่อไปต่าง 16 → 33');
  add('g2-10', G, E2, N, 1, 'ปากกา 3 ด้ามราคา 45 บาท ปากกา 7 ด้ามราคากี่บาท', ['95', '100', '105', '110', '115'], 2, 'ราคาต่อด้าม = 15 → 7 × 15 = 105');
  add('g2-11', G, E2, N, 2, 'ค่าเฉลี่ยคะแนนสอบ 5 วิชาเท่ากับ 80 ถ้า 4 วิชาแรกรวมกันได้ 310 คะแนน วิชาที่ 5 ได้กี่คะแนน', ['80', '85', '88', '90', '95'], 3, 'ผลรวมทั้งหมด = 5 × 80 = 400 → วิชาที่ 5 = 400 − 310 = 90');
  add('g2-12', G, E2, N, 1, 'อัตราส่วนนักเรียนชายต่อหญิงเป็น 3 : 2 มีนักเรียนทั้งหมด 40 คน มีนักเรียนชายกี่คน', ['16', '20', '24', '25', '30'], 2, 'ชาย = 3/5 × 40 = 24 คน');
  add('g2-13', G, E2, N, 2, 'ราคาสินค้าหลังลด 30% เป็น 350 บาท ราคาเดิมเท่าใด', ['450', '480', '500', '550', '600'], 2, '0.70 × ราคาเดิม = 350 → ราคาเดิม = 500');

  // ---------- TGAT2 มิติสัมพันธ์ ----------
  const SP = 'มิติสัมพันธ์';
  add('g2-14', G, E2, SP, 1, 'ลูกบาศก์ 3×3×3 ทาสี ตัดเป็นลูกเล็ก 1×1×1 มีกี่ลูกที่ไม่ถูกทาเลย', ['0', '1', '6', '8', '12'], 1, '(n−2)³ = 1 ลูกอยู่ตรงกลาง');
  add('g2-15', G, E2, SP, 1, 'ลูกบาศก์ 4×4×4 ทาสี ตัดเป็นลูกเล็ก มีกี่ลูกที่ถูกทาสามด้าน', ['4', '8', '12', '16', '24'], 1, 'ลูกสามด้านคือมุมของลูกบาศก์ = 8 ลูกเสมอ');
  add('g2-16', G, E2, SP, 2, 'ปริซึมสามเหลี่ยมมีกี่ขอบ', ['6', '8', '9', '10', '12'], 2, 'ฐานสามเหลี่ยม 2 อัน อันละ 3 ขอบ = 6 + ขอบด้านข้าง 3 = 9');
  add('g2-17', G, E2, SP, 2, 'ลูกเต๋ามาตรฐานผลรวมหน้าตรงข้ามเท่ากับ 7 ถ้าหน้าบนเป็น 3 หน้าล่างเป็นเลขใด', ['1', '2', '3', '4', '5'], 3, 'หน้าตรงข้ามรวมกัน 7 → 7 − 3 = 4');
  add('g2-18', G, E2, SP, 2, 'นาฬิกาแสดงเวลา 4:10 เมื่อมองผ่านกระจกเงาจะเห็นเวลาเป็น', ['7:50', '8:50', '7:10', '4:50', '8:10'], 0, '12:00 − 4:10 = 7:50');

  // ---------- TGAT2 เหตุผล ----------
  const R = 'เหตุผล';
  add('g2-19', G, E2, R, 1, 'วิศวกรทุกคนเป็นผู้แก้ปัญหา และผู้แก้ปัญหาทุกคนเป็นผู้ช่างสังเกต สรุปได้ว่า', ['ผู้ช่างสังเกตทุกคนเป็นวิศวกร', 'วิศวกรทุกคนเป็นผู้ช่างสังเกต', 'วิศวกรบางคนไม่ช่างสังเกต', 'ผู้แก้ปัญหาบางคนเป็นผู้ที่ไม่ช่างสังเกต', 'สรุปไม่ได้'], 1, 'ทุก A เป็น B, ทุก B เป็น C → ทุก A เป็น C (ย้อนกลับไม่ได้)');
  add('g2-20', G, E2, R, 2, 'ถ้าฝนตกแล้วถนนจะเปียก ตอนนี้ถนนไม่เปียก สรุปได้ว่า', ['ฝนตก', 'ฝนไม่ตก', 'ฝนอาจตก', 'ฝนตกหนัก', 'สรุปไม่ได้'], 1, 'Modus tollens: ถ้า P แล้ว Q; ไม่ Q → ไม่ P');
  add('g2-21', G, E2, R, 2, 'ถ้าสอบผ่านจะได้รับใบประกาศ สมชายได้รับใบประกาศ สรุปอย่างสมเหตุสมผลได้ว่า', ['สมชายสอบผ่านแน่นอน', 'สมชายสอบไม่ผ่าน', 'ทุกคนสอบผ่าน', 'สรุปแน่นอนไม่ได้ว่าสมชายสอบผ่านหรือไม่', 'สมชายเป็นผู้สอบคะแนนสูงสุด'], 3, 'ได้ใบประกาศ (Q) → สรุป P (สอบผ่าน) ไม่ได้ เพราะอาจได้ใบประกาศด้วยเหตุอื่น (ยืนยันผล)');
  add('g2-22', G, E2, R, 2, 'ห้าคนเรียงแถว: ก อยู่หน้า ข, ข อยู่หน้า ค (ติดกันหรือไม่ก็ได้), ง อยู่หลังสุด, จ อยู่หน้าสุด ใครอยู่ตรงกลางแถว (ลำดับที่ 3)', ['ก', 'ข', 'ค', 'ง', 'จ'], 1, 'จ ต้องที่ 1, ง ที่ 5 → ที่เหลือ 2–4 เรียง ก ข ค\nลำดับ: จ, ก, ข, ค, ง → ลำดับที่ 3 คือ ข');
  add('g2-23', G, E2, R, 2, 'สมาชิกชมรมหุ่นยนต์ทุกคนเก่งคอมพิวเตอร์ และนักเรียนบางคนในห้อง ม.6/1 เป็นสมาชิกชมรมหุ่นยนต์ สรุปได้อย่างแน่นอนว่า', ['นักเรียนทุกคนในห้อง ม.6/1 เก่งคอมพิวเตอร์', 'นักเรียนบางคนในห้อง ม.6/1 เก่งคอมพิวเตอร์', 'ไม่มีใครในห้อง ม.6/1 เก่งคอมพิวเตอร์', 'ทุกคนที่เก่งคอมพิวเตอร์เป็นสมาชิกชมรมหุ่นยนต์', 'สมาชิกชมรมหุ่นยนต์ทุกคนอยู่ ม.6/1'], 1, 'สมาชิกชมรมบางคนอยู่ในห้อง ม.6/1 และสมาชิกชมรมเก่งคอมพิวเตอร์ → บางคนในห้องนั้นเก่งคอมพิวเตอร์');
  add('g2-24', G, E2, R, 1, 'A สูงกว่า B, B สูงกว่า C, D เตี้ยกว่า C ใครเตี้ยที่สุด', ['A', 'B', 'C', 'D', 'สรุปไม่ได้'], 3, 'ลำดับความสูง: A > B > C > D → D เตี้ยที่สุด');

  // ---------- TGAT3 ----------
  const C1 = 'การสร้างคุณค่าและนวัตกรรม', C2 = 'การแก้ปัญหาที่ซับซ้อน', C3 = 'การบริหารอารมณ์', C4 = 'พลเมืองที่มีส่วนร่วม';
  add('g3-01', G, E3, C1, 2, 'คุณมีไอเดียแอปช่วยจองห้องติวในโรงเรียน แต่ยังไม่แน่ใจว่าเพื่อน ๆ ต้องการจริงหรือไม่ ควรทำสิ่งใดก่อน', ['เขียนแอปให้เสร็จสมบูรณ์ก่อนแล้วค่อยถามความเห็น', 'สัมภาษณ์เพื่อนและทดลองต้นแบบง่าย ๆ เพื่อเก็บ feedback ก่อนพัฒนาต่อ', 'เลิกคิดเพราะอาจไม่มีคนใช้', 'ลอกแอปของคนอื่นทั้งหมด', 'ประกาศขายทันที'], 1, 'นวัตกรรมเริ่มจากความเข้าใจผู้ใช้และการทดลองเล็ก ๆ ที่เรียนรู้ได้เร็วก่อนลงทุนเต็มรูปแบบ');
  add('g3-02', G, E3, C1, 2, 'ขั้นตอนการยืมอุปกรณ์ในห้องปฏิบัติการของโรงเรียนช้าและซ้ำซ้อน คุณควรทำอย่างไร', ['ทนใช้ต่อไป', 'วิเคราะห์ขั้นตอน เสนอวิธีปรับปรุงเล็ก ๆ ทดลองใช้และวัดผล', 'บ่นกับเพื่อน', 'ข้ามขั้นตอนทั้งหมด', 'รอให้มีคนอื่นแก้'], 1, 'คิดเชิงนวัตกรรม = ระบุปัญหา เสนอทางเลือก ทดลอง และวัดผล');
  add('g3-03', G, E3, C1, 2, 'ต้นแบบหุ่นยนต์ของทีมล้มเหลวในการทดสอบครั้งแรก ทีมควรทำอย่างไรเป็นอันดับแรก', ['ยอมแพ้และเปลี่ยนหัวข้อ', 'โทษสมาชิกที่ประกอบ', 'วิเคราะห์สาเหตุของความล้มเหลว แล้วปรับปรุงแล้วทดสอบใหม่', 'ปิดบังผลทดสอบ', 'ซื้อหุ่นยนต์สำเร็จรูป'], 2, 'ความล้มเหลวคือข้อมูลสำหรับการปรับปรุง (iterate)');
  add('g3-04', G, E3, C2, 2, 'เพื่อนร่วมทีมส่งงานล่าช้า ทำให้กำหนดส่งของกลุ่มมีความเสี่ยง วิธีที่เหมาะสมที่สุดคือ', ['ทำงานส่วนนั้นเองเงียบ ๆ แล้วไม่พูดอะไร', 'ประจานในกลุ่มแชต', 'พูดคุยตรง ๆ ถามอุปสรรค และช่วยกันวางแผนใหม่', 'รายงานอาจารย์ทันทีโดยไม่คุยกับเพื่อน', 'ปล่อยให้ล่าช้าต่อไป'], 2, 'สื่อสารตรง สุภาพ เน้นแก้ปัญหาร่วมกัน ไม่ใช่โทษบุคคล');
  add('g3-05', G, E3, C2, 2, 'โครงงานของทีมได้งบน้อยกว่าที่วางแผนไว้ 30% ควรทำอย่างไร', ['ทำตามแผนเดิมและขอเงินเพิ่มทีหลัง', 'ปรึกษาทีม จัดลำดับความสำคัญของงาน และปรับขอบเขต/วัสดุให้เหมาะกับงบ', 'ยุบโครงงาน', 'ลดคุณภาพทุกส่วนเท่ากันโดยไม่คิด', 'ซื้อของราคาแพงที่สุด'], 1, 'การแก้ปัญหาซับซ้อน: จัดลำดับความสำคัญ ตกลงร่วมกัน และปรับแผนตามข้อจำกัด');
  add('g3-06', G, E3, C2, 3, 'ข้อมูลจากสองแหล่งขัดแย้งกัน คุณควรทำอย่างไร', ['เลือกแหล่งที่อ่านง่ายกว่า', 'ตรวจสอบความน่าเชื่อถือ วิธีเก็บข้อมูล และหาแหล่งที่สามมาเปรียบเทียบ', 'เฉลี่ยตัวเลขสองแหล่ง', 'เลือกแหล่งที่ตรงกับความเชื่อของตัวเอง', 'ไม่ใช้ข้อมูลเลย'], 1, 'ตรวจสอบที่มา วิธีการ ความเป็นกลาง และหาหลักฐานเพิ่ม');
  add('g3-07', G, E3, C3, 1, 'ได้รับ feedback เชิงลบเกี่ยวกับงานนำเสนอ ควรทำอย่างไร', ['โต้แย้งทันที', 'ขอตัวอย่างที่เฉพาะเจาะจง ขอบคุณ และนำไปปรับปรุง', 'เพิกเฉย', 'เลิกนำเสนอ', 'วิจารณ์ผู้ให้ feedback กลับ'], 1, 'ใช้ feedback เป็นข้อมูลพัฒนา รับฟังโดยไม่ตอบโต้ด้วยอารมณ์');
  add('g3-08', G, E3, C3, 2, 'ใกล้สอบ คุณรู้สึกเครียดและนอนไม่หลับ ควรทำอย่างไร', ['อ่านหนังสือทั้งคืนทุกคืน', 'วางแผนการอ่านเป็นช่วง พักผ่อน ออกกำลังกายเบา ๆ และปรึกษาคนที่ไว้ใจหากจำเป็น', 'ไม่คุยกับใครและเก็บไว้', 'เลิกสอบ', 'ใช้ยาโดยไม่ปรึกษาแพทย์'], 1, 'จัดการอารมณ์ = ตระหนักรู้ + วิธีรับมือที่ดีต่อสุขภาพ + ขอความช่วยเหลือเมื่อจำเป็น');
  add('g3-09', G, E3, C4, 1, 'ชุมชนใกล้โรงเรียนมีขยะสะสมมาก คุณควรทำอย่างไร', ['ไม่ใช่หน้าที่ของนักเรียน', 'สำรวจสาเหตุ ชวนชุมชนร่วมคัดแยก/รีไซเคิล และติดตามผล', 'ถ่ายรูปไปโพสต์ประจานคนทิ้งขยะ', 'เผาขยะทิ้ง', 'ย้ายไปอยู่ที่อื่น'], 1, 'พลเมืองที่มีส่วนร่วม: ทำงานกับชุมชน แก้ที่ต้นเหตุ และยั่งยืน');
  add('g3-10', G, E3, C4, 2, 'เพื่อนบางคนไม่เห็นด้วยกับกิจกรรมอาสาที่คุณเสนอ คุณควรทำอย่างไร', ['บังคับให้เข้าร่วม', 'รับฟังข้อกังวล อธิบายประโยชน์ และปรับแผนร่วมกัน', 'ทำคนเดียว ไม่บอกใคร', 'ตัดสินว่าเพื่อนไม่มีน้ำใจ', 'ยกเลิกทันที'], 1, 'ทำงานร่วมกัน: รับฟัง เข้าใจมุมมอง และหาทางออกที่ทุกคนยอมรับได้');
})();
