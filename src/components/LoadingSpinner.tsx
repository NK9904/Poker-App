import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10', 
    lg: 'w-16 h-16'
  }

  return (
    <div className={`flex justify-center items-center p-8 ${className}`}>
      <div 
        className={`loading ${sizeClasses[size]}`}
        style={{
          width: size === 'sm' ? '24px' : size === 'lg' ? '64px' : '40px',
          height: size === 'sm' ? '24px' : size === 'lg' ? '64px' : '40px'
        }}
      />
    </div>
  )
}