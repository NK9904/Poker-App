import { usePokerStore } from './pokerStore'

// Basic selectors
export const usePlayerCards = () => usePokerStore(state => state.playerCards)
export const useBoardCards = () => usePokerStore(state => state.boardCards)
export const usePlayerRange = () => usePokerStore(state => state.playerRange)
export const useOpponentRange = () => usePokerStore(state => state.opponentRange)
export const useLoading = () => usePokerStore(state => state.isLoading)
export const useLastCalculation = () => usePokerStore(state => state.lastCalculation)

// Analysis selectors
export const useAnalysis = () => usePokerStore(state => state.analysis)
export const useHandEvaluation = () => usePokerStore(state => state.analysis.handEvaluation)
export const useEquityResult = () => usePokerStore(state => state.analysis.equityResult)
export const useGtoStrategy = () => usePokerStore(state => state.analysis.gtoStrategy)
export const useAIAnalysis = () => usePokerStore(state => state.analysis.aiAnalysis)

// Game context selectors
export const useGameContext = () => usePokerStore(state => state.gameContext)
export const usePotSize = () => usePokerStore(state => state.gameContext.potSize)
export const useStackSize = () => usePokerStore(state => state.gameContext.stackSize)
export const usePosition = () => usePokerStore(state => state.gameContext.position)

// AI model selectors
export const useAIAvailable = () => usePokerStore(state => state.isAIAvailable)
export const useModelMetrics = () => usePokerStore(state => state.modelMetrics)
export const useAIModel = () => usePokerStore(state => state.aiModel)

// Computed selectors
export const useHandStrength = () => {
  const handEvaluation = useHandEvaluation()
  return handEvaluation?.strength || 0
}

export const useHandDescription = () => {
  const handEvaluation = useHandEvaluation()
  return handEvaluation?.description || 'No hand'
}

export const useEquity = () => {
  const equityResult = useEquityResult()
  return equityResult?.winRate || 0
}

export const useTieRate = () => {
  const equityResult = useEquityResult()
  return equityResult?.tieRate || 0
}

export const useLoseRate = () => {
  const equityResult = useEquityResult()
  return equityResult?.loseRate || 0
}

export const useConfidence = () => {
  const equityResult = useEquityResult()
  return equityResult?.confidence || 0
}

export const useGtoActions = () => {
  const gtoStrategy = useGtoStrategy()
  return gtoStrategy?.actions || []
}

export const useExpectedValue = () => {
  const gtoStrategy = useGtoStrategy()
  return gtoStrategy?.expectedValue || 0
}

export const useExploitability = () => {
  const gtoStrategy = useGtoStrategy()
  return gtoStrategy?.exploitability || 0
}

// AI-specific computed selectors
export const useAIActions = () => {
  const aiAnalysis = useAIAnalysis()
  return aiAnalysis?.actions || []
}

export const useAIConfidence = () => {
  const aiAnalysis = useAIAnalysis()
  return aiAnalysis?.confidence || 0
}

export const useAIStrategy = () => {
  const aiAnalysis = useAIAnalysis()
  return aiAnalysis?.overallStrategy || ''
}

export const useModelVersion = () => {
  const modelMetrics = useModelMetrics()
  return modelMetrics?.version || 'Unknown'
}

export const useModelAccuracy = () => {
  const modelMetrics = useModelMetrics()
  return modelMetrics?.accuracy || 0
}

export const useModelCacheSize = () => {
  const modelMetrics = useModelMetrics()
  return modelMetrics?.cacheSize || 0
}

export const useTrainingDataSize = () => {
  const modelMetrics = useModelMetrics()
  return modelMetrics?.trainingDataSize || 0
}

export const useLastModelUpdate = () => {
  const modelMetrics = useModelMetrics()
  return modelMetrics?.lastUpdated || null
}

// Combined selectors for UI
export const useBestAction = () => {
  const aiActions = useAIActions()
  const gtoActions = useGtoActions()
  
  // Prefer AI actions if available
  if (aiActions.length > 0) {
    return aiActions.reduce((best, current) => 
      (current.expectedValue || 0) > (best.expectedValue || 0) ? current : best
    )
  }
  
  // Fallback to GTO actions
  if (gtoActions.length > 0) {
    return gtoActions.reduce((best, current) => 
      current.frequency > best.frequency ? current : best
    )
  }
  
  return null
}

export const useAnalysisConfidence = () => {
  const aiConfidence = useAIConfidence()
  const gtoConfidence = useConfidence()
  
  // Return the highest confidence available
  return Math.max(aiConfidence, gtoConfidence)
}

export const useAnalysisSource = () => {
  const isAIAvailable = useAIAvailable()
  const aiAnalysis = useAIAnalysis()
  
  if (isAIAvailable && aiAnalysis) {
    return 'O3 AI'
  }
  
  return 'Traditional Engine'
}