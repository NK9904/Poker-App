import { PokerEngine } from '../pokerEngine';
import { HandRank } from '../../types/poker';
import type { Card } from '../../types/poker';

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

  describe('Hand Evaluation', () => {
    it('should evaluate a royal flush correctly', () => {
      const playerCards: Card[] = [
        { rank: 'A', suit: 'hearts', value: 14 },
        { rank: 'K', suit: 'hearts', value: 13 }
      ];
      const boardCards: Card[] = [
        { rank: 'Q', suit: 'hearts', value: 12 },
        { rank: 'J', suit: 'hearts', value: 11 },
        { rank: '10', suit: 'hearts', value: 10 }
      ];

      const evaluation = engine.evaluateHand(playerCards, boardCards);
      
      expect(evaluation.rank).toBe(HandRank.ROYAL_FLUSH);
      expect(evaluation.strength).toBeCloseTo(1.0);
      expect(evaluation.description).toContain('Royal Flush');
    });

    it('should evaluate a straight flush correctly', () => {
      const playerCards: Card[] = [
        { rank: '9', suit: 'clubs', value: 9 },
        { rank: '8', suit: 'clubs', value: 8 }
      ];
      const boardCards: Card[] = [
        { rank: '7', suit: 'clubs', value: 7 },
        { rank: '6', suit: 'clubs', value: 6 },
        { rank: '5', suit: 'clubs', value: 5 }
      ];

      const evaluation = engine.evaluateHand(playerCards, boardCards);
      
      expect(evaluation.rank).toBe(HandRank.STRAIGHT_FLUSH);
      expect(evaluation.strength).toBeGreaterThan(0.9);
    });

    it('should evaluate four of a kind correctly', () => {
      const playerCards: Card[] = [
        { rank: 'A', suit: 'hearts', value: 14 },
        { rank: 'A', suit: 'clubs', value: 14 }
      ];
      const boardCards: Card[] = [
        { rank: 'A', suit: 'diamonds', value: 14 },
        { rank: 'A', suit: 'spades', value: 14 },
        { rank: 'K', suit: 'hearts', value: 13 }
      ];

      const evaluation = engine.evaluateHand(playerCards, boardCards);
      
      expect(evaluation.rank).toBe(HandRank.FOUR_OF_A_KIND);
      expect(evaluation.description).toContain('Four of a Kind');
    });

    it('should evaluate a full house correctly', () => {
      const playerCards: Card[] = [
        { rank: 'K', suit: 'hearts', value: 13 },
        { rank: 'K', suit: 'clubs', value: 13 }
      ];
      const boardCards: Card[] = [
        { rank: 'K', suit: 'diamonds', value: 13 },
        { rank: '7', suit: 'hearts', value: 7 },
        { rank: '7', suit: 'clubs', value: 7 }
      ];

      const evaluation = engine.evaluateHand(playerCards, boardCards);
      
      expect(evaluation.rank).toBe(HandRank.FULL_HOUSE);
      expect(evaluation.description).toContain('Full House');
    });

    it('should evaluate a flush correctly', () => {
      const playerCards: Card[] = [
        { rank: 'A', suit: 'diamonds', value: 14 },
        { rank: '9', suit: 'diamonds', value: 9 }
      ];
      const boardCards: Card[] = [
        { rank: '7', suit: 'diamonds', value: 7 },
        { rank: '5', suit: 'diamonds', value: 5 },
        { rank: '3', suit: 'diamonds', value: 3 }
      ];

      const evaluation = engine.evaluateHand(playerCards, boardCards);
      
      expect(evaluation.rank).toBe(HandRank.FLUSH);
      expect(evaluation.description).toContain('Flush');
    });

    it('should evaluate a straight correctly', () => {
      const playerCards: Card[] = [
        { rank: '8', suit: 'hearts', value: 8 },
        { rank: '7', suit: 'clubs', value: 7 }
      ];
      const boardCards: Card[] = [
        { rank: '6', suit: 'diamonds', value: 6 },
        { rank: '5', suit: 'spades', value: 5 },
        { rank: '4', suit: 'hearts', value: 4 }
      ];

      const evaluation = engine.evaluateHand(playerCards, boardCards);
      
      expect(evaluation.rank).toBe(HandRank.STRAIGHT);
      expect(evaluation.description).toContain('Straight');
    });

    it('should evaluate three of a kind correctly', () => {
      const playerCards: Card[] = [
        { rank: 'Q', suit: 'hearts', value: 12 },
        { rank: 'Q', suit: 'clubs', value: 12 }
      ];
      const boardCards: Card[] = [
        { rank: 'Q', suit: 'diamonds', value: 12 },
        { rank: '8', suit: 'hearts', value: 8 },
        { rank: '3', suit: 'clubs', value: 3 }
      ];

      const evaluation = engine.evaluateHand(playerCards, boardCards);
      
      expect(evaluation.rank).toBe(HandRank.THREE_OF_A_KIND);
      expect(evaluation.description).toContain('Three of a Kind');
    });

    it('should evaluate two pair correctly', () => {
      const playerCards: Card[] = [
        { rank: 'J', suit: 'hearts', value: 11 },
        { rank: 'J', suit: 'clubs', value: 11 }
      ];
      const boardCards: Card[] = [
        { rank: '9', suit: 'diamonds', value: 9 },
        { rank: '9', suit: 'spades', value: 9 },
        { rank: '2', suit: 'hearts', value: 2 }
      ];

      const evaluation = engine.evaluateHand(playerCards, boardCards);
      
      expect(evaluation.rank).toBe(HandRank.TWO_PAIR);
      expect(evaluation.description).toContain('Two Pair');
    });

    it('should evaluate one pair correctly', () => {
      const playerCards: Card[] = [
        { rank: '10', suit: 'hearts', value: 10 },
        { rank: '10', suit: 'clubs', value: 10 }
      ];
      const boardCards: Card[] = [
        { rank: 'A', suit: 'diamonds', value: 14 },
        { rank: '7', suit: 'spades', value: 7 },
        { rank: '3', suit: 'hearts', value: 3 }
      ];

      const evaluation = engine.evaluateHand(playerCards, boardCards);
      
      expect(evaluation.rank).toBe(HandRank.PAIR);
      expect(evaluation.description).toContain('Pair');
    });

    it('should evaluate high card correctly', () => {
      const playerCards: Card[] = [
        { rank: 'A', suit: 'hearts', value: 14 },
        { rank: '9', suit: 'clubs', value: 9 }
      ];
      const boardCards: Card[] = [
        { rank: '7', suit: 'diamonds', value: 7 },
        { rank: '5', suit: 'spades', value: 5 },
        { rank: '3', suit: 'hearts', value: 3 }
      ];

      const evaluation = engine.evaluateHand(playerCards, boardCards);
      
      expect(evaluation.rank).toBe(HandRank.HIGH_CARD);
      expect(evaluation.description).toContain('High Card');
    });

    it('should handle empty board cards', () => {
      const playerCards: Card[] = [
        { rank: 'A', suit: 'hearts', value: 14 },
        { rank: 'K', suit: 'clubs', value: 13 }
      ];

      const evaluation = engine.evaluateHand(playerCards);
      
      expect(evaluation).toBeDefined();
      expect(evaluation.rank).toBeDefined();
    });

    it('should cache evaluation results', () => {
      const playerCards: Card[] = [
        { rank: 'A', suit: 'hearts', value: 14 },
        { rank: 'K', suit: 'hearts', value: 13 }
      ];

      const evaluation1 = engine.evaluateHand(playerCards);
      const evaluation2 = engine.evaluateHand(playerCards);
      
      expect(evaluation1).toBe(evaluation2); // Same reference indicates cache hit
    });

    it('should handle insufficient cards gracefully', () => {
      const playerCards: Card[] = [
        { rank: 'A', suit: 'hearts', value: 14 }
      ];

      const evaluation = engine.evaluateHand(playerCards);
      
      expect(evaluation.rank).toBe(HandRank.HIGH_CARD);
      expect(evaluation.strength).toBe(0);
      expect(evaluation.description).toBe('No hand');
    });
  });

  describe('Equity Calculation', () => {
    it('should calculate equity for strong hands', async () => {
      const playerCards: Card[] = [
        { rank: 'A', suit: 'hearts', value: 14 },
        { rank: 'A', suit: 'clubs', value: 14 }
      ];
      const boardCards: Card[] = [
        { rank: 'K', suit: 'hearts', value: 13 },
        { rank: 'Q', suit: 'clubs', value: 12 },
        { rank: 'J', suit: 'diamonds', value: 11 }
      ];

      const equity = await engine.calculateEquity(playerCards, boardCards);
      
      expect(equity).toBeDefined();
      expect(equity.winRate).toBeGreaterThan(0);
      expect(equity.winRate + equity.tieRate + equity.loseRate).toBeCloseTo(1);
    });

    it('should use worker for Monte Carlo simulations when available', async () => {
      const mockWorker = {
        postMessage: jest.fn(),
        addEventListener: jest.fn((event: string, handler: Function) => {
          if (event === 'message') {
            // Simulate worker response
            setTimeout(() => {
              handler({
                data: {
                  type: 'monte_carlo_result',
                  result: {
                    winRate: 0.65,
                    tieRate: 0.05,
                    loseRate: 0.30,
                    confidence: 0.95
                  }
                }
              });
            }, 10);
          }
        }),
        removeEventListener: jest.fn(),
        terminate: jest.fn()
      };

      global.Worker = jest.fn().mockImplementation(() => mockWorker);
      
      const newEngine = new PokerEngine();
      const playerCards: Card[] = [
        { rank: 'K', suit: 'hearts', value: 13 },
        { rank: 'K', suit: 'clubs', value: 13 }
      ];

      const equity = await newEngine.calculateEquity(playerCards, []);
      
      expect(equity.winRate).toBe(0.65);
      expect(equity.confidence).toBe(0.95);
    });

    it('should cache equity results', async () => {
      const playerCards: Card[] = [
        { rank: 'Q', suit: 'hearts', value: 12 },
        { rank: 'Q', suit: 'clubs', value: 12 }
      ];

      const equity1 = await engine.calculateEquity(playerCards, []);
      const equity2 = await engine.calculateEquity(playerCards, []);
      
      expect(equity1).toBe(equity2); // Same reference indicates cache hit
    });

    it('should handle different iteration counts', async () => {
      const playerCards: Card[] = [
        { rank: '10', suit: 'hearts', value: 10 },
        { rank: '10', suit: 'clubs', value: 10 }
      ];

      const equity = await engine.calculateEquity(playerCards, [], 5000);
      
      expect(equity).toBeDefined();
      expect(equity.confidence).toBeLessThan(1);
    });
  });

  describe('GTO Strategy Calculation', () => {
    it('should calculate GTO strategy', async () => {
      const playerCards: Card[] = [
        { rank: 'A', suit: 'hearts', value: 14 },
        { rank: 'K', suit: 'hearts', value: 13 }
      ];
      const boardCards: Card[] = [
        { rank: 'Q', suit: 'hearts', value: 12 },
        { rank: 'J', suit: 'clubs', value: 11 },
        { rank: '10', suit: 'diamonds', value: 10 }
      ];

      const strategy = await engine.calculateGtoStrategy(
        playerCards,
        boardCards,
        100,
        1000
      );
      
      expect(strategy).toBeDefined();
      expect(strategy.actions).toBeInstanceOf(Array);
      expect(strategy.actions.length).toBeGreaterThan(0);
      expect(strategy.expectedValue).toBeDefined();
      expect(strategy.exploitability).toBeLessThanOrEqual(1);
    });

    it('should recommend different actions based on hand strength', async () => {
      const weakCards: Card[] = [
        { rank: '2', suit: 'hearts', value: 2 },
        { rank: '3', suit: 'clubs', value: 3 }
      ];
      const strongCards: Card[] = [
        { rank: 'A', suit: 'hearts', value: 14 },
        { rank: 'A', suit: 'clubs', value: 14 }
      ];

      const weakStrategy = await engine.calculateGtoStrategy(weakCards, [], 100, 1000);
      const strongStrategy = await engine.calculateGtoStrategy(strongCards, [], 100, 1000);
      
      const weakFoldAction = weakStrategy.actions.find(a => a.action === 'fold');
      const strongRaiseAction = strongStrategy.actions.find(a => a.action === 'raise');
      
      expect(weakFoldAction).toBeDefined();
      expect(strongRaiseAction).toBeDefined();
    });

    it('should use worker for GTO calculations when available', async () => {
      const mockWorker = {
        postMessage: jest.fn(),
        addEventListener: jest.fn((event: string, handler: Function) => {
          if (event === 'message') {
            setTimeout(() => {
              handler({
                data: {
                  type: 'gto_result',
                  result: {
                    actions: [
                      { action: 'raise', frequency: 0.8, sizing: 75 }
                    ],
                    expectedValue: 50,
                    exploitability: 0.05
                  }
                }
              });
            }, 10);
          }
        }),
        removeEventListener: jest.fn(),
        terminate: jest.fn()
      };

      global.Worker = jest.fn().mockImplementation(() => mockWorker);
      
      const newEngine = new PokerEngine();
      const playerCards: Card[] = [
        { rank: 'K', suit: 'hearts', value: 13 },
        { rank: 'K', suit: 'clubs', value: 13 }
      ];

      const strategy = await newEngine.calculateGtoStrategy(playerCards, [], 100, 1000);
      
      expect(strategy.actions[0].action).toBe('raise');
      expect(strategy.expectedValue).toBe(50);
    });
  });

  describe('Hand Comparison', () => {
    it('should compare hands correctly', () => {
      const hand1: Card[] = [
        { rank: 'A', suit: 'hearts', value: 14 },
        { rank: 'A', suit: 'clubs', value: 14 }
      ];
      const hand2: Card[] = [
        { rank: 'K', suit: 'hearts', value: 13 },
        { rank: 'K', suit: 'clubs', value: 13 }
      ];

      const result = engine.compareHands(hand1, hand2);
      
      expect(result).toBeGreaterThan(0); // Aces beat Kings
    });

    it('should handle ties correctly', () => {
      const hand1: Card[] = [
        { rank: 'Q', suit: 'hearts', value: 12 },
        { rank: 'Q', suit: 'clubs', value: 12 }
      ];
      const hand2: Card[] = [
        { rank: 'Q', suit: 'diamonds', value: 12 },
        { rank: 'Q', suit: 'spades', value: 12 }
      ];

      const result = engine.compareHands(hand1, hand2);
      
      expect(result).toBe(0); // Tie
    });

    it('should compare with board cards', () => {
      const hand1: Card[] = [
        { rank: '10', suit: 'hearts', value: 10 },
        { rank: '9', suit: 'hearts', value: 9 }
      ];
      const hand2: Card[] = [
        { rank: 'A', suit: 'clubs', value: 14 },
        { rank: 'K', suit: 'clubs', value: 13 }
      ];
      const board: Card[] = [
        { rank: '10', suit: 'clubs', value: 10 },
        { rank: '10', suit: 'diamonds', value: 10 },
        { rank: '2', suit: 'hearts', value: 2 },
        { rank: '3', suit: 'clubs', value: 3 },
        { rank: '4', suit: 'diamonds', value: 4 }
      ];

      const result = engine.compareHands(hand1, hand2, board);
      
      expect(result).toBeGreaterThan(0); // Three tens beats high card
    });
  });

  describe('Worker Management', () => {
    it('should handle worker initialization failure', () => {
      global.Worker = jest.fn().mockImplementation(() => {
        throw new Error('Worker not supported');
      });

      const newEngine = new PokerEngine();
      expect(newEngine).toBeDefined();
    });

    it('should terminate worker on cleanup', () => {
      const mockTerminate = jest.fn();
      const mockWorker = {
        postMessage: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        terminate: mockTerminate
      };

      global.Worker = jest.fn().mockImplementation(() => mockWorker);
      
      const newEngine = new PokerEngine();
      newEngine.cleanup();
      
      expect(mockTerminate).toHaveBeenCalled();
    });
  });

  describe('Cache Management', () => {
    it('should clear caches', () => {
      const playerCards: Card[] = [
        { rank: 'J', suit: 'hearts', value: 11 },
        { rank: 'J', suit: 'clubs', value: 11 }
      ];

      engine.evaluateHand(playerCards);
      engine.clearCache();
      
      // After clearing, a new evaluation should create a new object
      const evaluation1 = engine.evaluateHand(playerCards);
      engine.clearCache();
      const evaluation2 = engine.evaluateHand(playerCards);
      
      expect(evaluation1).not.toBe(evaluation2);
    });
  });
});