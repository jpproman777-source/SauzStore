import test from 'node:test';
import assert from 'node:assert/strict';
import { selectCollectionProducts } from '../src/utilidades/collections.js';

const products = [
  { id: 1, name: 'Camiseta uno', category: 'Camisetas', image: '/1.png', active: true, price: 80000, commercial: true, variants: [{ id: 'M', size: 'M', stock: 2 }] },
  { id: 2, name: 'Gorra dos', category: 'Gorras', image: '/2.png', active: true, price: null, commercial: false, variants: [] },
  { id: 3, name: 'Zapatilla tres', category: 'Zapatillas', image: '/3.png', active: false, price: 90000, commercial: true, variants: [{ id: '40', size: '40', stock: 1 }] },
  { id: 4, name: 'Camiseta cuatro', category: 'Camisetas', image: '/4.png', active: true, price: 85000, commercial: true, featured: true, variants: [{ id: 'M', size: 'M', stock: 1 }] },
];

test('El carrusel comercial usa solo productos activos, comprables y únicos', () => {
  const result = selectCollectionProducts([...products, products[0]], 'Todas', true);
  assert.deepEqual(result.map(product => product.id), [4, 1]);
});

test('La presentación editorial usa referencias reales y las pestañas filtran categorías', () => {
  assert.deepEqual(selectCollectionProducts(products, 'Todas').map(product => product.id), [4, 2, 1]);
  assert.deepEqual(selectCollectionProducts(products, 'Gorras').map(product => product.id), [2]);
  assert.deepEqual(selectCollectionProducts(products, 'Sneakers').map(product => product.id), []);
});
