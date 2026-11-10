import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const target=await(await fetch('http://127.0.0.1:9227/json/new?about:blank',{method:'PUT'})).json();
const socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>socket.addEventListener('open',r,{once:true}));
let sequence=0;const pending=new Map(), checks=[], exceptions=[], responsive=[];
socket.onmessage=event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}}else if(m.method==='Runtime.exceptionThrown')exceptions.push(m.params);};
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
const js=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const check=(label,value)=>{assert.ok(value,label);checks.push(label);};
const click=async selector=>{await js(`document.querySelector(${JSON.stringify(selector)}).click()`);await wait(320);};
const nav=async()=>{await call('Page.navigate',{url:'http://127.0.0.1:3130/'});await wait(500);await js(`document.fonts.ready`);};
const screenshot=async name=>{const r=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile('/tmp/sauz-brand-qa/'+name+'.png',Buffer.from(r.data,'base64'));};
const index=()=>js(`Array.from(document.querySelectorAll('.edition-slide')).findIndex(e=>e.classList.contains('is-active'))`);
await call('Page.enable');await call('Runtime.enable');

const styles=[];
await call('Emulation.setDeviceMetricsOverride',{width:1366,height:768,deviceScaleFactor:1,mobile:false});await nav();
check('Header negro y altura 82 px',await js(`getComputedStyle(document.querySelector('.bf-header')).backgroundColor==='rgb(5, 5, 5)'&&document.querySelector('.bf-header').getBoundingClientRect().height===82`));
check('Menú legible de 14 px',await js(`getComputedStyle(document.querySelector('.bf-desktop-nav button')).fontSize==='14px'`));
check('El emblema dorado no aparece en el header',await js(`!document.querySelector('.bf-header img[src="/Logo_principal.png"]')`));
const menu=await js(`(()=>{const r=document.querySelector('.bf-desktop-nav button:nth-child(3)').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
await call('Input.dispatchMouseEvent',{type:'mouseMoved',x:menu.x,y:menu.y});await wait(260);
let line=await js(`(()=>{const s=getComputedStyle(document.querySelector('.bf-desktop-nav button:nth-child(3)'),'::after');return {color:s.backgroundColor,height:s.height,transform:s.transform,duration:s.transitionDuration}})()`);styles.push({hoverLine:line});
check('Línea hover roja de 3 px y 220 ms',line.color==='rgb(255, 23, 36)'&&line.height==='3px'&&line.duration==='0.22s'&&line.transform==='matrix(1, 0, 0, 1, 0, 0)');
await call('Input.dispatchMouseEvent',{type:'mouseMoved',x:0,y:0});await wait(260);check('Línea se oculta al salir del enlace',await js(`getComputedStyle(document.querySelector('.bf-desktop-nav button:nth-child(3)'),'::after').transform==='matrix(0, 0, 0, 1, 0, 0)'`));
check('Línea de Inicio permanece activa',await js(`getComputedStyle(document.querySelector('.bf-desktop-nav [aria-current="page"]'),'::after').transform==='matrix(1, 0, 0, 1, 0, 0)'`));
await js(`document.querySelector('.bf-desktop-nav button:nth-child(3)').focus()`);await wait(260);check('Foco de teclado muestra la línea',await js(`getComputedStyle(document.querySelector('.bf-desktop-nav button:nth-child(3)'),'::after').transform==='matrix(1, 0, 0, 1, 0, 0)'`));
await js(`document.activeElement.blur()`);
const cta=await js(`(()=>{const b=document.querySelector('.edition-slide.is-active .edition-cta'),r=b.getBoundingClientRect(),s=getComputedStyle(b);return {x:r.x+r.width/2,y:r.y+r.height/2,height:r.height,radius:s.borderRadius,width:r.width}})()`);
check('CTA de 52 px y radio de 6 px sin ancho excesivo',cta.height===52&&cta.radius==='6px'&&cta.width<240);
await call('Input.dispatchMouseEvent',{type:'mouseMoved',x:cta.x,y:cta.y});await wait(260);check('Flecha se desplaza 4 px al hover',await js(`getComputedStyle(document.querySelector('.edition-slide.is-active .edition-cta svg')).transform==='matrix(1, 0, 0, 1, 4, 0)'`));
await click('.bf-desktop-nav button:nth-child(4)');check('Navegación activa marca Sneakers',await js(`document.querySelector('.bf-desktop-nav [aria-current="page"]').textContent==='Sneakers'`));
for(const [width,height]of [[1920,1080],[1366,768],[390,844],[375,812]]){
 await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<700});await nav();
 for(let i=0;i<3;i++){await click('.edition-indicators button:nth-child('+(i+1)+')');const m=await js(`(()=>{const strip=document.querySelector('.edition-slide.is-active .integrated-brand-strip').getBoundingClientRect(), footer=document.querySelector('.edition-carousel-footer').getBoundingClientRect();return {bottom:strip.bottom,footerTop:footer.top,stripWidth:strip.width,viewport:innerWidth}})()`);styles.push({width,slide:i+1,...m});check('Franja de marcas no invade controles '+width+' / '+i,m.bottom<=m.footerTop-4&&m.stripWidth<width);}
}
check('Sin excepciones JavaScript',exceptions.length===0);
await fs.writeFile('/tmp/sauz-brand-qa/styles.json',JSON.stringify({checks,styles,exceptions},null,2));console.log(JSON.stringify({passed:checks.length,exceptions}));socket.close();
