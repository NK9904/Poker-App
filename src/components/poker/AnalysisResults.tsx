import React, { memo } from 'react'
import type { AdvancedAnalysis, GtoAction } from '../../types/poker'
import { MetricDisplay } from '../ui/MetricDisplay'

interface AnalysisResultsProps {
  analysis: AdvancedAnalysis
  calculationTime: number
}

const GtoActionDisplay = memo<{ action: GtoAction }>(({ action }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    backgroundColor: 'var(--color-bg-secondary)',
    borderRadius: '0.5rem'
  }}>
    <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>
      {action.action}
      {action.sizing && ` (${action.sizing})`}
    </span>
    <span style={{ color: 'var(--color-accent)' }}>
      {(action.frequency * 100).toFixed(1)}%
    </span>
  </div>
))

GtoActionDisplay.displayName = 'GtoActionDisplay'

export const AnalysisResults = memo<AnalysisResultsProps>(({ 
  analysis, 
  calculationTime 
}) => {
  if (!analysis.handEvaluation) return null

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-accent)' }}>
        Detailed Analysis
      </h3>
      
      {/* Equity Results */}
      {analysis.equityResult && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>
            Equity Simulation
          </h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '1rem' 
          }}>
            <MetricDisplay
              label="Win Rate"
              value={`${(analysis.equityResult.winRate * 100).toFixed(1)}%`}
              color="var(--color-success)"
            />
            <MetricDisplay
              label="Tie Rate"
              value={`${(analysis.equityResult.tieRate * 100).toFixed(1)}%`}
              color="var(--color-warning)"
            />
            <MetricDisplay
              label="Lose Rate"
              value={`${(analysis.equityResult.loseRate * 100).toFixed(1)}%`}
              color="var(--color-danger)"
            />
            <MetricDisplay
              label="Confidence"
              value={`${(analysis.equityResult.confidence * 100).toFixed(1)}%`}
              color="var(--color-accent)"
            />
          </div>
        </div>
      )}

      {/* GTO Strategy */}
      {analysis.gtoStrategy && (
        <div>
          <h4 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>
            GTO Strategy
          </h4>
          <div style={{ marginBottom: '1rem' }}>
            <MetricDisplay
              label="Expected Value"
              value={analysis.gtoStrategy.expectedValue.toFixed(2)}
              color="var(--color-accent)"
            />
          </div>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {analysis.gtoStrategy.actions.map((action, index) => (
              <GtoActionDisplay key={index} action={action} />
            ))}
          </div>
        </div>
      )}

      {/* Calculation Performance */}
      <div style={{ 
        marginTop: '1.5rem', 
        padding: '1rem', 
        backgroundColor: 'rgba(59, 130, 246, 0.1)', 
        borderRadius: '0.5rem' 
      }}>
        <MetricDisplay
          label="Analysis Time"
          value={`${calculationTime.toFixed(1)}ms`}
          color="var(--color-accent)"
          size="sm"
        />
      </div>
    </div>
  )
})

AnalysisResults.displayName = 'AnalysisResults'