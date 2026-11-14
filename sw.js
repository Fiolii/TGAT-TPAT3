// Service worker: เก็บไฟล์แอปไว้ใช้ออฟไลน์ (เปลี่ยน VERSION เมื่อแก้ไฟล์เพื่อบังคับอัปเดต)
const VERSION = 'sixent-v15';
const FILES = ['./', 'index.html', 'style.css', 'app.js', 'manifest.webmanifest',
  'data/themes.js', 'data/thwiki.js', 'data/uni_art.js', 'data/uni_id.js', 'data/uni_info.js', 'data/uni_page.js', 'data/daily.js', 'data/proofs.js', 'data/people.js', 'data/lv_kit.js', 'data/lv_phy.js', 'data/lv_chem.js', 'data/lv_math.js', 'data/lv_calc.js', 'data/lv_t3.js', 'data/lv_tgat.js', 'data/lv_apply.js', 'data/meta.js', 'data/tcas.js', 'data/lessons.js', 'data/figs.js', 'data/q_tpat3.js', 'data/q_spatial.js', 'data/q_tgat.js', 'data/q_alevel.js', 'data/slides.js', 'data/q_num.js', 'data/course.js', 'data/course_phy.js', 'data/course_chem.js', 'data/course_math.js', 'data/course_tpat3.js', 'data/course_tgat.js', 'data/course_calc.js', 'data/art.js', 'data/read_figs.js', 'data/read_figs_p2.js', 'data/read_figs_c.js', 'data/read_figs_m.js', 'data/read_figs_t.js', 'data/read_figs_calc.js', 'data/read_kit.js', 'data/read_phy.js', 'data/read_phy2.js', 'data/read_phy3.js', 'data/read_chem.js', 'data/read_math.js', 'data/read_t3.js', 'data/read_tgat.js', 'data/read_calc.js', 'data/q_calc.js', 'data/ach.js',
  'sim/ui.js', 'sim/physics.js', 'sim/math.js', 'sim/science.js', 'sim/spatial.js',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // ฟอนต์/ลิงก์ภายนอกไม่แคช
  // network-first เพื่อให้ได้เวอร์ชันล่าสุด และถอยกลับไปใช้แคชเมื่อออฟไลน์
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request).then(m => m || caches.match('index.html'))));
});
