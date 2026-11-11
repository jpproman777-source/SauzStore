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
await call('Page.navigate', { url: 'http://127.0.0.1:31990/catalogo' });
await new Promise(r => setTimeout(r, 1200));

// Test quick open click
await evaluate(`document.querySelector('.premium-card-quick').click()`);
await new Promise(r => setTimeout(r, 200));
const isQuickOpen = await evaluate(`Boolean(document.querySelector('.premium-quick-dialog[open]'))`);

// Test close quick view
await evaluate(`document.querySelector('.premium-quick-close').click()`);
await new Promise(r => setTimeout(r, 200));
const isQuickClosed = await evaluate(`!document.querySelector('.premium-quick-dialog[open]')`);

// Test favorite toggle
const initialFav = await evaluate(`document.querySelector('.premium-card-favorite').getAttribute('aria-pressed')`);
await evaluate(`document.querySelector('.premium-card-favorite').click()`);
await new Promise(r => setTimeout(r, 100));
const nextFav = await evaluate(`document.querySelector('.premium-card-favorite').getAttribute('aria-pressed')`);

console.log(JSON.stringify({ isQuickOpen, isQuickClosed, initialFav, nextFav }, null, 2));
socket.close();
