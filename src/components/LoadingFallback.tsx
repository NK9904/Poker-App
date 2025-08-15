

// Enhanced loading fallback with better styling
export const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
    color: '#f9fafb',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  }}>
    <div 
      className="loading" 
      style={{
        width: '40px',
        height: '40px',
        border: '3px solid #374151',
        borderTop: '3px solid #60a5fa',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '1rem'
      }}
    />
    <div style={{ fontSize: '1.125rem', fontWeight: '500' }}>
      Loading AI Poker Solver...
    </div>
    <div style={{ 
      fontSize: '0.875rem', 
      color: '#9ca3af', 
      marginTop: '0.5rem',
      textAlign: 'center',
      maxWidth: '300px'
    }}>
      Initializing advanced poker engine and AI models
    </div>
  </div>
)