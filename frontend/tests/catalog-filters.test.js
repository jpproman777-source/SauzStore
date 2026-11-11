import test from 'node:test';
import assert from 'node:assert/strict';
import { filterCatalog } from '../src/utilidades/catalogFilters.js';

const products = [
  { id: 1, name: 'Camiseta Nike negra', brand: 'Nike', category: 'Camisetas', price: 80000, active: true, commercial: true, variants: [{ id: 'M', size: 'M', stock: 2 }] },
  { id: 2, name: 'Camiseta Nike blanca', brand: 'Nike', category: 'Camisetas', price: null, active: true, commercial: false, variants: [] },
  { id: 3, name: 'Gorra New Era azul', brand: 'New Era', category: 'Gorras', price: 90000, active: true, commercial: true, variants: [{ id: 'U', size: 'Única', stock: 1 }] },
  { id: 4, name: 'Camiseta Nike roja', brand: 'Nike', category: 'Camisetas', price: 75000, active: true, commercial: true, variants: [{ id: 'M', size: 'M', stock: 0 }] },
  { id: 5, name: 'Camiseta Nike pendiente', brand: 'Nike', category: 'Camisetas', price: 70000, active: true, commercial: false, variants: [] },
];

test('Los filtros de marca, categoría, talla, precio, disponibilidad y búsqueda se combinan', () => {
  const result = filterCatalog(products, { brand: 'Nike', category: 'Camisetas', size: 'M', min: '78000', max: '85000', status: 'Disponibles', query: 'negra' });
  assert.deepEqual(result.map(product => product.id), [1]);
  assert.deepEqual(filterCatalog(products, { status: 'Próximamente' }).map(product => product.id), [2, 5]);
  assert.deepEqual(filterCatalog(products, { category: 'Gorras', size: 'Única' }).map(product => product.id), [3]);
});

test('El rango de precio excluye referencias sin precio y el ordenamiento usa precios reales', () => {
  assert.deepEqual(filterCatalog(products, { min: '76000', sort: 'precio-asc' }).map(product => product.id), [1, 3]);
});
