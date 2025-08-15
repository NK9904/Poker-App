import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades'
  rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K'
}

export interface HandRange {
  combinations: string[]
  frequency: number
}

export interface PokerState {
  // Current hand
  playerCards: Card[]
  boardCards: Card[]
  
  // Ranges
  playerRange: HandRange[]
  opponentRange: HandRange[]
  
  // Game state
  isLoading: boolean
  lastCalculation: Date | null
  
  // Actions
  setPlayerCards: (cards: Card[]) => void
  setBoardCards: (cards: Card[]) => void
  setPlayerRange: (range: HandRange[]) => void
  setOpponentRange: (range: HandRange[]) => void
  setLoading: (loading: boolean) => void
  resetState: () => void
  
  // Computed values (memoized)
  getHandStrength: () => number
  getEquity: () => number
}

const initialState = {
  playerCards: [],
  boardCards: [],
  playerRange: [],
  opponentRange: [],
  isLoading: false,
  lastCalculation: null
}

export const usePokerStore = create<PokerState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,
    
    setPlayerCards: (cards) => set({ playerCards: cards }),
    setBoardCards: (cards) => set({ boardCards: cards }),
    setPlayerRange: (range) => set({ playerRange: range }),
    setOpponentRange: (range) => set({ opponentRange: range }),
    setLoading: (loading) => set({ isLoading: loading }),
    
    resetState: () => set(initialState),
    
    // Memoized calculations for performance
    getHandStrength: () => {
      const state = get()
      if (state.playerCards.length === 0) return 0
      
      // Simplified hand strength calculation
      // In a real app, this would use a proper poker evaluation library
      const cardValues = state.playerCards.map(card => {
        const values = { A: 14, K: 13, Q: 12, J: 11, T: 10 }
        return values[card.rank] || parseInt(card.rank)
      })
      
      return cardValues.reduce((sum, val) => sum + val, 0) / (14 * 2) // Normalize to 0-1
    },
    
    getEquity: () => {
      const state = get()
      if (state.playerCards.length === 0) return 0
      
      // Simplified equity calculation
      // This would be replaced with a Monte Carlo simulation in production
      const handStrength = state.getHandStrength()
      const boardFactor = state.boardCards.length / 5 // 0-1 based on board completion
      
      return Math.min(1, handStrength * (1 + boardFactor * 0.2))
    }
  }))
)

// Performance optimization: Subscribe only to specific slices
export const usePlayerCards = () => usePokerStore(state => state.playerCards)
export const useBoardCards = () => usePokerStore(state => state.boardCards)
export const useIsLoading = () => usePokerStore(state => state.isLoading)

// Memoized selectors for computed values
export const useHandStrength = () => usePokerStore(
  state => {
    if (state.playerCards.length === 0) return 0
    
    const cardValues = state.playerCards.map(card => {
      const values = { A: 14, K: 13, Q: 12, J: 11, T: 10 }
      return values[card.rank] || parseInt(card.rank)
    })
    
    return cardValues.reduce((sum, val) => sum + val, 0) / (14 * 2)
  },
  (a, b) => a === b // Only recompute if result changes
)

export const useEquity = () => usePokerStore(
  state => {
    if (state.playerCards.length === 0) return 0
    
    // Calculate hand strength inline for better performance
    const cardValues = state.playerCards.map(card => {
      const values = { A: 14, K: 13, Q: 12, J: 11, T: 10 }
      return values[card.rank] || parseInt(card.rank)
    })
    const handStrength = cardValues.reduce((sum, val) => sum + val, 0) / (14 * 2)
    const boardFactor = state.boardCards.length / 5
    
    return Math.min(1, handStrength * (1 + boardFactor * 0.2))
  },
  (a, b) => a === b // Only recompute if result changes
)