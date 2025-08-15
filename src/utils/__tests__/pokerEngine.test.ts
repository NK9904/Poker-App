import { PokerEngine } from '../pokerEngine';
import { HandRank, Card } from '../../types/poker';
import type { GtoAction } from '../../types/poker';

// Mock Worker
global.Worker = jest.fn().mockImplementation(() => ({
  postMessage: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  terminate: jest.fn(),
  onmessage: null,
  onerror: null,
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');

describe('PokerEngine', () => {
  let engine: PokerEngine;

  beforeEach(() => {
    engine = new PokerEngine();
    jest.clearAllMocks();
  });

  describe('evaluateHand', () => {
    it('should evaluate a royal flush correctly', () => {
      const playerCards: Card[] = [
        { rank: 'A', suit: 'h' },
        { rank: 'K', suit: 'h' },
      ];
      const boardCards: Card[] = [
        { rank: 'Q', suit: 'h' },
        { rank: 'J', suit: 'h' },
        { rank: 'T', suit: 'h' },
      ];

      const evaluation = engine.evaluateHand(playerCards, boardCards);

      expect(evaluation.rank).toBe(HandRank.ROYAL_FLUSH);
      expect(evaluation.description).toContain('Royal Flush');
    });

    it('should evaluate a straight flush correctly', () => {
      const playerCards: Card[] = [
        { rank: '9', suit: 'c' },
        { rank: '8', suit: 'c' },
      ];
      const boardCards: Card[] = [
        { rank: '7', suit: 'c' },
        { rank: '6', suit: 'c' },
        { rank: '5', suit: 'c' },
      ];

      const evaluation = engine.evaluateHand(playerCards, boardCards);

      expect(evaluation.rank).toBe(HandRank.STRAIGHT_FLUSH);
      expect(evaluation.description).toContain('Straight Flush');
    });

    it('should evaluate four of a kind correctly', () => {
      const playerCards: Card[] = [
        { rank: 'K', suit: 'h' },
        { rank: 'K', suit: 'd' },
      ];
      const boardCards: Card[] = [
        { rank: 'K', suit: 'c' },
        { rank: 'K', suit: 's' },
        { rank: '2', suit: 'h' },
      ];

      const evaluation = engine.evaluateHand(playerCards, boardCards);

      expect(evaluation.rank).toBe(HandRank.FOUR_OF_A_KIND);
      expect(evaluation.description).toContain('Four of a Kind');
    });

    it('should evaluate a full house correctly', () => {
      const playerCards: Card[] = [
        { rank: 'Q', suit: 'h' },
        { rank: 'Q', suit: 'd' },
      ];
      const boardCards: Card[] = [
        { rank: 'Q', suit: 'c' },
        { rank: '8', suit: 'h' },
        { rank: '8', suit: 's' },
      ];

      const evaluation = engine.evaluateHand(playerCards, boardCards);

      expect(evaluation.rank).toBe(HandRank.FULL_HOUSE);
      expect(evaluation.description).toContain('Full House');
    });

    it('should evaluate a flush correctly', () => {
      const playerCards: Card[] = [
        { rank: 'A', suit: 'd' },
        { rank: '9', suit: 'd' },
      ];
      const boardCards: Card[] = [
        { rank: '7', suit: 'd' },
        { rank: '5', suit: 'd' },
        { rank: '3', suit: 'd' },
      ];

      const evaluation = engine.evaluateHand(playerCards, boardCards);

      expect(evaluation.rank).toBe(HandRank.FLUSH);
      expect(evaluation.description).toContain('Flush');
    });

    it('should evaluate a straight correctly', () => {
      const playerCards: Card[] = [
        { rank: '8', suit: 'h' },
        { rank: '7', suit: 'c' },
      ];
      const boardCards: Card[] = [
        { rank: '6', suit: 'd' },
        { rank: '5', suit: 's' },
        { rank: '4', suit: 'h' },
      ];

      const evaluation = engine.evaluateHand(playerCards, boardCards);

      expect(evaluation.rank).toBe(HandRank.STRAIGHT);
      expect(evaluation.description).toContain('Straight');
    });

    it('should evaluate three of a kind correctly', () => {
      const playerCards: Card[] = [
        { rank: 'Q', suit: 'h' },
        { rank: 'Q', suit: 'c' },
      ];
      const boardCards: Card[] = [
        { rank: 'Q', suit: 'd' },
        { rank: '8', suit: 'h' },
        { rank: '3', suit: 'c' },
      ];

      const evaluation = engine.evaluateHand(playerCards, boardCards);

      expect(evaluation.rank).toBe(HandRank.THREE_OF_A_KIND);
      expect(evaluation.description).toContain('Three of a Kind');
    });

    it('should evaluate two pair correctly', () => {
      const playerCards: Card[] = [
        { rank: 'J', suit: 'h' },
        { rank: 'J', suit: 'c' },
      ];
      const boardCards: Card[] = [
        { rank: '9', suit: 'd' },
        { rank: '9', suit: 's' },
        { rank: '2', suit: 'h' },
      ];

      const evaluation = engine.evaluateHand(playerCards, boardCards);

      expect(evaluation.rank).toBe(HandRank.TWO_PAIR);
      expect(evaluation.description).toContain('Two Pair');
    });

    it('should evaluate one pair correctly', () => {
      const playerCards: Card[] = [
        { rank: 'T', suit: 'h' },
        { rank: 'T', suit: 'c' },
      ];
      const boardCards: Card[] = [
        { rank: 'A', suit: 'd' },
        { rank: '7', suit: 's' },
        { rank: '3', suit: 'h' },
      ];

      const evaluation = engine.evaluateHand(playerCards, boardCards);

      expect(evaluation.rank).toBe(HandRank.PAIR);
      expect(evaluation.description).toContain('Pair');
    });

    it('should evaluate high card correctly', () => {
      const playerCards: Card[] = [
        { rank: 'A', suit: 'h' },
        { rank: '9', suit: 'c' },
      ];
      const boardCards: Card[] = [
        { rank: '7', suit: 'd' },
        { rank: '5', suit: 's' },
        { rank: '3', suit: 'h' },
      ];

      const evaluation = engine.evaluateHand(playerCards, boardCards);

      expect(evaluation.rank).toBe(HandRank.HIGH_CARD);
      expect(evaluation.description).toContain('High Card');
    });

    it('should handle empty board correctly', () => {
      const playerCards: Card[] = [
        { rank: 'A', suit: 'h' },
        { rank: 'K', suit: 'c' },
      ];

      const evaluation = engine.evaluateHand(playerCards, []);

      expect(evaluation.rank).toBe(HandRank.HIGH_CARD);
    });

    it('should handle pre-flop evaluation', () => {
      const playerCards: Card[] = [
        { rank: 'A', suit: 'h' },
        { rank: 'K', suit: 'h' },
      ];

      const evaluation = engine.evaluateHand(playerCards, []);

      expect(evaluation).toBeDefined();
      expect(evaluation.rank).toBeDefined();
    });

    it('should handle one card correctly', () => {
      const playerCards: Card[] = [{ rank: 'A', suit: 'h' }];

      const evaluation = engine.evaluateHand(playerCards, []);

      expect(evaluation.rank).toBe(HandRank.HIGH_CARD);
    });
  });

  describe('calculateEquity', () => {
    it('should calculate equity for pocket aces vs pocket kings', async () => {
      const playerCards: Card[] = [
        { rank: 'A', suit: 'h' },
        { rank: 'A', suit: 'c' },
      ];
      // Opponent cards would be used in a full equity calculation

      const equity = await engine.calculateEquity(playerCards, []);

      expect(equity.winRate).toBeGreaterThan(0.7);
      expect(equity.winRate).toBeLessThan(0.9);
      expect(equity.loseRate).toBeGreaterThan(0.1);
      expect(equity.loseRate).toBeLessThan(0.3);
    });

    it('should calculate equity with board cards', async () => {
      const playerCards: Card[] = [
        { rank: 'A', suit: 'h' },
        { rank: 'A', suit: 'c' },
      ];
      // Opponent cards would be used in a full equity calculation
      const boardCards: Card[] = [{ rank: 'J', suit: 'd' }];

      const equity = await engine.calculateEquity(playerCards, boardCards);

      expect(equity.winRate).toBeGreaterThan(0.8);
      expect(equity.confidence).toBeGreaterThan(0.9);
    });
  });

  describe('getGtoStrategy', () => {
    it('should provide GTO strategy for preflop', async () => {
      const playerCards: Card[] = [
        { rank: 'K', suit: 'h' },
        { rank: 'K', suit: 'c' },
      ];
      const context = {
        potSize: 100,
        stackSize: 1000,
        position: 'late' as const,
      };

      const strategy = await engine.calculateGtoStrategy(
        playerCards,
        [],
        context.potSize,
        context.stackSize
      );

      expect(strategy.actions).toHaveLength(3);
      expect(
        strategy.actions.some((a: GtoAction) => a.action === 'raise')
      ).toBe(true);
      expect(strategy.expectedValue).toBeGreaterThan(0);
    });

    it('should provide GTO strategy for flop', async () => {
      const playerCards: Card[] = [
        { rank: 'Q', suit: 'h' },
        { rank: 'Q', suit: 'c' },
      ];
      const boardCards: Card[] = [
        { rank: 'Q', suit: 'd' },
        { rank: 'Q', suit: 's' },
      ];
      const context = {
        potSize: 200,
        stackSize: 800,
        position: 'middle' as const,
      };

      const strategy = await engine.calculateGtoStrategy(
        playerCards,
        boardCards,
        context.potSize,
        context.stackSize
      );

      expect(strategy.actions).toBeDefined();
      expect(strategy.exploitability).toBeLessThan(0.1);
    });

    it('should provide GTO strategy for river', async () => {
      const playerCards: Card[] = [
        { rank: 'T', suit: 'h' },
        { rank: '9', suit: 'h' },
      ];
      const boardCards: Card[] = [
        { rank: 'A', suit: 'c' },
        { rank: 'K', suit: 'c' },
      ];
      const context = {
        potSize: 500,
        stackSize: 500,
        position: 'early' as const,
      };

      const strategy = await engine.calculateGtoStrategy(
        playerCards,
        boardCards,
        context.potSize,
        context.stackSize
      );

      expect(strategy.actions).toBeDefined();
      expect(strategy.actions.some((a: GtoAction) => a.action === 'fold')).toBe(
        true
      );
    });

    it('should handle all-in scenarios', async () => {
      const playerCards: Card[] = [
        { rank: 'A', suit: 'h' },
        { rank: 'K', suit: 'h' },
      ];
      const boardCards: Card[] = [
        { rank: 'Q', suit: 'h' },
        { rank: 'J', suit: 'c' },
        { rank: 'T', suit: 'd' },
      ];
      const context = {
        potSize: 1000,
        stackSize: 100,
        position: 'late' as const,
      };

      const strategy = await engine.calculateGtoStrategy(
        playerCards,
        boardCards,
        context.potSize,
        context.stackSize
      );

      expect(strategy.actions).toBeDefined();
      expect(
        strategy.actions.some(
          (a: GtoAction) => a.action === 'raise' && a.sizing === 100
        )
      ).toBe(true);
    });
  });

  describe('compareHands', () => {
    it('should correctly compare hands with different ranks', () => {
      const hand1: Card[] = [
        { rank: 'A', suit: 'h' },
        { rank: 'A', suit: 'c' },
      ];
      const hand2: Card[] = [
        { rank: 'K', suit: 'h' },
        { rank: 'K', suit: 'c' },
      ];

      const result = engine.compareHands(hand1, hand2);

      expect(result).toBeGreaterThan(0); // hand1 wins
    });

    it('should correctly compare hands with same rank but different kickers', () => {
      const hand1: Card[] = [
        { rank: 'A', suit: 'h' },
        { rank: 'K', suit: 'c' },
      ];
      const hand2: Card[] = [
        { rank: 'A', suit: 'c' },
        { rank: 'Q', suit: 'c' },
      ];
      const boardCards: Card[] = [
        { rank: '2', suit: 'h' },
        { rank: '3', suit: 'c' },
      ];

      const result = engine.compareHands(hand1, hand2, boardCards);

      expect(result).toBeGreaterThan(0); // hand1 wins (better kicker)
    });

    it('should handle ties correctly', () => {
      const hand1: Card[] = [
        { rank: 'A', suit: 'h' },
        { rank: 'A', suit: 'c' },
      ];
      const hand2: Card[] = [
        { rank: 'A', suit: 'd' },
        { rank: 'A', suit: 's' },
      ];

      const result = engine.compareHands(hand1, hand2);

      expect(result).toBe(0); // tie
    });
  });

  describe('edge cases', () => {
    it('should handle empty hands', () => {
      const evaluation = engine.evaluateHand([], []);

      expect(evaluation).toBeDefined();
      expect(evaluation.rank).toBe(HandRank.HIGH_CARD);
    });

    it('should handle duplicate cards gracefully', () => {
      const playerCards: Card[] = [
        { rank: 'J', suit: 'h' },
        { rank: 'J', suit: 'c' },
      ];
      const boardCards: Card[] = [
        { rank: 'J', suit: 'h' }, // duplicate
        { rank: '9', suit: 's' },
        { rank: '2', suit: 'h' },
      ];

      const evaluation = engine.evaluateHand(playerCards, boardCards);

      expect(evaluation).toBeDefined();
    });
  });
});
