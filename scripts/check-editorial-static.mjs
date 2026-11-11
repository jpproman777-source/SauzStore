import fs from 'node:fs/promises';

const target = await (await fetch('http://127.0.0.1:9227/json/new?about:blank', { method: 'PUT' })).json();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
let nextId = 0;
const pending = new Map();
const errors = [];
socket.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const promise = pending.get(message.id);
    pending.delete(message.id);
    message.error ? promise.reject(message.error) : promise.resolve(message.result);
  } else if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails?.exception?.description);
};
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++nextId;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
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
const results = [];
for (const width of [1440, 768, 390]) {
  await call('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
  await call('Page.navigate', { url: 'http://127.0.0.1:31990/' });
  await new Promise(resolve => setTimeout(resolve, 1300));
  const result = await evaluate(`(async()=>{
    const section=document.querySelector('.collection-experience');
    section.scrollIntoView({behavior:'instant'});
    const cards=[...section.querySelectorAll('.collection-editorial-card')];
    await Promise.all(cards.map(async card=>{const image=card.querySelector('img');image.loading='eager';await image.decode().catch(()=>{})}));
    const rectangles=cards.map(card=>card.getBoundingClientRect());
    return {width:innerWidth,count:cards.length,titles:cards.map(card=>card.querySelector('.collection-editorial-title')?.textContent),hrefs:cards.map(card=>card.getAttribute('href')),images:cards.map(card=>({src:card.querySelector('img').currentSrc,naturalWidth:card.querySelector('img').naturalWidth})),columns:getComputedStyle(section.querySelector('.collection-editorial-grid')).gridTemplateColumns,rows:[...new Set(rectangles.map(rect=>Math.round(rect.top)))].length,sectionScroll:section.scrollWidth-section.clientWidth,pageScroll:document.documentElement.scrollWidth-document.documentElement.clientWidth,carouselControls:section.querySelectorAll('.collection-arrows,.collection-progress,.collection-tabs,.collection-rail').length};
  })()`);
  if (width === 1440 || width === 390) {
    const shot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    await fs.writeFile(`docs/catalog-migration/editorial-static-${width}.png`, Buffer.from(shot.data, 'base64'));
  }
  if (width === 390) {
    await evaluate(`document.querySelectorAll('.collection-editorial-card')[2].scrollIntoView({behavior:'instant',block:'center'})`);
    await new Promise(resolve => setTimeout(resolve, 220));
    const shot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    await fs.writeFile('docs/catalog-migration/editorial-sneakers-390.png', Buffer.from(shot.data, 'base64'));
  }
  results.push(result);
}
await evaluate(`document.querySelectorAll('.collection-editorial-card')[1].click()`);
await new Promise(resolve => setTimeout(resolve, 200));
const destination = await evaluate(`location.pathname+location.search`);
console.log(JSON.stringify({ results, destination, errors }, null, 2));
socket.close();
if (errors.length || destination !== '/catalogo?coleccion=Gorras' || results.some(item => item.count !== 3 || item.carouselControls || item.sectionScroll > 0 || item.images.some(image => image.naturalWidth < 100)) || results[0].rows !== 1 || results[1].rows !== 2 || results[2].rows !== 3) process.exitCode = 1;
