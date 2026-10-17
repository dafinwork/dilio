const { spawn } = require('child_process');

async function testLive() {
  const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edgeProc = spawn(edge, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9227',
    'https://kaosdilio.com/#/admin'
  ]);

  await new Promise(r => setTimeout(r, 3000));

  try {
    const listRes = await fetch('http://127.0.0.1:9227/json');
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

    console.log('Logging in on live site...');
    // Poll for PIN input
    for (let i = 0; i < 20; i++) {
      const hasPin = await send('Runtime.evaluate', {
        expression: '!!document.querySelector(\'input[type="password"]\')',
        returnByValue: true
      });
      if (hasPin.result?.value) break;
      await new Promise(r => setTimeout(r, 200));
    }

    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const pin = document.querySelector('input[type="password"]');
          if (!pin) return;
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(pin, 'admin123');
          pin.dispatchEvent(new Event('input', { bubbles: true }));
          pin.dispatchEvent(new Event('change', { bubbles: true }));
          document.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        })()
      `
    });

    await new Promise(r => setTimeout(r, 2000));

    // Open first product edit
    console.log('Opening edit modal on live site...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.querySelector('button[title="Edit Produk"]');
          if (btn) btn.click();
        })()
      `
    });

    await new Promise(r => setTimeout(r, 1000));

    // Click "+ Custom"
    console.log('Clicking "+ Custom" on live site...');
    const clickCustom = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('+ Custom'));
          if (btn) {
            btn.click();
            return true;
          }
          return false;
        })()
      `,
      returnByValue: true
    });
    console.log('Custom button found & clicked:', clickCustom.result?.value);

    await new Promise(r => setTimeout(r, 1000));

    // Verify Color Wheel modal opened on live site
    const wheelCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const title = Array.from(document.querySelectorAll('h3')).find(h => h.textContent.includes('Color Wheel'))?.textContent;
          const canvas = document.querySelector('canvas') !== null;
          const hexInput = document.querySelector('input[placeholder="#5FADA6"]')?.value;
          return { title, canvas, hexInput };
        })()
      `,
      returnByValue: true
    });
    console.log('Live Color Wheel Check:', wheelCheck.result?.value);

    ws.close();
    edgeProc.kill();

    if (wheelCheck.result?.value?.canvas && wheelCheck.result?.value?.title) {
      console.log('\n>>> LIVE SITE VERIFICATION PASSED! <<<');
      process.exit(0);
    } else {
      console.error('\n>>> LIVE SITE VERIFICATION FAILED! <<<');
      process.exit(1);
    }
  } catch (err) {
    console.error('Test error:', err);
    edgeProc.kill();
    process.exit(1);
  }
}

testLive();
