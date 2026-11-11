import fs from 'node:fs/promises';

const target = await (await fetch('http://127.0.0.1:9227/json/new?about:blank', { method: 'PUT' })).json();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
let id = 0;
const pending = new Map();
socket.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const action = pending.get(message.id);
    pending.delete(message.id);
    message.error ? action.reject(message.error) : action.resolve(message.result);
  }
};
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const next = ++id;
  pending.set(next, { resolve, reject });
  socket.send(JSON.stringify({ id: next, method, params }));
});
const evaluate = async expr => {
  const res = await call('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  return res.result.value;
};

await call('Page.enable');
await call('Runtime.enable');
await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await call('Page.navigate', { url: 'http://127.0.0.1:31990/' });
await new Promise(r => setTimeout(r, 1200));

await evaluate(`(() => {
  const sec = document.getElementById('coleccion');
  if (sec) sec.scrollIntoView({ behavior: 'instant' });
})()`);
await new Promise(r => setTimeout(r, 700));

const shot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
await fs.writeFile('docs/catalog-migration/home-cards-1440.png', Buffer.from(shot.data, 'base64'));
console.log('Saved docs/catalog-migration/home-cards-1440.png');
socket.close();
