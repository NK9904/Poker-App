import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { LoadingSpinner } from './components/LoadingSpinner'
import Navigation from './components/Navigation'
import { PerformancePanel } from './components/PerformancePanel'

// Lazy load pages for better performance
const HomePage = React.lazy(() => import('./pages/HomePage'))
const PokerSolver = React.lazy(() => import('./pages/PokerSolver'))
const HandAnalyzer = React.lazy(() => import('./pages/HandAnalyzer'))
const RangeCalculator = React.lazy(() => import('./pages/RangeCalculator'))

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="app">
          <Navigation />
          <main className="main-content">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/solver" element={<PokerSolver />} />
                <Route path="/analyzer" element={<HandAnalyzer />} />
                <Route path="/ranges" element={<RangeCalculator />} />
              </Routes>
            </Suspense>
          </main>
          <PerformancePanel />
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App