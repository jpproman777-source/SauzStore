import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import './styles.css';
import './theme-minimal.css';
import './black-future.css';
import './home-black-edition.css';
import './brand-navigation.css';
import './shopping-experience.css';
import './catalog-premium.css';
import './editorial-collections.css';
import './motion-system.css';

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
