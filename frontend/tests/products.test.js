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
  assert.equal(products.filter(product => product.active !== false).length, 62);
  assert.ok(products.filter(product => product.active !== false).every(product => !isCommercial(product)));
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
