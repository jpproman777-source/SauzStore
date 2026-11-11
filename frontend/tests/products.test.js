import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { isCommercial, canBuy, productPath } from "../src/lib/products.js";
const products = JSON.parse(
  await readFile(
    new URL("../../backend/data/products.json", import.meta.url),
    "utf8",
  ),
);
test("El catálogo comercial conserva IDs únicos y precios existentes", () => {
  assert.equal(
    new Set(products.map((product) => product.id)).size,
    products.length,
  );
  assert.equal(products.filter(product => product.active === false).length, 12);
  assert.equal(products.filter(product => product.active !== false).length, 64);
  assert.ok(products.filter(product => product.active !== false).every(product => isCommercial(product) && canBuy(product)));
});
test("Una referencia de demostración nunca queda habilitada para compra", () => {
  for (const product of products) {
    assert.equal(canBuy({ ...product, demo: true }), false);
    assert.equal(canBuy({ ...product, commercial: false }), false);
  }
});
test("Un producto agotado o sin disponibilidad confirmada no se puede comprar", () => {
  assert.equal(canBuy({ ...products[0], stock: 0 }), false);
  assert.equal(canBuy({ ...products[0], stock: undefined }), false);
});
test("La ausencia de precio comercial impide habilitar una compra", () => {
  assert.equal(canBuy({ ...products[0], price: undefined }), false);
  assert.equal(canBuy({ ...products[0], price: NaN }), false);
  assert.equal(canBuy(null), false);
});
test("Cada ficha conserva su identificador en una URL propia", () => {
  for (const product of products)
    assert.equal(
      decodeURIComponent(productPath(product.id).split("/")[2]),
      String(product.id),
    );
});
test("La compra exige precio y stock de una variante confirmada", () => {
  const product = { id: 999, active: true, commercial: true, price: 95000,
    variants: [{ id: "M", size: "M", stock: 0 }, { id: "L", size: "L", stock: 2 }] };
  assert.equal(isCommercial(product), true);
  assert.equal(canBuy(product), true);
  assert.equal(canBuy({ ...product, variants: [{ id: "M", size: "M", stock: 0 }] }), false);
  assert.equal(canBuy({ ...product, variants: [] }), false);
});

test("Los modelos Nike y Adidas distintos tienen fichas y fotografías independientes", () => {
  for (const [first, second] of [['013', '018'], ['023', '032']]) {
    const a = products.find(p => p.sku === `SAUZ-NEW-${first}`);
    const b = products.find(p => p.sku === `SAUZ-NEW-${second}`);
    assert.ok(a && b && a.active && b.active);
    assert.notEqual(a.id, b.id);
    assert.equal(a.image, `/Productos/sauz-${first}.png`);
    assert.equal(b.image, `/Productos/sauz-${second}.png`);
    assert.ok(!a.alternateImages.includes(b.image));
    assert.ok(!b.alternateImages.includes(a.image));
    assert.ok(Number.isInteger(b.price) && b.price > 0);
    assert.equal(canBuy(b), true);
  }
});

test("Los precios están en COP y el stock coincide con las variantes", () => {
  for (const product of products.filter(p => p.active !== false)) {
    assert.equal(product.currency, 'COP');
    assert.ok(Number.isInteger(product.price) && product.price > 0);
    assert.equal(product.stock, product.variants.reduce((sum, v) => sum + v.stock, 0));
    assert.equal(new Set(product.variants.map(v => v.id)).size, product.variants.length);
    assert.ok(product.variants.every(v => v.size && Number.isInteger(v.stock) && v.stock > 0));
    assert.equal(product.configurationStatus, null);
  }
});
