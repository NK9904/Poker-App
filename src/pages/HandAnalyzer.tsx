import React, { memo } from 'react'

const HandAnalyzer = memo(() => {
  return (
    <div className="hand-analyzer" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Hand Analyzer
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.125rem' }}>
          Real-time hand analysis with equity calculations - Coming Soon
        </p>
      </div>

      <div className="card">
        <h3 style={{ color: 'var(--color-accent)', marginBottom: '1rem' }}>Features</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--color-success)' }}>✓</span>
            Real-time equity calculations
          </li>
          <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--color-success)' }}>✓</span>
            Hand strength evaluation
          </li>
          <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--color-success)' }}>✓</span>
            Opponent range analysis
          </li>
          <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--color-success)' }}>✓</span>
            Performance optimized calculations
          </li>
        </ul>
      </div>
    </div>
  )
})

HandAnalyzer.displayName = 'HandAnalyzer'

export default HandAnalyzer