const { spawn } = require('child_process');
const assert = require('node:assert/strict');

const port = 31987;
const server = spawn(process.execPath, ['backend/server.js'], {
  cwd: require('path').join(__dirname, '..'),
  env: { ...process.env, PORT: String(port), SAUZ_SERVE_SOURCE: '1' },
  stdio: 'ignore',
});

async function run() {
  const base = `http://127.0.0.1:${port}`;
  let response;
  for (let i = 0; i < 40; i++) {
    try {
      response = await fetch(`${base}/api/products`);
      break;
    } catch {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  assert.ok(response?.ok, 'El servidor no inició');
  const { products } = await response.json();
  assert.equal(products.length, 62);
  assert.ok(products.every(p => p.active && p.commercial === false));
  for (const product of products) {
    const image = await fetch(`${base}${product.image}`);
    assert.equal(image.status, 200, product.image);
    assert.match(image.headers.get('content-type'), /^image\//);
  }
  const add = await fetch(`${base}/api/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId: products[0].id, quantity: 1 }),
  });
  assert.equal(add.status, 409);
  const cart = await (await fetch(`${base}/api/cart`)).json();
  assert.equal(cart.cart.count, 0);
  console.log('API: 62 fichas públicas, 62 imágenes accesibles, compra pendiente bloqueada, carrito intacto.');
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => server.kill());
