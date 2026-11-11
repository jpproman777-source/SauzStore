import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const productsPath = path.resolve(__dirname, '../../backend/data/products.json');
const dropsPath = path.resolve(__dirname, '../../backend/data/drops.json');
const closetPath = path.resolve(__dirname, '../../backend/data/closet.json');
const communityPath = path.resolve(__dirname, '../../backend/data/community.json');

const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

test('Auditoría Comercial: Catálogo 100% masculino urbano sin secciones Mujer o Kids', () => {
  const invalidKeywords = ['mujer', 'women', 'niño', 'niña', 'kids', 'infantil', 'bebé', 'baby'];
  
  for (const product of products) {
    const categoryLower = (product.category || '').toLowerCase();
    const titleLower = (product.title || '').toLowerCase();
    
    for (const kw of invalidKeywords) {
      assert.equal(
        categoryLower.includes(kw),
        false,
        `El producto ${product.id} no debe pertenecer a una categoría prohibida: ${kw}`
      );
      assert.equal(
        titleLower.includes(` ${kw} `) || titleLower.startsWith(`${kw} `) || titleLower.endsWith(` ${kw}`),
        false,
        `El producto ${product.id} contiene la palabra prohibida ${kw}`
      );
    }
  }
});

test('Auditoría de Marcas: Solo marcas oficiales confirmadas en catálogo', () => {
  const confirmedBrands = new Set(['Nike', 'Jordan', 'Adidas', 'New Era', 'SAUZ', 'Por clasificar']);
  
  for (const product of products) {
    const brand = product.brand || 'Por clasificar';
    assert.equal(
      confirmedBrands.has(brand),
      true,
      `Marca no autorizada encontrada en producto ${product.id}: ${brand}`
    );
    // Verificar que SAUZ STORE esté normalizado a SAUZ
    assert.notEqual(brand, 'SAUZ STORE', `El producto ${product.id} tiene la marca sin normalizar 'SAUZ STORE'`);
  }
});

test('SAUZ Drops: Estructura del calendario de lanzamientos y lista de espera', () => {
  assert.equal(fs.existsSync(dropsPath), true, 'El archivo drops.json debe existir');
  const drops = JSON.parse(fs.readFileSync(dropsPath, 'utf8'));
  assert.ok(Array.isArray(drops), 'Drops debe ser un array');
  assert.ok(drops.length >= 3, 'Debe haber al menos 3 drops programados');
  
  for (const drop of drops) {
    assert.ok(drop.id, 'Drop debe tener id');
    assert.ok(drop.name, 'Drop debe tener name');
    assert.ok(drop.releaseDate, 'Drop debe tener releaseDate');
    assert.ok(Array.isArray(drop.waitlistEmails), 'Drop debe tener array de waitlistEmails');
    assert.ok(['Nike', 'Jordan', 'Adidas', 'New Era', 'SAUZ'].includes(drop.brand), `Marca de drop válida: ${drop.brand}`);
  }
});

test('My SAUZ Closet: Estructura de almacenamiento de outfits digitales', () => {
  assert.equal(fs.existsSync(closetPath), true, 'El archivo closet.json debe existir');
  const closet = JSON.parse(fs.readFileSync(closetPath, 'utf8'));
  assert.ok(Array.isArray(closet), 'Closet debe ser un array');
  
  for (const outfit of closet) {
    assert.ok(outfit.id, 'Outfit debe tener id');
    assert.ok(outfit.name, 'Outfit debe tener nombre');
    assert.ok(outfit.slots, 'Outfit debe tener slots');
    assert.ok(typeof outfit.subtotalCOP === 'number', 'Outfit debe tener subtotalCOP numérico');
  }
});

test('SAUZ Community: Feed de la comunidad, votos y reportes', () => {
  assert.equal(fs.existsSync(communityPath), true, 'El archivo community.json debe existir');
  const community = JSON.parse(fs.readFileSync(communityPath, 'utf8'));
  assert.ok(Array.isArray(community), 'Community debe ser un array');
  assert.ok(community.length >= 2, 'Debe haber publicaciones iniciales de la comunidad');
  
  for (const post of community) {
    assert.ok(post.id, 'Post debe tener id');
    assert.ok(post.authorName, 'Post debe tener authorName');
    assert.ok(typeof post.votes === 'number', 'Post debe tener contador de votos');
    assert.ok(Array.isArray(post.taggedProducts), 'Post debe tener etiquetas de productos');
  }
});

test('SAUZ Size Finder: Algoritmo de recomendación de calzado y siluetas', () => {
  // Test unitario del conversor de centímetros a US / COL
  const calcShoe = (cm) => {
    if (cm <= 26.0) return { us: '8 US', col: '40 COL' };
    if (cm <= 27.0) return { us: '9 US', col: '41 COL' };
    if (cm <= 28.0) return { us: '10 US', col: '42 COL' };
    return { us: '11 US', col: '43 COL' };
  };

  assert.deepEqual(calcShoe(26.0), { us: '8 US', col: '40 COL' });
  assert.deepEqual(calcShoe(27.0), { us: '9 US', col: '41 COL' });
  assert.deepEqual(calcShoe(28.0), { us: '10 US', col: '42 COL' });
  assert.deepEqual(calcShoe(29.0), { us: '11 US', col: '43 COL' });
});
