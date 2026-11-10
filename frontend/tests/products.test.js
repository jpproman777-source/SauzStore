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
  assert.ok(products.every(isCommercial));
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
