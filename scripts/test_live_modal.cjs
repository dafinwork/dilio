const { spawn } = require('child_process');

async function testLiveModalColor() {
  const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edgeProc = spawn(edge, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9225',
    'https://kaosdilio.com/#/koleksi-kaos'
  ]);

  await new Promise(r => setTimeout(r, 2500));

  try {
    const listRes = await fetch('http://127.0.0.1:9225/json');
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

    console.log('Clicking card on live Koleksi Kaos...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const card = document.querySelector('.group.cursor-pointer');
          if (card) card.click();
        })()
      `
    });

    await new Promise(r => setTimeout(r, 1200));

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

    console.log('LIVE MODAL CHECK:', check.result?.value);
    ws.close();
    edgeProc.kill();

    const res = check.result?.value;
    if (res?.open && res.colorLabel === 'Warna:' && res.colorDots === 1 && !res.hasVarianLainnya) {
      console.log('LIVE VERIFICATION PASSED: Modal displays "Warna:" with 1 color dot!');
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

testLiveModalColor();
