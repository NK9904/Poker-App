# Contributing to AI Poker Solver

Thank you for your interest in contributing to AI Poker Solver! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Types of Contributions

We welcome various types of contributions:

- **Bug Reports**: Help us identify and fix issues
- **Feature Requests**: Suggest new features or improvements
- **Code Contributions**: Submit pull requests with code changes
- **Documentation**: Improve or add documentation
- **Testing**: Write or improve tests
- **Performance**: Optimize code and improve performance
- **Design**: Improve UI/UX and accessibility

### Before You Start

1. **Check Existing Issues**: Search existing issues to avoid duplicates
2. **Read Documentation**: Familiarize yourself with the codebase
3. **Set Up Development Environment**: Follow the installation guide
4. **Join Discussions**: Participate in GitHub Discussions

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- npm 9+ or yarn 1.22+
- Git

### Local Development

```bash
# Fork and clone the repository
git clone https://github.com/your-username/poker-app.git
cd poker-app

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run linting
npm run lint
```

### Code Quality Tools

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Format code (if Prettier is configured)
npm run format

# Performance analysis
npm run analyze
```

## 📝 Code Standards

### TypeScript

- Use strict TypeScript configuration
- Provide proper type annotations
- Avoid `any` types when possible
- Use interfaces for object shapes
- Export types from dedicated type files

### React

- Use functional components with hooks
- Implement React.memo for performance
- Use proper dependency arrays in useEffect
- Follow React best practices
- Use TypeScript for component props

### Performance

- Optimize bundle size
- Use code splitting appropriately
- Implement proper memoization
- Monitor Web Vitals
- Test performance impact

### Testing

- Write unit tests for utilities
- Test component behavior
- Maintain good test coverage
- Use meaningful test descriptions
- Mock external dependencies

## 🔄 Pull Request Process

### Before Submitting

1. **Create Feature Branch**: `git checkout -b feature/your-feature`
2. **Make Changes**: Implement your feature or fix
3. **Test Thoroughly**: Ensure all tests pass
4. **Update Documentation**: Update relevant docs
5. **Commit Changes**: Use conventional commit messages

### Commit Message Format

Use conventional commit messages:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tool changes

Examples:
```
feat(poker): add GTO strategy calculation
fix(ui): resolve card display alignment issue
docs(readme): update installation instructions
```

### Pull Request Guidelines

1. **Clear Title**: Descriptive title for the PR
2. **Detailed Description**: Explain what and why
3. **Related Issues**: Link to relevant issues
4. **Screenshots**: Include UI changes if applicable
5. **Testing**: Describe how to test the changes
6. **Breaking Changes**: Note any breaking changes

### Review Process

1. **Automated Checks**: Ensure CI/CD passes
2. **Code Review**: Address reviewer feedback
3. **Testing**: Verify functionality
4. **Documentation**: Update docs if needed
5. **Merge**: Maintainer merges after approval

## 🐛 Bug Reports

### Bug Report Template

```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g. Windows 10, macOS 12]
- Browser: [e.g. Chrome 100, Firefox 95]
- Node.js: [e.g. 18.0.0]
- npm: [e.g. 9.0.0]

## Additional Information
Screenshots, console logs, etc.
```

## 💡 Feature Requests

### Feature Request Template

```markdown
## Feature Description
Brief description of the feature

## Problem Statement
What problem does this solve?

## Proposed Solution
How should this be implemented?

## Alternatives Considered
Other approaches you've considered

## Additional Context
Any other relevant information
```

## 📚 Documentation

### Documentation Standards

- Use clear, concise language
- Include code examples
- Keep documentation up-to-date
- Use proper markdown formatting
- Include screenshots when helpful

### Documentation Areas

- README.md: Project overview and setup
- API Documentation: Component and function docs
- Contributing Guidelines: This file
- Code Comments: Inline documentation
- Wiki: Extended documentation

## 🧪 Testing

### Testing Guidelines

- Write tests for new features
- Ensure existing tests pass
- Maintain good test coverage
- Use meaningful test names
- Test edge cases and error conditions

### Test Types

- **Unit Tests**: Test individual functions
- **Component Tests**: Test React components
- **Integration Tests**: Test component interactions
- **Performance Tests**: Test performance metrics
- **E2E Tests**: Test user workflows

## 🚀 Performance

### Performance Guidelines

- Monitor bundle size impact
- Optimize render performance
- Use appropriate caching strategies
- Profile memory usage
- Test on various devices

### Performance Metrics

- Bundle size (target: < 200KB gzipped)
- First Contentful Paint (< 1.2s)
- Largest Contentful Paint (< 2.5s)
- First Input Delay (< 100ms)
- Cumulative Layout Shift (< 0.1)

## 🤝 Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Use welcoming and inclusive language
- Be collaborative and constructive
- Focus on what is best for the community
- Show empathy towards other community members

### Communication

- Use clear, professional language
- Be patient with newcomers
- Provide constructive feedback
- Ask questions when unsure
- Share knowledge and help others

## 📞 Getting Help

### Resources

- **Issues**: [GitHub Issues](https://github.com/your-username/poker-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/poker-app/discussions)
- **Documentation**: [Wiki](https://github.com/your-username/poker-app/wiki)
- **Code**: [Source Code](https://github.com/your-username/poker-app)

### Questions

- Search existing issues and discussions
- Check documentation and wiki
- Ask in GitHub Discussions
- Create an issue for bugs
- Use feature requests for ideas

## 🙏 Recognition

Contributors will be recognized in:

- Repository contributors list
- Release notes
- Documentation acknowledgments
- Community highlights

Thank you for contributing to AI Poker Solver! 🎉