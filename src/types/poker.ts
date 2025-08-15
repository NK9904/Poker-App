// Centralized type definitions for poker-related types
export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades'
  rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K'
}

export interface HandRange {
  combinations: string[]
  frequency: number
}

export interface GameContext {
  potSize: number
  stackSize: number
  position: 'early' | 'middle' | 'late'
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
  action: 'fold' | 'call' | 'raise'
  frequency: number
  sizing?: number
}

export interface GtoStrategy {
  actions: GtoAction[]
  expectedValue: number
  exploitability: number
}

export interface AdvancedAnalysis {
  handEvaluation: HandEvaluation | null
  equityResult: EquityResult | null
  gtoStrategy: GtoStrategy | null
  lastUpdated: Date | null
}

export enum HandRank {
  HIGH_CARD = 1,
  PAIR = 2,
  TWO_PAIR = 3,
  THREE_OF_A_KIND = 4,
  STRAIGHT = 5,
  FLUSH = 6,
  FULL_HOUSE = 7,
  FOUR_OF_A_KIND = 8,
  STRAIGHT_FLUSH = 9,
  ROYAL_FLUSH = 10
}