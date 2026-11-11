import { canBuy, hasPrice } from './products.js';

export const COLLECTIONS = [
  { label: 'Todas', category: null },
  { label: 'Camisetas', category: 'Camisetas' },
  { label: 'Gorras', category: 'Gorras' },
  { label: 'Sneakers', category: 'Zapatillas' },
  { label: 'Sudaderas', category: 'Sudaderas' },
  { label: 'Conjuntos', category: 'Conjuntos' },
  { label: 'Chaquetas', category: 'Chaquetas' },
  { label: 'Pantalones', category: 'Pantalones' },
];

const eligible = product => product?.active !== false && Boolean(product.image) && product.id != null;
const featuredFirst = (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured));

export const selectCollectionProducts = (products, label = 'Todas', commercialOnly = false) => {
  const category = COLLECTIONS.find(collection => collection.label === label)?.category;
  const unique = [...new Map(products.filter(eligible).map(product => [String(product.id), product])).values()];
  const candidates = unique.filter(product => (!commercialOnly || (hasPrice(product) && canBuy(product))) &&
    (!category || product.category === category));
  if (category) return candidates.sort(featuredFirst);

  // Intercalar categorías para que la primera vista no dependa del orden de carga.
  const buckets = COLLECTIONS.slice(1).map(collection =>
    candidates.filter(product => product.category === collection.category).sort(featuredFirst));
  const remaining = candidates.filter(product => !COLLECTIONS.slice(1).some(collection => collection.category === product.category)).sort(featuredFirst);
  const mixed = [];
  while (buckets.some(bucket => bucket.length)) {
    for (const bucket of buckets) if (bucket.length) mixed.push(bucket.shift());
  }
  return [...mixed, ...remaining];
};
