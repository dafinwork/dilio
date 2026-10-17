const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  let filePath = path.join(__dirname, '..', 'dist', reqPath);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, '..', 'dist', '404.html');
  }
  const ext = path.extname(filePath);
  res.writeHead(filePath.endsWith('404.html') ? 404 : 200, { 'Content-Type': mimeTypes[ext] || 'text/html' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(4180, async () => {
  console.log('Test server running on port 4180');
  const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  const testUrl = (url, expectedText, name) => new Promise((resolve) => {
    const child = spawn(edge, [
      '--headless=new',
      '--disable-gpu',
      '--virtual-time-budget=6000',
      '--dump-dom',
      url
    ]);
    let dom = '';
    child.stdout.on('data', d => { dom += d.toString(); });
    child.on('close', () => {
      const ok = dom.includes(expectedText);
      console.log(`[${ok ? 'PASS' : 'FAIL'}] ${name} (Length: ${dom.length})`);
      if (!ok) console.log('  Preview:', dom.slice(0, 300));
      resolve(ok);
    });
  });

  const r1 = await testUrl('http://localhost:4180/', 'Kaos Polos Masa Kini', 'Home Page');
  const r2 = await testUrl('http://localhost:4180/#/koleksi-kaos', 'Filter Pencarian', 'Koleksi Kaos with Shopee Filter');
  const r3 = await testUrl('http://localhost:4180/koleksi-kaos', 'Filter Pencarian', 'Direct /koleksi-kaos via 404.html redirect');
  const r4 = await testUrl('http://localhost:4180/#/admin', 'Kaos Dilio CMS', 'Admin Page');
  const r5 = await testUrl('http://localhost:4180/admin', 'Kaos Dilio CMS', 'Direct /admin via 404.html redirect');

  server.close();
  if (r1 && r2 && r3 && r4 && r5) {
    console.log('\n>>> ALL 5 E2E TESTS PASSED PERFECTLY! <<<');
    process.exit(0);
  } else {
    console.error('\n>>> SOME TESTS FAILED <<<');
    process.exit(1);
  }
});
