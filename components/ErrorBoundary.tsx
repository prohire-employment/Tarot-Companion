import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    // Attempt to recover by reloading the page and navigating home
    window.location.hash = 'home';
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-surface/70 rounded-card p-8 card-border shadow-main text-center font-serif animate-fade-in">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Something Went Wrong</h2>
          <p className="text-sub mb-6">
            We've encountered an unexpected issue. Please try refreshing the application to continue.
          </p>
          <button
            onClick={this.handleReset}
            className="w-full max-w-xs mx-auto bg-accent text-accent-dark font-bold py-3 px-8 rounded-ui transition-all duration-300 text-lg shadow-lg hover:shadow-glow hover:scale-105 transform font-sans"
          >
            Refresh and Go Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
