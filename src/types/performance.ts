// Performance monitoring types
export interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
}

export interface MemoryUsage {
  used: number
  total: number
  limit: number
}

export interface BundleSize {
  js: number
  css: number
  total: number
}

export interface PerformanceData {
  memory: MemoryUsage | null
  bundleSize: BundleSize
  fps: number
  longTasks: number
  layoutShifts: number
}

export interface CacheConfig {
  maxAge: number
  maxEntries: number
  strategy: 'LRU' | 'FIFO' | 'TTL'
}