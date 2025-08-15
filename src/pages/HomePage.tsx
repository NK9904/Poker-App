import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Brain, 
  Zap, 
  Target, 
  BarChart3, 
  Bot, 
  Star, 
  ArrowRight,
  Play,
  Code,
  Shield,
  Globe,
  Users,
  CheckCircle
} from 'lucide-react'
import { usePokerStore } from '../store/pokerStore'
import { useAIAvailable, useModelMetrics } from '../store/selectors'

const HomePage: React.FC = () => {
  const { toggleAIAssistant } = usePokerStore()
  const isAIAvailable = useAIAvailable()
  const modelMetrics = useModelMetrics()

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced GTO solver using open-source AI models for optimal poker strategy',
      color: 'from-blue-600 to-purple-600'
    },
    {
      icon: Bot,
      title: '3D AI Assistant',
      description: 'Immersive 3D interface with real-time poker move suggestions',
      color: 'from-green-600 to-teal-600'
    },
    {
      icon: Target,
      title: 'Range Calculator',
      description: 'Professional-grade range analysis with GTO principles',
      color: 'from-orange-600 to-red-600'
    },
    {
      icon: BarChart3,
      title: 'Hand Analyzer',
      description: 'Detailed hand breakdown with equity calculations',
      color: 'from-purple-600 to-pink-600'
    }
  ]

  const benefits = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized performance with instant analysis results'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Open-source AI runs locally, keeping your data secure'
    },
    {
      icon: Globe,
      title: 'Cost Effective',
      description: 'No API fees - use powerful AI models for free'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Built by poker players, for poker players'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-400 text-sm mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Star className="w-4 h-4" />
              <span>Powered by Open-Source AI</span>
            </motion.div>

            <h1 className="text-5xl lg:text-7xl font-bold text-gradient mb-6">
              Master Poker with
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                AI Intelligence
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Advanced GTO solver with 3D AI assistant. Get professional-level poker analysis 
              using open-source AI models - no fees, no limits.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/solver"
                className="btn btn-primary text-lg px-8 py-4 flex items-center gap-2 group"
              >
                <Play className="w-5 h-5" />
                Start Analyzing
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              {isAIAvailable && (
                <button
                  onClick={toggleAIAssistant}
                  className="btn btn-secondary text-lg px-8 py-4 flex items-center gap-2"
                >
                  <Bot className="w-5 h-5" />
                  Try 3D Assistant
                </button>
              )}
            </div>

            {/* AI Status */}
            {modelMetrics && (
              <motion.div 
                className="mt-8 p-4 bg-green-600/20 border border-green-500/30 rounded-xl inline-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-3 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span>AI Model Active - {modelMetrics.version}</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Everything You Need to
              <br />
              <span className="text-gradient">Dominate the Tables</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Professional-grade tools that give you the edge in any poker game
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  className="card group hover:scale-105 transition-transform duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-800/30">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Why Choose
              <br />
              <span className="text-gradient">Open-Source AI</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Experience the future of poker analysis without the traditional costs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <motion.div
                  key={benefit.title}
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{benefit.title}</h3>
                  <p className="text-gray-300">{benefit.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform
              <br />
              <span className="text-gradient">Your Poker Game?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of players who are already using AI to improve their game
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/solver"
                className="btn btn-primary text-lg px-8 py-4 flex items-center gap-2"
              >
                <Brain className="w-5 h-5" />
                Start Free Analysis
              </Link>
              
              <a
                href="https://github.com/your-repo"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary text-lg px-8 py-4 flex items-center gap-2"
              >
                <Code className="w-5 h-5" />
                View Source Code
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default HomePage