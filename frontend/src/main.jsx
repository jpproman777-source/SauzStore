import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { CartProvider } from './contextos/CartContext';
import { AuthProvider } from './contextos/AuthContext';
import { ErrorBoundary } from './componentes/BarraNavegacion/ErrorBoundary';
import './estilos/styles.css';
import './estilos/theme-minimal.css';
import './estilos/black-future.css';
import './estilos/home-black-edition.css';
import './estilos/brand-navigation.css';
import './estilos/shopping-experience.css';
import './estilos/catalog-premium.css';
import './estilos/editorial-collections.css';
import './estilos/motion-system.css';
import './estilos/sauz-alerts.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <CartProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </CartProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
