import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    
    // Performance monitoring: Track errors
    if ('performance' in window && 'mark' in performance) {
      performance.mark('error-boundary-triggered')
    }
    
    // In production, send to error reporting service
    if (import.meta.env.PROD) {
      // Send to analytics/error reporting
      try {
        // Example: Send to analytics service
        // analytics.track('error', { error: error.message, stack: error.stack })
      } catch (reportError) {
        console.error('Failed to report error:', reportError)
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="card" style={{ 
            maxWidth: '500px', 
            margin: '2rem auto',
            textAlign: 'center'
          }}>
            <h2 style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>
              Something went wrong
            </h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
              We're sorry, but something unexpected happened. Please refresh the page or try again.
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}