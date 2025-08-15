import { memo, useCallback, useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Zap, Target, TrendingUp, AlertCircle, CheckCircle, Bot } from 'lucide-react'
import { usePokerStore } from '../store/pokerStore'
import {
  usePlayerCards,
  useBoardCards,
  useHandStrength,
  useEquity,
  useHandDescription,
  useAnalysis,
  useGameContext,
  useAIAvailable,
  useModelMetrics,
  useAIAssistantVisible,
  useAIAssistantActions,
  useAIAssistantMetrics
} from '../store/selectors'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { CardDisplay } from '../components/ui/CardDisplay'
import { MetricDisplay } from '../components/ui/MetricDisplay'
import { CardSelector } from '../components/poker/CardSelector'
import { GameContextControls } from '../components/poker/GameContextControls'
import AnalysisResults from '../components/poker/AnalysisResults'
import { AIAssistant3D } from '../components/ai/AIAssistant3D'
import { CardUtils } from '../utils/cardUtils'

const PokerSolver = memo(() => {
  const [calculationTime, setCalculationTime] = useState<number>(0)
  const { 
    setPlayerCards, 
    setBoardCards, 
    setLoading, 
    isLoading, 
    runFullAnalysis,
    runAIAnalysis,
    setGameContext,
    initializeAI,
    clearAICache,
    toggleAIAssistant,
    setAIAssistantVisible,
    selectAction
  } = usePokerStore()
  
  const playerCards = usePlayerCards()
  const boardCards = useBoardCards()
  const handStrength = useHandStrength()
  const equity = useEquity()
  const handDescription = useHandDescription()
  const analysis = useAnalysis()
  const gameContext = useGameContext()
  const isAIAvailable = useAIAvailable()
  const modelMetrics = useModelMetrics()
  const aiAssistantVisible = useAIAssistantVisible()
  const aiAssistantActions = useAIAssistantActions()
  const aiAssistantMetrics = useAIAssistantMetrics()

  // Initialize AI on component mount
  useEffect(() => {
    initializeAI()
  }, [initializeAI])

  // Enhanced calculation function with AI modeling
  const runAdvancedAnalysis = useCallback(async () => {
    const startTime = performance.now()
    setLoading(true)

    try {
      // Run comprehensive AI analysis if available
      if (isAIAvailable) {
        await runAIAnalysis()
        // Show AI assistant after analysis
        setAIAssistantVisible(true)
      } else {
        // Fallback to traditional analysis
        await runFullAnalysis()
      }
      
      const endTime = performance.now()
      setCalculationTime(endTime - startTime)
    } finally {
      setLoading(false)
    }
  }, [runFullAnalysis, runAIAnalysis, setLoading, isAIAvailable, setAIAssistantVisible])

  // Enhanced card selection with better validation
  const handlePlayerCardSelect = useCallback((cardString: string) => {
    const card = CardUtils.stringToCard(cardString)
    if (!card) return
    
    const allSelectedCards = [...playerCards, ...boardCards]
    if (CardUtils.canSelectCard(card, playerCards, allSelectedCards, 2)) {
      setPlayerCards(prev => [...prev, card])
    }
  }, [playerCards, boardCards, setPlayerCards])

  const handleBoardCardSelect = useCallback((cardString: string) => {
    const card = CardUtils.stringToCard(cardString)
    if (!card) return
    
    const allSelectedCards = [...playerCards, ...boardCards]
    if (CardUtils.canSelectCard(card, boardCards, allSelectedCards, 5)) {
      setBoardCards(prev => [...prev, card])
    }
  }, [playerCards, boardCards, setBoardCards])

  // Remove card handlers
  const removePlayerCard = useCallback((index: number) => {
    setPlayerCards(prev => prev.filter((_, i) => i !== index))
  }, [setPlayerCards])

  const removeBoardCard = useCallback((index: number) => {
    setBoardCards(prev => prev.filter((_, i) => i !== index))
  }, [setBoardCards])

  // Game context handlers
  const handleGameContextChange = useCallback((updates: Partial<typeof gameContext>) => {
    setGameContext(updates)
  }, [setGameContext])

  // AI status indicator
  const aiStatusIndicator = useMemo(() => {
    if (!isAIAvailable) {
      return (
        <motion.div 
          className="p-4 bg-yellow-600/20 border border-yellow-500/30 rounded-xl mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <div>
              <div className="text-yellow-100 font-medium">AI Features Limited</div>
              <div className="text-yellow-200/80 text-sm">
                Using enhanced local analysis. Install Ollama for full AI capabilities.
              </div>
            </div>
          </div>
        </motion.div>
      )
    }

    if (modelMetrics) {
      return (
        <motion.div 
          className="p-4 bg-green-600/20 border border-green-500/30 rounded-xl mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-green-100 font-medium">
                  Open-Source AI Active (v{modelMetrics.version})
                </div>
                <div className="text-green-200/80 text-sm">
                  {modelMetrics.modelAvailable ? 'Ollama Model Available' : 'Local Analysis Mode'}
                </div>
              </div>
            </div>
            <button 
              onClick={clearAICache}
              className="px-3 py-1 bg-green-600/30 hover:bg-green-600/50 text-green-100 
                         rounded-lg transition-colors text-sm"
            >
              Clear Cache
            </button>
          </div>
        </motion.div>
      )
    }

    return (
      <motion.div 
        className="p-4 bg-blue-600/20 border border-blue-500/30 rounded-xl mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="loading-spinner w-5 h-5"></div>
          <div className="text-blue-100">Initializing AI model...</div>
        </div>
      </motion.div>
    )
  }, [isAIAvailable, modelMetrics, clearAICache])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
            AI Poker Solver
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Advanced GTO solver powered by open-source AI with 3D assistant
          </p>
        </motion.div>

        {aiStatusIndicator}

        {/* Game Context Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GameContextControls
            gameContext={gameContext}
            onPotSizeChange={(size) => handleGameContextChange({ potSize: size })}
            onStackSizeChange={(size) => handleGameContextChange({ stackSize: size })}
            onPositionChange={(position) => handleGameContextChange({ position })}
          />
        </motion.div>

        {/* Card Selection Grid */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Player Cards */}
          <div className="card">
            <h3 className="text-xl font-semibold text-blue-400 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Your Cards
            </h3>
            <div className="mb-4">
              {playerCards.length > 0 ? (
                <div className="flex gap-3 flex-wrap">
                  {playerCards.map((card, index) => (
                    <CardDisplay 
                      key={index} 
                      card={card} 
                      onRemove={() => removePlayerCard(index)}
                      removable
                      size="lg"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-center py-8">
                  <div className="text-4xl mb-2">🃏</div>
                  <div>Select your hole cards</div>
                </div>
              )}
            </div>
            <CardSelector
              onCardSelect={handlePlayerCardSelect}
              selectedCards={playerCards}
              allSelectedCards={[...playerCards, ...boardCards]}
              maxCards={2}
              title="Select Player Cards"
            />
          </div>

          {/* Board Cards */}
          <div className="card">
            <h3 className="text-xl font-semibold text-green-400 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Board Cards
            </h3>
            <div className="mb-4">
              {boardCards.length > 0 ? (
                <div className="flex gap-3 flex-wrap">
                  {boardCards.map((card, index) => (
                    <CardDisplay 
                      key={index} 
                      card={card} 
                      onRemove={() => removeBoardCard(index)}
                      removable
                      size="lg"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-center py-8">
                  <div className="text-4xl mb-2">🎯</div>
                  <div>Select community cards</div>
                </div>
              )}
            </div>
            <CardSelector
              onCardSelect={handleBoardCardSelect}
              selectedCards={boardCards}
              allSelectedCards={[...playerCards, ...boardCards]}
              maxCards={5}
              title="Select Board Cards"
            />
          </div>
        </motion.div>

        {/* Analysis Section */}
        <motion.div 
          className="card mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold text-purple-400 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                {isAIAvailable ? 'AI-Powered Analysis' : 'Advanced Analysis'}
              </h3>
              {aiAssistantActions.hasActions && (
                <button
                  onClick={toggleAIAssistant}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                           text-sm transition-colors flex items-center gap-2"
                >
                  <Bot className="w-4 h-4" />
                  {aiAssistantVisible ? 'Hide' : 'Show'} 3D Assistant
                </button>
              )}
            </div>
            
            <button 
              onClick={runAdvancedAnalysis}
              disabled={isLoading || playerCards.length === 0}
              className="btn btn-primary flex items-center gap-2 px-6 py-3 text-lg"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Analyzing...
                </>
              ) : (
                <>
                  {isAIAvailable ? <Brain className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                  {isAIAvailable ? 'Run AI Analysis' : 'Run Analysis'}
                </>
              )}
            </button>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <MetricDisplay
              label="Hand"
              value={handDescription}
              color="text-blue-400"
            />
            <MetricDisplay
              label="Strength"
              value={`${(handStrength * 100).toFixed(1)}%`}
              color="text-purple-400"
            />
            <MetricDisplay
              label="Equity"
              value={`${(equity * 100).toFixed(1)}%`}
              color="text-green-400"
            />
            <MetricDisplay
              label="Analysis Time"
              value={`${calculationTime.toFixed(1)}ms`}
              color="text-yellow-400"
            />
            {modelMetrics && (
              <MetricDisplay
                label="AI Confidence"
                value={`${(aiAssistantMetrics.confidence * 100).toFixed(1)}%`}
                color="text-cyan-400"
              />
            )}
          </div>
        </motion.div>

        {/* Analysis Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <AnalysisResults analysis={analysis} calculationTime={calculationTime} />
        </motion.div>
      </div>

      {/* 3D AI Assistant */}
      <AIAssistant3D
        analysis={analysis.aiAnalysis || null}
        isLoading={isLoading}
        onActionSelect={selectAction}
        isVisible={aiAssistantVisible}
        onToggleVisibility={() => setAIAssistantVisible(false)}
      />
    </div>
  )
})

PokerSolver.displayName = 'PokerSolver'

export default PokerSolver