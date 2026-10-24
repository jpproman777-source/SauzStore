import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, ShieldCheck, AlertCircle, Loader2, User, Phone, MapPin, CheckCircle2 } from 'lucide-react';

export const AdminLogin = ({ setActivePage }) => {
  const { user, login, register, logout, authLoading, authError, setAuthError } = useAuth();
  const { showToast } = useCart();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Medellín');
  const [showPassword, setShowPassword] = useState(false);
  const [customError, setCustomError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCustomError(null);
    if (setAuthError) setAuthError(null);

    try {
      if (mode === 'login') {
        if (!email.trim() || !password) {
          setCustomError('Por favor ingrese su correo electrónico y contraseña.');
          return;
        }

        const loggedUser = await login(email.trim(), password);
        
        if (loggedUser.role === 'admin') {
          showToast('Bienvenido al Panel de Administración');
          if (typeof window !== 'undefined' && window.history) {
            window.history.pushState(null, '', '/admin');
          }
          setActivePage('admin');
        } else {
          showToast(`Bienvenido a Sauz Store, ${loggedUser.name}`);
          if (typeof window !== 'undefined' && window.history) {
            window.history.pushState(null, '', '/');
          }
          setActivePage('home');
        }
      } else {
        if (!name.trim() || !email.trim() || !password) {
          setCustomError('Nombre, correo y contraseña son obligatorios.');
          return;
        }

        const newUser = await register({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim()
        });

        showToast(`Cuenta creada con éxito, ${newUser.name}`);
        if (typeof window !== 'undefined' && window.history) {
          window.history.pushState(null, '', '/');
        }
        setActivePage('home');
      }
    } catch (err) {
      setCustomError(err.message || 'Error de autenticación. Verifique los datos ingresados.');
    }
  };

  const handleFillAdminDemo = () => {
    setMode('login');
    setEmail('admin@sauzstore.com');
    setPassword('admin123');
    setCustomError(null);
  };

  const handleFillClientDemo = () => {
    setMode('login');
    setEmail('cliente@sauzstore.com');
    setPassword('cliente123');
    setCustomError(null);
  };

  const handleGoStore = () => {
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState(null, '', '/');
    }
    setActivePage('home');
  };

  const displayError = customError || authError;

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        backgroundColor: '#FFFFFF',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: '#171717'
      }}
    >
      {/* ==============================================================
          ZONA VISUAL EDITORIAL (IZQUIERDA EN DESKTOP)
          ============================================================== */}
      <div
        style={{
          flex: '1 1 50%',
          backgroundColor: '#0A0A0A',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 'clamp(32px, 5vw, 64px)',
          overflow: 'hidden'
        }}
        className="admin-login-visual-zone"
      >
        {/* Fondo sutil de imagen editorial de moda */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: "url('/Productos/Monastery_lado1.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            opacity: 0.15,
            filter: 'grayscale(100%) contrast(120%)',
            pointerEvents: 'none'
          }}
        />

        {/* Gradiente de superposición para legibilidad editorial */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.92) 50%, #0A0A0A 100%)',
            pointerEvents: 'none'
          }}
        />

        {/* Cabecera superior de marca */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                backgroundColor: '#FFFFFF',
                borderRadius: '50%',
                display: 'inline-block'
              }}
            />
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: '700',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: '#FFFFFF'
              }}
            >
              SAUZ STORE
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#737373', fontWeight: '500' }}>
            Haute Streetwear · Colombia
          </span>
        </div>

        {/* Contenido central editorial */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '520px', margin: '48px 0' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '6px',
              color: '#F6F6F6',
              fontSize: '0.72rem',
              fontWeight: '600',
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              marginBottom: '24px'
            }}
          >
            <ShieldCheck size={14} strokeWidth={2} />
            <span>Portal de Acceso Único</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.9rem, 3.2vw, 2.75rem)',
              fontWeight: '800',
              lineHeight: 1.15,
              color: '#FFFFFF',
              letterSpacing: '-0.03em',
              margin: '0 0 18px 0'
            }}
          >
            Moda de vanguardia, control operativo y gestión exclusiva.
          </h1>

          <p
            style={{
              fontSize: '0.95rem',
              lineHeight: 1.6,
              color: '#A3A3A3',
              margin: 0,
              fontWeight: '400'
            }}
          >
            Accede con tus credenciales de Administrador o Cliente para gestionar el panel ejecutivo, realizar pedidos y revisar el historial de compras.
          </p>
        </div>

        {/* Pie editorial inferior */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: '#737373'
          }}
        >
          <span>Sauz Store Colombia © {new Date().getFullYear()}</span>
          <span>Acceso Seguro y Cifrado</span>
        </div>
      </div>

      {/* ==============================================================
          ZONA DE ACCESO / FORMULARIO (DERECHA)
          ============================================================== */}
      <div
        style={{
          flex: '1 1 50%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 'clamp(28px, 4.5vw, 64px)',
          backgroundColor: '#FFFFFF',
          overflowY: 'auto'
        }}
      >
        {/* Barra superior de navegación */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleGoStore}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              color: '#737373',
              fontSize: '0.84rem',
              fontWeight: '500',
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: '6px',
              transition: 'color 0.15s, background-color 0.15s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#171717';
              e.currentTarget.style.backgroundColor = '#F6F6F6';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = '#737373';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <ArrowLeft size={16} />
            <span>Volver a la tienda</span>
          </button>
        </div>

        {/* Contenedor central del formulario */}
        <div style={{ maxWidth: '440px', width: '100%', margin: '30px auto' }}>
          {/* Si ya hay sesión iniciada en este navegador, mostrar banner de estado */}
          {user && (
            <div
              style={{
                backgroundColor: '#F6F6F6',
                border: '1px solid #E7E7E7',
                borderRadius: '8px',
                padding: '16px 18px',
                marginBottom: '28px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <CheckCircle2 size={16} color="#15803D" />
                <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#171717' }}>
                  Sesión activa en este navegador
                </span>
              </div>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.78rem', color: '#737373' }}>
                Conectado como <strong>{user.name}</strong> ({user.email}) · Rol: <strong>{user.role === 'admin' ? 'Administrador' : 'Cliente'}</strong>
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {user.role === 'admin' ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.history) {
                        window.history.pushState(null, '', '/admin');
                      }
                      setActivePage('admin');
                    }}
                    style={{
                      flex: 1,
                      padding: '8px',
                      backgroundColor: '#0A0A0A',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Ir al Dashboard Admin
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.history) {
                        window.history.pushState(null, '', '/');
                      }
                      setActivePage('home');
                    }}
                    style={{
                      flex: 1,
                      padding: '8px',
                      backgroundColor: '#0A0A0A',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Ir a la Tienda
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    showToast('Sesión cerrada con éxito');
                  }}
                  style={{
                    padding: '8px 14px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E7E7E7',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    color: '#DC2626',
                    cursor: 'pointer'
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}

          {/* Títulos corporativos */}
          <div style={{ marginBottom: '24px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: '700',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: '#737373',
                display: 'block',
                marginBottom: '8px'
              }}
            >
              {mode === 'login' ? 'Acceso a tu Cuenta' : 'Registro de Cliente'}
            </span>
            <h2
              style={{
                fontSize: '1.85rem',
                fontWeight: '800',
                letterSpacing: '-0.025em',
                color: '#171717',
                margin: '0 0 8px 0'
              }}
            >
              {mode === 'login' ? 'Bienvenido de nuevo' : 'Crear nueva cuenta'}
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#737373', margin: 0, lineHeight: 1.5 }}>
              {mode === 'login'
                ? 'Ingresa tus credenciales para acceder al sistema.'
                : 'Completa tus datos para registrarte como cliente en Sauz Store.'}
            </p>
          </div>

          {/* Selector de Modo (Iniciar Sesión vs Registro) */}
          <div style={{ display: 'flex', backgroundColor: '#F6F6F6', padding: '3px', borderRadius: '6px', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setCustomError(null); }}
              style={{
                flex: 1,
                padding: '7px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: mode === 'login' ? '#FFFFFF' : 'transparent',
                color: mode === 'login' ? '#171717' : '#737373',
                fontSize: '0.8rem',
                fontWeight: mode === 'login' ? '700' : '500',
                cursor: 'pointer',
                boxShadow: mode === 'login' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setCustomError(null); }}
              style={{
                flex: 1,
                padding: '7px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: mode === 'register' ? '#FFFFFF' : 'transparent',
                color: mode === 'register' ? '#171717' : '#737373',
                fontSize: '0.8rem',
                fontWeight: mode === 'register' ? '700' : '500',
                cursor: 'pointer',
                boxShadow: mode === 'register' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              Registrarse
            </button>
          </div>

          {/* Alerta de error */}
          {displayError && (
            <div
              role="alert"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '14px 16px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '6px',
                color: '#DC2626',
                fontSize: '0.84rem',
                lineHeight: 1.45,
                marginBottom: '20px'
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{displayError}</div>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mode === 'register' && (
              <div>
                <label
                  htmlFor="user-name"
                  style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#171717', marginBottom: '6px' }}
                >
                  Nombre completo *
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <User size={18} style={{ position: 'absolute', left: '14px', color: '#737373', pointerEvents: 'none' }} />
                  <input
                    id="user-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Mateo Gómez"
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 14px 0 42px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E7E7E7',
                      borderRadius: '6px',
                      color: '#171717',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Campo Email */}
            <div>
              <label
                htmlFor="user-email"
                style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#171717', marginBottom: '6px' }}
              >
                Correo electrónico *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', color: '#737373', pointerEvents: 'none' }} />
                <input
                  id="user-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@sauzstore.com"
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 14px 0 42px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E7E7E7',
                    borderRadius: '6px',
                    color: '#171717',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label
                htmlFor="user-password"
                style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#171717', marginBottom: '6px' }}
              >
                Contraseña *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', color: '#737373', pointerEvents: 'none' }} />
                <input
                  id="user-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 44px 0 42px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E7E7E7',
                    borderRadius: '6px',
                    color: '#171717',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    color: '#737373',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#171717', marginBottom: '6px' }}>
                      Teléfono móvil
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+57 300 123 4567"
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 12px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E7E7E7',
                        borderRadius: '6px',
                        fontSize: '0.84rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#171717', marginBottom: '6px' }}>
                      Ciudad
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Medellín"
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 12px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E7E7E7',
                        borderRadius: '6px',
                        fontSize: '0.84rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#171717', marginBottom: '6px' }}>
                    Dirección de despacho
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Calle 10 # 42-15 Apto 502"
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 12px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E7E7E7',
                      borderRadius: '6px',
                      fontSize: '0.84rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </>
            )}

            {/* Botón Principal Negro */}
            <button
              type="submit"
              disabled={authLoading}
              style={{
                width: '100%',
                height: '46px',
                marginTop: '6px',
                backgroundColor: '#0A0A0A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.88rem',
                fontWeight: '600',
                cursor: authLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background-color 0.15s',
                boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
              }}
              onMouseOver={(e) => !authLoading && (e.currentTarget.style.backgroundColor = '#262626')}
              onMouseOut={(e) => !authLoading && (e.currentTarget.style.backgroundColor = '#0A0A0A')}
            >
              {authLoading ? (
                <>
                  <Loader2 size={18} className="spin-animation" />
                  <span>Validando...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Ingresar' : 'Registrarme'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Botones de demostración rápida */}
            <div style={{ marginTop: '10px' }}>
              <span style={{ fontSize: '0.72rem', color: '#737373', display: 'block', marginBottom: '6px', textAlign: 'center' }}>
                Accesos rápidos de demostración:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleFillAdminDemo}
                  style={{
                    padding: '8px',
                    backgroundColor: '#F6F6F6',
                    border: '1px solid #E7E7E7',
                    borderRadius: '6px',
                    color: '#171717',
                    fontSize: '0.74rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  Admin Demo
                </button>
                <button
                  type="button"
                  onClick={handleFillClientDemo}
                  style={{
                    padding: '8px',
                    backgroundColor: '#F6F6F6',
                    border: '1px solid #E7E7E7',
                    borderRadius: '6px',
                    color: '#171717',
                    fontSize: '0.74rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  Cliente Demo
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Pie de página corporativo */}
        <div
          style={{
            textAlign: 'center',
            fontSize: '0.75rem',
            color: '#737373',
            borderTop: '1px solid #E7E7E7',
            paddingTop: '20px'
          }}
        >
          Sauz Store Colombia · Sistema Unificado de Autenticación
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        @media (max-width: 900px) {
          .admin-login-visual-zone {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
