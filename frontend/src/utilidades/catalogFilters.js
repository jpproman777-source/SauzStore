import { brandOf, canBuy, hasPrice, isCommercial, productVariants } from './products.js';

export const matchesCategory = (product, category) => category === 'Todas' || !category ||
  product.category === category ||
  (category === 'Ropa' && /camis|sudader|hood|chaquet|pantal|buzo|conjunto/i.test(product.category || '')) ||
  (category === 'Sneakers' && /sneaker|tenis|zapat|calzado/i.test(product.category || '')) ||
  (category === 'Accesorios' && /accesor|gorra|bolso/i.test(product.category || ''));

export const filterCatalog = (products, filters) => {
  const { category = 'Todas', brand = 'Todas', size = 'Todas', status = 'Todos', min = '', max = '', query = '', sort = 'destacados' } = filters;
  const q = query.trim().toLocaleLowerCase('es');
  const minimum = min === '' ? null : Number(min);
  const maximum = max === '' ? null : Number(max);
  const list = products.filter(product => {
    const priced = hasPrice(product);
    return matchesCategory(product, category) &&
      (brand === 'Todas' || brandOf(product) === brand) &&
      (size === 'Todas' || productVariants(product).some(variant => variant.size === size)) &&
      (status === 'Todos' || (status === 'Disponibles' ? canBuy(product) : !isCommercial(product))) &&
      ((minimum === null && maximum === null) || (priced && (minimum === null || product.price >= minimum) && (maximum === null || product.price <= maximum))) &&
      [product.name, product.description, product.category, brandOf(product), product.sku].filter(Boolean).join(' ').toLocaleLowerCase('es').includes(q);
  });
  if (sort === 'precio-asc') list.sort((a, b) => (hasPrice(a) ? a.price : Infinity) - (hasPrice(b) ? b.price : Infinity));
  if (sort === 'precio-desc') list.sort((a, b) => (hasPrice(b) ? b.price : -Infinity) - (hasPrice(a) ? a.price : -Infinity));
  if (sort === 'nombre') list.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  if (sort === 'recientes') list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return list;
};
