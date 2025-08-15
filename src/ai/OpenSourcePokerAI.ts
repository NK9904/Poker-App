import type { Card, GameContext, PokerAction, AnalysisResult } from '../types/poker'
import { PokerEngine } from '../utils/pokerEngine'

interface OpenSourceConfig {
  ollamaUrl: string
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

export class OpenSourcePokerAI {
  private config: OpenSourceConfig
  private pokerEngine: PokerEngine
  private modelCache = new Map<string, AnalysisResult>()
  private trainingData: TrainingData[] = []
  private isModelAvailable = false

  constructor(config: OpenSourceConfig) {
    this.config = config
    this.pokerEngine = new PokerEngine()
    this.checkModelAvailability()
  }

  /**
   * Check if Ollama model is available
   */
  private async checkModelAvailability(): Promise<void> {
    try {
      const response = await fetch(`${this.config.ollamaUrl}/api/tags`)
      if (response.ok) {
        const models = await response.json()
        this.isModelAvailable = models.models?.some((model: any) => 
          model.name === this.config.model
        ) || false
      }
    } catch (error) {
      console.warn('Ollama not available, falling back to local analysis:', error)
      this.isModelAvailable = false
    }
  }

  /**
   * Analyze poker situation using open-source AI
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
      let analysis: AnalysisResult

      if (this.isModelAvailable) {
        // Use Ollama for AI analysis
        analysis = await this.callOllamaAPI(playerCards, boardCards, gameContext)
      } else {
        // Fallback to enhanced local analysis
        analysis = this.enhancedLocalAnalysis(playerCards, boardCards, gameContext)
      }
      
      // Cache the result
      this.modelCache.set(cacheKey, analysis)
      
      return analysis
    } catch (error) {
      console.error('AI analysis failed:', error)
      // Fallback to traditional poker engine
      return this.fallbackAnalysis(playerCards, boardCards, gameContext)
    }
  }

  /**
   * Get optimal action recommendation
   */
  async getOptimalAction(
    playerCards: Card[],
    boardCards: Card[],
    gameContext: GameContext
  ): Promise<PokerAction> {
    const analysis = await this.analyzeSituation(playerCards, boardCards, gameContext)
    
    // Select action with highest expected value
    const bestAction = analysis.actions.reduce((best, current) => 
      (current.expectedValue || 0) > (best.expectedValue || 0) ? current : best
    )
    
    return bestAction
  }

  /**
   * Call Ollama API for AI analysis
   */
  private async callOllamaAPI(
    playerCards: Card[],
    boardCards: Card[],
    gameContext: GameContext
  ): Promise<AnalysisResult> {
    const prompt = this.buildAnalysisPrompt(playerCards, boardCards, gameContext)
    
    try {
      const response = await fetch(`${this.config.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: this.config.temperature,
            num_predict: this.config.maxTokens,
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`)
      }

      const data = await response.json()
      return this.parseAnalysisResponse(data.response)
    } catch (error) {
      console.error('Ollama API call failed:', error)
      throw error
    }
  }

  /**
   * Enhanced local analysis using poker theory
   */
  private enhancedLocalAnalysis(
    playerCards: Card[],
    boardCards: Card[],
    gameContext: GameContext
  ): AnalysisResult {
    const handEval = this.pokerEngine.evaluateHand(playerCards, boardCards)
    const potOdds = this.calculatePotOdds(gameContext)
    const position = this.getPositionValue(gameContext.position)
    const stackDepth = gameContext.stackSize / gameContext.potSize
    
    // Enhanced decision logic based on poker theory
    const actions = this.calculateOptimalActions(handEval, potOdds, position, stackDepth, gameContext)
    
    return {
      actions,
      confidence: 0.75,
      overallStrategy: 'Enhanced local analysis using poker theory',
      timestamp: new Date(),
      modelVersion: 'Local-Enhanced-1.0'
    }
  }

  /**
   * Calculate pot odds
   */
  private calculatePotOdds(gameContext: GameContext): number {
    // Simplified pot odds calculation
    return gameContext.potSize / (gameContext.potSize + gameContext.stackSize)
  }

  /**
   * Get position value
   */
  private getPositionValue(position: string): number {
    switch (position) {
      case 'late': return 1.0
      case 'middle': return 0.7
      case 'early': return 0.4
      default: return 0.5
    }
  }

  /**
   * Calculate optimal actions based on poker theory
   */
  private calculateOptimalActions(
    handEval: any,
    _potOdds: number,
    _position: number,
    _stackDepth: number,
    gameContext: GameContext
  ): PokerAction[] {
    const handStrength = handEval.strength
    const actions: PokerAction[] = []

    // Fold action
    if (handStrength < 0.3) {
      actions.push({
        action: 'fold',
        frequency: 0.8,
        expectedValue: -gameContext.potSize * 0.1,
        reasoning: 'Weak hand strength suggests folding',
        confidence: 0.9
      })
    }

    // Call action
    if (handStrength >= 0.3 && handStrength < 0.7) {
      const callEV = handStrength * gameContext.potSize - (1 - handStrength) * gameContext.stackSize * 0.1
      actions.push({
        action: 'call',
        frequency: 0.6,
        expectedValue: callEV,
        reasoning: 'Moderate hand strength with good pot odds',
        confidence: 0.7
      })
    }

    // Raise action
    if (handStrength >= 0.6) {
      const raiseSize = gameContext.potSize * (0.5 + handStrength * 0.5)
      const raiseEV = handStrength * gameContext.potSize * 1.5
      actions.push({
        action: 'raise',
        frequency: 0.7,
        sizing: raiseSize,
        expectedValue: raiseEV,
        reasoning: 'Strong hand strength suggests value betting',
        confidence: 0.8
      })
    }

    // Check action (for later streets)
    if (gameContext.street && gameContext.street !== 'preflop' && handStrength < 0.5) {
      actions.push({
        action: 'check',
        frequency: 0.5,
        expectedValue: 0,
        reasoning: 'Weak hand on later streets, check to control pot size',
        confidence: 0.6
      })
    }

    return actions
  }

  /**
   * Build analysis prompt for AI
   */
  private buildAnalysisPrompt(
    playerCards: Card[],
    boardCards: Card[],
    gameContext: GameContext
  ): string {
    const handEval = this.pokerEngine.evaluateHand(playerCards, boardCards)
    
    return `You are an expert poker AI. Analyze this situation and provide optimal GTO strategy.

Game Context:
- Player Cards: ${playerCards.map(c => `${c.rank}${c.suit}`).join(', ')}
- Board Cards: ${boardCards.map(c => `${c.rank}${c.suit}`).join(', ')}
- Hand Strength: ${handEval.description} (${(handEval.strength * 100).toFixed(1)}%)
- Pot Size: $${gameContext.potSize}
- Stack Size: $${gameContext.stackSize}
- Position: ${gameContext.position}

Provide optimal actions in JSON format:
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

  /**
   * Parse AI response
   */
  private parseAnalysisResponse(response: string): AnalysisResult {
    try {
      const parsed = JSON.parse(response)
      
      return {
        actions: parsed.actions.map((action: any) => ({
          action: action.action,
          frequency: action.frequency,
          sizing: action.sizing,
          expectedValue: parseFloat(action.expectedValue),
          reasoning: action.reasoning,
          confidence: action.confidence || 0.7
        })),
        confidence: parsed.confidence,
        overallStrategy: parsed.overallStrategy,
        timestamp: new Date(),
        modelVersion: 'Ollama-1.0'
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error)
      throw new Error('Invalid response format from AI')
    }
  }

  /**
   * Fallback analysis
   */
  private fallbackAnalysis(
    playerCards: Card[],
    boardCards: Card[],
    gameContext: GameContext
  ): AnalysisResult {
    const handEval = this.pokerEngine.evaluateHand(playerCards, boardCards)
    
    const actions = [
      {
        action: 'fold' as const,
        frequency: Math.max(0, 0.3 - handEval.strength),
        sizing: 0,
        expectedValue: -gameContext.potSize * 0.1,
        reasoning: 'Weak hand strength suggests folding',
        confidence: 0.6
      },
      {
        action: 'call' as const,
        frequency: Math.min(0.7, handEval.strength),
        sizing: 0,
        expectedValue: handEval.strength * gameContext.potSize - (1 - handEval.strength) * gameContext.stackSize * 0.1,
        reasoning: 'Moderate hand strength suggests calling',
        confidence: 0.6
      },
      {
        action: 'raise' as const,
        frequency: Math.max(0, handEval.strength - 0.7),
        sizing: gameContext.potSize * 0.75,
        expectedValue: handEval.strength * gameContext.potSize * 1.5,
        reasoning: 'Strong hand strength suggests raising',
        confidence: 0.6
      }
    ].filter(a => a.frequency > 0)

    return {
      actions,
      confidence: 0.6,
      overallStrategy: 'Traditional poker engine analysis',
      timestamp: new Date(),
      modelVersion: 'Fallback-1.0'
    }
  }

  /**
   * Generate cache key
   */
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

  /**
   * Get model performance metrics
   */
  getModelMetrics(): {
    cacheSize: number
    trainingDataSize: number
    averageConfidence: number
    version: string
    modelAvailable: boolean
  } {
    const confidences = Array.from(this.modelCache.values()).map(r => r.confidence)
    const avgConfidence = confidences.length > 0 
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length 
      : 0

    return {
      cacheSize: this.modelCache.size,
      trainingDataSize: this.trainingData.length,
      averageConfidence: avgConfidence,
      version: 'OpenSource-1.0',
      modelAvailable: this.isModelAvailable
    }
  }

  /**
   * Clear cache to free memory
   */
  clearCache(): void {
    this.modelCache.clear()
  }

  /**
   * Check if model is available
   */
  isAvailable(): boolean {
    return this.isModelAvailable
  }
}