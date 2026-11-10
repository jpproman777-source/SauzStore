import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Sauz Store ErrorBoundary atrapó un error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bf-secondary)',
            color: 'var(--bf-text)',
            fontFamily: "'Inter', -apple-system, sans-serif",
            padding: '24px'
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              width: '100%',
              backgroundColor: 'var(--bf-secondary)',
              border: '1px solid var(--bf-border)',
              borderRadius: '12px',
              padding: '36px 32px',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                fontSize: '1.2rem',
                fontWeight: '700'
              }}
            >
              !
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: 'var(--bf-text)' }}>
              Algo salió mal al cargar esta vista
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--bf-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
              Ocurrió un error inesperado al renderizar el componente. Puedes recargar o regresar a la tienda principal.
            </p>
            {this.state.error && (
              <pre
                style={{
                  textAlign: 'left',
                  backgroundColor: 'var(--bf-secondary)',
                  border: '1px solid var(--bf-border)',
                  borderRadius: '6px',
                  padding: '12px',
                  fontSize: '0.72rem',
                  color: '#EF4444',
                  overflowX: 'auto',
                  marginBottom: '24px',
                  maxHeight: '120px'
                }}
              >
                {this.state.error.toString()}
              </pre>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  padding: '10px 18px',
                  backgroundColor: 'var(--bf-secondary)',
                  color: 'var(--bf-text)',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Recargar página
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                style={{
                  padding: '10px 18px',
                  backgroundColor: 'transparent',
                  color: 'var(--bf-text)',
                  border: '1px solid var(--bf-border)',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Ir a la Tienda
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

