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

async function checkConsole() {
  const targets = await getJson('http://localhost:9227/json');
  const pageTarget = targets.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
  const ws = new globalThis.WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: {
    expression: `
      (() => {
        const buttons = Array.from(document.querySelectorAll('.bf-desktop-nav button'));
        return {
          buttonTexts: buttons.map(b => b.textContent.trim()),
          headerHtml: document.querySelector('.bf-header')?.outerHTML?.slice(0, 500)
        };
      })()
    `,
    returnByValue: true
  }}));

  ws.onmessage = (e) => {
    console.log(JSON.stringify(JSON.parse(e.data).result?.result?.value, null, 2));
    ws.close();
  };
}

checkConsole();
