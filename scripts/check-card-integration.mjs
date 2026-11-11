import fs from 'node:fs/promises';

const target = await (await fetch('http://127.0.0.1:9227/json/new?about:blank', { method: 'PUT' })).json();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
let id = 0;
const pending = new Map();
const exceptions = [];
socket.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const action = pending.get(message.id);
    pending.delete(message.id);
    message.error ? action.reject(message.error) : action.resolve(message.result);
  } else if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails?.exception?.description);
};
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const next = ++id;
  pending.set(next, { resolve, reject });
  socket.send(JSON.stringify({ id: next, method, params }));
});
const evaluate = async expression => {
  const result = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description);
  return result.result.value;
};
await call('Page.enable');
await call('Runtime.enable');
await call('Network.enable');
await call('Network.setCacheDisabled', { cacheDisabled: true });
await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
const categories = ['Camisetas', 'Sudaderas', 'Conjuntos', 'Zapatillas', 'Gorras', 'Chaquetas', 'Pantalones'];
const results = [];
for (const category of categories) {
  await call('Page.navigate', { url: `http://127.0.0.1:31990/catalogo?coleccion=${encodeURIComponent(category)}` });
  for (let i = 0; i < 30; i++) {
    const ready = await evaluate(`Boolean(document.querySelector('.premium-card'))`);
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  const result = await evaluate(`(async()=>{
    const grid=document.querySelector('.premium-grid');
    grid.scrollIntoView({behavior:'instant'});
    const cards=[...grid.querySelectorAll('.premium-card')];
    const images=cards.slice(0,4).map(card=>card.querySelector('.premium-card-visual img'));
    await Promise.all(images.map(async image=>{image.loading='eager';await image.decode().catch(()=>{})}));
    const visual=cards[0]?.querySelector('.premium-card-visual');
    return {category:${JSON.stringify(category)},count:cards.length,images:images.map(image=>({natural:image.naturalWidth,src:image.currentSrc,fit:getComputedStyle(image).objectFit,padding:getComputedStyle(image).padding,transform:getComputedStyle(image).transform})),background:visual&&getComputedStyle(visual).backgroundColor,overlay:visual&&getComputedStyle(visual,'::before').content,quick:visual&&getComputedStyle(visual.querySelector('.premium-card-quick')).backgroundColor,scroll:document.documentElement.scrollWidth-document.documentElement.clientWidth};
  })()`);
  const shot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await fs.writeFile(`docs/catalog-migration/cards-${category.toLowerCase()}.png`, Buffer.from(shot.data, 'base64'));
  results.push(result);
}
console.log(JSON.stringify({ results, exceptions }, null, 2));
socket.close();
if (exceptions.length || results.some(row => row.count === 0 || row.background !== 'rgb(0, 0, 0)' || row.overlay !== 'none' || row.scroll > 0 || row.images.some(image => image.natural < 100 || image.fit !== 'contain' || image.padding !== '0px'))) process.exitCode = 1;
