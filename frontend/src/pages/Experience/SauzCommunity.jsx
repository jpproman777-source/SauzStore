import React, { useState, useEffect } from 'react';
import { Heart, Plus, Flag, Trophy, Sparkles, MapPin, Check, MessageSquare, Tag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ProductImage } from '../../components/catalog/ProductImage';
import { confirmAction } from '../../lib/alerts';
import { experienceService } from '../../services/experienceService';

export const SauzCommunity = ({ onProductSelect }) => {
  const { products, showToast } = useCart();
  const { user, setIsLoginOpen } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Formulario nuevo look
  const [newTitle, setNewTitle] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newCity, setNewCity] = useState('Medellín');
  const [newPhoto, setNewPhoto] = useState('/Productos/sauz-015.png');
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const loadPosts = () => {
    setLoading(true);
    experienceService
      .getCommunityPosts()
      .then((list) => {
        if (list.length) setPosts(list);
      })
      .catch((e) => console.error('Error cargando posts:', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // Votar por un look
  const handleVote = async (postId) => {
    try {
      const data = await experienceService.voteCommunityPost(postId, user?.email || 'anon');
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, votes: data.votes } : p))
      );
    } catch (e) {
      showToast('Error al votar');
    }
  };

  // Reportar publicación para moderación
  const handleReport = async (postId) => {
    const confirmed = await confirmAction({
      title: 'Reportar publicación',
      text: '¿Deseas enviar esta publicación para revisión de moderación?',
      confirmText: 'Reportar',
      cancelText: 'Cancelar',
      danger: true,
    });
    if (!confirmed) return;
    try {
      await experienceService.reportCommunityPost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      showToast('Publicación enviada al equipo de moderación');
    } catch (e) {
      showToast('Error al reportar');
    }
  };

  // Publicar look
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('⚠️ Ingresa un título para tu look');
      return;
    }
    setSubmitting(true);
    try {
      await experienceService.createCommunityPost({
        userId: user?.id || null,
        authorName: user?.name || 'Miembro SAUZ',
        city: newCity.trim(),
        title: newTitle.trim(),
        caption: newCaption.trim(),
        photo: newPhoto,
        taggedProducts: selectedTagIds,
      });

      showToast('🎉 Look publicado en la comunidad SAUZ');
      setShowCreateModal(false);
      setNewTitle('');
      setNewCaption('');
      setSelectedTagIds([]);
      loadPosts();
    } catch (err) {
      showToast(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fitOfTheWeek = posts.find((p) => p.isFitOfTheWeek) || posts[0];

  return (
    <div
      className="sauz-community"
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '36px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '20px', background: 'rgba(255, 23, 36,0.12)', border: '1px solid rgba(255, 23, 36,0.3)', marginBottom: '10px' }}>
            <Sparkles size={14} color="#ff1724" />
            <span style={{ fontSize: '0.74rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#ff1724' }}>
              SAUZ COMMUNITY · STREET STYLE & CULTURA URBANA
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '900', margin: 0, textTransform: 'uppercase' }}>
            Comunidad Urbana SAUZ
          </h1>
          <p style={{ margin: '6px 0 0', color: '#8e8e99', fontSize: '0.92rem' }}>
            Descubre combinaciones reales de la calle creadas por la comunidad, vota por tu look favorito e inspírate con prendas auténticas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!user) {
              setIsLoginOpen(true);
            } else {
              setShowCreateModal(true);
            }
          }}
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
          <span>Compartir Mi Look</span>
        </button>
      </div>

      {/* Fit of the Week Destacado */}
      {fitOfTheWeek && (
        <div
          style={{
            background: 'linear-gradient(135deg, #181822 0%, #0d0d10 100%)',
            border: '1.5px solid rgba(255, 23, 36,0.4)',
            borderRadius: '16px',
            padding: '28px',
            marginBottom: '40px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '28px',
            alignItems: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.85), 0 0 24px rgba(255, 23, 36,0.12)',
          }}
        >
          <div style={{ width: '100%', height: '320px', background: '#000', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ProductImage mode="catalog" src={fitOfTheWeek.photo} alt={fitOfTheWeek.title} style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
          </div>

          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 23, 36,0.2)', border: '1px solid #ff1724', padding: '4px 10px', borderRadius: '20px', marginBottom: '12px' }}>
              <Trophy size={14} color="#ff1724" />
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#ff1724', textTransform: 'uppercase' }}>
                FIT OF THE WEEK · SELECCIÓN EDITORIAL
              </span>
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '0 0 8px' }}>
              {fitOfTheWeek.title}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#8e8e99', marginBottom: '14px' }}>
              <span>Por <strong>{fitOfTheWeek.authorName}</strong></span>
              <span>·</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><MapPin size={12} /> {fitOfTheWeek.city}</span>
            </div>

            <p style={{ color: '#d1d1d6', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 20px' }}>
              {fitOfTheWeek.caption}
            </p>

            {/* Prendas etiquetadas */}
            {fitOfTheWeek.taggedProducts && fitOfTheWeek.taggedProducts.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '0.74rem', color: '#8e8e99', textTransform: 'uppercase', fontWeight: '700', display: 'block', marginBottom: '8px' }}>
                  Prendas del Catálogo Usadas:
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {fitOfTheWeek.taggedProducts.map((pId) => {
                    const prod = products.find((p) => p.id === pId);
                    if (!prod) return null;
                    return (
                      <button
                        key={pId}
                        type="button"
                        onClick={() => onProductSelect(prod.id)}
                        style={{
                          padding: '6px 10px',
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '6px',
                          color: '#fff',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Tag size={12} color="#ff1724" />
                        <span>{prod.name} ↗</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <button
                type="button"
                onClick={() => handleVote(fitOfTheWeek.id)}
                style={{
                  padding: '10px 18px',
                  background: 'rgba(255, 23, 36,0.15)',
                  border: '1px solid #ff1724',
                  borderRadius: '8px',
                  color: '#ff1724',
                  fontSize: '0.85rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Heart size={16} fill="#ff1724" />
                <span>{fitOfTheWeek.votes} Votos</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feed de la Comunidad */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>
          Rotación de la Calle (Todos los Looks)
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {posts.map((post) => (
          <div
            key={post.id}
            style={{
              background: '#121216',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ position: 'relative', width: '100%', height: '220px', background: '#09090b', borderRadius: '10px', overflow: 'hidden', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ProductImage mode="catalog" src={post.photo} alt={post.title} style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
                <span style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', color: '#fff' }}>
                  📍 {post.city}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#fff' }}>
                  {post.title}
                </h4>
                <button
                  type="button"
                  onClick={() => handleReport(post.id)}
                  title="Reportar para moderación"
                  style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: '2px' }}
                >
                  <Flag size={12} />
                </button>
              </div>

              <div style={{ fontSize: '0.75rem', color: '#8e8e99', marginBottom: '10px' }}>
                Por {post.authorName}
              </div>

              <p style={{ margin: '0 0 14px', fontSize: '0.82rem', color: '#d1d1d6', lineHeight: 1.45 }}>
                {post.caption}
              </p>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => handleVote(post.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ff1724',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: 0,
                }}
              >
                <Heart size={15} fill="#ff1724" />
                <span>{post.votes} votos</span>
              </button>

              {post.taggedProducts && post.taggedProducts.length > 0 && (
                <button
                  type="button"
                  onClick={() => onProductSelect(post.taggedProducts[0])}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>Ver prendas usadas ↗</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal para Crear Post */}
      {showCreateModal && (
        <div className="modal-backdrop open" role="dialog" aria-modal="true" style={{ zIndex: 10010 }}>
          <div
            className="modal-card"
            style={{
              maxWidth: '520px',
              width: '92%',
              background: '#121216',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '28px',
              color: '#fff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>
                Compartir Mi Look con la Comunidad
              </h4>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: '#8e8e99', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: '#a1a1aa', fontWeight: '700', marginBottom: '4px' }}>
                  Título del Look *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  placeholder="Ej. Tonal Black en la estación Universidad"
                  style={{ width: '100%', padding: '9px 12px', background: '#18181f', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: '#fff', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: '#a1a1aa', fontWeight: '700', marginBottom: '4px' }}>
                  Ciudad
                </label>
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder="Medellín, Bogotá, Cali..."
                  style={{ width: '100%', padding: '9px 12px', background: '#18181f', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: '#fff', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: '#a1a1aa', fontWeight: '700', marginBottom: '4px' }}>
                  Descripción / Desglose del Estilo
                </label>
                <textarea
                  rows="3"
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="Cuéntale a la comunidad qué prendas usaste y por qué combinan..."
                  style={{ width: '100%', padding: '9px 12px', background: '#18181f', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: '#a1a1aa', fontWeight: '700', marginBottom: '4px' }}>
                  Fotografía de Presentación
                </label>
                <select
                  value={newPhoto}
                  onChange={(e) => setNewPhoto(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: '#18181f', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                >
                  <option value="/Productos/sauz-015.png">Zapatillas Jordan Retro</option>
                  <option value="/Productos/Monastery_lado1.png">Hoodie Monastery</option>
                  <option value="/Productos/sauz-019.png">Chaqueta Adidas</option>
                  <option value="/Productos/sauz-029.png">Gorra SAUZ Black</option>
                  <option value="/Productos/sauz-058.png">Pantalón Cargo Nike</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: '8px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#8e8e99', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '8px 18px', background: '#ff1724', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '800', fontSize: '0.82rem', cursor: submitting ? 'wait' : 'pointer' }}
                >
                  {submitting ? 'Publicando...' : 'Publicar en Comunidad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
