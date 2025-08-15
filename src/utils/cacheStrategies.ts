// Advanced caching strategies for optimal performance

export interface CacheConfig {
  maxAge: number
  maxEntries: number
  strategy: 'LRU' | 'FIFO' | 'TTL'
}

// Least Recently Used cache implementation
export class LRUCache<T> {
  private cache = new Map<string, { value: T; lastAccessed: number }>()
  private maxEntries: number
  private maxAge: number

  constructor(config: CacheConfig) {
    this.maxEntries = config.maxEntries
    this.maxAge = config.maxAge
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key)
    
    if (!item) return undefined
    
    // Check if expired
    if (Date.now() - item.lastAccessed > this.maxAge) {
      this.cache.delete(key)
      return undefined
    }
    
    // Update access time
    item.lastAccessed = Date.now()
    this.cache.set(key, item)
    
    return item.value
  }

  set(key: string, value: T): void {
    // Remove oldest entries if at capacity
    if (this.cache.size >= this.maxEntries && !this.cache.has(key)) {
      const oldestKey = this.findOldestKey()
      if (oldestKey) this.cache.delete(oldestKey)
    }
    
    this.cache.set(key, {
      value,
      lastAccessed: Date.now()
    })
  }

  private findOldestKey(): string | undefined {
    let oldestKey: string | undefined
    let oldestTime = Date.now()
    
    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed
        oldestKey = key
      }
    }
    
    return oldestKey
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

// IndexedDB wrapper for persistent caching
export class PersistentCache {
  private dbName: string
  private storeName: string
  private version: number

  constructor(dbName: string, storeName: string = 'cache', version: number = 1) {
    this.dbName = dbName
    this.storeName = storeName
    this.version = version
  }

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }

  async get<T>(key: string): Promise<T | undefined> {
    try {
      const db = await this.openDB()
      const transaction = db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      
      return new Promise((resolve, reject) => {
        const request = store.get(key)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          const result = request.result
          if (result && this.isValid(result)) {
            resolve(result.value)
          } else {
            resolve(undefined)
          }
        }
      })
    } catch (error) {
      console.warn('PersistentCache get error:', error)
      return undefined
    }
  }

  async set<T>(key: string, value: T, ttl: number = 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const db = await this.openDB()
      const transaction = db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      
      const item = {
        key,
        value,
        timestamp: Date.now(),
        expires: Date.now() + ttl
      }
      
      return new Promise((resolve, reject) => {
        const request = store.put(item)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
      })
    } catch (error) {
      console.warn('PersistentCache set error:', error)
    }
  }

  private isValid(item: any): boolean {
    return item && item.expires > Date.now()
  }

  async clear(): Promise<void> {
    try {
      const db = await this.openDB()
      const transaction = db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      
      return new Promise((resolve, reject) => {
        const request = store.clear()
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
      })
    } catch (error) {
      console.warn('PersistentCache clear error:', error)
    }
  }
}

// Multi-level cache system
export class HybridCache<T> {
  private memoryCache: LRUCache<T>
  private persistentCache: PersistentCache
  private cacheKey: string

  constructor(
    cacheKey: string,
    memoryConfig: CacheConfig = { maxAge: 5 * 60 * 1000, maxEntries: 100, strategy: 'LRU' }
  ) {
    this.cacheKey = cacheKey
    this.memoryCache = new LRUCache(memoryConfig)
    this.persistentCache = new PersistentCache('poker-app-cache', cacheKey)
  }

  async get(key: string): Promise<T | undefined> {
    // Try memory cache first (fastest)
    let value = this.memoryCache.get(key)
    if (value !== undefined) {
      return value
    }

    // Try persistent cache (slower but still cached)
    value = await this.persistentCache.get<T>(key)
    if (value !== undefined) {
      // Promote to memory cache
      this.memoryCache.set(key, value)
      return value
    }

    return undefined
  }

  async set(key: string, value: T, ttl?: number): Promise<void> {
    // Set in both caches
    this.memoryCache.set(key, value)
    await this.persistentCache.set(key, value, ttl)
  }

  async clear(): Promise<void> {
    this.memoryCache.clear()
    await this.persistentCache.clear()
  }
}

// Preloading cache for critical resources
export class PreloadCache {
  private static instance: PreloadCache
  private cache = new Map<string, Promise<any>>()

  static getInstance(): PreloadCache {
    if (!PreloadCache.instance) {
      PreloadCache.instance = new PreloadCache()
    }
    return PreloadCache.instance
  }

  preload<T>(key: string, loader: () => Promise<T>): Promise<T> {
    if (this.cache.has(key)) {
      return this.cache.get(key)!
    }

    const promise = loader().catch(error => {
      // Remove failed promises from cache
      this.cache.delete(key)
      throw error
    })

    this.cache.set(key, promise)
    return promise
  }

  get<T>(key: string): Promise<T> | undefined {
    return this.cache.get(key)
  }

  clear(): void {
    this.cache.clear()
  }
}

// Cache management utilities
export const CacheManager = {
  // Poker-specific caches
  handStrength: new HybridCache<number>('hand-strength'),
  equity: new HybridCache<number>('equity'),
  ranges: new HybridCache<string[]>('ranges'),
  
  // Preload cache
  preload: PreloadCache.getInstance(),
  
  // Clear all caches
  async clearAll(): Promise<void> {
    await Promise.all([
      this.handStrength.clear(),
      this.equity.clear(),
      this.ranges.clear()
    ])
    this.preload.clear()
  },
  
  // Get cache statistics
  getStats() {
    return {
      memoryUsage: performance?.memory ? {
        used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024)
      } : null,
      timestamp: Date.now()
    }
  }
}