import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Performance monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
import { logger } from './utils/logger';

// Lazy load the main App component
const App = React.lazy(() => import('./App'));

// Enhanced Web Vitals performance monitoring
function sendToAnalytics(metric: unknown) {
  // In production, this would send to your analytics service
  if (import.meta.env.DEV) {
    logger.log('Performance metric:', metric);
  }
}

// Setup comprehensive performance monitoring
getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);

// Enhanced Service Worker registration with error handling
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
            navigator.serviceWorker
          .register('/sw.js')
          .then(registration => {

        if (import.meta.env.DEV) {
          logger.log(
            'SW registered:',
            registration
          );
        }

        // Enhanced update handling
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                // Show update notification to user
                if (confirm('New version available! Reload to update?')) {
                  window.location.reload();
                }
              }
            });
          }
        });

        // Handle service worker messages
        navigator.serviceWorker.addEventListener('message', event => {
          if (event.data && event.data.type === 'SKIP_WAITING') {
            window.location.reload();
          }
        });
      })
      .catch(registrationError => {
        if (import.meta.env.DEV) {
          logger.error('SW registration failed:', registrationError);
        }
      });
  });
}

// Enhanced loading fallback with better styling
const LoadingFallback = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
      color: '#f9fafb',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}
  >
    <div
      className='loading'
      style={{
        width: '40px',
        height: '40px',
        border: '3px solid #374151',
        borderTop: '3px solid #60a5fa',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '1rem',
      }}
    />
    <div style={{ fontSize: '1.125rem', fontWeight: '500' }}>
      Loading AI Poker Solver...
    </div>
    <div
      style={{
        fontSize: '0.875rem',
        color: '#9ca3af',
        marginTop: '0.5rem',
        textAlign: 'center',
        maxWidth: '300px',
      }}
    >
      Initializing advanced poker engine and AI models
    </div>
  </div>
);

// Error boundary for better error handling
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, _errorInfo: React.ErrorInfo) {
    logger.error('Application error:', error);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: '#111827',
            color: '#f9fafb',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: '#ef4444',
            }}
          >
            Something went wrong
          </h1>
          <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
            The application encountered an error. Please try refreshing the
            page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Add global CSS for loading animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// Enhanced root render with error boundary
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <React.Suspense fallback={<LoadingFallback />}>
        <App />
      </React.Suspense>
    </ErrorBoundary>
  </React.StrictMode>
);
