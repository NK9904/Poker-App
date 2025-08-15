import { memo } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface NavItem {
  path: string
  label: string
  icon?: string
}

const navItems: NavItem[] = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/solver', label: 'Poker Solver', icon: '🧠' },
  { path: '/analyzer', label: 'Hand Analyzer', icon: '🔍' },
  { path: '/ranges', label: 'Range Calculator', icon: '📊' }
]

export const Navigation = memo(() => {
  const location = useLocation()

  return (
    <nav className="navigation" style={{
      background: 'var(--color-bg-secondary)',
      padding: '1rem 2rem',
      borderBottom: '1px solid #374151',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <Link 
          to="/" 
          style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'var(--color-accent)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ♠️ Poker AI
        </Link>
        
        <ul style={{
          display: 'flex',
          listStyle: 'none',
          gap: '2rem',
          margin: 0,
          padding: 0
        }}>
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--border-radius)',
                  textDecoration: 'none',
                  color: location.pathname === item.path 
                    ? 'var(--color-accent)' 
                    : 'var(--color-text-secondary)',
                  backgroundColor: location.pathname === item.path 
                    ? 'rgba(59, 130, 246, 0.1)' 
                    : 'transparent',
                  transition: 'all 0.2s ease',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  if (location.pathname !== item.path) {
                    e.currentTarget.style.backgroundColor = 'rgba(107, 114, 128, 0.1)'
                    e.currentTarget.style.color = 'var(--color-text-primary)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (location.pathname !== item.path) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = 'var(--color-text-secondary)'
                  }
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
})

Navigation.displayName = 'Navigation'