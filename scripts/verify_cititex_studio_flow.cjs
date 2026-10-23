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
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  let filePath = path.join(__dirname, '..', 'dist', reqPath);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, '..', 'dist', 'index.html');
  }
  const ext = path.extname(filePath);
  res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/html' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(4195, async () => {
  console.log('Server running on 4195. Starting headless Edge to verify Cititex Customizer flow...');
  const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edgeProc = spawn(edge, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9235',
    'http://localhost:4195/#/design-custom',
  ]);

  await new Promise((r) => setTimeout(r, 2500));

  try {
    const listRes = await fetch('http://127.0.0.1:9235/json');
    const tabs = await listRes.json();
    const tab = tabs.find((t) => t.type === 'page');
    if (!tab) throw new Error('No page tab');

    const ws = new WebSocket(tab.webSocketDebuggerUrl);

    let id = 1;
    const send = (method, params = {}) =>
      new Promise((resolve, reject) => {
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

    await new Promise((r) => ws.addEventListener('open', r));
    await send('Runtime.enable');
    await send('Page.enable');

    console.log('Navigating to http://localhost:4195/#/design-custom...');
    await send('Page.navigate', { url: 'http://localhost:4195/#/design-custom' });
    await new Promise((r) => setTimeout(r, 2000));

    // 1. Verify Catalog View
    console.log('Verifying Custom Apparel Catalog View...');
    const catalogCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const title = document.querySelector('h1')?.textContent.trim();
          const categories = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Produk')).map(b => b.textContent.trim());
          const products = Array.from(document.querySelectorAll('h3')).map(h => h.textContent.trim());
          const startButtons = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Mulai Desain')).length;
          return { title, categories, productsCount: products.length, startButtons };
        })()
      `,
      returnByValue: true,
    });
    console.log('Catalog check result:', catalogCheck.result?.value);

    // 2. Click "Mulai Desain" on the first product (NSA 7200)
    console.log('Clicking "Mulai Desain" on first product...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Mulai Desain'));
          if (btn) btn.click();
        })()
      `,
    });
    await new Promise((r) => setTimeout(r, 1500));

    // 3. Verify Studio Editor View
    console.log('Verifying Studio Editor View...');
    const studioCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const backBtn = Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Pilih Produk Lain'));
          const hasCanvas = document.querySelector('canvas') !== null;
          const yellowCartBtn = Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Masukkan ke Keranjang'));
          const toolTabs = ['Product', 'Upload Image', 'Add Text', 'Add Clip Art', 'Layer', 'My Images', 'Template', 'Help'].filter(name => {
            return Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes(name));
          });
          const angles = ['Depan', 'Belakang', 'Lengan Kiri', 'Lengan Kanan'].filter(name => {
            return Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes(name));
          });
          return { backBtn, hasCanvas, yellowCartBtn, toolTabsCount: toolTabs.length, anglesCount: angles.length };
        })()
      `,
      returnByValue: true,
    });
    console.log('Studio check result:', studioCheck.result?.value);

    // 4. Test clicking "Add Text" tab and adding text
    console.log('Testing Add Text tab...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const textTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Add Text'));
          if (textTab) textTab.click();
        })()
      `,
    });
    await new Promise((r) => setTimeout(r, 600));

    // Click "Tambahkan Teks ke Kaos"
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const addBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Tambahkan Teks ke Kaos'));
          if (addBtn) addBtn.click();
        })()
      `,
    });
    await new Promise((r) => setTimeout(r, 600));

    // 5. Test returning to catalog via "Pilih Produk Lain"
    console.log('Clicking "Pilih Produk Lain" to return to catalog...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const back = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Pilih Produk Lain'));
          if (back) back.click();
        })()
      `,
    });
    await new Promise((r) => setTimeout(r, 1000));

    const returnedCatalog = await send('Runtime.evaluate', {
      expression: `document.querySelector('h1')?.textContent.includes('Custom Apparel')`,
      returnByValue: true,
    });
    console.log('Successfully returned to catalog view:', returnedCatalog.result?.value);

    ws.close();
    edgeProc.kill();
    server.close();

    const cat = catalogCheck.result?.value;
    const stu = studioCheck.result?.value;
    const ret = returnedCatalog.result?.value;

    if (
      cat?.title === 'Custom Apparel' &&
      cat?.categories.length >= 4 &&
      cat?.productsCount >= 4 &&
      stu?.backBtn &&
      stu?.hasCanvas &&
      stu?.yellowCartBtn &&
      stu?.toolTabsCount === 8 &&
      ret === true
    ) {
      console.log('\n>>> CITITEX STUDIO FULL-FLOW TEST PASSED 100%! <<<');
      process.exit(0);
    } else {
      console.error('\n>>> TEST FAILED! <<<', { cat, stu, ret });
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error:', err);
    edgeProc.kill();
    server.close();
    process.exit(1);
  }
});
