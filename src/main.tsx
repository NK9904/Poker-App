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

// Service Worker registration for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration)
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