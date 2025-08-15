# Contributing to Poker AI Solver

Thank you for your interest in contributing to Poker AI Solver! This document provides comprehensive
guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Style & Standards](#code-style--standards)
- [Testing Strategy](#testing-strategy)
- [Pull Request Process](#pull-request-process)
- [Bug Reports](#bug-reports)
- [Feature Requests](#feature-requests)
- [Architecture Guidelines](#architecture-guidelines)
- [Performance Guidelines](#performance-guidelines)
- [Security Guidelines](#security-guidelines)

## Code of Conduct

This project and everyone participating in it is governed by our
[Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

### Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a feature branch** from `main`
4. **Make your changes** following our guidelines
5. **Test your changes** thoroughly
6. **Submit a pull request** with a clear description

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+ or **yarn** 1.22+
- **Git** 2.30+
- **Modern browser** for testing

## Development Setup

### Initial Setup

```bash
# Clone your fork
git clone https://github.com/your-username/poker-ai-solver.git
cd poker-ai-solver

# Install dependencies
npm install

# Set up Git hooks (optional but recommended)
npm run prepare

# Start development server
npm run dev
```

### Environment Configuration

Create a `.env.local` file in the root directory:

```env
# AI Configuration
VITE_OLLAMA_URL=http://localhost:11434
VITE_OLLAMA_MODEL=llama3.2:3b

# Development Settings
VITE_DEBUG_MODE=true
VITE_ENABLE_ANALYTICS=false

# API Configuration (if applicable)
VITE_API_BASE_URL=http://localhost:3000
```

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Quality Assurance
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format with Prettier
npm run format:check     # Check Prettier formatting
npm run type-check       # TypeScript type checking
npm run quality          # Run all quality checks

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:ci          # Run tests for CI

# Performance
npm run analyze          # Bundle analysis
npm run lighthouse       # Lighthouse audit
npm run perf             # Performance testing
```

## Code Style & Standards

### TypeScript Guidelines

- **Use strict TypeScript**: All strict flags are enabled
- **Prefer interfaces over types** for object shapes
- **Use proper type annotations**: Avoid `any` when possible
- **Leverage utility types**: Use `Partial<T>`, `Pick<T>`, `Omit<T>`, etc.
- **Use const assertions**: `as const` for literal types
- **Implement proper error handling**: Use `Result<T, E>` pattern where appropriate

```typescript
// ✅ Good
interface UserProfile {
  id: string;
  name: string;
  email: string;
  preferences: UserPreferences;
}

type UserPreferences = {
  theme: 'light' | 'dark';
  notifications: boolean;
};

// ❌ Avoid
type User = any;
```

### React Guidelines

- **Use functional components** with hooks
- **Implement proper prop types** with TypeScript
- **Use React.memo** for expensive components
- **Implement error boundaries** for error handling
- **Follow React best practices** and hooks rules

```typescript
// ✅ Good
interface CardProps {
  suit: Suit
  rank: Rank
  isSelected?: boolean
  onSelect?: (card: Card) => void
}

const Card: React.FC<CardProps> = React.memo(({
  suit,
  rank,
  isSelected = false,
  onSelect
}) => {
  const handleClick = useCallback(() => {
    onSelect?.({ suit, rank })
  }, [suit, rank, onSelect])

  return (
    <div
      className={clsx('card', { 'selected': isSelected })}
      onClick={handleClick}
    >
      {/* Card content */}
    </div>
  )
})
```

### File Organization

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components
│   ├── poker/          # Poker-specific components
│   └── ai/             # AI-related components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── store/              # State management
├── pages/              # Page components
├── constants/          # Application constants
└── ai/                 # AI logic and models
```

### Naming Conventions

- **Files**: `PascalCase` for components, `camelCase` for utilities
- **Components**: `PascalCase` (e.g., `PokerTable`, `AIAssistant`)
- **Functions**: `camelCase` (e.g., `calculateEquity`, `evaluateHand`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_PLAYERS`, `DEFAULT_STACK`)
- **Types/Interfaces**: `PascalCase` (e.g., `Card`, `GameState`)

## Testing Strategy

### Test Structure

```typescript
// Component test example
import { render, screen, fireEvent } from '@testing-library/react'
import { Card } from '@/components/poker/Card'

describe('Card Component', () => {
  const defaultProps = {
    suit: 'hearts' as const,
    rank: 'A' as const
  }

  it('renders card with correct suit and rank', () => {
    render(<Card {...defaultProps} />)
    expect(screen.getByText('A♠')).toBeInTheDocument()
  })

  it('calls onSelect when clicked', () => {
    const onSelect = jest.fn()
    render(<Card {...defaultProps} onSelect={onSelect} />)

    fireEvent.click(screen.getByRole('button'))
    expect(onSelect).toHaveBeenCalledWith({
      suit: 'hearts',
      rank: 'A'
    })
  })
})
```

### Testing Guidelines

- **Write tests for all new features**
- **Maintain >80% test coverage**
- **Test both success and error cases**
- **Use descriptive test names**
- **Mock external dependencies**
- **Test accessibility features**

### Test Categories

1. **Unit Tests**: Individual functions and components
2. **Integration Tests**: Component interactions
3. **E2E Tests**: Full user workflows (if applicable)
4. **Performance Tests**: Load testing and optimization

## Pull Request Process

### Before Submitting

1. **Ensure all tests pass**:

   ```bash
   npm run test:ci
   ```

2. **Run quality checks**:

   ```bash
   npm run quality
   ```

3. **Update documentation** if needed

4. **Check for security issues**:
   ```bash
   npm audit
   ```

### Pull Request Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
- [ ] Performance impact considered

## Screenshots (if applicable)
```

### Review Process

1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Testing** on different environments
4. **Documentation** review
5. **Final approval** from maintainers

## Bug Reports

### Bug Report Template

```markdown
## Bug Description

Clear description of the bug

## Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior

What you expected to happen

## Actual Behavior

What actually happened

## Environment

- OS: [e.g., Windows 11, macOS 14.0]
- Browser: [e.g., Chrome 120, Firefox 121]
- Node.js: [e.g., 18.17.0]
- npm: [e.g., 9.6.7]

## Additional Context

- Error messages
- Console logs
- Screenshots
- Performance impact
```

## Feature Requests

### Feature Request Template

```markdown
## Feature Description

Clear description of the feature

## Problem Statement

What problem does this feature solve?

## Proposed Solution

How should this feature work?

## Alternative Solutions

Other approaches considered

## Implementation Ideas

Technical implementation thoughts

## Mockups/Wireframes

Visual representations if applicable

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3
```

## Architecture Guidelines

### State Management

- **Use Zustand** for global state
- **Keep state normalized** and flat
- **Implement proper selectors** for derived state
- **Use immer** for immutable updates

### Performance Optimization

- **Implement code splitting** with React.lazy
- **Use React.memo** for expensive components
- **Optimize bundle size** with tree shaking
- **Implement proper caching** strategies

### Error Handling

- **Use Error Boundaries** for component errors
- **Implement proper logging** with structured data
- **Provide user-friendly error messages**
- **Handle network errors gracefully**

## Performance Guidelines

### Bundle Optimization

- **Code splitting** by routes and features
- **Tree shaking** for unused code elimination
- **Dynamic imports** for heavy dependencies
- **Bundle analysis** to identify optimization opportunities

### Runtime Performance

- **Memoization** for expensive calculations
- **Debouncing** for frequent events
- **Virtualization** for large lists
- **Lazy loading** for non-critical components

## Security Guidelines

### General Security

- **Validate all inputs** on client and server
- **Sanitize user data** before rendering
- **Use HTTPS** in production
- **Implement proper CORS** policies

### Frontend Security

- **Avoid eval()** and similar functions
- **Sanitize HTML** content
- **Use Content Security Policy**
- **Implement proper authentication** flows

## Getting Help

### Resources

- **Documentation**: Check the README and docs
- **Issues**: Search existing issues and discussions
- **Discussions**: Use GitHub Discussions for questions
- **Community**: Join our community channels

### Contact

- **Maintainers**: @maintainer1, @maintainer2
- **Email**: support@poker-ai-solver.com
- **Discord**: [Join our server](https://discord.gg/poker-ai)

## Release Process

### Version Management

We use [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Steps

1. **Feature freeze** on release branch
2. **Comprehensive testing** and bug fixes
3. **Version bump** and changelog update
4. **Release** and deployment
5. **Announcement** to community

## License

By contributing, you agree that your contributions will be licensed under the
[MIT License](LICENSE).

---

Thank you for contributing to Poker AI Solver! Your contributions help make this project better for
everyone.
