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
await call('Page.enable');await call('Runtime.enable');await call('Page.bringToFront');
for(const [width,height] of [[1920,1080],[1440,900],[1366,768],[1024,768],[768,1024],[390,844],[375,812]]){
 await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<700});await nav();
 for(let i=0;i<3;i++){
  await click(`.edition-indicators button:nth-child(${i+1})`);
  await js(`Promise.race([document.querySelector('.edition-slide.is-active img').decode(), new Promise((_,reject)=>setTimeout(()=>reject(new Error('Image decode timeout')),10000))])`);
  const measurements=await js(`(()=>{const hero=document.querySelector('.edition-hero').getBoundingClientRect(), categories=document.querySelector('.edition-category-grid').getBoundingClientRect(), title=document.querySelector('.edition-slide.is-active h1').getBoundingClientRect();return {viewport:innerWidth,height:innerHeight,scroll:document.documentElement.scrollWidth,heroBottom:hero.bottom,categoryTop:categories.top,titleRight:title.right,broken:Array.from(document.images).filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src),source:document.querySelector('.edition-slide.is-active img').currentSrc}})()`);
  responsive.push({width,height,slide:i+1,...measurements});
  check(`Sin scroll horizontal ${width} slide ${i+1}`,measurements.scroll<=width);
  check(`Hero y header ocupan el viewport ${width} slide ${i+1}`,Math.abs(measurements.heroBottom-height)<=1);
  check(`Categorías fuera del primer viewport ${width} slide ${i+1}`,measurements.categoryTop>=height);
  check(`Imagen cargada ${width} slide ${i+1}`,measurements.broken.length===0);
  if([1920,1366,390].includes(width))await screenshot(`slide-${i+1}-${width}`);
 }
 if([1366,390].includes(width)){await js(`document.querySelector('#categorias').scrollIntoView()`);await wait(250);await screenshot('categorias-'+width);}
}
await call('Emulation.setDeviceMetricsOverride',{width:1366,height:768,deviceScaleFactor:1,mobile:false});await nav();await call('Input.dispatchMouseEvent',{type:'mouseMoved',x:0,y:0});
check('Slide inicial Jordan',await index()===0);await wait(6200);check('Autoplay cambia a los seis segundos',await index()===1);
await click('[aria-label="Diapositiva siguiente"]');check('Flecha siguiente',await index()===2);await wait(6200);check('Interacción pausa el autoplay',await index()===2);
await click('[aria-label="Diapositiva anterior"]');check('Flecha anterior',await index()===1);
await click('.edition-indicators button:nth-child(1)');check('Indicador selecciona slide',await index()===0);
await js(`document.querySelector('.edition-hero').focus()`);await call('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});await call('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});await wait(320);check('Navegación con teclado',await index()===1);
await click('[aria-label="Reanudar carrusel"]');await js(`document.activeElement.blur()`);await wait(6200);check('Reanudar devuelve autoplay',await index()===2);
await click('.edition-indicators button:nth-child(1)');await click('.edition-slide.is-active .edition-cta');check('Jordan abre su selección real',await js(`location.pathname==='/catalogo'&&document.querySelectorAll('.bf-product').length===2&&document.querySelector('.bf-catalog-search input').value==='Jordan'`));
await nav();await click('.edition-indicators button:nth-child(2)');await click('.edition-slide.is-active .edition-cta');check('Camisetas filtra productos reales',await js(`document.querySelectorAll('.bf-product').length===6`));
await nav();await click('.edition-indicators button:nth-child(3)');await click('.edition-slide.is-active .edition-cta');check('Gorras abre estado vacío sin inventario inventado',await js(`location.pathname==='/catalogo'&&document.querySelectorAll('.bf-product').length===0&&!!document.querySelector('.bf-empty')`));
await nav();await click('.edition-category-card:nth-child(3)');check('Tarjeta sneakers abre su categoría vacía',await js(`location.pathname==='/catalogo'&&document.querySelectorAll('.bf-product').length===0&&document.querySelector('[aria-pressed=true]').textContent==='Sneakers'`));
await nav();await click('.bf-desktop-nav button:nth-child(3)');check('Ropa muestra las prendas disponibles',await js(`document.querySelectorAll('.bf-product').length===12`));
await click('.edition-favorite-toggle');await click('[aria-label^="Favoritos,"]');check('Favoritos abre producto guardado',await js(`document.querySelectorAll('.edition-favorites .bf-product').length===1`));await screenshot('favoritos-1366');await click('[aria-label="Cerrar favoritos"]');await call('Page.reload');await wait(500);await click('[aria-label^="Favoritos,"]');check('Favoritos persisten al recargar',await js(`document.querySelectorAll('.edition-favorites .bf-product').length===1`));await click('.edition-favorites .edition-favorite-toggle');check('Quitar favorito actualiza estado vacío',await js(`!!document.querySelector('.edition-favorites-empty')`));
await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await call('Emulation.setTouchEmulationEnabled',{enabled:true});await nav();
await call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:320,y:220}]});await call('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:210,y:220}]});await call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await wait(350);check('Deslizamiento táctil cambia slide',await index()===1);
await click('[aria-label="Abrir menú"]');check('Menú móvil incluye las seis secciones',await js(`document.querySelectorAll('.bf-menu-link').length===6`));await screenshot('menu-390');await click('[aria-label="Cerrar menú"]');
await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await nav();check('Movimiento reducido desactiva autoplay',await js(`document.querySelector('.edition-play').disabled`));check('Movimiento reducido sin transición',await js(`getComputedStyle(document.querySelector('.edition-slide')).transitionDuration==='0s'`));await wait(6200);check('Movimiento reducido mantiene slide',await index()===0);
check('Fuente pesada cargada localmente',await js(`document.fonts.check('900 64px "SAUZ Archivo Black"')`));
for(const file of ['01-jordan-original.png','02-camisetas.png','03-gorras-nike-jordan-adidas.png','01-jordan-original-1920.webp','02-camisetas-1774.webp','03-gorras-nike-jordan-adidas-1774.webp']){const response=await fetch('http://127.0.0.1:3140/SAUZ_CARRUSEL_3_IMAGENES/'+file);check('Recurso de build responde HTTP 200: '+file,response.status===200);}
check('Sin excepciones JavaScript',exceptions.length===0);
await fs.writeFile('/tmp/sauz-premium-qa/results.json',JSON.stringify({checks,responsive,exceptions},null,2));console.log(JSON.stringify({passed:checks.length,responsiveViews:responsive.length,exceptions},null,2));socket.close();
