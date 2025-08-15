import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Cylinder, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import {
  Brain,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import * as THREE from 'three';
import type { PokerAction, AnalysisResult } from '../../types/poker';

interface AIAssistant3DProps {
  analysis: AnalysisResult | null;
  isLoading: boolean;
  onActionSelect: (action: PokerAction) => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

// 3D Brain Component
function BrainModel({ isThinking }: { isThinking: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(state => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group>
      {/* Main brain structure */}
      <Sphere ref={meshRef} args={[1, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color={isThinking ? '#3b82f6' : '#64748b'}
          emissive={isThinking ? '#1e40af' : '#334155'}
          emissiveIntensity={isThinking ? 0.3 : 0.1}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>

      {/* Neural connections */}
      {Array.from({ length: 20 }).map((_, i) => (
        <Cylinder
          key={i}
          args={[0.02, 0.02, 0.5]}
          position={[
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
          ]}
          rotation={[
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI,
          ]}
        >
          <meshStandardMaterial
            color={isThinking ? '#60a5fa' : '#475569'}
            emissive={isThinking ? '#3b82f6' : '#334155'}
            emissiveIntensity={isThinking ? 0.5 : 0.1}
            transparent
            opacity={0.7}
          />
        </Cylinder>
      ))}
    </group>
  );
}

// Floating Action Cards
function ActionCards({
  actions,
  onActionSelect,
}: {
  actions: PokerAction[];
  onActionSelect: (action: PokerAction) => void;
}) {
  return (
    <group position={[0, -2, 0]}>
      {actions.map((action, index) => {
        const angle = (index / actions.length) * Math.PI * 2;
        const radius = 3;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <Html key={action.action} position={[x, 0, z]} center>
            <motion.div
              className='action-card-3d'
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onActionSelect(action)}
            >
              <div
                className={`
                p-4 rounded-xl shadow-2xl cursor-pointer transform transition-all duration-200
                ${action.action === 'fold' ? 'bg-red-600 text-white' : ''}
                ${action.action === 'call' ? 'bg-yellow-600 text-white' : ''}
                ${action.action === 'raise' ? 'bg-green-600 text-white' : ''}
                ${action.action === 'check' ? 'bg-gray-600 text-white' : ''}
              `}
              >
                <div className='text-center'>
                  <div className='text-2xl font-bold mb-1'>
                    {action.action.toUpperCase()}
                  </div>
                  <div className='text-sm opacity-90'>
                    {((action.frequency || 0) * 100).toFixed(0)}%
                  </div>
                  {action.sizing && (
                    <div className='text-xs mt-1'>${action.sizing}</div>
                  )}
                </div>
              </div>
            </motion.div>
          </Html>
        );
      })}
    </group>
  );
}

// Performance Metrics
function PerformanceMetrics({ analysis }: { analysis: AnalysisResult | null }) {
  if (!analysis) {
    return null;
  }

  return (
    <Html position={[0, 2, 0]} center>
      <div className='bg-gray-900/90 backdrop-blur-md rounded-xl p-4 border border-gray-700/50'>
        <div className='text-center text-white'>
          <div className='text-lg font-semibold mb-2'>AI Analysis</div>
          <div className='text-sm opacity-90'>
            Confidence: {(analysis.confidence * 100).toFixed(0)}%
          </div>
          <div className='text-xs opacity-75 mt-1'>{analysis.modelVersion}</div>
        </div>
      </div>
    </Html>
  );
}

// Main 3D Scene
function Scene({
  analysis,
  isLoading,
  onActionSelect,
}: {
  analysis: AnalysisResult | null;
  isLoading: boolean;
  onActionSelect: (action: PokerAction) => void;
}) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color='#3b82f6' />

      {/* Brain Model */}
      <BrainModel isThinking={isLoading} />

      {/* Action Cards */}
      {analysis && analysis.actions.length > 0 && (
        <ActionCards
          actions={analysis.actions}
          onActionSelect={onActionSelect}
        />
      )}

      {/* Performance Metrics */}
      <PerformanceMetrics analysis={analysis} />

      {/* Background Elements */}
      <group position={[0, 0, -5]}>
        {Array.from({ length: 50 }).map((_, i) => (
          <Sphere
            key={i}
            args={[0.1, 8, 8]}
            position={[
              (Math.random() - 0.5) * 20,
              (Math.random() - 0.5) * 20,
              (Math.random() - 0.5) * 10,
            ]}
          >
            <meshStandardMaterial color='#3b82f6' transparent opacity={0.3} />
          </Sphere>
        ))}
      </group>
    </>
  );
}

export const AIAssistant3D: React.FC<AIAssistant3DProps> = ({
  analysis,
  isLoading,
  onActionSelect,
  isVisible,
  onToggleVisibility,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isVisible) {
    return null;
  }

  return (
    <motion.div
      className='ai-assistant'
      initial={{ opacity: 0, scale: 0.8, y: 100 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        height: isMinimized ? '60px' : '384px',
      }}
      exit={{ opacity: 0, scale: 0.8, y: 100 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b border-gray-700/50'>
        <div className='flex items-center gap-2'>
          <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
            <Brain className='w-5 h-5 text-white' />
          </div>
          <div>
            <div className='text-white font-semibold'>Poker AI Assistant</div>
            <div className='text-xs text-gray-400'>
              {isLoading
                ? 'Analyzing...'
                : analysis
                  ? 'Ready'
                  : 'Waiting for input'}
            </div>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className='p-1 text-gray-400 hover:text-white transition-colors'
          >
            {isMinimized ? '⬆️' : '⬇️'}
          </button>
          <button
            onClick={onToggleVisibility}
            className='p-1 text-gray-400 hover:text-white transition-colors'
          >
            ✕
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      {!isMinimized && (
        <div className='flex-1 relative'>
          <Canvas
            camera={{ position: [0, 0, 8], fov: 60 }}
            style={{ background: 'transparent' }}
          >
            <Suspense fallback={null}>
              <Scene
                analysis={analysis}
                isLoading={isLoading}
                onActionSelect={onActionSelect}
              />
            </Suspense>
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.5}
            />
          </Canvas>

          {/* Loading Overlay */}
          {isLoading && (
            <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
              <div className='text-center text-white'>
                <div className='loading-spinner mx-auto mb-2' />
                <div className='text-sm'>AI is analyzing your hand...</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status Bar */}
      <div className='p-3 border-t border-gray-700/50 bg-gray-800/50'>
        <div className='flex items-center justify-between text-xs text-gray-400'>
          <div className='flex items-center gap-2'>
            {isLoading ? (
              <AlertCircle className='w-4 h-4 text-yellow-500' />
            ) : analysis ? (
              <CheckCircle className='w-4 h-4 text-green-500' />
            ) : (
              <Target className='w-4 h-4 text-blue-500' />
            )}
            <span>
              {isLoading
                ? 'Processing'
                : analysis
                  ? 'Analysis Complete'
                  : 'Ready'}
            </span>
          </div>

          {analysis && (
            <div className='flex items-center gap-1'>
              <TrendingUp className='w-4 h-4' />
              <span>{(analysis.confidence * 100).toFixed(0)}% confidence</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
