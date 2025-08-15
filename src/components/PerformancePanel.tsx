import { memo, useState } from 'react';
import { usePerformance } from '../hooks/usePerformance';

export const PerformancePanel = memo(() => {
  const { data, refresh } = usePerformance();
  const [isVisible, setIsVisible] = useState(false);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          backgroundColor: 'var(--color-accent)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '3rem',
          height: '3rem',
          cursor: 'pointer',
          fontSize: '1.2rem',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1000,
        }}
        title='Show Performance Panel'
      >
        ⚡
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid #374151',
        borderRadius: 'var(--border-radius)',
        padding: '1rem',
        minWidth: '300px',
        maxWidth: '400px',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 1000,
        fontSize: '0.875rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <h4 style={{ margin: 0, color: 'var(--color-accent)' }}>
          Performance Monitor
        </h4>
        <div>
          <button
            onClick={refresh}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              marginRight: '0.5rem',
              fontSize: '1rem',
            }}
            title='Refresh'
          >
            🔄
          </button>
          <button
            onClick={() => setIsVisible(false)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
            title='Close'
          >
            ✕
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {/* Bundle Size */}
        <div>
          <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
            Bundle Size
          </div>
          <div style={{ color: 'var(--color-text-secondary)' }}>
            JS: {data.bundleSize.js}KB | CSS: {data.bundleSize.css}KB | Total:{' '}
            {data.bundleSize.total}KB
          </div>
          <div
            style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#374151',
              borderRadius: '2px',
              marginTop: '0.25rem',
            }}
          >
            <div
              style={{
                width: `${Math.min(100, (data.bundleSize.total / 200) * 100)}%`,
                height: '100%',
                backgroundColor:
                  data.bundleSize.total < 150
                    ? 'var(--color-success)'
                    : data.bundleSize.total < 200
                      ? 'var(--color-warning)'
                      : 'var(--color-danger)',
                borderRadius: '2px',
              }}
            />
          </div>
        </div>

        {/* Memory Usage */}
        {data.memory && (
          <div>
            <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
              Memory Usage
            </div>
            <div style={{ color: 'var(--color-text-secondary)' }}>
              {data.memory.used.toFixed(1)}MB / {data.memory.total.toFixed(1)}MB
            </div>
            <div
              style={{
                width: '100%',
                height: '4px',
                backgroundColor: '#374151',
                borderRadius: '2px',
                marginTop: '0.25rem',
              }}
            >
              <div
                style={{
                  width: `${(data.memory.used / data.memory.total) * 100}%`,
                  height: '100%',
                  backgroundColor:
                    data.memory.used / data.memory.total < 0.7
                      ? 'var(--color-success)'
                      : data.memory.used / data.memory.total < 0.9
                        ? 'var(--color-warning)'
                        : 'var(--color-danger)',
                  borderRadius: '2px',
                }}
              />
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.5rem',
          }}
        >
          <div>
            <div style={{ fontWeight: '500', fontSize: '0.8rem' }}>FPS</div>
            <div
              style={{
                color:
                  data.fps >= 55
                    ? 'var(--color-success)'
                    : data.fps >= 30
                      ? 'var(--color-warning)'
                      : 'var(--color-danger)',
              }}
            >
              {data.fps || 'N/A'}
            </div>
          </div>
          <div>
            <div style={{ fontWeight: '500', fontSize: '0.8rem' }}>
              Long Tasks
            </div>
            <div
              style={{
                color:
                  data.longTasks === 0
                    ? 'var(--color-success)'
                    : 'var(--color-warning)',
              }}
            >
              {data.longTasks}
            </div>
          </div>
          <div>
            <div style={{ fontWeight: '500', fontSize: '0.8rem' }}>
              Layout Shifts
            </div>
            <div
              style={{
                color:
                  data.layoutShifts <= 2
                    ? 'var(--color-success)'
                    : 'var(--color-warning)',
              }}
            >
              {data.layoutShifts}
            </div>
          </div>
          <div>
            <div style={{ fontWeight: '500', fontSize: '0.8rem' }}>Grade</div>
            <div
              style={{
                color:
                  getPerformanceGrade(data) === 'A'
                    ? 'var(--color-success)'
                    : getPerformanceGrade(data) === 'B'
                      ? 'var(--color-warning)'
                      : 'var(--color-danger)',
              }}
            >
              {getPerformanceGrade(data)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

function getPerformanceGrade(data: any): string {
  let score = 0;

  // Bundle size scoring (30 points)
  if (data.bundleSize.total < 150) {
    score += 30;
  } else if (data.bundleSize.total < 200) {
    score += 20;
  } else {
    score += 10;
  }

  // FPS scoring (25 points)
  if (data.fps >= 55) {
    score += 25;
  } else if (data.fps >= 30) {
    score += 15;
  } else {
    score += 5;
  }

  // Memory scoring (25 points)
  if (data.memory) {
    const memoryRatio = data.memory.used / data.memory.total;
    if (memoryRatio < 0.7) {
      score += 25;
    } else if (memoryRatio < 0.9) {
      score += 15;
    } else {
      score += 5;
    }
  } else {
    score += 20; // Neutral if memory not available
  }

  // Long tasks scoring (10 points)
  if (data.longTasks === 0) {
    score += 10;
  } else if (data.longTasks <= 2) {
    score += 5;
  }

  // Layout shifts scoring (10 points)
  if (data.layoutShifts <= 2) {
    score += 10;
  } else if (data.layoutShifts <= 5) {
    score += 5;
  }

  if (score >= 85) {
    return 'A';
  }
  if (score >= 70) {
    return 'B';
  }
  if (score >= 55) {
    return 'C';
  }
  return 'D';
}

PerformancePanel.displayName = 'PerformancePanel';
