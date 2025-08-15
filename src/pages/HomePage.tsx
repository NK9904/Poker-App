import React, { memo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AIModel3D } from '../components/AIModel3D'
import { PokerTable } from '../components/PokerTable'

const HomePage = memo(() => {
  const [aiDecision, setAiDecision] = useState<string>('')
  const [aiConfidence, setAiConfidence] = useState<number>(0)
  const [isThinking, setIsThinking] = useState<boolean>(false)
  const [gameState] = useState({
    players: [
      {
        id: 'player1',
        name: 'You',
        chips: 2500,
        cards: [
          { suit: 'hearts' as const, rank: 'A', value: 14 },
          { suit: 'spades' as const, rank: 'K', value: 13 }
        ],
        position: 'bottom' as const,
        isActive: true,
        isDealer: false,
        bet: 0
      },
      {
        id: 'player2',
        name: 'AI Opponent',
        chips: 1800,
        cards: [
          { suit: 'diamonds' as const, rank: 'Q', value: 12 },
          { suit: 'clubs' as const, rank: 'J', value: 11 }
        ],
        position: 'top' as const,
        isActive: true,
        isDealer: true,
        bet: 50
      }
    ],
    communityCards: [
      { suit: 'hearts' as const, rank: '10', value: 10 },
      { suit: 'diamonds' as const, rank: '9', value: 9 },
      { suit: 'spades' as const, rank: '8', value: 8 }
    ],
    pot: 150,
    currentPlayer: 'player1'
  })

  const simulateAIThinking = () => {
    setIsThinking(true)
    setTimeout(() => {
      const decisions = ['Raise', 'Call', 'Fold']
      const decision = decisions[Math.floor(Math.random() * decisions.length)]
      const confidence = Math.random() * 0.4 + 0.6 // 60-100%
      
      setAiDecision(decision)
      setAiConfidence(confidence)
      setIsThinking(false)
    }, 2000)
  }

  useEffect(() => {
    const interval = setInterval(simulateAIThinking, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleAction = (action: 'fold' | 'call' | 'raise', amount?: number) => {
    console.log(`Player action: ${action}${amount ? ` $${amount}` : ''}`)
    // Here you would integrate with your poker logic
  }

  return (
    <div className="live-poker-page" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <motion.div 
        style={{ textAlign: 'center', marginBottom: '2rem' }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '700', 
          marginBottom: '1rem',
          background: 'var(--gradient-primary)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Live Poker Table
        </h1>
        <p style={{ 
          fontSize: '1.125rem', 
          color: 'var(--color-text-secondary)', 
          maxWidth: '600px', 
          margin: '0 auto' 
        }}>
          Experience real-time poker with AI-powered decision making
        </p>
      </motion.div>

      {/* Main Game Area */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 400px', 
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Poker Table */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <PokerTable 
            players={gameState.players}
            communityCards={gameState.communityCards}
            pot={gameState.pot}
            currentPlayer={gameState.currentPlayer}
            onAction={handleAction}
          />
        </motion.div>

        {/* AI Model Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
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

          {/* Game Stats */}
          <div className="card">
            <h3 style={{ 
              marginBottom: '1rem', 
              color: 'var(--color-accent)',
              fontSize: '1.25rem',
              fontWeight: '600'
            }}>
              Game Statistics
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '1rem'
            }}>
              <div className="stat-card">
                <div className="stat-value">$2,500</div>
                <div className="stat-label">Your Stack</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">$1,800</div>
                <div className="stat-label">Opponent Stack</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">$150</div>
                <div className="stat-label">Current Pot</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">85%</div>
                <div className="stat-label">Win Probability</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 style={{ 
          marginBottom: '1.5rem', 
          color: 'var(--color-accent)',
          fontSize: '1.25rem',
          fontWeight: '600',
          textAlign: 'center'
        }}>
          Quick Actions
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem'
        }}>
          <Link to="/solver" className="card" style={{ 
            textDecoration: 'none', 
            color: 'inherit',
            textAlign: 'center',
            padding: '1.5rem'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🤖</div>
            <h4 style={{ marginBottom: '0.5rem', color: 'var(--color-accent)' }}>AI Solver</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              Advanced GTO analysis
            </p>
          </Link>
          
          <Link to="/analyzer" className="card" style={{ 
            textDecoration: 'none', 
            color: 'inherit',
            textAlign: 'center',
            padding: '1.5rem'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
            <h4 style={{ marginBottom: '0.5rem', color: 'var(--color-accent)' }}>Hand Analysis</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              Detailed equity calculations
            </p>
          </Link>
          
          <Link to="/ranges" className="card" style={{ 
            textDecoration: 'none', 
            color: 'inherit',
            textAlign: 'center',
            padding: '1.5rem'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
            <h4 style={{ marginBottom: '0.5rem', color: 'var(--color-accent)' }}>Range Builder</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              Build optimal ranges
            </p>
          </Link>
        </div>
      </motion.div>
    </div>
  )
})

HomePage.displayName = 'HomePage'

export default HomePage