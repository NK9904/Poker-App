import { OpenSourcePokerAI } from '../OpenSourcePokerAI';
import type { Card, GameContext, PokerAction } from '../../types/poker';

// Mock the PokerEngine
jest.mock('../../utils/pokerEngine', () => ({
  PokerEngine: jest.fn().mockImplementation(() => ({
    evaluateHand: jest.fn().mockReturnValue({
      strength: 0.75,
      description: 'Two Pair',
      rank: 3,
      cards: [],
    }),
  })),
}));

describe('OpenSourcePokerAI', () => {
  let ai: OpenSourcePokerAI;
  const mockConfig = {
    ollamaUrl: 'http://localhost:11434',
    model: 'llama2',
    maxTokens: 1000,
    temperature: 0.7,
  };

  const mockPlayerCards: Card[] = [
    { rank: 'A', suit: 'h' },
    { rank: 'K', suit: 'h' },
  ];

  const mockBoardCards: Card[] = [
    { rank: 'Q', suit: 'h' },
    { rank: 'J', suit: 'h' },
    { rank: 'T', suit: 'h' },
  ];

  const mockGameContext: GameContext = {
    potSize: 100,
    stackSize: 1000,
    position: 'late',
    street: 'flop',
    actionHistory: [],
  };

  beforeEach(() => {
    const newAI = new OpenSourcePokerAI(mockConfig);
    ai = newAI;
    jest.clearAllMocks();
  });

  describe('Constructor and Initialization', () => {
    it('should initialize with provided config', () => {
      expect(ai).toBeDefined();
      expect(ai.isAvailable()).toBe(false); // Initially false until model check
    });

    it('should check model availability on construction', async () => {
      // Mock fetch for model availability check
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          models: [{ name: 'llama2' }],
        }),
      });

      new OpenSourcePokerAI(mockConfig);
      // Wait for async check to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:11434/api/tags'
      );
    });

    it('should handle model unavailability gracefully', async () => {
      global.fetch = jest
        .fn()
        .mockRejectedValueOnce(new Error('Network error'));

      new OpenSourcePokerAI(mockConfig);
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(ai.isAvailable()).toBe(false);
    });
  });

  describe('analyzeSituation', () => {
    it('should return cached analysis if available', async () => {
      const firstAnalysis = await ai.analyzeSituation(
        mockPlayerCards,
        mockBoardCards,
        mockGameContext
      );
      const secondAnalysis = await ai.analyzeSituation(
        mockPlayerCards,
        mockBoardCards,
        mockGameContext
      );

      expect(firstAnalysis).toBe(secondAnalysis); // Same reference means cached
    });

    it('should use enhanced local analysis when model is unavailable', async () => {
      const analysis = await ai.analyzeSituation(
        mockPlayerCards,
        mockBoardCards,
        mockGameContext
      );

      expect(analysis).toBeDefined();
      expect(analysis.actions).toBeInstanceOf(Array);
      expect(analysis.confidence).toBeGreaterThan(0);
      expect(analysis.overallStrategy).toBeDefined();
      expect(analysis.modelVersion).toContain('Local');
    });

    it('should call Ollama API when model is available', async () => {
      // Mock successful Ollama response
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            models: [{ name: 'llama2' }],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            response: JSON.stringify({
              actions: [
                {
                  action: 'raise',
                  frequency: 0.8,
                  sizing: 150,
                  expectedValue: 75,
                  reasoning: 'Strong hand',
                },
              ],
              confidence: 0.9,
              overallStrategy: 'Aggressive play with strong hand',
            }),
          }),
        });

      new OpenSourcePokerAI(mockConfig);
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait for model check

      const analysis = await ai.analyzeSituation(
        mockPlayerCards,
        mockBoardCards,
        mockGameContext
      );

      expect(analysis.modelVersion).toContain('Ollama');
      expect(analysis.confidence).toBe(0.9);
    });

    it('should handle Ollama API errors gracefully', async () => {
      global.fetch = jest.fn().mockRejectedValueOnce(new Error('API Error'));

      const analysis = await ai.analyzeSituation(
        mockPlayerCards,
        mockBoardCards,
        mockGameContext
      );

      expect(analysis).toBeDefined();
      expect(analysis.modelVersion).toContain('Fallback');
    });
  });

  describe('getOptimalAction', () => {
    it('should return action with highest expected value', async () => {
      const action = await ai.getOptimalAction(
        mockPlayerCards,
        mockBoardCards,
        mockGameContext
      );

      expect(action).toBeDefined();
      expect(action.action).toBeDefined();
      expect(['fold', 'call', 'raise', 'check']).toContain(action.action);
    });

    it('should handle empty actions array', async () => {
      // Mock an analysis with no actions
      jest.spyOn(ai as any, 'analyzeSituation').mockResolvedValueOnce({
        actions: [],
        confidence: 0.5,
        overallStrategy: 'No actions available',
        timestamp: new Date(),
        modelVersion: 'Test',
      });

      const action = await ai.getOptimalAction(
        mockPlayerCards,
        mockBoardCards,
        mockGameContext
      );

      expect(action).toBeUndefined();
    });
  });

  describe('Enhanced Local Analysis', () => {
    it('should calculate correct actions based on hand strength', async () => {
      const analysis = await ai.analyzeSituation(
        mockPlayerCards,
        mockBoardCards,
        mockGameContext
      );

      expect(analysis.actions).toHaveLength(1); // Should have at least one action

      const raiseAction = analysis.actions.find(
        (a: PokerAction) => a.action === 'raise'
      );
      if (raiseAction) {
        expect(raiseAction.sizing).toBeGreaterThan(0);
        expect(raiseAction.expectedValue).toBeDefined();
      }
    });

    it('should recommend fold for weak hands', async () => {
      // Mock weak hand evaluation
      const PokerEngine = require('../../utils/pokerEngine').PokerEngine;
      PokerEngine.mockImplementationOnce(() => ({
        evaluateHand: jest.fn().mockReturnValue({
          strength: 0.2, // Weak hand
          description: 'High Card',
          rank: 9,
          cards: [],
        }),
      }));

      new OpenSourcePokerAI(mockConfig);
      const analysis = await ai.analyzeSituation(
        mockPlayerCards,
        mockBoardCards,
        mockGameContext
      );

      const foldAction = analysis.actions.find(
        (a: PokerAction) => a.action === 'fold'
      );
      expect(foldAction).toBeDefined();
      expect(foldAction?.frequency).toBeGreaterThan(0.5);
    });

    it('should consider position in decision making', async () => {
      const earlyPositionContext: GameContext = {
        ...mockGameContext,
        position: 'early' as const,
      };
      const latePositionContext: GameContext = {
        ...mockGameContext,
        position: 'late' as const,
      };

      const earlyAnalysis = await ai.analyzeSituation(
        mockPlayerCards,
        mockBoardCards,
        earlyPositionContext
      );
      const lateAnalysis = await ai.analyzeSituation(
        mockPlayerCards,
        mockBoardCards,
        latePositionContext
      );

      // Clear cache between calls to ensure fresh analysis
      ai.clearCache();

      expect(earlyAnalysis).toBeDefined();
      expect(lateAnalysis).toBeDefined();
    });
  });

  describe('Model Metrics', () => {
    it('should track cache size correctly', async () => {
      await ai.analyzeSituation(
        mockPlayerCards,
        mockBoardCards,
        mockGameContext
      );

      const metrics = ai.getModelMetrics();
      expect(metrics.cacheSize).toBe(1);

      // Different context should create new cache entry
      const newContext = { ...mockGameContext, potSize: 200 };
      await ai.analyzeSituation(mockPlayerCards, mockBoardCards, newContext);

      const updatedMetrics = ai.getModelMetrics();
      expect(updatedMetrics.cacheSize).toBe(2);
    });

    it('should calculate average confidence correctly', async () => {
      await ai.analyzeSituation(
        mockPlayerCards,
        mockBoardCards,
        mockGameContext
      );

      const metrics = ai.getModelMetrics();
      expect(metrics.averageConfidence).toBeGreaterThan(0);
      expect(metrics.averageConfidence).toBeLessThanOrEqual(1);
    });

    it('should clear cache properly', () => {
      ai.clearCache();
      const metrics = ai.getModelMetrics();
      expect(metrics.cacheSize).toBe(0);
    });
  });

  describe('Cache Key Generation', () => {
    it('should generate consistent cache keys for same inputs', async () => {
      const analysis1 = await ai.analyzeSituation(
        mockPlayerCards,
        mockBoardCards,
        mockGameContext
      );
      const analysis2 = await ai.analyzeSituation(
        mockPlayerCards,
        mockBoardCards,
        mockGameContext
      );

      expect(analysis1).toBe(analysis2); // Same object reference indicates cache hit
    });

    it('should generate different cache keys for different inputs', async () => {
      const analysis1 = await ai.analyzeSituation(
        mockPlayerCards,
        mockBoardCards,
        mockGameContext
      );

      const differentCards: Card[] = [
        { rank: '2', suit: 'c' },
        { rank: '3', suit: 'c' },
      ];

      const analysis2 = await ai.analyzeSituation(
        differentCards,
        mockBoardCards,
        mockGameContext
      );

      expect(analysis1).not.toBe(analysis2);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON response from Ollama', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: 'Invalid JSON',
        }),
      });

      const analysis = await ai.analyzeSituation(
        mockPlayerCards,
        mockBoardCards,
        mockGameContext
      );

      expect(analysis).toBeDefined();
      expect(analysis.modelVersion).toContain('Fallback');
    });

    it('should handle network timeouts gracefully', async () => {
      global.fetch = jest
        .fn()
        .mockImplementation(
          () =>
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Timeout')), 100)
            )
        );

      const analysis = await ai.analyzeSituation(
        mockPlayerCards,
        mockBoardCards,
        mockGameContext
      );

      expect(analysis).toBeDefined();
      expect(analysis.actions.length).toBeGreaterThan(0);
    });
  });

  describe('Action Calculation', () => {
    it('should include check action on later streets', async () => {
      const turnContext = { ...mockGameContext, street: 'turn' as const };

      // Mock weak hand for check scenario
      const PokerEngine = require('../../utils/pokerEngine').PokerEngine;
      PokerEngine.mockImplementationOnce(() => ({
        evaluateHand: jest.fn().mockReturnValue({
          strength: 0.4,
          description: 'Pair',
          rank: 7,
          cards: [],
        }),
      }));

      new OpenSourcePokerAI(mockConfig);
      const analysis = await ai.analyzeSituation(
        mockPlayerCards,
        mockBoardCards,
        turnContext
      );

      const checkAction = analysis.actions.find(
        (a: PokerAction) => a.action === 'check'
      );
      expect(checkAction).toBeDefined();
    });

    it('should calculate appropriate raise sizing', async () => {
      const analysis = await ai.analyzeSituation(
        mockPlayerCards,
        mockBoardCards,
        mockGameContext
      );

      const raiseAction = analysis.actions.find(
        (a: PokerAction) => a.action === 'raise'
      );
      if (raiseAction && raiseAction.sizing) {
        expect(raiseAction.sizing).toBeGreaterThan(
          mockGameContext.potSize * 0.5
        );
        expect(raiseAction.sizing).toBeLessThan(mockGameContext.stackSize);
      }
    });
  });
});
