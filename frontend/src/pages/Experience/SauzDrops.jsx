import React, { useState, useEffect } from 'react';
import { Clock, Bell, Check, Sparkles, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ProductImage } from '../../components/catalog/ProductImage';
import { experienceService } from '../../services/experienceService';

// Componente de cuenta regresiva
const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      {[
        { label: 'DÍAS', val: timeLeft.days },
        { label: 'HRS', val: timeLeft.hours },
        { label: 'MIN', val: timeLeft.minutes },
        { label: 'SEG', val: timeLeft.seconds },
      ].map((u) => (
        <div
          key={u.label}
          style={{
            background: '#0e0e12',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '6px',
            padding: '6px 8px',
            textAlign: 'center',
            minWidth: '42px',
          }}
        >
          <div style={{ fontSize: '1rem', fontWeight: '800', color: '#ff1724', fontFamily: 'var(--font-mono)' }}>
            {String(u.val).padStart(2, '0')}
          </div>
          <div style={{ fontSize: '0.6rem', color: '#8e8e99', fontWeight: '700' }}>
            {u.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export const SauzDrops = () => {
  const { formatMoney, showToast } = useCart();
  const { user } = useAuth();

  const [drops, setDrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState(user?.email || '');
  const [selectedDrop, setSelectedDrop] = useState(null);
  const [submittingWaitlist, setSubmittingWaitlist] = useState(false);

  useEffect(() => {
    setLoading(true);
    experienceService
      .getDrops()
      .then((list) => {
        if (list.length) setDrops(list);
      })
      .catch((e) => console.error('Error cargando drops:', e))
      .finally(() => setLoading(false));
  }, []);

  const handleJoinWaitlist = async (e) => {
    e.preventDefault();
    if (!waitlistEmail || !waitlistEmail.includes('@')) {
      showToast('⚠️ Ingresa un correo electrónico válido');
      return;
    }
    setSubmittingWaitlist(true);
    try {
      const data = await experienceService.joinDropWaitlist(selectedDrop.id, waitlistEmail);

      showToast(data.message || '¡Te has unido a la lista de espera oficial!');
      // Actualizar conteo local
      setDrops((prev) =>
        prev.map((d) => (d.id === selectedDrop.id ? { ...d, waitlistCount: data.waitlistCount } : d))
      );
      setSelectedDrop(null);
    } catch (err) {
      showToast(err.message);
    } finally {
      setSubmittingWaitlist(false);
    }
  };

  return (
    <div
      className="sauz-drops"
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
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '20px', background: 'rgba(255, 23, 36,0.12)', border: '1px solid rgba(255, 23, 36,0.3)', marginBottom: '12px' }}>
          <Clock size={14} color="#ff1724" />
          <span style={{ fontSize: '0.74rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#ff1724' }}>
            SAUZ DROPS · CALENDARIO DE LANZAMIENTOS OFICIALES
          </span>
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '900', margin: 0, textTransform: 'uppercase' }}>
          Próximos Lanzamientos Exclusivos
        </h1>
        <p style={{ margin: '8px auto 0', color: '#8e8e99', fontSize: '0.95rem', maxWidth: '640px' }}>
          Asegura tu lugar en la lista de espera con acceso preferente para los lanzamientos más codiciados de sneakers, gorras y moda urbana en Colombia.
        </p>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px', color: '#8e8e99' }}>Cargando calendario de drops...</p>
      ) : drops.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#121215', borderRadius: '16px' }}>
          <p style={{ color: '#8e8e99' }}>No hay drops programados en este momento. Vuelve pronto.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
          {drops.map((drop) => {
            const dateStr = new Date(drop.releaseDate).toLocaleDateString('es-CO', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={drop.id}
                style={{
                  background: '#121216',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                }}
              >
                <div>
                  {/* Foto del Drop */}
                  <div style={{ position: 'relative', width: '100%', height: '220px', background: '#09090b', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ProductImage mode="catalog" src={drop.image} alt={drop.name} style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
                    <span style={{ position: 'absolute', top: '12px', left: '12px', background: '#ff1724', color: '#fff', fontSize: '0.68rem', fontWeight: '800', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                      {drop.brand}
                    </span>
                  </div>

                  {/* Info */}
                  <span style={{ fontSize: '0.72rem', color: '#8e8e99', textTransform: 'uppercase', fontWeight: '700' }}>
                    {drop.category} · Lanzamiento programado
                  </span>
                  <h3 style={{ margin: '4px 0 8px', fontSize: '1.15rem', fontWeight: '800', lineHeight: 1.3 }}>
                    {drop.name}
                  </h3>
                  <p style={{ margin: '0 0 14px', fontSize: '0.82rem', color: '#a1a1aa', lineHeight: 1.45 }}>
                    {drop.description}
                  </p>

                  <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fff', marginBottom: '16px' }}>
                    {formatMoney(drop.priceCOP)}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                  <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: '#8e8e99' }}>Cuenta regresiva:</span>
                    <span style={{ fontSize: '0.72rem', color: '#ff1724', fontWeight: '700' }}>
                      🔥 {drop.waitlistCount} en lista de espera
                    </span>
                  </div>

                  <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                    <CountdownTimer targetDate={drop.releaseDate} />
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedDrop(drop)}
                    style={{
                      width: '100%',
                      padding: '13px',
                      background: '#fff',
                      color: '#000',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '800',
                      fontSize: '0.84rem',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <Bell size={16} />
                    <span>Unirme a la Lista de Espera</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Lista de Espera */}
      {selectedDrop && (
        <div className="modal-backdrop open" role="dialog" aria-modal="true" style={{ zIndex: 10010 }}>
          <div
            className="modal-card"
            style={{
              maxWidth: '460px',
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
                Lista de Espera SAUZ Drops
              </h4>
              <button
                type="button"
                onClick={() => setSelectedDrop(null)}
                style={{ background: 'none', border: 'none', color: '#8e8e99', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ margin: '0 0 16px', fontSize: '0.86rem', color: '#a1a1aa' }}>
              Regístrate para recibir notificación 15 minutos antes de la apertura pública de <strong>{selectedDrop.name}</strong>.
            </p>

            <form onSubmit={handleJoinWaitlist} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: '#a1a1aa', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  required
                  placeholder="tu@correo.com"
                  style={{ width: '100%', padding: '10px 14px', background: '#18181f', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem' }}
                />
              </div>

              <button
                type="submit"
                disabled={submittingWaitlist}
                style={{
                  padding: '12px',
                  background: '#ff1724',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '800',
                  fontSize: '0.88rem',
                  cursor: submittingWaitlist ? 'wait' : 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {submittingWaitlist ? 'Registrando...' : 'Confirmar Registro en Drop'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
