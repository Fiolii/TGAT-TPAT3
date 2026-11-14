// เซิร์ฟเวอร์ทดสอบในเครื่อง: node serve.js  (ค่าเริ่มต้นพอร์ต 5173)
// เปิดจากมือถือที่ต่อ WiFi เดียวกันได้ที่ http://<IP เครื่องนี้>:5173
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');
const port = +process.env.PORT || 5173, root = __dirname;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png' };
http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split('?')[0]); if (u === '/') u = '/index.html';
  const fp = path.join(root, path.normalize(u));
  if (!fp.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(fp, (e, d) => {
    if (e) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(fp)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); res.end(d);
  });
}).listen(port, '0.0.0.0', () => {
  console.log('SIXENT รันที่ http://localhost:' + port);
  Object.values(os.networkInterfaces()).flat().filter(i => i.family === 'IPv4' && !i.internal).forEach(i => console.log('มือถือ (WiFi เดียวกัน): http://' + i.address + ':' + port));
});
