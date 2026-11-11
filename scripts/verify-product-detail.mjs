import fs from 'node:fs/promises';

const target = await (await fetch('http://127.0.0.1:9227/json/new?about:blank', { method: 'PUT' })).json();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
let id = 0; const pending = new Map();
socket.onmessage = e => { const m = JSON.parse(e.data); if (m.id) { const a = pending.get(m.id); pending.delete(m.id); m.error ? a.reject(m.error) : a.resolve(m.result); } };
const call = (method, params = {}) => new Promise((resolve, reject) => { const next = ++id; pending.set(next, { resolve, reject }); socket.send(JSON.stringify({ id: next, method, params })); });

await call('Page.enable');
await call('Runtime.enable');

// Desktop 1440x950
await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 950, deviceScaleFactor: 1, mobile: false });
await call('Page.navigate', { url: 'http://127.0.0.1:31990/producto/13' });
await new Promise(r => setTimeout(r, 1200));

const shotDesktop = await call('Page.captureScreenshot', { format: 'png' });
await fs.writeFile('docs/catalog-migration/product-detail-desktop-1440.png', Buffer.from(shotDesktop.data, 'base64'));
console.log('Saved docs/catalog-migration/product-detail-desktop-1440.png');

// Mobile 390x844
await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await call('Page.navigate', { url: 'http://127.0.0.1:31990/producto/13' });
await new Promise(r => setTimeout(r, 1200));

const shotMobile = await call('Page.captureScreenshot', { format: 'png' });
await fs.writeFile('docs/catalog-migration/product-detail-mobile-390.png', Buffer.from(shotMobile.data, 'base64'));
console.log('Saved docs/catalog-migration/product-detail-mobile-390.png');

socket.close();
