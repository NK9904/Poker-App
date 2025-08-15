import React, { memo, useMemo } from 'react'
import type { Card } from '../../types/poker'
import { CardUtils } from '../../utils/cardUtils'

interface CardSelectorProps {
  onCardSelect: (cardString: string) => void
  selectedCards: Card[]
  allSelectedCards: Card[]
  maxCards: number
  title: string
}

export const CardSelector = memo<CardSelectorProps>(({
  onCardSelect,
  selectedCards,
  allSelectedCards,
  maxCards,
  title
}) => {
  const cardOptions = useMemo(() => CardUtils.generateAllCards(), [])
  
  const canSelectMore = selectedCards.length < maxCards

  return (
    <div className="card">
      <h3 style={{ marginBottom: '1rem', color: 'var(--color-accent)' }}>
        {title} ({selectedCards.length}/{maxCards})
      </h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(13, 1fr)', 
        gap: '0.25rem', 
        fontSize: '0.75rem' 
      }}>
        {cardOptions.map(cardString => {
          const card = CardUtils.stringToCard(cardString)
          if (!card) return null
          
          const isSelected = CardUtils.isCardSelected(card, allSelectedCards)
          const canSelect = canSelectMore && !isSelected
          
          return (
            <button
              key={cardString}
              onClick={() => canSelect && onCardSelect(cardString)}
              disabled={!canSelect}
              className="btn"
              style={{
                padding: '0.25rem',
                fontSize: '0.75rem',
                backgroundColor: !canSelect ? '#374151' : 'var(--color-bg-secondary)',
                cursor: !canSelect ? 'not-allowed' : 'pointer',
                opacity: isSelected ? 0.5 : 1
              }}
            >
              {cardString}
            </button>
          )
        })}
      </div>
    </div>
  )
})

CardSelector.displayName = 'CardSelector'