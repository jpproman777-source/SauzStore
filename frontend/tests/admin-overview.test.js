import test from 'node:test';
import assert from 'node:assert/strict';
import { filterOrdersByPeriod, overviewSeries, summarizeCategories, summarizeInventory } from '../src/lib/adminOverview.js';
const now = new Date(2026,10,11,16);
const order = (day,total,status='Pendiente') => ({timestamp:+new Date(2026,10,day,10),total,orderStatus:status,items:[{quantity:2}]});
test('calendar chart includes every day, omits cancelled/future/undated orders and accumulates exactly',()=>{
 const series=overviewSeries([order(1,50),order(3,100),order(10,200),order(11,10,'Cancelado'),order(12,900),{total:999}], 'month',now);
 assert.equal(series.length,11);
 assert.equal(series.at(-1).revenue_accum,350);
 assert.equal(series.reduce((sum,p)=>sum+p.orders,0),3);
 assert.equal(series.reduce((sum,p)=>sum+p.units,0),6);
 assert.match(series[0].fullDate,/noviembre/);
});
test('last seven/thirty days include today and today has hourly buckets',()=>{
 const orders=[order(4,100),order(5,200),order(11,300)];
 assert.equal(overviewSeries(orders,'7days',now).at(-1).revenue_accum,500);
 assert.equal(overviewSeries(orders,'30days',now).length,30);
 assert.equal(overviewSeries(orders,'today',now).at(-1).revenue_accum,300);
 assert.equal(overviewSeries([],'month',now).at(-1).revenue_accum,0);
});
test('calendar filters include complete selected months and years and share accurate totals',()=>{
 const orders=[order(1,50),order(10,200),{...order(1,400),timestamp:+new Date(2026,9,1,10)}];
 const november=overviewSeries(orders,'today',now,{year:2026,month:'10'});
 assert.equal(november.length,30);
 assert.equal(november.at(-1).revenue_accum,250);
 const year=overviewSeries(orders,'30days',now,{year:2026,month:'all'});
 assert.equal(year.length,365);
 assert.equal(year.at(-1).revenue_accum,650);
 assert.equal(overviewSeries(orders,'month',now,{year:2025,month:'all'}).at(-1).revenue_accum,0);
});
test('period filter and category summary cover all catalog categories accurately',()=>{
 const orders=[order(1,50),{...order(11,300),items:[{productId:2,price:150,quantity:2}]},order(12,900)];
 assert.equal(filterOrdersByPeriod(orders,'today',now).length,1);
 assert.equal(filterOrdersByPeriod(orders,'month',now).length,2);
 const summary=summarizeCategories([{id:1,category:'Camisetas',stock:4},{id:2,category:'Zapatillas',stock:7}],orders.slice(0,2));
 assert.deepEqual(summary.map(c=>c.category),['Zapatillas','Camisetas']);
 assert.equal(summary[0].revenue,300);
 assert.equal(summary[1].stockUnits,4);
});
test('inventory summary groups variants per product and prioritizes out-of-stock and low sizes',()=>{
 const inv=summarizeInventory([
  {id:1,name:'Camiseta A',stock:20,variants:[{id:'s',size:'S',stock:10},{id:'m',size:'M',stock:10}]},
  {id:2,name:'Sudadera B',stock:16,variants:[{id:'s',size:'S',stock:4},{id:'m',size:'M',stock:12}]},
  {id:3,name:'Gorra C',stock:3,variants:[{id:'u',size:'Única',stock:0},{id:'l',size:'L',stock:3}]}
 ],5);
 assert.equal(inv.totalUnits,39);
 assert.equal(inv.productCount,3);
 assert.equal(inv.outVariantCount,1);
 assert.equal(inv.lowVariantCount,2);
 assert.equal(inv.outProductCount,1);
 assert.equal(inv.lowProductCount,1);
 assert.equal(inv.healthyProductCount,1);
 assert.deepEqual(inv.rows.map(r=>r.product.id),[3,2,1]);
 assert.equal(inv.rows[0].suggestedVariant.id,'u');
 assert.equal(inv.rows[1].suggestedVariant.id,'s');
});
