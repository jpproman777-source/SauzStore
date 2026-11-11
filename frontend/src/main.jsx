import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import './styles/styles.css';
import './styles/theme-minimal.css';
import './styles/black-future.css';
import './styles/home-black-edition.css';
import './styles/brand-navigation.css';
import './styles/shopping-experience.css';
import './styles/catalog-premium.css';
import './styles/editorial-collections.css';
import './styles/motion-system.css';
import './styles/sauz-alerts.css';

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
