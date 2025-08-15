// Performance monitoring utilities

export interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private observers: PerformanceObserver[] = []

  constructor() {
    this.setupObservers()
  }

  private setupObservers() {
    // Long Tasks Observer
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            console.warn(`Long task detected: ${entry.duration}ms`, entry)
            this.addMetric('long-task', entry.duration)
          })
        })
        longTaskObserver.observe({ entryTypes: ['longtask'] })
        this.observers.push(longTaskObserver)
      } catch (e) {
        console.log('Long task observer not supported')
      }

      // Layout Shift Observer
      try {
        const clsObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              this.addMetric('layout-shift', entry.value)
            }
          })
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        this.observers.push(clsObserver)
      } catch (e) {
        console.log('Layout shift observer not supported')
      }
    }
  }

  addMetric(name: string, value: number) {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now()
    })
    if (this.metrics.length > 1000) {
      this.metrics.splice(0, this.metrics.length - 1000)
    }
  }

  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name)
    }
    return this.metrics
  }

  clearMetrics() {
    this.metrics = []
  }

  disconnect() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// Timing utilities
export function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now()
  
  return fn().finally(() => {
    const duration = performance.now() - start
    performanceMonitor.addMetric(name, duration)
    console.log(`${name}: ${duration.toFixed(2)}ms`)
  })
}

export function measureSync<T>(
  name: string,
  fn: () => T
): T {
  const start = performance.now()
  
  try {
    return fn()
  } finally {
    const duration = performance.now() - start
    performanceMonitor.addMetric(name, duration)
    console.log(`${name}: ${duration.toFixed(2)}ms`)
  }
}

// Memory utilities
export function getMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    return {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
    }
  }
  return null
}

// Resource timing
export function getResourceTiming() {
  return performance.getEntriesByType('resource').map(entry => ({
    name: entry.name,
    duration: entry.duration,
    size: (entry as any).transferSize || 0,
    type: entry.initiatorType
  }))
}

// Bundle size estimation
export function estimateBundleSize() {
  const resources = getResourceTiming()
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
      
      performanceMonitor.addMetric('fps', this.fps)
    }

    requestAnimationFrame(() => this.measureFPS())
  }
}

// Web Worker utility for heavy calculations
export function createWorkerFromFunction(fn: Function) {
  const blob = new Blob(
    [`self.onmessage = function(e) { self.postMessage((${fn.toString()})(e.data)); }`],
    { type: 'application/javascript' }
  )
  return new Worker(URL.createObjectURL(blob))
}

// Debounce utility for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T {
  let timeout: number | null = null
  
  return ((...args: any[]) => {
    if (timeout !== null) window.clearTimeout(timeout)
    timeout = window.setTimeout(() => func(...args), wait)
  }) as T
}

// Throttle utility for performance
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  let inThrottle = false
  
  return ((...args: any[]) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      window.setTimeout(() => { inThrottle = false }, limit)
    }
  }) as T
}