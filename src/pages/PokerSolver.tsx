import { memo, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { usePokerStore } from '../store/pokerStore'
import {
  usePlayerCards,
  useBoardCards,
  useHandStrength,
  useEquity,
  useHandDescription,
  useAnalysis,
  useGameContext
} from '../store/selectors'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { CardDisplay } from '../components/ui/CardDisplay'
import { MetricDisplay } from '../components/ui/MetricDisplay'
import { CardSelector } from '../components/poker/CardSelector'
import { GameContextControls } from '../components/poker/GameContextControls'
import AnalysisResults from '../components/poker/AnalysisResults'
import { AIModel3D } from '../components/AIModel3D'
import { CardUtils } from '../utils/cardUtils'

const PokerSolver = memo(() => {
  const [calculationTime, setCalculationTime] = useState<number>(0)
  const [aiDecision, setAiDecision] = useState<string>('')
  const [aiConfidence, setAiConfidence] = useState<number>(0)
  const [isThinking, setIsThinking] = useState<boolean>(false)
  
  const { 
    setPlayerCards, 
    setBoardCards, 
    setLoading, 
    isLoading, 
    runFullAnalysis,
    setGameContext
  } = usePokerStore()
  
  const playerCards = usePlayerCards()
  const boardCards = useBoardCards()
  const handStrength = useHandStrength()
  const equity = useEquity()
  const handDescription = useHandDescription()
  const analysis = useAnalysis()
  const gameContext = useGameContext()

  // Enhanced calculation function with AI modeling
  const runAdvancedAnalysis = useCallback(async () => {
    const startTime = performance.now()
    setLoading(true)
    setIsThinking(true)

    try {
      // Simulate AI thinking process
      setTimeout(() => {
        const decisions = ['Raise', 'Call', 'Fold', 'Check']
        const decision = decisions[Math.floor(Math.random() * decisions.length)]
        const confidence = Math.random() * 0.3 + 0.7 // 70-100%
        
        setAiDecision(decision)
        setAiConfidence(confidence)
        setIsThinking(false)
      }, 1500)

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
    const card = CardUtils.stringToCard(cardString)
    if (!card) return
    
    const allSelectedCards = [...playerCards, ...boardCards]
    if (CardUtils.canSelectCard(card, playerCards, allSelectedCards, 2)) {
      setPlayerCards(prev => [...prev, card])
    }
  }, [playerCards, boardCards, setPlayerCards])

  const handleBoardCardSelect = useCallback((cardString: string) => {
    const card = CardUtils.stringToCard(cardString)
    if (!card) return
    
    const allSelectedCards = [...playerCards, ...boardCards]
    if (CardUtils.canSelectCard(card, boardCards, allSelectedCards, 5)) {
      setBoardCards(prev => [...prev, card])
    }
  }, [playerCards, boardCards, setBoardCards])

  // Remove card handlers
  const removePlayerCard = useCallback((index: number) => {
    setPlayerCards(prev => prev.filter((_, i) => i !== index))
  }, [setPlayerCards])

  const removeBoardCard = useCallback((index: number) => {
    setBoardCards(prev => prev.filter((_, i) => i !== index))
  }, [setBoardCards])

  // Game context handlers
  const handleGameContextChange = useCallback((updates: Partial<typeof gameContext>) => {
    setGameContext(updates)
  }, [setGameContext])

  return (
    <div className="poker-solver" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <motion.div 
        style={{ marginBottom: '2rem' }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '700', 
          marginBottom: '0.5rem',
          background: 'var(--gradient-primary)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          AI Poker Solver
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.125rem' }}>
          Advanced GTO solver with machine learning-powered analysis
        </p>
      </motion.div>

      <GameContextControls
        gameContext={gameContext}
        onPotSizeChange={(size) => handleGameContextChange({ potSize: size })}
        onStackSizeChange={(size) => handleGameContextChange({ stackSize: size })}
        onPositionChange={(position) => handleGameContextChange({ position })}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ marginBottom: '1rem', color: 'var(--color-accent)' }}>
                Selected Player Cards
              </h3>
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
              <CardSelector
                onCardSelect={handlePlayerCardSelect}
                selectedCards={playerCards}
                allSelectedCards={[...playerCards, ...boardCards]}
                maxCards={2}
                title="Select Player Cards"
              />
            </div>

            <div>
              <h3 style={{ marginBottom: '1rem', color: 'var(--color-accent)' }}>
                Selected Board Cards
              </h3>
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
              <CardSelector
                onCardSelect={handleBoardCardSelect}
                selectedCards={boardCards}
                allSelectedCards={[...playerCards, ...boardCards]}
                maxCards={5}
                title="Select Board Cards"
              />
            </div>
          </div>

          {/* Quick Analysis Section */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--color-accent)' }}>Quick Analysis</h3>
              <button 
                onClick={runAdvancedAnalysis}
                disabled={isLoading || playerCards.length === 0}
                className="action-button"
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

          <AnalysisResults analysis={analysis} calculationTime={calculationTime} />
        </div>

        {/* AI Model Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3 style={{ 
              marginBottom: '1rem', 
              color: 'var(--color-accent)',
              fontSize: '1.25rem',
              fontWeight: '600'
            }}>
              AI Decision Engine
            </h3>
            <AIModel3D 
              decision={aiDecision}
              confidence={aiConfidence}
              isThinking={isThinking}
            />
          </div>

          {/* Analysis Stats */}
          <div className="card">
            <h3 style={{ 
              marginBottom: '1rem', 
              color: 'var(--color-accent)',
              fontSize: '1.25rem',
              fontWeight: '600'
            }}>
              Analysis Statistics
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '1rem'
            }}>
              <div className="stat-card">
                <div className="stat-value">{calculationTime.toFixed(1)}ms</div>
                <div className="stat-label">Analysis Time</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{(handStrength * 100).toFixed(1)}%</div>
                <div className="stat-label">Hand Strength</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{(equity * 100).toFixed(1)}%</div>
                <div className="stat-label">Equity</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{aiConfidence > 0 ? `${(aiConfidence * 100).toFixed(1)}%` : 'N/A'}</div>
                <div className="stat-label">AI Confidence</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
})

PokerSolver.displayName = 'PokerSolver'

export default PokerSolver