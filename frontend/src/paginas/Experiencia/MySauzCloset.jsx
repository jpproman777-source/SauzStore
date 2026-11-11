import React, { useState, useEffect, useMemo } from 'react';
import { Heart, Trash2, Share2, Plus, ShoppingBag, ArrowUpRight, Copy, Check, Lock } from 'lucide-react';
import { useCart } from '../../contextos/CartContext';
import { useAuth } from '../../contextos/AuthContext';
import { ProductImage } from '../../componentes/GaleriaProducto/ProductImage';
import { confirmAction } from '../../utilidades/alerts';
import { experienceService } from '../../servicios/experienceService';

export const MySauzCloset = ({ onProductSelect, setActivePage }) => {
  const { products, formatMoney, addToCart, showToast } = useCart();
  const { user, setIsLoginOpen } = useAuth();

  const [activeTab, setActiveTab] = useState('outfits'); // 'outfits' | 'wishlist'
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Cargar outfits del usuario
  const loadUserCloset = () => {
    setLoading(true);
    experienceService
      .getClosetOutfits({ userId: user?.id, email: user?.email })
      .then((list) => {
        if (list.length) setOutfits(list);
      })
      .catch((e) => console.error('Error cargando closet:', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUserCloset();
  }, [user]);

  // Eliminar outfit
  const handleDeleteOutfit = async (id) => {
    const confirmed = await confirmAction({
      title: 'Eliminar outfit',
      text: '¿Deseas eliminar este outfit de tu armario?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      danger: true,
    });
    if (!confirmed) return;
    try {
      await experienceService.deleteClosetOutfit(id);
      setOutfits((prev) => prev.filter((o) => o.id !== id));
      showToast('Outfit eliminado de tu closet');
    } catch (e) {
      showToast('Error al eliminar outfit');
    }
  };

  // Copiar enlace seguro de compartir
  const handleShareOutfit = (outfit) => {
    const shareUrl = `${window.location.origin}/closet?outfitId=${outfit.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedId(outfit.id);
    showToast('🔗 Enlace del outfit copiado al portapapeles');
    setTimeout(() => setCopiedId(null), 3000);
  };

  // Agregar todo el outfit al carrito
  const handleAddOutfitToCart = (outfit) => {
    let count = 0;
    const slotKeys = ['top', 'bottom', 'sneakers', 'cap'];
    slotKeys.forEach((key) => {
      const itemData = outfit.slots?.[key];
      if (itemData?.productId) {
        const prod = products.find((p) => p.id === itemData.productId);
        if (prod && prod.price > 0) {
          addToCart(prod, 1, itemData.size, itemData.color);
          count++;
        }
      }
    });
    if (count > 0) {
      showToast(`🛍️ ${count} prendas del outfit agregadas al carrito`);
    } else {
      showToast('Las prendas de este outfit están pendientes de precio comercial.');
    }
  };

  return (
    <div
      className="my-sauz-closet"
      style={{
        paddingTop: 'calc(var(--edition-header-h, 84px) + 24px)',
        paddingBottom: '80px',
        paddingInline: '5%',
        maxWidth: '1280px',
        marginInline: 'auto',
        color: '#ffffff',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <span style={{ fontSize: '0.74rem', color: '#ff1724', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
            MY SAUZ CLOSET · ARMARIO DIGITAL PRIVADO
          </span>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '900', margin: 0, textTransform: 'uppercase' }}>
            Mis Outfits & Favoritos
          </h1>
          <p style={{ margin: '6px 0 0', color: '#8e8e99', fontSize: '0.92rem' }}>
            Gestiona tus combinaciones urbanas guardadas, organízalas en tu rotación y compártelas con amigos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActivePage('fitBuilder')}
          style={{
            padding: '12px 20px',
            background: '#ff1724',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.84rem',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          <Plus size={16} />
          <span>Crear Nuevo Look</span>
        </button>
      </div>

      {!user && (
        <div style={{ background: '#141418', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Lock size={18} color="#ff1724" />
            <span style={{ fontSize: '0.85rem', color: '#d1d1d6' }}>Inicia sesión para sincronizar tu armario digital en todos tus dispositivos.</span>
          </div>
          <button
            type="button"
            onClick={() => setIsLoginOpen(true)}
            style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}
          >
            Iniciar Sesión
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', gap: '12px', marginBottom: '28px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('outfits')}
          style={{
            padding: '12px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'outfits' ? '2px solid #ff1724' : '2px solid transparent',
            color: activeTab === 'outfits' ? '#fff' : '#8e8e99',
            fontWeight: '700',
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          Outfits Guardados ({outfits.length})
        </button>
      </div>

      {/* Listado de Outfits */}
      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px', color: '#8e8e99' }}>Cargando tu armario digital...</p>
      ) : outfits.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#121215', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '14px' }}>🧥</span>
          <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>Tu closet aún está vacío</h4>
          <p style={{ margin: '8px auto 20px', color: '#8e8e99', fontSize: '0.9rem', maxWidth: '420px' }}>
            Arma tu primera combinación en el Fit Builder y guárdala aquí para tenerla siempre lista.
          </p>
          <button
            type="button"
            onClick={() => setActivePage('fitBuilder')}
            style={{ padding: '10px 22px', background: '#ff1724', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.84rem', fontWeight: '700', cursor: 'pointer' }}
          >
            Ir al Fit Builder ↗
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {outfits.map((outfit) => {
            const slotItems = ['top', 'bottom', 'sneakers', 'cap']
              .map((k) => {
                const s = outfit.slots?.[k];
                if (!s?.productId) return null;
                const prod = products.find((p) => p.id === s.productId);
                return { key: k, slot: s, product: prod };
              })
              .filter(Boolean);

            return (
              <div
                key={outfit.id}
                style={{
                  background: '#131317',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: '#ff1724', fontWeight: '700', textTransform: 'uppercase' }}>
                        {outfit.style || 'Streetwear'}
                      </span>
                      <h4 style={{ margin: '2px 0 0', fontSize: '1.05rem', fontWeight: '800', color: '#fff' }}>
                        {outfit.name}
                      </h4>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleShareOutfit(outfit)}
                        title="Compartir outfit"
                        style={{ padding: '6px', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '6px', color: copiedId === outfit.id ? '#4ade80' : '#8e8e99', cursor: 'pointer' }}
                      >
                        {copiedId === outfit.id ? <Check size={14} /> : <Share2 size={14} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteOutfit(outfit.id)}
                        title="Eliminar outfit"
                        style={{ padding: '6px', background: 'rgba(255, 23, 36,0.1)', border: 'none', borderRadius: '6px', color: '#ff1724', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Grid de miniaturas de prendas del outfit */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBlock: '14px' }}>
                    {slotItems.map((item) => (
                      <div
                        key={item.key}
                        onClick={() => item.product && onProductSelect(item.product.id)}
                        style={{
                          background: '#0a0a0c',
                          borderRadius: '8px',
                          padding: '6px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ width: '100%', height: '54px', overflow: 'hidden' }}>
                          <ProductImage mode="thumb" src={item.product?.image} alt={item.product?.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <span style={{ fontSize: '0.62rem', color: '#8e8e99', marginTop: '4px', textTransform: 'uppercase' }}>
                          {item.key}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#8e8e99', display: 'block' }}>Subtotal:</span>
                    <strong style={{ fontSize: '1.05rem', color: '#fff' }}>
                      {formatMoney(outfit.subtotalCOP || 0)}
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddOutfitToCart(outfit)}
                    style={{
                      padding: '8px 14px',
                      background: '#fff',
                      color: '#000',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <ShoppingBag size={14} />
                    <span>Comprar Look</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
