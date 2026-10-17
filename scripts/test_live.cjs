const { spawn } = require('child_process');

async function testLiveAdmin() {
  const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edgeProc = spawn(edge, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9223',
    'https://kaosdilio.com/#/admin'
  ]);

  await new Promise(r => setTimeout(r, 2500));

  try {
    const listRes = await fetch('http://127.0.0.1:9223/json');
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

    const pageErrors = [];
    ws.addEventListener('message', (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.method === 'Runtime.exceptionThrown') {
        pageErrors.push(msg.params.exceptionDetails);
        console.error('Live Exception:', msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception?.description);
      }
    });

    console.log('Logging into live CMS...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const pin = document.querySelector('input[type="password"]');
          if (!pin) return 'no pin';
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(pin, 'admin123');
          pin.dispatchEvent(new Event('input', { bubbles: true }));
          pin.dispatchEvent(new Event('change', { bubbles: true }));
          document.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
          return 'submitted';
        })()
      `,
      returnByValue: true
    });

    await new Promise(r => setTimeout(r, 2000));

    console.log('Clicking Edit Produk on live CMS...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.querySelector('button[title="Edit Produk"]');
          if (btn) btn.click();
        })()
      `
    });

    await new Promise(r => setTimeout(r, 1000));

    const check = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const modalTitle = document.querySelector('h3.text-xl')?.textContent;
          const rootLen = document.getElementById('root').innerHTML.length;
          return { modalTitle, rootLen };
        })()
      `,
      returnByValue: true
    });

    console.log('LIVE CHECK RESULT:', check.result?.value);
    ws.close();
    edgeProc.kill();

    if (check.result?.value?.modalTitle === 'Edit Produk') {
      console.log('LIVE VERIFICATION PASSED 100%!');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (e) {
    console.error(e);
    edgeProc.kill();
    process.exit(1);
  }
}

testLiveAdmin();
