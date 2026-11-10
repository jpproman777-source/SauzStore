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

const results=[];
const sizes=[[1920,1080],[1440,900],[1366,768],[1024,768],[768,1024],[390,844],[375,812]];
await nav('/admin/login');await click('Admin Demo');await js(`document.querySelector('form').requestSubmit()`);await wait(1200);check('Panel administrativo carga por ruta existente',await js(`location.pathname==='/admin'&&document.body.textContent.includes('Dashboard')`));
for(const [width,height]of sizes){await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<540});await wait(300);results.push(await js(`({page:'admin',width:innerWidth,scroll:document.documentElement.scrollWidth,overflow:Array.from(document.querySelectorAll('body *')).filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+2||r.left< -2)}).slice(0,6).map(e=>({tag:e.tagName,cls:e.className,style:e.getAttribute('style')?.slice(0,180),right:e.getBoundingClientRect().right}))})`));if(width===1440||width===390)await shot('admin-'+width);}
await call('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
for(const tab of ['Productos','Inventario','Pedidos','Clientes','Ventas','Reportes','Configuración']){await click(tab);await wait(400);check('Panel visual abre: '+tab,await js(`!document.body.textContent.includes('Algo salió mal')`));}
await nav('/admin/login');await click('Cerrar');await wait(200);
await nav('/admin/login');await click('Cliente Demo');await js(`document.querySelector('form').requestSubmit()`);await wait(600);check('Acceso cliente existente funciona',await js(`location.pathname==='/'`));
await js(`document.querySelector('[aria-label="Mi perfil"]').click()`);await wait(300);
for(const [width,height]of sizes){await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<540});await wait(100);results.push(await js(`({page:'perfil',width:innerWidth,scroll:document.documentElement.scrollWidth,modalWidth:document.querySelector('.modal-card')?.clientWidth,modalScroll:document.querySelector('.modal-card')?.scrollWidth})`));if(width===1440||width===390)await shot('perfil-'+width);}
await nav('/producto/1');await click('AÑADIR A LA BOLSA');await click('FINALIZAR COMPRA');
for(const [width,height]of sizes){await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<540});await wait(100);results.push(await js(`({page:'checkout',width:innerWidth,scroll:document.documentElement.scrollWidth,modalWidth:document.querySelector('.modal-card')?.clientWidth,modalScroll:document.querySelector('.modal-card')?.scrollWidth})`));if(width===390)await shot('checkout-'+width);}
await fetch('http://127.0.0.1:3100/api/cart/items/1',{method:'DELETE'});
await js(`localStorage.removeItem('sauz_auth_user')`);await nav('/admin');check('Administración sigue protegida sin sesión',await js(`document.body.textContent.includes('Ingresa tus credenciales')&&!document.body.textContent.includes('Resumen Ejecutivo')`));
await fs.writeFile('/tmp/sauz-qa/extended.json',JSON.stringify({checks,results,errors},null,2));console.log(JSON.stringify({checks,results,errors},null,2));socket.close();
