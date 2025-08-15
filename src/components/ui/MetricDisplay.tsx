import React, { memo } from 'react'

interface MetricDisplayProps {
  label: string
  value: string | number
  color?: string
  size?: 'sm' | 'md' | 'lg'
}

export const MetricDisplay = memo<MetricDisplayProps>(({ 
  label, 
  value, 
  color = 'var(--color-accent)',
  size = 'md'
}) => {
  const sizeStyles = {
    sm: { fontSize: '1rem', marginBottom: '0.125rem' },
    md: { fontSize: '1.5rem', marginBottom: '0.25rem' },
    lg: { fontSize: '2rem', marginBottom: '0.5rem' }
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ 
        fontWeight: '700', 
        color,
        ...sizeStyles[size]
      }}>
        {value}
      </div>
      <div style={{ 
        fontSize: size === 'lg' ? '1rem' : '0.875rem', 
        color: 'var(--color-text-secondary)' 
      }}>
        {label}
      </div>
    </div>
  )
})

MetricDisplay.displayName = 'MetricDisplay'