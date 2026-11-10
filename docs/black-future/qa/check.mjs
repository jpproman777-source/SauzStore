import fs from 'node:fs/promises';
const targets=await (await fetch('http://127.0.0.1:9225/json')).json();
const target=await (await fetch('http://127.0.0.1:9225/json/new?about:blank',{method:'PUT'})).json();
const socket=new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r=>socket.addEventListener('open',r,{once:true}));
let seq=0; const waiting=new Map(); const exceptions=[];
socket.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=waiting.get(m.id);if(p){waiting.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}}else if(m.method==='Runtime.exceptionThrown')exceptions.push(m.params);};
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;waiting.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
const js=async(expression)=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const nav=async path=>{await call('Page.navigate',{url:'http://127.0.0.1:3100'+path});await delay(500);await js(`document.querySelectorAll('img').forEach(i=>i.loading='eager'); Promise.all(Array.from(document.images).map(i=>i.complete?Promise.resolve():new Promise(r=>{i.onload=r;i.onerror=r;setTimeout(r,1500)})))`);};
await call('Runtime.enable');await call('Page.enable');
const sizes=[[1920,1080],[1440,900],[1366,768],[1024,768],[768,1024],[390,844],[375,812]];
const results=[];
for(const [width,height]of sizes){await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<540});for(const path of ['/','/catalogo','/producto/1','/nosotros','/ubicacion','/admin/login']){await nav(path);const result=await js(`({width:innerWidth,scroll:document.documentElement.scrollWidth,bodyBg:getComputedStyle(document.body).backgroundColor,broken:Array.from(document.images).filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src),heroBottom:document.querySelector('.bf-hero')?.getBoundingClientRect().bottom,overflow:Array.from(document.querySelectorAll('body *')).filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+2||r.left< -2)&&getComputedStyle(e).position!=='fixed'&&!e.closest('.bf-hero-art')}).slice(0,8).map(e=>({tag:e.tagName,cls:e.className,right:e.getBoundingClientRect().right}))})`);results.push({width,height,path,...result});if((width===1440||width===390)&&['/','/catalogo','/producto/1','/admin/login'].includes(path)){const shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(`/tmp/sauz-qa/${path==='/'?'home':path.replaceAll('/','-')}-${width}.png`,Buffer.from(shot.data,'base64'));}}}
await fs.writeFile('/tmp/sauz-qa/responsive.json',JSON.stringify({results,exceptions},null,2));console.log(JSON.stringify({pages:results.length,overflow:results.filter(x=>x.scroll>x.width),broken:results.filter(x=>x.broken.length),hero:results.filter(x=>x.path==='/').map(x=>({width:x.width,height:x.height,bottom:x.heroBottom})),exceptions},null,2));
socket.close();
