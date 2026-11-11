import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, AlertCircle, Loader2, User, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { BrandLogo } from '../layout/BrandLogo';
import { authService } from '../../services/authService';
import './auth-premium.css';

export const AdminLogin = ({ setActivePage }) => {
  const { login, register, authLoading, authError, setAuthError } = useAuth();
  const { showToast } = useCart();

  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Medellín');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [recoverySent, setRecoverySent] = useState(false);

  const resetForm = () => {
    setLocalError(null);
    if (setAuthError) setAuthError(null);
    setRecoverySent(false);
  };

  const handleModeChange = (newMode) => {
    resetForm();
    setMode(newMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    if (setAuthError) setAuthError(null);

    // MODO RECUPERACIÓN DE CONTRASEÑA
    if (mode === 'forgot') {
      if (!email.trim() || !email.includes('@')) {
        setLocalError('Por favor ingrese un correo electrónico válido.');
        return;
      }
      try {
        await authService.requestPasswordReset(email.trim());
        setRecoverySent(true);
      } catch (err) {
        setLocalError(
          err.status === 404 || err.status === 501
            ? 'La recuperación automática aún requiere conectar /api/auth/forgot-password en el backend. Contacta a soporte@sauzstore.com.'
            : err.message || 'No fue posible solicitar la recuperación de contraseña.',
        );
      }
      return;
    }

    // MODO INICIO DE SESIÓN
    if (mode === 'login') {
      if (!email.trim() || !email.includes('@')) {
        setLocalError('Por favor ingrese un correo electrónico válido.');
        return;
      }
      if (!password) {
        setLocalError('Por favor ingrese su contraseña.');
        return;
      }

      try {
        const loggedUser = await login(email.trim(), password);

        if (loggedUser.role === 'admin') {
          showToast('Sesión de Administrador iniciada');
          if (typeof window !== 'undefined' && window.history) {
            window.history.pushState(null, '', '/admin');
          }
          setActivePage('admin');
        } else {
          showToast(`Bienvenido a SAUZ STORE, ${loggedUser.name}`);
          if (typeof window !== 'undefined' && window.history) {
            window.history.pushState(null, '', '/mi-cuenta');
          }
          setActivePage('account');
        }
      } catch (err) {
        setLocalError(err.message || 'Credenciales incorrectas. Verifique su correo y contraseña.');
      }
      return;
    }

    // MODO REGISTRO DE CLIENTE
    if (mode === 'register') {
      if (!name.trim()) {
        setLocalError('El nombre completo es requerido.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setLocalError('Ingrese un correo electrónico válido.');
        return;
      }
      if (!password || password.length < 6) {
        setLocalError('La contraseña debe tener al menos 6 caracteres.');
        return;
      }

      try {
        const newUser = await register({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
        });

        showToast(`Cuenta creada exitosamente, ${newUser.name}`);
        if (typeof window !== 'undefined' && window.history) {
          window.history.pushState(null, '', '/mi-cuenta');
        }
        setActivePage('account');
      } catch (err) {
        setLocalError(err.message || 'No fue posible completar el registro. Intente nuevamente.');
      }
    }
  };

  const handleBackToStore = () => {
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState(null, '', '/');
    }
    setActivePage('home');
  };

  const displayError = localError || authError;

  return (
    <div className="sauz-auth-container sauz-login-refined">
      {/* Barra superior con navegación de regreso */}
      <header className="sauz-auth-top-bar">
        <button
          type="button"
          className="sauz-auth-back-btn"
          onClick={handleBackToStore}
          aria-label="Volver a la tienda"
        >
          <ArrowLeft size={16} />
          <span>Volver a la tienda</span>
        </button>
      </header>

      {/* Tarjeta Central Minimalista */}
      <main className="sauz-auth-card" role="main">
        {/* Identidad de Marca */}
        <div className="sauz-auth-header">
          <div className="sauz-auth-logo-wrap">
            <BrandLogo variant="header" />
          </div>
          <h1 className="sauz-auth-title">
            {mode === 'login' && 'Inicio de sesión'}
            {mode === 'register' && 'Crear cuenta'}
            {mode === 'forgot' && 'Recuperar contraseña'}
          </h1>
          <p className="sauz-auth-subtitle">
            {mode === 'login' && 'Ingresa tu correo y contraseña para acceder.'}
            {mode === 'register' && 'Regístrate para guardar favoritos, rastrear envíos y acelerar tu compra.'}
            {mode === 'forgot' && 'Ingresa tu correo para recibir las instrucciones de restablecimiento.'}
          </p>
        </div>

        {/* Mensaje de Alerta / Error */}
        {displayError && (
          <div className="sauz-auth-error" role="alert">
            <AlertCircle size={16} className="sauz-auth-error-icon" />
            <span>{displayError}</span>
          </div>
        )}

        {/* Estado de Recuperación Enviada */}
        {mode === 'forgot' && recoverySent ? (
          <div className="sauz-auth-recovery-notice">
            <CheckCircle2 size={36} color="#ff1724" />
            <h3>Solicitud Registrada</h3>
            <p>
              Si el correo <strong>{email}</strong> se encuentra registrado en nuestro sistema,
              recibirás un enlace de restablecimiento.
            </p>
            <p className="sauz-auth-support-note">
              ¿No recibiste el correo? Puedes contactar a nuestro equipo en <strong>soporte@sauzstore.com</strong>.
            </p>
            <button
              type="button"
              className="sauz-auth-submit-btn"
              onClick={() => handleModeChange('login')}
            >
              Regresar al Inicio de Sesión
            </button>
          </div>
        ) : (
          <form className="sauz-auth-form" onSubmit={handleSubmit} noValidate>
            {/* Campo Nombre (solo en registro) */}
            {mode === 'register' && (
              <div className="sauz-auth-field">
                <label htmlFor="auth-name">Nombre Completo</label>
                <div className="sauz-auth-input-wrap">
                  <User size={18} className="sauz-auth-input-icon" />
                  <input
                    id="auth-name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Mateo Gómez"
                    disabled={authLoading}
                  />
                </div>
              </div>
            )}

            {/* Campo Correo Electrónico */}
            <div className="sauz-auth-field">
              <label htmlFor="auth-email">Correo Electrónico</label>
              <div className="sauz-auth-input-wrap">
                <Mail size={18} className="sauz-auth-input-icon" />
                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  disabled={authLoading}
                />
              </div>
            </div>

            {/* Campo Contraseña (en login y registro) */}
            {mode !== 'forgot' && (
              <div className="sauz-auth-field">
                <div className="sauz-auth-field-header">
                  <label htmlFor="auth-password">Contraseña</label>

                </div>
                <div className="sauz-auth-input-wrap">
                  <Lock size={18} className="sauz-auth-input-icon" />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
                    disabled={authLoading}
                  />
                  <button
                    type="button"
                    className="sauz-auth-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* Campos adicionales de Registro */}
            {mode === 'register' && (
              <>
                <div className="sauz-auth-field-grid">
                  <div className="sauz-auth-field">
                    <label htmlFor="auth-phone">Teléfono / WhatsApp</label>
                    <div className="sauz-auth-input-wrap">
                      <Phone size={18} className="sauz-auth-input-icon" />
                      <input
                        id="auth-phone"
                        type="tel"
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+57 300 000 0000"
                        disabled={authLoading}
                      />
                    </div>
                  </div>
                  <div className="sauz-auth-field">
                    <label htmlFor="auth-city">Ciudad</label>
                    <div className="sauz-auth-input-wrap">
                      <MapPin size={18} className="sauz-auth-input-icon" />
                      <input
                        id="auth-city"
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Medellín, Bogotá..."
                        disabled={authLoading}
                      />
                    </div>
                  </div>
                </div>

                <div className="sauz-auth-field">
                  <label htmlFor="auth-address">Dirección de Entrega</label>
                  <div className="sauz-auth-input-wrap">
                    <MapPin size={18} className="sauz-auth-input-icon" />
                    <input
                      id="auth-address"
                      type="text"
                      autoComplete="street-address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Calle 10 # 42-15 Apto 502"
                      disabled={authLoading}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Acciones de acceso */}
            <div className="sauz-auth-actions">
            <button
              type="submit"
              className="sauz-auth-submit-btn"
              disabled={authLoading}
            >
              {authLoading ? (
                <>
                  <Loader2 size={18} className="sauz-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'Iniciar sesión'}
                    {mode === 'register' && 'Crear mi cuenta'}
                    {mode === 'forgot' && 'Enviar enlace'}
                  </span>
                </>
              )}
            </button>

            </div>
            {mode !== 'forgot' && <div className="sauz-auth-links">
              {mode === 'login' && <button type="button" className="sauz-auth-forgot-link" onClick={() => handleModeChange('forgot')}>¿Olvidaste tu contraseña?</button>}
              <p>{mode === 'login' ? '¿Aún no tienes cuenta?' : '¿Ya tienes cuenta?'} <button type="button" className="sauz-auth-secondary-btn" disabled={authLoading} onClick={() => handleModeChange(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Crear cuenta' : 'Iniciar sesión'}</button></p>
            </div>}
            {/* Botón de Cancelar en Modo Olvido */}
            {mode === 'forgot' && (
              <button
                type="button"
                className="sauz-auth-cancel-btn"
                onClick={() => handleModeChange('login')}
              >
                Volver a Iniciar Sesión
              </button>
            )}
          </form>
        )}

      </main>
    </div>
  );
};
