import { memo } from 'react'

const RangeCalculator = memo(() => {
  return (
    <div className="range-calculator" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Range Calculator
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.125rem' }}>
          Pre-flop and post-flop range construction tools - Coming Soon
        </p>
      </div>

      <div className="card">
        <h3 style={{ color: 'var(--color-accent)', marginBottom: '1rem' }}>Features</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--color-success)' }}>✓</span>
            Interactive range grid
          </li>
          <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--color-success)' }}>✓</span>
            Range vs range analysis
          </li>
          <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--color-success)' }}>✓</span>
            Position-based recommendations
          </li>
          <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--color-success)' }}>✓</span>
            Instant range updates
          </li>
        </ul>
      </div>
    </div>
  )
})

RangeCalculator.displayName = 'RangeCalculator'

export default RangeCalculator