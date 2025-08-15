import { useEffect, useState, useCallback } from 'react'
import { performanceMonitor, getMemoryUsage, estimateBundleSize, FPSMonitor } from '../utils/performance'

export interface PerformanceData {
  memory: {
    used: number
    total: number
    limit: number
  } | null
  bundleSize: {
    js: number
    css: number
    total: number
  }
  fps: number
  longTasks: number
  layoutShifts: number
}

export function usePerformance() {
  const [data, setData] = useState<PerformanceData>({
    memory: null,
    bundleSize: { js: 0, css: 0, total: 0 },
    fps: 0,
    longTasks: 0,
    layoutShifts: 0
  })

  const updatePerformanceData = useCallback(() => {
    const memory = getMemoryUsage()
    const bundleSize = estimateBundleSize()
    const metrics = performanceMonitor.getMetrics()
    
    const longTasks = metrics.filter(m => m.name === 'long-task').length
    const layoutShifts = metrics.filter(m => m.name === 'layout-shift').length
    const fpsMetrics = metrics.filter(m => m.name === 'fps')
    const fps = fpsMetrics.length > 0 ? fpsMetrics[fpsMetrics.length - 1].value : 0

    setData({
      memory,
      bundleSize,
      fps,
      longTasks,
      layoutShifts
    })
  }, [])

  useEffect(() => {
    // Start FPS monitoring
    const fpsMonitor = new FPSMonitor()
    fpsMonitor.start()

    // Update performance data initially
    updatePerformanceData()

    // Set up interval to update periodically
    const interval = window.setInterval(updatePerformanceData, 5000)

    return () => {
      window.clearInterval(interval)
      fpsMonitor.stop()
    }
  }, [updatePerformanceData])

  return { data, refresh: updatePerformanceData }
}

// Hook for measuring component render time
export function useRenderTime(componentName: string) {
  useEffect(() => {
    const start = performance.now()
    
    return () => {
      const duration = performance.now() - start
      performanceMonitor.addMetric(`render-${componentName}`, duration)
    }
  })
}

// Hook for measuring async operations
export function useAsyncMeasure() {
  return useCallback(async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    const start = performance.now()
    
    try {
      return await fn()
    } finally {
      const duration = performance.now() - start
      performanceMonitor.addMetric(name, duration)
    }
  }, [])
}