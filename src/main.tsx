import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

// Performance monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

// Lazy load the main App component
const App = React.lazy(() => import('./App'))

// Web Vitals performance monitoring
function sendToAnalytics(metric: any) {
  // In production, send to your analytics service
  console.log('Performance metric:', metric)
}

// Setup performance monitoring
getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getFCP(sendToAnalytics)
getLCP(sendToAnalytics)
getTTFB(sendToAnalytics)

// Service Worker registration for PWA with performance optimization
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Register service worker with performance tracking
    const start = performance.now()
    
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        const duration = performance.now() - start
        console.log('SW registered: ', registration, `(${duration.toFixed(2)}ms)`)
        
        // Update service worker automatically
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, refresh the page
                window.location.reload()
              }
            })
          }
        })
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError)
      })
  })
}

const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#111827'
  }}>
    <div className="loading"></div>
  </div>
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <React.Suspense fallback={<LoadingFallback />}>
      <App />
    </React.Suspense>
  </React.StrictMode>,
)