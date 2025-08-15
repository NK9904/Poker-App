import { useEffect, useState, useCallback } from 'react'
import { getMemoryUsage, estimateBundleSize, getPerformanceMetrics, addPerformanceMetric } from '../utils/performance'
import type { PerformanceMetric } from '../types/performance'

export interface PerformanceData {
  memory: {
    used: number
    total: number
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
    const metrics = getPerformanceMetrics()
    
    const longTasks = metrics.filter((m: PerformanceMetric) => m.name === 'long-task').length
    const layoutShifts = metrics.filter((m: PerformanceMetric) => m.name === 'layout-shift').length
    const fpsMetrics = metrics.filter((m: PerformanceMetric) => m.name === 'fps')
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
    // Update performance data initially
    updatePerformanceData()

    // Set up interval to update periodically
    const interval = setInterval(updatePerformanceData, 5000)

    return () => clearInterval(interval)
  }, [updatePerformanceData])

  return { data, refresh: updatePerformanceData }
}

// Hook for measuring component render time
export function useRenderTime(componentName: string) {
  useEffect(() => {
    const start = performance.now()
    
    return () => {
      const duration = performance.now() - start
      addPerformanceMetric(`render-${componentName}`, duration)
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
      addPerformanceMetric(name, duration)
    }
  }, [])
}