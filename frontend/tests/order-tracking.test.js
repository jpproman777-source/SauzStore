import test from 'node:test';
import assert from 'node:assert/strict';
import { orderStage, safeTrackingUrl } from '../src/utilidades/orderTracking.js';
test('progress represents actual operational states without accepting pending orders',()=>{
  assert.equal(orderStage('Pendiente'),0);
  assert.equal(orderStage('Aceptado'),1);
  assert.equal(orderStage('En proceso'),2);
  assert.equal(orderStage('Enviado'),3);
  assert.equal(orderStage('En camino'),3);
  assert.equal(orderStage('Entregado'),4);
  assert.equal(orderStage('Cancelado'),-1);
  assert.equal(orderStage('desconocido'),-1);
});
test('tracking links accept only absolute HTTPS URLs without credentials',()=>{
  assert.equal(safeTrackingUrl('https://example.com/track?code=012345'),'https://example.com/track?code=012345');
  for(const url of ['',undefined,'javascript:alert(1)','data:text/html,test','http://example.com/track','/track','https://user:password@example.com/'])assert.equal(safeTrackingUrl(url),null);
});
