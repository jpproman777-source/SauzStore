import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
await fs.mkdir('/tmp/sauz-premium-qa', {recursive:true});
const target=await(await fetch('http://127.0.0.1:9228/json/new?about:blank',{method:'PUT'})).json();
const socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>socket.addEventListener('open',r,{once:true}));
let sequence=0;const pending=new Map(), checks=[], exceptions=[], responsive=[];
socket.onmessage=event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}}else if(m.method==='Runtime.exceptionThrown')exceptions.push(m.params);};
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
const js=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const check=(label,value)=>{assert.ok(value,label);checks.push(label);};
const click=async selector=>{await js(`document.querySelector(${JSON.stringify(selector)}).click()`);await wait(320);};
const nav=async()=>{await call('Page.navigate',{url:'http://127.0.0.1:3140/'});await wait(500);await js(`document.fonts.ready`);};
const screenshot=async name=>{const r=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile('/tmp/sauz-premium-qa/'+name+'.png',Buffer.from(r.data,'base64'));};
const index=()=>js(`Array.from(document.querySelectorAll('.edition-slide')).findIndex(e=>e.classList.contains('is-active'))`);
await call('Page.enable');await call('Runtime.enable');

const details=[];
await call('Emulation.setDeviceMetricsOverride',{width:1366,height:768,deviceScaleFactor:1,mobile:false});await nav();
for(const file of ['sauz-store.png','jordan.png','nike.png','adidas.png']){const response=await fetch('http://127.0.0.1:3140/logos/web/'+file);check('Logo HTTP 200 y MIME PNG: '+file,response.status===200&&response.headers.get('content-type').startsWith('image/png'));}
check('Header usa SAUZ aprobado y no texto provisional',await js(`document.querySelector('.bf-brand img')?.getAttribute('src')==='/logos/web/sauz-store.png'&&!document.querySelector('.bf-brand .integrated-brand-fallback')`));
check('Franja usa tres imágenes en orden Jordan Nike Adidas',await js(`Array.from(document.querySelectorAll('.edition-slide.is-active .integrated-brand-strip img')).map(i=>i.alt).join(',')==='JORDAN,NIKE,ADIDAS'`));
for(const [width,height]of [[1920,1080],[1440,900],[1366,768],[768,1024],[390,844],[375,812]]){
 await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<700});await nav();
 const measurements=await js(`(()=>{const images=Array.from(document.querySelectorAll('.bf-brand img,.edition-slide.is-active .integrated-brand-strip img'));const logo=document.querySelector('.bf-brand').getBoundingClientRect(),actions=document.querySelector('.bf-header-actions').getBoundingClientRect();return {width:innerWidth,logoRight:logo.right,actionsLeft:actions.left,images:images.map(i=>({source:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0,fit:getComputedStyle(i).objectFit,filter:getComputedStyle(i).filter,width:i.getBoundingClientRect().width,height:i.getBoundingClientRect().height})),badge:{color:getComputedStyle(document.querySelector('.edition-cart-badge')).backgroundColor,text:getComputedStyle(document.querySelector('.edition-cart-badge')).color},heroFont:getComputedStyle(document.querySelector('.edition-slide.is-active h1')).fontFamily,bodyFont:getComputedStyle(document.body).fontFamily}})()`);
 details.push({width,height,...measurements});check('Cuatro logos cargan y usan contain sin filtros '+width,measurements.images.length===4&&measurements.images.every(i=>i.loaded&&i.fit==='contain'&&i.filter==='none'));check('Logo e iconos no se superponen '+width,measurements.logoRight<measurements.actionsLeft);check('Contador rojo y texto blanco '+width,measurements.badge.color==='rgb(255, 23, 36)'&&measurements.badge.text==='rgb(255, 255, 255)');check('Tipografía del hero diferenciada '+width,measurements.heroFont!==measurements.bodyFont);
}
await call('Emulation.setDeviceMetricsOverride',{width:1366,height:768,deviceScaleFactor:1,mobile:false});await nav();
await click('.bf-desktop-nav button:nth-child(4)');check('Ruta Sneakers guarda filtro',await js(`new URLSearchParams(location.search).get('coleccion')==='Sneakers'&&document.querySelector('.bf-desktop-nav [aria-current="page"]').textContent==='Sneakers'`));await call('Page.reload');await wait(550);check('Recargar conserva ruta y activo Sneakers',await js(`document.querySelector('.bf-desktop-nav [aria-current="page"]').textContent==='Sneakers'&&document.querySelectorAll('.bf-product').length===0`));
await click('.bf-desktop-nav button:nth-child(3)');check('Ropa abre catálogo existente',await js(`new URLSearchParams(location.search).get('coleccion')==='Ropa'&&document.querySelectorAll('.bf-product').length===12`));
await js(`history.back()`);await wait(300);check('Atrás restaura activo y filtro Sneakers',await js(`document.querySelector('.bf-desktop-nav [aria-current="page"]').textContent==='Sneakers'&&document.querySelectorAll('.bf-product').length===0`));await js(`history.forward()`);await wait(300);check('Adelante restaura activo y filtro Ropa',await js(`document.querySelector('.bf-desktop-nav [aria-current="page"]').textContent==='Ropa'&&document.querySelectorAll('.bf-product').length===12`));
await click('.bf-desktop-nav button:nth-child(2)');check('Marcas refleja ancla real y estado activo',await js(`location.hash==='#marcas'&&document.querySelector('.bf-desktop-nav [aria-current="page"]').textContent==='Marcas'`));await call('Page.reload');await wait(550);check('Ancla Marcas conserva activo al recargar',await js(`document.querySelector('.bf-desktop-nav [aria-current="page"]').textContent==='Marcas'`));
await click('.bf-brand');check('Logo vuelve al inicio real',await js(`location.pathname==='/'&&!location.hash&&document.querySelector('.bf-desktop-nav [aria-current="page"]').textContent==='Inicio'`));
await click('.bf-desktop-nav button:nth-child(6)');check('Colecciones refleja ancla real y estado activo',await js(`location.hash==='#coleccion'&&document.querySelector('.bf-desktop-nav [aria-current="page"]').textContent==='Colecciones'`));
check('Sin excepciones JavaScript',exceptions.length===0);
await fs.writeFile('/tmp/sauz-premium-qa/identity.json',JSON.stringify({checks,details,exceptions},null,2));console.log(JSON.stringify({passed:checks.length,exceptions},null,2));socket.close();
