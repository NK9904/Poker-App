import React, { memo, useCallback, useState, useMemo } from 'react'
import { 
  usePokerStore, 
  usePlayerCards, 
  useBoardCards, 
  useHandStrength, 
  useEquity,
  useHandDescription,
  useAnalysis,
  useGtoStrategy,
  useGameContext
} from '../store/usePokerStore'
import { LoadingSpinner } from '../components/LoadingSpinner'
import type { GtoAction } from '../utils/pokerEngine'

const PokerSolver = memo(() => {
  const [calculationTime, setCalculationTime] = useState<number>(0)
  const { 
    setPlayerCards, 
    setBoardCards, 
    setLoading, 
    isLoading, 
    runFullAnalysis,
    setPotSize,
    setStackSize,
    setPosition
  } = usePokerStore()
  
  const playerCards = usePlayerCards()
  const boardCards = useBoardCards()
  const handStrength = useHandStrength()
  const equity = useEquity()
  const handDescription = useHandDescription()
  const analysis = useAnalysis()
  const gtoStrategy = useGtoStrategy()
  const gameContext = useGameContext()

  // Enhanced calculation function with AI modeling
  const runAdvancedAnalysis = useCallback(async () => {
    const startTime = performance.now()
    setLoading(true)

    try {
      // Run comprehensive AI analysis
      await runFullAnalysis()
      
      const endTime = performance.now()
      setCalculationTime(endTime - startTime)
    } finally {
      setLoading(false)
    }
  }, [runFullAnalysis, setLoading])

  // Enhanced card selection with better validation
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

  // Remove card handlers
  const removePlayerCard = useCallback((index: number) => {
    setPlayerCards(prev => prev.filter((_, i) => i !== index))
  }, [setPlayerCards])

  const removeBoardCard = useCallback((index: number) => {
    setBoardCards(prev => prev.filter((_, i) => i !== index))
  }, [setBoardCards])

  // Memoized card options for performance
  const cardOptions = useMemo(() => {
    const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']
    const suits = ['h', 'd', 'c', 's']
    return ranks.flatMap(rank => suits.map(suit => `${rank}${suit}`))
  }, [])

  return (
    <div className="poker-solver" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          AI Poker Solver
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.125rem' }}>
          Advanced GTO solver with machine learning-powered analysis
        </p>
      </div>

      {/* Game Context Controls */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--color-accent)' }}>Game Context</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
              Pot Size
            </label>
            <input
              type="number"
              value={gameContext.potSize}
              onChange={(e) => setPotSize(Number(e.target.value))}
              className="btn"
              style={{ width: '100%', textAlign: 'left' }}
              min="1"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
              Stack Size
            </label>
            <input
              type="number"
              value={gameContext.stackSize}
              onChange={(e) => setStackSize(Number(e.target.value))}
              className="btn"
              style={{ width: '100%', textAlign: 'left' }}
              min="1"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
              Position
            </label>
            <select
              value={gameContext.position}
              onChange={(e) => setPosition(e.target.value as 'early' | 'middle' | 'late')}
              className="btn"
              style={{ width: '100%' }}
            >
              <option value="early">Early Position</option>
              <option value="middle">Middle Position</option>
              <option value="late">Late Position</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Player Cards Section */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', color: 'var(--color-accent)' }}>Player Cards</h3>
          <div style={{ marginBottom: '1rem' }}>
            {playerCards.length > 0 ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {playerCards.map((card, index) => (
                  <CardDisplay 
                    key={index} 
                    card={card} 
                    onRemove={() => removePlayerCard(index)}
                    removable
                  />
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
                  <CardDisplay 
                    key={index} 
                    card={card} 
                    onRemove={() => removeBoardCard(index)}
                    removable
                  />
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

      {/* Quick Analysis Section */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--color-accent)' }}>Quick Analysis</h3>
          <button 
            onClick={runAdvancedAnalysis}
            disabled={isLoading || playerCards.length === 0}
            className="btn btn-primary"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Run AI Analysis'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <MetricDisplay
            label="Hand"
            value={handDescription}
            color="var(--color-accent)"
          />
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
            label="Analysis Time"
            value={`${calculationTime.toFixed(1)}ms`}
            color="var(--color-warning)"
          />
        </div>
      </div>

      {/* Advanced Analysis Results */}
      {analysis.handEvaluation && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-accent)' }}>Detailed Analysis</h3>
          
          {analysis.equityResult && (
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Equity Simulation</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <MetricDisplay
                  label="Win Rate"
                  value={`${(analysis.equityResult.winRate * 100).toFixed(1)}%`}
                  color="var(--color-success)"
                />
                <MetricDisplay
                  label="Tie Rate"
                  value={`${(analysis.equityResult.tieRate * 100).toFixed(1)}%`}
                  color="var(--color-warning)"
                />
                <MetricDisplay
                  label="Lose Rate"
                  value={`${(analysis.equityResult.loseRate * 100).toFixed(1)}%`}
                  color="var(--color-danger)"
                />
                <MetricDisplay
                  label="Confidence"
                  value={`${(analysis.equityResult.confidence * 100).toFixed(1)}%`}
                  color="var(--color-accent)"
                />
              </div>
            </div>
          )}

          {gtoStrategy && (
            <div>
              <h4 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>GTO Strategy</h4>
              <div style={{ marginBottom: '1rem' }}>
                <MetricDisplay
                  label="Expected Value"
                  value={`${gtoStrategy.expectedValue.toFixed(2)}`}
                  color="var(--color-accent)"
                />
              </div>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {gtoStrategy.actions.map((action, index) => (
                  <GtoActionDisplay key={index} action={action} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
})

interface CardDisplayProps {
  card: { rank: string; suit: string }
  onRemove?: () => void
  removable?: boolean
}

const CardDisplay = memo<CardDisplayProps>(({ card, onRemove, removable = false }) => {
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
      position: 'relative',
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

interface GtoActionDisplayProps {
  action: GtoAction
}

const GtoActionDisplay = memo<GtoActionDisplayProps>(({ action }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    backgroundColor: 'var(--color-bg-secondary)',
    borderRadius: '0.5rem'
  }}>
    <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>
      {action.action}
      {action.sizing && ` (${action.sizing})`}
    </span>
    <span style={{ color: 'var(--color-accent)' }}>
      {(action.frequency * 100).toFixed(1)}%
    </span>
  </div>
))

CardDisplay.displayName = 'CardDisplay'
MetricDisplay.displayName = 'MetricDisplay'
GtoActionDisplay.displayName = 'GtoActionDisplay'
PokerSolver.displayName = 'PokerSolver'

export default PokerSolver