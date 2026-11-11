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
  await call('Page.navigate', { url: 'http://127.0.0.1:31990/' });
  await new Promise(resolve => setTimeout(resolve, 1100));
  await evaluate(`window.scrollTo(0,document.querySelector('.collection-experience').offsetTop)`);
  await new Promise(resolve => setTimeout(resolve, 350));
  const before = await evaluate(`(async()=>{const rail=document.querySelector('.collection-rail');const images=[...rail.querySelectorAll('img')].slice(0,4);await Promise.all(images.map(image=>image.decode().catch(()=>{})));return {viewport:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,count:rail.children.length,railWidth:rail.clientWidth,contentWidth:rail.scrollWidth,firstCategory:rail.querySelector('.collection-photo')?.dataset.category,broken:images.filter(image=>!image.naturalWidth).map(image=>image.src),overflow:[...document.querySelectorAll('body *')].filter(element=>{const r=element.getBoundingClientRect();return r.width>0&&r.right>document.documentElement.clientWidth+5&&getComputedStyle(element).position!=='fixed'&&!element.closest('.collection-rail,.collection-tabs,.edition-hero')}).sort((a,b)=>b.getBoundingClientRect().right-a.getBoundingClientRect().right).slice(0,8).map(element=>({tag:element.tagName,cls:String(element.className).slice(0,60),parent:String(element.parentElement?.className).slice(0,60),right:Math.round(element.getBoundingClientRect().right)}))}})()`);
  if (width === 1440 || width === 390) {
    const screenshot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    await fs.writeFile(`docs/catalog-migration/collections-${width}.png`, Buffer.from(screenshot.data, 'base64'));
  }
  await evaluate(`document.querySelector('.collection-arrows button:last-child').click()`);
  await new Promise(resolve => setTimeout(resolve, 500));
  const afterArrow = await evaluate(`document.querySelector('.collection-rail').scrollLeft`);
  await evaluate(`Array.from(document.querySelectorAll('.collection-tabs button')).find(button=>button.textContent==='Gorras').click()`);
  await new Promise(resolve => setTimeout(resolve, 120));
  const gorras = await evaluate(`({count:document.querySelector('.collection-rail').children.length,category:document.querySelector('.collection-photo')?.dataset.category,href:document.querySelector('.collection-photo')?.getAttribute('href')})`);
  await evaluate(`{const rail=document.querySelector('.collection-rail');rail.scrollLeft=0;rail.focus();rail.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}))}`);
  await new Promise(resolve => setTimeout(resolve, 400));
  const afterKeyboard = await evaluate(`document.querySelector('.collection-rail').scrollLeft`);
  let afterTouch = null;
  if (width === 390) {
    const point = await evaluate(`{const rail=document.querySelector('.collection-rail');rail.scrollLeft=0;const rect=rail.getBoundingClientRect();({x:Math.round(rect.left+rect.width*.75),y:Math.round(Math.min(rect.top+130,innerHeight-80))})}`);
    await call('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: point.x, y: point.y }] });
    await call('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: point.x - 80, y: point.y }] });
    await new Promise(resolve => setTimeout(resolve, 70));
    await call('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: point.x - 165, y: point.y }] });
    await call('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await new Promise(resolve => setTimeout(resolve, 450));
    afterTouch = await evaluate(`document.querySelector('.collection-rail').scrollLeft`);
  }
  let destination = null;
  if (width === 1440) {
    await evaluate(`document.querySelector('.collection-view-all').click()`);
    await new Promise(resolve => setTimeout(resolve, 180));
    destination = await evaluate(`location.pathname+location.search`);
  }
  if (width === 390) {
    await evaluate(`document.querySelector('.collection-photo').click()`);
    await new Promise(resolve => setTimeout(resolve, 180));
    destination = await evaluate(`location.pathname`);
  }
  results.push({ width, ...before, afterArrow, afterKeyboard, afterTouch, gorras, destination });
}
console.log(JSON.stringify({ results, exceptions }, null, 2));
socket.close();

