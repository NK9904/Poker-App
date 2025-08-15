import { logger } from './logger'

/**
 * Performance monitoring utilities
 */

// Performance metrics interface
export interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  metadata?: Record<string, unknown>
}

// Performance observer for long tasks
export function observeLongTasks(threshold = 50): void {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > threshold) {
            logger.warn(`Long task detected: ${entry.duration}ms`, entry)
          }
        }
      })
      
      observer.observe({ entryTypes: ['longtask'] })
    } catch (error) {
      logger.log('Long task observer not supported')
    }
  }
}

// Layout shift monitoring
export function observeLayoutShifts(): void {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: PerformanceEntry) => {
          const layoutShift = entry as LayoutShift
          if (layoutShift.hadRecentInput) return
          
          logger.log('Layout shift detected:', layoutShift.value)
        })
      })
      
      observer.observe({ entryTypes: ['layout-shift'] })
    } catch (error) {
      logger.log('Layout shift observer not supported')
    }
  }
}

// Type for LayoutShift entry
interface LayoutShift extends PerformanceEntry {
  value: number
  hadRecentInput: boolean
}

// Global performance metrics storage
const performanceMetrics: PerformanceMetric[] = []

export function addPerformanceMetric(name: string, value: number): void {
  performanceMetrics.push({
    name,
    value,
    timestamp: Date.now()
  })
}

export function getPerformanceMetrics(name?: string): PerformanceMetric[] {
  if (name) {
    return performanceMetrics.filter(m => m.name === name)
  }
  return performanceMetrics
}

// Performance timing helper
export function measurePerformance(name: string, fn: () => void): void {
  const start = performance.now()
  fn()
  const duration = performance.now() - start
  
  if (duration > 16) { // Log if takes more than one frame
    logger.log(`${name}: ${duration.toFixed(2)}ms`)
  }
}

// Async performance timing helper
export async function measureAsyncPerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now()
  const result = await fn()
  const duration = performance.now() - start
  
  if (duration > 100) { // Log if takes more than 100ms
    logger.log(`${name}: ${duration.toFixed(2)}ms`)
  }
  
  return result
}

// Memory usage monitoring (Chrome only)
export function getMemoryUsage(): { used: number; total: number } | null {
  const memory = (performance as PerformanceWithMemory).memory
  
  if (memory) {
    return {
      used: memory.usedJSHeapSize / 1048576, // Convert to MB
      total: memory.totalJSHeapSize / 1048576
    }
  }
  
  return null
}

// Type for performance with memory
interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  }
}

// Resource timing analysis
export function analyzeResourceTiming(): ResourceTimingInfo[] {
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  
  return resources.map(entry => ({
    name: entry.name,
    duration: entry.duration,
    size: entry.transferSize || 0,
    type: entry.initiatorType
  }))
}

interface ResourceTimingInfo {
  name: string
  duration: number
  size: number
  type: string
}

// Bundle size estimation
export function estimateBundleSize() {
  const resources = analyzeResourceTiming()
  const jsSize = resources
    .filter(r => r.name.includes('.js'))
    .reduce((total, r) => total + r.size, 0)
  
  const cssSize = resources
    .filter(r => r.name.includes('.css'))
    .reduce((total, r) => total + r.size, 0)

  return {
    js: Math.round(jsSize / 1024),
    css: Math.round(cssSize / 1024),
    total: Math.round((jsSize + cssSize) / 1024)
  }
}

// FPS monitoring
export class FPSMonitor {
  private lastTime = 0
  private frameCount = 0
  private fps = 0
  private isRunning = false

  start() {
    this.isRunning = true
    this.lastTime = performance.now()
    this.frameCount = 0
    this.measureFPS()
  }

  stop() {
    this.isRunning = false
  }

  getFPS() {
    return this.fps
  }

  private measureFPS() {
    if (!this.isRunning) return

    const currentTime = performance.now()
    this.frameCount++

    if (currentTime >= this.lastTime + 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime))
      this.frameCount = 0
      this.lastTime = currentTime
      
      addPerformanceMetric('fps', this.fps)
    }

    requestAnimationFrame(() => this.measureFPS())
  }
}

// Web Worker utility for heavy calculations
export function createWorkerFromFunction(fn: (...args: unknown[]) => unknown) {
  const blob = new Blob(
    [`self.onmessage = function(e) { self.postMessage((${fn.toString()})(e.data)); }`],
    { type: 'application/javascript' }
  )
  return new Worker(URL.createObjectURL(blob))
}

// Debounce utility with proper typing
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle utility with proper typing
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => { inThrottle = false }, limit)
    }
  }
}