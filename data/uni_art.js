// ตราสัญลักษณ์ของแต่ละมหาวิทยาลัยที่วาดเป็น SVG เอง (ไม่ใช้อีโมจิ) + ไอคอนเส้นขนาดเล็กสำหรับป้ายข้อมูล
// วาดจากสัญลักษณ์ที่มหาวิทยาลัยใช้จริง เช่น พระเกี้ยว ช้างเผือก พระธาตุพนม ธรรมจักร พระมหามงกุฎ
// เป็นภาพตีความแบบวาดเอง ไม่ใช่ตราทางการ — ถ้ามีไฟล์ icons/uni/<id>-logo.* ระบบจะใช้ไฟล์จริงแทนอัตโนมัติ
const UIC_PATHS = {
  tree: '<path d="M12 21v-6"/><path d="M12 15c-4 0-6.5-2.6-5.6-5.8C6.5 6.300 9 4 12 4s5.500 2.300 5.600 5.200C18.500 12.400 16 15 12 15z"/>',
  crest: '<path d="M12 3l7 3v5.500c0 4.500-3 7.500-7 9.500-4-2-7-5-7-9.500V6z"/><path d="M12 8v7M9 11.500h6"/>',
  palette: '<path d="M12 3a9 9 0 100 18c1.600 0 2.200-1.100 1.600-2.200-.6-1.200 0-2.300 1.400-2.300h2A3.200 3.200 0 0020.200 13C20.200 7.500 16.600 3 12 3z"/><circle cx="8" cy="11" r="1"/><circle cx="11" cy="7.500" r="1"/><circle cx="15.500" cy="8.500" r="1"/>',
  calendar: '<rect x="4" y="5" width="16" height="15" rx="2.500"/><path d="M4 10h16M8 3v4M16 3v4"/>',
  pin: '<path d="M12 21s-6.500-5.400-6.500-11A6.500 6.500 0 0112 3.500 6.500 6.500 0 0118.500 10c0 5.600-6.500 11-6.500 11z"/><circle cx="12" cy="10" r="2.300"/>',
  user: '<circle cx="12" cy="8" r="3.600"/><path d="M5 20c.8-4 3.600-6 7-6s6.200 2 7 6"/>',
  cap: '<path d="M2.500 9.500L12 5l9.500 4.500L12 14z"/><path d="M6.500 11.700V16c0 1.500 2.500 3 5.500 3s5.500-1.500 5.500-3v-4.300"/>',
  book: '<path d="M4 5.500c3-1 5.500-.8 8 1 2.500-1.800 5-2 8-1V19c-3-1-5.500-.8-8 1-2.500-1.800-5-2-8-1z"/><path d="M12 6.500V20"/>',
  gear: '<circle cx="12" cy="12" r="3.200"/><path d="M12 3v2.500M12 18.500V21M3 12h2.500M18.500 12H21M5.600 5.600l1.800 1.800M16.600 16.600l1.800 1.800M18.400 5.600l-1.800 1.800M7.400 16.600l-1.800 1.800"/><circle cx="12" cy="12" r="6.500"/>',
  star: '<path d="M12 3.500l2.600 5.400 5.900.8-4.300 4.100 1 5.800L12 16.800l-5.200 2.800 1-5.800L3.500 9.700l5.900-.8z"/>',
  flag: '<path d="M6 21V4M6 5h11l-2.500 4L17 13H6"/>',
  swap: '<path d="M4 8h14l-3-3M20 16H6l3 3"/>',
  link: '<path d="M10 14a4 4 0 005.700 0l3-3a4 4 0 00-5.700-5.700l-1 1"/><path d="M14 10a4 4 0 00-5.700 0l-3 3a4 4 0 005.700 5.700l1-1"/>',
  quote: '<path d="M9 7C6 8 5 10.500 5 13v4h5v-5H7.500C7.500 10 8.500 9 10 8.500zM19 7c-3 1-4 3.500-4 6v4h5v-5h-2.500c0-2 1-3 2.500-3.500z"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.500 10.900c.8.600 1.200 1.400 1.200 2.100h4.600c0-.7.400-1.500 1.200-2.100A6 6 0 0012 3z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.500 2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.500v.5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>'
};
function uic(name, size, cls) {
  const s = size || 18;
  return `<svg class="uic ${cls || ''}" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${UIC_PATHS[name] || ''}</svg>`;
}

/* ---------- สัญลักษณ์กลางตรา (พื้นที่วาด 100×100 อยู่ในวงกลมรัศมี ~38) ---------- */
// G = สีทอง, D = เส้นขอบเข้ม, W = ขาวมุก, k = สีพื้นจานตรา (ใช้เจาะอัญมณี)
const UEMB_CROWN = (G, D, k, o) => {
  o = o || {};
  return `<g fill="${G}" stroke="${D}" stroke-width=".9" stroke-linejoin="round">
    <path d="M50 11.500C52.500 19 54.500 25 54.500 35H45.500C45.500 25 47.500 19 50 11.500z"/>
    <path d="M31 42C32 35.500 34 32 36.500 28.500C37.800 33 38.300 38 38.200 46z"/>
    <path d="M69 42C68 35.500 66 32 63.500 28.500C62.200 33 61.700 38 61.800 46z"/>
    <path d="M27.500 70L33 47C39.500 49.500 44 44 45.500 35H54.500C56 44 60.500 49.500 67 47L72.500 70z"/>
    <rect x="24.500" y="70" width="51" height="7.500" rx="2.500"/></g>
  <g fill="none" stroke="${D}" stroke-width=".7" opacity=".55"><path d="M50 37V68M41 52C43 56 44 62 43 68M59 52C57 56 56 62 57 68M34 52C36 58 36 64 35 68M66 52C64 58 64 64 65 68"/></g>
  <g fill="${k}" stroke="${D}" stroke-width=".5"><circle cx="50" cy="48" r="3.300"/><circle cx="50" cy="59.500" r="2.600"/>${[31, 40.500, 50, 59.500, 69].map(x => `<circle cx="${x}" cy="73.800" r="1.700"/>`).join('')}</g>`;
};
const UEMB = {
  sixent: { disc: ['#818cf8', '#4f46e5', '#2e2a8c'], sym: (G, D, W, k) => `<circle cx="50" cy="50" r="27" fill="none" stroke="${G}" stroke-width="9" stroke-dasharray="7.0686 7.0686"/><circle cx="50" cy="50" r="22.500" fill="${G}" stroke="${D}" stroke-width=".8"/><circle cx="50" cy="50" r="15" fill="${k}"/><text x="50" y="58" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="22" font-weight="800" fill="${G}">S</text>` },

  // จุฬาฯ — พระเกี้ยว (จุลมงกุฎ) ศิราภรณ์สามชั้น
  chula: { disc: ['#ff9ccb', '#d81b7a', '#7a0f48'], sym: (G, D, W, k) => `
    <g stroke="${G}" stroke-width=".7" opacity=".35">${Array.from({ length: 14 }, (_, i) => { const a = (-90 + (i - 6.5) * 12.500) * Math.PI / 180; return `<path d="M50 58L${(50 + 40 * Math.cos(a)).toFixed(1)} ${(58 + 40 * Math.sin(a)).toFixed(1)}"/>`; }).join('')}</g>
    <g fill="${G}" stroke="${D}" stroke-width=".9" stroke-linejoin="round">
      <path d="M50 11C53 19 55 25 54.500 33H45.500C45 25 47 19 50 11z"/>
      <path d="M41.500 33H58.500L63 45H37z"/><path d="M35.500 45H64.500L70 58H30z"/><path d="M28.500 58H71.500L76 69H24z"/>
      <rect x="22.500" y="69" width="55" height="7" rx="2.500"/>
      <path d="M32 58C25.500 53 26 44 32.500 39C32 46 35 51 39 53z"/><path d="M68 58C74.500 53 74 44 67.500 39C68 46 65 51 61 53z"/>
      <path d="M26 69C19 65 18 57 23 51C23.500 58 27 62 31 64z"/><path d="M74 69C81 65 82 57 77 51C76.500 58 73 62 69 64z"/></g>
    <g fill="${k}" stroke="${D}" stroke-width=".5"><circle cx="50" cy="39" r="2.500"/><circle cx="50" cy="52" r="3"/><circle cx="50" cy="63.500" r="3.300"/><circle cx="39" cy="63.500" r="2"/><circle cx="61" cy="63.500" r="2"/></g>
    <g fill="none" stroke="${D}" stroke-width=".7" opacity=".5"><path d="M46 38V68M54 38V68M41 47L38 56M59 47L62 56"/></g>` },

  // เกษตรฯ — พระพิรุณทรงนาค เทพแห่งฝนประทับบนพญานาค
  ku: { disc: ['#5fd49a', '#0b7a43', '#06452a'], sym: (G, D, W, k) => `
    <g fill="${G}" stroke="${D}" stroke-width=".8" stroke-linejoin="round" stroke-linecap="round">
      <circle cx="50" cy="27" r="12" fill="none" stroke="${G}" stroke-width="1.300" stroke-dasharray="2.200 2.200"/>
      <path d="M46 23.500L50 13.500L54 23.500z"/><circle cx="50" cy="28" r="5"/>
      <path d="M41 56C41 43 45 35 50 35C55 35 59 43 59 56z"/>
      <path d="M43 40C36 42 32 48 30 55M57 40C63 37 67 32 69 27" fill="none" stroke="${G}" stroke-width="3.200"/>
      <path d="M70 20L66 29L71.500 29L67 39" fill="none" stroke="${W}" stroke-width="2.200"/>
      <path d="M20 70C28 56 40 62 47 66C55 70 62 60 70 59C77 58 81 64 79 70" fill="none" stroke="${G}" stroke-width="7.500"/>
      <path d="M13 70C11 61 18 57 24 61C28 65 25 72 19 75z"/><circle cx="20" cy="65.500" r="1.300" fill="${k}" stroke="none"/>
      <path d="M72 62C74 56 79 55 82 58C81 62 78 65 75 66z"/></g>
    <g stroke="${W}" stroke-width="1.300" stroke-linecap="round" opacity=".75"><path d="M22 28l-2 6M30 20l-2 6M72 44l-2 6M80 34l-2 6M18 48l-2 6M84 52l-2 6"/></g>` },

  // มอ. — พระมหาพิชัยมงกุฎ เหนือคลื่นทะเลใต้
  psu: { disc: ['#6aa6f0', '#1e4e9c', '#0e2a66'], sym: (G, D, W, k) => `${UEMB_CROWN(G, D, k)}
    <g fill="none" stroke="${W}" stroke-width="1.800" stroke-linecap="round" opacity=".85"><path d="M22 82Q30 77 38 82T54 82T70 82T78 82"/></g>` },

  // มข. — พระธาตุพนม และดอกกัลปพฤกษ์
  kku: { disc: ['#d65f60', '#9b2d30', '#561518'], sym: (G, D, W, k) => `
    <g fill="${G}" stroke="${D}" stroke-width=".8" stroke-linejoin="round">
      <path d="M50 9L51.500 20H48.500z"/>
      <path d="M48 20H52L54 44H46z"/>
      ${[24, 29, 34, 39].map((y, i) => `<ellipse cx="50" cy="${y}" rx="${3.200 + i * .9}" ry="1.400"/>`).join('')}
      <path d="M36 54C36 46 42 41 50 41C58 41 64 46 64 54z"/>
      <path d="M39 54H61L65 63H35z"/>
      <rect x="30" y="63" width="40" height="5.500" rx="1"/><rect x="24" y="68.500" width="52" height="5.500" rx="1"/><rect x="18" y="74" width="64" height="6" rx="1"/></g>
    <g fill="${k}" opacity=".8"><path d="M44 63V57C44 55 46 54 47.500 54S51 55 51 57V63z"/><path d="M53 63V57C53 55 54.500 54 56 54S59 55 59 57V63z"/></g>
    <g stroke="${D}" stroke-width=".6" opacity=".6" fill="none"><path d="M50 41C46 46 45 50 45 54M50 41C54 46 55 50 55 54"/></g>
    <g fill="#ffd1dc" stroke="${D}" stroke-width=".5">${[[22, 34], [78, 34], [26, 22]].map(([x, y]) => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map(a => `<ellipse cx="0" cy="-3.600" rx="2.300" ry="3.400" transform="rotate(${a})"/>`).join('')}<circle r="1.500" fill="${G}" stroke="none"/></g>`).join('')}</g>` },

  // มช. — ช้างเผือก
  cmu: { disc: ['#a07be0', '#6e3da8', '#3b1f66'], sym: (G, D, W, k) => `
    <g fill="${W}" stroke="${D}" stroke-width=".9" stroke-linejoin="round" stroke-linecap="round">
      <path d="M40 46C44 38 63 37 72 42C79 46 80 58 76 64L72 64L71 77H63L62 66H47L46 77H38L37 65C32 62 33 52 40 46z"/>
      <path d="M42 45C39 36 29 35 24 42C20 48 22 55 26 58C25 62 22 67 26 72C29 75 33 73 31.500 70C30 66 32 62 34 58C40 58 44 51 42 45z"/>
      <ellipse cx="38" cy="47" rx="5" ry="8" fill="#ece0fa" transform="rotate(14 38 47)"/>
      <path d="M72 50C77 54 78 60 75 66" fill="none"/></g>
    <path d="M26 54C20 57 18 61 20 65" fill="none" stroke="${G}" stroke-width="2.600" stroke-linecap="round"/>
    <circle cx="29" cy="46" r="1.400" fill="${D}"/>
    <g fill="${G}" stroke="${D}" stroke-width=".7"><path d="M44 42C50 39 62 39 69 43L70 50C62 47 52 47 45 49z"/><path d="M42 50H72V54H42z"/></g>
    <g stroke="${D}" stroke-width=".5" opacity=".6"><path d="M47 42v6M52 41v6M57 41v6M62 42v6M67 43v6" fill="none"/></g>
    <g stroke="${G}" stroke-width="1.300" fill="none" stroke-linecap="round" opacity=".9"><path d="M14 80Q20 74 26 80T38 80T50 80T62 80T74 80T86 80"/></g>` },

  // มจธ. — พระมหามงกุฎ ท่ามกลางรัศมี
  kmutt: { disc: ['#ffb13b', '#e07a00', '#8f4300'], sym: (G, D, W, k) => `
    <g stroke="${G}" stroke-width="1" opacity=".55">${Array.from({ length: 18 }, (_, i) => { const a = i * 20 * Math.PI / 180; return `<path d="M50 52L${(50 + 41 * Math.cos(a)).toFixed(1)} ${(52 + 41 * Math.sin(a)).toFixed(1)}"/>`; }).join('')}</g>
    <g transform="translate(50 52) scale(.88) translate(-50 -48)">${UEMB_CROWN(G, D, k)}</g>
    <path d="M26 82C34 77 44 77 50 80C56 77 66 77 74 82C66 80 56 80 50 84C44 80 34 80 26 82z" fill="${W}" stroke="${D}" stroke-width=".7" opacity=".95"/>` },

  // สจล. — พระมหามงกุฎ ในวงล้อเฟือง
  kmitl: { disc: ['#ffa357', '#e8590c', '#8d2d00'], sym: (G, D, W, k) => `
    <circle cx="50" cy="50" r="35" fill="none" stroke="${G}" stroke-width="6" stroke-dasharray="6.1 6.1" opacity=".95"/>
    <circle cx="50" cy="50" r="31.500" fill="${k}" opacity=".55" stroke="${G}" stroke-width=".8"/>
    <g transform="translate(50 50) scale(.72) translate(-50 -46)">${UEMB_CROWN(G, D, k)}</g>` },

  // มจพ. — พระมหามงกุฎ เฟืองไทย-เยอรมัน และปีกวิทยาการ
  kmutnb: { disc: ['#ff7a3d', '#d23a12', '#3b1a12'], sym: (G, D, W, k) => `
    <g fill="${G}" stroke="${D}" stroke-width=".7" stroke-linejoin="round" opacity=".95">
      <path d="M26 66C14 60 11 48 14 38C18 46 24 50 31 52C26 54 25 60 28 63z"/><path d="M74 66C86 60 89 48 86 38C82 46 76 50 69 52C74 54 75 60 72 63z"/>
      <path d="M20 54C16 50 15 45 16 41C20 46 25 48 29 50z" opacity=".7"/><path d="M80 54C84 50 85 45 84 41C80 46 75 48 71 50z" opacity=".7"/></g>
    <g transform="translate(50 47) scale(.78) translate(-50 -46)">${UEMB_CROWN(G, D, k)}</g>
    <g transform="translate(50 79)"><circle r="6.500" fill="none" stroke="${W}" stroke-width="3" stroke-dasharray="2.550 2.550"/><circle r="3.200" fill="${W}"/></g>` },

  // ธรรมศาสตร์ — ธรรมจักร เหนือตึกโดม
  tu: { disc: ['#ffd25a', '#e4572e', '#9a1022'], sym: (G, D, W, k) => `
    <g transform="translate(50 36)">
      <circle r="19" fill="none" stroke="${G}" stroke-width="3"/><circle r="15.500" fill="none" stroke="${G}" stroke-width=".9"/>
      ${Array.from({ length: 8 }, (_, i) => `<g transform="rotate(${i * 45})"><path d="M-1.600 -4.500L0 -15.500L1.600 -4.500z" fill="${G}" stroke="${D}" stroke-width=".5"/><circle cy="-18" r="1.500" fill="${G}"/></g>`).join('')}
      <circle r="5" fill="${G}" stroke="${D}" stroke-width=".7"/><circle r="2" fill="${k}"/></g>
    <g fill="${G}" stroke="${D}" stroke-width=".8" stroke-linejoin="round">
      <path d="M40 67C40 59 44 56.500 50 56.500S60 59 60 67z"/><rect x="49.200" y="51" width="1.600" height="6"/>
      <rect x="25" y="67" width="50" height="14" rx="1.500"/></g>
    <g fill="${k}">${[30, 37.500, 45, 52.500, 60, 67.500].map(x => `<path d="M${x} 81V73C${x} 70.500 ${x + 2.200} 70.500 ${x + 2.200} 73V81z"/>`).join('')}</g>` },

  // มหิดล — วงกลมสองชั้น ตราราชสกุลสีทองบนพื้นน้ำเงิน (ออกแบบเอง)
  mu: { ring: true, disc: ['#2c58c9', '#12307a', '#08184a'], sym: (G, D, W, k, u) => `
    <g transform="translate(50 50) scale(.66) translate(-50 -48)">${UEMB_CROWN(G, D, k)}</g>
    <path d="M30 78C36 71 44 73 50 79C56 73 64 71 70 78C64 83 56 83 50 80C44 83 36 83 30 78z" fill="${G}" stroke="${D}" stroke-width=".6" transform="translate(0 -2)"/>` }
};
let UEC = 0;
// สร้างตราเป็น <svg> พร้อมใช้ (size = พิกเซล) หรือแบบฝัง (opts.at = [x,y] ใช้ภายใน SVG อื่น)
function uniEmblem(id, size, opts) {
  opts = opts || {};
  const spec = UEMB[id] || UEMB.sixent, u = ++UEC, G = `url(#ueG${u})`, W = `url(#ueW${u})`, B = `url(#ueB${u})`, D = 'rgba(40,20,0,.55)';
  const dk = spec.disc[2], t = spec.ring;
  const defs = `<defs><linearGradient id="ueG${u}" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="#fffbe0"/><stop offset=".22" stop-color="#f9d867"/><stop offset=".48" stop-color="#d89a1c"/><stop offset=".7" stop-color="#f6d35e"/><stop offset="1" stop-color="#8a5809"/></linearGradient>
    <linearGradient id="ueR${u}" x1=".1" y1="0" x2=".9" y2="1"><stop offset="0" stop-color="#fffbe6"/><stop offset=".25" stop-color="#e9b43a"/><stop offset=".5" stop-color="#8a5809"/><stop offset=".75" stop-color="#f3cd55"/><stop offset="1" stop-color="#fff2b0"/></linearGradient>
    <radialGradient id="ueV${u}" cx=".5" cy=".5" r=".5"><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".42"/></radialGradient>
    <filter id="ueE${u}" x="-12%" y="-12%" width="124%" height="128%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="1.1" result="b"/><feSpecularLighting in="b" surfaceScale="4.500" specularConstant="1" specularExponent="22" lighting-color="#fffbe0" result="s"><feDistantLight azimuth="235" elevation="48"/></feSpecularLighting><feComposite in="s" in2="SourceAlpha" operator="in" result="sp"/><feComposite in="SourceGraphic" in2="sp" operator="arithmetic" k1="0" k2="1" k3=".9" k4="0" result="lit"/><feDropShadow in="lit" dx=".5" dy="1.700" stdDeviation="1.200" flood-color="#000" flood-opacity=".55"/></filter>
    <linearGradient id="ueW${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e4dcf0"/></linearGradient>
    <radialGradient id="ueB${u}" cx=".36" cy=".28" r=".95"><stop offset="0" stop-color="${spec.disc[0]}"/><stop offset=".55" stop-color="${spec.disc[1]}"/><stop offset="1" stop-color="${dk}"/></radialGradient>
    <radialGradient id="ueH${u}" cx=".35" cy=".2" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>`;
  let body;
  if (t) { // ตรามหิดล: วงนอกขาวมีตัวอักษรทอง วงในน้ำเงิน
    body = `<circle cx="50" cy="50" r="48.500" fill="${G}"/><circle cx="50" cy="50" r="46.500" fill="#fff"/>
      <path id="ueT${u}" d="M12.500 50A37.500 37.500 0 0 1 87.500 50" fill="none"/><path id="ueU${u}" d="M8 50A42 42 0 0 0 92 50" fill="none"/>
      <text font-family="'Noto Sans Thai',sans-serif" font-size="7.400" font-weight="700" fill="#b8861a" text-anchor="middle"><textPath href="#ueT${u}" startOffset="50%">อตฺตานํ อุปมํ กเร</textPath></text>
      <text font-family="'Noto Sans Thai',sans-serif" font-size="7.400" font-weight="700" fill="#b8861a" text-anchor="middle"><textPath href="#ueU${u}" startOffset="50%">มหาวิทยาลัยมหิดล</textPath></text>
      ${[8, 92].map(x => `<g transform="translate(${x} 50)" fill="${G}">${[0, 90, 180, 270].map(a => `<ellipse cy="-2.800" rx="1.300" ry="2.300" transform="rotate(${a})"/>`).join('')}</g>`).join('')}
      <circle cx="50" cy="50" r="31" fill="${B}" stroke="url(#ueR${u})" stroke-width="2"/><circle cx="50" cy="50" r="30" fill="url(#ueV${u})"/><g filter="url(#ueE${u})">${spec.sym(G, D, W, spec.disc[1], u)}</g>`;
  } else {
    body = `<ellipse cx="50" cy="98" rx="30" ry="2.600" fill="rgba(0,0,0,.25)"/><circle cx="50" cy="50" r="48.500" fill="url(#ueR${u})" filter="url(#ueE${u})"/><circle cx="50" cy="50" r="45.200" fill="url(#ueG${u})"/><circle cx="50" cy="50" r="44.200" fill="${dk}"/><circle cx="50" cy="50" r="43.500" fill="${B}"/><circle cx="50" cy="50" r="43.500" fill="url(#ueV${u})"/>
      <circle cx="50" cy="50" r="41" fill="none" stroke="${G}" stroke-width="1" stroke-dasharray=".1 2.700" stroke-linecap="round" opacity=".9"/><circle cx="50" cy="50" r="42.500" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1.200"/>
      <g filter="url(#ueE${u})">${spec.sym(G, D, W, spec.disc[1], u)}</g>`;
  }
  const hi = `<ellipse cx="38" cy="22" rx="22" ry="11" fill="url(#ueH${u})" transform="rotate(-18 38 22)"/>`;
  const attrs = opts.at ? `x="${opts.at[0]}" y="${opts.at[1]}" width="${size}" height="${size}"` : `width="${size}" height="${size}" class="emb"`;
  return `<svg ${attrs} viewBox="0 0 100 100" role="img" aria-label="ตราสัญลักษณ์ ${esc(id)}">${defs}${body}${hi}</svg>`;
}
// ตราที่มีรูปจริงของผู้ใช้ (icons/uni/<id>-logo.*) ใช้รูปจริงก่อน ไม่มีค่อยใช้ตราที่วาดเอง
function uniMark(id, size) {
  return typeof UNIIMG !== 'undefined' && UNIIMG.logo[id] ? `<img class="unilogo" src="${UNIIMG.logo[id]}" alt="" style="width:${size}px;height:${size}px">` : uniEmblem(id, size);
}
// ไอคอนแท็บเบราว์เซอร์เปลี่ยนตามมหาวิทยาลัย
function uniFavicon(id) {
  const el = document.querySelector('link[rel=icon]'); if (!el) return;
  if (!el.dataset.orig) el.dataset.orig = el.href;
  if (id === 'sixent') { el.type = 'image/svg+xml'; el.href = el.dataset.orig; return; }
  const svg = uniEmblem(id, 64).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
  el.type = 'image/svg+xml'; el.href = 'data:image/svg+xml,' + encodeURIComponent(svg);
}
