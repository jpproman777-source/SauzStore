import fs from 'node:fs/promises';

const target = await (await fetch('http://127.0.0.1:9227/json/new?about:blank', { method: 'PUT' })).json();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => socket.addEventListener('open', r, { once: true }));
let id = 0;
const pending = new Map();
socket.onmessage = event => {
  const msg = JSON.parse(event.data);
  if (msg.id) {
    const act = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? act.reject(msg.error) : act.resolve(msg.result);
  }
};
const call = (method, params = {}) => new Promise((res, rej) => {
  const next = ++id;
  pending.set(next, { resolve: res, reject: rej });
  socket.send(JSON.stringify({ id: next, method, params }));
});

await call('Page.enable');
await call('Runtime.enable');
await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await call('Page.navigate', { url: 'http://127.0.0.1:31990/' });
await new Promise(r => setTimeout(r, 1200));

await call('Runtime.evaluate', {
  expression: `(() => {
    const sec = document.getElementById('coleccion');
    if (sec) sec.scrollIntoView({ behavior: 'instant' });
  })()`
});
await new Promise(r => setTimeout(r, 1200));

const clip = await call('Runtime.evaluate', {
  expression: `(() => {
    const el = document.querySelector('.bf-category-row');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: Math.max(0, r.x - 20), y: Math.max(0, r.y + window.scrollY - 20), width: r.width + 40, height: r.height + 40, scale: 1 };
  })()`,
  returnByValue: true
});

console.log('Clip:', clip.result.value);
if (clip.result.value) {
  const shot = await call('Page.captureScreenshot', { format: 'png', clip: clip.result.value });
  await fs.writeFile('docs/catalog-migration/category-row-current.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved docs/catalog-migration/category-row-current.png');
}
socket.close();
