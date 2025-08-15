import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { 
  Card, 
  HandRange, 
  AdvancedAnalysis, 
  GameContext,
  AnalysisResult,
  ModelMetrics
} from '../types/poker'
import { pokerEngine, calculateHandStrength, getHandDescription } from '../utils/pokerEngine'
import { DeepSeekPokerAI } from '../ai/DeepSeekPokerAI'

interface PokerState {
  // Current hand
  playerCards: Card[]
  boardCards: Card[]
  
  // Ranges
  playerRange: HandRange[]
  opponentRange: HandRange[]
  
  // Game state
  isLoading: boolean
  lastCalculation: Date | null
  
  // Advanced AI analysis
  analysis: AdvancedAnalysis
  
  // Game context for GTO calculations
  gameContext: GameContext
  
  // AI model state
  aiModel: DeepSeekPokerAI | null
  modelMetrics: ModelMetrics | null
  isAIAvailable: boolean
  
  // Actions
  setPlayerCards: (cards: Card[] | ((prev: Card[]) => Card[])) => void
  setBoardCards: (cards: Card[] | ((prev: Card[]) => Card[])) => void
  setPlayerRange: (range: HandRange[]) => void
  setOpponentRange: (range: HandRange[]) => void
  setLoading: (loading: boolean) => void
  setGameContext: (context: Partial<GameContext>) => void
  resetState: () => void
  
  // Advanced analysis actions
  runFullAnalysis: () => Promise<void>
  runAIAnalysis: () => Promise<void>
  updateHandEvaluation: () => void
  
  // AI model actions
  initializeAI: () => Promise<void>
  getModelMetrics: () => ModelMetrics | null
  clearAICache: () => void
}

const initialState = {
  playerCards: [],
  boardCards: [],
  playerRange: [],
  opponentRange: [],
  isLoading: false,
  lastCalculation: null,
  analysis: {
    handEvaluation: null,
    equityResult: null,
    gtoStrategy: null,
    lastUpdated: null
  },
  gameContext: {
    potSize: 100,
    stackSize: 1000,
    position: 'middle' as const
  },
  aiModel: null,
  modelMetrics: null,
  isAIAvailable: false
}

export const usePokerStore = create<PokerState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,
    
    setPlayerCards: (cards) => {
      const newCards = typeof cards === 'function' ? cards(get().playerCards) : cards
      set({ playerCards: newCards })
      setTimeout(() => get().updateHandEvaluation(), 0)
    },
    
    setBoardCards: (cards) => {
      const newCards = typeof cards === 'function' ? cards(get().boardCards) : cards
      set({ boardCards: newCards })
      setTimeout(() => get().updateHandEvaluation(), 0)
    },
    
    setPlayerRange: (range) => set({ playerRange: range }),
    setOpponentRange: (range) => set({ opponentRange: range }),
    setLoading: (loading) => set({ isLoading: loading }),
    
    setGameContext: (context) => set(state => ({
      gameContext: { ...state.gameContext, ...context }
    })),
    
    resetState: () => set({
      ...initialState,
      analysis: {
        handEvaluation: null,
        equityResult: null,
        gtoStrategy: null,
        lastUpdated: null
      }
    }),
    
    updateHandEvaluation: () => {
      const state = get()
      if (state.playerCards.length === 0) return
      
      try {
        const handEvaluation = pokerEngine.evaluateHand(state.playerCards, state.boardCards)
        set({
          analysis: {
            ...state.analysis,
            handEvaluation,
            lastUpdated: new Date()
          }
        })
      } catch (error) {
        console.error('Error evaluating hand:', error)
      }
    },
    
    runFullAnalysis: async () => {
      const state = get()
      if (state.playerCards.length === 0) return
      
      set({ isLoading: true })
      
      try {
        const [handEvaluation, equityResult, gtoStrategy] = await Promise.all([
          Promise.resolve(pokerEngine.evaluateHand(state.playerCards, state.boardCards)),
          pokerEngine.calculateEquity(state.playerCards, state.boardCards, 25000),
          pokerEngine.calculateGtoStrategy(
            state.playerCards,
            state.boardCards,
            state.gameContext.potSize,
            state.gameContext.stackSize
          )
        ])
        
        set({
          analysis: {
            handEvaluation,
            equityResult,
            gtoStrategy,
            lastUpdated: new Date()
          },
          lastCalculation: new Date()
        })
      } catch (error) {
        console.error('Error running full analysis:', error)
      } finally {
        set({ isLoading: false })
      }
    },

    runAIAnalysis: async () => {
      const state = get()
      if (state.playerCards.length === 0 || !state.aiModel) return
      
      set({ isLoading: true })
      
      try {
        const aiAnalysis = await state.aiModel.analyzeSituation(
          state.playerCards,
          state.boardCards,
          state.gameContext
        )
        
        set({
          analysis: {
            ...state.analysis,
            aiAnalysis,
            lastUpdated: new Date()
          },
          lastCalculation: new Date()
        })
        
        // Update model metrics
        const metrics = state.aiModel.getModelMetrics()
        set({
          modelMetrics: {
            ...metrics,
            lastUpdated: new Date(),
            accuracy: 0.85, // This would come from model validation
            version: '2.0.0'
          }
        })
        
      } catch (error) {
        console.error('Error running AI analysis:', error)
      } finally {
        set({ isLoading: false })
      }
    },

    initializeAI: async () => {
      try {
        const config = {
          apiKey: process.env.VITE_DEEPSEEK_API_KEY || '',
          model: 'deepseek-chat',
          maxTokens: 4000,
          temperature: 0.1
        }
        
        if (!config.apiKey) {
          console.warn('DeepSeek API key not found, AI features will be disabled')
          set({ isAIAvailable: false })
          return
        }
        
        const aiModel = new DeepSeekPokerAI(config)
        set({ 
          aiModel,
          isAIAvailable: true
        })
        
        console.log('AI model initialized successfully')
        
      } catch (error) {
        console.error('Failed to initialize AI model:', error)
        set({ isAIAvailable: false })
      }
    },

    getModelMetrics: () => {
      const state = get()
      return state.modelMetrics
    },

    clearAICache: () => {
      const state = get()
      if (state.aiModel) {
        state.aiModel.clearCache()
        console.log('AI cache cleared')
      }
    }
  }))
)