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

async function testHover() {
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

  const res1 = await evalExpr(`
    (() => {
      const btn = Array.from(document.querySelectorAll('.bf-desktop-nav button')).find(b => b.textContent.includes('Hombre'));
      if (!btn) return 'not found';
      // Simulate real mouse move via Input or synthetic event
      btn.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      btn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
      return 'Dispatched mouseover/mouseenter';
    })()
  `);
  console.log('Dispatch:', res1);

  await new Promise(r => setTimeout(r, 400));

  const check = await evalExpr(`
    (() => {
      const menu = document.querySelector('.sauz-mega-menu-container');
      const trigger = Array.from(document.querySelectorAll('.bf-desktop-nav button')).find(b => b.textContent.includes('Hombre'));
      return {
        menuFound: Boolean(menu),
        triggerClass: trigger?.className,
        triggerExpanded: trigger?.getAttribute('aria-expanded')
      };
    })()
  `);
  console.log('Check:', check);

  ws.close();
}

testHover();
