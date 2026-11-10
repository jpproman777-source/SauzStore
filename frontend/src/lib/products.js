export const isCommercial = (p) =>
  Boolean(
    p &&
    !p.demo &&
    p.commercial !== false &&
    Number.isFinite(p.price) &&
    p.price > 0 &&
    p.id != null,
  );
export const canBuy = (p) => isCommercial(p) && Number(p.stock) > 0;
export const brandOf = (p) =>
  p.brand ||
  ["Jordan", "Nike", "Adidas", "Hellstar", "Monastery", "Hugo"].find((b) =>
    p.name?.toLowerCase().includes(b.toLowerCase()),
  ) ||
  "Marca por confirmar";
export const productPath = (id) => `/producto/${encodeURIComponent(id)}`;
