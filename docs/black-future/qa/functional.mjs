import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const targets=await (await fetch('http://127.0.0.1:9225/json')).json();
// Dedicated tab so this suite does not interfere with the responsive suite.
const target=await (await fetch('http://127.0.0.1:9225/json/new?about:blank',{method:'PUT'})).json();
const socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>socket.addEventListener('open',r,{once:true}));
let seq=0;const pending=new Map(),checks=[],errors=[];
socket.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params);};
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
const js=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const nav=async path=>{await call('Page.navigate',{url:'http://127.0.0.1:3100'+path});await wait(600);};
const check=(label,value)=>{assert.ok(value,label);checks.push(label);};
const click=async text=>{check('Botón disponible: '+text,await js(`(()=>{const b=Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim().includes(${JSON.stringify(text)}));if(!b)return false;b.click();return true})()`));await wait(250);};
const input=async(selector,value)=>{await js(`(()=>{const i=document.querySelector(${JSON.stringify(selector)});const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(i,${JSON.stringify(value)});i.dispatchEvent(new Event('input',{bubbles:true}));})()`);await wait(200);};
const select=async(selector,value)=>{await js(`(()=>{const i=document.querySelector(${JSON.stringify(selector)});i.value=${JSON.stringify(value)};i.dispatchEvent(new Event('change',{bubbles:true}));})()`);await wait(200);};
const shot=async name=>{const r=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile('/tmp/sauz-qa/'+name+'.png',Buffer.from(r.data,'base64'));};
await call('Runtime.enable');await call('Page.enable');await call('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
const products=(await (await fetch('http://127.0.0.1:3100/api/products')).json()).products;
check('12 productos comerciales sin duplicados',products.length===12&&new Set(products.map(p=>p.id)).size===12);
for(const p of products){const r=await fetch('http://127.0.0.1:3100'+p.image);check('Imagen local HTTP 200 y MIME imagen: '+p.id,r.status===200&&r.headers.get('content-type').startsWith('image/'));}
for(const product of products){await nav('/producto/'+product.id);check('Ficha propia: '+product.id,await js(`document.querySelector('.bf-detail-info h1')?.textContent===${JSON.stringify(product.name)}`));}
await nav('/catalogo');check('Catálogo de 12 productos',await js(`document.querySelectorAll('.bf-product').length===12`));
await click('Sudaderas');check('Filtro categoría',await js(`document.querySelectorAll('.bf-product').length===6`));await click('LIMPIAR FILTROS');
await input('.bf-catalog-search input','Jordan');check('Búsqueda por nombre',await js(`document.querySelectorAll('.bf-product').length===2`));
await input('.bf-catalog-search input','sin-coincidencias-xyz');check('Estado vacío',await js(`!!document.querySelector('.bf-empty')`));await click('RESTABLECER FILTROS');
await select('.bf-catalog-toolbar label:nth-child(2) select','Jordan');check('Filtro marca',await js(`document.querySelectorAll('.bf-product').length===2`));await click('LIMPIAR FILTROS');
await select('.bf-catalog-toolbar label:nth-child(3) select','price-asc');const expected=products.slice().sort((a,b)=>a.price-b.price)[0].name;check('Orden por precio',await js(`document.querySelector('.bf-product h3').textContent===${JSON.stringify(expected)}`));
await js(`document.querySelector('.bf-product-image').click()`);await wait(200);check('Ficha con URL de producto',await js(`location.pathname.startsWith('/producto/') && !!document.querySelector('.bf-detail-info h1')`));await call('Page.reload');await wait(500);check('Ficha persiste tras recargar',await js(`!!document.querySelector('.bf-detail-info h1')`));
await nav('/producto/1');await click('AÑADIR A LA BOLSA');check('Carrito contiene producto',await js(`!!document.querySelector('.cart-premium-drawer') && document.querySelector('.cart-premium-drawer').textContent.includes('Camisa Jordan')`));
await js(`Array.from(document.querySelectorAll('.cart-premium-drawer button')).find(b=>b.textContent.trim()==='+').click()`);await wait(250);let cart=(await (await fetch('http://127.0.0.1:3100/api/cart')).json()).cart;check('Cantidad y subtotal correctos',cart.count===2&&cart.subtotal===130000);
await call('Page.reload');await wait(500);await js(`document.querySelector('[aria-label^="Bolsa de compras"]').click()`);await wait(200);check('Carrito persiste tras recargar',await js(`document.querySelector('.cart-premium-drawer').textContent.includes('Camisa Jordan')`));
await click('FINALIZAR COMPRA');check('Checkout abre sin enviar pedido',await js(`!!document.querySelector('.modal-backdrop.open')`));await shot('checkout-1440');
await nav('/');await select('#fit-0','1');check('Fit Lab usa producto real',await js(`document.querySelector('.bf-fit-slot').textContent.includes('65.000')`));check('Fit Lab indica categorías sin stock',await js(`document.querySelectorAll('.bf-fit-slot select:disabled').length===3`));await click('AÑADIR A LA BOLSA');check('Fit Lab añade una pieza real al carrito',((await (await fetch('http://127.0.0.1:3100/api/cart')).json()).cart.count===3));await js(`document.querySelector('.cart-premium-drawer button').click()`);await wait(150);await js(`document.querySelector('#fit-lab').scrollIntoView()`);await wait(200);await shot('fit-lab-1440');
await js(`document.querySelector('[aria-label="Abrir menú"]').click()`);await wait(100);check('Menú móvil abre',await js(`!!document.querySelector('[role="dialog"].bf-menu')`));await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await wait(150);check('Escape cierra menú',await js(`!document.querySelector('.bf-menu')`));
await js(`document.querySelector('[aria-label="Buscar"]').click()`);await input('#site-search','Jordan');await js(`document.querySelector('.bf-search').requestSubmit()`);await wait(250);check('Búsqueda desde header navega y filtra',await js(`location.pathname==='/catalogo' && document.querySelectorAll('.bf-product').length===2`));
await nav('/producto/999999');check('Producto inexistente manejado',await js(`document.body.textContent.includes('No encontramos esta pieza')`));
await nav('/producto/1');await js(`document.querySelector('.bf-gallery img').src='/archivo-inexistente.png'`);await wait(500);check('Fallback local original funciona',await js(`document.querySelector('.bf-gallery img').src.endsWith('sauz-placeholder.svg') && document.querySelector('.bf-gallery img').naturalWidth>0`));
await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await nav('/');check('Movimiento reducido respetado',await js(`getComputedStyle(document.querySelector('.bf-button')).transitionDuration==='0s'`));
await nav('/admin/login');await click('Registrarse');check('Formulario de registro accesible',await js(`!!document.querySelector('input[type="email"]')&&document.body.textContent.includes('Nombre')`));
// Undo only this isolated process's temporary cart item; no checkout is submitted.
await nav('/');await js(`document.querySelector('[aria-label^="Bolsa de compras"]').click()`);await wait(150);await click('REMOVER');check('Carrito temporal restaurado vacío',((await (await fetch('http://127.0.0.1:3100/api/cart')).json()).cart.count===0));
check('Sin excepciones JavaScript',errors.length===0);await fs.writeFile('/tmp/sauz-qa/functional.json',JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({passed:checks.length,checks,errors},null,2));socket.close();
