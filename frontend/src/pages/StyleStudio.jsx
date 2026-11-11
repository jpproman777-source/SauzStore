import React, { useState, useMemo, useEffect } from 'react';
import { ArrowUpRight, Sparkles, Check, RefreshCw, ShoppingBag, Eye, ShieldCheck, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ProductImage } from '../components/ProductImage';

const AUTHORIZED_MODELS = [
  {
    id: 'male-mateo',
    gender: 'masculino',
    name: 'Mateo',
    title: 'Urban Minimalist',
    height: '1.83 m',
    build: 'Silueta atlética relajada',
    vibe: 'Streetwear monocromático & tech-fleece',
    accentColor: '#e65a5d',
    avatar: '/Productos/sauz-015.png'
  },
  {
    id: 'female-valeria',
    gender: 'femenino',
    name: 'Valeria',
    title: 'Streetwear Aesthetic',
    height: '1.72 m',
    build: 'Silueta relajada / Oversize fit',
    vibe: 'Cápsula urbana retro-chic & sneakers',
    accentColor: '#38bdf8',
    avatar: '/Productos/sauz-013.png'
  }
];

export const StyleStudio = ({ onProductSelect, setActivePage }) => {
  const { products, formatMoney, addToCart, showToast } = useCart();

  const [selectedModelId, setSelectedModelId] = useState('male-mateo');
  const [activeSlot, setActiveSlot] = useState('top'); // 'top' | 'bottom' | 'sneakers' | 'cap'
  const [generating, setGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState(null);

  // Filtros de prendas reales por categoría
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

  // Slots del outfit actual
  const [slots, setSlots] = useState({
    top: { productId: null, size: 'M', color: 'Negro' },
    bottom: { productId: null, size: 'M', color: 'Negro' },
    sneakers: { productId: null, size: '9.5 US', color: 'Negro / Rojo' },
    cap: { productId: null, size: 'Única', color: 'Negro' }
  });

  // Inicializar con prendas reales del catálogo
  useEffect(() => {
    if (products.length > 0) {
      setSlots((prev) => ({
        top: {
          productId: prev.top.productId || (tops[0]?.id ?? null),
          size: prev.top.size || (tops[0]?.sizes?.[0] ?? 'M'),
          color: prev.top.color || (tops[0]?.colors?.[0] ?? 'Negro')
        },
        bottom: {
          productId: prev.bottom.productId || (bottoms[0]?.id ?? null),
          size: prev.bottom.size || (bottoms[0]?.sizes?.[0] ?? 'M'),
          color: prev.bottom.color || (bottoms[0]?.colors?.[0] ?? 'Negro')
        },
        sneakers: {
          productId: prev.sneakers.productId || (sneakers[0]?.id ?? null),
          size: prev.sneakers.size || (sneakers[0]?.sizes?.[0] ?? '9.5 US'),
          color: prev.sneakers.color || (sneakers[0]?.colors?.[0] ?? 'Negro')
        },
        cap: {
          productId: prev.cap.productId || (caps[0]?.id ?? null),
          size: prev.cap.size || 'Única',
          color: prev.cap.color || (caps[0]?.colors?.[0] ?? 'Negro')
        }
      }));
    }
  }, [products, tops, bottoms, sneakers, caps]);

  const selectedModel = AUTHORIZED_MODELS.find((m) => m.id === selectedModelId) || AUTHORIZED_MODELS[0];

  // Resolver objetos completos de producto por slot
  const resolvedOutfit = useMemo(() => {
    const list = [
      { key: 'top', label: 'Parte Superior', data: slots.top, pool: tops },
      { key: 'bottom', label: 'Pantalón / Inferior', data: slots.bottom, pool: bottoms },
      { key: 'sneakers', label: 'Sneakers / Calzado', data: slots.sneakers, pool: sneakers },
      { key: 'cap', label: 'Gorra / Headwear (Opcional)', data: slots.cap, pool: caps }
    ];

    return list.map((slot) => {
      const product = products.find((p) => p.id === slot.data?.productId);
      return {
        ...slot,
        product,
        price: typeof product?.price === 'number' ? product.price : 0,
        isAvailable: product && product.commercial !== false && (product.price > 0 || product.stock > 0)
      };
    });
  }, [slots, products, tops, bottoms, sneakers, caps]);

  // Subtotal del outfit en COP
  const outfitSubtotal = useMemo(() => {
    return resolvedOutfit.reduce((sum, item) => sum + (item.price || 0), 0);
  }, [resolvedOutfit]);

  // Selección de prenda en un slot
  const handleSelectProductForSlot = (slotKey, prod) => {
    setSlots((prev) => ({
      ...prev,
      [slotKey]: {
        productId: prod.id,
        size: prod.sizes?.[0] || 'M',
        color: prod.colors?.[0] || 'Negro'
      }
    }));
  };

  // Generar look con IA en backend
  const handleGenerateLook = async () => {
    setGenerating(true);
    setGenerationResult(null);
    try {
      const res = await fetch('/api/style-studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId: selectedModelId,
          slots
        })
      });
      const data = await res.json();
      setGenerationResult(data);
      showToast('✨ Visualización de look editorial actualizada');
    } catch (e) {
      console.error('Error al generar look:', e);
      showToast('Error de conexión con el motor neuronal');
    } finally {
      setGenerating(false);
    }
  };

  // Agregar todas las prendas al carrito
  const handleAddOutfitToCart = () => {
    let addedCount = 0;
    resolvedOutfit.forEach((item) => {
      if (item.product && item.price > 0) {
        addToCart(item.product, 1, item.data?.size, item.data?.color);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      showToast(`🛍️ ${addedCount} prendas del outfit agregadas al carrito`);
    } else {
      showToast('⚠️ Las prendas seleccionadas aún no tienen precio comercial asignado.');
    }
  };

  // Obtener prendas disponibles para el slot activo
  const activeSlotProducts = useMemo(() => {
    if (activeSlot === 'top') return tops;
    if (activeSlot === 'bottom') return bottoms;
    if (activeSlot === 'sneakers') return sneakers;
    if (activeSlot === 'cap') return caps;
    return [];
  }, [activeSlot, tops, bottoms, sneakers, caps]);

  return (
    <div
      className="sauz-style-studio"
      style={{
        paddingTop: 'calc(var(--edition-header-h, 84px) + 28px)',
        paddingBottom: '80px',
        paddingInline: '5%',
        maxWidth: '1440px',
        marginInline: 'auto',
        color: '#ffffff'
      }}
    >
      {/* Header Editorial de Style Studio */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '20px', background: 'rgba(230,90,93,0.12)', border: '1px solid rgba(230,90,93,0.3)', marginBottom: '12px' }}>
          <Sparkles size={14} color="#e65a5d" />
          <span style={{ fontSize: '0.74rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#e65a5d' }}>
            SAUZ STYLE STUDIO — CREATE YOUR LOOK
          </span>
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '800', margin: 0, letterSpacing: '-0.02em', textTransform: 'uppercase', fontFamily: 'var(--font-nike, sans-serif)' }}>
          Probador Editorial & Compositor Urbano
        </h1>
        <p style={{ margin: '8px 0 0', color: '#8e8e99', fontSize: '0.95rem', maxWidth: '780px', lineHeight: 1.5 }}>
          Combina siluetas auténticas de nuestra colección (Hoodies, Camisetas, Cargos, Jordans y Gorras) sobre modelos fotográficos autorizados y proyecta tu outfit en alta definición con nuestro motor neuronal.
        </p>
      </div>

      {/* Grid Principal: 2 Columnas (Lienzo Fotográfico Izq 50%, Constructor Comercial Der 50%) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '36px',
          alignItems: 'start'
        }}
      >
        {/* COLUMNA IZQUIERDA: LIENZO FOTOGRÁFICO & MODELO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Selector de Modelos Autorizados */}
          <div style={{ background: '#111114', padding: '16px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: '0.74rem', color: '#8e8e99', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '10px' }}>
              1. Selecciona el Modelo Fotográfico Autorizado
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {AUTHORIZED_MODELS.map((model) => {
                const isSelected = selectedModelId === model.id;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => setSelectedModelId(model.id)}
                    style={{
                      padding: '14px',
                      borderRadius: '10px',
                      background: isSelected ? 'linear-gradient(180deg, #1f1f26 0%, #121216 100%)' : '#16161b',
                      border: isSelected ? '1.5px solid #e65a5d' : '1px solid rgba(255,255,255,0.06)',
                      color: '#ffffff',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 8px 24px rgba(230,90,93,0.18)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '1rem', fontWeight: '800' }}>{model.name}</strong>
                      <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', textTransform: 'uppercase' }}>
                        {model.gender}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#e65a5d', fontWeight: '600', display: 'block', marginTop: '2px' }}>
                      {model.title}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#8e8e99', display: 'block', marginTop: '4px' }}>
                      {model.height} · {model.build}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Canvas de Composición Editorial */}
          <div
            style={{
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              background: 'radial-gradient(circle at 50% 30%, #1e1e24 0%, #09090b 70%)',
              border: '1px solid rgba(255,255,255,0.1)',
              minHeight: '480px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '24px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)'
            }}
          >
            {/* Overlay Superior de Modelo y Estado */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 2 }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#e65a5d', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  LOOKBOOK CAMPAIGN · {selectedModel.name.toUpperCase()}
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: '1.25rem', fontWeight: '800' }}>
                  {selectedModel.vibe}
                </h3>
              </div>
              <span style={{ fontSize: '0.72rem', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', color: '#a1a1aa' }}>
                Medellín Street Studio
              </span>
            </div>

            {/* Muestra Visual de las Prendas del Outfit */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                marginBlock: '24px',
                zIndex: 2
              }}
            >
              {resolvedOutfit.map((slot) => {
                const prod = slot.product;
                return (
                  <div
                    key={slot.key}
                    style={{
                      background: 'rgba(10,10,12,0.85)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      padding: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center'
                    }}
                  >
                    <span style={{ fontSize: '0.64rem', color: '#8e8e99', textTransform: 'uppercase', fontWeight: '700', marginBottom: '6px' }}>
                      {slot.key.toUpperCase()}
                    </span>
                    <div style={{ width: '64px', height: '64px', background: '#000', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {prod?.image ? (
                        <ProductImage mode="thumb" src={prod.image} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: '#555' }}>Vigente</span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: '700', marginTop: '6px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }}>
                      {prod ? prod.name : 'Sin seleccionar'}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: '#e65a5d', fontWeight: '600' }}>
                      {slot.price > 0 ? formatMoney(slot.price) : 'Consultar'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Panel de Generación con IA */}
            <div style={{ zIndex: 2, background: 'rgba(14,14,18,0.92)', backdropFilter: 'blur(12px)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="#e65a5d" />
                  <span style={{ fontSize: '0.82rem', fontWeight: '700' }}>Motor Fotográfico Neuronal</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#8e8e99' }}>IA Generativa / Lookbook</span>
              </div>

              {generationResult && (
                <div style={{ marginBottom: '12px', padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', fontSize: '0.78rem', color: '#d1d1d6', borderLeft: '3px solid #e65a5d' }}>
                  <strong>{generationResult.provider}:</strong> {generationResult.message || generationResult.generatedNotes || 'Proyección de alta resolución renderizada con éxito.'}
                  {generationResult.missingKey && (
                    <div style={{ marginTop: '4px', fontSize: '0.72rem', color: '#fbbf24' }}>
                      ℹ️ Variable de entorno {generationResult.missingKey} lista en arquitectura para difusión de píxeles externa.
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={handleGenerateLook}
                disabled={generating}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #e65a5d 0%, #b91c1c 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.88rem',
                  fontWeight: '800',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  cursor: generating ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 20px rgba(230,90,93,0.3)'
                }}
              >
                {generating ? <RefreshCw size={16} className="spin" /> : <Sparkles size={16} />}
                <span>{generating ? 'Generando Fotografía...' : '⚡ Generar Fotografía Editorial con IA'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: CONSTRUCTOR DE OUTFIT & RESUMEN COMERCIAL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Selector de Slot Activo */}
          <div style={{ background: '#111114', padding: '16px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: '0.74rem', color: '#8e8e99', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '12px' }}>
              2. Configura las Piezas de tu Look
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {[
                { id: 'top', label: 'Superior', count: tops.length },
                { id: 'bottom', label: 'Pantalón', count: bottoms.length },
                { id: 'sneakers', label: 'Sneakers', count: sneakers.length },
                { id: 'cap', label: 'Gorra', count: caps.length }
              ].map((slot) => {
                const isActive = activeSlot === slot.id;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setActiveSlot(slot.id)}
                    style={{
                      padding: '10px 6px',
                      borderRadius: '8px',
                      background: isActive ? '#e65a5d' : 'rgba(255,255,255,0.05)',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: isActive ? '800' : '600',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div>{slot.label}</div>
                    <small style={{ opacity: 0.8, fontSize: '0.68rem' }}>{slot.count} pcs</small>
                  </button>
                );
              })}
            </div>

            {/* Carrusel / Grid de Prendas Disponibles para el Slot Activo */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '0.78rem', color: '#a1a1aa', marginBottom: '8px' }}>
                Prendas del catálogo disponibles para <strong>{activeSlot.toUpperCase()}</strong>:
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: '10px',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  paddingRight: '6px'
                }}
              >
                {activeSlotProducts.map((prod) => {
                  const isCurrentInSlot = slots[activeSlot]?.productId === prod.id;
                  return (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => handleSelectProductForSlot(activeSlot, prod)}
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        background: isCurrentInSlot ? 'rgba(230,90,93,0.18)' : '#16161a',
                        border: isCurrentInSlot ? '1.5px solid #e65a5d' : '1px solid rgba(255,255,255,0.06)',
                        color: '#fff',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ width: '100%', height: '80px', background: '#000', borderRadius: '6px', overflow: 'hidden' }}>
                        <ProductImage mode="thumb" src={prod.image} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                      <span style={{ fontSize: '0.74rem', fontWeight: '700', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {prod.name}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#e65a5d', fontWeight: '700' }}>
                        {prod.price > 0 ? formatMoney(prod.price) : 'Precio pendiente'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Resumen Comercial del Outfit Completo */}
          <div style={{ background: '#121216', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800' }}>Resumen Comercial del Outfit</h4>
                <span style={{ fontSize: '0.74rem', color: '#8e8e99' }}>Prendas seleccionadas para despacho en Colombia</span>
              </div>
              <span style={{ fontSize: '0.72rem', background: '#e65a5d', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontWeight: '700' }}>
                4 PIEZAS
              </span>
            </div>

            {/* Listado con selector de talla y color por prenda */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              {resolvedOutfit.map((slot) => {
                const prod = slot.product;
                if (!prod) return null;

                const availableSizes = prod.sizes && prod.sizes.length > 0 ? prod.sizes : ['S', 'M', 'L', 'XL'];
                const availableColors = prod.colors && prod.colors.length > 0 ? prod.colors : ['Negro', 'Blanco'];

                return (
                  <div
                    key={slot.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      padding: '10px 12px',
                      background: '#16161b',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <div style={{ width: '44px', height: '48px', background: '#000', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                        <ProductImage mode="thumb" src={prod.image} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <button
                          type="button"
                          onClick={() => onProductSelect(prod.id)}
                          style={{ background: 'none', border: 'none', color: '#fff', padding: 0, textAlign: 'left', fontWeight: '700', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{prod.name}</span>
                          <ArrowUpRight size={12} color="#e65a5d" />
                        </button>
                        <span style={{ fontSize: '0.74rem', color: '#e65a5d', fontWeight: '700', display: 'block', marginTop: '2px' }}>
                          {slot.price > 0 ? formatMoney(slot.price) : 'Precio pendiente'}
                        </span>
                      </div>
                    </div>

                    {/* Selectores de Talla y Color */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <select
                        value={slots[slot.key]?.size || availableSizes[0]}
                        onChange={(e) => setSlots((prev) => ({ ...prev, [slot.key]: { ...prev[slot.key], size: e.target.value } }))}
                        style={{ padding: '4px 8px', background: '#222228', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', fontSize: '0.74rem' }}
                      >
                        {availableSizes.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>

                      <select
                        value={slots[slot.key]?.color || availableColors[0]}
                        onChange={(e) => setSlots((prev) => ({ ...prev, [slot.key]: { ...prev[slot.key], color: e.target.value } }))}
                        style={{ padding: '4px 8px', background: '#222228', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', fontSize: '0.74rem' }}
                      >
                        {availableColors.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total y Botón Comercial */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.9rem', color: '#a1a1aa' }}>Total del Outfit (COP):</span>
                <span style={{ fontSize: '1.45rem', fontWeight: '800', color: '#ffffff', fontFamily: 'var(--font-nike, sans-serif)' }}>
                  {formatMoney(outfitSubtotal)}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleAddOutfitToCart}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: '#ffffff',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '800',
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                >
                  <ShoppingBag size={18} />
                  <span>Agregar Outfit Completo al Carrito</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.75rem', color: '#71717a' }}>
                  <ShieldCheck size={14} color="#15803d" />
                  <span>Envío gratuito nacional en 2-4 días hábiles · Garantía de talla 30 días</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
