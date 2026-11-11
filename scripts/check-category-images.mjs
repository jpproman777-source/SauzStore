const target = await (await fetch('http://127.0.0.1:9227/json/new?about:blank', { method: 'PUT' })).json();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
let id = 0;
const pending = new Map();
socket.onmessage = event => {
  const message = JSON.parse(event.data);
  if (!message.id) return;
  const action = pending.get(message.id);
  pending.delete(message.id);
  message.error ? action.reject(message.error) : action.resolve(message.result);
};
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const next = ++id;
  pending.set(next, { resolve, reject });
  socket.send(JSON.stringify({ id: next, method, params }));
});
const evaluate = async expression => {
  const response = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description);
  return response.result.value;
};
await call('Page.enable');
await call('Network.enable');
await call('Network.setCacheDisabled', { cacheDisabled: true });
await call('Page.navigate', { url: 'http://127.0.0.1:31990/' });
await new Promise(resolve => setTimeout(resolve, 1600));
const categories = await evaluate(`[...document.querySelectorAll('.collection-tabs button')].map(button => button.textContent.trim())`);
const results = [];
for (const category of categories) {
  const result = await evaluate(`(async()=>{
    const button=[...document.querySelectorAll('.collection-tabs button')].find(item=>item.textContent.trim()===${JSON.stringify(category)});
    button.click();
    await new Promise(resolve=>setTimeout(resolve,120));
    const image=document.querySelector('.collection-photo img');
    image.loading='eager';
    await image.decode().catch(()=>{});
    return {category:${JSON.stringify(category)},count:document.querySelector('.collection-rail').children.length,width:image.naturalWidth,height:image.naturalHeight,fit:getComputedStyle(image).objectFit,current:image.currentSrc};
  })()`);
  results.push(result);
}
console.log(JSON.stringify(results, null, 2));
socket.close();
if (results.some(item => item.count < 1 || item.width < 100 || item.height < 100 || item.fit !== 'contain')) process.exitCode = 1;
