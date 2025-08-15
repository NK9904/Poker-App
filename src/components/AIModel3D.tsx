import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Box, Sphere, Cylinder } from '@react-three/drei'
import * as THREE from 'three'

interface AIModel3DProps {
  decision?: string
  confidence?: number
  isThinking?: boolean
  className?: string
}

// Animated AI Head Component
const AIHead = ({ isThinking, decision }: { isThinking: boolean; decision?: string }) => {
  const headRef = useRef<THREE.Mesh>(null)
  const eyeRef = useRef<THREE.Mesh>(null)
  const [eyeColor, setEyeColor] = useState('#00d4aa')

  useFrame((state) => {
    if (headRef.current) {
      // Gentle floating animation
      headRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      
      // Thinking animation - slight rotation
      if (isThinking) {
        headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1
      }
    }
    
    if (eyeRef.current) {
      // Eye pulsing animation when thinking
      if (isThinking) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.1
        eyeRef.current.scale.set(scale, scale, scale)
        setEyeColor('#667eea')
      } else {
        eyeRef.current.scale.set(1, 1, 1)
        setEyeColor('#00d4aa')
      }
    }
  })

  return (
    <group>
      {/* AI Head */}
      <Sphere ref={headRef} args={[1, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#1a1f2e" 
          metalness={0.8} 
          roughness={0.2}
          emissive="#00d4aa"
          emissiveIntensity={0.1}
        />
      </Sphere>
      
      {/* Eyes */}
      <Sphere ref={eyeRef} args={[0.15, 16, 16]} position={[-0.3, 0.2, 0.8]}>
        <meshStandardMaterial 
          color={eyeColor} 
          emissive={eyeColor}
          emissiveIntensity={0.5}
        />
      </Sphere>
      <Sphere args={[0.15, 16, 16]} position={[0.3, 0.2, 0.8]}>
        <meshStandardMaterial 
          color={eyeColor} 
          emissive={eyeColor}
          emissiveIntensity={0.5}
        />
      </Sphere>
      
      {/* Decision Text */}
      {decision && (
        <Text
          position={[0, -1.5, 0]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Bold.woff"
        >
          {decision}
        </Text>
      )}
      
      {/* Thinking indicator */}
      {isThinking && (
        <group>
          {[...Array(3)].map((_, i) => (
            <Sphere 
              key={i}
              args={[0.05, 8, 8]} 
              position={[i * 0.2 - 0.2, -1.8, 0]}
            >
              <meshStandardMaterial 
                color="#00d4aa" 
                emissive="#00d4aa"
                emissiveIntensity={0.3}
              />
            </Sphere>
          ))}
        </group>
      )}
    </group>
  )
}

// Poker Chips around the AI
const PokerChips = () => {
  const chipsRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (chipsRef.current) {
      chipsRef.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })

  const chipColors = ['#e53e3e', '#3182ce', '#38a169', '#805ad5', '#ffd700']
  
  return (
    <group ref={chipsRef}>
      {chipColors.map((color, i) => (
        <Cylinder 
          key={i}
          args={[0.3, 0.3, 0.1, 16]} 
          position={[
            Math.cos(i * Math.PI * 2 / chipColors.length) * 2,
            0,
            Math.sin(i * Math.PI * 2 / chipColors.length) * 2
          ]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshStandardMaterial 
            color={color} 
            metalness={0.3} 
            roughness={0.7}
          />
        </Cylinder>
      ))}
    </group>
  )
}

// Main AI Model Component
export const AIModel3D: React.FC<AIModel3DProps> = ({ 
  decision, 
  confidence = 0, 
  isThinking = false,
  className = ''
}) => {
  return (
    <div className={`ai-model-container ${className}`} style={{ height: '400px', width: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00d4aa" />
        
        {/* AI Head */}
        <AIHead isThinking={isThinking} decision={decision} />
        
        {/* Poker Chips */}
        <PokerChips />
        
        {/* Confidence Bar */}
        {confidence > 0 && (
          <group position={[0, -2.5, 0]}>
            <Box args={[2, 0.1, 0.1]} position={[0, 0, 0]}>
              <meshStandardMaterial color="#2d3748" />
            </Box>
            <Box args={[2 * confidence, 0.1, 0.1]} position={[-(1 - confidence), 0, 0]}>
              <meshStandardMaterial color="#00d4aa" />
            </Box>
            <Text
              position={[0, -0.3, 0]}
              fontSize={0.2}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              {Math.round(confidence * 100)}% Confidence
            </Text>
          </group>
        )}
        
        {/* Controls */}
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate={!isThinking}
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  )
}