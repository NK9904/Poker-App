import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Brain,
  BarChart3,
  Target,
  Menu,
  X,
  Bot,
  Settings,
  Github,
} from 'lucide-react';
import { usePokerStore } from '../store/pokerStore';
import {
  useAIAssistantVisible,
  useAIAssistantStatus,
} from '../store/selectors';

const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { toggleAIAssistant } = usePokerStore();
  const aiAssistantVisible = useAIAssistantVisible();
  const aiAssistantStatus = useAIAssistantStatus();

  const navigationItems = [
    {
      path: '/',
      label: 'Home',
      icon: Home,
      description: 'Welcome to Poker AI',
    },
    {
      path: '/solver',
      label: 'AI Solver',
      icon: Brain,
      description: 'Advanced poker analysis',
    },
    {
      path: '/analyzer',
      label: 'Hand Analyzer',
      icon: BarChart3,
      description: 'Detailed hand breakdown',
    },
    {
      path: '/ranges',
      label: 'Range Calculator',
      icon: Target,
      description: 'GTO range analysis',
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className='hidden lg:block fixed top-0 left-0 h-full w-64 bg-gray-900/95 backdrop-blur-md border-r border-gray-700/50 z-40'>
        <div className='p-6'>
          {/* Logo */}
          <Link to='/' className='block mb-8'>
            <motion.div
              className='flex items-center gap-3 text-2xl font-bold text-gradient'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className='w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center'>
                <Brain className='w-6 h-6 text-white' />
              </div>
              <span>Poker AI</span>
            </motion.div>
          </Link>

          {/* Navigation Items */}
          <div className='space-y-2'>
            {navigationItems.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block p-3 rounded-xl transition-all duration-200 group ${
                    isActive(item.path)
                      ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400'
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                  }`}
                >
                  <motion.div
                    className='flex items-center gap-3'
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className='w-5 h-5' />
                    <div>
                      <div className='font-medium'>{item.label}</div>
                      <div className='text-xs opacity-60'>
                        {item.description}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* AI Assistant Toggle */}
          <div className='mt-8 pt-6 border-t border-gray-700/50'>
            <button
              onClick={toggleAIAssistant}
              className={`w-full p-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                aiAssistantVisible
                  ? 'bg-green-600/20 border border-green-500/30 text-green-400'
                  : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
              }`}
            >
              <Bot className='w-5 h-5' />
              <div className='text-left'>
                <div className='font-medium'>3D AI Assistant</div>
                <div className='text-xs opacity-60 capitalize'>
                  {aiAssistantStatus}
                </div>
              </div>
            </button>
          </div>

          {/* Footer Links */}
          <div className='mt-auto pt-6 border-t border-gray-700/50'>
            <div className='flex items-center justify-between text-sm text-gray-400'>
              <Link
                to='/settings'
                className='flex items-center gap-2 hover:text-white transition-colors'
              >
                <Settings className='w-4 h-4' />
                Settings
              </Link>
              <a
                href='https://github.com/your-repo'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-2 hover:text-white transition-colors'
              >
                <Github className='w-4 h-4' />
                GitHub
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Header */}
      <header className='lg:hidden fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-b border-gray-700/50 z-40'>
        <div className='flex items-center justify-between p-4'>
          {/* Logo */}
          <Link to='/' className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center'>
              <Brain className='w-5 h-5 text-white' />
            </div>
            <span className='text-xl font-bold text-gradient'>Poker AI</span>
          </Link>

          {/* Mobile Menu Button */}
          <div className='flex items-center gap-2'>
            <button
              onClick={toggleAIAssistant}
              className={`p-2 rounded-lg transition-all duration-200 ${
                aiAssistantVisible
                  ? 'bg-green-600/20 text-green-400'
                  : 'bg-gray-800/50 text-gray-300 hover:text-white'
              }`}
            >
              <Bot className='w-5 h-5' />
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className='p-2 bg-gray-800/50 text-gray-300 hover:text-white rounded-lg transition-colors'
            >
              {isMobileMenuOpen ? (
                <X className='w-5 h-5' />
              ) : (
                <Menu className='w-5 h-5' />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className='lg:hidden fixed inset-0 bg-black/50 z-50'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              className='absolute top-0 right-0 h-full w-80 bg-gray-900/95 backdrop-blur-md border-l border-gray-700/50 p-6'
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Mobile Menu Header */}
              <div className='flex items-center justify-between mb-8'>
                <div className='flex items-center gap-2'>
                  <div className='w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center'>
                    <Brain className='w-5 h-5 text-white' />
                  </div>
                  <span className='text-xl font-bold text-gradient'>
                    Poker AI
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className='p-2 text-gray-400 hover:text-white transition-colors'
                >
                  <X className='w-5 h-5' />
                </button>
              </div>

              {/* Mobile Navigation Items */}
              <div className='space-y-2'>
                {navigationItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block p-3 rounded-xl transition-all duration-200 ${
                        isActive(item.path)
                          ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400'
                          : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                      }`}
                    >
                      <div className='flex items-center gap-3'>
                        <Icon className='w-5 h-5' />
                        <div>
                          <div className='font-medium'>{item.label}</div>
                          <div className='text-xs opacity-60'>
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Mobile Footer */}
              <div className='mt-8 pt-6 border-t border-gray-700/50'>
                <div className='flex items-center justify-between text-sm text-gray-400'>
                  <Link
                    to='/settings'
                    className='flex items-center gap-2 hover:text-white transition-colors'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className='w-4 h-4' />
                    Settings
                  </Link>
                  <a
                    href='https://github.com/your-repo'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center gap-2 hover:text-white transition-colors'
                  >
                    <Github className='w-4 h-4' />
                    GitHub
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for desktop navigation */}
      <div className='hidden lg:block w-64' />

      {/* Spacer for mobile header */}
      <div className='lg:hidden h-16' />
    </>
  );
};

export default Navigation;
