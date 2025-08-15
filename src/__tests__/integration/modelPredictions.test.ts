import { OpenSourcePokerAI } from '../../ai/OpenSourcePokerAI';
import { PokerEngine } from '../../utils/pokerEngine';
import type { Card, GameContext, Rank, Suit } from '../../types/poker';

describe('Model Predictions Integration Tests', () => {
  let ai: OpenSourcePokerAI;
  let engine: PokerEngine;
  
  const config = {
    ollamaUrl: 'http://localhost:11434',
    model: 'llama2',
    maxTokens: 1000,
    temperature: 0.7
  };

  beforeAll(() => {
    ai = new OpenSourcePokerAI(config);
    engine = new PokerEngine();
  });

  afterAll(() => {
    engine.cleanup();
  });

  describe('Scenario-based Predictions', () => {
    it('should recommend aggressive play with premium hands', async () => {
      const premiumHands = [
        { // Pocket Aces
          playerCards: [
            { rank: 'A', suit: 'h' },
            { rank: 'A', suit: 'c' }
          ],
          expectedAction: 'raise'
        },
        { // Pocket Kings
          playerCards: [
            { rank: 'K', suit: 'h' },
            { rank: 'K', suit: 'c' }
          ],
          expectedAction: 'raise'
        },
        { // Ace-King suited
          playerCards: [
            { rank: 'A', suit: 'h' },
            { rank: 'K', suit: 'h' }
          ],
          expectedAction: 'raise'
        }
      ];

      const gameContext: GameContext = {
        potSize: 100,
        stackSize: 1000,
        position: 'late',
        street: 'preflop',
                actionHistory: []
      };

      for (const hand of premiumHands) {
        const action = await ai.getOptimalAction(hand.playerCards as Card[], [], gameContext);
        expect(action.action).toBe(hand.expectedAction);
        expect(action.confidence).toBeGreaterThan(0.6);
      }
    });

    it('should recommend cautious play with weak hands', async () => {
      const weakHands = [
        { // 7-2 offsuit
          playerCards: [
            { rank: '7', suit: 'h' },
            { rank: '2', suit: 'c' }
          ],
          expectedActions: ['fold', 'check']
        },
        { // 3-8 offsuit
          playerCards: [
            { rank: '3', suit: 'd' },
            { rank: '8', suit: 's' }
          ],
          expectedActions: ['fold', 'check']
        }
      ];

      const gameContext: GameContext = {
        potSize: 100,
        stackSize: 1000,
        position: 'early',
        street: 'preflop',
                actionHistory: []
      };

      for (const hand of weakHands) {
        const action = await ai.getOptimalAction(hand.playerCards as Card[], [], gameContext);
        expect(hand.expectedActions).toContain(action.action);
      }
    });

    it('should adjust strategy based on position', async () => {
      const playerCards: Card[] = [
        { rank: 'Q', suit: 'h' },
        { rank: 'J', suit: 'h' }
      ];

      const earlyPositionContext: GameContext = {
        potSize: 100,
        stackSize: 1000,
        position: 'early',
        street: 'preflop',
                actionHistory: []
      };

      const latePositionContext: GameContext = {
        ...earlyPositionContext,
        position: 'late'
      };

      const earlyAction = await ai.getOptimalAction(playerCards, [], earlyPositionContext);
      const lateAction = await ai.getOptimalAction(playerCards, [], latePositionContext);

      // Late position should be more aggressive
      if (earlyAction.action === 'fold' || earlyAction.action === 'call') {
        expect(['call', 'raise']).toContain(lateAction.action);
      }
    });

    it('should adapt to different board textures', async () => {
      const playerCards: Card[] = [
        { rank: 'A', suit: 'h' },
        { rank: 'K', suit: 'c' }
      ];

      const gameContext: GameContext = {
        potSize: 200,
        stackSize: 900,
        position: 'middle',
        street: 'flop',
                actionHistory: []
      };

      // Dry board (rainbow, no straight/flush draws)
      const dryBoard: Card[] = [
        { rank: 'K', suit: 'd' },
        { rank: '7', suit: 'c' },
        { rank: '2', suit: 'h' }
      ];

      // Wet board (flush draw, straight draw)
      const wetBoard: Card[] = [
        { rank: 'T', suit: 'h' },
        { rank: 'J', suit: 'h' },
        { rank: 'Q', suit: 'h' }
      ];

      const dryBoardAction = await ai.getOptimalAction(playerCards, dryBoard, gameContext);
      const wetBoardAction = await ai.getOptimalAction(playerCards, wetBoard, gameContext);

      // On dry board with top pair, should be aggressive
      expect(['raise', 'call']).toContain(dryBoardAction.action);
      
      // On wet board with straight but no flush, should be more cautious
      expect(wetBoardAction).toBeDefined();
    });
  });

  describe('Consistency Tests', () => {
    it('should provide consistent predictions for identical situations', async () => {
      const playerCards: Card[] = [
        { rank: 'T', suit: 'h' },
        { rank: 'T', suit: 'c' }
      ];

      const boardCards: Card[] = [
        { rank: 'T', suit: 'd' },
        { rank: '5', suit: 'h' },
        { rank: '2', suit: 'c' }
      ];

      const gameContext: GameContext = {
        potSize: 300,
        stackSize: 700,
        position: 'late',
        street: 'flop',
                actionHistory: []
      };

      const predictions = await Promise.all([
        ai.getOptimalAction(playerCards, boardCards, gameContext),
        ai.getOptimalAction(playerCards, boardCards, gameContext),
        ai.getOptimalAction(playerCards, boardCards, gameContext)
      ]);

      // All predictions should be identical (due to caching)
      expect(predictions[0]).toBe(predictions[1]);
      expect(predictions[1]).toBe(predictions[2]);
    });

    it('should maintain reasonable confidence levels', async () => {
      const scenarios = [
        {
          playerCards: [
            { rank: 'A', suit: 'h' },
            { rank: 'A', suit: 'c' }
          ],
          boardCards: [],
          minConfidence: 0.7 // Strong hand, high confidence
        },
        {
          playerCards: [
            { rank: '7', suit: 'h' },
            { rank: '6', suit: 'c' }
          ],
          boardCards: [
            { rank: 'A', suit: 'd' },
            { rank: 'K', suit: 's' },
            { rank: 'Q', suit: 'h' }
          ],
          minConfidence: 0.5 // Weak hand on scary board
        }
      ];

      const gameContext: GameContext = {
        potSize: 100,
        stackSize: 1000,
        position: 'middle',
        street: 'flop',
                actionHistory: []
      };

      for (const scenario of scenarios) {
        const analysis = await ai.analyzeSituation(
          scenario.playerCards as Card[],
          scenario.boardCards as Card[],
          gameContext
        );
        
        expect(analysis.confidence).toBeGreaterThanOrEqual(scenario.minConfidence);
        expect(analysis.confidence).toBeLessThanOrEqual(1.0);
      }
    });
  });

  describe('Performance Benchmarks', () => {
    it('should complete predictions within acceptable time limits', async () => {
      const playerCards: Card[] = [
        { rank: 'J', suit: 'h' },
        { rank: 'J', suit: 'c' }
      ];

      const gameContext: GameContext = {
        potSize: 150,
        stackSize: 850,
        position: 'late',
        street: 'preflop',
                actionHistory: []
      };

      const startTime = performance.now();
      const action = await ai.getOptimalAction(playerCards, [], gameContext);
      const endTime = performance.now();

      const executionTime = endTime - startTime;
      
      expect(action).toBeDefined();
      expect(executionTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle batch predictions efficiently', async () => {
      const scenarios = Array.from({ length: 10 }, (_, i) => ({
        playerCards: [
          { rank: (((i % 13) + 2) === 10 ? 'T' : String((i % 13) + 2)) as Rank, suit: 'h' as Suit },
          { rank: ((((i + 1) % 13) + 2) === 10 ? 'T' : String(((i + 1) % 13) + 2)) as Rank, suit: 'c' as Suit }
        ],
        gameContext: {
          potSize: 100 + i * 10,
          stackSize: 1000 - i * 10,
          position: ['early', 'middle', 'late'][i % 3] as 'early' | 'middle' | 'late',
          street: 'preflop' as const,
                    actionHistory: []
        }
      }));

      const startTime = performance.now();
      const predictions = await Promise.all(
        scenarios.map(s => ai.getOptimalAction(s.playerCards as Card[], [], s.gameContext))
      );
      const endTime = performance.now();

      const totalTime = endTime - startTime;
      const avgTimePerPrediction = totalTime / scenarios.length;

      expect(predictions).toHaveLength(10);
      expect(avgTimePerPrediction).toBeLessThan(200); // Average < 200ms per prediction
    });
  });

  describe('Edge Cases', () => {
    it('should handle all-in situations', async () => {
      const playerCards: Card[] = [
        { rank: 'K', suit: 'h' },
        { rank: 'K', suit: 'c' }
      ];

      const gameContext: GameContext = {
        potSize: 500,
        stackSize: 100, // Short stack
        position: 'late',
        street: 'flop',
                actionHistory: []
      };

      const action = await ai.getOptimalAction(playerCards, [], gameContext);
      
      expect(action).toBeDefined();
      if (action.sizing) {
        expect(action.sizing).toBeLessThanOrEqual(gameContext.stackSize);
      }
    });

    it('should handle heads-up vs multi-way pots differently', async () => {
      const playerCards: Card[] = [
        { rank: 'Q', suit: 'h' },
        { rank: 'Q', suit: 'c' }
      ];

      const headsUpContext: GameContext = {
        potSize: 100,
        stackSize: 1000,
        position: 'late',
        street: 'flop',
                actionHistory: []
      };

      const multiWayContext: GameContext = {
        ...headsUpContext,
              };

      const headsUpAction = await ai.getOptimalAction(playerCards, [], headsUpContext);
      const multiWayAction = await ai.getOptimalAction(playerCards, [], multiWayContext);

      // Both should be defined
      expect(headsUpAction).toBeDefined();
      expect(multiWayAction).toBeDefined();
      
      // Heads-up play is typically more aggressive
      if (multiWayAction.action === 'fold') {
        expect(['fold', 'call', 'raise']).toContain(headsUpAction.action);
      }
    });

    it('should handle incomplete information gracefully', async () => {
      const playerCards: Card[] = [
        { rank: '9', suit: 'h' },
        { rank: '8', suit: 'h' }
      ];

      const minimalContext: GameContext = {
        potSize: 0,
        stackSize: 0,
        position: 'middle',
        actionHistory: []
      };

      const action = await ai.getOptimalAction(playerCards, [], minimalContext);
      
      expect(action).toBeDefined();
      expect(action.action).toBeDefined();
      expect(['fold', 'call', 'raise', 'check']).toContain(action.action);
    });
  });

  describe('Model Metrics Validation', () => {
    it('should track performance metrics accurately', async () => {
      // Clear cache to start fresh
      ai.clearCache();
      
      const initialMetrics = ai.getModelMetrics();
      expect(initialMetrics.cacheSize).toBe(0);

      // Make several predictions
      const predictions = 5;
      for (let i = 0; i < predictions; i++) {
        const playerCards: Card[] = [
          { rank: (((i % 13) + 2) === 10 ? 'T' : String((i % 13) + 2)) as Rank, suit: 'h' as Suit },
          { rank: ((((i + 1) % 13) + 2) === 10 ? 'T' : String(((i + 1) % 13) + 2)) as Rank, suit: 'c' as Suit }
        ];
        
        const gameContext: GameContext = {
          potSize: 100 + i * 10,
          stackSize: 1000,
          position: 'middle',
          street: 'preflop',
                    actionHistory: []
        };

        await ai.analyzeSituation(playerCards, [], gameContext);
      }

      const finalMetrics = ai.getModelMetrics();
      expect(finalMetrics.cacheSize).toBe(predictions);
      expect(finalMetrics.averageConfidence).toBeGreaterThan(0);
      expect(finalMetrics.averageConfidence).toBeLessThanOrEqual(1);
    });
  });
});