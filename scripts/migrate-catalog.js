const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dataFile = path.join(root, 'backend/data/products.json');
const source = path.join(root, 'frontend/productos');
const assets = path.join(root, 'frontend/img/Productos');
const backup = path.join(root, 'backend/data/products.before-catalog-2026-11-10.json');

// Una fila por artículo visualmente distinto. Las demás tomas se documentan abajo.
const rows = `
001|Nike|Sudaderas|Sudadera|Sudadera Nike de bloques gris y negro
002|Nike|Sudaderas|Sudadera|Sudadera Nike negra con logotipo frontal
003|Adidas|Camisetas|Camiseta|Camiseta Adidas negra de tres rayas
004|Jordan|Sudaderas|Sudadera|Sudadera Jordan gris con emblema rojo
005|Por clasificar|Conjuntos|Conjunto deportivo|Conjunto deportivo negro con emblema por confirmar
006|Adidas|Conjuntos|Conjunto deportivo|Conjunto Adidas verde y crema
007|Adidas|Sudaderas|Sudadera|Sudadera Adidas crema y negra
008|Nike|Camisetas|Camiseta|Camiseta Nike negra con franjas rojas
009|Adidas|Sudaderas|Sudadera|Sudadera Adidas de paneles crema y negro
010|Nike|Camisetas|Camiseta|Camiseta Nike negra, blanca y roja
011|Nike|Conjuntos|Conjunto deportivo|Conjunto Nike gris y negro
012|Adidas|Camisetas|Camiseta|Camiseta Adidas negra con cuello
013|Nike|Zapatillas|Calzado|Zapatillas Nike blancas y azul marino
014|Nike|Sudaderas|Sudadera|Sudadera Nike negra con mangas de color
015|Jordan|Zapatillas|Calzado|Zapatillas Jordan negras y rojas
016|Nike|Sudaderas|Sudadera|Sudadera Nike gris y negra
017|Nike|Camisetas|Camiseta|Camiseta Nike negra con franjas rojas
019|Adidas|Chaquetas|Chaqueta|Chaqueta Adidas negra de tres rayas
021|Nike|Sudaderas|Sudadera|Sudadera Nike negra con paneles crema y lila
022|Jordan|Zapatillas|Calzado|Zapatillas Jordan blancas y negras
023|Adidas|Zapatillas|Calzado|Zapatillas Adidas crema y verde
024|Nike|Sudaderas|Sudadera|Sudadera Nike color crema
025|Adidas|Zapatillas|Calzado|Zapatillas Adidas negras con rayas blancas
026|Nike|Sudaderas|Sudadera|Sudadera Nike negra y crema
027|Nike|Zapatillas|Calzado|Zapatillas Nike blancas, negras y rojas
028|Nike|Sudaderas|Sudadera|Sudadera Nike negra con mangas blancas
029|SAUZ STORE|Gorras|Gorra|Gorra SAUZ negra de visera plana
030|New Era|Gorras|Gorra MLB|Gorra New Era Los Angeles Dodgers azul
031|New Era|Gorras|Gorra MLB|Gorra New Era Oakland Athletics verde
033|SAUZ STORE|Gorras|Gorra|Gorra SAUZ negra de perfil bajo
034|SAUZ STORE|Gorras|Gorra|Gorra SAUZ negra con bordado tonal
035|New Era|Gorras|Gorra MLB|Gorra New Era Chicago White Sox negra
036|New Era|Gorras|Gorra MLB|Gorra New Era Oakland Athletics verde y amarilla
037|New Era|Gorras|Gorra MLB|Gorra New Era Boston Red Sox azul y roja
038|SAUZ STORE|Gorras|Gorra|Gorra SAUZ negra de malla
039|New Era|Gorras|Gorra MLB|Gorra New Era New York Yankees azul
040|New Era|Gorras|Gorra MLB|Gorra New Era Boston Red Sox azul
042|New Era|Gorras|Gorra MLB|Gorra New Era San Francisco Giants negra
043|New Era|Gorras|Gorra MLB|Gorra New Era San Diego Padres marrón
044|New Era|Gorras|Gorra MLB|Gorra New Era Atlanta Braves azul y roja
045|New Era|Gorras|Gorra MLB|Gorra New Era Detroit Tigers azul
046|New Era|Gorras|Gorra MLB|Gorra New Era Atlanta Braves verde con forro
047|New Era|Gorras|Gorra MLB|Gorra New Era San Diego Padres marrón y crema
049|New Era|Gorras|Gorra MLB|Gorra New Era Atlanta Braves crema y roja
050|New Era|Gorras|Gorra MLB|Gorra New Era San Diego Padres marrón y crema
051|Jordan|Zapatillas|Calzado|Zapatillas Jordan blancas con detalles rojos
052|Jordan|Zapatillas|Calzado|Zapatillas Jordan blancas, grises y rojas
053|Jordan|Zapatillas|Calzado|Zapatillas Jordan blancas, negras y rojas
055|SAUZ STORE|Gorras|Gorra|Gorra SAUZ negra con bordado blanco
056|SAUZ STORE|Camisetas|Camiseta|Camiseta SAUZ negra con logotipo
057|Jordan|Zapatillas|Calzado|Zapatillas Jordan negras y rojas
058|Nike|Pantalones|Pantalón|Pantalón cargo Nike negro
059|Jordan|Zapatillas|Calzado|Zapatillas Jordan negras con detalles multicolor
060|Por clasificar|Pantalones|Pantalón|Pantalón cargo negro de marca por confirmar
062|Por clasificar|Sudaderas|Sudadera|Sudadera negra de marca por confirmar
063|Por clasificar|Chaquetas|Chaqueta|Chaqueta bomber negra de marca por confirmar
065|Jordan|Zapatillas|Calzado|Zapatillas Jordan blancas y rojas de caña alta
066|Nike|Camisetas|Camiseta|Camiseta Nike negra de corte amplio
067|Adidas|Chaquetas|Chaqueta|Chaqueta Adidas negra de tres rayas
068|Por clasificar|Conjuntos|Conjunto deportivo|Conjunto deportivo negro de marca por confirmar
069|Jordan|Sudaderas|Sudadera|Sudadera Jordan negra con emblema pequeño
070|Adidas|Gorras|Gorra|Gorra Adidas negra con logotipo blanco
`.trim().split('\n').map(line => line.split('|'));

const alternateImages = {
  '013': ['018'], '015': ['020'], '022': ['054'],
  '023': ['032'], '035': ['048'], '039': ['041'], '052': ['061'],
};
const old = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
if (old.some(p => p.sku?.startsWith('SAUZ-NEW-'))) {
  throw new Error('La migración ya se aplicó; no se sobrescribió el catálogo.');
}
if (fs.existsSync(backup)) throw new Error('Ya existe el respaldo; revisarlo antes de continuar.');
const files = fs.readdirSync(source).filter(f => /^SAUZ_\d{3}\.png$/.test(f));
if (files.length !== 70 || rows.length !== 62) throw new Error('El número de imágenes o fichas cambió; revisar manualmente.');
fs.mkdirSync(assets, { recursive: true });
const newProducts = rows.map(([number, brand, category, subcategory, name], index) => {
  const filename = `sauz-${number}.png`;
  fs.copyFileSync(path.join(source, `SAUZ_${number}.png`), path.join(assets, filename));
  return {
    id: Math.max(...old.map(p => p.id)) + index + 1,
    sku: `SAUZ-NEW-${number}`,
    name, brand, category, subcategory,
    description: `${name}. Precio, tallas y disponibilidad pendientes de confirmación.`,
    shortDescription: name,
    detailedDescription: `${name}. La identificación se basa en la imagen original suministrada. Composición, medidas, precio y existencias están pendientes de confirmación del proveedor.`,
    image: `/Productos/${filename}`,
    alternateImages: (alternateImages[number] || []).map(n => `/Productos/sauz-${n}.png`),
    active: true, commercial: false, price: null, stock: null,
    configurationStatus: 'Pendiente de precio, tallas e inventario',
  };
});
for (const [number, others] of Object.entries(alternateImages)) {
  for (const alternate of others) {
    fs.copyFileSync(path.join(source, `SAUZ_${alternate}.png`), path.join(assets, `sauz-${alternate}.png`));
  }
}
fs.copyFileSync(dataFile, backup);
fs.writeFileSync(dataFile, JSON.stringify([...old.map(p => ({ ...p, active: false, archivedAt: '2026-11-10' })), ...newProducts], null, 2) + '\n');
console.log(`Respaldo: ${backup}; archivados: ${old.length}; fichas nuevas: ${newProducts.length}; imágenes: ${files.length}`);
