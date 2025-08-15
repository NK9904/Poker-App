import { OpenSourcePokerAI } from '../../ai/OpenSourcePokerAI';
import { PokerEngine } from '../../utils/pokerEngine';
import type { Card, GameContext } from '../../types/poker';

interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  p50: number;
  p95: number;
  p99: number;
}

describe('Model Performance Benchmarks', () => {
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

  const runBenchmark = async (
    name: string,
    iterations: number,
    testFn: () => Promise<void>
  ): Promise<BenchmarkResult> => {
    const times: number[] = [];
    
    // Warm-up runs
    for (let i = 0; i < 5; i++) {
      await testFn();
    }

    // Actual benchmark runs
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await testFn();
      const end = performance.now();
      times.push(end - start);
    }

    times.sort((a, b) => a - b);
    
    return {
      name,
      iterations,
      totalTime: times.reduce((a, b) => a + b, 0),
      avgTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: times[0],
      maxTime: times[times.length - 1],
      p50: times[Math.floor(times.length * 0.5)],
      p95: times[Math.floor(times.length * 0.95)],
      p99: times[Math.floor(times.length * 0.99)]
    };
  };

  const logBenchmarkResult = (result: BenchmarkResult) => {
    console.log(`
Benchmark: ${result.name}
====================================
Iterations: ${result.iterations}
Total Time: ${result.totalTime.toFixed(2)}ms
Average: ${result.avgTime.toFixed(2)}ms
Min: ${result.minTime.toFixed(2)}ms
Max: ${result.maxTime.toFixed(2)}ms
P50: ${result.p50.toFixed(2)}ms
P95: ${result.p95.toFixed(2)}ms
P99: ${result.p99.toFixed(2)}ms
====================================
    `);
  };

  describe('Single Prediction Benchmarks', () => {
    it('should benchmark simple hand evaluation', async () => {
      const playerCards: Card[] = [
        { rank: 'A', suit: 'hearts', value: 14 },
        { rank: 'K', suit: 'hearts', value: 13 }
      ];

      const gameContext: GameContext = {
        potSize: 100,
        stackSize: 1000,
        position: 'late',
        street: 'preflop',
        players: 4,
        actionHistory: []
      };

      const result = await runBenchmark(
        'Simple Hand Evaluation',
        100,
        async () => {
          await ai.getOptimalAction(playerCards, [], gameContext);
        }
      );

      logBenchmarkResult(result);
      
      expect(result.avgTime).toBeLessThan(50); // Should average < 50ms
      expect(result.p95).toBeLessThan(100); // 95th percentile < 100ms
    });

    it('should benchmark complex board evaluation', async () => {
      const playerCards: Card[] = [
        { rank: 'Q', suit: 'hearts', value: 12 },
        { rank: 'J', suit: 'hearts', value: 11 }
      ];

      const boardCards: Card[] = [
        { rank: '10', suit: 'hearts', value: 10 },
        { rank: '9', suit: 'hearts', value: 9 },
        { rank: '8', suit: 'clubs', value: 8 }
      ];

      const gameContext: GameContext = {
        potSize: 500,
        stackSize: 1500,
        position: 'middle',
        street: 'turn',
        players: 3,
        actionHistory: []
      };

      const result = await runBenchmark(
        'Complex Board Evaluation',
        100,
        async () => {
          // Clear cache to force recalculation
          ai.clearCache();
          await ai.getOptimalAction(playerCards, boardCards, gameContext);
        }
      );

      logBenchmarkResult(result);
      
      expect(result.avgTime).toBeLessThan(100); // Should average < 100ms
      expect(result.p95).toBeLessThan(200); // 95th percentile < 200ms
    });
  });

  describe('Batch Processing Benchmarks', () => {
    it('should benchmark parallel predictions', async () => {
      const scenarios = Array.from({ length: 20 }, (_, i) => ({
        playerCards: [
          { rank: ['A', 'K', 'Q', 'J'][i % 4], suit: 'hearts', value: 14 - (i % 4) },
          { rank: ['A', 'K', 'Q', 'J'][(i + 1) % 4], suit: 'clubs', value: 14 - ((i + 1) % 4) }
        ] as Card[],
        gameContext: {
          potSize: 100 + i * 10,
          stackSize: 1000,
          position: ['early', 'middle', 'late'][i % 3] as 'early' | 'middle' | 'late',
          street: 'preflop' as const,
          players: 4,
          actionHistory: []
        }
      }));

      const result = await runBenchmark(
        'Parallel Batch Processing (20 hands)',
        50,
        async () => {
          await Promise.all(
            scenarios.map(s => 
              ai.getOptimalAction(s.playerCards, [], s.gameContext)
            )
          );
        }
      );

      logBenchmarkResult(result);
      
      const avgPerHand = result.avgTime / scenarios.length;
      expect(avgPerHand).toBeLessThan(10); // < 10ms per hand when parallel
    });

    it('should benchmark sequential predictions', async () => {
      const scenarios = Array.from({ length: 10 }, (_, i) => ({
        playerCards: [
          { rank: ['A', 'K', 'Q', 'J'][i % 4], suit: 'hearts', value: 14 - (i % 4) },
          { rank: ['A', 'K', 'Q', 'J'][(i + 1) % 4], suit: 'clubs', value: 14 - ((i + 1) % 4) }
        ] as Card[],
        gameContext: {
          potSize: 100 + i * 10,
          stackSize: 1000,
          position: ['early', 'middle', 'late'][i % 3] as 'early' | 'middle' | 'late',
          street: 'preflop' as const,
          players: 4,
          actionHistory: []
        }
      }));

      const result = await runBenchmark(
        'Sequential Processing (10 hands)',
        50,
        async () => {
          for (const scenario of scenarios) {
            await ai.getOptimalAction(scenario.playerCards, [], scenario.gameContext);
          }
        }
      );

      logBenchmarkResult(result);
      
      const avgPerHand = result.avgTime / scenarios.length;
      expect(avgPerHand).toBeLessThan(20); // < 20ms per hand sequential
    });
  });

  describe('Cache Performance', () => {
    it('should benchmark cache hit performance', async () => {
      const playerCards: Card[] = [
        { rank: 'K', suit: 'hearts', value: 13 },
        { rank: 'K', suit: 'clubs', value: 13 }
      ];

      const gameContext: GameContext = {
        potSize: 200,
        stackSize: 800,
        position: 'late',
        street: 'flop',
        players: 4,
        actionHistory: []
      };

      // Prime the cache
      await ai.getOptimalAction(playerCards, [], gameContext);

      const result = await runBenchmark(
        'Cache Hit Performance',
        1000, // More iterations since it should be very fast
        async () => {
          await ai.getOptimalAction(playerCards, [], gameContext);
        }
      );

      logBenchmarkResult(result);
      
      expect(result.avgTime).toBeLessThan(1); // Cache hits should be < 1ms
      expect(result.p99).toBeLessThan(5); // Even 99th percentile < 5ms
    });

    it('should benchmark cache miss performance', async () => {
      const result = await runBenchmark(
        'Cache Miss Performance',
        100,
        async () => {
          // Generate unique hands to force cache misses
          const uniqueValue = Math.random();
          const playerCards: Card[] = [
            { rank: 'A', suit: 'hearts', value: 14 },
            { rank: 'K', suit: 'clubs', value: 13 }
          ];

          const gameContext: GameContext = {
            potSize: Math.floor(100 + uniqueValue * 100),
            stackSize: 1000,
            position: 'middle',
            street: 'preflop',
            players: 4,
            actionHistory: []
          };

          ai.clearCache(); // Force cache miss
          await ai.getOptimalAction(playerCards, [], gameContext);
        }
      );

      logBenchmarkResult(result);
      
      expect(result.avgTime).toBeLessThan(50); // Cache misses < 50ms
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory with large cache', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Generate many unique scenarios
      for (let i = 0; i < 1000; i++) {
        const playerCards: Card[] = [
          { rank: String((i % 13) + 2), suit: 'hearts', value: (i % 13) + 2 },
          { rank: String(((i + 1) % 13) + 2), suit: 'clubs', value: ((i + 1) % 13) + 2 }
        ];

        const gameContext: GameContext = {
          potSize: 100 + i,
          stackSize: 1000 - i,
          position: ['early', 'middle', 'late'][i % 3] as 'early' | 'middle' | 'late',
          street: 'preflop',
          players: 4,
          actionHistory: []
        };

        await ai.analyzeSituation(playerCards, [], gameContext);
      }

      const afterCacheMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = (afterCacheMemory - initialMemory) / 1024 / 1024; // MB

      // Clear cache and check memory is released
      ai.clearCache();
      global.gc && global.gc(); // Force garbage collection if available

      const afterClearMemory = process.memoryUsage().heapUsed;
      const memoryAfterClear = (afterClearMemory - initialMemory) / 1024 / 1024; // MB

      console.log(`
Memory Usage:
====================================
Initial: ${(initialMemory / 1024 / 1024).toFixed(2)} MB
After 1000 cache entries: ${(afterCacheMemory / 1024 / 1024).toFixed(2)} MB
Increase: ${memoryIncrease.toFixed(2)} MB
After clear: ${(afterClearMemory / 1024 / 1024).toFixed(2)} MB
Final increase: ${memoryAfterClear.toFixed(2)} MB
====================================
      `);

      expect(memoryIncrease).toBeLessThan(50); // Should use < 50MB for 1000 entries
      expect(memoryAfterClear).toBeLessThan(10); // Should release most memory
    });
  });

  describe('Stress Testing', () => {
    it('should handle rapid concurrent requests', async () => {
      const concurrentRequests = 100;
      
      const result = await runBenchmark(
        `Stress Test (${concurrentRequests} concurrent)`,
        10,
        async () => {
          const promises = Array.from({ length: concurrentRequests }, (_, i) => {
            const playerCards: Card[] = [
              { rank: ['A', 'K', 'Q', 'J'][i % 4], suit: 'hearts', value: 14 - (i % 4) },
              { rank: ['A', 'K', 'Q', 'J'][(i + 1) % 4], suit: 'clubs', value: 14 - ((i + 1) % 4) }
            ];

            const gameContext: GameContext = {
              potSize: 100 + i,
              stackSize: 1000,
              position: 'middle',
              street: 'preflop',
              players: 4,
              actionHistory: []
            };

            return ai.getOptimalAction(playerCards, [], gameContext);
          });

          await Promise.all(promises);
        }
      );

      logBenchmarkResult(result);
      
      expect(result.avgTime).toBeLessThan(1000); // Should complete 100 requests < 1s
      expect(result.p99).toBeLessThan(2000); // 99th percentile < 2s
    });
  });

  describe('Performance Summary', () => {
    it('should generate performance report', async () => {
      const benchmarks: BenchmarkResult[] = [];

      // Run all benchmarks
      benchmarks.push(await runBenchmark('Quick Evaluation', 50, async () => {
        const cards: Card[] = [
          { rank: 'A', suit: 'hearts', value: 14 },
          { rank: 'A', suit: 'clubs', value: 14 }
        ];
        const context: GameContext = {
          potSize: 100,
          stackSize: 1000,
          position: 'late',
          street: 'preflop',
          players: 4,
          actionHistory: []
        };
        await ai.getOptimalAction(cards, [], context);
      }));

      benchmarks.push(await runBenchmark('Complex Evaluation', 50, async () => {
        const cards: Card[] = [
          { rank: '7', suit: 'hearts', value: 7 },
          { rank: '6', suit: 'hearts', value: 6 }
        ];
        const board: Card[] = [
          { rank: '5', suit: 'hearts', value: 5 },
          { rank: '4', suit: 'clubs', value: 4 },
          { rank: '3', suit: 'diamonds', value: 3 }
        ];
        const context: GameContext = {
          potSize: 500,
          stackSize: 1500,
          position: 'middle',
          street: 'turn',
          players: 3,
          actionHistory: []
        };
        ai.clearCache();
        await ai.getOptimalAction(cards, board, context);
      }));

      // Generate summary report
      console.log(`
╔════════════════════════════════════════════════════════════════╗
║                   PERFORMANCE SUMMARY REPORT                      ║
╠════════════════════════════════════════════════════════════════╣
`);

      benchmarks.forEach(b => {
        console.log(`║ ${b.name.padEnd(30)} │ Avg: ${b.avgTime.toFixed(2).padStart(8)}ms │ P95: ${b.p95.toFixed(2).padStart(8)}ms ║`);
      });

      console.log(`╚════════════════════════════════════════════════════════════════╝
`);

      // All benchmarks should meet performance targets
      benchmarks.forEach(b => {
        expect(b.avgTime).toBeLessThan(200); // All operations < 200ms average
      });
    });
  });
});