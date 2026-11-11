export const hasPrice = (p) => Number.isFinite(p?.price) && p.price > 0;
export const isCommercial = (p) =>
  Boolean(
    p &&
    p.active !== false &&
    !p.demo &&
    p.commercial !== false &&
    hasPrice(p) &&
    Array.isArray(p.variants) &&
    p.variants.length > 0 &&
    p.id != null,
  );
export const canBuy = (p) => isCommercial(p) && p.variants.some(variant => Number(variant.stock) > 0);
export const productVariants = (p) => Array.isArray(p?.variants) ? p.variants : [];
export const brandOf = (p) =>
  p.brand ||
  ["Jordan", "Nike", "Adidas", "Hellstar", "Monastery", "Hugo"].find((b) =>
    p.name?.toLowerCase().includes(b.toLowerCase()),
  ) ||
  "Marca por confirmar";
export const productPath = (id) => `/producto/${encodeURIComponent(id)}`;
