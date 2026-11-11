import fs from 'node:fs/promises';

const target = await (await fetch('http://127.0.0.1:9227/json/new?about:blank', { method: 'PUT' })).json();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
let sequence = 0;
const pending = new Map();
const exceptions = [];
socket.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const action = pending.get(message.id);
    pending.delete(message.id);
    message.error ? action.reject(message.error) : action.resolve(message.result);
  } else if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails?.text);
};
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++sequence;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});
const evaluate = async expression => {
  const result = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
await call('Runtime.enable');
await call('Page.enable');
await call('Network.enable');
await call('Network.setCacheDisabled', { cacheDisabled: true });
const results = [];
for (const [width, height] of [[1440, 900], [768, 1024], [390, 844], [360, 780]]) {
  await call('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
  for (const route of ['/catalogo', '/producto/13']) {
    await call('Page.navigate', { url: `http://127.0.0.1:31990${route}` });
    await new Promise(resolve => setTimeout(resolve, 950));
    const result = await evaluate(`(async()=>{await Promise.all(Array.from(document.images).map(image=>{image.loading='eager';return image.decode().catch(()=>{})}));return {width:innerWidth,client:document.documentElement.clientWidth,visual:visualViewport.width,scroll:document.documentElement.scrollWidth,broken:Array.from(document.images).filter(image=>image.naturalWidth===0).map(image=>image.src),overflow:Array.from(document.querySelectorAll('body *')).filter(element=>{const rect=element.getBoundingClientRect();return rect.width>0&&rect.right>${width}+1&&getComputedStyle(element).position!=='fixed'}).slice(0,5).map(element=>({tag:element.tagName,cls:String(element.className).slice(0,60),right:Math.round(element.getBoundingClientRect().right)}))}})()`);
    results.push({ route, ...result });
    if (width === 390) {
      const shot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      await fs.writeFile(`docs/catalog-migration/${route === '/catalogo' ? 'catalog' : 'detail'}-390-verified.png`, Buffer.from(shot.data, 'base64'));
    }
  }
}
await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await call('Page.navigate', { url: 'http://127.0.0.1:31990/catalogo' });
await new Promise(resolve => setTimeout(resolve, 800));
await evaluate('document.querySelector(".premium-card-quick").click()');
await new Promise(resolve => setTimeout(resolve, 100));
const quickView = await evaluate('Boolean(document.querySelector(".premium-quick-dialog[open]"))');
await evaluate('document.querySelector(".premium-quick-close").click()');
await evaluate('document.querySelector(".premium-filter-trigger").click()');
const filterDrawer = await evaluate('Boolean(document.querySelector(".premium-filter-drawer[role=dialog]"))');
console.log(JSON.stringify({ results, quickView, filterDrawer, exceptions }, null, 2));
socket.close();
