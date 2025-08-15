import { usePokerStore } from './pokerStore'
import { calculateHandStrength, getHandDescription } from '../utils/pokerEngine'

// Performance-optimized selectors with equality checks
export const usePlayerCards = () => usePokerStore(state => state.playerCards)
export const useBoardCards = () => usePokerStore(state => state.boardCards)
export const useIsLoading = () => usePokerStore(state => state.isLoading)
export const useAnalysis = () => usePokerStore(state => state.analysis)
export const useGameContext = () => usePokerStore(state => state.gameContext)

// Memoized selectors for computed values
export const useHandStrength = () => usePokerStore(
  state => {
    if (state.playerCards.length === 0) return 0
    
    // Use cached value if available and recent
    const analysis = state.analysis.handEvaluation
    if (analysis && state.analysis.lastUpdated) {
      const ageMs = Date.now() - state.analysis.lastUpdated.getTime()
      if (ageMs < 5000) {
        return analysis.strength
      }
    }
    
    // Quick calculation fallback
    return calculateHandStrength(state.playerCards, state.boardCards)
  },
  (a, b) => Math.abs(a - b) < 0.001
)

export const useEquity = () => usePokerStore(
  state => {
    if (state.playerCards.length === 0) return 0
    
    // Use cached equity if available
    const equityResult = state.analysis.equityResult
    if (equityResult && state.analysis.lastUpdated) {
      const ageMs = Date.now() - state.analysis.lastUpdated.getTime()
      if (ageMs < 10000) {
        return equityResult.winRate
      }
    }
    
    // Fallback calculation
    const handStrength = calculateHandStrength(state.playerCards, state.boardCards)
    const boardFactor = state.boardCards.length / 5
    return Math.min(1, handStrength * (1 + boardFactor * 0.2))
  },
  (a, b) => Math.abs(a - b) < 0.001
)

export const useHandDescription = () => usePokerStore(
  state => {
    if (state.playerCards.length === 0) return 'No hand'
    
    const analysis = state.analysis.handEvaluation
    if (analysis && state.analysis.lastUpdated) {
      const ageMs = Date.now() - state.analysis.lastUpdated.getTime()
      if (ageMs < 5000) {
        return analysis.description
      }
    }
    
    return getHandDescription(state.playerCards, state.boardCards)
  },
  (a, b) => a === b
)

// Advanced selectors for AI analysis
export const useGtoStrategy = () => usePokerStore(state => state.analysis.gtoStrategy)
export const useEquityResult = () => usePokerStore(state => state.analysis.equityResult)