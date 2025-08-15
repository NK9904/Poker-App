import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades'
  rank: string
  value: number
}

interface Player {
  id: string
  name: string
  chips: number
  cards: Card[]
  position: 'top' | 'bottom' | 'left' | 'right'
  isActive: boolean
  isDealer: boolean
  bet: number
}

interface PokerTableProps {
  players: Player[]
  communityCards: Card[]
  pot: number
  currentPlayer?: string
  onAction?: (action: 'fold' | 'call' | 'raise', amount?: number) => void
}

const CardComponent: React.FC<{ card: Card; faceDown?: boolean }> = ({ card, faceDown = false }) => {
  const getSuitSymbol = (suit: string) => {
    switch (suit) {
      case 'hearts': return '♥'
      case 'diamonds': return '♦'
      case 'clubs': return '♣'
      case 'spades': return '♠'
      default: return ''
    }
  }

  const getSuitColor = (suit: string) => {
    return suit === 'hearts' || suit === 'diamonds' ? '#e53e3e' : '#ffffff'
  }

  if (faceDown) {
    return (
      <motion.div
        className="card-back"
        style={{
          width: '60px',
          height: '80px',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          borderRadius: '8px',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-md)',
          position: 'relative'
        }}
        whileHover={{ scale: 1.05 }}
      >
        <div style={{ fontSize: '24px', color: 'white' }}>♠</div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="card"
      style={{
        width: '60px',
        height: '80px',
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--shadow-md)',
        color: '#1a202c',
        position: 'relative'
      }}
      whileHover={{ scale: 1.05 }}
    >
      <div style={{ 
        fontSize: '16px', 
        fontWeight: 'bold',
        color: getSuitColor(card.suit)
      }}>
        {card.rank}
      </div>
      <div style={{ 
        fontSize: '20px', 
        color: getSuitColor(card.suit)
      }}>
        {getSuitSymbol(card.suit)}
      </div>
    </motion.div>
  )
}



const PlayerPosition: React.FC<{ player: Player; isCurrentPlayer: boolean }> = ({ 
  player, 
  isCurrentPlayer 
}) => {
  const getPositionStyles = (position: string) => {
    switch (position) {
      case 'bottom':
        return { bottom: '20px', left: '50%', transform: 'translateX(-50%)' }
      case 'top':
        return { top: '20px', left: '50%', transform: 'translateX(-50%)' }
      case 'left':
        return { left: '20px', top: '50%', transform: 'translateY(-50%)' }
      case 'right':
        return { right: '20px', top: '50%', transform: 'translateY(-50%)' }
      default:
        return {}
    }
  }

  return (
    <motion.div
      className="player-position"
      style={{
        position: 'absolute',
        ...getPositionStyles(player.position),
        background: isCurrentPlayer ? 'rgba(0, 212, 170, 0.2)' : 'rgba(255, 255, 255, 0.1)',
        border: isCurrentPlayer ? '2px solid var(--color-accent)' : '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: 'var(--border-radius)',
        padding: '1rem',
        backdropFilter: 'blur(10px)',
        minWidth: '120px',
        textAlign: 'center'
      }}
      animate={{
        scale: isCurrentPlayer ? 1.05 : 1,
        boxShadow: isCurrentPlayer ? '0 0 20px rgba(0, 212, 170, 0.3)' : 'none'
      }}
    >
      <div style={{ 
        fontSize: '0.875rem', 
        fontWeight: '600', 
        color: 'var(--color-text-primary)',
        marginBottom: '0.5rem'
      }}>
        {player.name}
        {player.isDealer && <span style={{ color: 'var(--color-gold)', marginLeft: '0.5rem' }}>D</span>}
      </div>
      
      <div style={{ 
        fontSize: '0.75rem', 
        color: 'var(--color-text-secondary)',
        marginBottom: '0.5rem'
      }}>
        ${player.chips.toLocaleString()}
      </div>
      
      <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
        {player.cards.map((card, index) => (
          <CardComponent 
            key={index} 
            card={card} 
            faceDown={!player.isActive}
          />
        ))}
      </div>
      
      {player.bet > 0 && (
        <div style={{ 
          marginTop: '0.5rem',
          fontSize: '0.75rem',
          color: 'var(--color-accent)',
          fontWeight: '600'
        }}>
          Bet: ${player.bet}
        </div>
      )}
    </motion.div>
  )
}

export const PokerTable: React.FC<PokerTableProps> = ({ 
  players, 
  communityCards, 
  pot, 
  currentPlayer,
  onAction 
}) => {
  const [raiseAmount, setRaiseAmount] = useState(100)

  const handleAction = (action: 'fold' | 'call' | 'raise') => {
    if (onAction) {
      onAction(action, action === 'raise' ? raiseAmount : undefined)
    }
  }

  return (
    <div className="poker-table" style={{ 
      width: '100%', 
      height: '600px', 
      position: 'relative',
      margin: '2rem 0'
    }}>
      {/* Table felt */}
      <div style={{
        position: 'absolute',
        top: '50px',
        left: '50px',
        right: '50px',
        bottom: '50px',
        background: 'radial-gradient(circle at center, #2d3748 0%, #1a202c 100%)',
        borderRadius: '50%',
        border: '3px solid var(--color-gold)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        {/* Community Cards */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginBottom: '2rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {communityCards.map((card, index) => (
            <CardComponent key={index} card={card} />
          ))}
        </div>
        
        {/* Pot */}
        <motion.div
          style={{
            background: 'rgba(255, 215, 0, 0.2)',
            border: '2px solid var(--color-gold)',
            borderRadius: 'var(--border-radius)',
            padding: '1rem 2rem',
            textAlign: 'center'
          }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700', 
            color: 'var(--color-gold)',
            marginBottom: '0.25rem'
          }}>
            Pot: ${pot.toLocaleString()}
          </div>
          <div style={{ 
            fontSize: '0.875rem', 
            color: 'var(--color-text-secondary)'
          }}>
            Total in play
          </div>
        </motion.div>
      </div>
      
      {/* Player Positions */}
      {players.map((player) => (
        <PlayerPosition 
          key={player.id} 
          player={player} 
          isCurrentPlayer={player.id === currentPlayer}
        />
      ))}
      
      {/* Action Buttons */}
      {currentPlayer && (
        <motion.div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '1rem',
            alignItems: 'center'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button 
            className="action-button fold"
            onClick={() => handleAction('fold')}
          >
            Fold
          </button>
          
          <button 
            className="action-button call"
            onClick={() => handleAction('call')}
          >
            Call
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="number"
              value={raiseAmount}
              onChange={(e) => setRaiseAmount(Number(e.target.value))}
              style={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 'var(--border-radius-sm)',
                padding: '0.5rem',
                color: 'var(--color-text-primary)',
                width: '100px'
              }}
            />
            <button 
              className="action-button raise"
              onClick={() => handleAction('raise')}
            >
              Raise
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}