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

server.listen(4185, async () => {
  console.log('Serving dist on 4185. Starting Edge with remote debugging...');
  const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edgeProc = spawn(edge, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9224',
    'http://localhost:4185/#/koleksi-kaos'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const listRes = await fetch('http://127.0.0.1:9224/json');
    const tabs = await listRes.json();
    const tab = tabs.find(t => t.type === 'page');
    if (!tab) throw new Error('No page tab');

    const ws = new WebSocket(tab.webSocketDebuggerUrl);

    let id = 1;
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const msgId = id++;
      const handler = (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.id === msgId) {
          ws.removeEventListener('message', handler);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

    await new Promise(r => ws.addEventListener('open', r));
    await send('Runtime.enable');

    console.log('Clicking first product card on Koleksi Kaos...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const card = document.querySelector('.group.cursor-pointer');
          if (card) card.click();
        })()
      `
    });

    await new Promise(r => setTimeout(r, 800));

    const check = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const modal = document.querySelector('.fixed.inset-0.z-50');
          if (!modal) return { open: false };
          const title = modal.querySelector('h2')?.textContent;
          const colorLabel = modal.querySelector('.text-xs.text-neutral-400.block')?.textContent;
          const colorDots = modal.querySelectorAll('.rounded-full.border.shadow-2xs').length;
          const hasVarianLainnya = modal.textContent.includes('varian lainnya');
          return { open: true, title, colorLabel, colorDots, hasVarianLainnya };
        })()
      `,
      returnByValue: true
    });

    console.log('Modal check result:', check.result?.value);
    ws.close();
    edgeProc.kill();
    server.close();

    const res = check.result?.value;
    if (res?.open && res.colorLabel === 'Warna:' && res.colorDots === 1 && !res.hasVarianLainnya) {
      console.log('\n>>> SUCCESS! Modal shows "Warna:" and exactly 1 color dot, matching Gambar 2! <<<');
      process.exit(0);
    } else {
      console.error('\n>>> FAIL: Modal check did not match requirements! <<<', res);
      process.exit(1);
    }
  } catch (e) {
    console.error(e);
    edgeProc.kill();
    server.close();
    process.exit(1);
  }
});
