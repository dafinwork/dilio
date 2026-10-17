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

server.listen(4182, async () => {
  console.log('Serving dist on 4182. Starting Edge with remote debugging...');
  const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edgeProc = spawn(edge, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9222',
    'http://localhost:4182/#/admin'
  ]);

  // Wait 1.5s for Edge to start
  await new Promise(r => setTimeout(r, 1500));

  try {
    const listRes = await fetch('http://127.0.0.1:9222/json');
    const tabs = await listRes.json();
    const tab = tabs.find(t => t.type === 'page');
    if (!tab) throw new Error('No page tab found in Edge');

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

    // Enable runtime and log console errors
    await send('Runtime.enable');
    const pageErrors = [];
    ws.addEventListener('message', (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.method === 'Runtime.exceptionThrown') {
        pageErrors.push(msg.params.exceptionDetails);
        console.error('Browser Uncaught Exception:', msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception?.description);
      }
    });

    console.log('Logging in with admin123...');
    // Evaluate login: input PIN and submit
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

    // Wait 1.5s for dashboard table to load
    await new Promise(r => setTimeout(r, 1500));

    // Check if table loaded
    const checkTable = await send('Runtime.evaluate', {
      expression: `document.querySelectorAll('tbody tr').length`,
      returnByValue: true
    });
    console.log('Table rows count:', checkTable.result?.value);

    // Click the first "Edit Produk" button
    console.log('Clicking "Edit Produk" button...');
    const editClick = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const editBtn = document.querySelector('button[title="Edit Produk"]');
          if (!editBtn) return 'edit button not found';
          editBtn.click();
          return 'clicked edit button';
        })()
      `,
      returnByValue: true
    });
    console.log('Edit click result:', editClick.result?.value);

    // Wait 500ms for modal to open
    await new Promise(r => setTimeout(r, 500));

    // Verify modal state
    const modalCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const title = document.querySelector('h3.text-xl')?.textContent;
          const nameInput = document.querySelector('input[name="name"]')?.value;
          const isModalVisible = document.querySelector('form') !== null;
          return { title, nameInput, isModalVisible };
        })()
      `,
      returnByValue: true
    });
    console.log('Modal Check:', modalCheck.result?.value);

    // Now test submitting the form
    console.log('Submitting the edit form...');
    const submitResult = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const submitBtn = document.querySelector('button[type="submit"]');
          if (!submitBtn) return 'submit button not found';
          submitBtn.click();
          return 'submit clicked';
        })()
      `,
      returnByValue: true
    });
    console.log('Submit button clicked:', submitResult.result?.value);

    // Wait 1s for save & modal close
    await new Promise(r => setTimeout(r, 1000));

    const postSubmit = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const toast = document.querySelector('.bg-emerald-600')?.textContent || '';
          const modalStillOpen = document.querySelector('h3.text-xl')?.textContent === 'Edit Produk';
          return { toast, modalStillOpen };
        })()
      `,
      returnByValue: true
    });
    console.log('Post-submit state:', postSubmit.result?.value);

    // Check if blank screen occurred
    const isBlank = await send('Runtime.evaluate', {
      expression: `document.getElementById('root').innerHTML.length`,
      returnByValue: true
    });
    console.log('Root innerHTML length:', isBlank.result?.value);

    ws.close();
    edgeProc.kill();
    server.close();

    if (pageErrors.length > 0) {
      console.error('FAIL: Detected runtime errors during edit!');
      process.exit(1);
    }

    if (modalCheck.result?.value?.title === 'Edit Produk' && !postSubmit.result?.value?.modalStillOpen) {
      console.log('\n>>> SUCCESS! Edit modal opened, saved, and closed without error! <<<');
      process.exit(0);
    } else {
      console.error('\n>>> FAIL: Edit modal flow had an issue! <<<');
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    edgeProc.kill();
    server.close();
    process.exit(1);
  }
});
