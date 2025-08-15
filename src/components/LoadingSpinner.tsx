import { memo } from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const LoadingSpinner = memo<LoadingSpinnerProps>(({ 
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
        className={`loading-spinner ${sizeClasses[size]}`}
        aria-label="Loading"
        role="status"
      />
    </div>
  )
})

LoadingSpinner.displayName = 'LoadingSpinner'