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

// 1. Home con categorías limpias (revertidas como pidió el usuario)
await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await call('Page.navigate', { url: 'http://127.0.0.1:31990/' });
await new Promise(r => setTimeout(r, 1200));

await call('Runtime.evaluate', {
  expression: `(() => {
    const sec = document.getElementById('coleccion');
    if (sec) sec.scrollIntoView({ behavior: 'instant' });
  })()`
});
await new Promise(r => setTimeout(r, 1000));

let shot = await call('Page.captureScreenshot', { format: 'png' });
await fs.writeFile('docs/catalog-migration/home-clean-reverted.png', Buffer.from(shot.data, 'base64'));
console.log('Saved docs/catalog-migration/home-clean-reverted.png');

// 2. Style Studio Desktop
await call('Page.navigate', { url: 'http://127.0.0.1:31990/style-studio' });
await new Promise(r => setTimeout(r, 1500));

shot = await call('Page.captureScreenshot', { format: 'png' });
await fs.writeFile('docs/catalog-migration/style-studio-desktop.png', Buffer.from(shot.data, 'base64'));
console.log('Saved docs/catalog-migration/style-studio-desktop.png');

// 3. Style Studio Mobile
await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await call('Page.navigate', { url: 'http://127.0.0.1:31990/style-studio' });
await new Promise(r => setTimeout(r, 1500));

shot = await call('Page.captureScreenshot', { format: 'png' });
await fs.writeFile('docs/catalog-migration/style-studio-mobile.png', Buffer.from(shot.data, 'base64'));
console.log('Saved docs/catalog-migration/style-studio-mobile.png');

socket.close();
