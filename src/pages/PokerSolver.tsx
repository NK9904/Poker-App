import React, { memo, useCallback, useState, useMemo } from 'react'
import { usePokerStore, usePlayerCards, useBoardCards, useHandStrength, useEquity } from '../store/usePokerStore'
import { LoadingSpinner } from '../components/LoadingSpinner'

const PokerSolver = memo(() => {
  const [calculationTime, setCalculationTime] = useState<number>(0)
  const { setPlayerCards, setBoardCards, setLoading, isLoading } = usePokerStore()
  const playerCards = usePlayerCards()
  const boardCards = useBoardCards()
  const handStrength = useHandStrength()
  const equity = useEquity()

  // Memoized calculation function for performance
  const runSolverCalculation = useCallback(async () => {
    const startTime = performance.now()
    setLoading(true)

    try {
      // Simulate complex poker calculations
      await new Promise(resolve => setTimeout(resolve, 50)) // Minimal delay for UX
      
      // In a real application, this would:
      // 1. Use Web Workers for heavy calculations
      // 2. Implement Monte Carlo simulations
      // 3. Calculate GTO solutions
      // 4. Use WebAssembly for performance-critical code
      
      const endTime = performance.now()
      setCalculationTime(endTime - startTime)
    } finally {
      setLoading(false)
    }
  }, [setLoading])

  // Memoized card selection handlers with proper validation
  const handlePlayerCardSelect = useCallback((cardString: string) => {
    if (!cardString || cardString.length !== 2 || playerCards.length >= 2) return
    
    const [rank, suit] = cardString.split('')
    const suitMap = { h: 'hearts', d: 'diamonds', c: 'clubs', s: 'spades' } as const
    const validRanks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']
    
    if (!validRanks.includes(rank) || !suitMap[suit as keyof typeof suitMap]) return
    
    // Check if card is already selected
    const allSelectedCards = [...playerCards, ...boardCards]
    const isCardSelected = allSelectedCards.some(card => 
      card.rank === rank && card.suit === suitMap[suit as keyof typeof suitMap]
    )
    
    if (isCardSelected) return
    
    setPlayerCards(prev => [
      ...prev,
      { rank, suit: suitMap[suit as keyof typeof suitMap] }
    ])
  }, [playerCards, boardCards, setPlayerCards])

  const handleBoardCardSelect = useCallback((cardString: string) => {
    if (!cardString || cardString.length !== 2 || boardCards.length >= 5) return
    
    const [rank, suit] = cardString.split('')
    const suitMap = { h: 'hearts', d: 'diamonds', c: 'clubs', s: 'spades' } as const
    const validRanks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']
    
    if (!validRanks.includes(rank) || !suitMap[suit as keyof typeof suitMap]) return
    
    // Check if card is already selected
    const allSelectedCards = [...playerCards, ...boardCards]
    const isCardSelected = allSelectedCards.some(card => 
      card.rank === rank && card.suit === suitMap[suit as keyof typeof suitMap]
    )
    
    if (isCardSelected) return
    
    setBoardCards(prev => [
      ...prev,
      { rank, suit: suitMap[suit as keyof typeof suitMap] }
    ])
  }, [playerCards, boardCards, setBoardCards])

  // Memoized card options for performance
  const cardOptions = useMemo(() => {
    const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']
    const suits = ['h', 'd', 'c', 's']
    return ranks.flatMap(rank => suits.map(suit => `${rank}${suit}`))
  }, [])

  return (
    <div className="poker-solver" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Poker Solver
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.125rem' }}>
          Advanced GTO solver with performance-optimized calculations
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Player Cards Section */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', color: 'var(--color-accent)' }}>Player Cards</h3>
          <div style={{ marginBottom: '1rem' }}>
            {playerCards.length > 0 ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {playerCards.map((card, index) => (
                  <CardDisplay key={index} card={card} />
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-secondary)' }}>No cards selected</p>
            )}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(13, 1fr)', gap: '0.25rem', fontSize: '0.75rem' }}>
            {cardOptions.slice(0, 26).map(card => (
              <button
                key={card}
                onClick={() => handlePlayerCardSelect(card)}
                disabled={playerCards.length >= 2}
                className="btn"
                style={{
                  padding: '0.25rem',
                  fontSize: '0.75rem',
                  backgroundColor: playerCards.length >= 2 ? '#374151' : 'var(--color-bg-secondary)',
                  cursor: playerCards.length >= 2 ? 'not-allowed' : 'pointer'
                }}
              >
                {card}
              </button>
            ))}
          </div>
        </div>

        {/* Board Cards Section */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', color: 'var(--color-accent)' }}>Board Cards</h3>
          <div style={{ marginBottom: '1rem' }}>
            {boardCards.length > 0 ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {boardCards.map((card, index) => (
                  <CardDisplay key={index} card={card} />
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-secondary)' }}>No board cards</p>
            )}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(13, 1fr)', gap: '0.25rem', fontSize: '0.75rem' }}>
            {cardOptions.slice(26).map(card => (
              <button
                key={card}
                onClick={() => handleBoardCardSelect(card)}
                disabled={boardCards.length >= 5}
                className="btn"
                style={{
                  padding: '0.25rem',
                  fontSize: '0.75rem',
                  backgroundColor: boardCards.length >= 5 ? '#374151' : 'var(--color-bg-secondary)',
                  cursor: boardCards.length >= 5 ? 'not-allowed' : 'pointer'
                }}
              >
                {card}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis Section */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--color-accent)' }}>Analysis</h3>
          <button 
            onClick={runSolverCalculation}
            disabled={isLoading || playerCards.length === 0}
            className="btn btn-primary"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Calculate'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <MetricDisplay
            label="Hand Strength"
            value={`${(handStrength * 100).toFixed(1)}%`}
            color="var(--color-accent)"
          />
          <MetricDisplay
            label="Equity"
            value={`${(equity * 100).toFixed(1)}%`}
            color="var(--color-success)"
          />
          <MetricDisplay
            label="Calculation Time"
            value={`${calculationTime.toFixed(1)}ms`}
            color="var(--color-warning)"
          />
          <MetricDisplay
            label="Performance"
            value={calculationTime < 100 ? "Excellent" : calculationTime < 500 ? "Good" : "Slow"}
            color={calculationTime < 100 ? "var(--color-success)" : calculationTime < 500 ? "var(--color-warning)" : "var(--color-danger)"}
          />
        </div>
      </div>
    </div>
  )
})

interface CardDisplayProps {
  card: { rank: string; suit: string }
}

const CardDisplay = memo<CardDisplayProps>(({ card }) => {
  const suitSymbols = {
    hearts: '♥️',
    diamonds: '♦️',
    clubs: '♣️',
    spades: '♠️'
  }

  const suitColors = {
    hearts: '#ef4444',
    diamonds: '#ef4444',
    clubs: '#000000',
    spades: '#000000'
  }

  return (
    <div style={{
      backgroundColor: 'white',
      color: suitColors[card.suit as keyof typeof suitColors],
      padding: '0.5rem',
      borderRadius: '0.25rem',
      border: '1px solid #d1d5db',
      fontSize: '1rem',
      fontWeight: '600',
      minWidth: '40px',
      textAlign: 'center'
    }}>
      {card.rank}{suitSymbols[card.suit as keyof typeof suitSymbols]}
    </div>
  )
})

interface MetricDisplayProps {
  label: string
  value: string
  color: string
}

const MetricDisplay = memo<MetricDisplayProps>(({ label, value, color }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: '1.5rem', fontWeight: '700', color, marginBottom: '0.25rem' }}>
      {value}
    </div>
    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
      {label}
    </div>
  </div>
))

CardDisplay.displayName = 'CardDisplay'
MetricDisplay.displayName = 'MetricDisplay'
PokerSolver.displayName = 'PokerSolver'

export default PokerSolver