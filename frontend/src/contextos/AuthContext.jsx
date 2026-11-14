import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../servicios/authService';
import { claimGuestFavorites } from '../utilidades/favorites';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sauz_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Guardar en localStorage ante cambios (sin credenciales sensibles)
  useEffect(() => {
    if (user) {
      const safeUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        docType: user.docType || '',
        documentNumber: user.documentNumber || user.id || '',
        token: user.token,
      };
      localStorage.setItem('sauz_auth_user', JSON.stringify(safeUser));
    } else {
      localStorage.removeItem('sauz_auth_user');
    }
  }, [user]);

  // Manejador global de expiración de sesión
  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      localStorage.removeItem('sauz_auth_user');
      setAuthError('Tu sesión ha expirado. Por favor ingresa nuevamente.');
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('sauz:session-expired', handleExpired);
      return () => window.removeEventListener('sauz:session-expired', handleExpired);
    }
  }, []);

  // Login
  const login = async (email, password) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const data = await authService.login(email, password);
      try { claimGuestFavorites(localStorage, data.user); } catch {}
      setUser(data.user);
      setIsLoginOpen(false);
      return data.user;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // Registro de nuevo cliente
  const register = async (userData) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const data = await authService.register(userData);
      try { claimGuestFavorites(localStorage, data.user); } catch {}
      setUser(data.user);
      setIsLoginOpen(false);
      return data.user;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout (US-17: Cierre de sesión real y revocación)
  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.warn('Error al llamar logout:', e);
    } finally {
      setUser(null);
      setIsProfileOpen(false);
      localStorage.removeItem('sauz_auth_user');
      localStorage.removeItem('sauz_saved_addresses');
    }
  };

  // Actualizar datos personales (US-16)
  const updateProfile = async (profileData) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const data = await authService.updateProfile({
        userId: user?.id,
        ...profileData,
        email: user?.email,
        newEmail: profileData.email,
      });
      setUser({ ...data.user, token:user?.token });
      return data.user;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const isAdmin = user?.role === 'admin';
  const isClient = user?.role === 'cliente';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isClient,
        isLoginOpen,
        setIsLoginOpen,
        isProfileOpen,
        setIsProfileOpen,
        authLoading,
        authError,
        setAuthError,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
