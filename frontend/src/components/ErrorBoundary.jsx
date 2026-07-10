import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-vibe-black flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl text-vibe-gold mb-4">something went wrong</h1>
            <p className="text-white/60 mb-4">
              The app encountered an error. Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-vibe-gold text-vibe-black px-4 py-2 rounded-xl font-medium hover:bg-opacity-90 transition-colors"
            >
              refresh page
            </button>
{process.env.NODE_ENV === 'development' && this.state.error && (
        <details className="mt-4 text-left">
          <summary className="text-vibe-gold cursor-pointer">Error Details</summary>
          <pre className="text-xs text-white/40 mt-2 whitespace-pre-wrap">
            {this.state.error.toString()}
            {this.state.errorInfo?.componentStack || ''}
          </pre>
        </details>
      )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;