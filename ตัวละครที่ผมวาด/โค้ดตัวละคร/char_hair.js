// ทรงผม 21 แบบ (วาดแบบหัวโตน่ารัก) — ผมหลัง (วาดก่อนหัว) + ผมหน้า (วาดทับหัว)
// พิกัดหัว: หน้ากลม cx100 cy100 rx56 ry50 (หัวบน y≈50, คาง y≈150) · f = สีไล่เฉดผมหน้า, fb = สีไล่เฉดผมหลัง (ปลายผม), d = เฉดเข้ม, hl = เฉดสว่าง
const AVHAIRS = [
  // [id, ชื่อ, ราคาเหรียญ]
  ['short', 'สั้นเรียบร้อย', 0], ['side', 'แสกข้าง', 0], ['buzz', 'เกรียน', 0], ['spiky', 'ตั้งเซ็ต', 0], ['bowl', 'ทรงกะลา', 0], ['ahoge', 'เส้นผมกระดก', 20],
  ['wolf', 'วูล์ฟคัต', 30], ['curly', 'หยิกฟู', 0], ['afro', 'อัฟโฟรกลม', 30], ['pixie', 'พิกซี่', 0], ['bob', 'บ็อบ', 0], ['hime', 'ฮิเมะ หน้าม้าตรง', 30],
  ['long', 'ยาวตรง', 0], ['wave', 'ยาวลอนสลวย', 40], ['ponytail', 'หางม้าสูง', 0], ['lowtail', 'หางม้าต่ำ', 30], ['sidepony', 'หางม้าข้าง', 40],
  ['twin', 'ทูเทล', 40], ['braid', 'เปียข้าง', 50], ['bun', 'จุกกลม', 0], ['twinbun', 'ขนมจีบคู่', 50]
];
const AV_HAIRS = AVHAIRS.map(h => h[0]);
(function () {
  const dome = f => `<path d="M38 106C30 54 64 22 100 22C136 22 170 54 162 106L152 98C150 70 130 52 100 52C70 52 50 70 48 98Z" fill="${f}"/>`;
  const shine = hl => `<path d="M62 58Q70 36 104 33" stroke="${hl}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".42"/><path d="M118 34Q134 38 142 52" stroke="${hl}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".3"/>`;
  const FR = {
    straight: 'M48 98C48 70 70 52 100 52C130 52 152 70 152 98C146 86 136 76 124 74C112 82 88 82 76 74C64 76 54 86 48 98Z',
    side: 'M48 98C46 68 72 50 102 52C132 54 154 72 152 100C148 88 142 80 132 78C120 74 104 84 84 90C68 94 56 94 48 98Z',
    curtain: 'M48 100C46 68 72 50 100 52C128 50 154 68 152 100C146 86 134 72 104 64C74 72 54 86 48 100Z',
    hime: 'M46 106C42 66 70 48 100 48C130 48 158 66 154 106L154 86C130 92 70 92 46 86Z',
    pixie: 'M48 96C50 68 74 52 100 54C128 54 150 68 152 96C146 82 136 74 122 72C108 80 86 78 72 72C60 76 52 84 48 96Z',
    wolf: 'M48 100C46 66 72 50 100 52C128 50 154 66 152 100L146 84L140 98L130 78L120 94L106 76L96 92L84 76L72 94L62 82L56 98Z'
  };
  const locks = (f, len) => `<path d="M46 90Q40 ${96 + len / 2} 48 ${96 + len}L60 ${96 + len}Q54 ${96 + len / 2} 58 94Z" fill="${f}"/><path d="M154 90Q160 ${96 + len / 2} 152 ${96 + len}L140 ${96 + len}Q146 ${96 + len / 2} 142 94Z" fill="${f}"/>`;
  const strands = (d, s) => `<path d="${s}" stroke="${d}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".5"/>`;
  const tie = (x, y, col) => `<circle cx="${x}" cy="${y}" r="5.5" fill="${col || '#ff6f91'}" stroke="rgba(0,0,0,.2)" stroke-width="1"/>`;
  const BACK = {
    bowl: (o) => `<path d="M40 104C36 50 66 28 100 28C134 28 164 50 160 104L158 122C130 130 70 130 42 122Z" fill="${o.fb}"/>`,
    curly: (o) => [[46, 70, 20], [154, 70, 20], [40, 104, 19], [160, 104, 19], [70, 36, 20], [130, 36, 20], [100, 28, 19]].map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="${p[2]}" fill="${o.fb}"/>`).join(''),
    afro: (o) => `<circle cx="100" cy="72" r="78" fill="${o.fb}"/>`,
    bob: (o) => `<path d="M38 104C32 50 66 24 100 24C134 24 168 50 162 104L166 150C150 164 50 164 34 150Z" fill="${o.fb}"/>`,
    hime: (o) => `<path d="M38 104C32 50 66 24 100 24C134 24 168 50 162 104L168 200C150 208 50 208 32 200Z" fill="${o.fb}"/>`,
    long: (o) => `<path d="M36 104C30 50 66 22 100 22C134 22 170 50 164 104L172 218C150 236 50 236 28 218Z" fill="${o.fb}"/>${strands(o.d, 'M62 140Q64 190 56 222M100 150V228M138 140Q136 190 144 222')}`,
    wave: (o) => `<path d="M36 104C30 50 66 22 100 22C134 22 170 50 164 104C176 140 160 160 172 196C176 216 164 232 148 226C140 238 120 236 112 226C100 238 80 236 72 226C54 234 22 216 30 196C42 160 24 140 36 104Z" fill="${o.fb}"/>${strands(o.d, 'M56 130Q70 170 52 210M144 130Q130 170 148 210')}`,
    ponytail: (o) => `<path d="M126 40C178 30 196 100 172 150C166 176 150 188 140 178C160 150 158 106 128 76Z" fill="${o.fb}"/>${strands(o.d, 'M146 66Q176 100 160 164')}`,
    lowtail: (o) => `<path d="M118 128C152 122 182 150 174 202C168 230 146 236 138 220C152 192 146 164 118 152Z" fill="${o.fb}"/><circle cx="126" cy="138" r="6" fill="#ff6f91"/>`,
    sidepony: (o) => `<path d="M54 54C12 48 2 116 22 156C30 170 44 166 46 156C32 130 38 98 62 82Z" fill="${o.fb}"/>${strands(o.d, 'M40 68Q18 110 32 154')}`,
    twin: (o) => `<path d="M48 94C12 98 0 172 26 210C42 220 54 204 52 192C40 162 46 128 58 110Z" fill="${o.fb}"/><path d="M152 94C188 98 200 172 174 210C158 220 146 204 148 192C160 162 154 128 142 110Z" fill="${o.fb}"/>`,
    braid: (o) => `<path d="M38 104C32 50 66 24 100 24C134 24 168 50 162 104L166 140C150 150 50 150 34 140Z" fill="${o.fb}"/>`,
    bun: (o) => `<circle cx="100" cy="24" r="23" fill="${o.fb}"/><path d="M82 14Q100 6 118 14" stroke="${o.hl}" stroke-width="3" fill="none" opacity=".5" stroke-linecap="round"/>`,
    twinbun: (o) => `<circle cx="52" cy="38" r="19" fill="${o.fb}"/><circle cx="148" cy="38" r="19" fill="${o.fb}"/>`
  };
  const FRONT = {
    short: o => dome(o.f) + `<path d="${FR.straight}" fill="${o.f}"/>${strands(o.d, 'M84 60Q80 70 78 76M112 58Q116 68 120 74')}${shine(o.hl)}`,
    side: o => dome(o.f) + `<path d="${FR.side}" fill="${o.f}"/>${strands(o.d, 'M120 58Q108 74 88 84M132 62Q124 72 112 80')}${shine(o.hl)}`,
    buzz: o => `<path d="M46 98C46 60 70 36 100 36C130 36 154 60 154 98C146 74 126 62 100 62C74 62 54 74 46 98Z" fill="${o.f}" opacity=".85"/>`,
    spiky: o => dome(o.f) + `<path d="M48 98L40 58L62 72L64 34L86 58L100 24L114 58L138 34L138 72L160 58L152 98L140 80L126 86L112 70L100 84L88 70L74 86L60 80Z" fill="${o.f}"/>${strands(o.d, 'M100 30V70M70 44L80 70M130 44L120 70')}`,
    bowl: o => `<path d="M44 96C42 54 70 38 100 38C130 38 158 54 156 96L156 80C130 76 70 76 44 80Z" fill="${o.f}"/>${strands(o.d, 'M70 50Q64 66 66 76M130 50Q136 66 134 76')}${shine(o.hl)}`,
    ahoge: o => dome(o.f) + `<path d="${FR.straight}" fill="${o.f}"/><path d="M98 34Q92 10 108 6Q104 20 112 34Z" fill="${o.f}"/>${shine(o.hl)}`,
    wolf: o => dome(o.f) + `<path d="${FR.wolf}" fill="${o.f}"/>` + locks(o.f, 30) + strands(o.d, 'M90 60L88 80M118 58L122 78'),
    curly: o => [[62, 56, 17], [84, 42, 17], [110, 42, 17], [136, 56, 17], [100, 34, 16], [48, 80, 14], [152, 80, 14]].map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="${p[2]}" fill="${o.f}"/>`).join('') + `<path d="M52 92Q56 66 82 60Q100 70 118 60Q144 66 148 92Q130 74 100 76Q70 74 52 92Z" fill="${o.f}"/>`,
    afro: o => `<path d="M48 100C44 70 68 52 100 52C132 52 156 70 152 100C144 84 128 76 100 78C72 76 56 84 48 100Z" fill="${o.f}"/>${shine(o.hl)}`,
    pixie: o => dome(o.f) + `<path d="${FR.pixie}" fill="${o.f}"/>${strands(o.d, 'M118 56Q108 70 84 74')}${shine(o.hl)}`,
    bob: o => dome(o.f) + `<path d="${FR.curtain}" fill="${o.f}"/>` + locks(o.f, 52) + strands(o.d, 'M100 56V66M56 110Q54 130 56 140M144 110Q146 130 144 140') + shine(o.hl),
    hime: o => dome(o.f) + `<path d="${FR.hime}" fill="${o.f}"/>` + locks(o.f, 64) + strands(o.d, 'M70 54V88M100 52V90M130 54V88') + shine(o.hl),
    long: o => dome(o.f) + `<path d="${FR.curtain}" fill="${o.f}"/>` + locks(o.f, 76) + strands(o.d, 'M100 56V66M54 112Q52 150 56 170M146 112Q148 150 144 170') + shine(o.hl),
    wave: o => dome(o.f) + `<path d="${FR.side}" fill="${o.f}"/><path d="M44 96Q34 130 50 150Q42 168 56 184Q56 150 62 112Z" fill="${o.f}"/><path d="M156 96Q166 130 150 150Q158 168 144 184Q144 150 138 112Z" fill="${o.f}"/>` + shine(o.hl),
    ponytail: o => dome(o.f) + `<path d="${FR.side}" fill="${o.f}"/>${tie(130, 56)}${shine(o.hl)}`,
    lowtail: o => dome(o.f) + `<path d="${FR.curtain}" fill="${o.f}"/>${locks(o.f, 30)}${shine(o.hl)}`,
    sidepony: o => dome(o.f) + `<path d="${FR.side}" fill="${o.f}"/>${tie(54, 62)}<path d="M44 50L54 62L64 50L54 56Z" fill="#ff6f91"/>${shine(o.hl)}`,
    twin: o => dome(o.f) + `<path d="${FR.curtain}" fill="${o.f}"/>${tie(50, 96)}${tie(150, 96)}${shine(o.hl)}`,
    braid: o => dome(o.f) + `<path d="${FR.side}" fill="${o.f}"/>` + [0, 1, 2, 3, 4, 5].map(i => `<ellipse cx="${150 + i * 2}" cy="${118 + i * 20}" rx="9" ry="12" fill="${o.f}" stroke="${o.d}" stroke-width="1.2" stroke-opacity=".5"/>`).join('') + tie(160, 238) + shine(o.hl),
    bun: o => dome(o.f) + `<path d="${FR.curtain}" fill="${o.f}"/>${shine(o.hl)}`,
    twinbun: o => dome(o.f) + `<path d="${FR.curtain}" fill="${o.f}"/>${tie(52, 54, '#ffb3c7')}${tie(148, 54, '#ffb3c7')}${shine(o.hl)}`
  };
  window.avHairBack = (h, o) => (BACK[h] ? BACK[h](o) : '');
  window.avHairFront = (h, o) => (FRONT[h] || FRONT.short)(o);
})();
