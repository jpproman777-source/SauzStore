import React, { useState, useMemo } from 'react';
import { Sparkles, Check, ArrowRight, RefreshCw, ShoppingBag, Eye, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ProductImage } from '../../components/catalog/ProductImage';
import { experienceService } from '../../services/experienceService';

const PROFILES = {
  'Dark Essentials': {
    title: 'Dark Essentials',
    tagline: 'Monocromático, estructurado y letal.',
    description: 'Tu estilo se fundamenta en siluetas limpias donde el negro y los tonos carbón protagonizan cada look. Valoras la densidad de los tejidos, los hoodies pesados de 450 gsm y sneakers icónicos que contrasten con sutiles acentos oscuros.',
    keywords: ['All-Black', 'Heavyweight Fleece', 'Monastery', 'Jordan Retro'],
    accent: '#ff1724',
    preferredCategory: 'Sudaderas',
    brand: 'SAUZ',
  },
  'Street Minimal': {
    title: 'Street Minimal',
    tagline: 'Minimalismo contemporáneo con acentos gráficos sobrios.',
    description: 'Equilibrio perfecto entre prendas lisas, camisetas pesadas con tipografía discreta y zapatillas de caña baja o media. Priorizas la comodidad arquitectónica y la versatilidad urbana día y noche.',
    keywords: ['Boxy Tees', 'Nike Tech', 'Low Dunks', 'Clean Silhouette'],
    accent: '#38bdf8',
    preferredCategory: 'Camisetas',
    brand: 'Nike',
  },
  'Urban Tech': {
    title: 'Urban Tech',
    tagline: 'Utilidad táctica, bolsillos cargo y resistencia.',
    description: 'Enfocado en la funcionalidad urbana. Pantalones cargo con compartimentos, chaquetas cortavientos y tejidos técnicos preparados para el clima de la ciudad sin sacrificar un gramo de actitud.',
    keywords: ['Cargos', 'Windbreaker', 'Tracksuits', 'Resistencia'],
    accent: '#4ade80',
    preferredCategory: 'Pantalones',
    brand: 'Adidas',
  },
  'Retro Sport': {
    title: 'Retro Sport',
    tagline: 'Herencia de las canchas de básquetbol y estética noventera.',
    description: 'Inspirado en la era dorada del deporte urbano. Chaquetas retro con las tres rayas, siluetas clásicas de Jordan, gorras de visera plana de la MLB y mezclas de colores con historia.',
    keywords: ['Jordan 1', 'New Era 59FIFTY', 'Three-Stripes', 'Heritage'],
    accent: '#f59e0b',
    preferredCategory: 'Zapatillas',
    brand: 'Jordan',
  },
};

const QUESTIONS = [
  {
    id: 'palette',
    title: '¿Cuál es tu paleta de color dominante?',
    subtitle: 'Elige la gama tonal que mejor define tu rotación diaria.',
    options: [
      { id: 'dark', text: 'Negro profundo, carbón y texturas tonales', profile: 'Dark Essentials' },
      { id: 'minimal', text: 'Blanco, hueso, gris y acentos discretos', profile: 'Street Minimal' },
      { id: 'tech', text: 'Verde oliva, caqui, grafito y tonos utilitarios', profile: 'Urban Tech' },
      { id: 'retro', text: 'Contrastes deportivos clásicos (Rojo, Azul Royal, Blanco)', profile: 'Retro Sport' },
    ],
  },
  {
    id: 'silhouette',
    title: '¿Qué corte y caída prefieres en tus prendas?',
    subtitle: 'La silueta define la presencia de tu outfit.',
    options: [
      { id: 'heavy_box', text: 'Oversize estructurado y hombros caídos con tejido pesado', profile: 'Dark Essentials' },
      { id: 'relaxed_clean', text: 'Boxy fit limpio y proporciones naturales', profile: 'Street Minimal' },
      { id: 'tactical_tapered', text: 'Pantalones cargo con bota ajustable o jogger técnico', profile: 'Urban Tech' },
      { id: 'athletic_heritage', text: 'Corte deportivo holgado tradicional de los 90s', profile: 'Retro Sport' },
    ],
  },
  {
    id: 'hero_piece',
    title: '¿Cuál es tu pieza central indispensable?',
    subtitle: 'La prenda sobre la cual construyes todo el resto del look.',
    options: [
      { id: 'hoodie', text: 'Un hoodie negro de gramaje alto con capucha amplia', profile: 'Dark Essentials' },
      { id: 'graphic_tee', text: 'Una camiseta pesada de cuello grueso y caída cuadrada', profile: 'Street Minimal' },
      { id: 'outerwear', text: 'Una chaqueta bomber o windbreaker con cremalleras técnicas', profile: 'Urban Tech' },
      { id: 'sneaker_retro', text: 'Unas Jordan Retro o sneakers con historia en el asfalto', profile: 'Retro Sport' },
    ],
  },
  {
    id: 'accessory',
    title: '¿Qué accesorio remata tu estética?',
    subtitle: 'El detalle final que cierra tu presencia en la calle.',
    options: [
      { id: 'cap_black', text: 'Gorra negra tonal o gorro de lana minimalista', profile: 'Dark Essentials' },
      { id: 'subtle_tote', text: 'Gorra clásica de perfil bajo o detalles discretos', profile: 'Street Minimal' },
      { id: 'tactical_bag', text: 'Chest bag, riñonera cruzada o morral técnico', profile: 'Urban Tech' },
      { id: 'fitted_cap', text: 'Gorra New Era 59FIFTY oficial de béisbol con visera plana', profile: 'Retro Sport' },
    ],
  },
];

export const SauzStyleDna = ({ onProductSelect, setActivePage }) => {
  const { products, formatMoney, showToast } = useCart();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [resultProfileKey, setResultProfileKey] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSelectOption = (questionId, profileName) => {
    const nextAnswers = { ...answers, [questionId]: profileName };
    setAnswers(nextAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calcular perfil más votado
      const counts = {};
      Object.values(nextAnswers).forEach((p) => {
        counts[p] = (counts[p] || 0) + 1;
      });

      let winner = 'Dark Essentials';
      let maxCount = -1;
      for (const [prof, count] of Object.entries(counts)) {
        if (count > maxCount) {
          maxCount = count;
          winner = prof;
        }
      }
      setResultProfileKey(winner);
      savePreferences(winner, nextAnswers);
    }
  };

  const savePreferences = async (profileName, allAnswers) => {
    setSaving(true);
    try {
      await experienceService.saveStyleDna({
        userId: user?.id || null,
        email: user?.email || '',
        styleDna: {
          profile: profileName,
          answers: allAnswers,
          updatedAt: new Date().toISOString(),
        },
      });
      showToast(`🧬 Perfil ${profileName} guardado en tu cuenta`);
    } catch (e) {
      console.warn('Error guardando Style DNA:', e);
    } finally {
      setSaving(false);
    }
  };

  const currentQuestion = QUESTIONS[currentStep];
  const activeResult = resultProfileKey ? PROFILES[resultProfileKey] : null;

  // Productos recomendados reales según el perfil
  const recommendedProducts = useMemo(() => {
    if (!activeResult) return [];
    let matches = products.filter((p) => p.category === activeResult.preferredCategory || p.brand === activeResult.brand);
    if (matches.length < 4) {
      matches = products.filter((p) => p.commercial !== false);
    }
    return matches.slice(0, 4);
  }, [activeResult, products]);

  const handleReset = () => {
    setAnswers({});
    setCurrentStep(0);
    setResultProfileKey(null);
  };

  return (
    <div
      className="sauz-style-dna"
      style={{
        paddingTop: 'calc(var(--edition-header-h, 84px) + 24px)',
        paddingBottom: '80px',
        paddingInline: '5%',
        maxWidth: '1200px',
        marginInline: 'auto',
        color: '#ffffff',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '20px', background: 'rgba(255, 23, 36,0.12)', border: '1px solid rgba(255, 23, 36,0.3)', marginBottom: '12px' }}>
          <Sparkles size={14} color="#ff1724" />
          <span style={{ fontSize: '0.74rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#ff1724' }}>
            SAUZ STYLE DNA · TEST VISUAL DE IDENTIDAD URBANA
          </span>
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '800', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
          Descubre Tu Fórmula de Estilo
        </h1>
        <p style={{ margin: '8px auto 0', color: '#8e8e99', fontSize: '0.95rem', maxWidth: '640px' }}>
          Responde 4 preguntas visuales sobre siluetas, paletas y prendas clave para recibir recomendaciones hiper-personalizadas de nuestro catálogo masculino.
        </p>
      </div>

      {!activeResult ? (
        /* ================= CUESTIONARIO ACTIVO ================= */
        <div
          style={{
            maxWidth: '680px',
            marginInline: 'auto',
            background: '#121216',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
          }}
        >
          {/* Barra de Progreso */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '0.78rem', color: '#8e8e99' }}>
            <span>Paso {currentStep + 1} de {QUESTIONS.length}</span>
            <span>{Math.round(((currentStep + 1) / QUESTIONS.length) * 100)}% Completado</span>
          </div>
          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden', marginBottom: '28px' }}>
            <div
              style={{
                width: `${((currentStep + 1) / QUESTIONS.length) * 100}%`,
                height: '100%',
                background: '#ff1724',
                transition: 'width 0.3s ease',
              }}
            />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 6px' }}>
            {currentQuestion.title}
          </h3>
          <p style={{ fontSize: '0.86rem', color: '#8e8e99', margin: '0 0 24px' }}>
            {currentQuestion.subtitle}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentQuestion.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectOption(currentQuestion.id, opt.profile)}
                style={{
                  padding: '16px 20px',
                  borderRadius: '10px',
                  background: '#18181f',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#ffffff',
                  textAlign: 'left',
                  fontSize: '0.92rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#ff1724';
                  e.currentTarget.style.background = '#202028';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.background = '#18181f';
                }}
              >
                <span>{opt.text}</span>
                <ArrowRight size={16} color="#ff1724" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* ================= RESULTADO DEL TEST ================= */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
          <div
            style={{
              background: 'radial-gradient(circle at 50% 10%, #1e1e28 0%, #0d0d10 80%)',
              border: `1.5px solid ${activeResult.accent}`,
              borderRadius: '20px',
              padding: '36px',
              textAlign: 'center',
              boxShadow: `0 25px 60px rgba(0,0,0,0.9), 0 0 30px ${activeResult.accent}20`,
            }}
          >
            <span style={{ fontSize: '0.78rem', color: activeResult.accent, fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              TU IDENTIDAD DE ESTILO CONFIRMADA
            </span>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '900', margin: '8px 0', textTransform: 'uppercase' }}>
              {activeResult.title}
            </h2>
            <div style={{ fontSize: '1.1rem', color: '#d1d1d6', fontStyle: 'italic', marginBottom: '16px' }}>
              "{activeResult.tagline}"
            </div>
            <p style={{ maxWidth: '720px', margin: '0 auto 24px', color: '#a1a1aa', fontSize: '0.95rem', lineHeight: 1.6 }}>
              {activeResult.description}
            </p>

            {/* Keywords */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '28px' }}>
              {activeResult.keywords.map((kw) => (
                <span
                  key={kw}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    background: 'rgba(255,255,255,0.08)',
                    fontSize: '0.76rem',
                    fontWeight: '700',
                    color: '#fff',
                  }}
                >
                  #{kw}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  padding: '10px 18px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <RefreshCw size={14} />
                <span>Repetir Test</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePage('fitBuilder')}
                style={{
                  padding: '10px 24px',
                  background: '#ff1724',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <span>Armar Look en Fit Builder ↗</span>
              </button>
            </div>
          </div>

          {/* Recomendaciones Reales del Catálogo para este Perfil */}
          <div>
            <div style={{ marginBottom: '18px' }}>
              <span style={{ fontSize: '0.72rem', color: '#ff1724', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                CURADURÍA PERSONALIZADA
              </span>
              <h3 style={{ margin: '4px 0 0', fontSize: '1.3rem', fontWeight: '800' }}>
                Prendas Recomendadas para tu Perfil {activeResult.title}
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              {recommendedProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onProductSelect(p.id)}
                  style={{
                    background: '#131317',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ width: '100%', height: '180px', background: '#000', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px' }}>
                    <ProductImage mode="catalog" src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: '#ff1724', textTransform: 'uppercase', fontWeight: '700' }}>
                      {p.brand || 'SAUZ'}
                    </span>
                    <strong style={{ fontSize: '0.92rem', color: '#fff', display: 'block', margin: '4px 0' }}>
                      {p.name}
                    </strong>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff', marginTop: '6px' }}>
                      {p.price > 0 ? formatMoney(p.price) : 'Precio comercial por confirmar'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
