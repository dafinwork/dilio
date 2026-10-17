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

server.listen(4186, async () => {
  console.log('Serving dist on 4186. Starting Edge with remote debugging...');
  const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edgeProc = spawn(edge, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9226',
    'http://localhost:4186/#/admin'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const listRes = await fetch('http://127.0.0.1:9226/json');
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
    await send('Page.enable');
    await send('Page.navigate', { url: 'http://localhost:4186/#/admin' });
    await new Promise(r => setTimeout(r, 2000));

    const curUrl = await send('Runtime.evaluate', { expression: 'window.location.href', returnByValue: true });
    console.log('Current URL in Edge:', curUrl.result?.value);

    const bodyPreview = await send('Runtime.evaluate', {
      expression: 'document.body.innerText.slice(0, 200)',
      returnByValue: true
    });
    console.log('Body preview:', bodyPreview.result?.value);

    console.log('Waiting for page to render...');
    const waitForSelector = async (selector, maxRetries = 30) => {
      for (let i = 0; i < maxRetries; i++) {
        const res = await send('Runtime.evaluate', {
          expression: `!!document.querySelector('${selector}')`,
          returnByValue: true
        });
        if (res.result?.value) return true;
        await new Promise(r => setTimeout(r, 200));
      }
      return false;
    };

    const hasPin = await waitForSelector('input[type="password"]', 25);
    console.log('Has pin input:', hasPin);

    if (hasPin) {
      console.log('Logging in with admin123...');
      const loginRes = await send('Runtime.evaluate', {
        expression: `
          (async () => {
            const pin = document.querySelector('input[type="password"]');
            if (!pin) return 'no pin input';
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            setter.call(pin, 'admin123');
            pin.dispatchEvent(new Event('input', { bubbles: true }));
            pin.dispatchEvent(new Event('change', { bubbles: true }));
            const form = document.querySelector('form');
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            return 'submitted';
          })()
        `,
        awaitPromise: true
      });
      console.log('Login action:', loginRes.result?.value);
    }

    // Wait 1.5s for dashboard table to load
    await new Promise(r => setTimeout(r, 1500));

    // Check if table loaded
    const checkTable = await send('Runtime.evaluate', {
      expression: `document.querySelectorAll('tbody tr').length`,
      returnByValue: true
    });
    console.log('Table rows count:', checkTable.result?.value);

    console.log('Opening Edit modal for first product...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.querySelector('button[title="Edit Produk"]');
          if (btn) btn.click();
        })()
      `
    });

    await new Promise(r => setTimeout(r, 600));

    console.log('Clicking "+ Custom" color button...');
    const clickCustom = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const customBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('+ Custom'));
          if (!customBtn) return 'custom button not found';
          customBtn.click();
          return 'clicked custom button';
        })()
      `,
      returnByValue: true
    });
    console.log('Custom button click result:', clickCustom.result?.value);

    await new Promise(r => setTimeout(r, 600));

    console.log('Checking Color Wheel Modal state...');
    const wheelCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const wheelTitle = Array.from(document.querySelectorAll('h3')).find(h => h.textContent.includes('Color Wheel'))?.textContent;
          const canvas = document.querySelector('canvas') !== null;
          const hexInput = document.querySelector('input[placeholder="#5FADA6"]')?.value;
          return { wheelTitle, canvas, hexInput };
        })()
      `,
      returnByValue: true
    });
    console.log('Color Wheel Modal Check:', wheelCheck.result?.value);

    // Enter #5FADA6 into the hex input
    console.log('Typing #5FADA6 into HEX input...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const hexInp = document.querySelector('input[placeholder="#5FADA6"]');
          if (hexInp) {
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            setter.call(hexInp, '#5FADA6');
            hexInp.dispatchEvent(new Event('input', { bubbles: true }));
            hexInp.dispatchEvent(new Event('change', { bubbles: true }));
          }
        })()
      `
    });

    await new Promise(r => setTimeout(r, 400));

    // Click "Gunakan Warna Ini"
    console.log('Clicking "Gunakan Warna Ini"...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const confirmBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Gunakan Warna Ini'));
          if (confirmBtn) confirmBtn.click();
        })()
      `
    });

    await new Promise(r => setTimeout(r, 600));

    // Verify color dot was added
    const dotCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const dots = Array.from(document.querySelectorAll('.font-mono.text-\\\\[10px\\\\]')).map(s => s.textContent.toLowerCase());
          return dots;
        })()
      `,
      returnByValue: true
    });
    console.log('Current colors in edit form:', dotCheck.result?.value);

    ws.close();
    edgeProc.kill();
    server.close();

    const wheelRes = wheelCheck.result?.value;
    const hasColorAdded = dotCheck.result?.value?.some(c => c.toLowerCase() === '#5fada6');
    if (wheelRes?.wheelTitle && wheelRes?.canvas && hasColorAdded) {
      console.log('\n>>> SUCCESS! Color Wheel opened, selected #5FADA6, and added to product! <<<');
      process.exit(0);
    } else {
      console.error('\n>>> FAIL: Color wheel test did not complete as expected! <<<');
      process.exit(1);
    }
  } catch (e) {
    console.error(e);
    edgeProc.kill();
    server.close();
    process.exit(1);
  }
});
