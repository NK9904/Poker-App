// Centralized type definitions for poker-related types
export type Suit = 'h' | 'd' | 'c' | 's'
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A'

export interface Card {
  rank: Rank
  suit: Suit
}

export enum HandRank {
  HIGH_CARD = 'HIGH_CARD',
  PAIR = 'PAIR',
  TWO_PAIR = 'TWO_PAIR',
  THREE_OF_A_KIND = 'THREE_OF_A_KIND',
  STRAIGHT = 'STRAIGHT',
  FLUSH = 'FLUSH',
  FULL_HOUSE = 'FULL_HOUSE',
  FOUR_OF_A_KIND = 'FOUR_OF_A_KIND',
  STRAIGHT_FLUSH = 'STRAIGHT_FLUSH',
  ROYAL_FLUSH = 'ROYAL_FLUSH'
}

export interface HandEvaluation {
  rank: HandRank
  strength: number
  description: string
  kickers: number[]
}

export interface EquityResult {
  winRate: number
  tieRate: number
  loseRate: number
  confidence: number
}

export interface GtoAction {
  action: 'fold' | 'call' | 'raise' | 'check'
  frequency: number
  sizing?: number
  expectedValue: number
  reasoning: string
}

export interface GtoStrategy {
  actions: GtoAction[]
  expectedValue: number
  exploitability: number
}

export interface HandRange {
  hands: string[]
  frequency: number
  description: string
}

export interface GameContext {
  potSize: number
  stackSize: number
  position: 'early' | 'middle' | 'late'
  actionHistory?: PokerAction[]
  opponentCount?: number
  street?: 'preflop' | 'flop' | 'turn' | 'river'
}

export interface PokerAction {
  action: 'fold' | 'call' | 'raise' | 'check'
  sizing?: number
  expectedValue?: number
  reasoning?: string
  confidence?: number
  frequency?: number
}

export interface AnalysisResult {
  actions: PokerAction[]
  confidence: number
  overallStrategy: string
  timestamp: Date
  modelVersion?: string
  dataSource?: string
}

export interface AdvancedAnalysis {
  handEvaluation: HandEvaluation | null
  equityResult: EquityResult | null
  gtoStrategy: GtoStrategy | null
  lastUpdated: Date | null
  aiAnalysis?: AnalysisResult
}

export interface O3Config {
  apiKey: string
  model: string
  maxTokens: number
  temperature: number
  fineTunedModelId?: string
}

export interface TrainingData {
  gameState: {
    playerCards: Card[]
    boardCards: Card[]
    potSize: number
    stackSize: number
    position: string
    actionHistory: PokerAction[]
  }
  optimalAction: PokerAction
  expectedValue: number
  confidence: number
  source: string
  timestamp: Date
}

export interface ModelMetrics {
  cacheSize: number
  trainingDataSize: number
  averageConfidence: number
  lastUpdated: Date
  accuracy: number
  version: string
  modelAvailable?: boolean
}

export interface ScrapingStats {
  totalHands: number
  uniquePlayers: number
  sourcesScraped: number
  lastScraped: Date
  newHandsSinceLastUpdate: number
}

export interface ModelUpdateLog {
  timestamp: Date
  modelId: string
  accuracy: number
  status: 'success' | 'error'
  type: 'model_update' | 'data_scraping'
  error?: string
}