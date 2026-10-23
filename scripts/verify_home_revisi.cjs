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

server.listen(4190, async () => {
  console.log('Server running on 4190. Starting headless Edge test...');
  const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edgeProc = spawn(edge, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9230',
    'http://localhost:4190/',
  ]);

  await new Promise((r) => setTimeout(r, 2500));

  try {
    const listRes = await fetch('http://127.0.0.1:9230/json');
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

    const pageErrors = [];
    ws.addEventListener('message', (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.method === 'Runtime.exceptionThrown') {
        pageErrors.push(msg.params.exceptionDetails);
        console.error('Browser error:', msg.params.exceptionDetails.text);
      }
    });

    console.log('Navigating to http://localhost:4190/#/...');
    await send('Page.navigate', { url: 'http://localhost:4190/#/' });
    await new Promise((r) => setTimeout(r, 2000));

    // 1. Verify Navbar Items
    console.log('Checking Navbar items...');
    const navCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const links = Array.from(document.querySelectorAll('header nav a')).map(a => a.textContent.trim());
          const waBtn = document.querySelector('header a[href*="wa.me"]')?.textContent.trim();
          return { links, waBtn };
        })()
      `,
      returnByValue: true,
    });
    console.log('Navbar result:', navCheck.result?.value);

    // 2. Verify Estimasi Harga Section
    console.log('Checking Estimasi Harga Section...');
    const hargaCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const title = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Estimasi harga'))?.textContent;
          const cards = Array.from(document.querySelectorAll('h3')).map(h => h.textContent.trim()).filter(t => t.includes('mulai'));
          const ctaButtons = Array.from(document.querySelectorAll('a')).filter(a => a.textContent.includes('Order Sekarang')).length;
          return { title, cards, ctaButtons };
        })()
      `,
      returnByValue: true,
    });
    console.log('Harga Section result:', hargaCheck.result?.value);

    // 3. Verify Customer Reviews Section
    console.log('Checking Customer Reviews Section...');
    const reviewCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const title = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Baca review'))?.textContent;
          const quoteHeading = Array.from(document.querySelectorAll('h3')).find(h => h.textContent.includes('Apa yang dikatakan customer'))?.textContent;
          const users = Array.from(document.querySelectorAll('.truncate')).map(el => el.textContent.trim()).filter(Boolean);
          return { title, quoteHeading, users };
        })()
      `,
      returnByValue: true,
    });
    console.log('Reviews Section result:', reviewCheck.result?.value);

    // 4. Click "Design Custom" on Navbar
    console.log('Clicking "Design Custom" in navbar...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const designLink = Array.from(document.querySelectorAll('header nav a')).find(a => a.textContent.includes('Design Custom'));
          if (designLink) designLink.click();
        })()
      `,
    });
    await new Promise((r) => setTimeout(r, 1500));

    // Verify Studio Customizer Loaded
    const studioCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const studioBadge = document.body.innerText.includes('Custom Studio') || document.body.innerText.includes('New States Apparel');
          const hasPricelist = Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Pricelist Sablon'));
          const url = window.location.href;
          return { studioBadge, hasPricelist, url };
        })()
      `,
      returnByValue: true,
    });
    console.log('Studio check result:', studioCheck.result?.value);

    ws.close();
    edgeProc.kill();
    server.close();

    const nav = navCheck.result?.value;
    const harga = hargaCheck.result?.value;
    const reviews = reviewCheck.result?.value;
    const studio = studioCheck.result?.value;

    const navPass =
      nav?.links.includes('Koleksi Kaos') &&
      nav?.links.includes('Design Custom') &&
      !nav?.links.includes('Studio Mockup') &&
      nav?.waBtn.includes('Konsultasi Admin');

    const hargaPass =
      harga?.title &&
      harga?.cards.length === 3 &&
      harga?.ctaButtons >= 3;

    const reviewPass =
      reviews?.title &&
      reviews?.quoteHeading &&
      reviews?.users.length >= 3;

    const studioPass =
      studio?.studioBadge &&
      studio?.hasPricelist;

    if (navPass && hargaPass && reviewPass && studioPass && pageErrors.length === 0) {
      console.log('\n>>> ALL REVISI TESTS PASSED PERFECTLY! <<<');
      process.exit(0);
    } else {
      console.error('\n>>> TEST FAILED! <<<', { navPass, hargaPass, reviewPass, studioPass, errorsCount: pageErrors.length });
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error:', err);
    edgeProc.kill();
    server.close();
    process.exit(1);
  }
});
