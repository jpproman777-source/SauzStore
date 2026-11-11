// Calendar periods use the same local day boundaries for metrics and chart.
export function periodStartDate(period, now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === 'month') start.setDate(1);
  else if (period !== 'today') start.setDate(start.getDate() - (period === '7days' ? 6 : 29));
  return start;
}

export function filterOrdersByPeriod(orders, period, now = new Date()) {
  const start = +periodStartDate(period, now);
  const end = +now;
  return (orders || []).filter(order => {
    const time = Number(order.timestamp);
    return Number.isFinite(time) && time >= start && time <= end;
  });
}

export function summarizeCategories(products, validOrders) {
  const productMap = new Map();
  const categories = new Map();

  for (const product of products || []) {
    productMap.set(product.id, product);
    const cat = product.category || 'Sin categoría';
    if (!categories.has(cat)) categories.set(cat, { category: cat, productCount: 0, stockUnits: 0, revenue: 0 });
    const entry = categories.get(cat);
    entry.productCount += 1;
    entry.stockUnits += Number(product.stock || 0);
  }

  for (const order of validOrders || []) {
    for (const item of order.items || []) {
      const itemRevenue = Number(item.price || 0) * Number(item.quantity || 0);
      const knownCat = productMap.get(item.productId)?.category || item.category;
      const cat = knownCat || (itemRevenue > 0 ? 'Sin categoría' : null);
      if (!cat) continue;
      if (!categories.has(cat)) categories.set(cat, { category: cat, productCount: 0, stockUnits: 0, revenue: 0 });
      categories.get(cat).revenue += itemRevenue;
    }
  }

  return [...categories.values()].sort((a, b) => b.revenue - a.revenue || a.category.localeCompare(b.category, 'es'));
}

export function summarizeInventory(products, threshold = 5) {
  const limit = Number(threshold) || 5;
  let totalUnits = 0;
  let lowVariantCount = 0;
  let outVariantCount = 0;
  let lowProductCount = 0;
  let outProductCount = 0;
  let healthyProductCount = 0;
  const rows = [];

  for (const product of products || []) {
    if (product.active === false) continue;
    const rawVariants = Array.isArray(product.variants) && product.variants.length > 0
      ? product.variants
      : [{ id: null, size: 'Única', stock: Number(product.stock || 0) }];

    const variants = rawVariants.map(v => ({
      id: v.id ?? null,
      size: v.size || 'Única',
      stock: Math.max(0, Number(v.stock || 0)),
    }));

    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
    const outVariants = variants.filter(v => v.stock === 0).length;
    const lowVariants = variants.filter(v => v.stock > 0 && v.stock <= limit).length;
    const minStock = Math.min(...variants.map(v => v.stock));
    const suggestedVariant = variants.reduce((best, cur) => (cur.stock < best.stock ? cur : best), variants[0]);

    totalUnits += totalStock;
    outVariantCount += outVariants;
    lowVariantCount += lowVariants;

    let status = 'ok';
    if (totalStock === 0 || outVariants > 0) {
      status = 'out';
      outProductCount += 1;
    } else if (lowVariants > 0) {
      status = 'low';
      lowProductCount += 1;
    } else {
      healthyProductCount += 1;
    }

    rows.push({
      product,
      variants,
      totalStock,
      outVariants,
      lowVariants,
      minStock,
      status,
      suggestedVariant,
    });
  }

  const priority = { out: 0, low: 1, ok: 2 };
  rows.sort((a, b) => priority[a.status] - priority[b.status] || a.minStock - b.minStock);

  return {
    totalUnits,
    productCount: rows.length,
    lowVariantCount,
    outVariantCount,
    lowProductCount,
    outProductCount,
    healthyProductCount,
    rows,
  };
}

export function overviewSeries(orders, period, now = new Date(), calendar = null) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = periodStartDate(period, now);
  const end = new Date(today); end.setDate(end.getDate() + 1);
  if (calendar) {
    start.setFullYear(Number(calendar.year), calendar.month === 'all' ? 0 : Number(calendar.month), 1);
    end.setFullYear(Number(calendar.year), calendar.month === 'all' ? 12 : Number(calendar.month) + 1, 1);
  }
  const valid = orders.filter(order => order.orderStatus !== 'Cancelado' && Number(order.timestamp) >= +start && Number(order.timestamp) <= +now);
  const points = [];
  let running = 0;
  for (let date = new Date(start); date < end;) {
    const next = new Date(date);
    if (!calendar && period === 'today') next.setHours(next.getHours() + 4);
    else next.setDate(next.getDate() + 1);
    const matches = valid.filter(order => Number(order.timestamp) >= +date && Number(order.timestamp) < +next);
    const revenue = matches.reduce((sum, order) => sum + Number(order.total || 0), 0);
    running += revenue;
    points.push({
      label: !calendar && period === 'today' ? date.toLocaleTimeString('es-CO', {hour:'2-digit', minute:'2-digit',hour12:false}) : date.toLocaleDateString('es-CO', {day:'numeric',month:'short'}),
      fullDate: date.toLocaleString('es-CO', !calendar && period === 'today' ? {day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'} : {day:'numeric',month:'long'}),
      revenue, revenue_accum:running, orders:matches.length,
      units:matches.reduce((sum, order) => sum + (order.items || []).reduce((units,item) => units + Number(item.quantity || 0),0),0)
    });
    date = next;
  }
  return points;
}
