const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sauz-variants-'));
const fixture = [
  { id: 1, name: 'Pieza de prueba', category: 'Camisetas', image: '/Productos/sauz-001.png', price: 80000, active: true, commercial: true, stock: 3,
    variants: [{ id: 'size-M', size: 'M', stock: 2 }, { id: 'size-L', size: 'L', stock: 1 }] },
  { id: 2, name: 'Pendiente', category: 'Gorras', image: '/Productos/sauz-030.png', price: null, active: true, commercial: false, variants: [] },
];
fs.writeFileSync(path.join(dataDir, 'products.json'), JSON.stringify(fixture));
fs.writeFileSync(path.join(dataDir, 'orders.json'), '[]');
fs.writeFileSync(path.join(dataDir, 'users.json'), '[]');
const port = 31988;
const server = spawn(process.execPath, ['backend/server.js'], {
  cwd: path.join(__dirname, '..'),
  env: { ...process.env, PORT: String(port), SAUZ_DATA_DIR: dataDir },
  stdio: 'ignore',
});
const base = `http://127.0.0.1:${port}`;
async function request(url, method = 'GET', body) {
  const response = await fetch(base + url, {
    method, headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: response.status, body: await response.json() };
}
async function run() {
  for (let i = 0; i < 40; i++) {
    try { await request('/api/products'); break; }
    catch { await new Promise(resolve => setTimeout(resolve, 100)); }
  }
  assert.equal((await request('/api/products')).body.products.length, 2);
  assert.equal((await request('/api/cart/items', 'POST', { productId: 2, variantId: 'size-M' })).status, 409);
  assert.equal((await request('/api/cart/items', 'POST', { productId: 1, variantId: 'unknown' })).status, 409);
  assert.equal((await request('/api/cart/items', 'POST', { productId: 1, variantId: 'size-M', quantity: 2 })).status, 200);
  assert.equal((await request('/api/cart/items', 'POST', { productId: 1, variantId: 'size-M', quantity: 1 })).status, 400);
  assert.equal((await request('/api/cart/items', 'POST', { productId: 1, variantId: 'size-L', quantity: 1 })).status, 200);
  let cart = (await request('/api/cart')).body.cart;
  assert.deepEqual(cart.items.map(item => item.size), ['M', 'L']);
  assert.equal(cart.count, 3);
  assert.equal((await request('/api/cart/items/1?variantId=size-M', 'PATCH', { quantity: 1 })).status, 200);
  cart = (await request('/api/cart')).body.cart;
  assert.equal(cart.count, 2);
  const checkout = await request('/api/checkout', 'POST', { customer: { name: 'Prueba', email: 'prueba@example.com' }, payment: { method: 'cash' } });
  assert.equal(checkout.status, 200);
  assert.deepEqual(checkout.body.order.items.map(item => item.size), ['M', 'L']);
  const saved = JSON.parse(fs.readFileSync(path.join(dataDir, 'products.json'), 'utf8'));
  assert.deepEqual(saved[0].variants.map(variant => variant.stock), [1, 0]);
  const configured = await request('/api/products/2', 'PUT', { price: 45000, variants: [{ id: 'ajustable', size: 'Ajustable', stock: 0 }] });
  assert.equal(configured.status, 200);
  assert.equal(configured.body.product.commercial, true);
  assert.equal((await request('/api/cart/items', 'POST', { productId: 2, variantId: 'ajustable' })).status, 409);
  assert.equal((await request('/api/products/restock', 'POST', { productId: 2, variantId: 'ajustable', amount: 2 })).status, 200);
  assert.equal((await request('/api/cart/items', 'POST', { productId: 2, variantId: 'ajustable' })).status, 200);
  console.log('Variantes: selección, límites de stock, dos líneas de carrito y checkout verificados.');
}
run().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  server.kill();
  await new Promise(resolve => server.once('exit', resolve));
  for (const file of ['products.json', 'orders.json', 'users.json']) fs.unlinkSync(path.join(dataDir, file));
  fs.rmdirSync(dataDir);
});
