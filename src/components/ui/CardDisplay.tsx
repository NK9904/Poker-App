import React from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { Card } from '../../types/poker'

interface CardDisplayProps {
  card: Card
  onRemove?: () => void
  removable?: boolean
  selected?: boolean
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}

const suitSymbols = {
  h: '♥',
  d: '♦',
  c: '♣',
  s: '♠'
}

const suitColors = {
  h: 'text-red-600',
  d: 'text-red-600',
  c: 'text-gray-800',
  s: 'text-gray-800'
}

const sizeClasses = {
  sm: 'w-12 h-16 text-xs',
  md: 'w-16 h-24 text-sm',
  lg: 'w-20 h-28 text-base'
}

export const CardDisplay: React.FC<CardDisplayProps> = ({
  card,
  onRemove,
  removable = false,
  selected = false,
  onClick,
  size = 'md',
  animated = true
}) => {
  const cardVariants = {
    initial: { scale: 0.8, opacity: 0, rotateY: -90 },
    animate: { 
      scale: 1, 
      opacity: 1, 
      rotateY: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    hover: { 
      scale: 1.05, 
      y: -5,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  }

  const CardComponent = animated ? motion.div : 'div'
  const cardProps = animated ? {
    variants: cardVariants,
    initial: "initial",
    animate: "animate",
    whileHover: "hover",
    whileTap: "tap"
  } : {}

  return (
    <CardComponent
      className={`
        poker-card relative ${sizeClasses[size]} 
        ${selected ? 'selected' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${removable ? 'group' : ''}
      `}
      onClick={onClick}
      {...cardProps}
    >
      {/* Card Background */}
      <div className="absolute inset-0 bg-white rounded-lg shadow-lg border-2 border-gray-200 overflow-hidden">
        {/* Card Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1 left-1 w-2 h-2 bg-gray-400 rounded-full"></div>
          <div className="absolute top-1 right-1 w-2 h-2 bg-gray-400 rounded-full"></div>
          <div className="absolute bottom-1 left-1 w-2 h-2 bg-gray-400 rounded-full"></div>
          <div className="absolute bottom-1 right-1 w-2 h-2 bg-gray-400 rounded-full"></div>
        </div>

        {/* Main Content */}
        <div className="relative h-full flex flex-col justify-between p-1">
          {/* Top Left */}
          <div className="flex flex-col items-start">
            <div className={`font-bold ${suitColors[card.suit]}`}>
              {card.rank}
            </div>
            <div className={`text-xs ${suitColors[card.suit]}`}>
              {suitSymbols[card.suit]}
            </div>
          </div>

          {/* Center Suit */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`text-2xl ${suitColors[card.suit]} opacity-20`}>
              {suitSymbols[card.suit]}
            </div>
          </div>

          {/* Bottom Right (rotated) */}
          <div className="flex flex-col items-end transform rotate-180">
            <div className={`font-bold ${suitColors[card.suit]}`}>
              {card.rank}
            </div>
            <div className={`text-xs ${suitColors[card.suit]}`}>
              {suitSymbols[card.suit]}
            </div>
          </div>
        </div>
      </div>

      {/* Remove Button */}
      {removable && onRemove && (
        <motion.button
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full 
                     flex items-center justify-center opacity-0 group-hover:opacity-100 
                     transition-opacity duration-200 hover:bg-red-600 z-10"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-3 h-3" />
        </motion.button>
      )}

      {/* Selection Indicator */}
      {selected && (
        <motion.div
          className="absolute inset-0 border-2 border-blue-500 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Glow Effect for Selected Cards */}
      {selected && (
        <motion.div
          className="absolute inset-0 rounded-lg animate-glow"
          style={{
            boxShadow: '0 0 10px #3b82f6, 0 0 20px #3b82f6, 0 0 30px #3b82f6'
          }}
        />
      )}
    </CardComponent>
  )
}

// Card Back Component
export const CardBack: React.FC<{
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}> = ({ size = 'md', animated = true }) => {
  const CardComponent = animated ? motion.div : 'div'
  const cardProps = animated ? {
    initial: { scale: 0.8, opacity: 0, rotateY: -90 },
    animate: { 
      scale: 1, 
      opacity: 1, 
      rotateY: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  } : {}

  return (
    <CardComponent
      className={`poker-card ${sizeClasses[size]} bg-gradient-to-br from-blue-600 to-blue-800 
                 border-2 border-blue-700 shadow-lg`}
      {...cardProps}
    >
      <div className="h-full flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-2xl mb-1">🃏</div>
          <div className="text-xs opacity-75">POKER</div>
        </div>
      </div>
    </CardComponent>
  )
}

// Card Placeholder Component
export const CardPlaceholder: React.FC<{
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}> = ({ size = 'md', onClick }) => {
  return (
    <motion.div
      className={`
        ${sizeClasses[size]} border-2 border-dashed border-gray-400 
        rounded-lg flex items-center justify-center cursor-pointer
        hover:border-gray-300 hover:bg-gray-50/10 transition-all duration-200
      `}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="text-gray-400 text-center">
        <div className="text-lg">+</div>
        <div className="text-xs">Add Card</div>
      </div>
    </motion.div>
  )
}