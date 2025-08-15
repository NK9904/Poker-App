import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  pokerEngine,
  calculateHandStrength,
  getHandDescription,
} from '../utils/pokerEngine';
import type {
  Card,
  EquityResult,
  GtoStrategy,
  HandEvaluation,
} from '../types/poker';

export interface HandRange {
  combinations: string[];
  frequency: number;
}

export interface AdvancedAnalysis {
  handEvaluation: HandEvaluation | null;
  equityResult: EquityResult | null;
  gtoStrategy: GtoStrategy | null;
  lastUpdated: Date | null;
}

export interface PokerState {
  // Current hand
  playerCards: Card[];
  boardCards: Card[];

  // Ranges
  playerRange: HandRange[];
  opponentRange: HandRange[];

  // Game state
  isLoading: boolean;
  lastCalculation: Date | null;

  // Advanced AI analysis
  analysis: AdvancedAnalysis;

  // Game context for GTO calculations
  potSize: number;
  stackSize: number;
  position: 'early' | 'middle' | 'late';

  // Actions
  setPlayerCards: (cards: Card[] | ((prev: Card[]) => Card[])) => void;
  setBoardCards: (cards: Card[] | ((prev: Card[]) => Card[])) => void;
  setPlayerRange: (range: HandRange[]) => void;
  setOpponentRange: (range: HandRange[]) => void;
  setLoading: (loading: boolean) => void;
  setPotSize: (size: number) => void;
  setStackSize: (size: number) => void;
  setPosition: (pos: 'early' | 'middle' | 'late') => void;
  resetState: () => void;

  // Advanced analysis actions
  runFullAnalysis: () => Promise<void>;
  updateHandEvaluation: () => void;

  // Computed values (memoized with caching)
  getHandStrength: () => number;
  getEquity: () => number;
  getHandDescription: () => string;
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
    lastUpdated: null,
  },
  potSize: 100,
  stackSize: 1000,
  position: 'middle' as const,
};

export const usePokerStore = create<PokerState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    setPlayerCards: cards => {
      const newCards =
        typeof cards === 'function' ? cards(get().playerCards) : cards;
      set({ playerCards: newCards });
      // Auto-update hand evaluation when cards change
      setTimeout(() => get().updateHandEvaluation(), 0);
    },

    setBoardCards: cards => {
      const newCards =
        typeof cards === 'function' ? cards(get().boardCards) : cards;
      set({ boardCards: newCards });
      // Auto-update hand evaluation when cards change
      setTimeout(() => get().updateHandEvaluation(), 0);
    },

    setPlayerRange: range => set({ playerRange: range }),
    setOpponentRange: range => set({ opponentRange: range }),
    setLoading: loading => set({ isLoading: loading }),
    setPotSize: size => set({ potSize: size }),
    setStackSize: size => set({ stackSize: size }),
    setPosition: pos => set({ position: pos }),

    resetState: () =>
      set({
        ...initialState,
        analysis: {
          handEvaluation: null,
          equityResult: null,
          gtoStrategy: null,
          lastUpdated: null,
        },
      }),

    updateHandEvaluation: () => {
      const state = get();
      if (state.playerCards.length === 0) {
        return;
      }

      try {
        const handEvaluation = pokerEngine.evaluateHand(
          state.playerCards,
          state.boardCards
        );
        set({
          analysis: {
            ...state.analysis,
            handEvaluation,
            lastUpdated: new Date(),
          },
        });
      } catch (error) {
        // Error is handled silently in production
      }
    },

    runFullAnalysis: async () => {
      const state = get();
      if (state.playerCards.length === 0) {
        return;
      }

      set({ isLoading: true });

      try {
        // Run all analyses in parallel for better performance
        const [handEvaluation, equityResult, gtoStrategy] = await Promise.all([
          Promise.resolve(
            pokerEngine.evaluateHand(state.playerCards, state.boardCards)
          ),
          pokerEngine.calculateEquity(
            state.playerCards,
            state.boardCards,
            25000
          ),
          pokerEngine.calculateGtoStrategy(
            state.playerCards,
            state.boardCards,
            state.potSize,
            state.stackSize
          ),
        ]);

        set({
          analysis: {
            handEvaluation,
            equityResult,
            gtoStrategy,
            lastUpdated: new Date(),
          },
          lastCalculation: new Date(),
        });
      } catch (error) {
        // Error is handled silently in production
      } finally {
        set({ isLoading: false });
      }
    },

    // Optimized computed values with better caching
    getHandStrength: () => {
      const state = get();
      if (state.playerCards.length === 0) {
        return 0;
      }

      // Use cached evaluation if available and recent
      const analysis = state.analysis.handEvaluation;
      if (analysis && state.analysis.lastUpdated) {
        const ageMs = Date.now() - state.analysis.lastUpdated.getTime();
        if (ageMs < 5000) {
          // Cache for 5 seconds
          return analysis.strength;
        }
      }

      // Fallback to quick calculation
      return calculateHandStrength(state.playerCards, state.boardCards);
    },

    getEquity: () => {
      const state = get();
      if (state.playerCards.length === 0) {
        return 0;
      }

      // Use cached equity if available and recent
      const { equityResult } = state.analysis;
      if (equityResult && state.analysis.lastUpdated) {
        const ageMs = Date.now() - state.analysis.lastUpdated.getTime();
        if (ageMs < 10000) {
          // Cache for 10 seconds
          return equityResult.winRate;
        }
      }

      // Fallback to quick hand strength estimation
      const handStrength = state.getHandStrength();
      const boardFactor = state.boardCards.length / 5;
      return Math.min(1, handStrength * (1 + boardFactor * 0.2));
    },

    getHandDescription: () => {
      const state = get();
      if (state.playerCards.length === 0) {
        return 'No hand';
      }

      // Use cached evaluation if available
      const analysis = state.analysis.handEvaluation;
      if (analysis && state.analysis.lastUpdated) {
        const ageMs = Date.now() - state.analysis.lastUpdated.getTime();
        if (ageMs < 5000) {
          return analysis.description;
        }
      }

      // Fallback to quick calculation
      return getHandDescription(state.playerCards, state.boardCards);
    },
  }))
);

// Performance-optimized selectors with equality checks
export const usePlayerCards = () => usePokerStore(state => state.playerCards);
export const useBoardCards = () => usePokerStore(state => state.boardCards);
export const useIsLoading = () => usePokerStore(state => state.isLoading);
export const useAnalysis = () => usePokerStore(state => state.analysis);
export const useGameContext = () =>
  usePokerStore(state => ({
    potSize: state.potSize,
    stackSize: state.stackSize,
    position: state.position,
  }));

// Memoized selectors for computed values with better performance
export const useHandStrength = () =>
  usePokerStore(
    state => {
      if (state.playerCards.length === 0) {
        return 0;
      }

      // Use cached value if available and recent
      const analysis = state.analysis.handEvaluation;
      if (analysis && state.analysis.lastUpdated) {
        const ageMs = Date.now() - state.analysis.lastUpdated.getTime();
        if (ageMs < 5000) {
          return analysis.strength;
        }
      }

      // Quick calculation fallback
      return calculateHandStrength(state.playerCards, state.boardCards);
    },
    (a, b) => Math.abs(a - b) < 0.001 // Only recompute if significant change
  );

export const useEquity = () =>
  usePokerStore(
    state => {
      if (state.playerCards.length === 0) {
        return 0;
      }

      // Use cached equity if available
      const { equityResult } = state.analysis;
      if (equityResult && state.analysis.lastUpdated) {
        const ageMs = Date.now() - state.analysis.lastUpdated.getTime();
        if (ageMs < 10000) {
          return equityResult.winRate;
        }
      }

      // Fallback calculation
      const handStrength = calculateHandStrength(
        state.playerCards,
        state.boardCards
      );
      const boardFactor = state.boardCards.length / 5;
      return Math.min(1, handStrength * (1 + boardFactor * 0.2));
    },
    (a, b) => Math.abs(a - b) < 0.001
  );

export const useHandDescription = () =>
  usePokerStore(
    state => {
      if (state.playerCards.length === 0) {
        return 'No hand';
      }

      const analysis = state.analysis.handEvaluation;
      if (analysis && state.analysis.lastUpdated) {
        const ageMs = Date.now() - state.analysis.lastUpdated.getTime();
        if (ageMs < 5000) {
          return analysis.description;
        }
      }

      return getHandDescription(state.playerCards, state.boardCards);
    },
    (a, b) => a === b
  );

// Advanced selectors for AI analysis
export const useGtoStrategy = () =>
  usePokerStore(state => state.analysis.gtoStrategy);
export const useEquityResult = () =>
  usePokerStore(state => state.analysis.equityResult);
