const { spawn } = require('node:child_process');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
(async () => {
  const data = await fs.mkdtemp(path.join(os.tmpdir(), 'sauz-account-'));
  let server;
  try {
    const users = [{id:1,name:'Cuenta de prueba',email:'account@example.com',password:'test-only',role:'cliente',documentNumber:'123456789',addresses:[{id:'addr-test',recipient:'Prueba',city:'Medellín',address:'Dirección de prueba',isDefault:true}]},{id:2,name:'Segunda cuenta',email:'second@example.com',password:'test-only',role:'cliente',addresses:[]}];
    users.push({id:3,name:'Operador de prueba',email:'admin-test@example.com',password:'test-only',role:'admin'});
    await fs.writeFile(path.join(data,'users.json'),JSON.stringify(users));
    await fs.writeFile(path.join(data,'orders.json'),JSON.stringify([{orderId:'test-order',customer:{email:'account@example.com'},items:[],total:10000},{orderId:'other-order',customer:{email:'second@example.com'},items:[],total:20000}]));
    await fs.writeFile(path.join(data,'products.json'),'[]');
    server=spawn(process.execPath,['backend/server.js'],{env:{...process.env,PORT:'31989',SAUZ_DATA_DIR:data},stdio:'ignore'});
    const base='http://127.0.0.1:31989';
    for(let i=0;i<50;i++) { try { if((await fetch(base+'/api/products')).ok) break; }catch{} await new Promise(r=>setTimeout(r,100)); }
    let adminToken='';
    const request=async(url,body,method='PUT') => {
      const res=await fetch(base+url,{method,headers:{'Content-Type':'application/json',...(adminToken?{Authorization:`Bearer ${adminToken}`}:{})},body:body===undefined?undefined:JSON.stringify(body)});
      return {status:res.status,data:await res.json()};
    };
    let result=await request('/api/users/profile',{email:'account@example.com',newEmail:'changed@example.com',name:'Nombre editado',phone:'3000000000',city:'Bogotá',address:'Nueva dirección',documentNumber:'CHANGED',role:'admin'});
    assert.equal(result.status,200);assert.equal(result.data.user.email,'changed@example.com');assert.equal(result.data.user.documentNumber,'123456789');assert.equal(result.data.user.role,'cliente');
    const orders=await (await fetch(base+'/api/orders?email=changed%40example.com')).json();assert.deepEqual(orders.orders.map(o=>o.orderId),['test-order']);
    result=await request('/api/users/addresses/addr-test',{userId:1,recipient:'Nombre editado',city:'Bogotá',address:'Dirección editada',documentNumber:'CHANGED'});
    assert.equal(result.status,200);assert.equal(result.data.address.address,'Dirección editada');assert.equal(result.data.address.documentNumber,undefined);
    result=await request('/api/users/addresses/addr-test',{userId:2,address:'No debe cambiar'});assert.equal(result.status,404);
    result=await request('/api/users/addresses/addr-test',{userId:1,city:''});assert.equal(result.status,400);
    const registered=await request('/api/auth/register',{name:'Nueva cuenta',email:'account@example.com',password:'test-only'},'POST');
    assert.equal(registered.status,201);
    const reused=await (await fetch(base+'/api/orders?email=account%40example.com')).json();assert.equal(reused.orders.length,0);
    result=await request('/api/orders/test-order',{orderStatus:'Aceptado'},'PATCH');assert.equal(result.status,401);
    const clientSession=await request('/api/auth/login',{email:'changed@example.com',password:'test-only'},'POST');
    adminToken=clientSession.data.user.token;
    result=await request('/api/orders/test-order',{orderStatus:'Aceptado'},'PATCH');assert.equal(result.status,403);
    const adminSession=await request('/api/auth/login',{email:'admin-test@example.com',password:'test-only'},'POST');
    adminToken=adminSession.data.user.token;
    result=await request('/api/orders/test-order',{orderStatus:'Aceptado',note:'Aceptado para preparación'},'PATCH');
    assert.equal(result.status,200);assert.equal(result.data.order.orderStatus,'Aceptado');
    assert.equal(result.data.order.trackingHistory.at(-1).status,'Aceptado');
    result=await request('/api/orders/test-order',{shippingTracking:{carrier:'Transportadora de prueba',trackingNumber:'000012345',trackingUrl:'https://example.com/track/000012345'}},'PATCH');
    assert.equal(result.status,200);assert.equal(result.data.order.shippingTracking.trackingNumber,'000012345');assert.equal(result.data.order.orderStatus,'Aceptado');
    for(const badUrl of ['javascript:alert(1)','http://example.com/track','https://user:password@example.com/']) {
      result=await request('/api/orders/test-order',{orderStatus:'Enviado',shippingTracking:{carrier:'Test',trackingNumber:'999',trackingUrl:badUrl}},'PATCH');assert.equal(result.status,400);
    }
    result=await request('/api/orders/test-order',{orderStatus:'estado-inventado'},'PATCH');assert.equal(result.status,400);
    result=await request('/api/orders/test-order',{shippingTracking:{carrier:'Test'}},'PATCH');assert.equal(result.status,400);
    const savedOrders=JSON.parse(await fs.readFile(path.join(data,'orders.json'),'utf8'));const saved=savedOrders.find(o=>o.orderId==='test-order');
    assert.equal(saved.orderStatus,'Aceptado');assert.equal(saved.shippingTracking.trackingNumber,'000012345');
    result=await request('/api/orders/test-order',{orderStatus:'Enviado'},'PATCH');assert.equal(result.status,200);assert.equal(result.data.order.shippingTracking.trackingNumber,'000012345');
    result=await request('/api/auth/logout',{},'POST');assert.equal(result.status,200);
    result=await request('/api/orders/test-order',{orderStatus:'Entregado'},'PATCH');assert.equal(result.status,401);
    console.log('PASS: profile fields, read-only identity/role, order history after email change, address edit, status transitions, persisted guide, admin-only updates and unsafe URL rejection; isolated temporary data only.');
  } finally { if(server){server.kill();await new Promise(resolve=>server.once('exit',resolve));}await fs.rm(data,{recursive:true,force:true}); }
})().catch(error=>{console.error(error);process.exitCode=1;});
