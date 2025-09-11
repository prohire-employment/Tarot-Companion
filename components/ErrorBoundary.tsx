import React, { Component, ErrorInfo, ReactNode } from 'react';
import { APP_VERSION, REPO_URL } from '../constants';

// --- Props for the Fallback Component ---
interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
  reportLink: string;
}

// --- The UI component for displaying the error ---
const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, errorInfo, onReset, reportLink }) => {
  return (
    <div className="bg-surface/70 rounded-card p-8 card-border shadow-main text-center font-serif animate-fade-in border border-red-500/30" role="alert">
      <div className="mx-auto w-16 h-16 mb-4 text-red-400">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-red-400 mb-4">Something Went Wrong</h2>
      <p className="text-sub mb-6">
        An unexpected error occurred. You can try returning home, or help us improve by reporting the issue.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center font-sans">
          <button
            onClick={onReset}
            className="flex-1 bg-accent text-accent-dark font-bold py-3 px-4 rounded-ui shadow-lg hover:shadow-glow transform transition-all duration-300"
          >
            Go Home
          </button>
          {reportLink && (
             <a
                href={reportLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-border text-text font-bold py-3 px-4 rounded-ui hover:bg-border/70 transition-colors inline-flex items-center justify-center gap-2"
            >
                Report Issue
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5M15 3.75l6 6m0 0v-4.5m0 4.5h-4.5" />
                </svg>
            </a>
          )}
      </div>

      <details className="mt-6 text-left text-xs font-sans">
          <summary className="cursor-pointer text-sub hover:text-text transition-colors">
              Technical Details
          </summary>
          <div className="mt-2 p-3 bg-bg/50 rounded-lg border border-border">
              <pre className="whitespace-pre-wrap break-all text-sub/80">
                  <strong>Error:</strong> {error.name}: {error.message}
                  <br />
                  <strong>Stack:</strong>
                  {errorInfo ? errorInfo.componentStack.trim() : ' Not available.'}
              </pre>
          </div>
      </details>
    </div>
  );
};


// --- The Error Boundary Class Component ---
interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.hash = 'home';
  };
  
  private generateReportLink = (): string => {
    if (!this.state.error) return '';

    const repoUrl = REPO_URL;
    if (!repoUrl) return '';

    const issueTitle = `Bug Report: ${this.state.error.name}: ${this.state.error.message}`;
    const issueBody = `
**Describe the bug**
A clear and concise description of what the bug is. Please describe what you were doing when the error occurred.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Error Details**
\`\`\`
${this.state.error.name}: ${this.state.error.message}
\`\`\`

**Component Stack**
\`\`\`
${this.state.errorInfo ? this.state.errorInfo.componentStack.trim() : 'N/A'}
\`\`\`

**Environment**
- App Version: ${APP_VERSION}
- Browser: ${navigator.userAgent}
    `;
    
    return `${repoUrl}/issues/new?title=${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(issueBody)}`;
  }

  public render() {
    if (this.state.hasError && this.state.error) {
      const reportLink = this.generateReportLink();
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          reportLink={reportLink}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
