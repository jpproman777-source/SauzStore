import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Navbar Definitivo: Validación de 6 elementos principales y exclusión de Hombre, Mujer, Kids, SAUZ Experience', () => {
  const headerContent = fs.readFileSync(path.resolve(__dirname, '../src/componentes/BarraNavegacion/Header.jsx'), 'utf8');

  // Verificar los 6 elementos oficiales en la navegación de escritorio
  const expectedItems = ['Inicio', 'Marcas', 'Ropa', 'Sneakers', 'Accesorios', 'Colecciones'];
  for (const item of expectedItems) {
    assert.ok(headerContent.includes(`>${item}<`), `El Navbar debe contener el botón '${item}'`);
  }

  // Verificar que Hombre y SAUZ Experience hayan sido retirados de los botones de navegación
  assert.equal(
    headerContent.includes('>Hombre<'),
    false,
    "El botón 'Hombre' debe haber sido retirado de la barra principal"
  );
  assert.equal(
    headerContent.includes('>SAUZ Experience<'),
    false,
    "El botón 'SAUZ Experience' debe haber sido retirado de la barra principal"
  );
  assert.equal(
    headerContent.includes('>Mujer<'),
    false,
    "No debe existir botón 'Mujer'"
  );
  assert.equal(
    headerContent.includes('>Kids<'),
    false,
    "No debe existir botón 'Kids'"
  );
});

test('Mega Menú: Ausencia de banners promocionales laterales que rompan la composición', () => {
  const headerContent = fs.readFileSync(path.resolve(__dirname, '../src/componentes/BarraNavegacion/Header.jsx'), 'utf8');
  
  // No deben existir tarjetas promocionales laterales en el mega menú
  assert.equal(
    headerContent.includes('mega-editorial-banner'),
    false,
    'Las tarjetas laterales mega-editorial-banner deben estar eliminadas'
  );
  assert.equal(
    headerContent.includes('mega-exp-banner'),
    false,
    'Las tarjetas laterales mega-exp-banner deben estar eliminadas'
  );
});

test('ProductCard: Visualización de Marca, Nombre, Categoría y Precio COP con jerarquía', () => {
  const cardContent = fs.readFileSync(path.resolve(__dirname, '../src/componentes/TarjetaProducto/ProductCard.jsx'), 'utf8');

  assert.ok(cardContent.includes('premium-card-brand'), 'ProductCard debe incluir el contenedor de marca');
  assert.ok(cardContent.includes('brandOf(product)'), 'ProductCard debe resolver la marca mediante brandOf');
  assert.ok(cardContent.includes('premium-card-name'), 'ProductCard debe incluir el nombre del producto');
  assert.ok(cardContent.includes('premium-card-category'), 'ProductCard debe incluir la categoría');
  assert.ok(cardContent.includes('premium-card-price'), 'ProductCard debe incluir el precio');
  assert.ok(cardContent.includes('premium-card-status'), 'ProductCard debe incluir el estado comercial');
});

test('Capa de Servicios Frontend: Módulos de servicios disponibles', () => {
  const servicesDir = path.resolve(__dirname, '../src/servicios');
  assert.ok(fs.existsSync(servicesDir), 'El directorio services debe existir');
  
  const expectedServices = [
    'apiClient.js',
    'authService.js',
    'productService.js',
    'cartService.js',
    'orderService.js',
    'addressService.js'
  ];

  for (const s of expectedServices) {
    assert.ok(fs.existsSync(path.join(servicesDir, s)), `El servicio ${s} debe existir`);
  }
});
