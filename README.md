# AI Poker Solver

A sophisticated, high-performance poker analysis application powered by artificial intelligence and game theory optimization (GTO) strategies. Built with modern web technologies and optimized for lightning-fast calculations.

## 🚀 Features

### Advanced Poker Analysis
- **Real-time Hand Evaluation**: Instant calculation of hand strength and rankings
- **GTO Strategy Generation**: Game theory optimal action recommendations
- **Equity Calculations**: Monte Carlo simulations for win probability analysis
- **Range Analysis**: Comprehensive hand range evaluation and optimization
- **Position-based Strategies**: Context-aware recommendations based on table position

### Performance Optimizations
- **Web Worker Integration**: Heavy calculations offloaded to background threads
- **Bitwise Operations**: Ultra-fast card evaluation using binary representations
- **Intelligent Caching**: Memoized results with time-based invalidation
- **Bundle Optimization**: Sub-200KB gzipped bundle size with code splitting
- **PWA Support**: Offline functionality and app-like experience

### Developer Experience
- **Real-time Performance Monitoring**: Live metrics and bundle analysis
- **TypeScript Integration**: Full type safety and IntelliSense support
- **Modern React Patterns**: Hooks, Suspense, and concurrent features
- **Comprehensive Testing**: Unit tests and performance benchmarks

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm 9+ or yarn 1.22+

### Quick Start
```bash
# Clone the repository
git clone https://github.com/your-username/poker-app.git
cd poker-app

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Production Build
```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview

# Analyze bundle size
npm run analyze
```

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite with optimized configuration
- **State Management**: Zustand with selective subscriptions
- **Styling**: CSS-in-JS with performance optimizations
- **Performance**: Web Vitals monitoring and optimization

### Core Components
```
src/
├── components/          # Reusable UI components
│   ├── poker/          # Poker-specific components
│   └── ui/             # Generic UI components
├── pages/              # Route components
├── store/              # State management
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
├── types/              # TypeScript definitions
└── constants/          # Application constants
```

### Performance Architecture
- **Code Splitting**: Vendor, router, and feature-based chunks
- **Lazy Loading**: Route-based component loading
- **Memoization**: React.memo and useMemo optimizations
- **Web Workers**: Background thread calculations
- **Service Worker**: Caching and offline support

## 🎯 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Bundle Size | < 200KB gzipped | ✅ Achieved |
| First Contentful Paint | < 1.2s | ✅ Achieved |
| Largest Contentful Paint | < 2.5s | ✅ Achieved |
| First Input Delay | < 100ms | ✅ Achieved |
| Cumulative Layout Shift | < 0.1 | ✅ Achieved |

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Create production build
npm run preview      # Preview production build
npm run analyze      # Analyze bundle composition
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
npm run perf         # Run performance audit
```

### Code Quality
- **ESLint**: Comprehensive linting rules
- **TypeScript**: Strict type checking
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks

### Testing
```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run performance tests
npm run test:perf
```

## 🚀 Deployment

### GitHub Pages
The application is automatically deployed to GitHub Pages on every push to the main branch.

### Custom Domain
To use a custom domain:
1. Add your domain to the repository settings
2. Set the `CUSTOM_DOMAIN` secret in GitHub Actions
3. Configure DNS records as required

### Environment Variables
```bash
# Development
VITE_API_URL=http://localhost:3000
VITE_ANALYTICS_ID=your-analytics-id

# Production
VITE_API_URL=https://your-api-domain.com
VITE_ANALYTICS_ID=your-production-analytics-id
```

## 📊 Monitoring

### Performance Metrics
- **Web Vitals**: Real-time LCP, FID, CLS tracking
- **Bundle Analysis**: Visual bundle composition reports
- **Memory Usage**: Live memory consumption monitoring
- **Error Tracking**: Comprehensive error reporting

### Analytics Integration
The application supports integration with:
- Google Analytics 4
- Custom analytics endpoints
- Performance monitoring services

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow TypeScript best practices
- Write comprehensive tests
- Maintain performance benchmarks
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Poker theory and GTO strategies
- React and Vite communities
- Performance optimization techniques
- Open source contributors

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/poker-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/poker-app/discussions)
- **Documentation**: [Wiki](https://github.com/your-username/poker-app/wiki)

---

Built with ❤️ and modern web technologies for the poker community.
