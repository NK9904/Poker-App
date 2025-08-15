import React, { memo } from 'react'
import type { Card } from '../../types/poker'
import { CardUtils } from '../../utils/cardUtils'

interface CardDisplayProps {
  card: Card
  onRemove?: () => void
  removable?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const CardDisplay = memo<CardDisplayProps>(({ 
  card, 
  onRemove, 
  removable = false,
  size = 'md'
}) => {
  const { symbol, color, display } = CardUtils.getCardDisplay(card)
  
  const sizeStyles = {
    sm: { padding: '0.25rem', fontSize: '0.875rem', minWidth: '32px' },
    md: { padding: '0.5rem', fontSize: '1rem', minWidth: '40px' },
    lg: { padding: '0.75rem', fontSize: '1.25rem', minWidth: '48px' }
  }

  return (
    <div style={{
      position: 'relative',
      backgroundColor: 'white',
      color,
      borderRadius: '0.25rem',
      border: '1px solid #d1d5db',
      fontWeight: '600',
      textAlign: 'center',
      ...sizeStyles[size]
    }}>
      {display}
      {removable && onRemove && (
        <button
          onClick={onRemove}
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
      )}
    </div>
  )
})

CardDisplay.displayName = 'CardDisplay'