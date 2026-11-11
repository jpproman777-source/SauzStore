import http from 'http';

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function testClick() {
  const targets = await getJson('http://localhost:9227/json');
  const pageTarget = targets.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
  const ws = new globalThis.WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  const evalExpr = (expression) => new Promise(res => {
    const id = Date.now() + Math.random();
    const handler = (event) => {
      const data = JSON.parse(event.data);
      if (data.id === id) {
        ws.removeEventListener('message', handler);
        res(data.result?.result?.value);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression, returnByValue: true } }));
  });

  // Check what happens when we find the button and dispatch pointerdown, mousedown, mouseup, click
  const result = await evalExpr(`
    (() => {
      const btn = Array.from(document.querySelectorAll('.bf-desktop-nav button')).find(b => b.textContent.includes('Hombre'));
      if (!btn) return 'Hombre btn not found';

      // Dispatch real user-like events
      btn.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
      btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      return 'Dispatched click on ' + btn.textContent.trim();
    })()
  `);
  console.log('Result:', result);

  await new Promise(r => setTimeout(r, 600));

  const check = await evalExpr(`
    (() => {
      const menu = document.querySelector('.sauz-mega-menu-container');
      const triggers = Array.from(document.querySelectorAll('.bf-nav-trigger')).map(t => ({
        text: t.textContent.trim(),
        classes: t.className,
        expanded: t.getAttribute('aria-expanded')
      }));
      return {
        menuFound: Boolean(menu),
        menuText: menu?.innerText?.slice(0, 100),
        triggers
      };
    })()
  `);
  console.log('Check after 600ms:', JSON.stringify(check, null, 2));

  ws.close();
}

testClick();
