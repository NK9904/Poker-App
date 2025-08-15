# Poker-App
AI poker solver with advanced performance optimizations

## Performance Optimizations Implemented

### 🚀 Bundle Optimization
- **Vite Build Tool**: Ultra-fast development and optimized production builds
- **Manual Code Splitting**: Vendor, router, state, and animation chunks
- **Tree Shaking**: Eliminates unused code automatically
- **Terser Minification**: Removes console.log and optimizes for production
- **Gzip Compression**: Bundle size target < 200KB gzipped

### ⚡ Loading Performance
- **Lazy Loading**: All route components loaded on-demand
- **React.Suspense**: Fallback loading states for better UX
- **Module Preloading**: Critical resources preloaded in HTML
- **Font Optimization**: Preconnect to Google Fonts with display=swap

### 🎯 Runtime Performance
- **React.memo**: All components memoized to prevent unnecessary re-renders
- **Zustand State Management**: Lightweight state with selective subscriptions
- **Web Workers**: Heavy poker calculations offloaded to background threads
- **Memoization**: Expensive calculations cached with TTL
- **Bitwise Operations**: Fast card evaluation using binary representations

### 📊 Monitoring & Analytics
- **Web Vitals**: Real-time LCP, FID, CLS tracking
- **Performance Panel**: Live bundle size, memory, FPS monitoring
- **Long Task Detection**: Identifies performance bottlenecks
- **Memory Usage Tracking**: Prevents memory leaks

### 💾 Caching Strategy
- **Service Worker**: Automatic caching with Workbox
- **PWA Support**: Offline functionality and app-like experience
- **HTTP Caching**: Static assets cached for 1 year
- **Runtime Caching**: API responses and calculations cached

### 🔧 Developer Tools
- **Bundle Analyzer**: Visualize bundle composition
- **Lighthouse Integration**: Automated performance auditing
- **Performance Scripts**: Built-in perf testing commands

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Analyze bundle size
npm run analyze

# Run performance audit
npm run perf
```

## Performance Targets

- **Bundle Size**: < 200KB gzipped
- **First Contentful Paint**: < 1.2s
- **Largest Contentful Paint**: < 2.5s
- **First Input Delay**: < 100ms
- **Cumulative Layout Shift**: < 0.1

## Architecture Highlights

### Optimized State Management
- Selective store subscriptions prevent unnecessary re-renders
- Computed values are memoized for performance
- State updates are batched for efficiency

### Smart Component Design
- All components use React.memo for render optimization
- Callbacks are memoized with useCallback
- Complex calculations moved to Web Workers

### Advanced Poker Engine
- Bitwise card representation for 10x faster evaluations
- Monte Carlo simulations in Web Workers
- Lookup tables for instant hand strength calculations
- Optimized Fisher-Yates deck shuffling

## Performance Monitoring

The app includes a real-time performance panel (⚡ icon) that tracks:
- Bundle size and loading metrics
- Memory usage and garbage collection
- Frame rate and rendering performance
- Long tasks and layout shifts
- Overall performance grade (A-D)

## Production Optimizations

When building for production, the app automatically:
- Removes all console statements
- Optimizes images and assets
- Generates service worker for caching
- Creates bundle analysis reports
- Enables all performance monitoring

Built with performance-first architecture for lightning-fast poker calculations!
