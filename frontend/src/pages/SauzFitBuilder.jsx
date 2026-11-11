import React, { useState, useMemo, useEffect } from 'react';
import { ArrowUpRight, ShoppingBag, Sparkles, Check, DollarSign, Sliders, ShieldCheck, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ProductImage } from '../components/catalog/ProductImage';
import { experienceService } from '../services/experienceService';

export const SauzFitBuilder = ({ onProductSelect, initialBudget = null, setActivePage }) => {
  const { products, formatMoney, addToCart, showToast } = useCart();
  const { user } = useAuth();

  // Modo: 'custom' (libre) o 'budget' (por presupuesto)
  const [mode, setMode] = useState(initialBudget ? 'budget' : 'custom');
  const [budgetCOP, setBudgetCOP] = useState(initialBudget || 500000);
  const [activeSlot, setActiveSlot] = useState('top'); // 'top' | 'bottom' | 'sneakers' | 'cap'

  // Piscinas de productos reales del catálogo
  const tops = useMemo(
    () => products.filter((p) => ['Camisetas', 'Sudaderas', 'Chaquetas'].includes(p.category)),
    [products]
  );
  const bottoms = useMemo(
    () => products.filter((p) => p.category === 'Pantalones'),
    [products]
  );
  const sneakers = useMemo(
    () => products.filter((p) => p.category === 'Zapatillas'),
    [products]
  );
  const caps = useMemo(
    () => products.filter((p) => p.category === 'Gorras'),
    [products]
  );

  // Slots seleccionados
  const [slots, setSlots] = useState({
    top: { productId: null, size: 'M', color: 'Negro' },
    bottom: { productId: null, size: 'M', color: 'Negro' },
    sneakers: { productId: null, size: '9.5 US', color: 'Negro' },
    cap: { productId: null, size: 'Única', color: 'Negro' },
  });

  const [savingOutfit, setSavingOutfit] = useState(false);
  const [outfitName, setOutfitName] = useState('Mi Look Urbano');

  // Inicializar con productos reales
  useEffect(() => {
    if (products.length > 0) {
      setSlots((prev) => ({
        top: {
          productId: prev.top.productId || (tops[0]?.id ?? null),
          size: prev.top.size || (tops[0]?.sizes?.[0] ?? 'M'),
          color: prev.top.color || (tops[0]?.colors?.[0] ?? 'Negro'),
        },
        bottom: {
          productId: prev.bottom.productId || (bottoms[0]?.id ?? null),
          size: prev.bottom.size || (bottoms[0]?.sizes?.[0] ?? 'M'),
          color: prev.bottom.color || (bottoms[0]?.colors?.[0] ?? 'Negro'),
        },
        sneakers: {
          productId: prev.sneakers.productId || (sneakers[0]?.id ?? null),
          size: prev.sneakers.size || (sneakers[0]?.sizes?.[0] ?? '9.5 US'),
          color: prev.sneakers.color || (sneakers[0]?.colors?.[0] ?? 'Negro'),
        },
        cap: {
          productId: prev.cap.productId || (caps[0]?.id ?? null),
          size: prev.cap.size || 'Única',
          color: prev.cap.color || (caps[0]?.colors?.[0] ?? 'Negro'),
        },
      }));
    }
  }, [products, tops, bottoms, sneakers, caps]);

  // Resolver información detallada por slot
  const resolvedSlots = useMemo(() => {
    const list = [
      { key: 'top', label: 'Prenda Superior', pool: tops },
      { key: 'bottom', label: 'Pantalón / Cargo', pool: bottoms },
      { key: 'sneakers', label: 'Sneakers / Calzado', pool: sneakers },
      { key: 'cap', label: 'Gorra / Headwear (Opcional)', pool: caps },
    ];

    return list.map((item) => {
      const slotData = slots[item.key];
      const product = products.find((p) => p.id === slotData?.productId);
      const price = typeof product?.price === 'number' ? product.price : 0;
      return {
        ...item,
        data: slotData,
        product,
        price,
        isPurchasable: product && product.commercial !== false && price > 0,
      };
    });
  }, [slots, products, tops, bottoms, sneakers, caps]);

  // Subtotal del outfit
  const totalOutfitPrice = useMemo(() => {
    return resolvedSlots.reduce((sum, item) => sum + (item.price || 0), 0);
  }, [resolvedSlots]);

  // Presupuesto restante cuando mode === 'budget'
  const budgetRemaining = budgetCOP - totalOutfitPrice;

  // Selección de producto para un slot
  const handleSelectProduct = (slotKey, prod) => {
    setSlots((prev) => ({
      ...prev,
      [slotKey]: {
        productId: prod.id,
        size: prod.sizes?.[0] || 'M',
        color: prod.colors?.[0] || 'Negro',
      },
    }));
  };

  // Quitar gorra opcional
  const handleToggleCap = () => {
    setSlots((prev) => ({
      ...prev,
      cap: prev.cap.productId ? { productId: null, size: 'Única', color: 'Negro' } : { productId: caps[0]?.id || null, size: 'Única', color: 'Negro' },
    }));
  };

  // Agregar todas las prendas al carrito
  const handleAddAllToCart = () => {
    let count = 0;
    resolvedSlots.forEach((item) => {
      if (item.product && item.price > 0) {
        addToCart(item.product, 1, item.data?.size, item.data?.color);
        count++;
      }
    });

    if (count > 0) {
      showToast(`🛍️ ${count} prendas del look agregadas al carrito`);
    } else {
      showToast('⚠️ Las prendas seleccionadas están pendientes de precio comercial.');
    }
  };

  // Guardar en My SAUZ Closet
  const handleSaveToCloset = async () => {
    setSavingOutfit(true);
    try {
      await experienceService.saveClosetOutfit({
        userId: user?.id || null,
        userEmail: user?.email || '',
        userName: user?.name || 'Miembro SAUZ',
        name: outfitName.trim() || 'Look Urbano SAUZ',
        style: mode === 'budget' ? `Budget Fit ($${budgetCOP.toLocaleString('es-CO')})` : 'Urban Streetwear',
        slots,
        subtotalCOP: totalOutfitPrice,
        isPublic: true,
      });
      showToast('✨ Outfit guardado en My SAUZ Closet con éxito');
    } catch (e) {
      showToast(e.message);
    } finally {
      setSavingOutfit(false);
    }
  };

  // Obtener prendas filtradas del slot activo
  const activePool = useMemo(() => {
    let pool = [];
    if (activeSlot === 'top') pool = tops;
    else if (activeSlot === 'bottom') pool = bottoms;
    else if (activeSlot === 'sneakers') pool = sneakers;
    else if (activeSlot === 'cap') pool = caps;

    if (mode === 'budget') {
      // Ordenar por precio ascendente para facilitar armar looks dentro del presupuesto
      return [...pool].sort((a, b) => (a.price || 999999) - (b.price || 999999));
    }
    return pool;
  }, [activeSlot, tops, bottoms, sneakers, caps, mode]);

  return (
    <div
      className="sauz-fit-builder"
      style={{
        paddingTop: 'calc(var(--edition-header-h, 84px) + 24px)',
        paddingBottom: '80px',
        paddingInline: '5%',
        maxWidth: '1440px',
        marginInline: 'auto',
        color: '#ffffff',
      }}
    >
      {/* Header & Sub-Navigation */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '20px', background: 'rgba(255, 23, 36,0.12)', border: '1px solid rgba(255, 23, 36,0.3)', marginBottom: '10px' }}>
            <Sparkles size={14} color="#ff1724" />
            <span style={{ fontSize: '0.74rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#ff1724' }}>
              SAUZ FIT BUILDER · INTERACTIVE LOOK CONSTRUCTOR
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: '800', margin: 0, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
            Construye Tu Look Urbano Masculino
          </h1>
          <p style={{ margin: '6px 0 0', color: '#8e8e99', fontSize: '0.9rem', maxWidth: '720px' }}>
            Combina prendas y calzado 100% auténticos de Nike, Jordan, Adidas, New Era y SAUZ sobre un lienzo editorial interactivo.
          </p>
        </div>

        {/* Toggle Mode: Libre vs Presupuesto */}
        <div style={{ display: 'flex', background: '#141418', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            type="button"
            onClick={() => setMode('custom')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: mode === 'custom' ? '#ff1724' : 'transparent',
              color: '#fff',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Creación Libre</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('budget')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: mode === 'budget' ? '#ff1724' : 'transparent',
              color: '#fff',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <DollarSign size={14} />
            <span>Por Presupuesto (COP)</span>
          </button>
        </div>
      </div>

      {/* Barra de Presupuesto en caso de modo 'budget' */}
      {mode === 'budget' && (
        <div style={{ background: '#121216', border: '1px solid rgba(255, 23, 36,0.3)', borderRadius: '12px', padding: '18px 24px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '14px' }}>
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#fff' }}>Presupuesto Objetivo en Pesos Colombianos</strong>
              <div style={{ fontSize: '0.78rem', color: '#8e8e99' }}>Selecciona o escribe el valor máximo que deseas invertir en tu fit completo:</div>
            </div>

            {/* Presets rápidos */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[300000, 500000, 800000, 1200000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setBudgetCOP(val)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    background: budgetCOP === val ? '#ff1724' : 'rgba(255,255,255,0.06)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    fontWeight: '700',
                  }}
                >
                  ${(val / 1000).toFixed(0)}k COP
                </button>
              ))}
            </div>
          </div>

          {/* Barra indicadora */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem', marginBottom: '6px' }}>
            <span>Invertido: <strong style={{ color: totalOutfitPrice > budgetCOP ? '#ff1724' : '#ff1724' }}>{formatMoney(totalOutfitPrice)}</strong></span>
            <span>
              {budgetRemaining >= 0 ? (
                <span style={{ color: '#4ade80' }}>Disponible: +{formatMoney(budgetRemaining)}</span>
              ) : (
                <span style={{ color: '#ff1724' }}>Excedido por: {formatMoney(Math.abs(budgetRemaining))}</span>
              )}
            </span>
          </div>

          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.min(100, Math.round((totalOutfitPrice / (budgetCOP || 1)) * 100))}%`,
                height: '100%',
                background: totalOutfitPrice > budgetCOP ? '#ff1724' : '#ff1724',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      )}

      {/* Grid Principal: 2 Columnas (Visualizador de Outfit 50% / Catálogo por Ranura 50%) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '32px', alignItems: 'start' }}>
        {/* COLUMNA IZQUIERDA: LIENZO DEL OUTFIT MASCULINO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              background: 'radial-gradient(circle at 50% 25%, #18181e 0%, #0a0a0c 80%)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.85)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#ff1724', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  COMPOSICIÓN DE LOOK
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: '1.2rem', fontWeight: '800' }}>
                  {outfitName}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleToggleCap}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: slots.cap?.productId ? 'rgba(255, 23, 36,0.15)' : 'rgba(255,255,255,0.05)',
                  color: slots.cap?.productId ? '#ff1724' : '#8e8e99',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                {slots.cap?.productId ? '✓ Con Gorra' : '+ Agregar Gorra'}
              </button>
            </div>

            {/* Ranuras Visuales Verticales */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {resolvedSlots.map((item) => {
                const prod = item.product;
                const isSelectedSlot = activeSlot === item.key;
                if (item.key === 'cap' && !slots.cap?.productId) return null;

                return (
                  <div
                    key={item.key}
                    onClick={() => setActiveSlot(item.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: isSelectedSlot ? '#1c1c24' : '#121215',
                      border: isSelectedSlot ? '1.5px solid #ff1724' : '1px solid rgba(255,255,255,0.06)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '56px', height: '60px', background: '#000', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                        {prod?.image ? (
                          <ProductImage mode="thumb" src={prod.image} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#555' }}>Vigente</div>
                        )}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.68rem', color: '#ff1724', textTransform: 'uppercase', fontWeight: '700' }}>
                            {item.label}
                          </span>
                          {prod?.brand && (
                            <span style={{ fontSize: '0.64rem', background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: '4px' }}>
                              {prod.brand}
                            </span>
                          )}
                        </div>
                        <strong style={{ fontSize: '0.88rem', color: '#fff', display: 'block', marginTop: '2px' }}>
                          {prod ? prod.name : 'Sin asignar'}
                        </strong>
                        <div style={{ fontSize: '0.74rem', color: '#8e8e99', marginTop: '2px' }}>
                          Talla: <strong>{item.data?.size}</strong> · Color: <strong>{item.data?.color}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff', display: 'block' }}>
                        {item.price > 0 ? formatMoney(item.price) : 'Precio pendiente'}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#ff1724', fontWeight: '600' }}>
                        {isSelectedSlot ? 'Editando...' : 'Cambiar prenda ↗'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Comercial & Acciones */}
            <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#8e8e99', display: 'block' }}>Total del Outfit (COP):</span>
                  <span style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ffffff', fontFamily: 'var(--font-nike, sans-serif)' }}>
                    {formatMoney(totalOutfitPrice)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleSaveToCloset}
                    disabled={savingOutfit}
                    style={{
                      padding: '10px 16px',
                      background: 'rgba(255,255,255,0.08)',
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Heart size={14} color="#ff1724" />
                    <span>Guardar en My Closet</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddAllToCart}
                style={{
                  width: '100%',
                  padding: '15px',
                  background: '#ffffff',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '800',
                  fontSize: '0.92rem',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                }}
              >
                <ShoppingBag size={18} />
                <span>Agregar Todo el Outfit al Carrito</span>
              </button>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: CATÁLOGO DISPONIBLE POR RANURA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#111114', padding: '20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <strong style={{ fontSize: '0.95rem' }}>Seleccionar Prenda para: {activeSlot.toUpperCase()}</strong>
                <span style={{ fontSize: '0.75rem', color: '#8e8e99', display: 'block' }}>{activePool.length} opciones disponibles en el catálogo</span>
              </div>
            </div>

            {/* Pestañas de ranura */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '16px' }}>
              {[
                { key: 'top', label: 'Superior' },
                { key: 'bottom', label: 'Pantalón' },
                { key: 'sneakers', label: 'Sneakers' },
                { key: 'cap', label: 'Gorra' },
              ].map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setActiveSlot(s.key)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '6px',
                    border: 'none',
                    background: activeSlot === s.key ? '#ff1724' : 'rgba(255,255,255,0.06)',
                    color: '#fff',
                    fontSize: '0.78rem',
                    fontWeight: activeSlot === s.key ? '700' : '500',
                    cursor: 'pointer',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Grid de prendas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', maxHeight: '520px', overflowY: 'auto', paddingRight: '4px' }}>
              {activePool.map((p) => {
                const isSelected = slots[activeSlot]?.productId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProduct(activeSlot, p)}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(255, 23, 36,0.18)' : '#16161b',
                      border: isSelected ? '1.5px solid #ff1724' : '1px solid rgba(255,255,255,0.06)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <div style={{ width: '100%', height: '90px', background: '#000', borderRadius: '6px', overflow: 'hidden' }}>
                      <ProductImage mode="thumb" src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <span style={{ fontSize: '0.64rem', color: '#ff1724', textTransform: 'uppercase', fontWeight: '700' }}>
                      {p.brand || 'SAUZ'}
                    </span>
                    <span style={{ fontSize: '0.76rem', fontWeight: '700', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.name}
                    </span>
                    <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#fff' }}>
                      {p.price > 0 ? formatMoney(p.price) : 'Precio pendiente'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
