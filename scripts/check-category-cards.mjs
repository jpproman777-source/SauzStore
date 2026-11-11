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
await call('Page.navigate', { url: 'http://127.0.0.1:31990/' });
await new Promise(r => setTimeout(r, 1200));

await call('Runtime.evaluate', {
  expression: `(() => {
    const sec = document.getElementById('coleccion');
    if (sec) sec.scrollIntoView({ behavior: 'instant' });
  })()`
});
await new Promise(r => setTimeout(r, 1500));

const stats = await call('Runtime.evaluate', {
  expression: `(() => {
    const cards = Array.from(document.querySelectorAll('.bf-category-card'));
    return cards.map(c => {
      const name = c.querySelector('.bf-cat-name')?.textContent;
      const sub = c.querySelector('.bf-cat-sub')?.textContent;
      const count = c.querySelector('.bf-cat-count')?.textContent;
      const tag = c.querySelector('.bf-cat-tag')?.textContent;
      const img = c.querySelector('.bf-cat-thumb');
      return {
        name,
        sub,
        count,
        tag,
        imgSrc: img ? img.src : null,
        imgComplete: img ? img.complete : null,
        imgNaturalWidth: img ? img.naturalWidth : null,
        imgNaturalHeight: img ? img.naturalHeight : null,
      };
    });
  })()`,
  returnByValue: true
});
console.log(JSON.stringify(stats.result.value, null, 2));
socket.close();
