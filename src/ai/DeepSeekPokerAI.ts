import type { Card, GameContext, PokerAction, AnalysisResult } from '../types/poker'
import { PokerEngine } from '../utils/pokerEngine'

interface DeepSeekConfig {
  apiKey: string
  model: string
  maxTokens: number
  temperature: number
}

interface TrainingData {
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
}

export class DeepSeekPokerAI {
  private config: DeepSeekConfig
  private pokerEngine: PokerEngine
  private modelCache = new Map<string, AnalysisResult>()
  private trainingData: TrainingData[] = []

  constructor(config: DeepSeekConfig) {
    this.config = config
    this.pokerEngine = new PokerEngine()
  }

  /**
   * Analyze poker situation using DeepSeek AI
   */
  async analyzeSituation(
    playerCards: Card[],
    boardCards: Card[],
    gameContext: GameContext
  ): Promise<AnalysisResult> {
    const cacheKey = this.generateCacheKey(playerCards, boardCards, gameContext)
    
    if (this.modelCache.has(cacheKey)) {
      return this.modelCache.get(cacheKey)!
    }

    try {
      // Prepare context for DeepSeek
      const prompt = this.buildAnalysisPrompt(playerCards, boardCards, gameContext)
      
      // Call DeepSeek API
      const response = await this.callDeepSeekAPI(prompt)
      
      // Parse and validate response
      const analysis = this.parseAnalysisResponse(response)
      
      // Cache the result
      this.modelCache.set(cacheKey, analysis)
      
      return analysis
    } catch (error) {
      console.error('DeepSeek analysis failed:', error)
      // Fallback to traditional poker engine
      return this.fallbackAnalysis(playerCards, boardCards, gameContext)
    }
  }

  /**
   * Get optimal action recommendation from DeepSeek
   */
  async getOptimalAction(
    playerCards: Card[],
    boardCards: Card[],
    gameContext: GameContext
  ): Promise<PokerAction> {
    const analysis = await this.analyzeSituation(playerCards, boardCards, gameContext)
    
    // Select action with highest expected value
    const bestAction = analysis.actions.reduce((best, current) => 
      current.expectedValue > best.expectedValue ? current : best
    )
    
    return bestAction
  }

  /**
   * Train the model with new data from professional players
   */
  async trainWithProData(trainingData: TrainingData[]): Promise<void> {
    this.trainingData.push(...trainingData)
    
    // Fine-tune the model with new data
    await this.fineTuneModel()
  }

  /**
   * Update model with latest professional player data
   */
  async updateModelWithLatestData(): Promise<void> {
    // This would integrate with the data scraping system
    const latestData = await this.fetchLatestProData()
    await this.trainWithProData(latestData)
  }

  private buildAnalysisPrompt(
    playerCards: Card[],
    boardCards: Card[],
    gameContext: GameContext
  ): string {
    const handEval = this.pokerEngine.evaluateHand(playerCards, boardCards)
    
    return `You are an expert poker AI trained on millions of professional poker hands. Analyze this situation and provide optimal GTO strategy.

Game Context:
- Player Cards: ${playerCards.map(c => `${c.rank}${c.suit}`).join(', ')}
- Board Cards: ${boardCards.map(c => `${c.rank}${c.suit}`).join(', ')}
- Hand Strength: ${handEval.description} (${(handEval.strength * 100).toFixed(1)}%)
- Pot Size: $${gameContext.potSize}
- Stack Size: $${gameContext.stackSize}
- Position: ${gameContext.position}

Based on your training on professional poker data, provide:
1. Optimal action (fold/call/raise/check)
2. Bet sizing if raising
3. Expected value of each action
4. Confidence level
5. Reasoning based on GTO principles

Respond in JSON format:
{
  "actions": [
    {
      "action": "fold|call|raise|check",
      "frequency": 0.0-1.0,
      "sizing": "amount if raising",
      "expectedValue": "expected value",
      "reasoning": "explanation"
    }
  ],
  "confidence": 0.0-1.0,
  "overallStrategy": "summary"
}`
  }

  private async callDeepSeekAPI(prompt: string): Promise<string> {
    // This would use the actual DeepSeek API
    // For now, we'll simulate the API call
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert poker AI trained on professional player data.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature
      })
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  private parseAnalysisResponse(response: string): AnalysisResult {
    try {
      const parsed = JSON.parse(response)
      
      return {
        actions: parsed.actions.map((action: any) => ({
          action: action.action,
          frequency: action.frequency,
          sizing: action.sizing,
          expectedValue: parseFloat(action.expectedValue),
          reasoning: action.reasoning
        })),
        confidence: parsed.confidence,
        overallStrategy: parsed.overallStrategy,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Failed to parse DeepSeek response:', error)
      throw new Error('Invalid response format from DeepSeek')
    }
  }

  private fallbackAnalysis(
    playerCards: Card[],
    boardCards: Card[],
    gameContext: GameContext
  ): AnalysisResult {
    // Fallback to traditional poker engine analysis
    const handEval = this.pokerEngine.evaluateHand(playerCards, boardCards)
    
    const actions = [
      {
        action: 'fold' as const,
        frequency: Math.max(0, 0.3 - handEval.strength),
        sizing: 0,
        expectedValue: -gameContext.potSize * 0.1,
        reasoning: 'Weak hand strength suggests folding'
      },
      {
        action: 'call' as const,
        frequency: Math.min(0.7, handEval.strength),
        sizing: 0,
        expectedValue: handEval.strength * gameContext.potSize - (1 - handEval.strength) * gameContext.stackSize * 0.1,
        reasoning: 'Moderate hand strength suggests calling'
      },
      {
        action: 'raise' as const,
        frequency: Math.max(0, handEval.strength - 0.7),
        sizing: gameContext.potSize * 0.75,
        expectedValue: handEval.strength * gameContext.potSize * 1.5,
        reasoning: 'Strong hand strength suggests raising'
      }
    ].filter(a => a.frequency > 0)

    return {
      actions,
      confidence: 0.6,
      overallStrategy: 'Traditional poker engine analysis',
      timestamp: new Date()
    }
  }

  private generateCacheKey(
    playerCards: Card[],
    boardCards: Card[],
    gameContext: GameContext
  ): string {
    const cards = [...playerCards, ...boardCards]
      .sort((a, b) => a.rank.localeCompare(b.rank) || a.suit.localeCompare(b.suit))
      .map(c => `${c.rank}${c.suit}`)
      .join('')
    
    return `${cards}_${gameContext.potSize}_${gameContext.stackSize}_${gameContext.position}`
  }

  private async fineTuneModel(): Promise<void> {
    // This would implement model fine-tuning with the collected data
    console.log(`Fine-tuning model with ${this.trainingData.length} new training examples`)
    
    // In a real implementation, this would:
    // 1. Prepare the training data
    // 2. Call DeepSeek's fine-tuning API
    // 3. Update the model configuration
    // 4. Validate the new model performance
  }

  private async fetchLatestProData(): Promise<TrainingData[]> {
    // This would integrate with the data scraping system
    // For now, return empty array
    return []
  }

  /**
   * Get model performance metrics
   */
  getModelMetrics(): {
    cacheSize: number
    trainingDataSize: number
    averageConfidence: number
  } {
    const confidences = Array.from(this.modelCache.values()).map(r => r.confidence)
    const avgConfidence = confidences.length > 0 
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length 
      : 0

    return {
      cacheSize: this.modelCache.size,
      trainingDataSize: this.trainingData.length,
      averageConfidence: avgConfidence
    }
  }

  /**
   * Clear cache to free memory
   */
  clearCache(): void {
    this.modelCache.clear()
  }
}