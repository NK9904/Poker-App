import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Github } from 'lucide-react';
import { logger } from '@/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: crypto.randomUUID(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log error with structured logging
    logger.error('Error boundary caught an error', error, {
      component: 'ErrorBoundary',
      action: 'componentDidCatch',
      errorId: this.state.errorId,
      errorInfo: {
        componentStack: errorInfo.componentStack,
        errorMessage: error.message,
        errorStack: error.stack,
      },
    });

    // Performance monitoring: Track errors
    if ('performance' in window && 'mark' in performance) {
      performance.mark('error-boundary-triggered');
      performance.measure(
        'error-boundary',
        'app-start',
        'error-boundary-triggered'
      );
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (reportError) {
        logger.error('Failed to call custom error handler', reportError);
      }
    }

    // In production, send to error reporting service
    if (import.meta.env.PROD) {
      this.reportErrorToService(error, errorInfo);
    }
  }

  private reportErrorToService(error: Error, errorInfo: ErrorInfo): void {
    try {
      // Example: Send to error reporting service like Sentry
      // Sentry.captureException(error, {
      //   contexts: {
      //     react: {
      //       componentStack: errorInfo.componentStack
      //     }
      //   },
      //   tags: {
      //     errorId: this.state.errorId,
      //     component: 'ErrorBoundary'
      //   }
      // })

      // For now, just log to console in production
      console.error('Production error:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
      });
    } catch (reportError) {
      logger.error('Failed to report error to service', reportError);
    }
  }

  private handleRefresh = (): void => {
    window.location.reload();
  };

  private handleGoHome = (): void => {
    window.location.href = '/';
  };

  private handleReportIssue = (): void => {
    const { error, errorInfo, errorId } = this.state;
    const issueBody = `
## Error Report

**Error ID:** ${errorId}
**Timestamp:** ${new Date().toISOString()}
**User Agent:** ${navigator.userAgent}

### Error Details
\`\`\`
${error?.message}
${error?.stack}
\`\`\`

### Component Stack
\`\`\`
${errorInfo?.componentStack}
\`\`\`

### Steps to Reproduce
1. 
2. 
3. 

### Expected Behavior
What should have happened?

### Actual Behavior
What actually happened?
    `.trim();

    const url = `https://github.com/your-username/poker-ai-solver/issues/new?title=Error: ${encodeURIComponent(error?.message || 'Unknown error')}&body=${encodeURIComponent(issueBody)}`;
    window.open(url, '_blank');
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className='min-h-screen bg-gray-900 flex items-center justify-center p-4'>
          <div className='max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-700'>
            <div className='text-center'>
              <div className='mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4'>
                <AlertTriangle className='w-8 h-8 text-red-500' />
              </div>

              <h2 className='text-xl font-semibold text-white mb-2'>
                Something went wrong
              </h2>

              <p className='text-gray-400 mb-6 text-sm'>
                We're sorry, but something unexpected happened. Our team has
                been notified.
              </p>

              {this.state.errorId && (
                <p className='text-xs text-gray-500 mb-4 font-mono'>
                  Error ID: {this.state.errorId}
                </p>
              )}

              <div className='space-y-3'>
                <button
                  onClick={this.handleRefresh}
                  className='w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors'
                >
                  <RefreshCw className='w-4 h-4' />
                  Refresh Page
                </button>

                <button
                  onClick={this.handleGoHome}
                  className='w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors'
                >
                  <Home className='w-4 h-4' />
                  Go Home
                </button>

                <button
                  onClick={this.handleReportIssue}
                  className='w-full bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors'
                >
                  <Github className='w-4 h-4' />
                  Report Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
