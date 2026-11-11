import http from 'http';

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function debug() {
  const targets = await getJson('http://localhost:9227/json');
  const p = targets.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
  const ws = new globalThis.WebSocket(p.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  const evalExpr = (expression) => new Promise(res => {
    const id = Date.now();
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

  // Navigate to /
  await evalExpr("window.location.href = 'http://127.0.0.1:31990/'");
  await new Promise(r => setTimeout(r, 1200));

  const buttons = await evalExpr("Array.from(document.querySelectorAll('.bf-desktop-nav button')).map(b => b.textContent.trim())");
  console.log('Nav buttons:', buttons);

  // Dispatch mouseenter on Hombre
  const openRes = await evalExpr(`(() => {
    const btn = Array.from(document.querySelectorAll('.bf-desktop-nav button')).find(b => b.textContent.includes('Hombre'));
    if (!btn) return 'Hombre btn not found';
    btn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    return 'dispatched mouseenter on ' + btn.textContent.trim();
  })()`);
  console.log('openRes:', openRes);

  await new Promise(r => setTimeout(r, 600));

  const megaMenu = await evalExpr("document.querySelector('.sauz-mega-menu-container') ? document.querySelector('.sauz-mega-menu-container').className : 'NOT FOUND'");
  console.log('Mega menu in DOM:', megaMenu);

  ws.close();
}

debug();
