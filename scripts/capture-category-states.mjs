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

// Desktop
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

// Capture category section desktop
let clip = await call('Runtime.evaluate', {
  expression: `(() => {
    const el = document.querySelector('.bf-category-row');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: Math.max(0, r.x - 10), y: Math.max(0, r.y + window.scrollY - 10), width: r.width + 20, height: r.height + 20, scale: 1 };
  })()`,
  returnByValue: true
});
if (clip.result.value) {
  let shot = await call('Page.captureScreenshot', { format: 'png', clip: clip.result.value });
  await fs.writeFile('docs/catalog-migration/category-row-upgraded-1440.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved docs/catalog-migration/category-row-upgraded-1440.png');
}

// Hover on card 4 (Zapatillas)
const cardCenter = await call('Runtime.evaluate', {
  expression: `(() => {
    const cards = document.querySelectorAll('.bf-category-card');
    const c = cards[3]; // Zapatillas
    if (!c) return null;
    const r = c.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  })()`,
  returnByValue: true
});
if (cardCenter.result.value) {
  await call('Input.dispatchMouseEvent', { type: 'mouseMoved', x: cardCenter.result.value.x, y: cardCenter.result.value.y });
  await new Promise(r => setTimeout(r, 500));
  let shot = await call('Page.captureScreenshot', { format: 'png', clip: clip.result.value });
  await fs.writeFile('docs/catalog-migration/category-row-hover-1440.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved docs/catalog-migration/category-row-hover-1440.png');
}

// Mobile 390px
await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await call('Page.navigate', { url: 'http://127.0.0.1:31990/' });
await new Promise(r => setTimeout(r, 1200));
await call('Runtime.evaluate', {
  expression: `(() => {
    const sec = document.getElementById('coleccion');
    if (sec) sec.scrollIntoView({ behavior: 'instant' });
  })()`
});
await new Promise(r => setTimeout(r, 1200));

const mobileClip = await call('Runtime.evaluate', {
  expression: `(() => {
    const el = document.querySelector('.bf-category-row');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: 0, y: Math.max(0, r.y + window.scrollY - 10), width: 390, height: r.height + 20, scale: 1 };
  })()`,
  returnByValue: true
});
if (mobileClip.result.value) {
  let shot = await call('Page.captureScreenshot', { format: 'png', clip: mobileClip.result.value });
  await fs.writeFile('docs/catalog-migration/category-row-mobile-390.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved docs/catalog-migration/category-row-mobile-390.png');
}

socket.close();
