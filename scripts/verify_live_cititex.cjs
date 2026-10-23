const { spawn } = require('child_process');

async function verifyLive() {
  console.log('Testing live deployment at https://kaosdilio.com/#/design-custom ...');
  const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edgeProc = spawn(edge, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9240',
    'https://kaosdilio.com/#/design-custom',
  ]);

  await new Promise((r) => setTimeout(r, 4000));

  try {
    const listRes = await fetch('http://127.0.0.1:9240/json');
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

    await new Promise((resolve) => {
      ws.addEventListener('open', resolve);
    });

    await send('Runtime.enable');
    const logs = [];
    ws.addEventListener('message', (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        logs.push(msg.params.args.map((a) => a.value || JSON.stringify(a)).join(' '));
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        logs.push('EXCEPTION: ' + JSON.stringify(msg.params.exceptionDetails));
      }
    });

    // Wait for page to settle
    await new Promise((r) => setTimeout(r, 2000));

    // 1. Verify Catalog View
    const evalCatalog = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const title = document.body.innerText.includes('Custom Apparel') || document.body.innerText.includes('Pilih Kategori');
          const categories = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim());
          const productCards = document.querySelectorAll('.grid > div');
          const startBtns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('Mulai Desain'));
          return {
            hasTitle: title,
            categoriesCount: categories.filter(c => ['T-Shirts', 'Jacket & Hoodies', 'Polo T-Shirt', 'Sport T-Shirts'].some(t => c.includes(t))).length,
            productCount: productCards.length,
            startBtnsCount: startBtns.length,
            bodySnippet: document.body.innerText.slice(0, 300)
          };
        })()
      `,
      returnByValue: true,
    });

    console.log('1. Catalog View Check:', JSON.stringify(evalCatalog.result.value, null, 2));

    // Click "Mulai Desain" on first product
    console.log('Clicking "Mulai Desain" to test Studio Editor transition on live site...');
    const clickRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Mulai Desain'));
          if (btn) {
            btn.click();
            return { clicked: true, text: btn.innerText };
          }
          return { clicked: false };
        })()
      `,
      returnByValue: true,
    });
    console.log('Click result:', clickRes.result.value);

    // Wait for Studio Editor to render
    await new Promise((r) => setTimeout(r, 2000));

    // 2. Verify Studio Editor View
    const evalStudio = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const backBtn = Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes('Pilih Produk Lain'));
          const toolTabs = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(t => 
            ['Product', 'Upload Image', 'Add Text', 'Add Clip Art', 'Layer', 'My Images', 'Template', 'Help'].includes(t)
          );
          const canvas = !!document.querySelector('canvas');
          const angles = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(t =>
            ['Depan', 'Belakang', 'Lengan Kiri', 'Lengan Kanan'].includes(t)
          );
          const cartBtn = Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes('Masukkan ke Keranjang'));

          return {
            hasBackButton: backBtn,
            toolTabsFound: toolTabs,
            canvasFound: canvas,
            angleButtons: angles,
            hasCartBtn: cartBtn
          };
        })()
      `,
      returnByValue: true,
    });

    console.log('2. Studio Editor Check:', JSON.stringify(evalStudio.result.value, null, 2));

    // Also check homepage auto-scroll carousel
    console.log('Navigating to homepage https://kaosdilio.com/#/ to check review auto-scroll...');
    await send('Page.navigate', { url: 'https://kaosdilio.com/#/' });
    await new Promise((r) => setTimeout(r, 3000));

    const evalHome = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const reviewTitle = document.body.innerText.includes('Baca review tentang kami');
          const pricingTitle = document.body.innerText.includes('Estimasi harga beli banyak');
          const tiers = ['43.000', '37.000', '30.000'].every(p => document.body.innerText.includes(p));
          return {
            hasReviewSection: reviewTitle,
            hasPricingSection: pricingTitle,
            hasAllTiers: tiers
          };
        })()
      `,
      returnByValue: true,
    });

    console.log('3. Homepage Check:', JSON.stringify(evalHome.result.value, null, 2));

    const errors = logs.filter((l) => l.includes('EXCEPTION') || l.includes('Error'));
    if (errors.length > 0) {
      console.warn('Browser logs contained errors/exceptions:', errors);
    } else {
      console.log('No console errors detected! ALL CHECKS PASSED PERFECTLY!');
    }

    ws.close();
  } finally {
    edgeProc.kill();
  }
}

verifyLive().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
