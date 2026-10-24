import React, { createContext, useContext, useState, useEffect } from 'react';

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

  // Guardar en localStorage ante cambios
  useEffect(() => {
    if (user) {
      localStorage.setItem('sauz_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sauz_auth_user');
    }
  }, [user]);

  // Login
  const login = async (email, password) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

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
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al registrar usuario');
      }

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

  // Logout
  const logout = () => {
    setUser(null);
    setIsProfileOpen(false);
  };

  // Accesos rápidos de demostración
  const quickLoginAdmin = () => {
    return login('admin@sauzstore.com', 'admin123');
  };

  const quickLoginClient = () => {
    return login('cliente@sauzstore.com', 'cliente123');
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
        quickLoginAdmin,
        quickLoginClient
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

