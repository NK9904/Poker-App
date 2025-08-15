import { memo } from 'react';
import type { GameContext } from '../../types/poker';

interface GameContextControlsProps {
  gameContext: GameContext;
  onPotSizeChange: (size: number) => void;
  onStackSizeChange: (size: number) => void;
  onPositionChange: (position: GameContext['position']) => void;
}

export const GameContextControls = memo<GameContextControlsProps>(
  ({ gameContext, onPotSizeChange, onStackSizeChange, onPositionChange }) => {
    return (
      <div className='card' style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--color-accent)' }}>
          Game Context
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
              }}
            >
              Pot Size
            </label>
            <input
              type='number'
              value={gameContext.potSize}
              onChange={e => onPotSizeChange(Number(e.target.value))}
              className='btn'
              style={{ width: '100%', textAlign: 'left' }}
              min='1'
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
              }}
            >
              Stack Size
            </label>
            <input
              type='number'
              value={gameContext.stackSize}
              onChange={e => onStackSizeChange(Number(e.target.value))}
              className='btn'
              style={{ width: '100%', textAlign: 'left' }}
              min='1'
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
              }}
            >
              Position
            </label>
            <select
              value={gameContext.position}
              onChange={e =>
                onPositionChange(e.target.value as GameContext['position'])
              }
              className='btn'
              style={{ width: '100%' }}
            >
              <option value='early'>Early Position</option>
              <option value='middle'>Middle Position</option>
              <option value='late'>Late Position</option>
            </select>
          </div>
        </div>
      </div>
    );
  }
);

GameContextControls.displayName = 'GameContextControls';
