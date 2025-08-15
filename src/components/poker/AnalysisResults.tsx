import { memo } from 'react';
import type { AdvancedAnalysis } from '../../types/poker';
import {
  useAIAnalysis,
  useAIConfidence,
  useAIStrategy,
  useAnalysisSource,
} from '../../store/selectors';

interface AnalysisResultsProps {
  analysis: AdvancedAnalysis;
  calculationTime: number;
}

const AnalysisResults = memo(
  ({ analysis, calculationTime }: AnalysisResultsProps) => {
    const aiAnalysis = useAIAnalysis();
    const aiConfidence = useAIConfidence();
    const aiStrategy = useAIStrategy();
    const analysisSource = useAnalysisSource();

    if (!analysis.handEvaluation && !aiAnalysis) {
      return null;
    }

    return (
      <div className='analysis-results'>
        {/* AI Analysis Section */}
        {aiAnalysis && (
          <div className='card' style={{ marginBottom: '2rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
                color: 'var(--color-accent)',
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>🤖</span>
              <h3>O3 AI Analysis</h3>
              <span
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-text-secondary)',
                  marginLeft: 'auto',
                }}
              >
                {analysisSource}
              </span>
            </div>

            {/* AI Actions */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4
                style={{ marginBottom: '1rem', color: 'var(--color-accent)' }}
              >
                Recommended Actions
              </h4>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {aiAnalysis.actions.map((action, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '1rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: '0.5rem',
                      backgroundColor: 'var(--color-background-secondary)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '1.125rem',
                          fontWeight: '600',
                          textTransform: 'capitalize',
                          color:
                            action.action === 'fold'
                              ? 'var(--color-error)'
                              : action.action === 'raise'
                                ? 'var(--color-success)'
                                : 'var(--color-accent)',
                        }}
                      >
                        {action.action}
                      </span>
                      <span
                        style={{
                          fontSize: '0.875rem',
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        {((action.frequency || 0) * 100).toFixed(1)}% frequency
                      </span>
                    </div>

                    {action.sizing && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>
                          Bet Size: ${action.sizing}
                        </span>
                      </div>
                    )}

                    {action.expectedValue !== undefined && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        <span
                          style={{
                            color:
                              action.expectedValue > 0
                                ? 'var(--color-success)'
                                : 'var(--color-error)',
                            fontWeight: '500',
                          }}
                        >
                          Expected Value: ${action.expectedValue.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {action.reasoning && (
                      <div>
                        <span
                          style={{
                            fontSize: '0.875rem',
                            color: 'var(--color-text-secondary)',
                            fontStyle: 'italic',
                          }}
                        >
                          {action.reasoning}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Strategy Summary */}
            {aiStrategy && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4
                  style={{ marginBottom: '1rem', color: 'var(--color-accent)' }}
                >
                  Strategy Summary
                </h4>
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: 'var(--color-background-secondary)',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      lineHeight: '1.6',
                      color: 'var(--color-text)',
                    }}
                  >
                    {aiStrategy}
                  </p>
                </div>
              </div>
            )}

            {/* AI Confidence */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                backgroundColor: 'var(--color-background-secondary)',
                borderRadius: '0.5rem',
                border: '1px solid var(--color-border)',
              }}
            >
              <span style={{ color: 'var(--color-text-secondary)' }}>
                AI Confidence Level
              </span>
              <span
                style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color:
                    aiConfidence > 0.8
                      ? 'var(--color-success)'
                      : aiConfidence > 0.6
                        ? 'var(--color-warning)'
                        : 'var(--color-error)',
                }}
              >
                {(aiConfidence * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}

        {/* Traditional Analysis Section */}
        {analysis.handEvaluation && (
          <div className='card' style={{ marginBottom: '2rem' }}>
            <h3
              style={{ marginBottom: '1.5rem', color: 'var(--color-accent)' }}
            >
              Traditional Analysis
            </h3>

            {/* Hand Evaluation */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4
                style={{ marginBottom: '1rem', color: 'var(--color-accent)' }}
              >
                Hand Evaluation
              </h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: 'var(--color-background-secondary)',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div
                    style={{
                      color: 'var(--color-text-secondary)',
                      fontSize: '0.875rem',
                    }}
                  >
                    Hand Rank
                  </div>
                  <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                    {analysis.handEvaluation.description}
                  </div>
                </div>

                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: 'var(--color-background-secondary)',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div
                    style={{
                      color: 'var(--color-text-secondary)',
                      fontSize: '0.875rem',
                    }}
                  >
                    Hand Strength
                  </div>
                  <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                    {(analysis.handEvaluation.strength * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Equity Results */}
            {analysis.equityResult && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4
                  style={{ marginBottom: '1rem', color: 'var(--color-accent)' }}
                >
                  Equity Analysis
                </h4>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  <div
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--color-background-secondary)',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--color-border)',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        color: 'var(--color-success)',
                        fontSize: '1.25rem',
                        fontWeight: '600',
                      }}
                    >
                      {(analysis.equityResult.winRate * 100).toFixed(1)}%
                    </div>
                    <div
                      style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: '0.875rem',
                      }}
                    >
                      Win Rate
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--color-background-secondary)',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--color-border)',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        color: 'var(--color-warning)',
                        fontSize: '1.25rem',
                        fontWeight: '600',
                      }}
                    >
                      {(analysis.equityResult.tieRate * 100).toFixed(1)}%
                    </div>
                    <div
                      style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: '0.875rem',
                      }}
                    >
                      Tie Rate
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--color-background-secondary)',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--color-border)',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        color: 'var(--color-error)',
                        fontSize: '1.25rem',
                        fontWeight: '600',
                      }}
                    >
                      {(analysis.equityResult.loseRate * 100).toFixed(1)}%
                    </div>
                    <div
                      style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: '0.875rem',
                      }}
                    >
                      Lose Rate
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* GTO Strategy */}
            {analysis.gtoStrategy && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4
                  style={{ marginBottom: '1rem', color: 'var(--color-accent)' }}
                >
                  GTO Strategy
                </h4>
                <div
                  style={{
                    display: 'grid',
                    gap: '1rem',
                  }}
                >
                  {analysis.gtoStrategy.actions.map((action, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '1rem',
                        border: '1px solid var(--color-border)',
                        borderRadius: '0.5rem',
                        backgroundColor: 'var(--color-background-secondary)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            textTransform: 'capitalize',
                            color:
                              action.action === 'fold'
                                ? 'var(--color-error)'
                                : action.action === 'raise'
                                  ? 'var(--color-success)'
                                  : 'var(--color-accent)',
                          }}
                        >
                          {action.action}
                        </span>
                        <span
                          style={{
                            fontSize: '0.875rem',
                            color: 'var(--color-text-secondary)',
                          }}
                        >
                          {(action.frequency * 100).toFixed(1)}% frequency
                        </span>
                      </div>

                      {action.sizing && (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <span
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            Bet Size: ${action.sizing}
                          </span>
                        </div>
                      )}

                      <div style={{ marginBottom: '0.5rem' }}>
                        <span
                          style={{
                            color:
                              action.expectedValue > 0
                                ? 'var(--color-success)'
                                : 'var(--color-error)',
                            fontWeight: '500',
                          }}
                        >
                          Expected Value: ${action.expectedValue.toFixed(2)}
                        </span>
                      </div>

                      {action.reasoning && (
                        <div>
                          <span
                            style={{
                              fontSize: '0.875rem',
                              color: 'var(--color-text-secondary)',
                              fontStyle: 'italic',
                            }}
                          >
                            {action.reasoning}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginTop: '1rem',
                  }}
                >
                  <div
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--color-background-secondary)',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <div
                      style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: '0.875rem',
                      }}
                    >
                      Expected Value
                    </div>
                    <div
                      style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color:
                          analysis.gtoStrategy.expectedValue > 0
                            ? 'var(--color-success)'
                            : 'var(--color-error)',
                      }}
                    >
                      ${analysis.gtoStrategy.expectedValue.toFixed(2)}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--color-background-secondary)',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <div
                      style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: '0.875rem',
                      }}
                    >
                      Exploitability
                    </div>
                    <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                      {(analysis.gtoStrategy.exploitability * 100).toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Performance Metrics */}
        <div className='card'>
          <h3 style={{ marginBottom: '1rem', color: 'var(--color-accent)' }}>
            Performance Metrics
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--color-background-secondary)',
                borderRadius: '0.5rem',
                border: '1px solid var(--color-border)',
              }}
            >
              <div
                style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.875rem',
                }}
              >
                Calculation Time
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                {calculationTime.toFixed(1)}ms
              </div>
            </div>

            {analysis.lastUpdated && (
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--color-background-secondary)',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.875rem',
                  }}
                >
                  Last Updated
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                  {analysis.lastUpdated.toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

AnalysisResults.displayName = 'AnalysisResults';

export default AnalysisResults;
